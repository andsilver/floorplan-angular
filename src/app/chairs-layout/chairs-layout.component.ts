import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { fabric } from 'fabric';
import { MatDialogRef } from '@angular/material/dialog';

import { FURNISHINGS } from '../models/furnishings';
import { createShape, RL_FILL, RL_STROKE, RL_AISLEGAP } from '../helpers';

const WIDTH = 1100, HEIGHT = 400

@Component({
  selector: 'app-chairs-layout',
  templateUrl: './chairs-layout.component.html',
  styleUrls: ['./chairs-layout.component.scss']
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
    this.chairs = FURNISHINGS.chairs

    this.rectBlock = new FormGroup({
      chair: new FormControl(0),
      rows: new FormControl(1),
      sections: new FormControl(1),
      chairs: new FormControl(12),
      spacing_chair: new FormControl(0),
      spacing_row: new FormControl(22),
      spacing_sections: new FormArray([1, 2, 3, 4].map(_ => new FormControl(5)))
    })

    let array = [];
    for (let i = 0; i < 20; i++)
      array.push(i)

    this.curvedBlock = new FormGroup({
      chair: new FormControl(0),
      radius: new FormControl(200),
      angle: new FormControl(180),
      rows: new FormControl(1),
      spacing_row: new FormControl(40),
      chairs: new FormArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(_ => new FormControl(10))),
    })

    this.view = new fabric.Canvas('layout_chairs')
    this.view.setWidth(WIDTH);
    this.view.setHeight(HEIGHT);

    this.rectBlock.valueChanges.subscribe(() => this.changeLayout())
    this.curvedBlock.valueChanges.subscribe(() => this.changeLayout())
    this.changeLayout()
  }

  layoutOptionChanged(value: 'CURVED' | 'NORMAL') {
    this.layoutOption = value
    this.changeLayout()
  }


  changeLayout() {
    const chrs = []

    if (this.layoutOption === 'CURVED') {
      const { radius, angle, rows, chair, spacing_row, chairs } = this.curvedBlock.value
      const start = -(angle / 2)
      for (let r = 0; r < rows; r++) {
        const N = chairs[r], A = angle / N
        const rad = radius + r * spacing_row
        for (let i = 0; i <= N; i += 1) {
          const ca = start + i * A
          const chr = createShape(this.chairs[chair], RL_STROKE, RL_FILL)
          chr.angle = ca
          const x = Math.sin(this.toRadians(ca)) * rad
          const y = Math.cos(this.toRadians(ca)) * rad
          chr.left = x
          chr.top = -y
          chr.angle += 180
          chrs.push(chr)
        }
      }
    } else {
      const { rows, sections, chairs, spacing_chair, spacing_row, chair } = this.rectBlock.value
      const total = rows * chairs

      let x = 0, y = 0, cps = Math.floor(chairs / sections) // Chairs per section

      for (let i = 1; i <= total; i++) {
        const chr = createShape(this.chairs[chair], RL_STROKE, RL_FILL)
        chr.left = x, chr.top = y

        if (i % chairs === 0) {
          y += (spacing_row + chr.height)
          x = 0
        } else {
          x += (chr.width + spacing_chair)
          const s = Math.floor(i % chairs / cps)
          if (i % chairs % cps === 0 && s + 1 <= this.sections) {
            x += this.rectBlock.value.spacing_sections[s - 1]
          }
        }
        chrs.push(chr)
      }
    }
    this.view.clear()
    this.layout = new fabric.Group(chrs, {
      originX: 'center',
      originY: 'center',
      left: WIDTH / 2,
      top: HEIGHT / 2,
      selectable: false,
      name: 'BLOCK:Chairs',
      hasControls: false,
    })
    this.layout.scale(this.zoom / 100)
    this.view.add(this.layout)
    this.view.renderAll()
  }

  onZoom(value: number) {
    this.zoom = value
    this.layout.scale(value / 100)
    this.view.renderAll()
  }

  get spacing_sections() {
    const c = this.rectBlock.get('spacing_sections') as FormArray;
    return c.controls;
  }

  get sections() {
    return this.rectBlock.value.sections
  }

  get curved_chairs() {
    const c = this.curvedBlock.get('chairs') as FormArray;
    return c.controls;
  }

  get curved_rows() {
    return this.curvedBlock.value.rows
  }

  create() {
    this.layout.selectable = true
    this.layout.scale(1)
    this.dialogRef.close(this.layout)
  }

  cancel() {
    this.dialogRef.close()
  }

  toRadians(angle: number) {
    return angle * (Math.PI / 180)
  }

  toDegrees(radian: number) {
    return radian * (180 / Math.PI)
  }
}
