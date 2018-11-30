import { RoutingLanguagesTranslations } from '../routes-config';

export abstract class RoutingTranslationConfig {
  routingTranslation?: {
    translations?: RoutingLanguagesTranslations;
    fetch?: boolean;
  };
}
