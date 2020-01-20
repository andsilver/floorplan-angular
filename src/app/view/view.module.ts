import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ViewComponent } from './view.component';

@NgModule({
  imports: [SharedModule],
  declarations: [ViewComponent],
  exports: [ViewComponent],
  providers: [],
})
export class ViewModule { }
