import nextEnv from '@next/env'

// `node .next/standalone/server.js` does not load `.env.local` by itself.
// Load local development secrets for self-hosted launches; cloud providers
// still supply their own runtime environment variables normally.
nextEnv.loadEnvConfig(process.cwd(), false)
await import('../.next/standalone/server.js')
