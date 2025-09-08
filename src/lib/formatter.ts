
import { GRAPHQL_TYPE_MAP, MONGOOSE_TYPES, TYPESCRIPT_TYPE_MAP } from './constants';

export function formatJSON(schemas: Record<string, any>) {
  return schemas;
}

export function formatCompact(schemas: Record<string, any>) {
  const lines: string[] = [];
  for (const [modelName, fields] of Object.entries(schemas)) {
    const fieldStrs: string[] = [];
    for (const [fieldName, fieldInfo] of Object.entries<any>(fields)) {
      let fieldStr = `${fieldName}:${(fieldInfo as any).type}`;
      if ((fieldInfo as any).ref) {
        fieldStr += `->${(fieldInfo as any).ref}`;
      }
      if ((fieldInfo as any).type === MONGOOSE_TYPES.ARRAY && (fieldInfo as any).items) {
        const itemType = (fieldInfo as any).items.ref || (fieldInfo as any).items.type;
        fieldStr = `${fieldName}:[${itemType}]`;
      }
      const mods: string[] = [];
      if ((fieldInfo as any).required) mods.push('required');
      if ((fieldInfo as any).unique) mods.push('unique');
      if ((fieldInfo as any).indexed) mods.push('indexed');
      if ((fieldInfo as any).enum) mods.push(`enum:[${(fieldInfo as any).enum.join('|')}]`);
      if (mods.length > 0) fieldStr += `(${mods.join(',')})`;
      fieldStrs.push(fieldStr);
    }
    lines.push(`${modelName}(${fieldStrs.join(',')})`);
  }
  return lines.join('\n');
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


