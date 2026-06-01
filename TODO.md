After deploying production to Vercel:

- [ ] Change Site URL in Supabase Dashboard → Authentication → URL Configuration (currently set to http://localhost:3000/auth/callback)
- [ ] In Supabase Dashboard → Authentication → URL Configuration, add production URL to Redirect URLs
- [ ] Replace eslint and prettier to biome
- [x] Remove `NEXT_PUBLIC_` prefix from envs NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (nedd to check for NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL, NEXT_PUBLIC_SUPABASE_REDIRECT_URL)
- [ ] Check application support for Supabase `Rate limit for sign-ups and sign-ins` (360 requests per hour)
- [ ] Add to proxy.ts redirect to `/auth/login` for unauthorized users
- [ ] Add to proxy.ts redirect to `/` or `/dashboard` for authorized users for `/auth/*` routes


 
