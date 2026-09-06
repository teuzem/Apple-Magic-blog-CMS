# Deployment Guide

This application requires a Node.js or Next.js-aware host. It is not a plain
static HTML site because it includes Sanity Studio, preview mode, search,
comments, voting, feeds, image APIs and on-demand revalidation.

## 1. Environment Variables

Copy `.env.example` and configure these values in the hosting provider:

| Variable                           | Required                                 | Exposure    |
| ---------------------------------- | ---------------------------------------- | ----------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`    | Yes                                      | Public      |
| `NEXT_PUBLIC_SANITY_DATASET`       | Yes                                      | Public      |
| `NEXT_PUBLIC_SANITY_API_VERSION`   | Yes                                      | Public      |
| `NEXT_PUBLIC_SANITY_PROJECT_TITLE` | Recommended                              | Public      |
| `NEXT_PUBLIC_SITE_URL`             | Yes                                      | Public      |
| `SANITY_API_READ_TOKEN`            | Preview/private datasets                 | Server only |
| `SANITY_API_WRITE_TOKEN`           | Forms, votes, reviews and Studio imports | Server only |
| `SANITY_REVALIDATE_SECRET`         | Yes for webhooks                         | Server only |
| `PEXELS_API_KEY`                   | Optional                                 | Server only |
| `PIXABAY_API_KEY`                  | Optional                                 | Server only |

Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin with no trailing slash.
Never expose server-only values with a `NEXT_PUBLIC_` prefix.

## 2. Vercel

1. Import the GitHub repository into Vercel.
2. Add every environment variable for Production, Preview and Development as
   appropriate.
3. Keep the framework preset as Next.js.
4. Deploy the `main` branch.
5. Add `applemagic.blog` and `www.applemagic.blog`, then follow Vercel's DNS
   instructions.

`vercel.json` contains the build and install settings. Vercel manages the
Next.js runtime, image optimization and route handling.

## 3. Netlify

1. Import the GitHub repository into Netlify.
2. Netlify reads `netlify.toml`.
3. Add the same environment variables in Site configuration.
4. Deploy and attach the production domain.

Do not configure a static export. The `.next` output is handled by Netlify's
Next.js runtime.

## 4. Hostinger Or Any Node.js VPS

Use Node.js 20.19 or newer.

```bash
npm ci
npm run type-check
npm run lint -- --max-warnings 0
npm run build
HOSTNAME=0.0.0.0 PORT=3000 npm start
```

### PM2

```bash
npm install --global pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Copy `deploy/nginx.conf` to the Nginx site configuration, update the domain if
needed, enable the site, test the configuration and reload Nginx. Install an
HTTPS certificate before public launch.

### Apache

Prefer `deploy/apache-vhost.conf`. Enable `proxy`, `proxy_http`, `headers` and
`rewrite`, then enable the site and reload Apache.

The requested `public/.htaccess` is included for Apache accounts that permit
per-directory proxy rules. It assumes the Node server is running on
`127.0.0.1:3000`. Some shared-hosting plans prohibit proxy directives in
`.htaccess`; in that case use the host's Node.js application feature or a VPS.

## 5. Docker

```bash
docker compose up --build -d
```

The multi-stage image runs as a non-root user and exposes a health check at
`/api/health`. Put Nginx, Caddy, Traefik or the provider's load balancer in
front of port `3000` for HTTPS.

## 6. Sanity Production Configuration

In the Sanity project management console:

1. Add the production origin and provider preview origins to CORS.
2. Allow credentials only for origins that need Studio or preview access.
3. Confirm dataset visibility or configure `SANITY_API_READ_TOKEN`.
4. Create a webhook to
   `/api/revalidate?secret=YOUR_SANITY_REVALIDATE_SECRET`.
5. Verify `/studio` loads and publish a harmless test edit.
6. Keep the write token server-side and limit its permissions.

## 7. GitHub

Initialize and push the directory with:

```bash
git init -b main
git add .
git commit -m "Prepare Apple Magic Blog for production"
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

The workflows run formatting, TypeScript, ESLint and the production build.
Add private environment values to the deployment provider, not GitHub source.

## 8. Launch And Search Console

After DNS and HTTPS are active:

1. Set the final origin in `NEXT_PUBLIC_SITE_URL` and rebuild.
2. Verify `/robots.txt`, `/sitemap.xml`, `/news-sitemap.xml` and all feed URLs.
3. Add the Google Search Console verification value in Sanity SEO settings.
4. Submit `/sitemap.xml` and `/news-sitemap.xml`.
5. Inspect the English and French home, archive, category and article URLs.
6. Confirm a published Sanity edit is revalidated.
7. Test forms, comments, ratings, search, stock media and currency detection.

Technical readiness improves crawlability but does not guarantee indexing,
Google News approval, rankings or review-star display.
