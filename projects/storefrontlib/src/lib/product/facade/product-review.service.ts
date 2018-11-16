import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import * as fromStore from '../store';
import { Product, Review } from '@spartacus/core';

@Injectable()
export class ProductReviewService {
  constructor(private store: Store<fromStore.ProductsState>) {}

  getByProductCode(productCode: string): Observable<Product> {
    const selector = fromStore.getSelectedProductReviewsFactory(productCode);
    return this.store.pipe(
      select(selector),
      tap(reviews => {
        if (reviews === undefined && productCode !== undefined) {
          this.store.dispatch(new fromStore.LoadProductReviews(productCode));
        }
      })
    );
  }

  add(productCode: string, review: Review) {
    this.store.dispatch(
      new fromStore.PostProductReview({
        productCode: productCode,
        review: review
      })
    );
  }
}
