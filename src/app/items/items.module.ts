import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PreviewFurnitureComponent } from './preview-furniture.component';
import { ItemsComponent } from './items.component';
import { ChairsLayoutComponent } from './chairs-layout.component';

@NgModule({
  imports: [SharedModule],
  declarations: [ItemsComponent, PreviewFurnitureComponent, ChairsLayoutComponent],
  exports: [ItemsComponent, PreviewFurnitureComponent, ChairsLayoutComponent],
  providers: [],
  entryComponents: [ChairsLayoutComponent]
})
export class ItemsModule { }
