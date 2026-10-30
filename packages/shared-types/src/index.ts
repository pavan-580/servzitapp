export type SupportedLanguage = 'en' | 'te';

export type AccountType =
  | 'individual'
  | 'service_company'
  | 'retail_shop'
  | 'business_owner'
  | 'property_owner'
  | 'agent'
  | 'builder';

export type ProviderReviewStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'suspended';

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  requestId?: string;
}
