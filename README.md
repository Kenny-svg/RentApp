# RentRate

RentRate is a rental transparency platform where landlords list properties and tenants review both properties and landlord experience.

## 1) Data model relationship overview

- `auth.users` is the identity source (Supabase Auth).
- `profiles` stores app-level identity (`full_name`, `phone`, `role`) and has one row per authenticated user.
- `landlord_profiles` and `tenant_profiles` are role-specific extensions (one-to-one with `auth.users`).
- `properties` belong to landlords (`properties.landlord_id -> auth.users.id`).
- `tenant_property_links` connects tenants to properties they rent/rented and supports review eligibility.
- `property_reviews` are tenant reviews about a property.
- `landlord_reviews` are tenant reviews about a landlord (optionally tied to a property).
- `property_images` and `property_amenities` are one-to-many child tables of `properties`.
- `landlord_contacts` stores tenant messages to landlords.
- `saved_properties` stores tenant bookmarks.

## 2) Supabase setup

### Environment variables

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

`VITE_SUPABASE_ANON_KEY` is safe for frontend use. Never put the Supabase service role key in the frontend.

### SQL execution order

Run these files in Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/policies.sql`
3. `supabase/triggers.sql`

## 3) Frontend integration

### Supabase client

- `src/lib/supabaseClient.js`

### Services

- `src/services/authService.js`
- `src/services/propertyService.js`
- `src/services/reviewService.js`
- `src/services/contactService.js`
- `src/services/profileService.js`

### Auth context

- `src/hooks/useAuth.jsx`

This context syncs Supabase auth state, loads profile role, and exposes:
- `signup`
- `login`
- `logout`
- `isAuthenticated`
- `user`

## 4) Route protection behavior

- Landlord dashboard: landlord-only
- Tenant dashboard: tenant-only
- Property creation: landlord-only
- Review page: tenant-only
- Property listing/details: public

Implemented via:
- `src/components/ProtectedRoute.jsx`
- `src/App.jsx`

## 5) Example usage in React components

- `src/pages/SignupPage.jsx`: signs up user + creates profile rows based on role.
- `src/pages/LoginPage.jsx`: logs users in through Supabase auth.
- `src/pages/PropertyListingPage.jsx`: fetches property data using `propertyService.getProperties()`.

## 6) Run locally

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```
