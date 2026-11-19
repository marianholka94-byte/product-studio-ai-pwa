-- Make cloud project creation idempotent per account.
-- A client-generated operation key survives retries after a lost HTTP response.
ALTER TABLE projects ADD COLUMN client_operation_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_owner_operation
  ON projects(user_id, client_operation_id)
  WHERE client_operation_id IS NOT NULL;
