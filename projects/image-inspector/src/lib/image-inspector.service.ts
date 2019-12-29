import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageInspectorService {

  isZoomedChange: Subject<boolean> = new Subject<boolean>();
  imgWChange: Subject<number> = new Subject<number>();
  imgHChange: Subject<number> = new Subject<number>();
  imgXChange: Subject<number> = new Subject<number>();
  imgYChange: Subject<number> = new Subject<number>();
  private isZoomed: boolean;
  private imgX: number;
  private imgY: number;
  private imgW: number;
  private imgH: number;
  private startW: number;
  private startH: number;
  private imgCenterX: number;
  private imgCenterY: number;
  private scale: number;

  constructor() {
  }

  setValues(isZoomed, imgX, imgY, imgW, imgH, startW, startH, imgCenterX, imgCenterY, scale) {
    this.isZoomed = isZoomed;
    this.imgX = imgX;
    this.imgY = imgY;
    this.imgW = imgW;
    this.imgH = imgH;
    this.startW = startW;
    this.startH = startH;
    this.imgCenterX = imgCenterX;
    this.imgCenterY = imgCenterY;
    this.scale = scale;
  }

  public setZoom() {
    if (this.isZoomed) { // if zoomed return to default values
      this.imgW = this.startW;
      this.imgH = this.startH;
      this.imgX = this.imgCenterX;
      this.imgY = this.imgCenterY;
    } else { // if not scale all values and animate
      this.imgW = this.imgW * this.scale;
      this.imgH = this.imgH * this.scale;
      this.imgX = ((this.startW - this.imgW) / 2) + this.imgCenterX;
      this.imgY = ((this.startH - this.imgH) / 2) + this.imgCenterY;
    }

    const selector = document.getElementsByTagName('img').item(0);
    selector.style.width = this.imgW + 'px';
    selector.style.height = this.imgH + 'px';
    selector.style.left = this.imgX + 'px';
    selector.style.top = this.imgY + 'px';

    this.isZoomed = !this.isZoomed;
    this.isZoomedChange.next(this.isZoomed); // Notifying component about values change
    this.imgWChange.next(this.imgW);
    this.imgHChange.next(this.imgH);
    this.imgXChange.next(this.imgX);
    this.imgYChange.next(this.imgY);
  }
}
