/**
 * Central constants to avoid magic strings
 */

export const MONGOOSE_TYPES = {
  STRING: 'String',
  NUMBER: 'Number',
  DATE: 'Date',
  BOOLEAN: 'Boolean',
  OBJECT_ID: 'ObjectId',
  OBJECT_ID_LEGACY: 'ObjectID',
  DECIMAL128: 'Decimal128',
  BUFFER: 'Buffer',
  MIXED: 'Mixed',
  ARRAY: 'Array',
  EMBEDDED: 'Embedded',
  DOCUMENT: 'Document',
  MAP: 'Map',
  VIRTUAL: 'Virtual'
} as const;

export const TYPESCRIPT_TYPE_MAP: Record<string, string> = {
  [MONGOOSE_TYPES.STRING]: 'string',
  [MONGOOSE_TYPES.NUMBER]: 'number',
  [MONGOOSE_TYPES.BOOLEAN]: 'boolean',
  [MONGOOSE_TYPES.DATE]: 'Date',
  [MONGOOSE_TYPES.OBJECT_ID]: 'string',
  [MONGOOSE_TYPES.DECIMAL128]: 'Decimal',
  [MONGOOSE_TYPES.BUFFER]: 'Buffer',
  [MONGOOSE_TYPES.MIXED]: 'any',
  [MONGOOSE_TYPES.VIRTUAL]: 'any'
};

export const GRAPHQL_TYPE_MAP: Record<string, string> = {
  [MONGOOSE_TYPES.STRING]: 'String',
  [MONGOOSE_TYPES.NUMBER]: 'Float',
  [MONGOOSE_TYPES.BOOLEAN]: 'Boolean',
  [MONGOOSE_TYPES.DATE]: 'DateTime',
  [MONGOOSE_TYPES.OBJECT_ID]: 'ID',
  [MONGOOSE_TYPES.DECIMAL128]: 'Decimal',
  [MONGOOSE_TYPES.BUFFER]: 'String',
  [MONGOOSE_TYPES.MIXED]: 'JSON',
  [MONGOOSE_TYPES.VIRTUAL]: 'String'
};


