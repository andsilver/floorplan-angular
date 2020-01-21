import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    FontAwesomeModule,
    FlexLayoutModule
  ],
  exports: [
    FontAwesomeModule,
    FlexLayoutModule
  ]
})
export class DesignModule { }
