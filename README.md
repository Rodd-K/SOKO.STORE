# Soko — Frontend

React + Vite + Tailwind + React Router storefront for the e-commerce teaching
project. All pages run on mock data for now — no backend required yet.

---

## Deploy to Netlify (fastest path)

You have two options. **Option A is fastest if you're on a deadline** — no
GitHub required.

### Option A — Drag and drop

1. Build the site locally:
   ```bash
   npm install
   npm run build
   ```
   This creates a `dist/` folder — that's the entire deployable site.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag the `dist` folder onto the page.
4. Netlify gives you a live URL in under a minute.

The `_redirects` file is already inside `dist/` after the build, so routing
(`/products`, `/cart`, etc.) will work correctly on refresh — this step
matters, don't skip the build.

### Option B — Connect to GitHub (better for ongoing work with the student)

1. Push this project to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project → GitHub** → pick
   the repo.
3. Build settings (Netlify should auto-detect these from `netlify.toml`, but
   confirm):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site**. Every future push to the connected branch
   redeploys automatically.

`netlify.toml` in this repo already sets the build command, publish
directory, and the SPA redirect rule, so Option B needs no manual
configuration in the Netlify UI.

### Why the redirect rule matters

This is a single-page app — React Router handles routes like `/products` or
`/cart` *in the browser*, not as real files on the server. Without a
redirect rule, visiting `yoursite.com/products` directly (or refreshing the
page) returns a 404, because Netlify looks for a `products` file that
doesn't exist. `netlify.toml` and `public/_redirects` both tell Netlify:
"for any path, just serve `index.html` and let React Router take it from
there." Both files are already in place — nothing to add.

---

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Requires Node 18 or newer (built and
tested here on Node 22).

## Project structure

- `src/pages/` — one file per route
- `src/components/` — shared UI: Navbar, Footer, ProductCard, Layout, AuthCard, Icons
- `src/context/CartContext.jsx` — cart state, persisted to `localStorage`
- `src/data/` — mock products, categories, and orders (shaped to match the
  future Django API responses, so swapping in real `fetch()` calls later is
  a small change, not a rewrite)

## Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/products` | All products — supports `?category=`, `?q=`, `?sort=`, `?maxPrice=` |
| `/product/:id` | Product detail |
| `/cart` | Cart |
| `/checkout` | Checkout (simulated — no real payment yet) |
| `/login` | Login |
| `/register` | Register |
| `/profile` | Account dashboard, profile form, saved products |
| `/account/orders` | My Orders |
| `/account/orders/:id` | Order detail with status tracker |
| `*` | 404 |

## Not built yet

- Admin routes (`/admin/*`) — comes after the Django backend exists
- Real auth — login/register currently just redirect, nothing is persisted
- Real payments — checkout simulates placing an order and clears the cart
- Wishlist persistence (Saved Products is a placeholder for now)

## Known limitation to flag to the student

Product images are placeholder URLs (`picsum.photos`), so the live site
needs internet access to load them — that's expected and fine for a demo,
but worth mentioning if browsing offline.
