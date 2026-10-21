# Soko — Frontend

React + Vite + Tailwind + React Router storefront, backed by **Supabase**
(Postgres, Auth and Row Level Security). No separate server is needed.

## 1. Set up Supabase

1. In the Supabase dashboard open **SQL Editor** and run `soko_schema.sql`
   (a fresh project) or `soko_patch_1.sql` (if you already ran the first schema).
2. **Authentication → Providers:** keep Email enabled. For testing, turn off
   "Confirm email" so new accounts can log in immediately.
3. **Authentication → URL Configuration:** set the Site URL to your Netlify URL
   and add it (plus `http://localhost:5173`) to the Redirect URLs.

### Admin portal (patch 2)

Run `soko_patch_2_admin.sql` once, then make yourself admin with the SQL at the
bottom of that file. Admins see an **Admin** link in the navbar and can open `/admin`.

## 2. Environment variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

The anon key is in **Project Settings → API**. It is safe in the browser because
Row Level Security protects the data. Never put the `service_role` key in the frontend.

`.env` is git-ignored, so also add both variables on Netlify:
**Site configuration → Environment variables**, then trigger a redeploy.

## 3. Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Requires Node 18 or newer.

## Deploy to Netlify

`netlify.toml` sets the build command, publish directory and the SPA redirect.
Push to GitHub and Netlify redeploys automatically.

## Project structure

- `src/pages/` — one file per route
- `src/components/` — Navbar, Footer, ProductCard, Layout, AuthCard, ProtectedRoute, Icons
- `src/context/` — `AuthContext` (Supabase auth), `CatalogContext` (products and
  categories), `CartContext` (cart, kept in `localStorage`)
- `src/lib/` — `supabase.js` (client), `format.js` (KSh formatting, phone validation, constants)

## Routes

| Route | Page | Sign-in needed |
|---|---|---|
| `/` | Home | No |
| `/products` | Products, with `?category=`, `?q=`, `?sort=`, `?maxPrice=` | No |
| `/product/:id` | Product detail | No |
| `/cart` | Cart | No |
| `/login`, `/register` | Auth | No |
| `/checkout` | Checkout (calls `place_order()` in the database) | Yes |
| `/profile` | Account dashboard and profile form | Yes |
| `/account/orders` | My Orders | Yes |
| `/account/orders/:id` | Order detail with status tracker | Yes |

## How orders work

Checkout calls the `place_order()` database function. It re-reads real prices,
locks and decrements stock, and saves the order, so totals cannot be tampered with
from the browser. Users can only read their own orders (Row Level Security).

## Not built yet

- Real payments (M-Pesa Daraja STK push, card). Orders are saved with the chosen method.
- Admin pages (`profiles.is_admin` exists but nothing uses it yet)
- Saved products (the `wishlist` table exists, the UI doesn't)
- Product images are placeholder URLs (`picsum.photos`)
