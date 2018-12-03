import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ServerConfig } from '../../../config';
import { RoutingTranslationConfig } from '../config/routing-translation-config';
import { RoutesTranslationsLoader } from './routes-translations-loader';
import { BehaviorSubject, of } from 'rxjs';
import { RoutingLanguagesTranslations } from './routes-translations';

const mockHttpClient = {
  get: () => new BehaviorSubject(null)
};
const mockServerConfig: ServerConfig = { server: { baseUrl: 'test-base-url' } };
const mockConfigurableRoutesModuleConfig: RoutingTranslationConfig = {
  routingTranslation: {
    translations: {
      default: {
        page1: {
          paths: ['default-path1'],
          paramsMapping: { param1: 'mappedParam1' }
        },
        page2: { paths: ['default-path2', 'default-path20'] },
        page3: { paths: ['default-path3'] }
      },
      en: {
        page1: { paths: ['en-path1', 'en-path10'] },
        page2: { paths: ['en-path2'] }
      }
    }
  }
};
const mockFetchedLanguagesTranslations: RoutingLanguagesTranslations = {
  default: {
    page1: {
      paths: ['fetched-default-path1'],
      paramsMapping: { param1: 'fetched-mappedParam1' }
    }
  },
  en: {
    page1: {
      paths: ['fetched-en-path1', 'fetched-en-path10']
    }
  }
};

describe('RoutingTranslationLoader', () => {
  let loader: RoutesTranslationsLoader;
  let http: HttpClient;
  let routingTranslationConfig: RoutingTranslationConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoutesTranslationsLoader,
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: ServerConfig, useValue: mockServerConfig },
        {
          provide: RoutingTranslationConfig,
          useValue: mockConfigurableRoutesModuleConfig
        }
      ]
    });

    loader = TestBed.get(RoutesTranslationsLoader);
    http = TestBed.get(HttpClient);
    routingTranslationConfig = TestBed.get(RoutingTranslationConfig);
  });

  describe('loadRoutesConfig', () => {
    describe(', when fetch is configured to true,', () => {
      beforeEach(() => {
        routingTranslationConfig.routingTranslation.fetch = true;
      });

      it('should fetch routes config from url', () => {
        spyOn(http, 'get').and.returnValue(of(null));
        loader.load();
        expect(http.get).toHaveBeenCalled();
      });

      it('should place routes config under "routesConfig" property', async () => {
        spyOn(http, 'get').and.returnValue(
          of(mockFetchedLanguagesTranslations)
        );
        expect(loader.translations).toBeFalsy();
        await loader.load();
        expect(loader.translations).toBeTruthy();
      });

      // tslint:disable-next-line:max-line-length
      it('should extend fetched routes config with static one and extend routes translations for languages with "default" translations', async () => {
        spyOn(http, 'get').and.returnValue(
          of(mockFetchedLanguagesTranslations)
        );
        await loader.load();
        expect(loader.translations).toEqual({
          translations: {
            default: {
              page1: {
                paths: ['fetched-default-path1'],
                paramsMapping: { param1: 'fetched-mappedParam1' }
              },
              page2: {
                paths: ['default-path2', 'default-path20']
              },
              page3: { paths: ['default-path3'] }
            },
            en: {
              page1: {
                paths: ['fetched-en-path1', 'fetched-en-path10'],
                paramsMapping: { param1: 'fetched-mappedParam1' }
              },
              page2: {
                paths: ['en-path2']
              },
              page3: { paths: ['default-path3'] }
            }
          },
          fetch: true
        });
      });
    });

    describe(', when fetch is configured to false,', () => {
      beforeEach(() => {
        routingTranslationConfig.routingTranslation.fetch = false;
      });

      it('should NOT fetch routes config', () => {
        spyOn(http, 'get');
        loader.load();
        expect(http.get).not.toHaveBeenCalled();
      });

      it('should place routes config under "routesConfig" property', () => {
        expect(loader.translations).toBeFalsy();
        loader.load();
        expect(loader.translations).toBeTruthy();
      });

      it('should use static routes config and extend routes translations for languages with "default"', () => {
        spyOn(http, 'get').and.returnValue(
          of(mockFetchedLanguagesTranslations)
        );
        loader.load();
        expect(loader.translations).toEqual(
          jasmine.objectContaining({
            translations: {
              default: {
                page1: {
                  paths: ['default-path1'],
                  paramsMapping: { param1: 'mappedParam1' }
                },
                page2: { paths: ['default-path2', 'default-path20'] },
                page3: { paths: ['default-path3'] }
              },
              en: {
                page1: {
                  paths: ['en-path1', 'en-path10'],
                  paramsMapping: { param1: 'mappedParam1' }
                },
                page2: { paths: ['en-path2'] },
                page3: { paths: ['default-path3'] }
              }
            }
          })
        );
      });
    });
  });
});
