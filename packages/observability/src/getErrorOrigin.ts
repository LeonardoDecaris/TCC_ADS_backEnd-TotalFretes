export type ErrorOrigin = {
  file: string;
  line?: number;
};

const STACK_FRAME =
  /^\s*at\s+(?:.*\s+)?\(?(.+?):(\d+):\d+\)?$/;

function normalizeFilePath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const srcIndex = normalized.indexOf('/src/');
  if (srcIndex >= 0) {
    return normalized.slice(srcIndex + 1);
  }
  if (normalized.startsWith('src/')) {
    return normalized;
  }
  const parts = normalized.split('/');
  return parts.slice(-3).join('/');
}

export function getErrorOrigin(error: unknown): ErrorOrigin | undefined {
  if (!(error instanceof Error) || !error.stack) {
    return undefined;
  }

  const lines = error.stack.split('\n').map((line) => line.trim());

  for (const line of lines) {
    if (!line.startsWith('at ') || line.includes('node_modules')) {
      continue;
    }

    const match = line.match(STACK_FRAME);
    if (!match) {
      continue;
    }

    const filePath = match[1];
    if (!filePath.includes('/src/') && !filePath.includes('\\src\\') && !filePath.endsWith('.ts')) {
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

export function originFields(error?: unknown): Partial<ErrorOrigin> {
  const origin = error ? getErrorOrigin(error) : undefined;
  if (!origin) {
    return {};
  }
  return {
    file: origin.file,
    ...(origin.line !== undefined ? { line: origin.line } : {}),
  };
}
