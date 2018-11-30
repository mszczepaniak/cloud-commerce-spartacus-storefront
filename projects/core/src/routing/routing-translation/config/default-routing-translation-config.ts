import { RoutingTranslationConfig } from './routing-translation-config';
import { defaultStorefrontRoutesTranslations } from './default-storefront-routes-translations';

export const defaultRoutingTranslationConfig: RoutingTranslationConfig = {
  routingTranslation: {
    translations: defaultStorefrontRoutesTranslations,
    fetch: false
  }
};
