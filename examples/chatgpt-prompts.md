# ChatGPT Prompt Templates

Ready-to-use prompts for AI-powered database assistance.

## Template 1: Schema Analysis & Improvements

```
Here's my MongoDB/Mongoose database schema:

[paste your schemas.llm-compact.txt here]

Please analyze this schema and provide:

1. **Indexing recommendations** - which fields should have indexes and why
2. **Schema normalization** - is the structure optimal or should anything be refactored
3. **Performance concerns** - any potential bottlenecks or issues
4. **Best practices** - areas where I can improve the design
5. **Missing relationships** - any important connections I might have overlooked

Be specific and explain your reasoning.
```

## 🔍 **Template 2: Natural Language to MongoDB Queries**

```
Database Schema:
[paste your schemas.llm-compact.txt here]

Convert these natural language requests to MongoDB queries:

1. "Find all active users who have posted at least 5 articles in the last 3 months"
2. "Get the top 10 most commented posts with their authors"
3. "Show me users who haven't logged in for 30 days"
4. "Find posts published this week, grouped by category with counts"

For each query, provide:
- The MongoDB query
- Brief explanation of what it does
- Any performance considerations
```

## 🏗️ **Template 3: Feature Implementation**

```
Current Database Schema:
[paste your schemas.llm-compact.txt here]

I want to implement these new features:
- User followers/following system
- Post bookmarking
- Comment replies (nested comments)
- User notification system

For each feature:
1. Suggest schema changes (new fields, models, etc.)
2. Show the updated schema structure  
3. Provide sample queries for common operations
4. Highlight any performance or design considerations
```

## 📊 **Template 4: API Endpoint Generation**

```
Database Schema:
[paste your schemas.llm-compact.txt here]

Generate Node.js/Express API endpoints for:

1. **User Management**
   - Get user profile with recent posts
   - Update user profile
   - Get user's followers/following

2. **Post Operations**
   - Create new post
   - Get posts with pagination and filters
   - Get post with comments (populated)

For each endpoint, include:
- Route definition
- Request/response schemas
- Mongoose queries with population
- Error handling
- Input validation
```

## 🔧 **Template 5: Database Migration Planning**

```
Current Schema:
[paste your schemas.llm-compact.txt here]

I need to make these changes:
- Add new field 'category' to Posts
- Change User.email to be case-insensitive
- Add indexes for better query performance
- Rename 'publishedAt' to 'published_date'

Help me plan the migration:
1. MongoDB migration scripts for each change
2. Order of operations (what to do first)
3. Backup strategy
4. Rollback plan if something goes wrong
5. Application code changes needed
```

## 🧠 **Template 6: Query Optimization**

```
Schema Context:
[paste your schemas.llm-compact.txt here]

I have these slow queries that need optimization:

```javascript
// Query 1: Get user feed
User.findById(userId).populate({
  path: 'following',
  populate: { path: 'posts', options: { sort: '-createdAt', limit: 50 } }
});

// Query 2: Search posts
Post.find({
  $or: [
    { title: new RegExp(searchTerm, 'i') },
    { content: new RegExp(searchTerm, 'i') }
  ]
}).populate('author');
```

For each query:
1. Identify performance bottlenecks
2. Suggest better query approaches
3. Recommend indexes to add
4. Provide optimized versions
5. Explain the improvements
```

## 💡 **Template 7: Architecture Review**

```
Complete Database Schema:
[paste your schemas.llm-compact.txt here]

This is for a [describe your application type, e.g., "social media platform", "e-commerce site", "blog platform"].

Please provide a comprehensive architecture review:

**Strengths:**
- What's well-designed in this schema?

**Weaknesses:**
- What could be improved?
- Any anti-patterns or red flags?

**Scalability:**
- Will this scale to 100K+ users?
- What changes would be needed for millions of records?

**Security:**
- Any security concerns in the schema design?
- Missing fields for proper access control?

**Modern Best Practices:**
- How does this compare to current MongoDB/Mongoose best practices?
- Any outdated patterns I should update?
```

## 🚀 **Template 8: Code Generation from Schema**

```
Database Schema:
[paste your schemas.llm-compact.txt here]

Generate complete code for:

1. **Mongoose Models** (if I want to rewrite them)
2. **GraphQL Schema** definitions
3. **TypeScript Interfaces** for the frontend
4. **Validation Schemas** (using Joi or similar)
5. **Test Data Factory** functions for testing

Make sure all relationships and constraints are properly represented.
```

## 🎯 **Pro Tips for Better AI Responses**

1. **Be specific about your use case**: "This is for an e-commerce platform with 10K users"

2. **Ask follow-up questions**: After getting a response, ask "What are the trade-offs of this approach?"

3. **Request alternatives**: "Show me 2-3 different ways to implement this"

4. **Include constraints**: "I need this to work with MongoDB Atlas and handle 1M+ documents"

5. **Ask for explanations**: "Why did you suggest this index over that one?"

## 💡 **Remember**

The `llm-compact` format from this tool is specifically designed to give AI models the perfect amount of context. It includes:
- ✅ Field names and types
- ✅ Validation rules and constraints  
- ✅ Relationships and references
- ✅ Default values
- ✅ Indexes and uniqueness constraints

This means the AI understands your database as well as you do!

---

**🎯 The magic happens when you combine your domain knowledge with AI's pattern recognition. Happy prompting!**
