-- +goose Up
-- Cognito proves identity; the canonical account stays in this table.
-- Accounts created through the hosted UI have no local password, so
-- password_hash holds identity.PasswordHashExternal for them.
ALTER TABLE users ADD COLUMN cognito_sub text;

-- NULLs are not identities, so only linked rows participate in uniqueness.
CREATE UNIQUE INDEX users_cognito_sub_key
    ON users (cognito_sub)
    WHERE cognito_sub IS NOT NULL;

-- +goose Down
DROP INDEX IF EXISTS users_cognito_sub_key;
ALTER TABLE users DROP COLUMN IF EXISTS cognito_sub;
