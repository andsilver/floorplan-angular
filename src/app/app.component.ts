import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faReply, faShare, faClone, faTrash, faUndo, faRedo, faObjectGroup, faObjectUngroup } from '@fortawesome/free-solid-svg-icons';

import { FURNISHINGS } from './models/furnishings';
import { AppService } from './app.service';
import { ChairsLayoutComponent } from './chairs-layout/chairs-layout.component'

library.add( faReply, faShare, faClone, faTrash, faUndo, faRedo, faObjectGroup, faObjectUngroup )

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'room-layout';

  init = false
  furnishings = FURNISHINGS
  defaultChairIndex = 0

  textForm: FormGroup

  previewItem = null
  previewType = null

  constructor (public app: AppService, private dialog: MatDialog) {}

  ngOnInit() {
    const defaultChair = FURNISHINGS.chairs[0]
    setTimeout(() => {
      this.app.defaultChair.next(defaultChair)
      this.init = true
    }, 100)
    this.initTextForm()
  }

  insert(object: any, type: string) {
    if (this.app.roomEdit) return
    this.app.insertObject.next({type, object})
  }

  defaultChairChanged(index: number) {
    this.defaultChairIndex = index
    this.app.defaultChair.next(FURNISHINGS.chairs[index])
  }

  initTextForm() {
    this.textForm = new FormGroup({
      text: new FormControl('New Text'),
      font_size: new FormControl(16),
      direction: new FormControl('HORIZONTAL')
    })
  }

  insertNewText() {
    this.insert({...this.textForm.value, name: 'TEXT:Text'}, 'TEXT')
  }

  layoutChairs() {
    const ref = this.dialog.open(ChairsLayoutComponent)
    ref.afterClosed().subscribe(res => {
      if (!res)
        return
      this.insert(res, 'LAYOUT')
    })
  }

  download(format: string) {
    this.app.performOperation.next(format)
  }

  // get text() {
  //   return this.textForm.controls.text
  // }

  // get font_size() {
  //   return this.textForm.controls.font_size
  // }

  // get vertical() {
  //   return this.
  // }

}
