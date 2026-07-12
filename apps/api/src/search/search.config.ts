import { registerAs } from '@nestjs/config';

const booleanValue = (value: string | undefined, fallback: boolean) =>
  value === undefined ? fallback : value.toLowerCase() === 'true';

export default registerAs('search', () => ({
  enabled: booleanValue(process.env.ELASTICSEARCH_ENABLED, false),
  node: process.env.ELASTICSEARCH_NODE ?? 'http://localhost:9200',
  username: process.env.ELASTICSEARCH_USERNAME,
  password: process.env.ELASTICSEARCH_PASSWORD,
  apiKey: process.env.ELASTICSEARCH_API_KEY,
  indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX ?? 'ecommerce',
  requestTimeout: Number(process.env.ELASTICSEARCH_REQUEST_TIMEOUT_MS ?? 700),
  maxRetries: Number(process.env.ELASTICSEARCH_MAX_RETRIES ?? 1),
  replicas: Number(process.env.ELASTICSEARCH_REPLICAS ?? 0),
}));
