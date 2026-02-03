## 2024-05-22 - Authentication Bypass via Missing Password
**Vulnerability:** The Staff entity lacks a password field, and the login endpoint only verifies the existence of the email address, allowing full account takeover by knowing an email.
**Learning:** Legacy systems or prototypes might skip authentication logic for speed, but this creates critical debt. Relying on email existence is not authentication.
**Prevention:** Always implement password hashing (bcrypt/argon2) from day one. Use established Auth libraries (Passport/Guards) that enforce credential verification, not just user lookup.
