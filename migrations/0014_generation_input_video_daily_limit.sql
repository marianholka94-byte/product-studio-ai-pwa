-- Enforce the daily per-account cap for source-video uploads at the database layer.
-- This is a separate forward migration so it is applied even if the 90 MB table
-- rebuild migration was already recorded by a preview deployment.
CREATE TRIGGER IF NOT EXISTS trg_generation_input_videos_daily_limit
BEFORE INSERT ON generation_input_videos
WHEN (
  SELECT COUNT(*) FROM generation_input_videos
  WHERE user_id = NEW.user_id
    AND created_at >= (CAST(NEW.created_at / 86400 AS INTEGER) * 86400)
) >= 3
BEGIN
  SELECT RAISE(ABORT, 'generation input video daily limit reached');
END;
