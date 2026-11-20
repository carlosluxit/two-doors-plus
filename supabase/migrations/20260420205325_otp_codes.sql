-- OTP verification codes for quote flow
CREATE TABLE public.otp_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,          -- email (for now) or phone
  code_hash text NOT NULL,           -- sha256 hex of the 6-digit code
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_codes_identifier ON public.otp_codes (identifier, created_at DESC);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
-- No public policies; only the service role (via edge functions) touches this table.
