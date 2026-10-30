import { BadRequestException, Injectable } from '@nestjs/common';
import { PoolClient, QueryResultRow } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { CreateAddressDto } from './dto/create-address.dto';

export interface AddressRow extends QueryResultRow {
  id: string; label: string; addressLines: string[]; localityId: string | null; localityName: string | null;
  postalCode: string | null; lat: number; lng: number; isDefault: boolean;
}
export interface CityItem { id: string; name: string; district: string | null; stateCode: string | null; countryCode: string }
export interface LocalityItem { id: string; name: string }

@Injectable()
export class LocationsService {
  constructor(private readonly database: DatabaseService) {}

  async cities(): Promise<{ items: CityItem[] }> {
    const result = await this.database.query<CityItem & QueryResultRow>(
      `SELECT c.id, c.name, d.name AS district, d.state_code AS "stateCode", d.country_code AS "countryCode"
       FROM cities c LEFT JOIN districts d ON d.id = c.district_id ORDER BY d.state_code, c.name LIMIT 500`,
    );
    return { items: result.rows };
  }

  async localities(cityId: string): Promise<{ items: LocalityItem[] }> {
    const result = await this.database.query<LocalityItem & QueryResultRow>(
      `SELECT id, name FROM localities WHERE city_id = $1 ORDER BY name LIMIT 500`, [cityId],
    );
    return { items: result.rows };
  }

  async addresses(userId: string): Promise<{ items: AddressRow[] }> {
    const result = await this.database.query<AddressRow>(`${this.addressSelect()} ORDER BY a.is_default DESC, a.created_at DESC`, [userId]);
    return { items: result.rows };
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<AddressRow | null> {
    const lines = dto.addressLines.map((line) => line.trim()).filter(Boolean);
    const label = dto.label.trim();
    if (!lines.length || !label) throw new BadRequestException({ code: 'ADDRESS_INVALID', message: 'Enter an address and label.' });
    if (dto.localityId) {
      const locality = await this.database.query<{ id: string } & QueryResultRow>('SELECT id FROM localities WHERE id = $1', [dto.localityId]);
      if (!locality.rowCount) throw new BadRequestException({ code: 'LOCALITY_INVALID', message: 'Choose a listed locality.' });
    }
    if (dto.postalCodeId) {
      const postal = await this.database.query<{ id: string; localityId: string | null } & QueryResultRow>(
        'SELECT id, locality_id AS "localityId" FROM postal_codes WHERE id = $1', [dto.postalCodeId],
      );
      if (!postal.rowCount || (dto.localityId && postal.rows[0].localityId !== dto.localityId)) {
        throw new BadRequestException({ code: 'POSTAL_CODE_INVALID', message: 'The postal code does not match the selected locality.' });
      }
    }
    return this.database.transaction(async (client) => {
      await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [userId]);
      const currentDefault = await client.query<{ exists: boolean }>(
        'SELECT EXISTS (SELECT 1 FROM user_addresses WHERE user_id = $1 AND deleted_at IS NULL AND is_default) AS exists', [userId],
      );
      const isDefault = dto.isDefault || !currentDefault.rows[0]?.exists;
      if (isDefault) await client.query('UPDATE user_addresses SET is_default = false, updated_at = now() WHERE user_id = $1 AND deleted_at IS NULL AND is_default', [userId]);
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO user_addresses (user_id, label, address_lines, locality_id, postal_code_id, location, is_default)
         VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography, $8) RETURNING id`,
        [userId, label, lines, dto.localityId ?? null, dto.postalCodeId ?? null, dto.lng, dto.lat, isDefault],
      );
      return this.getAddress(client, userId, inserted.rows[0].id);
    });
  }

  async deleteAddress(userId: string, addressId: string): Promise<{ deleted: boolean }> {
    const deleted = await this.database.transaction(async (client) => {
      await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [userId]);
      const result = await client.query<{ isDefault: boolean }>(
        `UPDATE user_addresses SET deleted_at = now(), updated_at = now()
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING is_default AS "isDefault"`, [addressId, userId],
      );
      if (result.rows[0]?.isDefault) {
        await client.query(`UPDATE user_addresses SET is_default = true, updated_at = now()
          WHERE id = (SELECT id FROM user_addresses WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1)`, [userId]);
      }
      return result.rowCount === 1;
    });
    return { deleted };
  }

  private async getAddress(client: PoolClient, userId: string, addressId: string): Promise<AddressRow | null> {
    const result = await client.query<AddressRow>(`${this.addressSelect()} AND a.id = $2`, [userId, addressId]);
    return result.rows[0] ?? null;
  }

  private addressSelect() {
    return `SELECT a.id, a.label, a.address_lines AS "addressLines", a.locality_id AS "localityId", l.name AS "localityName",
      pc.code AS "postalCode", ST_Y(a.location::geometry) AS lat, ST_X(a.location::geometry) AS lng, a.is_default AS "isDefault"
      FROM user_addresses a LEFT JOIN localities l ON l.id = a.locality_id
      LEFT JOIN postal_codes pc ON pc.id = a.postal_code_id
      WHERE a.user_id = $1 AND a.deleted_at IS NULL`;
  }
}
