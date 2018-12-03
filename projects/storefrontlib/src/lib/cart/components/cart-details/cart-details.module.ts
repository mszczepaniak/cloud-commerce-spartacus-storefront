import { NgModule } from '@angular/core';
import { CartSharedModule } from '../cart-shared/cart-shared.module';
import { CartDetailsComponent } from './container/cart-details.component';
import { UrlTranslatorModule } from '@spartacus/core';

@NgModule({
  imports: [CartSharedModule, UrlTranslatorModule],
  declarations: [CartDetailsComponent],
  exports: [CartDetailsComponent]
})
export class CartDetailsModule {}
