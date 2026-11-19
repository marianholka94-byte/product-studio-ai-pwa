-- Reconcile the legacy credit_ledger created by 0001 with the account-scoped
-- append-only ledger contract introduced in 0008. D1's CREATE TABLE IF NOT
-- EXISTS does not replace an existing table, so preserve and normalize rows.
DROP TRIGGER IF EXISTS trg_credit_ledger_no_update;
DROP TRIGGER IF EXISTS trg_credit_ledger_no_delete;
DROP INDEX IF EXISTS idx_credit_ledger_user_created;
DROP INDEX IF EXISTS idx_credit_ledger_generation;
DROP INDEX IF EXISTS idx_credit_ledger_owner_created;

CREATE TABLE credit_ledger_rebuilt (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('grant','reserve','capture','release','refund','adjustment','expiry')),
  units INTEGER NOT NULL CHECK (units > 0),
  reference_type TEXT NOT NULL CHECK (reference_type IN ('generation','payment','admin','promotion','subscription')),
  reference_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  payload_fingerprint TEXT NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, idempotency_key)
);

INSERT INTO credit_ledger_rebuilt (
  id, user_id, entry_type, units, reference_type, reference_id,
  idempotency_key, payload_fingerprint, note, created_at
)
SELECT
  id,
  user_id,
  CASE entry_type
    WHEN 'purchase' THEN 'grant'
    WHEN 'reservation' THEN 'reserve'
    WHEN 'charge' THEN 'capture'
    ELSE entry_type
  END,
  abs(amount),
  CASE
    WHEN generation_id IS NOT NULL THEN 'generation'
    WHEN entry_type IN ('purchase','refund') THEN 'payment'
    ELSE 'admin'
  END,
  COALESCE(generation_id, id),
  COALESCE(idempotency_key, 'legacy:' || id),
  'legacy-migration-v1:' || id,
  NULLIF(description, ''),
  created_at
FROM credit_ledger;

DROP TABLE credit_ledger;
ALTER TABLE credit_ledger_rebuilt RENAME TO credit_ledger;

CREATE INDEX idx_credit_ledger_owner_created
  ON credit_ledger(user_id, created_at DESC, id DESC);

CREATE TRIGGER trg_credit_ledger_no_update
BEFORE UPDATE ON credit_ledger
BEGIN
  SELECT RAISE(ABORT, 'credit_ledger_is_append_only');
END;

CREATE TRIGGER trg_credit_ledger_no_delete
BEFORE DELETE ON credit_ledger
BEGIN
  SELECT RAISE(ABORT, 'credit_ledger_is_append_only');
END;
