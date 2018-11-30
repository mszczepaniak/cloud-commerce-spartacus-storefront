import { CommonModule } from '@angular/common';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { ConfigurableRoutesService } from './routing-translation.service';
import { RoutingTranslationLoader } from './routing-translation-loader';
import { ConfigModule, Config } from '../../config/config.module';
import { PathPipeService } from './path/path-pipe.service';
import { DynamicUrlPipeService } from './path/dynamic-url-pipe.service';
import { RoutingTranslationConfig } from './config/routing-translation-config';
import { defaultRoutingTranslationConfig } from './config/default-routing-translation-config';
import { DynamicUrlRecognizerService } from './path/dynamic-url-recognizer.service';
import { UrlParser } from './path/url-parser.service';

export function loadRoutingTranslation(loader: RoutingTranslationLoader) {
  const result = () => loader.load(); // workaround for AOT compilation (see https://stackoverflow.com/a/51977115)
  return result;
}

@NgModule({
  imports: [
    CommonModule,
    ConfigModule.withConfig(defaultRoutingTranslationConfig)
  ],
  declarations: [],
  exports: [],
  providers: [
    ConfigurableRoutesService,
    RoutingTranslationLoader,
    PathPipeService,
    DynamicUrlPipeService,
    DynamicUrlRecognizerService,
    UrlParser,
    {
      provide: APP_INITIALIZER,
      useFactory: loadRoutingTranslation,
      deps: [RoutingTranslationLoader],
      multi: true
    },
    { provide: RoutingTranslationConfig, useExisting: Config }
  ]
})
export class ConfigurableRoutesModule {}
