import path from 'path';
import { promises as fs } from 'fs';
import { pathToFileURL } from 'url';
import { extractSchemas, type ExtractOptions } from './index';

const ERRORS = {
  NO_CONFIG: `
No config file found. Please create one by running:
  npx mongoose-extract init

Or manually create 'mongoose-extract.config.js' in your project root.
`,
  INVALID_CONFIG: `
Invalid config file. Config must export an object with:
- bootstrap: async function that returns mongoose instance
- output: object with path and formats

Run 'npx mongoose-extract init' to see an example.
`,
  BOOTSTRAP_ERROR: `
Error running bootstrap function. Make sure:
1. All model files exist and are valid
2. The bootstrap function returns a mongoose instance
3. No syntax errors in your models
4. For TypeScript projects: Ensure ts-node and tsconfig-paths are installed if using path aliases
`
};

interface Config {
  bootstrap: () => Promise<any> | any;
  output: {
    path: string;
    formats: string[];
    fileName?: string;
  };
  options?: Pick<ExtractOptions, 'include' | 'exclude' | 'depth'>;
}

async function setupTypeScriptEnvironment() {
  // Check if this is a TypeScript project
  const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  
  let isTypeScriptProject = false;
  let hasPathMappings = false;
  
  // Check for tsconfig.json
  try {
    const tsconfigExists = await fs.access(tsconfigPath).then(() => true).catch(() => false);
    if (tsconfigExists) {
      isTypeScriptProject = true;
      const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf8'));
      hasPathMappings = !!(tsconfig?.compilerOptions?.paths || tsconfig?.compilerOptions?.baseUrl);
    }
  } catch (error) {
    // Ignore tsconfig parsing errors
  }
  
  // Also check package.json for TypeScript dependencies
  if (!isTypeScriptProject) {
    try {
      const packageJsonExists = await fs.access(packageJsonPath).then(() => true).catch(() => false);
      if (packageJsonExists) {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };
        if (allDeps.typescript || allDeps['ts-node'] || allDeps['@types/node']) {
          isTypeScriptProject = true;
        }
      }
    } catch (error) {
      // Ignore package.json parsing errors
    }
  }
  
  if (isTypeScriptProject) {
    // Setup ts-node for TypeScript compilation
    try {
      require('ts-node/register');
    } catch (error) {
      console.warn('⚠️  TypeScript project detected but ts-node not available.');
      console.warn('   Install ts-node for TypeScript support:');
      console.warn('   npm install --save-dev ts-node');
      console.warn('   # or');
      console.warn('   yarn add --dev ts-node');
      // Don't throw error, let it continue and fail gracefully if needed
    }
    
    // Setup tsconfig-paths for path alias resolution
    if (hasPathMappings) {
      try {
        require('tsconfig-paths/register');
      } catch (error) {
        console.warn('⚠️  Path mappings detected in tsconfig.json but tsconfig-paths not available.');
        console.warn('   Install tsconfig-paths for path alias support:');
        console.warn('   npm install --save-dev tsconfig-paths');
        console.warn('   # or');
        console.warn('   yarn add --dev tsconfig-paths');
        // Don't throw error, let it continue and fail gracefully if needed
      }
    }
  }
}

export async function loadConfig(): Promise<Config> {
  // Setup TypeScript environment early, before loading any config
  await setupTypeScriptEnvironment();
  
  const configPaths = [
    path.resolve(process.cwd(), 'mongoose-extract.config.js'),
    path.resolve(process.cwd(), 'mongoose-extract.config.ts'),
    path.resolve(process.cwd(), 'mongoose-extract.config.mjs')
  ];

  let found: string | null = null;
  for (const p of configPaths) {
    const exists = await fs
      .access(p)
      .then(() => true)
      .catch(() => false);
    if (exists) { found = p; break; }
  }
  if (!found) {
    throw new Error(ERRORS.NO_CONFIG);
  }

  let config: any;
  const ext = path.extname(found);

  try {
    if (ext === '.mjs') {
      const mod = await import(pathToFileURL(found).href);
      config = mod.default || mod;
    } else {
      // At this point, TypeScript environment is already set up
      config = require(found);
      config = config.default || config;
    }
  } catch (e) {
    const error = e as Error;
    if (error.message.includes('Cannot resolve module') || error.message.includes('path mapping')) {
      throw new Error(`${ERRORS.INVALID_CONFIG}\n\nTypeScript path alias error: ${error.message}\n\nMake sure tsconfig-paths is installed and your tsconfig.json is properly configured.`);
    }
    throw new Error(ERRORS.INVALID_CONFIG + '\n' + error.message);
  }

  if (!config || typeof config !== 'object' || typeof config.bootstrap !== 'function' || !config.output || !Array.isArray(config.output.formats) || !config.output.path) {
    throw new Error(ERRORS.INVALID_CONFIG);
  }

  return config as Config;
}

function headerBlock() {
  return `// Auto-generated by mongoose-schema-extractor\n// Run 'npx mongoose-extract' to regenerate\n\n`;
}

export async function runExtract() {
  const config = await loadConfig();
  let mongoose: any;
  try {
    mongoose = await config.bootstrap();
  } catch (e) {
    throw new Error(ERRORS.BOOTSTRAP_ERROR + '\n' + (e as Error).message);
  }

  if (!mongoose || !mongoose.models) {
    throw new Error(ERRORS.BOOTSTRAP_ERROR + '\nBootstrap must return a mongoose instance with models loaded.');
  }

  const schemas = extractSchemas(mongoose, { ...(config.options as any), format: 'raw' }) as Record<string, any>;

  const outDir = path.resolve(process.cwd(), config.output.path);
  await fs.mkdir(outDir, { recursive: true });
  const baseName = config.output.fileName || 'schema';
  const header = headerBlock();

  let generated: string[] = [];

  for (const fmtRaw of config.output.formats) {
    const fmt = fmtRaw === 'compact' ? 'llm-compact' : fmtRaw;
    switch (fmt) {
      case 'json': {
        const file = path.join(outDir, `${baseName}.json`);
        const contents = JSON.stringify(schemas, null, 2);
        await fs.writeFile(file, contents, 'utf8');
        generated.push(file);
        break;
      }
      case 'llm-compact': {
        const { formatCompact } = await import('./lib/formatter');
        const file = path.join(outDir, `${baseName}.llm-compact.txt`);
        const contents = header + formatCompact(schemas);
        await fs.writeFile(file, contents, 'utf8');
        generated.push(file);
        break;
      }
      case 'typescript': {
        const { formatTypeScript } = await import('./lib/formatter');
        const file = path.join(outDir, `${baseName}.d.ts`);
        const contents = header + formatTypeScript(schemas);
        await fs.writeFile(file, contents, 'utf8');
        generated.push(file);
        break;
      }
      case 'graphql': {
        const { formatGraphQL } = await import('./lib/formatter');
        const file = path.join(outDir, `${baseName}.graphql`);
        const contents = header + formatGraphQL(schemas);
        await fs.writeFile(file, contents, 'utf8');
        generated.push(file);
        break;
      }
      case 'human': {
        const { formatHuman } = await import('./lib/formatter');
        const file = path.join(outDir, `${baseName}.txt`);
        const contents = header + formatHuman(schemas);
        await fs.writeFile(file, contents, 'utf8');
        generated.push(file);
        break;
      }
      default:
        console.warn(`Unknown format: ${fmt}`);
    }
  }

  const modelCount = Object.keys(schemas).length;
  console.log(`✅ Extracted ${modelCount} model${modelCount === 1 ? '' : 's'}`);
  for (const f of generated) {
    const rel = path.relative(process.cwd(), f);
    console.log(`✅ Generated ${rel}`);
  }
}


