CREATE TYPE booking_status AS ENUM (
  'requested', 'accepted', 'rejected', 'cancelled', 'in_progress', 'completed', 'disputed'
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_user_id uuid NOT NULL REFERENCES users(id),
  provider_id uuid NOT NULL REFERENCES providers(id),
  business_id uuid NOT NULL REFERENCES businesses(id),
  saved_address_id uuid REFERENCES user_addresses(id) ON DELETE SET NULL,
  status booking_status NOT NULL DEFAULT 'requested',
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  address_snapshot text[] NOT NULL,
  service_location geography(Point, 4326) NOT NULL,
  customer_note text,
  total_minor bigint NOT NULL CHECK (total_minor >= 0),
  currency char(3) NOT NULL DEFAULT 'INR',
  idempotency_key uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  CONSTRAINT booking_time_window_valid CHECK (scheduled_end > scheduled_start),
  CONSTRAINT booking_cancel_timestamp_consistent CHECK ((status = 'cancelled') = (cancelled_at IS NOT NULL))
);
CREATE UNIQUE INDEX bookings_customer_idempotency_idx ON bookings(customer_user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX bookings_customer_created_idx ON bookings(customer_user_id, created_at DESC);
CREATE INDEX bookings_provider_schedule_idx ON bookings(provider_id, scheduled_start, scheduled_end) WHERE status IN ('requested', 'accepted', 'in_progress');
CREATE INDEX bookings_business_created_idx ON bookings(business_id, created_at DESC);
CREATE INDEX bookings_location_gix ON bookings USING gist(service_location);

CREATE TABLE booking_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider_service_offering_id uuid NOT NULL REFERENCES provider_service_offerings(id),
  service_name_snapshot text NOT NULL,
  unit_amount_minor bigint NOT NULL CHECK (unit_amount_minor >= 0),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  currency char(3) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX booking_items_booking_idx ON booking_items(booking_id);

CREATE TABLE booking_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  from_status booking_status,
  to_status booking_status NOT NULL,
  changed_by_user_id uuid NOT NULL REFERENCES users(id),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX booking_status_history_booking_idx ON booking_status_history(booking_id, created_at);

CREATE TYPE quotation_status AS ENUM ('requested', 'quoted', 'accepted', 'rejected', 'cancelled', 'expired');

CREATE TABLE quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_user_id uuid NOT NULL REFERENCES users(id),
  provider_id uuid NOT NULL REFERENCES providers(id),
  business_id uuid NOT NULL REFERENCES businesses(id),
  provider_service_offering_id uuid NOT NULL REFERENCES provider_service_offerings(id),
  saved_address_id uuid REFERENCES user_addresses(id) ON DELETE SET NULL,
  status quotation_status NOT NULL DEFAULT 'requested',
  address_snapshot text[] NOT NULL,
  service_location geography(Point, 4326) NOT NULL,
  customer_note text,
  quote_amount_minor bigint CHECK (quote_amount_minor IS NULL OR quote_amount_minor >= 0),
  currency char(3) NOT NULL DEFAULT 'INR',
  provider_note text,
  quoted_at timestamptz,
  expires_at timestamptz,
  idempotency_key uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quotation_response_fields_consistent CHECK (
    (quote_amount_minor IS NULL AND quoted_at IS NULL AND expires_at IS NULL)
    OR (quote_amount_minor IS NOT NULL AND quoted_at IS NOT NULL AND expires_at IS NOT NULL)
  ),
  CONSTRAINT requested_quotation_has_no_response CHECK (status <> 'requested' OR quote_amount_minor IS NULL)
);
CREATE UNIQUE INDEX quotations_customer_idempotency_idx ON quotations(customer_user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX quotations_customer_created_idx ON quotations(customer_user_id, created_at DESC);
CREATE INDEX quotations_provider_status_idx ON quotations(provider_id, status, created_at DESC);
CREATE INDEX quotations_business_created_idx ON quotations(business_id, created_at DESC);
CREATE INDEX quotations_location_gix ON quotations USING gist(service_location);

CREATE TABLE quotation_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  from_status quotation_status,
  to_status quotation_status NOT NULL,
  changed_by_user_id uuid NOT NULL REFERENCES users(id),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX quotation_status_history_quotation_idx ON quotation_status_history(quotation_id, created_at);

ALTER TABLE bookings ADD COLUMN quotation_id uuid REFERENCES quotations(id);
CREATE UNIQUE INDEX bookings_quotation_unique_idx ON bookings(quotation_id) WHERE quotation_id IS NOT NULL;
