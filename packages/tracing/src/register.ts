import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

function buildTraceExporter(): OTLPTraceExporter {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) {
    return new OTLPTraceExporter();
  }

  const normalized = endpoint.replace(/\/$/, '');
  const tracesUrl = normalized.endsWith('/v1/traces')
    ? normalized
    : `${normalized}/v1/traces`;

  return new OTLPTraceExporter({ url: tracesUrl });
}

function getEnabledInstrumentations(): string[] {
  const raw = process.env.OTEL_NODE_ENABLED_INSTRUMENTATIONS;
  if (!raw) {
    return ['http', 'express'];
  }
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
}

function startTracing(): void {
  if (process.env.OTEL_TRACES_EXPORTER !== 'otlp') {
    return;
  }

  const serviceName = process.env.OTEL_SERVICE_NAME ?? 'unknown-service';
  const enabled = new Set(getEnabledInstrumentations());

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      'deployment.environment': process.env.NODE_ENV ?? 'development',
    }),
    traceExporter: buildTraceExporter(),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-http': { enabled: enabled.has('http') },
        '@opentelemetry/instrumentation-express': { enabled: enabled.has('express') },
      }),
    ],
  });

  sdk.start();

  const shutdown = () => {
    sdk.shutdown().catch(() => undefined);
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

startTracing();
