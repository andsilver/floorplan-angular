import { Component, OnInit } from '@angular/core';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faReply, faShare, faClone, faTrash, faUndo, faRedo, faObjectGroup, faObjectUngroup, faPlus, faMinus
} from '@fortawesome/free-solid-svg-icons';

import { AppService } from '../app.service';

library.add( faReply, faShare, faClone, faTrash, faUndo, faRedo, faObjectGroup, faObjectUngroup, faMinus, faPlus );

@Component({
  selector: 'app-toolbar',
  template: `
    <mat-toolbar>
      <mat-toolbar-row>
        <div *ngIf="init">
          <ng-container *ngIf="!appService.roomEdit">
            <button mat-icon-button matTooltip="Undo (Ctrl + Z)" (click)="appService.undo()"
              [disabled]="appService.states.length === 1">
              <fa-icon [icon]="['fas', 'reply']"></fa-icon>
            </button>
            <button mat-icon-button matTooltip="Redo (Ctrl + Shift + Z)" (click)="appService.redo()"
              [disabled]="appService.redoStates.length === 0">
              <fa-icon [icon]="['fas', 'share']"></fa-icon>
            </button>
            <button mat-icon-button matTooltip="Clone (Ctrl + D)" [disabled]="appService.selections.length === 0"
              (click)="appService.clone()">
              <fa-icon [icon]="['fas', 'clone']"></fa-icon>
            </button>
            <button mat-icon-button matTooltip="Delete (Delete)" [disabled]="appService.selections.length === 0"
              (click)="appService.delete()">
              <fa-icon [icon]="['fas', 'trash']"></fa-icon>
            </button>
            <button mat-icon-button matTooltip="Rotate Anti-Clockwise (Ctrl + Left Arrow)"
              [disabled]="appService.selections.length === 0" (click)="appService.rotateAntiClockWise()">
              <fa-icon [icon]="['fas', 'undo']"></fa-icon>
            </button>
            <button mat-icon-button matTooltip="Rotate Clockwise (Ctrl + Right Arrow)"
              [disabled]="appService.selections.length === 0" (click)="appService.rotateClockWise()">
              <fa-icon [icon]="['fas', 'redo']"></fa-icon>
            </button>
            <button mat-icon-button matTooltip="Group (Ctrl + G)" [disabled]="appService.selections.length < 2"
              (click)="appService.group()">
              <fa-icon [icon]="['fas', 'object-group']"></fa-icon>
            </button>
            <button mat-icon-button matTooltip="Ungroup (Ctrl + E)" [disabled]="!appService.ungroupable"
              (click)="appService.ungroup()">
              <fa-icon [icon]="['fas', 'object-ungroup']"></fa-icon>
            </button>
            <button mat-button matTooltip="Arrange" [matMenuTriggerFor]="arrange">Arrange</button>
            <button mat-raised-button matTooltip="Switch Edition Mode" color="primary" (click)="appService.editRoom()">Edit
              Room</button>
          </ng-container>
          <ng-container *ngIf="appService.roomEdit">
            <button mat-icon-button matTooltip="Undo (Ctrl + Z)" (click)="appService.undo()"
              [disabled]="appService.roomEditStates.length === 1">
              <fa-icon [icon]="['fas', 'reply']"></fa-icon>
            </button>
            <button mat-icon-button matTooltip="Redo (Ctrl + Shift + Z)" (click)="appService.redo()"
              [disabled]="appService.roomEditRedoStates.length === 0">
              <fa-icon [icon]="['fas', 'share']"></fa-icon>
            </button>
            <button mat-button matTooltip="Switch Edition Mode" color="primary" *ngIf="appService.roomEdit"
              (click)="appService.endEditRoom()">End Room Edition</button>
          </ng-container>
        </div>
        <mat-menu #arrange="matMenu">
          <ng-template matMenuContent>
            <button mat-menu-item (click)="appService.arrange('LEFT')" [disabled]="appService.selections.length < 2">Arrange Left</button>
            <button mat-menu-item (click)="appService.arrange('CENTER')" [disabled]="appService.selections.length < 2">Arrange Center</button>
            <button mat-menu-item (click)="appService.arrange('RIGHT')" [disabled]="appService.selections.length < 2">Arrange Right</button>
            <button mat-menu-item (click)="appService.arrange('TOP')" [disabled]="appService.selections.length < 2">Arrange Top</button>
            <button mat-menu-item (click)="appService.arrange('MIDDLE')" [disabled]="appService.selections.length < 2">Arrange Middle</button>
            <button mat-menu-item (click)="appService.arrange('BOTTOM')" [disabled]="appService.selections.length < 2">Arrange Bottom</button>
            <button mat-menu-item (click)="appService.placeInCenter('HORIZONTAL')">Center Horizontally</button>
            <button mat-menu-item (click)="appService.placeInCenter('VERTICAL')">Center Vertically</button>
          </ng-template>
        </mat-menu>
        <!-- <app-zoom (zoomChange)="onZoom($event)" [zoom]="appService.zoom"></app-zoom> -->
      </mat-toolbar-row>
    </mat-toolbar>
  `,
  styles: [``]
})
export class ToolBarComponent implements OnInit {
  init = false;

  constructor (public appService: AppService) {}

  ngOnInit() {
    setTimeout(() => {this.init = true; }, 100);
  }

  onZoom(value) {
    this.appService.zoom = value;
    this.appService.performOperation.next('ZOOM');
  }
}
