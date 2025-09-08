# CLI Usage Guide

Extract AI-ready schemas from your Mongoose models using the command line.

## Quick Start

```bash
# 1. Initialize config file
npx mongoose-extract init

# 2. Edit the config (see below)
# 3. Generate AI-ready schemas
npx mongoose-extract
```

## 🔧 **Configuration for AI Focus**

```javascript
// mongoose-extract.config.js
module.exports = {
  bootstrap: async () => {
    const mongoose = require('mongoose');
    
    // Load your models (adjust paths as needed)
    require('./src/models/User');
    require('./src/models/Post');
    require('./src/models/Order');
    require('./src/models/Product');
    
    return mongoose;
  },
  
  output: {
    path: './ai-schemas',
    formats: ['llm-compact'], // Focus on the AI format!
    fileName: 'database-context',
  },
  
  options: {
    include: ['defaults', 'validators', 'timestamps', 'indexes'],
    depth: 10,
  }
};
```

## 📁 **What You Get**

After running `npx mongoose-extract`, you'll get:

```
ai-schemas/
└── database-context.llm-compact.txt  ← Copy this into ChatGPT!
```

## 🎭 **Example Output (LLM-Ready Format)**

```text
**User**
- username (String, required, unique, 3-30 chars)
- email (String, required, unique, lowercase)
- firstName (String)
- lastName (String)
- age (Number, min 13)
- role (String, enum: [user, admin, editor], default: user)
- isActive (Boolean, default: true)
- posts (Array of ObjectId, ref: Post)
- profile (Object)
  - avatar (String)
  - bio (String, max 500 chars)
  - socialLinks (Array of Object)
    - platform (String, enum: [twitter, linkedin, github])
    - url (String)
- createdAt (Date)
- updatedAt (Date)

**Post**
- title (String, required, max 200 chars)
- slug (String, required, unique)
- content (String, required)
- author (ObjectId, ref: User, required, indexed)
- category (ObjectId, ref: Category)
- tags (Array of String)
- publishedAt (Date, default: null)
- views (Number, default: 0)
- likes (Array of ObjectId, ref: User)
- comments (Array of Object)
  - user (ObjectId, ref: User)
  - body (String, required)
  - createdAt (Date, default: now)
  - replies (Array of Object)
    - user (ObjectId, ref: User)
    - body (String)
    - createdAt (Date, default: now)
- createdAt (Date)
- updatedAt (Date)
```

## 🔥 **How to Use This with AI**

### 1. **Copy the Schema Context**
```bash
# After running mongoose-extract
cat ai-schemas/database-context.llm-compact.txt | pbcopy  # macOS
# or just copy the file contents manually
```

### 2. **Paste into ChatGPT with Your Question**
```
Here's my MongoDB/Mongoose database schema:

[paste the schema here]

Now help me with: "Write a MongoDB aggregation pipeline to get the top 10 most liked posts with their author details, published in the last 30 days"
```

### 3. **Get Perfect Responses**
The AI will generate accurate queries because it understands:
- Your exact field names
- Data types and constraints
- Relationships between models
- Indexes and validation rules

## 🎯 **Real ChatGPT Examples**

### Database Design Questions
```
[Schema context]

Questions:
1. Should I add indexes to the 'publishedAt' field?
2. Is my user profile structure normalized correctly?
3. How should I implement a notification system for this schema?
```

### Query Generation
```
[Schema context]

"Generate a MongoDB query to find:
- All active users
- Who have published at least 5 posts
- In the last 6 months
- Include their total post count and latest post"
```

### Code Generation
```
[Schema context]

"Write a Node.js/Express API endpoint that:
1. Gets user profile with their recent posts
2. Includes pagination
3. Has proper error handling
4. Uses Mongoose populate for relationships"
```

## 🛠️ **Advanced Configuration**

```javascript
// For TypeScript projects
module.exports = {
  bootstrap: async () => {
    const mongoose = require('mongoose');
    // Enable TypeScript loading
    require('ts-node/register');
    
    // Load .ts model files
    require('./src/models/user.model.ts');
    require('./src/models/post.model.ts');
    
    return mongoose;
  },
  
  output: {
    path: './ai-schemas',
    formats: ['llm-compact', 'json'], // Also get JSON for tools
    fileName: 'my-database',
  }
};
```

## 💡 **Pro Tips**

1. **Keep schemas updated**: Run `mongoose-extract` whenever you change your models
2. **Use descriptive names**: The AI works better with clear field names
3. **Include validation info**: The more context, the better AI responses
4. **Save common prompts**: Create templates for your most common AI interactions

---

**🎯 Remember: This tool exists to make your AI conversations about databases incredibly productive!**
