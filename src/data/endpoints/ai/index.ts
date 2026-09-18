import { ApiEndpoint } from '../../../types';
import { aiGenerateEndpoint } from './generate';
import { aiSentimentEndpoint } from './sentiment';
import { aiTranslateEndpoint } from './translate';

export const aiEndpoints: ApiEndpoint[] = [
  aiGenerateEndpoint,
  aiSentimentEndpoint,
  aiTranslateEndpoint
];

export {
  aiGenerateEndpoint,
  aiSentimentEndpoint,
  aiTranslateEndpoint
};
