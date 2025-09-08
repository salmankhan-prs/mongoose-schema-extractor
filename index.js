/**
 * Mongoose Schema Extractor
 * Extract and format Mongoose schemas for documentation and LLM prompts
 */

const { 
  extractCompleteMongooseSchema,
  extractCompletePathInfo 
} = require('./lib/extractor');

const {
  formatJSON,
  formatCompact,
  formatHuman,
  formatTypeScript,
  formatGraphQL
} = require('./lib/formatter');

/**
 * Main API - Extract schemas with formatting options
 * @param {Object} input - Mongoose instance, model, or models object
 * @param {Object} options - Extraction and formatting options
 * @returns {Object|String} - Formatted schemas based on options.format
 */
function extractSchemas(input, options = {}) {
  // Handle different input types
  let models = {};
  
  if (!input) {
    throw new Error('Input is required - provide mongoose instance, model, or models object');
  }
  
  if (input.models) {
    // It's a mongoose instance
    models = input.models;
  } else if (input.modelName && input.schema) {
    // Single model
    models = { [input.modelName]: input };
  } else if (Array.isArray(input)) {
    // Array of models
    input.forEach(model => {
      if (model.modelName) {
        models[model.modelName] = model;
      }
    });
  } else if (typeof input === 'object') {
    // Direct models object
    models = input;
  } else {
    throw new Error('Invalid input type - expected mongoose instance, model, or models object');
  }

  // Set default options with include/exclude pattern
  const opts = {
    format: 'json',
    include: ['defaults', 'validators', 'timestamps', 'virtuals', 'indexes'],
    exclude: [],
    depth: 10,
    ...options
  };

  // Convert include/exclude to flags for backward compatibility
  const includeFlags = {
    includeId: opts.include.includes('id') || !opts.exclude.includes('id'),
    includeTimestamps: opts.include.includes('timestamps') && !opts.exclude.includes('timestamps'),
    includeVirtuals: opts.include.includes('virtuals') && !opts.exclude.includes('virtuals'),
    includeIndexes: opts.include.includes('indexes') && !opts.exclude.includes('indexes'),
    includeValidators: opts.include.includes('validators') && !opts.exclude.includes('validators'),
    includeDefaults: opts.include.includes('defaults') && !opts.exclude.includes('defaults'),
    depth: opts.depth
  };

  // Extract schemas with circular reference protection
  const schemas = {};
  const visited = new WeakSet(); // Track visited schemas to prevent circular refs
  
  for (const [modelName, model] of Object.entries(models)) {
    if (!model.schema) {
      continue; // Skip silently instead of console.warn
    }
    schemas[modelName] = extractCompleteMongooseSchema(model, includeFlags, visited);
  }

  // Return raw schemas if no format specified
  if (!opts.format || opts.format === 'raw') {
    return schemas;
  }

  // Format based on option
  return formatSchemas(schemas, opts.format);
}

/**
 * Format schemas based on format type
 */
function formatSchemas(schemas, format) {
  const formatters = {
    'json': formatJSON,
    'compact': formatCompact,
    'human': formatHuman,
    'typescript': formatTypeScript,
    'graphql': formatGraphQL
  };
  
  const formatter = formatters[format.toLowerCase()] || formatters.json;
  return formatter(schemas);
}

/**
 * Extract relationships between models
 */
function extractRelationships(input) {
  const schemas = extractSchemas(input, { format: null }); // Get raw schemas
  const relationships = {};

  for (const [modelName, fields] of Object.entries(schemas)) {
    const rels = [];

    for (const [fieldName, fieldInfo] of Object.entries(fields)) {
      // Direct references
      if (fieldInfo.ref) {
        rels.push({
          field: fieldName,
          type: 'reference',
          target: fieldInfo.ref,
          required: fieldInfo.required || false
        });
      }

      // Array references
      if (fieldInfo.type === 'Array' && fieldInfo.items?.ref) {
        rels.push({
          field: fieldName,
          type: 'array-reference',
          target: fieldInfo.items.ref,
          required: fieldInfo.required || false
        });
      }

      // Nested object references
      if (fieldInfo.properties) {
        for (const [nestedField, nestedInfo] of Object.entries(fieldInfo.properties)) {
          if (nestedInfo.ref) {
            rels.push({
              field: `${fieldName}.${nestedField}`,
              type: 'nested-reference',
              target: nestedInfo.ref,
              required: nestedInfo.required || false
            });
          }
        }
      }
    }

    if (rels.length > 0) {
      relationships[modelName] = rels;
    }
  }

  return relationships;
}

// Clean exports - only named exports, no default
module.exports = {
  extractSchemas,
  extractRelationships,
  formatters: {
    formatJSON,
    formatCompact,
    formatHuman,
    formatTypeScript,
    formatGraphQL
  }
};