import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FURNISHINGS } from '../shared/models/furnishings';
import { AppService } from '../app.service';
import { ChairsLayoutComponent } from './chairs-layout.component';

@Component({
  selector: 'app-items',
  template: `
  <mat-drawer #drawer mode="side" opened>
    <mat-accordion class="rl-object-options">
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>Rooms</mat-panel-title>
        </mat-expansion-panel-header>
        <mat-list>
          <mat-divider></mat-divider>
          <ng-container *ngFor="let room of furnishings.rooms">
            <mat-list-item (click)="insert(room, 'ROOM')">
              {{room.title}}
            </mat-list-item>
            <mat-divider></mat-divider>
          </ng-container>
        </mat-list>
      </mat-expansion-panel>

      <mat-expansion-panel >
        <mat-expansion-panel-header>
          <mat-panel-title>
            Doors
          </mat-panel-title>
        </mat-expansion-panel-header>
        <mat-divider></mat-divider>
        <div class="preview-layout">
          <div class="preview-item" *ngFor="let door of furnishings.doors">
            <div (click)="insert(door, 'DOOR')">
              <app-preview-furniture [type]="'DOOR'" [furniture]="door"></app-preview-furniture>
              <div class="preview-title">{{door.title}}</div>
            </div>
          </div>
        </div>
      </mat-expansion-panel>

      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Windows
          </mat-panel-title>
        </mat-expansion-panel-header>
        <mat-divider></mat-divider>
        <div class="preview-layout">
          <div class="preview-item" *ngFor="let window of furnishings.windows">
            <div (click)="insert(window, 'WINDOW')">
              <app-preview-furniture [type]="'WINDOW'" [furniture]="window"></app-preview-furniture>
              <div class="preview-title">{{window.title}}</div>
            </div>
          </div>
        </div>
      </mat-expansion-panel>

      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Tables
          </mat-panel-title>
        </mat-expansion-panel-header>
        <mat-divider></mat-divider>
        <mat-form-field>
          <mat-label>Default Chair</mat-label>
          <mat-select [value]="defaultChairIndex" (valueChange)="defaultChairChanged($event)">
            <mat-option *ngFor="let chair of furnishings.chairs; let i=index;" [value]="i">{{chair.title}}</mat-option>
          </mat-select>
        </mat-form-field>
        <div class="preview-layout">
          <div class="preview-item" *ngFor="let table of furnishings.tables">
            <div (click)="insert(table, 'TABLE')">
              <app-preview-furniture [type]="'TABLE'" [furniture]="table"></app-preview-furniture>
              <div class="preview-title">{{table.title}}</div>
            </div>
          </div>
        </div>
      </mat-expansion-panel>

      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Chairs
          </mat-panel-title>
        </mat-expansion-panel-header>
        <mat-divider></mat-divider>
        <div class="preview-layout">
          <div class="preview-item" *ngFor="let chair of furnishings.chairs">
            <div (click)="insert(chair, 'CHAIR')">
              <app-preview-furniture [type]="'CHAIR'" [furniture]="chair"></app-preview-furniture>
              <div class="preview-title">{{chair.title}}</div>
            </div>
          </div>
        </div>
      </mat-expansion-panel>

      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Miscellaneous
          </mat-panel-title>
        </mat-expansion-panel-header>
        <mat-divider></mat-divider>
        <div class="preview-layout">
          <div class="preview-item" *ngFor="let m of furnishings.miscellaneous">
            <div (click)="insert(m, 'MISCELLANEOUS')">
              <app-preview-furniture [type]="'MISCELLANEOUS'" [furniture]="m"></app-preview-furniture>
              <div class="preview-title">{{m.title}}</div>
            </div>
          </div>
        </div>
      </mat-expansion-panel>

      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Text
          </mat-panel-title>
        </mat-expansion-panel-header>
        <mat-divider></mat-divider>
        <form [formGroup]="textForm" class="new-text" (ngSubmit)="insertNewText()">
          <mat-form-field>
            <input matInput placeholder="Input text" formControlName="text">
          </mat-form-field>
          <mat-form-field>
            <input matInput type="number" placeholder="Font Size" min="1" max="200" formControlName="font_size">
          </mat-form-field>
          <div style="margin: 1rem 0">
            <mat-radio-group formControlName="direction">
              <mat-radio-button value="HORIZONTAL">Horizontal</mat-radio-button>
              <mat-radio-button value="VERTICAL">Vertical</mat-radio-button>
            </mat-radio-group>
          </div>
          <div style="margin: 2rem 12px">
            <button mat-raised-button color="primary" type="submit">Add text</button>
          </div>
        </form>
      </mat-expansion-panel>

      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Advanced
          </mat-panel-title>
        </mat-expansion-panel-header>
        <mat-divider></mat-divider>
        <div style="padding: 2rem">
          <button mat-raised-button color="primary" style="width: 100%" (click)="layoutChairs()">Layout chairs</button>
        </div>
      </mat-expansion-panel>

      <div class="export-btns">
        <button mat-raised-button color="primary" (click)="download('PNG')">Download as Image</button>
        <button mat-raised-button color="primary" (click)="download('SVG')">Download as SVG</button>
      </div>
    </mat-accordion>
  </mat-drawer>
  `,
  styles: [`

.preview-layout {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 8px;

    .preview-item {padding: 8px;cursor: pointer;
      &:hover {
        background: white;
        box-shadow:
          0 3px 1px -2px rgba(0, 0, 0, .2),
          0 2px 2px 0 rgba(0, 0, 0, .14),
          0 1px 5px 0 rgba(0, 0, 0, .12);
      }
    }
    .preview-title {margin-top: 8px;text-align: center}
  }
  .export-btns {
    padding: 24px;
    button {width: 100%;
      &:first-of-type {margin-bottom: 24px;}
    }
  }
  .new-text {
    mat-radio-group {padding-left: 12px;
      mat-radio-button {margin-right: 16px;}
    }
  }
  `]
})
export class ItemsComponent implements OnInit {
  title = 'room-layout';

  init = false;
  furnishings = FURNISHINGS;
  defaultChairIndex = 0;

  textForm: FormGroup;

  previewItem = null;
  previewType = null;

  constructor (public appService: AppService, private dialog: MatDialog) {}

  ngOnInit() {
    const defaultChair = FURNISHINGS.chairs[0];
    setTimeout(() => {
      this.appService.defaultChair.next(defaultChair);
      this.init = true;
    }, 100);
    this.initTextForm();
  }

  insert(object: any, type: string) {
    if (this.appService.roomEdit) { return; }
    this.appService.insertObject.next({type, object});
  }

  defaultChairChanged(index: number) {
    this.defaultChairIndex = index;
    this.appService.defaultChair.next(FURNISHINGS.chairs[index]);
  }

  initTextForm() {
    this.textForm = new FormGroup({
      text: new FormControl('New Text'),
      font_size: new FormControl(16),
      direction: new FormControl('HORIZONTAL')
    });
  }

  insertNewText() {
    this.insert({...this.textForm.value, name: 'TEXT:Text'}, 'TEXT');
  }

  layoutChairs() {
    const ref = this.dialog.open(ChairsLayoutComponent);
    ref.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
      this.insert(res, 'LAYOUT');
    });
  }

  download(format: string) {
    this.appService.performOperation.next(format);
  }

}
