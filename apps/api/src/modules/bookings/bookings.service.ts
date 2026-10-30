import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { BookingDecisionDto } from './dto/booking-decision.dto';
import { BookingListQuery } from './dto/booking-list.query';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { QuotationResponseDto } from './dto/quotation-response.dto';
import { SendQuotationDto } from './dto/send-quotation.dto';

interface OfferingRow extends QueryResultRow {
  providerId: string; businessId: string; serviceName: string; pricingModel: 'fixed' | 'inspection' | 'quote'; priceMinor: string | null; currency: string;
  reviewStatus: string; isPublished: boolean;
}
export interface BookingRow extends QueryResultRow {
  id: string; status: string; scheduledStart: Date; scheduledEnd: Date; businessName: string; serviceName: string;
  totalMinor: string; currency: string; addressLines: string[]; customerNote: string | null; createdAt: Date;
}
export interface QuotationRow extends QueryResultRow {
  id: string; status: string; providerId: string; businessId: string; offeringId: string; businessName: string;
  serviceName: string; customerName: string | null; customerNote: string | null; providerNote: string | null;
  quoteAmountMinor: string | null; currency: string; addressLines: string[]; expiresAt: Date | null; createdAt: Date;
}

@Injectable()
export class BookingsService {
  constructor(private readonly database: DatabaseService) {}

  async requestQuotation(customerUserId: string, dto: CreateQuotationDto): Promise<{ quotation: QuotationRow }> {
    const quotation = await this.database.transaction(async (client) => {
      const customer = await client.query<{ id: string } & QueryResultRow>(
        "SELECT id FROM users WHERE id = $1 AND status = 'active' AND deleted_at IS NULL FOR UPDATE", [customerUserId],
      );
      if (!customer.rowCount) throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND', message: 'This account cannot request a quotation.' });
      if (dto.idempotencyKey) {
        const prior = await client.query<QuotationRow & { addressId: string | null }>(
          `${this.quotationSelect()} WHERE q.customer_user_id = $1 AND q.idempotency_key = $2`, [customerUserId, dto.idempotencyKey],
        );
        if (prior.rows[0]) {
          const same = prior.rows[0].offeringId === dto.offeringId && prior.rows[0].addressId === dto.addressId
            && prior.rows[0].customerNote === (dto.customerNote?.trim() || null);
          if (!same) throw new ConflictException({ code: 'IDEMPOTENCY_KEY_REUSED', message: 'This request key was already used for a different quotation.' });
          const { addressId: _addressId, ...existing } = prior.rows[0];
          return existing;
        }
      }
      const owner = await client.query<{ providerId: string } & QueryResultRow>(
        'SELECT provider_id AS "providerId" FROM provider_service_offerings WHERE id = $1 AND is_active', [dto.offeringId],
      );
      if (!owner.rows[0]) throw new NotFoundException({ code: 'SERVICE_NOT_FOUND', message: 'This service is no longer available.' });
      await client.query('SELECT id FROM providers WHERE id = $1 AND deleted_at IS NULL FOR UPDATE', [owner.rows[0].providerId]);
      const offering = await client.query<{ providerId: string; businessId: string; currency: string; pricingModel: string } & QueryResultRow>(
        `SELECT p.id AS "providerId", b.id AS "businessId", so.currency, so.pricing_model AS "pricingModel"
         FROM provider_service_offerings so JOIN providers p ON p.id = so.provider_id JOIN businesses b ON b.id = so.business_id
         JOIN services s ON s.id = so.service_id
         WHERE so.id = $1 AND so.is_active AND p.review_status = 'approved' AND p.deleted_at IS NULL
           AND b.is_published AND b.deleted_at IS NULL AND s.is_active`, [dto.offeringId],
      );
      const offer = offering.rows[0];
      if (!offer) throw new ConflictException({ code: 'PROVIDER_UNAVAILABLE', message: 'This provider or service is not currently available.' });
      if (offer.pricingModel !== 'quote') throw new ConflictException({ code: 'FIXED_PRICE_SERVICE', message: 'This service can be booked at its listed price.' });
      const created = await client.query<{ id: string } & QueryResultRow>(
        `INSERT INTO quotations (customer_user_id, provider_id, business_id, provider_service_offering_id, saved_address_id,
          address_snapshot, service_location, customer_note, currency, idempotency_key)
         SELECT $1, $2, $3, $4, a.id, a.address_lines, a.location, $5, $6, $7
         FROM user_addresses a WHERE a.id = $8 AND a.user_id = $1 AND a.deleted_at IS NULL RETURNING id`,
        [customerUserId, offer.providerId, offer.businessId, dto.offeringId, dto.customerNote?.trim() || null,
          offer.currency, dto.idempotencyKey ?? null, dto.addressId],
      );
      if (!created.rows[0]) throw new NotFoundException({ code: 'ADDRESS_NOT_FOUND', message: 'Choose one of your saved addresses.' });
      const id = created.rows[0].id;
      await client.query(`INSERT INTO quotation_status_history (quotation_id, from_status, to_status, changed_by_user_id)
        VALUES ($1, NULL, 'requested', $2)`, [id, customerUserId]);
      return this.getQuotation(client, id, customerUserId, 'customer_user_id');
    });
    return { quotation };
  }

  async customerQuotations(customerUserId: string, query: BookingListQuery) {
    const result = await this.database.query<QuotationRow>(
      `${this.quotationSelect()} WHERE q.customer_user_id = $1 ORDER BY q.created_at DESC LIMIT $2 OFFSET $3`,
      [customerUserId, query.limit, (query.page - 1) * query.limit],
    );
    return { items: result.rows, page: query.page, limit: query.limit };
  }

  async providerQuotations(providerUserId: string, query: BookingListQuery) {
    const result = await this.database.query<QuotationRow>(
      `${this.quotationSelect()} JOIN providers p ON p.id = q.provider_id WHERE p.owner_user_id = $1
       ORDER BY q.created_at DESC LIMIT $2 OFFSET $3`, [providerUserId, query.limit, (query.page - 1) * query.limit],
    );
    return { items: result.rows, page: query.page, limit: query.limit };
  }

  async sendQuotation(providerUserId: string, quotationId: string, dto: SendQuotationDto): Promise<{ quotation: QuotationRow }> {
    const quotation = await this.database.transaction(async (client) => {
      const owner = await client.query<{ providerId: string } & QueryResultRow>(
        `SELECT p.id AS "providerId" FROM providers p JOIN quotations q ON q.provider_id = p.id
         WHERE p.owner_user_id = $1 AND q.id = $2 AND p.deleted_at IS NULL`, [providerUserId, quotationId],
      );
      if (!owner.rows[0]) throw new NotFoundException({ code: 'QUOTATION_NOT_FOUND', message: 'Quotation request not found.' });
      await client.query('SELECT id FROM providers WHERE id = $1 FOR UPDATE', [owner.rows[0].providerId]);
      const current = await client.query<{ status: string } & QueryResultRow>(
        'SELECT status FROM quotations WHERE id = $1 AND provider_id = $2 FOR UPDATE', [quotationId, owner.rows[0].providerId],
      );
      if (!current.rows[0]) throw new NotFoundException({ code: 'QUOTATION_NOT_FOUND', message: 'Quotation request not found.' });
      if (current.rows[0].status !== 'requested') throw new ConflictException({ code: 'QUOTATION_ALREADY_REPLIED', message: 'This quotation request has already been answered.' });
      await client.query(`UPDATE quotations SET status = 'quoted', quote_amount_minor = $2, provider_note = $3,
        quoted_at = now(), expires_at = now() + make_interval(hours => $4), updated_at = now() WHERE id = $1`,
      [quotationId, dto.amountMinor, dto.note?.trim() || null, dto.expiresInHours]);
      await client.query(`INSERT INTO quotation_status_history (quotation_id, from_status, to_status, changed_by_user_id, note)
        VALUES ($1, 'requested', 'quoted', $2, $3)`, [quotationId, providerUserId, dto.note?.trim() || null]);
      return this.getQuotation(client, quotationId, owner.rows[0].providerId, 'provider_id');
    });
    return { quotation };
  }

  async respondToQuotation(customerUserId: string, quotationId: string, _dto: QuotationResponseDto) {
    const result = await this.database.transaction(async (client) => {
      const current = await client.query<{ status: string; expiresAt: Date | null } & QueryResultRow>(
        'SELECT status, expires_at AS "expiresAt" FROM quotations WHERE id = $1 AND customer_user_id = $2 FOR UPDATE', [quotationId, customerUserId],
      );
      const quotation = current.rows[0];
      if (!quotation) throw new NotFoundException({ code: 'QUOTATION_NOT_FOUND', message: 'Quotation not found.' });
      if (quotation.status !== 'quoted') throw new ConflictException({ code: 'QUOTATION_NOT_READY', message: 'This quotation cannot be rejected.' });
      if (quotation.expiresAt && new Date(quotation.expiresAt).getTime() <= Date.now()) {
        await client.query("UPDATE quotations SET status = 'expired', updated_at = now() WHERE id = $1", [quotationId]);
        await client.query(`INSERT INTO quotation_status_history (quotation_id, from_status, to_status, changed_by_user_id)
          VALUES ($1, 'quoted', 'expired', $2)`, [quotationId, customerUserId]);
        return { id: quotationId, expired: true };
      }
      await client.query("UPDATE quotations SET status = 'rejected', updated_at = now() WHERE id = $1", [quotationId]);
      await client.query(`INSERT INTO quotation_status_history (quotation_id, from_status, to_status, changed_by_user_id)
        VALUES ($1, 'quoted', 'rejected', $2)`, [quotationId, customerUserId]);
      return { id: quotationId, expired: false };
    });
    if (result.expired) throw new ConflictException({ code: 'QUOTATION_EXPIRED', message: 'This quotation has expired. Request another quote.' });
    return { id: result.id, status: 'rejected' as const };
  }

  async cancelQuotation(customerUserId: string, quotationId: string) {
    return this.database.transaction(async (client) => {
      const current = await client.query<{ status: string } & QueryResultRow>(
        'SELECT status FROM quotations WHERE id = $1 AND customer_user_id = $2 FOR UPDATE', [quotationId, customerUserId],
      );
      if (!current.rows[0]) throw new NotFoundException({ code: 'QUOTATION_NOT_FOUND', message: 'Quotation not found.' });
      if (!['requested', 'quoted'].includes(current.rows[0].status)) throw new ConflictException({ code: 'QUOTATION_CANNOT_CANCEL', message: 'This quotation can no longer be cancelled.' });
      await client.query("UPDATE quotations SET status = 'cancelled', updated_at = now() WHERE id = $1", [quotationId]);
      await client.query(`INSERT INTO quotation_status_history (quotation_id, from_status, to_status, changed_by_user_id)
        VALUES ($1, $2, 'cancelled', $3)`, [quotationId, current.rows[0].status, customerUserId]);
      return { id: quotationId, status: 'cancelled' as const };
    });
  }

  async create(customerUserId: string, dto: CreateBookingDto): Promise<{ booking: BookingRow }> {
    if ((dto.offeringId ? 1 : 0) + (dto.quotationId ? 1 : 0) !== 1) {
      throw new BadRequestException({ code: 'BOOKING_TARGET_INVALID', message: 'Choose either a listed service or a provider quotation.' });
    }
    const scheduledStart = new Date(dto.scheduledFor);
    const now = Date.now();
    if (!Number.isFinite(scheduledStart.getTime()) || scheduledStart.getTime() < now + 5 * 60_000 || scheduledStart.getTime() > now + 90 * 24 * 60 * 60_000) {
      throw new BadRequestException({ code: 'BOOKING_TIME_INVALID', message: 'Choose a time at least five minutes from now and within the next 90 days.' });
    }
    const scheduledEnd = new Date(scheduledStart.getTime() + dto.durationMinutes * 60_000);
    const booking = await this.database.transaction(async (client) => {
      const customer = await client.query<{ id: string } & QueryResultRow>(
        "SELECT id FROM users WHERE id = $1 AND status = 'active' AND deleted_at IS NULL FOR UPDATE", [customerUserId],
      );
      if (!customer.rowCount) throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND', message: 'This account cannot create a booking.' });
      const acceptedQuote = dto.quotationId ? await client.query<{ offeringId: string; providerId: string; amountMinor: string; businessId: string; addressId: string | null; status: string; expiresAt: Date | null } & QueryResultRow>(
        `SELECT provider_service_offering_id AS "offeringId", provider_id AS "providerId", quote_amount_minor AS "amountMinor",
          business_id AS "businessId", saved_address_id AS "addressId", status, expires_at AS "expiresAt"
         FROM quotations WHERE id = $1 AND customer_user_id = $2 FOR UPDATE`, [dto.quotationId, customerUserId],
      ) : null;
      if (dto.quotationId && !acceptedQuote?.rows[0]) throw new NotFoundException({ code: 'QUOTATION_NOT_FOUND', message: 'Quotation not found.' });
      const quote = acceptedQuote?.rows[0];
      if (quote?.status === 'accepted' && dto.idempotencyKey) {
        const priorQuoteBooking = await client.query<{ id: string } & QueryResultRow>(
          'SELECT id FROM bookings WHERE quotation_id = $1 AND customer_user_id = $2 AND idempotency_key = $3',
          [dto.quotationId, customerUserId, dto.idempotencyKey],
        );
        if (priorQuoteBooking.rows[0]) return this.getBooking(client, priorQuoteBooking.rows[0].id, customerUserId);
      }
      if (quote && (quote.status !== 'quoted' || !quote.expiresAt || new Date(quote.expiresAt).getTime() <= Date.now())) {
        throw new ConflictException({ code: 'QUOTATION_NOT_READY', message: 'This quotation is no longer available.' });
      }
      const offeringId = quote?.offeringId ?? dto.offeringId!;
      if (quote && quote.addressId !== dto.addressId) throw new ConflictException({ code: 'QUOTATION_ADDRESS_CHANGED', message: 'Book the quotation using the same service address, or request a new quotation.' });
      if (dto.idempotencyKey) {
        const prior = await client.query<BookingRow & { offeringId: string; addressId: string | null }>(
          `SELECT b.id, b.status, b.scheduled_start AS "scheduledStart", b.scheduled_end AS "scheduledEnd",
             b.total_minor AS "totalMinor", b.currency, b.address_snapshot AS "addressLines", b.customer_note AS "customerNote",
             b.created_at AS "createdAt", biz.name AS "businessName", s.name_en AS "serviceName",
             bi.provider_service_offering_id AS "offeringId", b.saved_address_id AS "addressId",
             EXTRACT(EPOCH FROM (b.scheduled_end - b.scheduled_start)) / 60 AS "durationMinutes"
           FROM bookings b JOIN businesses biz ON biz.id = b.business_id
           JOIN booking_items bi ON bi.booking_id = b.id
           JOIN provider_service_offerings so ON so.id = bi.provider_service_offering_id
           JOIN services s ON s.id = so.service_id
           WHERE b.customer_user_id = $1 AND b.idempotency_key = $2`, [customerUserId, dto.idempotencyKey],
        );
        if (prior.rows[0]) {
          const same = prior.rows[0].offeringId === offeringId && prior.rows[0].addressId === dto.addressId
            && new Date(prior.rows[0].scheduledStart).getTime() === scheduledStart.getTime()
            && Number(prior.rows[0].durationMinutes) === dto.durationMinutes
            && prior.rows[0].customerNote === (dto.customerNote?.trim() || null);
          if (!same) throw new ConflictException({ code: 'IDEMPOTENCY_KEY_REUSED', message: 'This booking request key was already used for another request.' });
          const { offeringId: _offeringId, addressId: _addressId, durationMinutes: _durationMinutes, ...existingBooking } = prior.rows[0];
          return existingBooking;
        }
      }

      const owner = await client.query<{ providerId: string } & QueryResultRow>(
        'SELECT provider_id AS "providerId" FROM provider_service_offerings WHERE id = $1 AND is_active', [offeringId],
      );
      if (!owner.rows[0]) throw new NotFoundException({ code: 'SERVICE_NOT_FOUND', message: 'This service is no longer available.' });
      await client.query('SELECT id FROM providers WHERE id = $1 AND deleted_at IS NULL FOR UPDATE', [owner.rows[0].providerId]);

      const offeringResult = await client.query<OfferingRow>(
        `SELECT p.id AS "providerId", b.id AS "businessId", s.name_en AS "serviceName", so.pricing_model AS "pricingModel",
          so.price_minor AS "priceMinor", so.currency, p.review_status AS "reviewStatus", b.is_published AS "isPublished"
         FROM provider_service_offerings so JOIN providers p ON p.id = so.provider_id
         JOIN businesses b ON b.id = so.business_id AND b.provider_id = p.id
         JOIN services s ON s.id = so.service_id
         WHERE so.id = $1 AND so.is_active AND p.deleted_at IS NULL AND p.review_status = 'approved'
           AND b.deleted_at IS NULL AND b.is_published AND s.is_active`, [offeringId],
      );
      const offering = offeringResult.rows[0];
      if (!offering) throw new ConflictException({ code: 'PROVIDER_UNAVAILABLE', message: 'This provider or service is not currently bookable.' });
      if (quote && (quote.providerId !== offering.providerId || quote.businessId !== offering.businessId)) throw new ConflictException({ code: 'QUOTATION_CHANGED', message: 'The provider listing changed. Request a new quotation.' });
      if (!quote && (offering.pricingModel === 'quote' || offering.priceMinor === null)) {
        throw new ConflictException({ code: 'QUOTE_REQUIRED', message: 'This service requires a quotation request.' });
      }

      const addressResult = await client.query<{ addressLines: string[]; localityId: string | null } & QueryResultRow>(
        `SELECT address_lines AS "addressLines", locality_id AS "localityId" FROM user_addresses
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`, [dto.addressId, customerUserId],
      );
      if (!addressResult.rows[0]) throw new NotFoundException({ code: 'ADDRESS_NOT_FOUND', message: 'Choose one of your saved addresses.' });

      const availability = await client.query<{ available: boolean } & QueryResultRow>(
        `SELECT EXISTS (
          SELECT 1 FROM provider_availability a
          WHERE a.provider_id = $1
            AND a.iso_weekday = EXTRACT(ISODOW FROM ($2::timestamptz AT TIME ZONE a.time_zone))::integer
            AND ($2::timestamptz AT TIME ZONE a.time_zone)::date = ($3::timestamptz AT TIME ZONE a.time_zone)::date
            AND ($2::timestamptz AT TIME ZONE a.time_zone)::time >= a.opens_at
            AND ($3::timestamptz AT TIME ZONE a.time_zone)::time <= a.closes_at
        ) AS available`, [offering.providerId, scheduledStart.toISOString(), scheduledEnd.toISOString()],
      );
      if (!availability.rows[0]?.available) throw new ConflictException({ code: 'OUTSIDE_PROVIDER_HOURS', message: 'The selected time is outside this provider’s configured working hours.' });

      const overlap = await client.query<{ busy: boolean } & QueryResultRow>(
        `SELECT EXISTS (SELECT 1 FROM bookings WHERE provider_id = $1 AND status IN ('requested', 'accepted', 'in_progress')
          AND scheduled_start < $3 AND scheduled_end > $2) AS busy`, [offering.providerId, scheduledStart.toISOString(), scheduledEnd.toISOString()],
      );
      if (overlap.rows[0]?.busy) throw new ConflictException({ code: 'TIME_SLOT_TAKEN', message: 'That time is already requested. Choose another time.' });

      const created = await client.query<{ id: string } & QueryResultRow>(
        `INSERT INTO bookings (customer_user_id, provider_id, business_id, saved_address_id, scheduled_start, scheduled_end,
          address_snapshot, service_location, customer_note, total_minor, currency, idempotency_key, quotation_id)
         SELECT $1, $2, $3, a.id, $4, $5, a.address_lines, a.location, $6, $7, $8, $9, $10
         FROM user_addresses a WHERE a.id = $11 AND a.user_id = $1 AND a.deleted_at IS NULL RETURNING id`,
        [customerUserId, offering.providerId, offering.businessId, scheduledStart.toISOString(), scheduledEnd.toISOString(), dto.customerNote?.trim() || null,
          quote?.amountMinor ?? offering.priceMinor, offering.currency, dto.idempotencyKey ?? null, dto.quotationId ?? null, dto.addressId],
      );
      if (!created.rows[0]) throw new NotFoundException({ code: 'ADDRESS_NOT_FOUND', message: 'Choose one of your saved addresses.' });
      const bookingId = created.rows[0].id;
      await client.query(
        `INSERT INTO booking_items (booking_id, provider_service_offering_id, service_name_snapshot, unit_amount_minor, quantity, currency)
         VALUES ($1, $2, $3, $4, 1, $5)`, [bookingId, offeringId, offering.serviceName, quote?.amountMinor ?? offering.priceMinor, offering.currency],
      );
      await client.query(
        `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by_user_id)
         VALUES ($1, NULL, 'requested', $2)`, [bookingId, customerUserId],
      );
      if (quote) {
        await client.query("UPDATE quotations SET status = 'accepted', updated_at = now() WHERE id = $1", [dto.quotationId]);
        await client.query(`INSERT INTO quotation_status_history (quotation_id, from_status, to_status, changed_by_user_id)
          VALUES ($1, 'quoted', 'accepted', $2)`, [dto.quotationId, customerUserId]);
      }
      return this.getBooking(client, bookingId, customerUserId);
    });
    return { booking };
  }

  async customerBookings(customerUserId: string, query: BookingListQuery) {
    const result = await this.database.query<BookingRow>(
      `${this.bookingSelect()} WHERE b.customer_user_id = $1 ORDER BY b.created_at DESC LIMIT $2 OFFSET $3`,
      [customerUserId, query.limit, (query.page - 1) * query.limit],
    );
    return { items: result.rows, page: query.page, limit: query.limit };
  }

  async providerBookings(providerUserId: string, query: BookingListQuery) {
    const result = await this.database.query<BookingRow>(
      `${this.bookingSelect()} JOIN providers p ON p.id = b.provider_id
       WHERE p.owner_user_id = $1 ORDER BY b.scheduled_start DESC LIMIT $2 OFFSET $3`,
      [providerUserId, query.limit, (query.page - 1) * query.limit],
    );
    return { items: result.rows, page: query.page, limit: query.limit };
  }

  async cancel(customerUserId: string, bookingId: string): Promise<{ id: string; status: 'cancelled' }> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ id: string; status: string } & QueryResultRow>(
        `SELECT id, status FROM bookings WHERE id = $1 AND customer_user_id = $2 FOR UPDATE`, [bookingId, customerUserId],
      );
      const booking = result.rows[0];
      if (!booking) throw new NotFoundException({ code: 'BOOKING_NOT_FOUND', message: 'Booking not found.' });
      if (!['requested', 'accepted'].includes(booking.status)) throw new ConflictException({ code: 'BOOKING_CANNOT_CANCEL', message: 'This booking can no longer be cancelled.' });
      const updated = await client.query<{ id: string } & QueryResultRow>(
        `UPDATE bookings SET status = 'cancelled', cancelled_at = now(), updated_at = now()
         WHERE id = $1 AND scheduled_start > now() RETURNING id`, [bookingId],
      );
      if (!updated.rows[0]) throw new ConflictException({ code: 'BOOKING_ALREADY_STARTED', message: 'A booking cannot be cancelled after its scheduled start.' });
      await client.query(`INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by_user_id)
        VALUES ($1, $2, 'cancelled', $3)`, [bookingId, booking.status, customerUserId]);
      return { id: bookingId, status: 'cancelled' as const };
    });
  }

  async decide(providerUserId: string, bookingId: string, dto: BookingDecisionDto) {
    return this.database.transaction(async (client) => {
      const owner = await client.query<{ providerId: string } & QueryResultRow>(
        `SELECT p.id AS "providerId" FROM providers p JOIN bookings b ON b.provider_id = p.id
         WHERE p.owner_user_id = $1 AND b.id = $2 AND p.deleted_at IS NULL`, [providerUserId, bookingId],
      );
      if (!owner.rows[0]) throw new NotFoundException({ code: 'BOOKING_NOT_FOUND', message: 'Booking not found.' });
      await client.query('SELECT id FROM providers WHERE id = $1 FOR UPDATE', [owner.rows[0].providerId]);
      const current = await client.query<{ status: string } & QueryResultRow>('SELECT status FROM bookings WHERE id = $1 FOR UPDATE', [bookingId]);
      if (!current.rows[0]) throw new NotFoundException({ code: 'BOOKING_NOT_FOUND', message: 'Booking not found.' });
      if (current.rows[0].status !== 'requested') throw new ConflictException({ code: 'BOOKING_ALREADY_DECIDED', message: 'Only a newly requested booking can be accepted or rejected.' });
      const status = dto.decision === 'accept' ? 'accepted' : 'rejected';
      await client.query('UPDATE bookings SET status = $2, updated_at = now() WHERE id = $1', [bookingId, status]);
      await client.query(`INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by_user_id, note)
        VALUES ($1, 'requested', $2, $3, $4)`, [bookingId, status, providerUserId, dto.note?.trim() || null]);
      return { id: bookingId, status };
    });
  }

  private async getQuotation(client: import('pg').PoolClient, quotationId: string, ownerId: string, ownerColumn: 'customer_user_id' | 'provider_id'): Promise<QuotationRow> {
    const result = await client.query<QuotationRow>(
      `${this.quotationSelect()} WHERE q.id = $1 AND q.${ownerColumn} = $2`, [quotationId, ownerId],
    );
    if (!result.rows[0]) throw new NotFoundException({ code: 'QUOTATION_NOT_FOUND', message: 'Quotation could not be loaded.' });
    return result.rows[0];
  }

  private quotationSelect() {
    return `SELECT q.id, q.status, q.provider_id AS "providerId", q.business_id AS "businessId",
      q.provider_service_offering_id AS "offeringId", biz.name AS "businessName", s.name_en AS "serviceName",
      u.display_name AS "customerName", q.customer_note AS "customerNote", q.provider_note AS "providerNote",
      q.quote_amount_minor AS "quoteAmountMinor", q.currency, q.address_snapshot AS "addressLines",
      q.saved_address_id AS "addressId", q.expires_at AS "expiresAt", q.created_at AS "createdAt"
      FROM quotations q JOIN businesses biz ON biz.id = q.business_id
      JOIN provider_service_offerings so ON so.id = q.provider_service_offering_id
      JOIN services s ON s.id = so.service_id JOIN users u ON u.id = q.customer_user_id`;
  }

  private async getBooking(client: import('pg').PoolClient, bookingId: string, customerUserId: string): Promise<BookingRow> {
    const result = await client.query<BookingRow>(`${this.bookingSelect()} WHERE b.id = $1 AND b.customer_user_id = $2`, [bookingId, customerUserId]);
    if (!result.rows[0]) throw new NotFoundException({ code: 'BOOKING_NOT_FOUND', message: 'Booking could not be loaded.' });
    return result.rows[0];
  }

  private bookingSelect() {
    return `SELECT b.id, b.status, b.scheduled_start AS "scheduledStart", b.scheduled_end AS "scheduledEnd",
      b.total_minor AS "totalMinor", b.currency, b.address_snapshot AS "addressLines", b.customer_note AS "customerNote",
      b.created_at AS "createdAt", biz.name AS "businessName", COALESCE(bi.service_name_snapshot, s.name_en) AS "serviceName"
      FROM bookings b JOIN businesses biz ON biz.id = b.business_id
      JOIN booking_items bi ON bi.booking_id = b.id
      LEFT JOIN services s ON s.id = (SELECT service_id FROM provider_service_offerings WHERE id = bi.provider_service_offering_id)`;
  }
}
