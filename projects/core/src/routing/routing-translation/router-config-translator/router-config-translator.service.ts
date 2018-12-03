import { Injectable } from '@angular/core';
import { Routes, Router, Route } from '@angular/router';
import { ServerConfig } from '../../../config/server-config/server-config';
import { RoutingTranslationLoader } from './routing-translation-loader';
import {
  RoutesTranslations,
  RouteTranslation,
  RoutingLanguagesTranslations
} from '../routes-translations/routes-translations';
import { RoutesTranslationsService } from '../routes-translations/routes-translations.service';

type ConfigurableRouteKey = 'cxPath' | 'cxRedirectTo';

@Injectable()
export class RouterConfigTranslator {
  constructor(
    private readonly config: ServerConfig,
    private readonly routesTranslationsService: RoutesTranslationsService
  ) {}

  translateRouterConfig(
    routes: Routes,
    routesTranslations: RoutesTranslations
  ): Routes {
    const result = [];
    routes.forEach(route => {
      const translatedRouteAliases = this.translateRoute(
        route,
        routesTranslations
      );
      if (route.children && route.children.length) {
        const translatedChildrenRoutes = this.translateChildrenRoutes(
          route,
          routesTranslations
        );
        translatedRouteAliases.forEach(translatedRouteAlias => {
          translatedRouteAlias.children = translatedChildrenRoutes;
        });
      }
      result.push(...translatedRouteAliases);
    });
    return result;
  }

  private translateChildrenRoutes(
    route: Route,
    routesTranslations: RoutesTranslations
  ): Routes {
    if (this.isConfigurable(route, 'cxPath')) {
      const routeName = this.getConfigurable(route, 'cxPath');
      const childrenTranslations = this.routesTranslationsService.getChildrenRoutesTranslations(
        routeName,
        routesTranslations
      );

      if (childrenTranslations === undefined) {
        this.warn(
          `Could not translate children routes of route '${routeName}'`,
          route,
          `due to undefined 'children' key for '${routeName}' route in routes translations`,
          routesTranslations
        );
        return [];
      }

      // null switches off the children routes:
      if (childrenTranslations === null) {
        return [];
      }
      return this.translateRouterConfig(route.children, childrenTranslations);
    }
    return null;
  }

  private translateRoute(
    route: Route,
    routesTranslations: RoutesTranslations
  ): Routes {
    if (this.isConfigurable(route, 'cxPath')) {
      // we assume that 'path' and 'redirectTo' cannot be both configured for one route
      if (
        this.isConfigurable(route, 'cxRedirectTo') &&
        !this.config.production
      ) {
        this.warn(
          `A path should not have set both "cxPath" and "cxRedirectTo" properties! Route: '${route}`
        );
      }
      return this.translateRoutePath(route, routesTranslations);
    }

    if (this.isConfigurable(route, 'cxRedirectTo')) {
      return this.translateRouteRedirectTo(route, routesTranslations);
    }

    return [route]; // if nothing is configurable, just pass the original route
  }

  // spike todo improve names of isConfigurable and getConfigurable
  private isConfigurable(route: Route, key: ConfigurableRouteKey): boolean {
    return !!this.getConfigurable(route, key);
  }

  private getConfigurable(route: Route, key: ConfigurableRouteKey): string {
    return route.data && route.data[key];
  }

  private translateRoutePath(
    route: Route,
    routesTranslations: RoutesTranslations
  ): Route[] {
    return this.getTranslatedPaths(route, 'cxPath', routesTranslations).map(
      translatedPath => {
        return Object.assign({}, route, {
          path: translatedPath
        });
      }
    );
  }

  private translateRouteRedirectTo(
    route: Route,
    translations: RoutesTranslations
  ): Route[] {
    const translatedPaths = this.getTranslatedPaths(
      route,
      'cxRedirectTo',
      translations
    );
    return translatedPaths.length
      ? [Object.assign({}, route, { redirectTo: translatedPaths[0] })] // take the first path from list by convention
      : [];
  }

  private getTranslatedPaths(
    route: Route,
    key: ConfigurableRouteKey,
    routesTranslations: RoutesTranslations
  ): string[] {
    const routeName = this.getConfigurable(route, key);
    const translation = this.routesTranslationsService.getRouteTranslation(
      routeName,
      routesTranslations
    );
    if (translation === undefined) {
      this.warn(
        `Could not translate key '${key}' of route '${routeName}'`,
        route,
        `due to undefined key '${routeName}' in routes translations`,
        routesTranslations
      );
      return [];
    }
    if (translation && translation.paths === undefined) {
      this.warn(
        `Could not translate key '${key}' of route '${routeName}'`,
        route,
        `due to undefined 'paths' key for '${routeName}' route in routes translations`,
        routesTranslations
      );
      return [];
    }

    // translation or translation.paths can be null - which means switching off the route
    return (translation && translation.paths) || [];
  }

  private warn(...args) {
    if (!this.config.production) {
      console.warn(...args);
    }
  }
}
