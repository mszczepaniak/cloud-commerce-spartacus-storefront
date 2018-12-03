import { NgModule } from '@angular/core';
import { UrlTranslatorService } from './url-translator.service';
import { RouteRecognizerModule } from './route-recognizer/route-recognizer.module';

@NgModule({
  imports: [RouteRecognizerModule],
  providers: [UrlTranslatorService]
})
export class UrlTranslatorModule {}
