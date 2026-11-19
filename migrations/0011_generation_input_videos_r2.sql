-- Private reference videos for Seedance 2.0.
-- The source object stays in the account-scoped R2 bucket. A random bearer
-- capability is stored only as a SHA-256 hash and expires independently.
CREATE TABLE IF NOT EXISTS generation_input_videos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  client_upload_id TEXT NOT NULL,
  generation_id TEXT,
  r2_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video/mp4', 'video/quicktime')),
  byte_size INTEGER NOT NULL CHECK (byte_size BETWEEN 12 AND 52428800),
  duration_seconds REAL NOT NULL CHECK (duration_seconds >= 2 AND duration_seconds <= 15),
  access_token_hash TEXT,
  access_expires_at INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  UNIQUE (user_id, client_upload_id),
  UNIQUE (generation_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (generation_id, user_id) REFERENCES generations(id, user_id) ON DELETE CASCADE,
  CHECK (
    (access_token_hash IS NULL AND access_expires_at IS NULL)
    OR
    (access_token_hash IS NOT NULL AND access_expires_at IS NOT NULL AND generation_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_generation_input_videos_expiry
  ON generation_input_videos(expires_at ASC);
CREATE INDEX IF NOT EXISTS idx_generation_input_videos_owner_created
  ON generation_input_videos(user_id, created_at DESC);
