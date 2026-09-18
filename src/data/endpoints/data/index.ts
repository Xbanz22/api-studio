import { ApiEndpoint } from '../../../types';
import { dataUsersListEndpoint } from './usersList';
import { dataUsersCreateEndpoint } from './usersCreate';
import { dataUsersGetIdEndpoint } from './usersGetId';
import { dataUsersUpdateEndpoint } from './usersUpdate';
import { dataUsersDeleteEndpoint } from './usersDelete';
import { productsEndpoint } from './products';
import { weatherEndpoint } from './weather';
import { currencyEndpoint } from './currency';

export const dataEndpoints: ApiEndpoint[] = [
  dataUsersListEndpoint,
  dataUsersCreateEndpoint,
  dataUsersGetIdEndpoint,
  dataUsersUpdateEndpoint,
  dataUsersDeleteEndpoint,
  productsEndpoint,
  weatherEndpoint,
  currencyEndpoint
];

export {
  dataUsersListEndpoint,
  dataUsersCreateEndpoint,
  dataUsersGetIdEndpoint,
  dataUsersUpdateEndpoint,
  dataUsersDeleteEndpoint,
  productsEndpoint,
  weatherEndpoint,
  currencyEndpoint
};
