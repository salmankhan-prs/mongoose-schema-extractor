#!/usr/bin/env node
import { Command } from 'commander';
import { runExtract } from './cli-utils';
import { promises as fs } from 'fs';
import path from 'path';

async function extractCommand() {
  await runExtract();
}

async function initCommand() {
  const configPath = path.resolve(process.cwd(), 'mongoose-extract.config.js');
  const templatePath = path.resolve(__dirname, '..', 'templates', 'config.template.js');
  const exists = await fs
    .access(configPath)
    .then(() => true)
    .catch(() => false);
  if (exists) {
    console.log('Config already exists at mongoose-extract.config.js');
    return;
  }
  const contents = await fs.readFile(templatePath, 'utf8');
  await fs.writeFile(configPath, contents, 'utf8');
  console.log('✅ Created mongoose-extract.config.js');
}

const program = new Command();

program
  .name('mongoose-extract')
  .description('Extract Mongoose schemas to various formats')
  .version('1.0.0');

program
  .command('extract', { isDefault: true })
  .description('Extract schemas using config file')
  .action(() => extractCommand().catch(err => { console.error(err?.message || err); process.exit(1); }));

program
  .command('init')
  .description('Create a config file template')
  .action(() => initCommand().catch(err => { console.error(err?.message || err); process.exit(1); }));

program.parse();


