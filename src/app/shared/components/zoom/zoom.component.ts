import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.scss']
})
export class ZoomComponent implements OnInit {

  @Input()
  zoom = 100;

  @Output()
  zoomChange = new EventEmitter();

  // icons
  faMinus = faMinus;
  faPlus = faPlus;

  constructor() { }

  ngOnInit() {
  }

  zoomIn() {
    if (this.zoom >= 150) {
      return;
    }
    this.zoom += 10;
    this.zoomChange.emit(this.zoom);
  }

  zoomOut() {
    if (this.zoom <= 20) {
      return;
    }
    this.zoom -= 10;
    this.zoomChange.emit(this.zoom);
  }

}
