import {Component} from '@angular/core';
import {ImageInspectorService} from '../../projects/image-inspector/src/lib/image-inspector.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sliderAngular';

  constructor(private imageInspectorService: ImageInspectorService) {
  }

  setZoom() {
    this.imageInspectorService.setZoom();
  }
}
