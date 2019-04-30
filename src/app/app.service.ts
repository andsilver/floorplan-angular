import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  roomEdit = false

  states = []
  redoStates = []

  roomEditOperate = 'CORNER'
  roomEditStates = []
  roomEditRedoStates = []

  selections: any[] = []
  copied: any;

  ungroupable: boolean = false

  insertObject: Subject<any> = new Subject<any>()
  defaultChair: Subject<any> = new Subject<any>()
  performOperation: Subject<any> = new Subject<any>()
  roomEdition: Subject<boolean> = new Subject<boolean>()
  saveState = new Subject<any>()
  zoom = 100

  constructor() {
    this.saveState.subscribe(res => {
      if (this.roomEdit) {
        this.roomEditStates.push(res)
        this.roomEditRedoStates = []
        return
      }
      this.states.push(res)
      this.redoStates = []
    })
  }

  editRoom() {
    this.roomEdit = true
    this.roomEdition.next(true)
  }

  endEditRoom() {
    this.roomEdit = false
    this.roomEdition.next(false)
  }

  undo() {
    if ((this.states.length === 1 && !this.roomEdit) || (this.roomEditStates.length === 1 && this.roomEdit)) {
      return
    }
    this.performOperation.next('UNDO')
  }

  redo() {
    if ((this.redoStates.length === 0 && !this.roomEdit) || (this.roomEditRedoStates.length === 0 && this.roomEdit)) {
      return
    }
    this.performOperation.next('REDO')
  }

  clone() {
    this.copy(true)
  }

  copy(doClone = false) {
    this.performOperation.next('COPY')
    if (doClone) {
      setTimeout(() => this.paste(), 100)
    }
  }

  paste() {
    this.performOperation.next('PASTE')
  }

  delete() {
    if (!this.selections.length)
      return
    this.performOperation.next('DELETE')
  }

  rotateAntiClockWise() {
    this.performOperation.next('ROTATE_ANTI')
  }

  rotateClockWise() {
    this.performOperation.next('ROTATE')
  }

  group() {
    this.performOperation.next('GROUP')
  }

  ungroup() {
    this.performOperation.next('UNGROUP')
  }

  placeInCenter(direction) {
    this.performOperation.next(direction)
  }

  arrange(side) {
    this.performOperation.next(side)
  }

  zoomIn() {
    if (this.zoom >= 150)
      return
    this.zoom += 10
    this.performOperation.next('ZOOM')
  }

  zoomOut() {
    if (this.zoom <= 20)
      return
    this.zoom -= 10
    this.performOperation.next('ZOOM')
  }
}
