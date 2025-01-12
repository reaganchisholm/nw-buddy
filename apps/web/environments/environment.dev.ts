import { Environment, env, getEnvDataDeployUrl, getEnvModelsUrl } from './env'

export const environment: Environment = {
  ...env,
  production: false,
  standalone: false,
  environment: 'DEV',
  modelsUrl: getEnvModelsUrl(env),
  nwDataUrl: getEnvDataDeployUrl(env),
  //nwDataUrl: getEnvDataCdnUrl(env),
}
