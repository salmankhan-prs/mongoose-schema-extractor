# Mongoose Schema Extractor

[![NPM version](https://img.shields.io/npm/v/mongoose-schema-extractor.svg)](https://www.npmjs.com/package/mongoose-schema-extractor)
[![License](https://img.shields.io/npm/l/mongoose-schema-extractor.svg)](LICENSE)

Extract Mongoose schemas and feed them directly to AI models. Built to solve the real problem of dynamically integrating database schemas with LLMs for natural language database interactions.

## Why This Exists

**The Problem**: You're building a MongoDB copilot, database chat bot, or any AI agent that needs to understand your database structure. You can't hardcode schemas manually—they change, you have multiple models, and you need this to work programmatically across different projects.

**The Solution**: This library extracts your existing Mongoose schemas and formats them perfectly for AI consumption. No manual schema documentation. No keeping things in sync. Just dynamic extraction that works with your actual models.

## Quick Start

```bash
npm install mongoose-schema-extractor
```

```javascript
const { extractSchemas } = require('mongoose-schema-extractor');
const mongoose = require('mongoose');

// Load your existing models (you already have these)
require('./models/User');
require('./models/Post'); 

// Extract schemas in AI-optimized format
const schemaContext = extractSchemas(mongoose, { format: 'llm-compact' });

// Now feed this to ChatGPT, Claude, or any LLM
const prompt = `
Database Schema:
${schemaContext}

Query: "Find all active users who posted this week"
Generate MongoDB query:
`;
```

## Main Use Cases

### 1. AI Database Copilot
Build ChatGPT-like interfaces for your MongoDB database:

```javascript
class DatabaseAI {
  constructor() {
    this.schemaContext = extractSchemas(mongoose, { format: 'llm-compact' });
  }

  async naturalLanguageQuery(userQuestion) {
    const prompt = `Schema: ${this.schemaContext}\nQuestion: "${userQuestion}"\nMongoDB Query:`;
    return await this.callOpenAI(prompt);
  }
}

// Usage: "Show me users who signed up last month"
// AI generates: db.users.find({ createdAt: { $gte: new Date('2024-08-01') } })
```

### 2. CLI Tool for AI Chat Sessions
Sometimes you just want to ask ChatGPT about your database:

```bash
npx mongoose-extract init
# Edit config to point to your models
npx mongoose-extract
# Generates schema.llm-compact.txt - copy/paste into ChatGPT
```

## How It Works

The library reads your actual Mongoose models (not your code files) and extracts:
- Field types and constraints
- Relationships between models  
- Validation rules
- Required fields
- Default values

Then formats everything in a compact, AI-friendly format:

```
**User**
- username (String, required, unique, 3-30 chars)
- email (String, required, unique, lowercase)
- posts (Array of ObjectId, ref: Post)
- createdAt (Date, auto-generated)

**Post** 
- title (String, required, max 200 chars)
- content (String, required)
- author (ObjectId, ref: User, required)
- publishedAt (Date, default: null)
```

## API Reference

### `extractSchemas(input, options)`

**Parameters:**
- `input` - Your mongoose instance, single model, or array of models
- `options.format` - Output format:
  - `'llm-compact'` - AI-optimized (primary use case)
  - `'json'` - Raw JSON data
  - `'typescript'` - Generate TypeScript interfaces
  - `'graphql'` - Generate GraphQL schema

**Examples:**
```javascript
// All registered models
extractSchemas(mongoose)

// Single model
extractSchemas(UserModel)

// Specific models
extractSchemas([UserModel, PostModel])

// With options
extractSchemas(mongoose, {
  format: 'llm-compact',
  include: ['validators', 'defaults'],
  exclude: ['timestamps']
})
```

## TypeScript Support

Works out of the box with TypeScript projects. The tool automatically detects TypeScript projects and registers the necessary loaders.

**Requirements for TypeScript:**
```bash
# Install these dependencies in your project:
npm install --save-dev ts-node tsconfig-paths
# or
yarn add --dev ts-node tsconfig-paths
```

**Usage:**
```javascript
// mongoose-extract.config.js
module.exports = {
  bootstrap: async () => {
    const mongoose = require('mongoose');
    
    // TypeScript models are automatically compiled and path aliases resolved
    require('./src/models/user.model.ts');
    require('./src/models/post.model.ts');
    
    // Path aliases from tsconfig.json work automatically:
    // require('./src/models/user.model.ts'); // Uses @/models/* internally
    
    return mongoose;
  }
};
```

**What's auto-detected:**
- ✅ TypeScript compilation via `ts-node`
- ✅ Path aliases from `tsconfig.json` via `tsconfig-paths`
- ✅ Automatic setup when `tsconfig.json` exists
- ✅ Helpful error messages if dependencies are missing

## Real-World Integration

### With OpenAI API
```javascript
const schemaContext = extractSchemas(mongoose, { format: 'llm-compact' });

const response = await openai.chat.completions.create({
  messages: [{
    role: 'system', 
    content: `Database schema: ${schemaContext}`
  }, {
    role: 'user',
    content: 'Find all orders from last week'
  }],
  model: 'gpt-4'
});
```

### With Langchain
```javascript
const context = extractSchemas(mongoose, { format: 'llm-compact' });
const chain = new ConversationChain({
  llm: new ChatOpenAI(),
  memory: new BufferMemory(),
  prompt: PromptTemplate.fromTemplate(`
    Schema: ${context}
    Human: {input}
    AI: I'll help you query this database.
  `)
});
```

## Output Formats

While the primary use case is LLM integration, we also support:

- **JSON**: Clean data for processing
- **TypeScript**: Generate interfaces for your frontend
- **GraphQL**: Schema definitions

```javascript
// Generate TypeScript types for your frontend
const types = extractSchemas(mongoose, { format: 'typescript' });
fs.writeFileSync('types/database.d.ts', types);
```

## Troubleshooting

### TypeScript Issues

**Error: "ts-node not found"**
```bash
# Install ts-node in your project
npm install --save-dev ts-node
```

**Error: "Cannot resolve module" or path alias issues**
```bash
# Install tsconfig-paths for path alias support
npm install --save-dev tsconfig-paths
```

**Error: "Bootstrap function failed"**
1. Check that all your model files exist and have valid syntax
2. Ensure your `tsconfig.json` is properly configured
3. Verify your models export the Mongoose models correctly

### General Issues

**Error: "No models found"**
- Make sure your bootstrap function actually loads/requires your model files
- Verify the models are registered with Mongoose before returning the mongoose instance

**Generated schema looks incomplete**
- Check that all your models are loaded in the bootstrap function
- Ensure models are properly exported from their files

## Contributing

Found a bug? Want to add support for a new output format? PRs welcome.

**Focus areas:**
- Better AI prompt optimization
- New output formats
- Performance improvements

## License

MIT