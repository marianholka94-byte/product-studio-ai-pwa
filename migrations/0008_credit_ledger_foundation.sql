-- Preview-only groundwork for an auditable, account-scoped credit ledger.
-- No balances are created and no generation route reads or mutates these tables yet.
-- Actual reservation/settlement logic is a later, separately tested milestone.

CREATE TABLE IF NOT EXISTS credit_accounts (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE RESTRICT,
  available_units INTEGER NOT NULL DEFAULT 0 CHECK (available_units >= 0),
  reserved_units INTEGER NOT NULL DEFAULT 0 CHECK (reserved_units >= 0),
  version INTEGER NOT NULL DEFAULT 0 CHECK (version >= 0),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS credit_ledger (
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

CREATE INDEX IF NOT EXISTS idx_credit_ledger_owner_created
  ON credit_ledger(user_id, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS generation_credit_reservations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  generation_id TEXT NOT NULL,
  reserved_units INTEGER NOT NULL CHECK (reserved_units > 0),
  captured_units INTEGER NOT NULL DEFAULT 0 CHECK (captured_units >= 0),
  state TEXT NOT NULL CHECK (state IN ('reserved','captured','released','review')),
  reserve_idempotency_key TEXT NOT NULL,
  settlement_idempotency_key TEXT,
  reserve_fingerprint TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  settled_at INTEGER,
  UNIQUE(user_id, generation_id),
  UNIQUE(user_id, reserve_idempotency_key),
  FOREIGN KEY(generation_id) REFERENCES generations(id) ON DELETE RESTRICT,
  CHECK (captured_units <= reserved_units),
  CHECK ((state = 'captured' AND settled_at IS NOT NULL) OR state != 'captured'),
  CHECK ((state = 'released' AND settled_at IS NOT NULL) OR state != 'released')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_generation_credit_settlement_key
  ON generation_credit_reservations(user_id, settlement_idempotency_key)
  WHERE settlement_idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_generation_credit_reservations_owner_state
  ON generation_credit_reservations(user_id, state, updated_at);

-- The ledger is append-only. Corrections must be compensating entries.
CREATE TRIGGER IF NOT EXISTS trg_credit_ledger_no_update
BEFORE UPDATE ON credit_ledger
BEGIN
  SELECT RAISE(ABORT, 'credit_ledger_is_append_only');
END;

CREATE TRIGGER IF NOT EXISTS trg_credit_ledger_no_delete
BEFORE DELETE ON credit_ledger
BEGIN
  SELECT RAISE(ABORT, 'credit_ledger_is_append_only');
END;
