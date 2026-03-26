# Glossary

Project-wide term definitions. All specs must use these terms consistently.

## User

A registered account holder who has completed email verification. An unverified sign-up is
a **pending user**, not a user. Specs must not use "user" to mean "visitor" or "account".

## Session

An authenticated browser session created after a successful login. Sessions expire after
30 minutes of inactivity. Specs that touch session state must account for expiry.
