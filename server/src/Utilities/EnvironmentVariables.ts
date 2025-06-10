
export namespace EnvironmentVariables {
  export const PORT = process.env.PORT ?? 3000;
  export const IS_DEVELOPMENT = (process.env.IS_DEVELOPMENT ?? 'yes') === 'yes';
  export const HOST = process.env.HOST!;
  export const EMAIL_SENDER = process.env.EMAIL_SENDER!;
  export const EMAIL_USERNAME = process.env.EMAIL_USERNAME!;
  export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD!;
  export const ENABLE_EMAIL = process.env.ENABLE_EMAIL !== 'no';
  export const ENABLE_PSQL = process.env.ENABLE_PSQL !== 'no';
  export const PSQL_USERNAME = process.env.PSQL_USERNAME;
  export const PSQL_PASSWORD = process.env.PSQL_PASSWORD;
  export const PSQL_DATABASE = process.env.PSQL_DATABASE ?? 'kgpb';
  export const JSON_DB_PATH = process.env.JSON_DB_PATH ?? './database.json'
  export const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID ?? ''
  export const OIDC_CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET ?? ''
  export const OIDC_AUTHORITY = process.env.OIDC_AUTHORITY ?? ''
  export const OIDC_BASE_URL = process.env.OIDC_RETURN_URL ?? 'http://localhost:3000'
} 