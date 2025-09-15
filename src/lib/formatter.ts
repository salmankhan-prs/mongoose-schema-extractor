
import { GRAPHQL_TYPE_MAP, MONGOOSE_TYPES, TYPESCRIPT_TYPE_MAP } from './constants';

export function formatJSON(schemas: Record<string, any>) {
  return schemas;
}

export function formatCompact(schemas: Record<string, any>) {
  const lines: string[] = [];
  
  for (const [modelName, fields] of Object.entries(schemas)) {
    lines.push(`**${modelName}**`);
    
    // Group nested fields
    const nestedGroups: Record<string, any[]> = {};
    const regularFields: Record<string, any> = {};
    
    for (const [fieldName, fieldInfo] of Object.entries<any>(fields)) {
      if (fieldName.includes('.')) {
        const [parentField, ...childParts] = fieldName.split('.');
        const childField = childParts.join('.');
        if (!nestedGroups[parentField]) nestedGroups[parentField] = [];
        nestedGroups[parentField].push({ name: childField, info: fieldInfo });
      } else {
        regularFields[fieldName] = fieldInfo;
      }
    }
    
    // Process regular fields first
    for (const [fieldName, fieldInfo] of Object.entries<any>(regularFields)) {
      const field = fieldInfo as any;
      let line = `- ${fieldName}`;
      
      // Type information
      let typeStr = field.type;
      if (field.type === MONGOOSE_TYPES.ARRAY && field.items) {
        const itemType = field.items.ref ? `ObjectId, ref: ${field.items.ref}` : field.items.type;
        typeStr = `Array of ${itemType}`;
      } else if (field.ref) {
        typeStr = `ObjectId, ref: ${field.ref}`;
      }
      line += ` (${typeStr}`;
      
      // Validation and constraints
      const constraints: string[] = [];
      if (field.required) constraints.push('required');
      if (field.unique) constraints.push('unique');
      if (field.indexed) constraints.push('indexed');
      if (field.lowercase) constraints.push('lowercase');
      if (field.uppercase) constraints.push('uppercase');
      if (field.trim) constraints.push('trim');
      
      // Length constraints
      if (field.minLength !== undefined && field.maxLength !== undefined) {
        constraints.push(`${field.minLength}-${field.maxLength} chars`);
      } else if (field.minLength !== undefined) {
        constraints.push(`min ${field.minLength} chars`);
      } else if (field.maxLength !== undefined) {
        constraints.push(`max ${field.maxLength} chars`);
      }
      
      // Numeric constraints
      if (field.min !== undefined && field.max !== undefined) {
        constraints.push(`range: ${field.min}-${field.max}`);
      } else if (field.min !== undefined) {
        constraints.push(`min: ${field.min}`);
      } else if (field.max !== undefined) {
        constraints.push(`max: ${field.max}`);
      }
      
      // Pattern validation
      if (field.pattern) {
        // Clean up regex formatting
        const pattern = String(field.pattern).replace(/\\(.)/g, '$1');
        constraints.push(`pattern: ${pattern}`);
      }
      
      // Enum values
      if (field.enum && Array.isArray(field.enum)) {
        constraints.push(`enum: [${field.enum.join(', ')}]`);
      }
      
      // Additional Mongoose properties
      if (field.sparse) constraints.push('sparse');
      if (field.immutable) constraints.push('immutable');
      if (field.select === false) constraints.push('not selected');
      if (field.auto) constraints.push('auto-generated');
      
      // Add constraints to line
      if (constraints.length > 0) {
        line += `, ${constraints.join(', ')}`;
      }
      
      // Default value  
      if (field.defaultValue !== undefined) {
        let defaultStr;
        if (typeof field.defaultValue === 'string' && field.defaultValue.startsWith('[Function')) {
          defaultStr = field.defaultValue; // Keep function notation as-is
        } else if (typeof field.defaultValue === 'string') {
          defaultStr = field.defaultValue;
        } else {
          defaultStr = JSON.stringify(field.defaultValue);
        }
        line += `, default: ${defaultStr}`;
      }
      
      line += ')';
      lines.push(line);
      
      // Handle nested objects
      if (field.type === 'Object' && field.properties && !field.circular) {
        for (const [nestedName, nestedInfo] of Object.entries<any>(field.properties)) {
          const nested = nestedInfo as any;
          let nestedLine = `  - ${nestedName} (${nested.type}`;
          
          const nestedConstraints: string[] = [];
          if (nested.required) nestedConstraints.push('required');
          if (nested.maxLength) nestedConstraints.push(`max ${nested.maxLength} chars`);
          if (nested.minLength) nestedConstraints.push(`min ${nested.minLength} chars`);
          if (nested.enum) nestedConstraints.push(`enum: [${nested.enum.join(', ')}]`);
          
          if (nestedConstraints.length > 0) {
            nestedLine += `, ${nestedConstraints.join(', ')}`;
          }
          
          if (nested.defaultValue !== undefined) {
            nestedLine += `, default: ${JSON.stringify(nested.defaultValue)}`;
          }
          
          nestedLine += ')';
          lines.push(nestedLine);
        }
      }
      
      // Handle array of objects
      if (field.type === MONGOOSE_TYPES.ARRAY && field.items?.type === 'Object' && field.items.properties) {
        lines.push(`  Array contains:`);
        for (const [nestedName, nestedInfo] of Object.entries<any>(field.items.properties)) {
          const nested = nestedInfo as any;
          let nestedLine = `    - ${nestedName} (${nested.type}`;
          
          const nestedConstraints: string[] = [];
          if (nested.required) nestedConstraints.push('required');
          if (nested.ref) nestedConstraints.push(`ref: ${nested.ref}`);
          
          if (nestedConstraints.length > 0) {
            nestedLine += `, ${nestedConstraints.join(', ')}`;
          }
          
          nestedLine += ')';
          lines.push(nestedLine);
        }
      }
    }
    
    // Process nested field groups
    for (const [parentField, children] of Object.entries(nestedGroups)) {
      lines.push(`- ${parentField} (Object)`);
      for (const child of children) {
        const field = child.info;
        let childLine = `  - ${child.name} (${field.type}`;
        
        const constraints: string[] = [];
        if (field.required) constraints.push('required');
        if (field.unique) constraints.push('unique');
        if (field.ref) constraints.push(`ref: ${field.ref}`);
        if (field.enum) constraints.push(`enum: [${field.enum.join(', ')}]`);
        
        if (constraints.length > 0) {
          childLine += `, ${constraints.join(', ')}`;
        }
        
        if (field.defaultValue !== undefined) {
          childLine += `, default: ${JSON.stringify(field.defaultValue)}`;
        }
        
        childLine += ')';
        lines.push(childLine);
      }
    }
    
    lines.push(''); // Empty line between models
  }
  
  return lines.join('\n').trim();
}

export function formatHuman(schemas: Record<string, any>) {
  let output = '';
  for (const [modelName, fields] of Object.entries(schemas)) {
    output += `📋 ${modelName} Model\n`;
    output += '-'.repeat(40) + '\n';
    for (const [fieldName, fieldInfo] of Object.entries<any>(fields)) {
      output += `  ${fieldName}:\n`;
      output += `    Type: ${(fieldInfo as any).type}\n`;
      if ((fieldInfo as any).required) output += `    Required: Yes\n`;
      if ((fieldInfo as any).unique) output += `    Unique: Yes\n`;
      if ((fieldInfo as any).ref) output += `    References: ${(fieldInfo as any).ref}\n`;
      if ((fieldInfo as any).enum) output += `    Allowed Values: ${(fieldInfo as any).enum.join(', ')}\n`;
      if ((fieldInfo as any).min !== undefined || (fieldInfo as any).max !== undefined) {
        output += `    Range: ${(fieldInfo as any).min || 'N/A'} - ${(fieldInfo as any).max || 'N/A'}\n`;
      }
      if ((fieldInfo as any).minLength || (fieldInfo as any).maxLength) {
        output += `    Length: ${(fieldInfo as any).minLength || 0} - ${(fieldInfo as any).maxLength || 'unlimited'}\n`;
      }
      if ((fieldInfo as any).defaultValue !== undefined) {
        output += `    Default: ${JSON.stringify((fieldInfo as any).defaultValue)}\n`;
      }
      if ((fieldInfo as any).properties) {
        output += `    Nested Fields: ${Object.keys((fieldInfo as any).properties).join(', ')}\n`;
      }
      if ((fieldInfo as any).circular) output += `    ⚠️  Circular Reference Detected\n`;
      output += '\n';
    }
    output += '\n';
  }
  return output;
}

export function formatTypeScript(schemas: Record<string, any>) {
  let output = '';
  for (const [modelName, fields] of Object.entries(schemas)) {
    output += `export interface I${modelName} {\n`;
    for (const [fieldName, fieldInfo] of Object.entries<any>(fields)) {
      const required = (fieldInfo as any).required ? '' : '?';
      let tsType = mapToTypeScriptType(fieldInfo as any);
      output += `  ${fieldName}${required}: ${tsType};\n`;
    }
    output += '}\n\n';
  }
  return output;
}

export function formatGraphQL(schemas: Record<string, any>) {
  let output = '';
  for (const [modelName, fields] of Object.entries(schemas)) {
    output += `type ${modelName} {\n`;
    for (const [fieldName, fieldInfo] of Object.entries<any>(fields)) {
      const required = (fieldInfo as any).required ? '!' : '';
      let gqlType = mapToGraphQLType(fieldInfo as any);
      output += `  ${fieldName}: ${gqlType}${required}\n`;
    }
    output += '}\n\n';
  }
  return output;
}

function mapToTypeScriptType(fieldInfo: any): string {
  let tsType = TYPESCRIPT_TYPE_MAP[(fieldInfo as any).type] || 'any';
  if ((fieldInfo as any).enum) {
    tsType = (fieldInfo as any).enum.map((v: any) => `'${v}'`).join(' | ');
  }
  if ((fieldInfo as any).type === MONGOOSE_TYPES.ARRAY) {
    const itemType = (fieldInfo as any).items ? mapToTypeScriptType((fieldInfo as any).items) : 'any';
    tsType = `${itemType}[]`;
  }
  if ((fieldInfo as any).type === 'Object' && (fieldInfo as any).properties) {
    if ((fieldInfo as any).circular) {
      tsType = 'any /* circular reference */';
    } else {
      const props: string[] = [];
      for (const [prop, propInfo] of Object.entries<any>((fieldInfo as any).properties)) {
        const required = (propInfo as any).required ? '' : '?';
        props.push(`${prop}${required}: ${mapToTypeScriptType(propInfo as any)}`);
      }
      tsType = `{ ${props.join('; ')} }`;
    }
  }
  if ((fieldInfo as any).ref) {
    tsType = `string | I${(fieldInfo as any).ref}`;
  }
  return tsType;
}

function mapToGraphQLType(fieldInfo: any): string {
  let gqlType = GRAPHQL_TYPE_MAP[(fieldInfo as any).type] || 'JSON';
  if ((fieldInfo as any).type === MONGOOSE_TYPES.ARRAY) {
    const itemType = (fieldInfo as any).items ? mapToGraphQLType((fieldInfo as any).items) : 'JSON';
    gqlType = `[${itemType}]`;
  }
  if ((fieldInfo as any).ref) {
    gqlType = (fieldInfo as any).ref;
  }
  if ((fieldInfo as any).circular) {
    gqlType = 'JSON';
  }
  return gqlType;
}


