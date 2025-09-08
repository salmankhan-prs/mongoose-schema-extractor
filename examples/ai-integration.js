/**
 * Complete AI Integration Example
 * 
 * This demonstrates the primary use case: building an AI database copilot
 * that can generate MongoDB queries from natural language.
 */

const { extractSchemas } = require('mongoose-schema-extractor');
const mongoose = require('mongoose');

// Load your models (adjust paths for your project)
require('./models/User');
require('./models/Post');

class DatabaseCopilot {
  constructor(openaiClient) {
    // Extract schema context once at initialization
    this.schemaContext = extractSchemas(mongoose, { format: 'llm-compact' });
    this.openai = openaiClient;
  }

  /**
   * Convert natural language to MongoDB queries
   */
  async generateQuery(naturalLanguageRequest) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `You are a MongoDB expert. Here's the database schema:

${this.schemaContext}

Generate accurate MongoDB queries. Return ONLY the query code, no explanations.`
      }, {
        role: "user",
        content: naturalLanguageRequest
      }]
    });

    return completion.choices[0].message.content;
  }

  /**
   * Explain existing MongoDB queries in plain English
   */
  async explainQuery(mongoQuery) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system", 
        content: `Database schema:
${this.schemaContext}

Explain MongoDB queries in simple, non-technical terms.`
      }, {
        role: "user",
        content: `Explain this query: ${mongoQuery}`
      }]
    });

    return completion.choices[0].message.content;
  }

  /**
   * Get performance recommendations for queries
   */
  async optimizeQuery(mongoQuery) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `Database schema:
${this.schemaContext}

Analyze MongoDB queries for performance issues and suggest optimizations.`
      }, {
        role: "user", 
        content: `Optimize this query: ${mongoQuery}`
      }]
    });

    return completion.choices[0].message.content;
  }

  /**
   * Schema analysis and recommendations
   */
  async analyzeSchema() {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: `Analyze this MongoDB schema and provide recommendations:

${this.schemaContext}

Focus on:
1. Missing indexes for performance
2. Schema design improvements
3. Potential scalability issues
4. Security considerations`
      }]
    });

    return completion.choices[0].message.content;
  }
}

// Real-world usage examples
async function demonstrateUsage() {
  // You'd initialize this with your OpenAI client
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const copilot = new DatabaseCopilot(openai);

  console.log('Schema Context Generated:');
  console.log('========================');
  
  // Show what gets sent to the AI
  const schemaContext = extractSchemas(mongoose, { format: 'llm-compact' });
  console.log(schemaContext);

  // Example queries you could generate
  const exampleRequests = [
    "Find all active users who posted in the last week",
    "Get the top 10 users by post count with their latest post",
    "Show posts with more than 5 comments, including author details",
    "Find users who haven't logged in for 30 days",
    "Get comment activity for posts published this month"
  ];

  console.log('\nExample Requests AI Could Handle:');
  console.log('=================================');
  exampleRequests.forEach((request, i) => {
    console.log(`${i + 1}. "${request}"`);
  });

  // In a real app, you'd uncomment these:
  // for (const request of exampleRequests) {
  //   const query = await copilot.generateQuery(request);
  //   console.log(`Request: ${request}`);
  //   console.log(`Generated Query: ${query}\n`);
  // }
}

// Domain-specific implementations
class EcommerceCopilot extends DatabaseCopilot {
  async getProductRecommendations(userId) {
    return this.generateQuery(`Find products similar to what user ${userId} has purchased, excluding items they already own`);
  }

  async analyzeInventory() {
    return this.generateQuery("Show products with low stock levels and their recent sales data");
  }

  async customerSegmentation() {
    return this.generateQuery("Group customers by purchase behavior and lifetime value");
  }
}

class BlogCopilot extends DatabaseCopilot {
  async getContentInsights() {
    return this.generateQuery("Analyze which post categories and tags get the most engagement");
  }

  async findTrendingContent() {
    return this.generateQuery("Find posts with high engagement ratios published in the last 24 hours");
  }

  async moderationQueue() {
    return this.generateQuery("Find comments that might need moderation based on flagging patterns");
  }
}

// Integration with popular frameworks
class ExpressIntegration {
  constructor(copilot) {
    this.copilot = copilot;
  }

  // Express route handlers
  async handleNaturalLanguageQuery(req, res) {
    try {
      const { query } = req.body;
      const mongoQuery = await this.copilot.generateQuery(query);
      
      // Execute the generated query (add your execution logic)
      // const results = await eval(mongoQuery);
      
      res.json({ 
        originalQuery: query,
        generatedMongo: mongoQuery,
        // results: results 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async handleQueryExplanation(req, res) {
    try {
      const { mongoQuery } = req.body;
      const explanation = await this.copilot.explainQuery(mongoQuery);
      
      res.json({ 
        query: mongoQuery,
        explanation: explanation 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// Run the demonstration
if (require.main === module) {
  demonstrateUsage().catch(console.error);
}

module.exports = { 
  DatabaseCopilot, 
  EcommerceCopilot, 
  BlogCopilot,
  ExpressIntegration 
};