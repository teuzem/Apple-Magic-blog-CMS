import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const standalone = path.join(root, '.next', 'standalone')

if (!fs.existsSync(path.join(standalone, 'server.js'))) {
  throw new Error('Standalone server not found. Run next build first.')
}

const copies = [
  [path.join(root, 'public'), path.join(standalone, 'public')],
  [
    path.join(root, '.next', 'static'),
    path.join(standalone, '.next', 'static'),
  ],
]

for (const [source, destination] of copies) {
  if (!fs.existsSync(source)) continue
  fs.rmSync(destination, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

console.log('Standalone server prepared with public and static assets.')
