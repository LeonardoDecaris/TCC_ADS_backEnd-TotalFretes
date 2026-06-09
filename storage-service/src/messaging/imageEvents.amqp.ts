export type ImageEventsAmqpConfig = {
  uri: string;
  exchange: string;
  routingKeyPrefix: string;
};

export function imageEventsAmqpConfig(): ImageEventsAmqpConfig {
  return {
    uri: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672',
    exchange: process.env.STORAGE_EVENTS_EXCHANGE ?? 'storage.events',
    routingKeyPrefix: process.env.STORAGE_EVENTS_ROUTING_KEY_PREFIX ?? 'storage.image',
  };
}

export function eventRoutingKey(eventType: string): string {
  const normalized = eventType
    .replace(/([a-z0-9])([A-Z])/g, '$1.$2')
    .replace(/[^a-zA-Z0-9.]/g, '.')
    .toLowerCase();
  return `${imageEventsAmqpConfig().routingKeyPrefix}.${normalized}`;
}
