
import { MONGOOSE_TYPES } from './constants';

type AnySchemaType = any;

export function extractCompleteMongooseSchema(model: any, options: any = {}, visited: WeakSet<object> = new WeakSet()): Record<string, any> {
  const schema = model.schema;

  if (visited.has(schema)) {
    return { type: 'Circular', description: 'Circular reference detected' } as any;
  }
  visited.add(schema);

  const extracted: Record<string, any> = {};

  const allPaths = schema.paths as Record<string, AnySchemaType>;

  for (const [pathName, schemaType] of Object.entries(allPaths)) {
    if (pathName === '_id' && !options.includeId) continue;
    if (pathName === '__v') continue;

    const pathInfo = extractCompletePathInfo(schemaType, pathName, 0, options, visited);
    if (pathInfo) {
      extracted[pathName] = pathInfo;
    }
  }

  if (options.includeVirtuals && schema.virtuals) {
    for (const [virtualName, virtual] of Object.entries(schema.virtuals)) {
      if (virtualName === 'id' && !options.includeId) continue;
      extracted[virtualName] = {
        type: MONGOOSE_TYPES.VIRTUAL,
        computed: true
      };
    }
  }

  if (options.includeTimestamps && schema.options?.timestamps) {
    (extracted as any).createdAt = {
      type: MONGOOSE_TYPES.DATE,
      auto: true
    };
    (extracted as any).updatedAt = {
      type: MONGOOSE_TYPES.DATE,
      auto: true
    };
  }

  return extracted;
}

export function extractCompletePathInfo(schemaType: AnySchemaType, pathName: string, depth: number = 0, options: any = {}, visited: WeakSet<object> = new WeakSet()): Record<string, any> {
  if (depth > (options.depth || 10)) {
    return { type: MONGOOSE_TYPES.MIXED, note: 'Max depth reached' } as any;
  }

  const info: Record<string, any> = {};

  const rawInstance = (schemaType as any).instance;
  const instance = rawInstance === 'ObjectID' ? MONGOOSE_TYPES.OBJECT_ID : rawInstance;

  switch (instance) {
    case MONGOOSE_TYPES.STRING:
      info.type = MONGOOSE_TYPES.STRING;
      if ((schemaType as any).enumValues && (schemaType as any).enumValues.length > 0) {
        info.enum = (schemaType as any).enumValues;
        info.enumCount = (schemaType as any).enumValues.length;
      }
      if ((schemaType as any).options?.minlength) info.minLength = (schemaType as any).options.minlength;
      if ((schemaType as any).options?.maxlength) info.maxLength = (schemaType as any).options.maxlength;
      if ((schemaType as any).options?.match) {
        const match = (schemaType as any).options.match;
        // Handle both regex and [regex, message] formats
        info.pattern = Array.isArray(match) ? String(match[0]) : String(match);
      }
      if ((schemaType as any).options?.lowercase) info.lowercase = true;
      if ((schemaType as any).options?.uppercase) info.uppercase = true;
      if ((schemaType as any).options?.trim) info.trim = true;
      break;

    case MONGOOSE_TYPES.NUMBER:
      info.type = MONGOOSE_TYPES.NUMBER;
      if ((schemaType as any).options?.min !== undefined) info.min = (schemaType as any).options.min;
      if ((schemaType as any).options?.max !== undefined) info.max = (schemaType as any).options.max;
      if ((schemaType as any).enumValues && (schemaType as any).enumValues.length > 0) {
        info.enum = (schemaType as any).enumValues;
      } else if ((schemaType as any).options?.enum) {
        info.enum = (schemaType as any).options.enum;
      }
      break;

    case MONGOOSE_TYPES.DATE:
      info.type = MONGOOSE_TYPES.DATE;
      if ((schemaType as any).options?.min) info.minDate = (schemaType as any).options.min;
      if ((schemaType as any).options?.max) info.maxDate = (schemaType as any).options.max;
      break;

    case MONGOOSE_TYPES.BOOLEAN:
      info.type = MONGOOSE_TYPES.BOOLEAN;
      break;

    case MONGOOSE_TYPES.OBJECT_ID:
      info.type = MONGOOSE_TYPES.OBJECT_ID;
      if ((schemaType as any).options?.ref) {
        info.ref = (schemaType as any).options.ref;
      }
      break;

    case MONGOOSE_TYPES.DECIMAL128:
      info.type = MONGOOSE_TYPES.DECIMAL128;
      break;

    case MONGOOSE_TYPES.BUFFER:
      info.type = MONGOOSE_TYPES.BUFFER;
      break;

    case MONGOOSE_TYPES.MIXED:
      info.type = MONGOOSE_TYPES.MIXED;
      break;

    case MONGOOSE_TYPES.ARRAY:
      info.type = MONGOOSE_TYPES.ARRAY;
      const itemSchemaType = (schemaType as any).caster || (schemaType as any).$embeddedSchemaType;
      if (itemSchemaType) {
        const itemInfo = extractCompletePathInfo(itemSchemaType, '', depth + 1, options, visited);
        info.items = itemInfo;
        if ((itemSchemaType as any).options?.ref) {
          info.items.ref = (itemSchemaType as any).options.ref;
        }
      }
      break;

    case MONGOOSE_TYPES.EMBEDDED:
    case MONGOOSE_TYPES.DOCUMENT:
      info.type = 'Object';
      if ((schemaType as any).schema) {
        if (visited.has((schemaType as any).schema)) {
          (info as any).circular = true;
        } else {
          visited.add((schemaType as any).schema);
          const nestedFields: Record<string, any> = {};
          for (const [nestedPath, nestedType] of Object.entries((schemaType as any).schema.paths)) {
            if (nestedPath === '_id' && !options.includeId) continue;
            if (nestedPath === '__v') continue;
            nestedFields[nestedPath] = extractCompletePathInfo(nestedType as any, nestedPath, depth + 1, options, visited);
          }
          (info as any).properties = nestedFields;
          (info as any).propertyCount = Object.keys(nestedFields).length;
        }
      }
      break;

    case MONGOOSE_TYPES.MAP:
      info.type = MONGOOSE_TYPES.MAP;
      const valueType = (schemaType as any).schemaType || (schemaType as any).$__schemaType;
      if (valueType) {
        (info as any).values = extractCompletePathInfo(valueType, '', depth + 1, options, visited);
      }
      break;

    default:
      info.type = instance || MONGOOSE_TYPES.MIXED;
  }

  if ((schemaType as any).options?.required || (schemaType as any).isRequired) {
    info.required = true;
  }

  if (options.includeDefaults && (schemaType as any).options?.default !== undefined) {
    info.hasDefault = true;
    if (typeof (schemaType as any).options.default !== 'function') {
      info.defaultValue = (schemaType as any).options.default;
    } else {
      const fn = (schemaType as any).options.default;
      info.defaultValue = fn.name ? `[Function ${fn.name}]` : '[Function]';
    }
  }

  if ((schemaType as any).options?.unique) {
    info.unique = true;
  }

  if (options.includeIndexes) {
    if ((schemaType as any).options?.index) {
      info.indexed = (schemaType as any).options.index === true ? true : (schemaType as any).options.index;
    }
    if ((schemaType as any).options?.sparse) info.sparse = true;
  }

  if ((schemaType as any).options?.select !== undefined) {
    info.select = (schemaType as any).options.select;
  }

  if ((schemaType as any).options?.immutable) {
    info.immutable = true;
  }

  if (options.includeValidators && (schemaType as any).validators && (schemaType as any).validators.length > 0) {
    info.hasValidators = true;
    info.validatorCount = (schemaType as any).validators.length;
    info.validators = (schemaType as any).validators.map((v: any) => ({
      type: v.type,
      message: v.message || 'Validation failed',
      validator: v.validator ? '[Function]' : undefined
    }));
  }

  return info;
}


