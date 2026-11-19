-- Enforce the five-image product limit inside D1 as well as in the Worker.
-- This protects the limit when concurrent uploads race or future clients bypass the UI.
CREATE TRIGGER IF NOT EXISTS trg_product_images_max_five
BEFORE INSERT ON product_images
WHEN (SELECT COUNT(*) FROM product_images WHERE product_id = NEW.product_id) >= 5
BEGIN
  SELECT RAISE(ABORT, 'product image limit reached');
END;
