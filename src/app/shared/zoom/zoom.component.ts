import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.scss']
})
export class ZoomComponent implements OnInit {

  @Input()
  zoom: number = 100

  @Output()
  zoomChange = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

  zoomIn() {
    if (this.zoom >= 150)
      return
    this.zoom += 10
    this.zoomChange.emit(this.zoom)
  }

  zoomOut() {
    if (this.zoom <= 20)
      return
    this.zoom -= 10
    this.zoomChange.emit(this.zoom)
  }

}
