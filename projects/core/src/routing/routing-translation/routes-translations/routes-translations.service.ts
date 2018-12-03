import { Injectable } from '@angular/core';
import { Routes, Router, Route } from '@angular/router';
import { ServerConfig } from '../../../config/server-config/server-config';
import { RoutesTranslationsLoader } from './routes-translations-loader';
import {
  RoutesTranslations,
  RouteTranslation,
  RoutingLanguagesTranslations
} from './routes-translations';

type ConfigurableRouteKey = 'cxPath' | 'cxRedirectTo';

@Injectable()
export class RoutesTranslationsService {
  constructor(
    private readonly config: ServerConfig,
    private readonly loader: RoutesTranslationsLoader
  ) {}

  private readonly DEFAULT_LANGUAGE_CODE = 'default';

  private currentLanguageCode: string = this.DEFAULT_LANGUAGE_CODE;

  private get translations() {
    return this.loader.translations;
  }

  get currentRoutesTranslations(): RoutesTranslations {
    return this.translations[this.currentLanguageCode] as RoutesTranslations;
  }

  changeLanguage(languageCode: string) {
    if (this.translations[languageCode] === undefined) {
      this.warn(
        `There are no translations in routes config for language code '${languageCode}'.`,
        `The default routes translations will be used instead: `,
        this.translations.default
      );
      this.currentLanguageCode = this.DEFAULT_LANGUAGE_CODE;
    } else {
      this.currentLanguageCode = languageCode;
    }
  }

  getNestedRoutesTranslations(
    nestedRouteNames: string[],
    routesTranslations: RoutesTranslations = this.currentRoutesTranslations
  ): RouteTranslation[] {
    return this.getNestedRoutesTranslationsRecursive(
      nestedRouteNames,
      routesTranslations,
      []
    );
  }

  private getNestedRoutesTranslationsRecursive(
    nestedRoutesNames: string[],
    routesTranslations: RoutesTranslations,
    accResult: RouteTranslation[]
  ): RouteTranslation[] {
    if (!nestedRoutesNames.length) {
      return accResult;
    }
    const [routeName, ...remainingRouteNames] = nestedRoutesNames;
    const translation = this.getRouteTranslation(routeName, routesTranslations);
    if (!translation) {
      return null;
    }

    if (remainingRouteNames.length) {
      const childrenTranslations = this.getChildrenRoutesTranslations(
        routeName,
        routesTranslations
      );
      if (!childrenTranslations) {
        this.warn(
          `No children routes translations were configured for page '${routeName}' in language '${
            this.currentLanguageCode
          }'!`
        );
        return null;
      }

      return this.getNestedRoutesTranslationsRecursive(
        remainingRouteNames,
        childrenTranslations,
        accResult.concat(translation)
      );
    }
    return accResult.concat(translation);
  }

  getChildrenRoutesTranslations(
    routeName: string,
    routesTranslations: RoutesTranslations
  ): RoutesTranslations {
    const routeTranslation = this.getRouteTranslation(
      routeName,
      routesTranslations
    );
    return routeTranslation && routeTranslation.children;
  }

  getRouteTranslation(
    routeName: string,
    routesTranslations: RoutesTranslations
  ): RouteTranslation {
    const result = routesTranslations && routesTranslations[routeName];
    if (!routesTranslations || result === undefined) {
      this.warn(
        `No route translation was configured for page '${routeName}' in language '${
          this.currentLanguageCode
        }'!`
      );
    }
    return result;
  }

  private warn(...args) {
    if (!this.config.production) {
      console.warn(...args);
    }
  }
}
