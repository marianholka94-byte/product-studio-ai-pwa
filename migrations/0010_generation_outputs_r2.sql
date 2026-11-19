-- Durable private storage for generated video outputs.
-- Every output is linked to the same account that owns its generation.
CREATE TABLE IF NOT EXISTS generation_outputs (
  id TEXT PRIMARY KEY,
  generation_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL DEFAULT 'video/mp4',
  byte_size INTEGER NOT NULL CHECK (byte_size >= 0),
  created_at INTEGER NOT NULL,
  FOREIGN KEY (generation_id, user_id)
    REFERENCES generations(id, user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_generation_outputs_owner_created
  ON generation_outputs(user_id, created_at DESC);
