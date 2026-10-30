CREATE TYPE service_pricing_model AS ENUM ('fixed', 'inspection', 'quote');

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES service_categories(id),
  slug text NOT NULL UNIQUE,
  name_en text NOT NULL,
  name_te text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX services_category_idx ON services(category_id) WHERE is_active;

CREATE TABLE provider_service_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id),
  business_id uuid NOT NULL REFERENCES businesses(id),
  service_id uuid NOT NULL REFERENCES services(id),
  pricing_model service_pricing_model NOT NULL,
  price_minor bigint,
  currency char(3) NOT NULL DEFAULT 'INR',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT provider_offering_nonnegative_price CHECK (price_minor IS NULL OR price_minor >= 0),
  CONSTRAINT provider_offering_price_required CHECK ((pricing_model = 'quote' AND price_minor IS NULL) OR (pricing_model IN ('fixed', 'inspection') AND price_minor IS NOT NULL)),
  UNIQUE (provider_id, business_id, service_id)
);
CREATE INDEX provider_offerings_service_idx ON provider_service_offerings(service_id) WHERE is_active;
CREATE INDEX provider_offerings_provider_idx ON provider_service_offerings(provider_id) WHERE is_active;

CREATE TABLE provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id),
  iso_weekday smallint NOT NULL CHECK (iso_weekday BETWEEN 1 AND 7),
  opens_at time NOT NULL,
  closes_at time NOT NULL,
  time_zone text NOT NULL DEFAULT 'Asia/Kolkata',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availability_window_valid CHECK (closes_at > opens_at),
  UNIQUE (provider_id, iso_weekday, opens_at, closes_at)
);
CREATE INDEX provider_availability_provider_day_idx ON provider_availability(provider_id, iso_weekday);

CREATE TABLE provider_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id),
  document_type text NOT NULL,
  private_object_key text NOT NULL,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT provider_document_review_consistent CHECK ((review_status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL) OR (review_status <> 'pending' AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL))
);
CREATE INDEX provider_documents_provider_idx ON provider_documents(provider_id, review_status);

INSERT INTO service_categories (slug, name_en, name_te, sort_order) VALUES
  ('electrical', 'Electricians', 'విద్యుత్ పనివారు', 10),
  ('plumbing', 'Plumbers', 'ప్లంబర్లు', 20),
  ('carpentry', 'Carpenters', 'వడ్రంగులు', 30),
  ('painting', 'Painting', 'పెయింటింగ్', 40),
  ('ac-service', 'AC services', 'ఏసీ సేవలు', 50),
  ('appliance-repair', 'Appliance repair', 'గృహోపకరణాల మరమ్మత్తు', 60),
  ('cleaning', 'Cleaning', 'శుభ్రపరిచే సేవలు', 70),
  ('pest-control', 'Pest control', 'పురుగుల నియంత్రణ', 80),
  ('moving', 'Packers and movers', 'రవాణా సేవలు', 90),
  ('home-maintenance', 'Home maintenance', 'ఇంటి నిర్వహణ', 100)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, slug, name_en)
SELECT id, slug, name_en FROM service_categories WHERE slug IN (
  'electrical', 'plumbing', 'carpentry', 'painting', 'ac-service',
  'appliance-repair', 'cleaning', 'pest-control', 'moving', 'home-maintenance'
)
ON CONFLICT (slug) DO NOTHING;

