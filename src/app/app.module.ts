import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ItemsModule } from './items/items.module';
import { ToolbarModule } from './toolbar/toolbar.module';
import { StatusbarModule } from './statusbar/statusbar.module';
import { ViewModule } from './view/view.module';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    MaterialModule,
    FlexLayoutModule,

    FormsModule,
    ReactiveFormsModule,
    ItemsModule,
    ToolbarModule,
    StatusbarModule,
    ViewModule
  ],
  declarations: [AppComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
