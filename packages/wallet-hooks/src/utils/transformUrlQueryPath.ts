export function transformUrlQueryPath(query: Record<string, any>, transformedInto: 'base64') {
  return Buffer.from(JSON.stringify(query)).toString(transformedInto);
}
