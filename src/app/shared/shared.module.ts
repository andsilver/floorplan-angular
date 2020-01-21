import { NgModule } from '@angular/core';

// Modules
import { MaterialModule, DesignModule } from './modules';

// Components
import { ZoomComponent } from './components';

@NgModule({
  imports: [
    MaterialModule,
    DesignModule
  ],
  exports: [
    MaterialModule,
    DesignModule,
    ZoomComponent
  ],
  providers: [],
  declarations: [ZoomComponent]
})
export class SharedModule { }
