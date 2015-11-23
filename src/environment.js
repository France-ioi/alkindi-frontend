
export function lookup (g, variable) {
  return g.get('environment').get(variable);
}
