# TODO

## Auth

- [ ] **Rate limiting for auth server actions**: Server actions (`loginAction`, `signUpAction`, `adminLoginAction`, `adminSignUpAction`) have no rate limiting. Consider adding per-IP attempt tracking or middleware-based rate limiting to prevent brute-force attacks.
