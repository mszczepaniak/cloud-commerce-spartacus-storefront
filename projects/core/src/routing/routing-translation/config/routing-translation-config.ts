import { RoutingLanguagesTranslations } from '../routes-translations/routes-translations';

export abstract class RoutingTranslationConfig {
  routingTranslation?: {
    translations?: RoutingLanguagesTranslations;
    fetch?: boolean;
  };
}
