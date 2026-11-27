// Creates .env.local with a random AUTH_SECRET if it does not exist yet.
// Run once: npm run setup
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const file = new URL('../.env.local', import.meta.url);
if (existsSync(file)) {
  console.log('.env.local already exists, left as is.');
} else {
  const template = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
  const secret = randomBytes(33).toString('base64');
  writeFileSync(file, template.replace(/^AUTH_SECRET=.*$/m, `AUTH_SECRET=${secret}`));
  console.log('Created .env.local with a new AUTH_SECRET.');
}
