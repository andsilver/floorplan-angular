import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { fabric } from 'fabric';
import { MatDialogRef } from '@angular/material/dialog';

import { FURNISHINGS } from '../models/furnishings';
import { createShape, RL_FILL, RL_STROKE } from '../helpers';

const WIDTH = 1100, HEIGHT = 500

@Component({
  selector: 'app-chairs-layout',
  templateUrl: './chairs-layout.component.html',
  styleUrls: ['./chairs-layout.component.scss']
})
export class ChairsLayoutComponent implements OnInit {

  layout: fabric.Group;
  curved = false;
  rectBlock: FormGroup;
  curvedBlock: FormGroup;
  view: fabric.Canvas;
  chairs = []
  sps: FormArray; // Spacing between sections

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

    this.curvedBlock = new FormGroup({})
    this.view = new fabric.Canvas('layout_chairs')
    this.view.setWidth(WIDTH);
    this.view.setHeight(HEIGHT);

    this.rectBlock.valueChanges.subscribe(value => this.changeLayout(value))
    this.changeLayout(this.rectBlock.value)
  }


  changeLayout(options: any) {
    this.view.clear()

    const { rows, sections, chairs, spacing_chair, spacing_row, chair } = options
    const total = rows * chairs
    const chrs = []

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
        if ( i % chairs % cps === 0 && s + 1 <= this.sections ) {
          x += this.rectBlock.value.spacing_sections[s - 1]
        }
      }
      chrs.push(chr)
    }

    this.layout = new fabric.Group(chrs, {
      originX: 'center',
      originY: 'center',
      left: WIDTH / 2,
      top: HEIGHT / 2,
      selectable: false,
      name: 'BLOCK:Chairs',
      hasControls: false
    })
    this.view.add(this.layout)
    this.view.renderAll()
  }

  get spacing_sections () {
    const c = this.rectBlock.get('spacing_sections') as FormArray;
    return c.controls;
  }

  get sections () {
    return this.rectBlock.value.sections
  }

  create() {
    this.layout.selectable = true
    this.dialogRef.close(this.layout)
  }

  cancel() {
    this.dialogRef.close()
  }
}
