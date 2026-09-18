import { ApiEndpoint } from '../../types';
import { systemEndpoints } from './system';
import { aiEndpoints } from './ai';
import { toolsEndpoints } from './tools';
import { keysEndpoints } from './keys';
import { dataEndpoints } from './data';

export const BUILTIN_ENDPOINTS: ApiEndpoint[] = [
  ...systemEndpoints,
  ...aiEndpoints,
  ...toolsEndpoints,
  ...keysEndpoints,
  ...dataEndpoints
];

export {
  systemEndpoints,
  aiEndpoints,
  toolsEndpoints,
  keysEndpoints,
  dataEndpoints
};
