import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { fabric } from 'fabric';
import * as uuid from 'uuid'

import { RL_PREVIEW_HEIGHT, RL_PREVIEW_WIDTH, createFurniture } from '../helpers'
import { AppService } from '../app.service';

let RL_DEFAULT_CHAIR = null

@Component({
  selector: 'app-preview-furniture',
  templateUrl: './preview-furniture.component.html',
  styleUrls: ['./preview-furniture.component.scss']
})
export class PreviewFurnitureComponent implements OnInit, AfterViewInit {

  id: any
  canvas: fabric.Canvas

  @Input()
  type: string

  @Input()
  furniture: any;

  constructor(public app: AppService) { }

  ngOnInit() {
    this.id = uuid.v4()
    this.app.defaultChair.subscribe(res => {
      this.canvas.clear()
      RL_DEFAULT_CHAIR = res
      const type = this.type, object = this.furniture
      this.handleObjectInsertion({type, object})
      this.canvas.renderAll()
    })
  }

  ngAfterViewInit() {
    const canvas = new fabric.Canvas(this.id)
    canvas.setWidth(RL_PREVIEW_WIDTH)
    canvas.setHeight(RL_PREVIEW_HEIGHT)
    this.canvas = canvas
  }

  handleObjectInsertion({ type, object }) {

    const group = createFurniture(type, object, RL_DEFAULT_CHAIR)

    group.left = RL_PREVIEW_WIDTH / 2
    group.top = RL_PREVIEW_HEIGHT / 2
    group.selectable = false
    group.hoverCursor = 'pointer'

    this.canvas.add(group)
  }
}
