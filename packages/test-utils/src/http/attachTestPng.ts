import type { Test } from 'supertest';

/** PNG 1x1 válido para uploads multipart em testes */
export const TEST_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

export function attachTestPng(agent: Test, fieldName = 'image'): Test {
  return agent.attach(fieldName, TEST_PNG_BUFFER, {
    filename: 'test.png',
    contentType: 'image/png',
  });
}
