-- Account-bound AI generation requests for the isolated commercial preview.
-- One stable client request ID prevents duplicate paid provider submissions.
ALTER TABLE generations ADD COLUMN client_request_id TEXT;
ALTER TABLE generations ADD COLUMN request_fingerprint TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_generations_owner_request
  ON generations(user_id, client_request_id)
  WHERE client_request_id IS NOT NULL;

-- Preview-only starter allowance. The trigger is the race-safe enforcement;
-- the API also checks first to return a friendly remaining-usage message.
CREATE TRIGGER IF NOT EXISTS trg_generations_preview_daily_limit
BEFORE INSERT ON generations
BEGIN
  SELECT CASE
    WHEN (
      SELECT COUNT(*) FROM generations
      WHERE user_id = NEW.user_id
        AND created_at >= CAST(strftime('%s','now','start of day') AS INTEGER)
    ) >= 3
    THEN RAISE(ABORT, 'generation_daily_limit')
  END;
END;
