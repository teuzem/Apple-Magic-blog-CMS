# Apple Magic Blog

A production-oriented bilingual Apple publication built with Next.js 15,
Sanity Studio, TypeScript, next-intl, Tailwind CSS and a standalone Node.js
runtime.

## Included

- English and French home, archive, category, tag, author and product pages
- Sanity-controlled header, footer, article sidebars, products and rich content
- Full-site search, archive filters and autocomplete
- Portable Text with galleries, video, embeds, HTML, code and LaTeX blocks
- Reader comments, verdict voting and author reviews
- Local-currency product pricing
- RSS, Atom, JSON Feed, category feeds, sitemap and Google News sitemap
- Organization, website, article, product, breadcrumb and collection schemas
- Responsive layouts, PWA service worker and accessible error pages
- Vercel, Netlify, Docker, PM2, Nginx and Apache deployment configuration

## Local Development

1. Copy `.env.example` to `.env.local`.
2. Add the Sanity project values and server-only API credentials.
3. Install and run:

```bash
npm ci
npm run dev
```

Open:

- Website: `http://localhost:3000/en`
- French website: `http://localhost:3000/fr`
- Studio: `http://localhost:3000/studio`

Run only one development server at a time. Multiple Next.js processes writing
to `.next-dev` can corrupt generated Studio chunks.

## Quality Checks

```bash
npm run type-check
npm run lint -- --max-warnings 0
npm run build
```

The build creates a self-contained runtime in `.next/standalone`, including
the required public and static assets.

## Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for:

- required environment variables
- Vercel and Netlify deployment
- Hostinger/VPS deployment with PM2, Docker, Nginx or Apache
- Sanity CORS, preview and webhook configuration
- GitHub publishing
- DNS, HTTPS and Google Search Console launch checks

## Production Start

After `npm run build`:

```bash
npm start
```

The server listens on `PORT` and `HOSTNAME`, defaulting to the values in the
environment.

Health endpoint:

```text
/api/health
```

## Security

Never commit `.env.local`, Sanity write tokens, revalidation secrets, Pexels
keys or Pixabay keys. The repository ignores all local environment files.
