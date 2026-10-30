import { Injectable } from '@nestjs/common';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { NearbyProvidersQuery } from './dto/nearby-providers.query';
import { SearchServicesQuery } from './dto/search-services.query';

export interface ServiceCategoryRow extends QueryResultRow {
  id: string;
  parentId: string | null;
  slug: string;
  nameEn: string;
  nameTe: string | null;
}

export interface MarketplaceServiceRow extends QueryResultRow {
  id: string; categoryId: string; categorySlug: string; categoryName: string; slug: string; nameEn: string; nameTe: string | null; description: string | null;
}

export interface NearbyProviderRow extends QueryResultRow {
  providerId: string;
  businessId: string;
  businessName: string;
  businessDescription: string | null;
  offeringId: string;
  serviceId: string;
  serviceNameEn: string;
  serviceNameTe: string | null;
  pricingModel: 'fixed' | 'inspection' | 'quote';
  priceMinor: string | null;
  currency: string;
  availabilityStatus: 'available_now' | 'outside_scheduled_hours' | 'not_configured';
  distanceMeters: number;
}

@Injectable()
export class CatalogService {
  constructor(private readonly database: DatabaseService) {}

  async getServiceCategories(search?: string): Promise<{ items: ServiceCategoryRow[] }> {
    const result = await this.database.query<ServiceCategoryRow>(
      `SELECT id, parent_id AS "parentId", slug, name_en AS "nameEn", name_te AS "nameTe"
       FROM service_categories
       WHERE is_active = true AND ($1::text IS NULL OR strpos(lower(name_en), lower($1)) > 0 OR strpos(lower(COALESCE(name_te, '')), lower($1)) > 0)
       ORDER BY sort_order, name_en`,
      [search?.trim() || null],
    );
    return { items: result.rows };
  }

  async getServices(query: SearchServicesQuery): Promise<{ items: MarketplaceServiceRow[] }> {
    const result = await this.database.query<MarketplaceServiceRow>(
      `SELECT s.id, s.category_id AS "categoryId", c.slug AS "categorySlug", c.name_en AS "categoryName", s.slug,
        s.name_en AS "nameEn", s.name_te AS "nameTe", s.description
       FROM services s JOIN service_categories c ON c.id = s.category_id
       WHERE s.is_active AND c.is_active AND ($1::uuid IS NULL OR s.category_id = $1)
         AND ($2::text IS NULL OR strpos(lower(s.name_en), lower($2)) > 0 OR strpos(lower(COALESCE(s.name_te, '')), lower($2)) > 0)
       ORDER BY c.sort_order, s.name_en LIMIT 100`, [query.categoryId ?? null, query.q?.trim() || null],
    );
    return { items: result.rows };
  }

  async getNearbyProviders(query: NearbyProvidersQuery): Promise<{
    items: NearbyProviderRow[];
    page: number;
    limit: number;
    hasMore: boolean;
    radiusMeters: number;
    source: 'verified-provider-locations';
  }> {
    const { lat, lng, radiusMeters, categoryId, q, page, limit } = query;
    const offset = (page - 1) * limit;
    const result = await this.database.query<NearbyProviderRow>(
      `WITH target AS (
         SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS point
       ), matched AS (
         SELECT
           p.id AS "providerId",
           b.id AS "businessId",
           b.name AS "businessName",
           b.description AS "businessDescription",
           so.id AS "offeringId",
           s.id AS "serviceId",
           s.name_en AS "serviceNameEn",
           s.name_te AS "serviceNameTe",
           so.pricing_model AS "pricingModel",
           so.price_minor AS "priceMinor",
           so.currency,
           CASE
             WHEN NOT EXISTS (SELECT 1 FROM provider_availability a WHERE a.provider_id = p.id) THEN 'not_configured'
             WHEN EXISTS (
               SELECT 1 FROM provider_availability a
               WHERE a.provider_id = p.id
                 AND a.iso_weekday = EXTRACT(ISODOW FROM (now() AT TIME ZONE a.time_zone))::integer
                 AND (now() AT TIME ZONE a.time_zone)::time >= a.opens_at
                 AND (now() AT TIME ZONE a.time_zone)::time < a.closes_at
             ) THEN 'available_now'
             ELSE 'outside_scheduled_hours'
           END AS "availabilityStatus",
           ST_Distance(b.location, target.point)::integer AS "distanceMeters"
         FROM target
         JOIN businesses b ON b.location IS NOT NULL AND b.deleted_at IS NULL AND b.is_published = true
         JOIN providers p ON p.id = b.provider_id AND p.deleted_at IS NULL AND p.review_status = 'approved'
         JOIN provider_service_offerings so ON so.provider_id = p.id AND so.business_id = b.id AND so.is_active = true
         JOIN services s ON s.id = so.service_id AND s.is_active = true
         WHERE ST_DWithin(b.location, target.point, $3)
           AND ($4::uuid IS NULL OR s.category_id = $4::uuid)
           AND ($5::text IS NULL OR strpos(lower(s.name_en), lower($5)) > 0 OR strpos(lower(COALESCE(s.name_te, '')), lower($5)) > 0 OR strpos(lower(b.name), lower($5)) > 0)
           AND EXISTS (
             SELECT 1 FROM provider_service_areas a
             WHERE a.provider_id = p.id AND a.is_active = true
               AND (a.locality_id IS NOT NULL AND a.locality_id = b.locality_id
                 OR a.coverage IS NOT NULL AND ST_Covers(a.coverage::geometry, target.point::geometry)
                 OR a.service_radius_m IS NOT NULL AND ST_DWithin(b.location, target.point, a.service_radius_m))
           )
       )
       SELECT * FROM matched ORDER BY "distanceMeters", "businessId", "offeringId"
       LIMIT $6 OFFSET $7`,
      [lng, lat, radiusMeters, categoryId ?? null, q?.trim() || null, limit, offset],
    );
    const hasMore = result.rows.length > limit;
    return {
      items: result.rows.slice(0, limit),
      page,
      limit,
      hasMore,
      radiusMeters,
      source: 'verified-provider-locations',
    };
  }
}
