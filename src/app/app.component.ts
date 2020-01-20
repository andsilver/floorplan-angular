import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  template: `
  <mat-toolbar color="primary">
    <mat-toolbar-row>
      <!-- <button mat-icon-button (click)="drawer.toggle()"><mat-icon>menu</mat-icon></button> -->
      <h1>Room Layout</h1>
    </mat-toolbar-row>
  </mat-toolbar>

  <mat-drawer-container hasBackdrop="false">
    <mat-drawer mode="side" opened="true">
      <app-items></app-items>
    </mat-drawer>
    <mat-drawer-content>
      <app-toolbar></app-toolbar>
      <app-view></app-view>
      <app-statusbar></app-statusbar>
    </mat-drawer-content>
  </mat-drawer-container>
  `,
  styles: [`mat-drawer {
    width: 350px;
  }

  mat-drawer-container {
    height: calc(100% - 64px)
  }
  mat-toolbar-row{
    justify-content: space-between
  }`]
})
export class AppComponent implements OnInit {

  constructor (public appService: AppService) {}

  ngOnInit() {  }

}
