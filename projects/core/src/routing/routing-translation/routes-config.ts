import { StorefrontRoutesTranslations } from './config/storefront-routes-translations';

export interface RoutesConfig {
  translations: RoutingLanguagesTranslations;
  fetch: boolean;
}

export interface RoutingLanguagesTranslations {
  default?: RoutesTranslations | StorefrontRoutesTranslations;
  [languageCode: string]: RoutesTranslations | StorefrontRoutesTranslations;
}

export interface RoutesTranslations {
  [routeName: string]: RouteTranslation; // allows User's custom pages
}

export interface RouteTranslation {
  paths?: string[];
  paramsMapping?: ParamsMapping;
  children?: RoutesTranslations;
}

export interface ParamsMapping {
  [paramName: string]: string;
}
