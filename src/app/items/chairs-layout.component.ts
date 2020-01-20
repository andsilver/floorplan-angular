import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { fabric } from 'fabric';
import { MatDialogRef } from '@angular/material/dialog';

import { FURNISHINGS } from '../shared/models/furnishings';
import { createShape, RL_FILL, RL_STROKE, RL_AISLEGAP } from '../shared/helpers';

const WIDTH = 1100, HEIGHT = 400;

@Component({
  selector: 'app-chairs-layout',
  template: `
  <div class="layout-chairs">
  <div>
    <div class="layout-type" fxLayout fxLayoutAlign="space-between center">
      <mat-radio-group aria-label="Select an layout" [ngModel]="layoutOption"
        (ngModelChange)="layoutOptionChanged($event)">
        <mat-radio-button value="NORMAL">Normal</mat-radio-button>
        <mat-radio-button value="CURVED">Curved</mat-radio-button>
      </mat-radio-group>
      <!-- <app-zoom (zoomChange)="onZoom($event)" [zoom]="zoom"></app-zoom> -->
    </div>
    <form *ngIf="layoutOption === 'CURVED'" [formGroup]="curvedBlock" fxLayout="column">
      <div>
        <mat-form-field>
          <mat-label>Select Chair</mat-label>
          <mat-select formControlName="chair">
            <mat-option *ngFor="let chair of chairs; let i=index;" [value]="i">{{chair.title}}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div fxLayout fxLayoutGap="20px">
        <div class="layout-option">
          <mat-form-field>
            <input type="number" min="1" max="5" formControlName="rows" matInput placeholder="Number of Rounds">
            <mat-hint>Between 1 to 5</mat-hint>
          </mat-form-field>
        </div>
        <div class="layout-option">
          <mat-form-field>
            <input type="number" min="50" max="500" formControlName="radius" matInput placeholder="Radius(px)">
            <mat-hint>Between 50 to 500</mat-hint>
          </mat-form-field>
        </div>
        <div class="layout-option">
          <mat-form-field>
            <input type="number" min="10" max="360" formControlName="angle" matInput placeholder="Angle">
            <mat-hint>Between 10 to 360</mat-hint>
          </mat-form-field>
        </div>
        <div class="layout-option">
          <mat-form-field>
            <input type="number" min="10" max="50" formControlName="spacing_row" matInput
              placeholder="Spacing between Rounds">
            <mat-hint>Between 10 to 50</mat-hint>
          </mat-form-field>
        </div>
      </div>
      <div>
        <p>Number of chairs in rows</p>
        <form formArrayName="chairs" fxLayout fxLayoutGap="20px">
          <div class="layout-option" *ngFor="let n of curved_chairs | slice:0:curved_rows; let i=index">
            <mat-form-field>
              <input matInput [formControlName]="i" type="number">
            </mat-form-field>
          </div>
        </form>
      </div>
    </form>
    <form *ngIf="layoutOption === 'NORMAL'" [formGroup]="rectBlock" fxLayout="column">
      <div>
        <mat-form-field>
          <mat-label>Select Chair</mat-label>
          <mat-select formControlName="chair">
            <mat-option *ngFor="let chair of chairs; let i=index;" [value]="i">{{chair.title}}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div fxLayout fxLayoutGap="20px">
        <div class="layout-option">
          <mat-form-field>
            <mat-label>Sections</mat-label>
            <mat-select formControlName="sections">
              <mat-option *ngFor="let opt of [1, 2, 3, 4]; let i=index;" [value]="opt">{{opt}}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="layout-option">
          <mat-form-field>
            <input type="number" min="1" max="50" formControlName="rows" matInput placeholder="Rows">
            <mat-hint>Between 1 to 50</mat-hint>
          </mat-form-field>
        </div>
        <div class="layout-option">
          <mat-form-field>
            <input type="number" formControlName="chairs" min="1" matInput placeholder="Chairs in a row">
          </mat-form-field>
        </div>
        <div class="layout-option">
          <mat-form-field>
            <input type="number" min="0" max="6" formControlName="spacing_chair" matInput
              placeholder="Spacing between chairs(px)">
            <mat-hint>Between 0 to 6</mat-hint>
          </mat-form-field>
        </div>
        <div>
          <mat-form-field>
            <input type="number" min="0" formControlName="spacing_row" matInput placeholder="Spacing between rows(px)">
          </mat-form-field>
        </div>
      </div>
      <div *ngIf="sections > 1">
        <p>Spacing between sections</p>
        <form formArrayName="spacing_sections" fxLayout fxLayoutGap="20px">
          <div class="layout-option" *ngFor="let sec of spacing_sections | slice:0:sections-1; let i=index">
            <mat-form-field>
              <input matInput [formControlName]="i" type="number">
            </mat-form-field>
          </div>
        </form>
      </div>
    </form>
  </div>
  <div>
    <canvas id="layout_chairs"></canvas>
  </div>
  <div style="margin-top: 1rem">
    <button mat-raised-button color="primary" (click)="create()">Create</button>
    <button style="margin-left: 1rem" mat-button color="primary" (click)="cancel()">Cancel</button>
  </div>
</div>
  `,
  styles: [`
  .layout-chairs {
    .layout-type {padding: 24px 0;
      mat-radio-button {margin-right: 24px;}
    }
    label {display: block; margin-bottom: 5px; font-size: 16px;}
    span {display: block;font-size: 12px;color: #555;}
    .layout-option {margin-bottom: 1rem;}
    canvas {border: 1px solid #ececec;border-radius: 3px; }
    p {margin-bottom: 0;}
  }`]
})
export class ChairsLayoutComponent implements OnInit {

  layout: fabric.Group;
  layoutOption = 'NORMAL';
  rectBlock: FormGroup;
  curvedBlock: FormGroup;
  view: fabric.Canvas;
  chairs = [];
  sps: FormArray; // Spacing between sections
  zoom = 100;

  constructor(private dialogRef: MatDialogRef<ChairsLayoutComponent>) { }

  ngOnInit() {
    this.chairs = FURNISHINGS.chairs;

    this.rectBlock = new FormGroup({
      chair: new FormControl(0),
      rows: new FormControl(1),
      sections: new FormControl(1),
      chairs: new FormControl(12),
      spacing_chair: new FormControl(0),
      spacing_row: new FormControl(22),
      spacing_sections: new FormArray([1, 2, 3, 4].map(_ => new FormControl(5)))
    });

    const array = [];
    for (let i = 0; i < 20; i++) {
      array.push(i);
    }

    this.curvedBlock = new FormGroup({
      chair: new FormControl(0),
      radius: new FormControl(200),
      angle: new FormControl(180),
      rows: new FormControl(1),
      spacing_row: new FormControl(40),
      chairs: new FormArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(_ => new FormControl(10))),
    });

    this.view = new fabric.Canvas('layout_chairs');
    this.view.setWidth(WIDTH);
    this.view.setHeight(HEIGHT);

    this.rectBlock.valueChanges.subscribe(() => this.changeLayout());
    this.curvedBlock.valueChanges.subscribe(() => this.changeLayout());
    this.changeLayout();
  }

  layoutOptionChanged(value: 'CURVED' | 'NORMAL') {
    this.layoutOption = value;
    this.changeLayout();
  }


  changeLayout() {
    const chrs = [];

    if (this.layoutOption === 'CURVED') {
      const { radius, angle, rows, chair, spacing_row, chairs } = this.curvedBlock.value;
      const start = -(angle / 2);
      for (let r = 0; r < rows; r++) {
        const N = chairs[r], A = angle / N;
        const rad = radius + r * spacing_row;
        for (let i = 0; i <= N; i += 1) {
          const ca = start + i * A;
          const chr = createShape(this.chairs[chair], RL_STROKE, RL_FILL);
          chr.angle = ca;
          const x = Math.sin(this.toRadians(ca)) * rad;
          const y = Math.cos(this.toRadians(ca)) * rad;
          chr.left = x;
          chr.top = -y;
          chr.angle += 180;
          chrs.push(chr);
        }
      }
    } else {
      const { rows, sections, chairs, spacing_chair, spacing_row, chair } = this.rectBlock.value;
      const total = rows * chairs;

      let x = 0;
      let y = 0;
      const cps = Math.floor(chairs / sections); // Chairs per section

      for (let i = 1; i <= total; i++) {
        const chr = createShape(this.chairs[chair], RL_STROKE, RL_FILL);
        chr.left = x, chr.top = y;

        if (i % chairs === 0) {
          y += (spacing_row + chr.height);
          x = 0;
        } else {
          x += (chr.width + spacing_chair);
          const s = Math.floor(i % chairs / cps);
          if (i % chairs % cps === 0 && s + 1 <= this.sections) {
            x += this.rectBlock.value.spacing_sections[s - 1];
          }
        }
        chrs.push(chr);
      }
    }
    this.view.clear();
    this.layout = new fabric.Group(chrs, {
      originX: 'center',
      originY: 'center',
      left: WIDTH / 2,
      top: HEIGHT / 2,
      selectable: false,
      name: 'BLOCK:Chairs',
      hasControls: false,
    });
    this.layout.scale(this.zoom / 100);
    this.view.add(this.layout);
    this.view.renderAll();
  }

  onZoom(value: number) {
    this.zoom = value;
    this.layout.scale(value / 100);
    this.view.renderAll();
  }

  get spacing_sections() {
    const c = this.rectBlock.get('spacing_sections') as FormArray;
    return c.controls;
  }

  get sections() {
    return this.rectBlock.value.sections;
  }

  get curved_chairs() {
    const c = this.curvedBlock.get('chairs') as FormArray;
    return c.controls;
  }

  get curved_rows() {
    return this.curvedBlock.value.rows;
  }

  create() {
    this.layout.selectable = true;
    this.layout.scale(1);
    this.dialogRef.close(this.layout);
  }

  cancel() {
    this.dialogRef.close();
  }

  toRadians(angle: number) {
    return angle * (Math.PI / 180);
  }

  toDegrees(radian: number) {
    return radian * (180 / Math.PI);
  }
}
