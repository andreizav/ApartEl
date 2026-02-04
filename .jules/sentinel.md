## 2024-05-22 - Authentication Bypass via Missing Password
**Vulnerability:** The Staff entity lacks a password field, and the login endpoint only verifies the existence of the email address, allowing full account takeover by knowing an email.
**Learning:** Legacy systems or prototypes might skip authentication logic for speed, but this creates critical debt. Relying on email existence is not authentication.
**Prevention:** Always implement password hashing (bcrypt/argon2) from day one. Use established Auth libraries (Passport/Guards) that enforce credential verification, not just user lookup.

## 2025-01-20 - Legacy Data Lockout during Auth Hardening
**Vulnerability:** Adding mandatory password verification to an existing userbase without passwords creates a denial-of-service condition for valid users.
**Learning:** Security controls must account for legacy data state. Strictly enforcing new controls on old data can break availability.
**Prevention:** Plan for "Trust On First Use" (TOFU) or explicit migration scripts (e.g., email resets) when introducing authentication requirements to legacy datasets.
