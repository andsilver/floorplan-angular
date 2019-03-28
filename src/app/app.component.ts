import { Component, OnInit, HostListener } from '@angular/core';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faReply, faShare, faClone, faTrash, faUndo, faRedo, faObjectGroup, faObjectUngroup } from '@fortawesome/free-solid-svg-icons';

import { FURNISHINGS } from './models/furnishings';
import { AppService } from './app.service';

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

  previewItem = null
  previewType = null

  constructor (public app: AppService) {}

  ngOnInit() {
    // this.furnishings = FURNISHINGS
    const defaultChair = FURNISHINGS.chairs[0]
    setTimeout(() => {
      this.app.defaultChair.next(defaultChair)
      this.init = true
    }, 100)
  }

  insert(object: any, type: string) {
    if (this.app.roomEdit) return
    this.app.insertObject.next({type, object})
  }

  defaultChairChanged(index: number) {
    this.defaultChairIndex = index
    this.app.defaultChair.next(FURNISHINGS.chairs[index])
  }

}
