# Crown Coffee

A website for Crown Coffee (6, Shah Makdum Avenue, Sector 13, Uttara, Dhaka), built with
Next.js (App Router) and Tailwind CSS. It includes a password-protected admin panel for
managing the menu, photos, theme colours, fonts and opening hours &mdash; no code changes
needed for day-to-day updates.

## Tech stack

- **Next.js 16** (App Router, JavaScript, Turbopack)
- **Tailwind CSS v4**
- **sharp** &mdash; resizes and compresses uploaded photos on the server
- **react-easy-crop** &mdash; lets the admin crop photos before they're uploaded
- Self-hosted fonts via `@fontsource` (no calls to Google Fonts at runtime)
- Menu and site settings are stored in `data/menu.json` and `data/settings.json`

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the site and
[http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

### Admin login

The admin password and a cookie-signing secret are read from environment variables.
A `.env.local` file is already included with a starter password so you can sign in
immediately:

```
ADMIN_PASSWORD=crown-admin
ADMIN_SECRET=<a long random string>
```

**Change `ADMIN_PASSWORD` before giving anyone else access, and before deploying.**
`.env.local` is not committed to git. `.env.example` shows the variables you need &mdash;
copy it to `.env.local` (or set the variables in your hosting provider) and generate a
new secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Using the admin panel

Go to `/admin` and sign in with `ADMIN_PASSWORD`. There are three tabs:

- **Menu** &mdash; add, edit, remove and reorder menu items and categories. Each item has
  a name, description, price (in &#2547;), category and photo. Use the up/down arrows to
  control the order items and categories appear in on the public Menu page. Click
  **Edit** on an item to change its details or photo, then **Save changes** to publish.

- **Appearance** &mdash; pick an accent colour (used for buttons, prices and links) and a
  secondary colour (used sparingly, e.g. the "open now" indicator), and choose one of
  three font pairings for the whole site.

- **Site info** &mdash; update the site name, tagline, description, address, phone number,
  Google Maps link and opening hours. Opening hours drive the live "open now / opens at"
  badge shown in the header and on the Home and Contact pages.

### Photos: upload now, resize and crop any time

Each menu item can have a photo. Click **Add photo** (or **Change photo**) on an item,
choose an image from your computer, then drag and zoom to crop it &mdash; the crop preview
matches exactly how the photo appears on the site (a 4:3 card). When you click **Use
photo**, the cropped image is sent to the server, where it's automatically resized
(max 1600px) and converted to an optimised WebP file in `public/uploads/`.

You can re-crop or replace a photo at any time from the same **Edit** panel.

## Deploying

### Vercel

This project deploys to Vercel like any Next.js app:

1. Push the project to a GitHub repository.
2. Import it in Vercel.
3. Add the `ADMIN_PASSWORD` and `ADMIN_SECRET` environment variables in the Vercel
   project settings.
4. Deploy.

> **Important &mdash; persistence on Vercel.** Vercel's serverless filesystem is
> **read-only and ephemeral** in production. That means edits made through `/admin`
> (menu changes, theme changes, uploaded photos) will work for the current request but
> **will not persist** across deployments or new server instances.
>
> For a site that's mostly edited before launch, this is fine: make your edits with
> `npm run dev` locally (or on a VPS, see below), commit the updated `data/*.json`
> files and any new files in `public/uploads/`, and redeploy.
>
> If you need to edit the live site frequently after launch, the cleanest upgrade
> path is to swap the JSON file storage in `lib/data.js` and the file write in
> `app/api/upload/route.js` for a database and object storage (e.g. Vercel Postgres /
> Vercel Blob, or any equivalent). The admin UI and the rest of the site would not need
> to change.

### Self-hosted (Node server / VPS)

Run `npm run build` then `npm start` on a server with a persistent filesystem (and
Node.js 20.9+). Admin edits write directly to `data/menu.json`, `data/settings.json`
and `public/uploads/`, and are reflected immediately &mdash; this is the simplest way to
get a fully working admin panel with no extra setup.

## Opening in Google Antigravity (or any AI IDE)

This is a standard Next.js project, so you can open the `crown-coffee` folder directly
in [Google Antigravity](https://antigravity.google/) or any other editor. Run
`npm install` once, then `npm run dev` to start the local dev server. The included
`AGENTS.md` / `CLAUDE.md` files point AI agents to the Next.js 16 docs bundled in
`node_modules`, which is useful since some APIs differ from older Next.js versions.

## Project structure

```
app/
  page.js              Home page
  menu/page.js         Full menu
  about/page.js        About page
  contact/page.js      Contact page + hours + map
  admin/               Admin panel (protected)
  api/
    menu/route.js      Read/write data/menu.json
    settings/route.js  Read/write data/settings.json
    upload/route.js    Resize + save uploaded photos (sharp)
    auth/              Login / logout
components/            Header, Footer, MenuCard, StatusBadge, CrownMark
components/admin/      Admin dashboard, menu manager, appearance + site info forms,
                        image cropper
data/
  menu.json            Menu items and categories (editable via /admin)
  settings.json        Site info, hours and theme (editable via /admin)
lib/
  data.js              Reads/writes the JSON files above
  auth.js              Admin session helpers
  hours.js             Opening-hours formatting helpers
  fonts.js             Font pairing definitions used by the layout and admin UI
proxy.js               Protects /admin and the admin API routes
```

## Notes

- Prices are shown in Bangladeshi taka (&#2547;).
- The "open now" badge is computed using the Asia/Dhaka timezone, based on the hours
  set in the Site info tab.
- Uploaded photos are not automatically deleted when replaced; if you swap a lot of
  photos, periodically check `public/uploads/` and remove any files no longer
  referenced in `data/menu.json`.
