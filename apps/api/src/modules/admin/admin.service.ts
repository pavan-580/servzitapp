import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { ReviewProviderDto } from './dto/review-provider.dto';

export interface ReviewQueueRow extends QueryResultRow {
  providerId: string; ownerUserId: string; phoneE164: string; accountType: string; reviewStatus: string;
  businessId: string; businessName: string; addressLines: string[]; isPublished: boolean; createdAt: Date;
}

@Injectable()
export class AdminService {
  constructor(private readonly database: DatabaseService) {}

  async providerReviewQueue() {
    const result = await this.database.query<ReviewQueueRow>(
      `SELECT p.id AS "providerId", p.owner_user_id AS "ownerUserId", u.phone_e164 AS "phoneE164",
        p.account_type AS "accountType", p.review_status AS "reviewStatus", b.id AS "businessId",
        b.name AS "businessName", b.address_lines AS "addressLines", b.is_published AS "isPublished", p.created_at AS "createdAt",
        COALESCE((SELECT jsonb_agg(jsonb_build_object('type', d.document_type, 'status', d.review_status)
          ORDER BY d.created_at) FROM provider_documents d WHERE d.provider_id = p.id), '[]'::jsonb) AS documents
       FROM providers p JOIN users u ON u.id = p.owner_user_id
       JOIN LATERAL (SELECT * FROM businesses WHERE provider_id = p.id AND deleted_at IS NULL ORDER BY created_at LIMIT 1) b ON true
       WHERE p.review_status IN ('pending', 'in_review', 'rejected') AND p.deleted_at IS NULL
       ORDER BY p.created_at ASC LIMIT 100`,
    );
    return { items: result.rows };
  }

  async reviewProvider(adminUserId: string, providerId: string, dto: ReviewProviderDto) {
    return this.database.transaction(async (client) => {
      const current = await client.query<{ id: string; reviewStatus: string } & QueryResultRow>(
        'SELECT id, review_status AS "reviewStatus" FROM providers WHERE id = $1 AND deleted_at IS NULL FOR UPDATE', [providerId],
      );
      if (!current.rows[0]) throw new NotFoundException({ code: 'PROVIDER_NOT_FOUND', message: 'Provider profile not found.' });
      if (current.rows[0].reviewStatus === 'suspended') throw new ConflictException({ code: 'PROVIDER_SUSPENDED', message: 'A suspended provider cannot be approved through onboarding review.' });
      if (dto.decision === 'approve') {
        const documents = await client.query<{ identityApproved: boolean; businessApproved: boolean } & QueryResultRow>(
          `SELECT EXISTS (SELECT 1 FROM provider_documents WHERE provider_id = $1 AND document_type = 'identity' AND review_status = 'approved') AS "identityApproved",
             EXISTS (SELECT 1 FROM provider_documents WHERE provider_id = $1 AND document_type = 'business' AND review_status = 'approved') AS "businessApproved"`, [providerId],
        );
        if (!documents.rows[0]?.identityApproved || !documents.rows[0]?.businessApproved) {
          throw new ConflictException({ code: 'PROVIDER_DOCUMENTS_INCOMPLETE', message: 'Approve identity and business documents before approving this provider.' });
        }
      }
      const next = dto.decision === 'approve' ? 'approved' : dto.decision === 'reject' ? 'rejected' : 'in_review';
      await client.query(`UPDATE providers SET review_status = $2,
        approved_at = CASE WHEN $2 = 'approved' THEN now() ELSE NULL END,
        approved_by = CASE WHEN $2 = 'approved' THEN $3 ELSE NULL END, updated_at = now() WHERE id = $1`, [providerId, next, adminUserId]);
      const business = await client.query<{ id: string } & QueryResultRow>(
        `UPDATE businesses SET is_published = ($2 = 'approved'), updated_at = now()
         WHERE provider_id = $1 AND deleted_at IS NULL RETURNING id`, [providerId, next],
      );
      await client.query(`INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, before_state, after_state, note)
        VALUES ($1, $2, 'provider', $3, jsonb_build_object('reviewStatus', $4), jsonb_build_object('reviewStatus', $5, 'isPublished', $6), $7)`,
      [adminUserId, `provider.review.${dto.decision}`, providerId, current.rows[0].reviewStatus, next, next === 'approved' && business.rows.length > 0, dto.note?.trim() || null]);
      return { providerId, reviewStatus: next, isPublished: next === 'approved' && business.rows.length > 0 };
    });
  }
}
