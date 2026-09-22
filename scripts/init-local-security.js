import { chmodSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { join } from 'path';

const configPath = join(process.cwd(), '.hyperedit-security.json');

if (existsSync(configPath)) {
  const current = JSON.parse(readFileSync(configPath, 'utf-8'));
  if (typeof current.localApiToken !== 'string' || current.localApiToken.length < 32) {
    throw new Error('Existing .hyperedit-security.json has an invalid localApiToken; fix or remove it before retrying.');
  }
  chmodSync(configPath, 0o600);
  console.log('Local security configuration already exists; permissions normalized to 0600.');
  process.exit(0);
}

const localApiToken = randomBytes(32).toString('hex');
writeFileSync(configPath, `${JSON.stringify({ localApiToken }, null, 2)}\n`, { mode: 0o600 });
console.log('Created .hyperedit-security.json with a random local API token (0600).');
