CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE account_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE provider_review_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'suspended');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 text UNIQUE,
  email text UNIQUE,
  display_name text,
  preferred_language text NOT NULL DEFAULT 'en',
  status account_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT users_phone_or_email_required CHECK (phone_e164 IS NOT NULL OR email IS NOT NULL)
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES users(id),
  role_id uuid NOT NULL REFERENCES roles(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state_code text NOT NULL,
  country_code char(2) NOT NULL DEFAULT 'IN',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, state_code, country_code)
);

CREATE TABLE cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES districts(id),
  name text NOT NULL,
  center geography(Point, 4326),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (district_id, name)
);
CREATE INDEX cities_center_gix ON cities USING gist(center);

CREATE TABLE localities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id),
  name text NOT NULL,
  boundary geography(MultiPolygon, 4326),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city_id, name)
);
CREATE INDEX localities_boundary_gix ON localities USING gist(boundary);

CREATE TABLE postal_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  city_id uuid NOT NULL REFERENCES cities(id),
  locality_id uuid REFERENCES localities(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, city_id, locality_id)
);
CREATE INDEX postal_codes_code_idx ON postal_codes(code);

CREATE TABLE user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  label text NOT NULL DEFAULT 'Home',
  address_lines text[] NOT NULL,
  locality_id uuid REFERENCES localities(id),
  postal_code_id uuid REFERENCES postal_codes(id),
  location geography(Point, 4326) NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX user_addresses_location_gix ON user_addresses USING gist(location);
CREATE INDEX user_addresses_user_idx ON user_addresses(user_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX user_addresses_one_default_idx ON user_addresses(user_id) WHERE is_default AND deleted_at IS NULL;

CREATE TABLE service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES service_categories(id),
  slug text NOT NULL UNIQUE,
  name_en text NOT NULL,
  name_te text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL UNIQUE REFERENCES users(id),
  account_type text NOT NULL CHECK (account_type IN ('individual', 'service_company', 'retail_shop', 'business_owner', 'property_owner', 'agent', 'builder')),
  review_status provider_review_status NOT NULL DEFAULT 'pending',
  approved_at timestamptz,
  approved_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT providers_approval_fields_consistent CHECK ((review_status = 'approved') = (approved_at IS NOT NULL AND approved_by IS NOT NULL))
);
CREATE INDEX providers_status_idx ON providers(review_status) WHERE deleted_at IS NULL;

CREATE TABLE businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id),
  name text NOT NULL,
  description text,
  location geography(Point, 4326),
  locality_id uuid REFERENCES localities(id),
  address_lines text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX businesses_location_gix ON businesses USING gist(location);
CREATE INDEX businesses_provider_idx ON businesses(provider_id) WHERE deleted_at IS NULL;

CREATE TABLE provider_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id),
  locality_id uuid REFERENCES localities(id),
  coverage geography(MultiPolygon, 4326),
  service_radius_m integer CHECK (service_radius_m IS NULL OR service_radius_m > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT provider_area_shape_required CHECK (locality_id IS NOT NULL OR coverage IS NOT NULL OR service_radius_m IS NOT NULL)
);
CREATE INDEX provider_service_areas_coverage_gix ON provider_service_areas USING gist(coverage);
CREATE INDEX provider_service_areas_provider_idx ON provider_service_areas(provider_id) WHERE is_active;

INSERT INTO roles (code, description) VALUES
  ('customer', 'Marketplace customer'),
  ('provider', 'Service or business provider'),
  ('admin', 'Administrative operator');

