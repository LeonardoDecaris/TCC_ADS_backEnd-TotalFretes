export type ErrorOrigin = {
  file: string;
  line?: number;
};

const STACK_FRAME = /^\s*at\s+(?:.*\s+)?\(?(.+?):(\d+):\d+\)?$/;

function normalizeFilePath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const srcIndex = normalized.indexOf('/src/');
  if (srcIndex >= 0) return normalized.slice(srcIndex + 1);
  if (normalized.startsWith('src/')) return normalized;

  const distIndex = normalized.indexOf('/dist/');
  if (distIndex >= 0) return normalized.slice(distIndex + 1);

  return normalized.split('/').slice(-3).join('/');
}

export function getErrorOrigin(error: unknown): ErrorOrigin | undefined {
  if (!(error instanceof Error) || !error.stack) return undefined;

  for (const line of error.stack.split('\n').map((value) => value.trim())) {
    if (!line.startsWith('at ') || line.includes('node_modules')) continue;

    const match = line.match(STACK_FRAME);
    if (!match) continue;

    const filePath = match[1];
    if (
      !filePath.includes('/src/') &&
      !filePath.includes('\\src\\') &&
      !filePath.includes('/dist/') &&
      !filePath.includes('\\dist\\') &&
      !filePath.endsWith('.ts') &&
      !filePath.endsWith('.js')
    ) {
      continue;
    }

    const lineNumber = Number(match[2]);
    return {
      file: normalizeFilePath(filePath),
      line: Number.isFinite(lineNumber) ? lineNumber : undefined,
    };
  }

  return undefined;
}
