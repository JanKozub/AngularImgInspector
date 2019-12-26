import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {ImageInspectorModule} from '../../projects/image-inspector/src/lib/image-inspector.module';
import {ImageInspectorService} from '../../projects/image-inspector/src/lib/image-inspector.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ImageInspectorModule
  ],
  providers: [ImageInspectorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
