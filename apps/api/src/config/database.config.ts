import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const db = process.env.POSTGRES_DB;
  const host = process.env.POSTGRES_HOST;
  const port = parseInt(process.env.POSTGRES_PORT || '5432', 10);

  const url = process.env.DATABASE_URL || `postgresql://${user}:${password}@${host}:${port}/${db}?schema=public`;

  return {
    url,
    user,
    password,
    db,
    host,
    port,
  };
});
