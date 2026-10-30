import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { UpdateAvailabilityDto, WeeklyAvailabilitySlotDto } from './dto/update-availability.dto';
import { SaveServiceOfferingDto } from './dto/save-service-offering.dto';

export interface ProviderProfileRow extends QueryResultRow {
  providerId: string; accountType: string; reviewStatus: string; businessId: string; businessName: string;
  description: string | null; isPublished: boolean; addressLines: string[]; localityId: string | null; serviceRadiusMeters: number | null;
}
export interface ProviderAvailabilitySlot { isoWeekday: number; opensAt: string; closesAt: string; timeZone: string }
export interface ProviderOfferingRow extends QueryResultRow {
  id: string; serviceId: string; serviceName: string; categoryName: string; pricingModel: 'fixed' | 'inspection' | 'quote';
  priceMinor: string | null; currency: string; isActive: boolean;
}

@Injectable()
export class ProvidersService {
  constructor(private readonly database: DatabaseService) {}

  async createOrGet(userId: string, dto: CreateProviderProfileDto): Promise<{ provider: ProviderProfileRow; nextSteps: string[] }> {
    const businessName = dto.businessName.trim();
    const addressLine = dto.addressLine.trim();
    if (businessName.length < 2 || !addressLine) throw new BadRequestException({ code: 'PROFILE_INVALID', message: 'Enter a business name and address.' });
    if (dto.localityId) {
      const locality = await this.database.query<{ id: string } & QueryResultRow>('SELECT id FROM localities WHERE id = $1', [dto.localityId]);
      if (!locality.rowCount) throw new BadRequestException({ code: 'LOCALITY_INVALID', message: 'Choose a listed locality.' });
    }
    const provider = await this.database.transaction(async (client) => {
      const owner = await client.query<{ id: string } & QueryResultRow>(
        "SELECT id FROM users WHERE id = $1 AND status = 'active' AND deleted_at IS NULL FOR UPDATE", [userId],
      );
      if (!owner.rowCount) throw new ForbiddenException({ code: 'ACCOUNT_UNAVAILABLE', message: 'This account cannot create a provider profile.' });
      const existing = await client.query<ProviderProfileRow>(this.profileQuery(), [userId]);
      if (existing.rows[0]) return existing.rows[0];

      const created = await client.query<{ id: string } & QueryResultRow>(
        `INSERT INTO providers (owner_user_id, account_type) VALUES ($1, $2) RETURNING id`, [userId, dto.accountType],
      );
      const providerId = created.rows[0].id;
      await client.query(
        `INSERT INTO businesses (provider_id, name, description, location, locality_id, address_lines, is_published)
         VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, ARRAY[$7]::text[], false)
         RETURNING id`,
        [providerId, businessName, dto.description?.trim() || null, dto.lng, dto.lat, dto.localityId ?? null, addressLine],
      );
      await client.query(
        `INSERT INTO provider_service_areas (provider_id, locality_id, service_radius_m, is_active)
         VALUES ($1, $2, $3, true)`, [providerId, dto.localityId ?? null, dto.serviceRadiusMeters],
      );
      await client.query(`INSERT INTO user_roles (user_id, role_id)
        SELECT $1, id FROM roles WHERE code = 'provider' ON CONFLICT DO NOTHING`, [userId]);
      const result = await client.query<ProviderProfileRow>(this.profileQuery('p.id'), [providerId]);
      if (!result.rows[0]) throw new InternalServerErrorException({ code: 'PROVIDER_PROFILE_UNAVAILABLE', message: 'The provider profile could not be loaded.' });
      return result.rows[0];
    });
    return {
      provider,
      nextSteps: provider.reviewStatus === 'approved'
        ? []
        : ['Complete identity verification when secure document upload is enabled.', 'Wait for administrator review; the storefront remains unpublished until approval.'],
    };
  }

  async getMine(userId: string): Promise<{ provider: ProviderProfileRow | null }> {
    const result = await this.database.query<ProviderProfileRow>(this.profileQuery(), [userId]);
    return { provider: result.rows[0] ?? null };
  }

  async getAvailability(userId: string): Promise<{ slots: ProviderAvailabilitySlot[] }> {
    const result = await this.database.query<ProviderAvailabilitySlot & QueryResultRow>(
      `SELECT a.iso_weekday AS "isoWeekday", to_char(a.opens_at, 'HH24:MI') AS "opensAt",
        to_char(a.closes_at, 'HH24:MI') AS "closesAt", a.time_zone AS "timeZone"
       FROM provider_availability a JOIN providers p ON p.id = a.provider_id
       WHERE p.owner_user_id = $1 AND p.deleted_at IS NULL ORDER BY a.iso_weekday, a.opens_at`, [userId],
    );
    return { slots: result.rows };
  }

  async getServices(userId: string): Promise<{ items: ProviderOfferingRow[] }> {
    const result = await this.database.query<ProviderOfferingRow>(
      `SELECT so.id, so.service_id AS "serviceId", s.name_en AS "serviceName", c.name_en AS "categoryName",
        so.pricing_model AS "pricingModel", so.price_minor AS "priceMinor", so.currency, so.is_active AS "isActive"
       FROM provider_service_offerings so JOIN providers p ON p.id = so.provider_id
       JOIN services s ON s.id = so.service_id JOIN service_categories c ON c.id = s.category_id
       WHERE p.owner_user_id = $1 AND p.deleted_at IS NULL AND so.business_id IN
         (SELECT id FROM businesses WHERE provider_id = p.id AND deleted_at IS NULL)
       ORDER BY s.name_en`, [userId],
    );
    return { items: result.rows };
  }

  async saveService(userId: string, dto: SaveServiceOfferingDto): Promise<{ item: ProviderOfferingRow }> {
    const hasPrice = dto.priceMinor !== undefined && dto.priceMinor !== null;
    if (dto.pricingModel === 'quote' ? hasPrice : !hasPrice) {
      throw new BadRequestException({ code: 'SERVICE_PRICE_INVALID', message: 'Quote-priced services must not include an amount; fixed and inspection services need an amount in minor currency units.' });
    }
    if (dto.currency != null && !/^[A-Z]{3}$/.test(dto.currency)) throw new BadRequestException({ code: 'CURRENCY_INVALID', message: 'Currency must be a three-letter uppercase code.' });
    const item = await this.database.transaction(async (client) => {
      const owner = await client.query<{ providerId: string; businessId: string } & QueryResultRow>(
        `SELECT p.id AS "providerId", b.id AS "businessId" FROM providers p
         JOIN businesses b ON b.provider_id = p.id AND b.deleted_at IS NULL
         WHERE p.owner_user_id = $1 AND p.deleted_at IS NULL ORDER BY b.created_at LIMIT 1 FOR UPDATE OF p`, [userId],
      );
      if (!owner.rows[0]) throw new NotFoundException({ code: 'PROVIDER_NOT_FOUND', message: 'Create a provider profile first.' });
      const service = await client.query<{ id: string } & QueryResultRow>('SELECT id FROM services WHERE id = $1 AND is_active', [dto.serviceId]);
      if (!service.rows[0]) throw new NotFoundException({ code: 'SERVICE_NOT_FOUND', message: 'Choose an active marketplace service.' });
      const saved = await client.query<{ id: string } & QueryResultRow>(
        `INSERT INTO provider_service_offerings (provider_id, business_id, service_id, pricing_model, price_minor, currency)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (provider_id, business_id, service_id) DO UPDATE SET pricing_model = EXCLUDED.pricing_model,
           price_minor = EXCLUDED.price_minor, currency = EXCLUDED.currency, is_active = true, updated_at = now()
         RETURNING id`, [owner.rows[0].providerId, owner.rows[0].businessId, dto.serviceId, dto.pricingModel, dto.priceMinor ?? null, dto.currency ?? 'INR'],
      );
      const result = await client.query<ProviderOfferingRow>(
        `SELECT so.id, so.service_id AS "serviceId", s.name_en AS "serviceName", c.name_en AS "categoryName",
          so.pricing_model AS "pricingModel", so.price_minor AS "priceMinor", so.currency, so.is_active AS "isActive"
         FROM provider_service_offerings so JOIN services s ON s.id = so.service_id
         JOIN service_categories c ON c.id = s.category_id WHERE so.id = $1`, [saved.rows[0].id],
      );
      return result.rows[0];
    });
    return { item };
  }

  async deactivateService(userId: string, offeringId: string) {
    const result = await this.database.query<{ id: string } & QueryResultRow>(
      `UPDATE provider_service_offerings so SET is_active = false, updated_at = now()
       FROM providers p WHERE so.provider_id = p.id AND p.owner_user_id = $1 AND p.deleted_at IS NULL
         AND so.id = $2 AND so.is_active RETURNING so.id`, [userId, offeringId],
    );
    if (!result.rows[0]) throw new NotFoundException({ code: 'SERVICE_OFFERING_NOT_FOUND', message: 'An active service offering was not found.' });
    return { id: offeringId, isActive: false as const };
  }

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto): Promise<{ slots: WeeklyAvailabilitySlotDto[] }> {
    const slots = dto.slots;
    for (const slot of slots) {
      if (slot.opensAt >= slot.closesAt) throw new BadRequestException({ code: 'AVAILABILITY_WINDOW_INVALID', message: 'Each closing time must be later than its opening time.' });
      try { new Intl.DateTimeFormat('en-US', { timeZone: slot.timeZone }).format(new Date()); }
      catch { throw new BadRequestException({ code: 'TIME_ZONE_INVALID', message: 'Choose a valid time zone.' }); }
    }
    const byDay = new Map<number, typeof slots>();
    for (const slot of slots) byDay.set(slot.isoWeekday, [...(byDay.get(slot.isoWeekday) ?? []), slot]);
    for (const daySlots of byDay.values()) {
      const ordered = [...daySlots].sort((a, b) => a.opensAt.localeCompare(b.opensAt));
      for (let i = 1; i < ordered.length; i++) {
        if (ordered[i].opensAt < ordered[i - 1].closesAt) throw new BadRequestException({ code: 'AVAILABILITY_OVERLAP', message: 'Working-hour windows cannot overlap.' });
      }
    }
    await this.database.transaction(async (client) => {
      const provider = await client.query<{ id: string } & QueryResultRow>(
        'SELECT id FROM providers WHERE owner_user_id = $1 AND deleted_at IS NULL FOR UPDATE', [userId],
      );
      if (!provider.rows[0]) throw new NotFoundException({ code: 'PROVIDER_NOT_FOUND', message: 'Create a provider profile first.' });
      await client.query('DELETE FROM provider_availability WHERE provider_id = $1', [provider.rows[0].id]);
      for (const slot of slots) {
        await client.query(`INSERT INTO provider_availability (provider_id, iso_weekday, opens_at, closes_at, time_zone)
          VALUES ($1, $2, $3::time, $4::time, $5)`, [provider.rows[0].id, slot.isoWeekday, slot.opensAt, slot.closesAt, slot.timeZone]);
      }
    });
    return { slots };
  }

  private profileQuery(providerIdExpression = 'p.owner_user_id') {
    const byProviderId = providerIdExpression === 'p.id';
    return `SELECT p.id AS "providerId", p.account_type AS "accountType", p.review_status AS "reviewStatus",
      b.id AS "businessId", b.name AS "businessName", b.description, b.is_published AS "isPublished",
      b.address_lines AS "addressLines", b.locality_id AS "localityId", area.service_radius_m AS "serviceRadiusMeters"
      FROM providers p JOIN businesses b ON b.provider_id = p.id AND b.deleted_at IS NULL
      LEFT JOIN LATERAL (SELECT service_radius_m FROM provider_service_areas WHERE provider_id = p.id AND is_active ORDER BY created_at LIMIT 1) area ON true
      WHERE ${byProviderId ? 'p.id = $1' : 'p.owner_user_id = $1'} AND p.deleted_at IS NULL
      ORDER BY b.created_at LIMIT 1`;
  }
}
