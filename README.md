# 🤖 Mongoose Schema Extractor

[![NPM version](https://img.shields.io/npm/v/mongoose-schema-extractor.svg)](https://www.npmjs.com/package/mongoose-schema-extractor)
[![License](https://img.shields.io/npm/l/mongoose-schema-extractor.svg)](LICENSE)

> **Extract Mongoose schemas into LLM-optimized formats. Built for programmatic AI agent development.**

## 🎯 **Primary Purpose: AI Agent Development**

This library was created specifically for **programmatic integration** with AI/LLM systems. Extract your Mongoose schemas and feed them as context to ChatGPT, Claude, or any AI model for intelligent database interactions.

**Core Use Case**: Building AI agents that understand your database structure.

## 💻 **Programmatic Usage** (Main API)

```javascript
const { extractSchemas } = require('mongoose-schema-extractor');
const mongoose = require('mongoose');

// Extract LLM-ready schema context
const schemaContext = extractSchemas(mongoose, {
  format: 'llm-compact'
});

// Use in AI prompts
const aiPrompt = `
Database Schema:
${schemaContext}

User Query: "Find all active users who posted this week"
Generate MongoDB query:
`;

// Send to your AI service (OpenAI, Claude, etc.)
const response = await openai.chat.completions.create({
  messages: [{ role: 'user', content: aiPrompt }],
  model: 'gpt-4'
});
```

---

## 🚀 **Installation & Basic Setup**

```bash
npm install mongoose-schema-extractor
```

```javascript
// Load your models first
require('./models/User');
require('./models/Post');

// Extract schemas
const { extractSchemas } = require('mongoose-schema-extractor');
const mongoose = require('mongoose');

const schemas = extractSchemas(mongoose, { format: 'llm-compact' });
console.log(schemas); // Ready for AI consumption
```

## 🧠 **The LLM-Compact Format**

The `llm-compact` format produces AI-optimized schema descriptions:

```text
**User**
- username (String, required, unique, 3-30 chars)
- email (String, required, unique, lowercase)
- age (Number, min 13)
- role (String, enum: [user, admin], default: user)
- posts (Array of ObjectId, ref: Post)
- createdAt (Date)

**Post**
- title (String, required, max 200 chars)
- content (String, required)
- author (ObjectId, ref: User, required)
- tags (Array of String)
- publishedAt (Date, default: null)
```

## 🔧 **API Reference**

### `extractSchemas(input, options)`

**Parameters:**
- `input`: Mongoose instance, model, or models object
- `options.format`: Output format (`'llm-compact'`, `'json'`, `'typescript'`, `'graphql'`)
- `options.include`: Features to include (`['defaults', 'validators', 'timestamps', 'virtuals', 'indexes']`)
- `options.exclude`: Features to exclude
- `options.depth`: Max nesting depth (default: 10)

**Returns:** Formatted schema string or object

```javascript
// Different input types
extractSchemas(mongoose);                    // All models
extractSchemas(UserModel);                   // Single model
extractSchemas([UserModel, PostModel]);      // Array of models
extractSchemas({ User: UserModel });         // Object of models
```

## 🛠️ **TypeScript Support**

Full TypeScript support with automatic path alias resolution:

```javascript
// mongoose-extract.config.js
module.exports = {
  bootstrap: async () => {
    const mongoose = require('mongoose');
    
    // TypeScript models with path aliases (@/*, etc.)
    require('./src/models/user.model.ts');
    require('./src/models/post.model.ts');
    
    return mongoose;
  },
  // ... rest of config
};
```

**Auto-detection features:**
- ✅ Automatically registers `ts-node` for TypeScript compilation
- ✅ Detects `tsconfig.json` and registers `tsconfig-paths` for path mappings
- ✅ Supports path aliases like `@/models/*`, `~/utils/*`, etc.
- ✅ No manual setup required in most cases

**Manual setup** (if auto-detection fails):
```javascript
// In your config bootstrap function
require('ts-node/register');
require('tsconfig-paths/register');  // For path aliases
```

---

## 🎆 **AI Agent Integration Examples**

### Natural Language to MongoDB Query
```javascript
class DatabaseAI {
  constructor() {
    this.schemaContext = extractSchemas(mongoose, { format: 'llm-compact' });
  }
  
  async queryFromNaturalLanguage(userRequest) {
    const prompt = `
Schema: ${this.schemaContext}
Request: "${userRequest}"
Generate MongoDB query:`;
    
    return await this.callAI(prompt);
  }
}

// Usage
const dbAI = new DatabaseAI();
const query = await dbAI.queryFromNaturalLanguage(
  "Find active users who posted this week"
);
```

### Schema Analysis Assistant
```javascript
function createSchemaAnalyzer() {
  const context = extractSchemas(mongoose, { format: 'llm-compact' });
  
  return {
    analyzePerformance: () => {
      return callAI(`${context}\n\nAnalyze performance bottlenecks and suggest indexes.`);
    },
    
    suggestImprovements: () => {
      return callAI(`${context}\n\nSuggest schema design improvements.`);
    },
    
    generateTestData: (modelName) => {
      return callAI(`${context}\n\nGenerate realistic test data for ${modelName}.`);
    }
  };
}
```

### Different Output Formats
```javascript
// LLM-optimized (primary)
const llmFormat = extractSchemas(mongoose, { format: 'llm-compact' });

// Raw JSON for processing
const jsonFormat = extractSchemas(mongoose, { format: 'json' });

// TypeScript interfaces
const tsFormat = extractSchemas(mongoose, { format: 'typescript' });

// GraphQL schemas
const gqlFormat = extractSchemas(mongoose, { format: 'graphql' });
```

---

## ⚡ **CLI Tool** (Convenience Feature)

For quick schema extraction without writing code:

```bash
# Initialize config
npx mongoose-extract init

# Edit mongoose-extract.config.js to load your models
# Then extract schemas
npx mongoose-extract
```

This generates files like `schema.llm-compact.txt` that you can copy into AI chats.

---

## 🎆 **Real-World Integration Patterns**

### Natural Language Query Interface
```javascript
const context = extractSchemas(mongoose, { format: 'llm-compact' });

async function handleUserQuery(naturalLanguageQuery) {
  const prompt = `${context}\n\nQuery: "${naturalLanguageQuery}"\nMongoDB:`;
  const response = await openai.complete(prompt);
  return response;
}
```

### Schema-Aware Chatbot
```javascript
class DatabaseChatbot {
  constructor() {
    this.context = extractSchemas(mongoose, { format: 'llm-compact' });
  }
  
  async chat(userMessage) {
    const systemPrompt = `You are a database expert. Here's the schema: ${this.context}`;
    // Send to AI with system prompt + user message
  }
}
```

### Relationship Analysis
```javascript
const { extractRelationships } = require('mongoose-schema-extractor');
const relationships = extractRelationships(mongoose);
// Use for building graph visualizations or migration planning
```

## 📊 **Bonus: Other Formats (Secondary Features)**

We also support these formats for when you need them:
- `json` - Clean JSON for tools and APIs
- `typescript` - Type definitions for frontend
- `graphql` - GraphQL schema generation

```javascript
// Generate TypeScript types
const types = extractSchemas(mongoose, { format: 'typescript' });

// Or get raw JSON for processing
const json = extractSchemas(mongoose, { format: 'json' });
```

## 📁 **Examples**

See [`examples/`](./examples) for:
- **AI integration patterns** - Real-world usage examples
- **ChatGPT prompts** - Ready-to-use conversation templates
- **CLI usage guide** - Command-line examples

## Contributing

Contributions welcome! Areas of focus:
- AI integration improvements
- New output formats
- Performance optimizations
- Documentation and examples

## License

[MIT](LICENSE)
