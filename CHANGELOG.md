# Changelog

All notable changes to this project are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] — 2026-06-07

### Security
- **chat_messages**: Removed the permissive `USING (true)` public SELECT policy. Public reads now go exclusively through the `chat_messages_public` view (which excludes `session_id`); the base table is restricted to authenticated roles. Eliminates reliance on the column-level `REVOKE` as the sole protection for `session_id`.
- **bookings**: Added database-level `CHECK` constraints capping input size — `name` ≤ 200, `email` ≤ 254 (RFC 5321), `phone` ≤ 30, `location` ≤ 300, `message` ≤ 5000 characters. Defends against oversized payloads even if client/edge validation is bypassed.
- **contact_submissions**: Added matching `CHECK` constraints — `email` ≤ 254 characters (plus `name` ≤ 200 and `message` ≤ 5000 when those columns are present).

### Fixed
- Restored anonymous Realtime chat updates via server-broadcast channel (replaced postgres_changes subscription that broke under new RLS policy).

### Notes
- Initial chat load continues to use the `chat_messages_public` view; live updates now arrive via a `chat-broadcast` Realtime channel that carries only `id`, `nickname`, `message`, `created_at` — never `session_id`.


---

Earlier versions are not yet documented in this file.
