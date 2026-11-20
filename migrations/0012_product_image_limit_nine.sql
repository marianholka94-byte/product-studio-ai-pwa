-- Replace the original five-image product cap without changing existing product data.
-- The D1 trigger remains the concurrency-safe source of truth for all clients.
DROP TRIGGER IF EXISTS trg_product_images_max_five;

CREATE TRIGGER IF NOT EXISTS trg_product_images_max_nine
BEFORE INSERT ON product_images
WHEN (SELECT COUNT(*) FROM product_images WHERE product_id = NEW.product_id) >= 9
BEGIN
  SELECT RAISE(ABORT, 'product image limit reached');
END;
