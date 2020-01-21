import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { StatusbarComponent } from './statusbar.component';

@NgModule({
  imports: [SharedModule],
  declarations: [StatusbarComponent],
  exports: [StatusbarComponent],
  providers: [],
})
export class StatusbarModule { }
