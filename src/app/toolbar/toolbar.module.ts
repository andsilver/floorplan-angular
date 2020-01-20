import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ToolBarComponent } from './toolbar.component';


@NgModule({
  imports: [SharedModule],
  declarations: [ToolBarComponent],
  exports: [ToolBarComponent],
  providers: [],
})
export class ToolbarModule { }
