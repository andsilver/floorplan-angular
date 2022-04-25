import { NgModule } from '@angular/core';

// Modules
import { MaterialModule, DesignModule } from './modules';

// Components
import { ZoomComponent } from './components';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    MaterialModule,
    DesignModule,
    FontAwesomeModule
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
