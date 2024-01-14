
export namespace EnvironmentVariables {
  export const PORT = process.env.PORT ?? 3000;
  export const IS_DEVELOPMENT = (process.env.IS_DEVELOPMENT ?? 'yes') === 'yes';
  export const HOST = process.env.HOST!;
  export const EMAIL_SENDER = process.env.EMAIL_SENDER!;
  export const EMAIL_USERNAME = process.env.EMAIL_USERNAME!;
  export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD!;
  export const ENABLE_EMAIL = process.env.ENABLE_EMAIL !== 'no'
}