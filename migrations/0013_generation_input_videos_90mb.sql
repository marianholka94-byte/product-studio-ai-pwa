-- Raise the private source-video limit from 50 MiB to 90 MiB.
-- SQLite CHECK constraints cannot be altered in place, so rebuild the table
-- while preserving every existing account-scoped video and its relationships.
CREATE TABLE generation_input_videos_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  client_upload_id TEXT NOT NULL,
  generation_id TEXT,
  r2_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video/mp4', 'video/quicktime')),
  byte_size INTEGER NOT NULL CHECK (byte_size BETWEEN 12 AND 94371840),
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

INSERT INTO generation_input_videos_new (
  id, user_id, client_upload_id, generation_id, r2_key, content_type,
  byte_size, duration_seconds, access_token_hash, access_expires_at, created_at, expires_at
)
SELECT
  id, user_id, client_upload_id, generation_id, r2_key, content_type,
  byte_size, duration_seconds, access_token_hash, access_expires_at, created_at, expires_at
FROM generation_input_videos;

DROP TABLE generation_input_videos;
ALTER TABLE generation_input_videos_new RENAME TO generation_input_videos;

CREATE INDEX IF NOT EXISTS idx_generation_input_videos_expiry
  ON generation_input_videos(expires_at ASC);
CREATE INDEX IF NOT EXISTS idx_generation_input_videos_owner_created
  ON generation_input_videos(user_id, created_at DESC);
