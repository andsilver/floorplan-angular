import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { ViewComponent } from './view/view.component';
import { PreviewFurnitureComponent } from './preview-furniture/preview-furniture.component';

@NgModule({
  declarations: [
    AppComponent,
    ViewComponent,
    PreviewFurnitureComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
