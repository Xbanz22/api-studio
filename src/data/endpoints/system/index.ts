import { ApiEndpoint } from '../../../types';
import { systemStatusEndpoint } from './status';
import { systemOpenapiEndpoint } from './openapi';

export const systemEndpoints: ApiEndpoint[] = [
  systemStatusEndpoint,
  systemOpenapiEndpoint
];

export {
  systemStatusEndpoint,
  systemOpenapiEndpoint
};
