import { ApiEndpoint } from '../../../types';
import { keysCheckLimitEndpoint } from './checklimit';
import { keysListEndpoint } from './list';
import { keysCreateEndpoint } from './create';

export const keysEndpoints: ApiEndpoint[] = [
  keysCheckLimitEndpoint,
  keysListEndpoint,
  keysCreateEndpoint
];

export {
  keysCheckLimitEndpoint,
  keysListEndpoint,
  keysCreateEndpoint
};
