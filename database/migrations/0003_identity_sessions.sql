CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  refresh_token_hash bytea NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT session_expiry_after_creation CHECK (expires_at > created_at)
);
CREATE INDEX user_sessions_user_active_idx ON user_sessions(user_id, expires_at) WHERE revoked_at IS NULL;

CREATE INDEX user_addresses_default_user_idx ON user_addresses(user_id, is_default) WHERE deleted_at IS NULL;
