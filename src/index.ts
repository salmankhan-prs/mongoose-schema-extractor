/**
 * Mongoose Schema Extractor
 */

import { extractCompleteMongooseSchema, extractCompletePathInfo } from './lib/extractor';
import { formatJSON, formatCompact, formatHuman, formatTypeScript, formatGraphQL } from './lib/formatter';

import type { Model, Mongoose } from 'mongoose';

export type FormatterName = 'json' | 'compact' | 'human' | 'typescript' | 'graphql' | 'raw' | null;

export interface ExtractOptions {
  format?: FormatterName;
  include?: Array<'id' | 'defaults' | 'validators' | 'timestamps' | 'virtuals' | 'indexes'>;
  exclude?: Array<'id' | 'defaults' | 'validators' | 'timestamps' | 'virtuals' | 'indexes'>;
  depth?: number;
}

export type ExtractedSchemas = Record<string, Record<string, any>>;

/**
 * Extract schemas from Mongoose models
 */
export function extractSchemas(input: Mongoose | Model<any> | Model<any>[] | Record<string, Model<any>>, options: ExtractOptions = {}): ExtractedSchemas | string {
  let models: Record<string, Model<any>> = {};

  if (!input) {
    throw new Error('Input is required - provide mongoose instance, model, or models object');
  }

  const inp: any = input as any;

  if ((inp as Mongoose).models) {
    models = (inp as Mongoose).models as Record<string, Model<any>>;
  } else if ((inp as Model<any>).modelName && (inp as Model<any>).schema) {
    const m = inp as Model<any>;
    models = { [m.modelName]: m };
  } else if (Array.isArray(inp)) {
    inp.forEach((model: Model<any>) => {
      if ((model as any).modelName) {
        models[(model as any).modelName] = model;
      }
    });
  } else if (typeof inp === 'object') {
    models = inp as Record<string, Model<any>>;
  } else {
    throw new Error('Invalid input type - expected mongoose instance, model, or models object');
  }

  const opts: Required<Pick<ExtractOptions, 'format' | 'include' | 'exclude' | 'depth'>> = {
    format: 'json',
    include: ['defaults', 'validators', 'timestamps', 'virtuals', 'indexes'],
    exclude: [],
    depth: 10,
    ...options
  } as any;

  const includeFlags = {
    includeId: opts.include.includes('id') || !opts.exclude.includes('id'),
    includeTimestamps: opts.include.includes('timestamps') && !opts.exclude.includes('timestamps'),
    includeVirtuals: opts.include.includes('virtuals') && !opts.exclude.includes('virtuals'),
    includeIndexes: opts.include.includes('indexes') && !opts.exclude.includes('indexes'),
    includeValidators: opts.include.includes('validators') && !opts.exclude.includes('validators'),
    includeDefaults: opts.include.includes('defaults') && !opts.exclude.includes('defaults'),
    depth: opts.depth
  };

  const schemas: ExtractedSchemas = {};
  const visited = new WeakSet();

  for (const [modelName, model] of Object.entries(models)) {
    if (!(model as any).schema) {
      continue;
    }
    schemas[modelName] = extractCompleteMongooseSchema(model as any, includeFlags as any, visited);
  }

  if (!opts.format || opts.format === 'raw') {
    return schemas;
  }

  return formatSchemas(schemas, opts.format as Exclude<FormatterName, null>);
}

function formatSchemas(schemas: ExtractedSchemas, format: Exclude<FormatterName, null>): any {
  const formatters: Record<string, (s: ExtractedSchemas) => any> = {
    'json': formatJSON,
    'compact': formatCompact,
    'llm-compact': formatCompact,
    'human': formatHuman,
    'typescript': formatTypeScript,
    'graphql': formatGraphQL
  };

  const formatter = formatters[String(format).toLowerCase()] || formatters.json;
  return formatter(schemas);
}

export function extractRelationships(input: Mongoose | Model<any> | Model<any>[] | Record<string, Model<any>>): Record<string, any[]> {
  const schemas = extractSchemas(input, { format: null }) as ExtractedSchemas;
  const relationships: Record<string, any[]> = {};

  for (const [modelName, fields] of Object.entries(schemas)) {
    const rels: any[] = [];

    for (const [fieldName, fieldInfo] of Object.entries(fields)) {
      if ((fieldInfo as any).ref) {
        rels.push({
          field: fieldName,
          type: 'reference',
          target: (fieldInfo as any).ref,
          required: (fieldInfo as any).required || false
        });
      }

      if ((fieldInfo as any).type === 'Array' && (fieldInfo as any).items?.ref) {
        rels.push({
          field: fieldName,
          type: 'array-reference',
          target: (fieldInfo as any).items.ref,
          required: (fieldInfo as any).required || false
        });
      }

      if ((fieldInfo as any).properties) {
        for (const [nestedField, nestedInfo] of Object.entries((fieldInfo as any).properties)) {
          if ((nestedInfo as any).ref) {
            rels.push({
              field: `${fieldName}.${nestedField}`,
              type: 'nested-reference',
              target: (nestedInfo as any).ref,
              required: (nestedInfo as any).required || false
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

export const formatters = {
  formatJSON,
  formatCompact,
  formatHuman,
  formatTypeScript,
  formatGraphQL
};


