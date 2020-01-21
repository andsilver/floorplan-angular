import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-statusbar',
  template: `
    <table class="status-bar">
      <tbody>
        <tr class="status-bar-item">
          <td>Type</td>
          <td>Name</td>
          <td>Left</td>
          <td>Top</td>
          <td>Rotation</td>
          <td>Width</td>
          <td>Height</td>
          <td></td>
        </tr>
        <tr class="status-bar-item" *ngFor="let selected of appService.selections">
          <td><strong *ngIf="selected.name">{{selected.name.split(':')[0] | titlecase}}</strong></td>
          <td><strong *ngIf="selected.name">{{selected.name.split(':')[1]}}</strong></td>
          <td><strong>{{selected.left}}</strong></td>
          <td><strong>{{selected.top}}</strong></td>
          <td><strong>{{selected.angle}}'</strong></td>
          <td><strong>{{selected.width}}</strong></td>
          <td><strong>{{selected.height}}</strong></td>
          <td><strong *ngIf="selected.name.split(':')[0] == 'TABLE'">{{selected._objects.length - 1}} Chairs</strong></td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
  .status-bar {
    border-top: 1px solid rgba(0, 0, 0, .12);
    background: #ececec;
    min-height: 79px;
    width: 100%;
    .status-bar-item {
      td {
        padding: 10px;
        border-bottom: 1px solid rgba(0, 0, 0, .12);
      }
      span {
        margin-right: 15px;
      }
    }
  }
  `]
})
export class StatusbarComponent implements OnInit {

  constructor (public appService: AppService) {}

  ngOnInit() {

  }

}
