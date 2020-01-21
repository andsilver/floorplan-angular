import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { ViewComponent } from './components/view/view.component';
import { PreviewFurnitureComponent } from './components/preview-furniture/preview-furniture.component';
import { ChairsLayoutComponent } from './components/chairs-layout/chairs-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    ViewComponent,
    PreviewFurnitureComponent,
    ChairsLayoutComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ChairsLayoutComponent]
})
export class AppModule { }
