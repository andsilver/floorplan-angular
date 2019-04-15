import { NgModule } from '@angular/core';

import {
  MatButtonModule,
  MatButtonToggleModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';
import {
  FontAwesomeModule
} from '@fortawesome/angular-fontawesome'

import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    FontAwesomeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  exports: [
    FontAwesomeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    FlexLayoutModule
  ],
  providers: []
})
export class SharedModule { }