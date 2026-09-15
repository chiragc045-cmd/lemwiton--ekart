# Lemwiton Ekart — Step 7 Deployment

## What is complete
- Production deployment files (Dockerfile + docker-compose)
- PostgreSQL database schema and seed
- Node/Express backend
- Admin order management
- Razorpay server integration + signature verification
- Responsive storefront and checkout
- Environment-variable configuration

## What cannot be completed inside this chat
A real public deployment requires access to:
1. A hosting/server account
2. A PostgreSQL production database
3. The DNS settings for `lemwiton.in`
4. A Razorpay merchant account and API keys

Those are external accounts, so this package does not pretend that `lemwiton.in` is already live.

## Deployment sequence
1. Create production PostgreSQL database.
2. Run `schema.sql`, then `seed.sql`.
3. Deploy this Node app with `npm ci --omit=dev` and `npm start`, or use Docker.
4. Add environment variables from `.env.example`.
5. Set a strong admin password hash.
6. Add Razorpay test keys first and verify the complete payment flow.
7. Configure HTTPS.
8. Point `lemwiton.in` DNS records to the hosting provider.
9. Test checkout, payment, order creation, admin status updates, mobile layout and error handling.
10. Switch Razorpay to live keys only after successful test verification.

## Security checklist
- Never commit `.env`.
- Never expose `RAZORPAY_KEY_SECRET` in frontend code.
- Use a long random SESSION_SECRET.
- Use a persistent secure session store instead of the prototype in-memory sessions.
- Add rate limiting, security headers, CSRF protection where applicable, input validation and database backups before launch.
- Use HTTPS only in production.
