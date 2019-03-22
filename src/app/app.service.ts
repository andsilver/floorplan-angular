import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  states = []
  redoStates = []
  current = -1

  selections = []

  insertObject: Subject<any> = new Subject<any>()
  defaultChair: Subject<any> = new Subject<any>()
  performOperation: Subject<any> = new Subject<any>()
  saveState = new Subject<any>()

  constructor() {
    this.saveState.subscribe(res => {
      this.states.push(res)
      this.redoStates = []
      this.current = this.states.length - 1
      console.log(this.states)
    })
  }

  undo() {
    if (this.states.length === 1) {
      return
    }
    this.performOperation.next('UNDO')
  }

  redo() {
    if (this.redoStates.length === 0) {
      return
    }
    this.performOperation.next('REDO')
  }
}
