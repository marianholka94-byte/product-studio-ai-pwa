-- Make cloud product creation safe to retry if its HTTP response is lost.
ALTER TABLE products ADD COLUMN client_operation_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_owner_operation
  ON products(user_id, client_operation_id)
  WHERE client_operation_id IS NOT NULL;
