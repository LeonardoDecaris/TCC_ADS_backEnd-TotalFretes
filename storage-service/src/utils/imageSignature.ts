import fs from 'fs';

function startsWith(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) return false;
  return signature.every((byte, idx) => buffer[idx] === byte);
}

function isPng(buffer: Buffer): boolean {
  return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

function isJpeg(buffer: Buffer): boolean {
  return startsWith(buffer, [0xff, 0xd8, 0xff]);
}

function isGif(buffer: Buffer): boolean {
  return startsWith(buffer, [0x47, 0x49, 0x46, 0x38]);
}

function isWebp(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const riff = startsWith(buffer, [0x52, 0x49, 0x46, 0x46]); // RIFF
  const webp = buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  return riff && webp;
}

export function isValidImageSignature(buffer: Buffer): boolean {
  return isPng(buffer) || isJpeg(buffer) || isGif(buffer) || isWebp(buffer);
}

export function readFileHeader(filePath: string, bytes = 16): Buffer {
  const fd = fs.openSync(filePath, 'r');
  try {
    const header = Buffer.allocUnsafe(bytes);
    const size = fs.readSync(fd, header, 0, bytes, 0);
    return header.subarray(0, size);
  } finally {
    fs.closeSync(fd);
  }
}
