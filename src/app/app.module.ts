import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {ImgSliderComponent} from './img-slider/img-slider.component';
import {ImageInspectorModule} from '../../projects/image-inspector/src/lib/image-inspector.module';

@NgModule({
  declarations: [
    AppComponent,
    ImgSliderComponent
  ],
  imports: [
    BrowserModule,
    ImageInspectorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
