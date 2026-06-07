import { buildEmailAmqpUri, emailAmqpConfig } from '../../src/messaging/email.amqp';

describe('emailAmqpConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('retorna defaults de exchange, queue e routing key', () => {
    delete process.env.EMAIL_EVENTS_EXCHANGE;
    delete process.env.EMAIL_SEND_QUEUE;

    const config = emailAmqpConfig();
    expect(config.exchange).toBe('email.events');
    expect(config.queue).toBe('email.send');
    expect(config.routingKey).toBe('email.send.password_reset');
  });
});

describe('buildEmailAmqpUri', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('adiciona heartbeat quando ausente na URL', () => {
    process.env.RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
    const uri = buildEmailAmqpUri();
    expect(uri).toContain('heartbeat=60');
  });

  it('lança erro quando RABBITMQ_URL não está definida', () => {
    delete process.env.RABBITMQ_URL;
    expect(() => buildEmailAmqpUri()).toThrow('RABBITMQ_URL is not defined.');
  });
});
