import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-zoom',
  template: `
  <div fxLayout fxLayoutAlign="center center" class="zoom-widget">
    <button mat-icon-button matTooltip="Zoom Out" (click)="zoomOut()">
      <fa-icon [icon]="['fas', 'minus']"></fa-icon>
    </button>
    <span style="padding: 0 10px; font-size: 16px">{{ zoom }}%</span>
    <button mat-icon-button matTooltip="Zoom In" (click)="zoomIn()">
      <fa-icon [icon]="['fas', 'plus']"></fa-icon>
    </button>
  </div>

  `,
  styles: [`
  .zoom-widget {
    border: 1px solid #ddd;
    background: white;
    border-radius: 8px;
    fa-icon {
      font-size: 9px;
    }
    button {
      line-height: 30px;
      height: 30px;
    }
  }

  `]
})
export class ZoomComponent implements OnInit {

  @Input()
  zoom = 100;

  @Output()
  zoomChange = new EventEmitter();

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
