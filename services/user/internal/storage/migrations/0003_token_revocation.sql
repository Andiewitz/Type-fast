-- +goose Up
-- Access tokens are signed and checked offline, so a ban or a forced sign-out
-- cannot reach a token that has already been issued. This marker is compared
-- against the token's issued-at time on every authenticated request.
--
-- NULL means "never revoked". The timestamp is kept after an account is
-- reactivated so tokens issued before the ban stay dead.
ALTER TABLE users ADD COLUMN revoked_before timestamptz;

-- Revoked accounts are a small minority, so the poll only reads the marked rows.
CREATE INDEX users_revoked_idx
    ON users (revoked_before)
    WHERE revoked_before IS NOT NULL;

-- +goose Down
DROP INDEX IF EXISTS users_revoked_idx;
ALTER TABLE users DROP COLUMN IF EXISTS revoked_before;
