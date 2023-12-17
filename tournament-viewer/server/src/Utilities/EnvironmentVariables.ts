export namespace EnvironmentVariables {
  export const PORT = process.env.PORT ?? 3000;
  export const IS_DEVELOPMENT = (process.env.IS_DEVELOPMENT ?? 'yes') === 'yes';
}