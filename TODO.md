# TODO

## Auth

- [ ] **Rate limiting for auth server actions**: Server actions (`loginAction`, `signUpAction`, `adminLoginAction`, `adminSignUpAction`) have no rate limiting. Consider adding per-IP attempt tracking or middleware-based rate limiting to prevent brute-force attacks.

## Features

- [ ] **Pagination and filtering**: Add server-side pagination and filtering to the transactions page. Evaluate the same for the categories page.
- [ ] **Multi-currency support**: Support multiple currencies and fetch exchange rates via bank APIs.
- [x] **Simple data caching**: Introduce lightweight caching so that navigating between pages does not refetch data from the database every time.

## Styling

- [x] **Polish application styling**: Improve button styles, card styles, fonts, and colors.

## Production deployment

After deploying production to Vercel:

- [ ] Change Site URL in Supabase Dashboard → Authentication → URL Configuration (currently set to http://localhost:3000/auth/callback)
- [ ] In Supabase Dashboard → Authentication → URL Configuration, add production URL to Redirect URLs
- [x] Replace eslint and prettier to biome
- [x] Remove `NEXT_PUBLIC_` prefix from envs NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (nedd to check for NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL, NEXT_PUBLIC_SUPABASE_REDIRECT_URL)
- [ ] Check application support for Supabase `Rate limit for sign-ups and sign-ins` (360 requests per hour)
- [ ] Add to proxy.ts redirect to `/auth/login` for unauthorized users
- [ ] Add to proxy.ts redirect to `/` or `/dashboard` for authorized users for `/auth/*` routes
