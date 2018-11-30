import { HttpClient } from '@angular/common/http';
import { ServerConfig } from '../../config/server-config/server-config';
import { Injectable } from '@angular/core';
import { RoutingLanguagesTranslations } from './routes-config';
import { deepMerge } from '../../config/utils/deep-merge';
import { RoutingTranslationConfig } from './config/routing-translation-config';
import { retry } from 'rxjs/operators';

const ENDPOINT_ROUTING_TRANSLATION = 'routing-translation';

@Injectable()
export class RoutesConfigLoader {
  private _languagesTranslations: RoutingLanguagesTranslations;

  get translations(): RoutingLanguagesTranslations {
    return this._languagesTranslations;
  }

  get endpoint(): string {
    return (
      (this.serverConfig.server.baseUrl || '') +
      '/' +
      ENDPOINT_ROUTING_TRANSLATION
    );
  }

  private get staticTranslations(): RoutingLanguagesTranslations {
    return this.routingTranslationConfig.routingTranslation.translations;
  }

  constructor(
    private readonly http: HttpClient,
    private readonly serverConfig: ServerConfig,
    private readonly routingTranslationConfig: RoutingTranslationConfig
  ) {}

  async load(): Promise<any> {
    const shouldFetch = this.routingTranslationConfig.routingTranslation.fetch;
    const fetchedRoutingLanguagesTranslations = shouldFetch
      ? await this.fetch(this.endpoint)
      : null;
    this._languagesTranslations = this.extendStaticWith(
      fetchedRoutingLanguagesTranslations
    );
  }

  private fetch(url: string): Promise<any> {
    return this.http
      .get(url)
      .pipe(retry(2))
      .toPromise()
      .catch(() => {
        throw new Error(`Could not get routes configutation from url ${url}!`);
      });
  }

  private extendStaticWith(
    routingLanguagesTranslations: RoutingLanguagesTranslations
  ): RoutingLanguagesTranslations {
    const mergedRoutingLanguagesTranslation = deepMerge(
      {},
      this.staticTranslations,
      routingLanguagesTranslations
    );
    return this.extendLanguagesWithDefault(mergedRoutingLanguagesTranslation);
  }

  private extendLanguagesWithDefault(
    languagesTranslations: RoutingLanguagesTranslations
  ): RoutingLanguagesTranslations {
    const defaultTranslations = languagesTranslations.default;

    Object.keys(languagesTranslations).forEach(languageCode => {
      const languageTranslations = languagesTranslations[languageCode];
      languagesTranslations[languageCode] = deepMerge(
        {},
        defaultTranslations,
        languageTranslations
      );
    });

    return languagesTranslations;
  }
}
