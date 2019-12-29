import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import 'hammerjs';
import {ImageInspectorService} from './image-inspector.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'angular-image-inspector',
  templateUrl: `image-inspector.template.html`,
  styleUrls: [`image-inspector.styles.css`]
})
export class ImageInspectorComponent implements OnInit, OnDestroy {

  @Input()
  private wrapperWidth: string;
  @Input()
  private wrapperHeight: string;
  @Input()
  private imgSize: string;
  @Input()
  private overflowAnimationSpeed = 100;
  @Input()
  private scale = 1.6;
  @Input()
  private overflowRatio = 0.5;

  private interval: number;
  private currentY: number;
  private currentX: number;
  private imgX: number;
  private imgY: number;
  private wrapperW: number;
  private wrapperH: number;
  private imgW: number;
  private imgH: number;
  private lastX: number;
  private lastY: number;
  private isZoomed = false;
  private startW: number;
  private startH: number;
  private imgCenterX: number;
  private imgCenterY: number;

  private imgSelector: HTMLImageElement;

  private hammer;
  private subscription: Subscription;

  constructor(private imageInspectorService: ImageInspectorService) { // Listening for variables changes in service
    this.subscription = imageInspectorService.isZoomedChange
      .subscribe((value) => this.isZoomed = value);
    this.subscription = imageInspectorService.imgXChange
      .subscribe((value) => this.imgX = value);
    this.subscription = imageInspectorService.imgYChange
      .subscribe((value) => this.imgY = value);
    this.subscription = imageInspectorService.imgWChange
      .subscribe((value) => this.imgW = value);
    this.subscription = imageInspectorService.imgHChange
      .subscribe((value) => this.imgH = value);
  }

  ngOnInit() {
    this.imgSelector = document.getElementsByTagName('img').item(0);

    this.imgSelector.addEventListener('load', () => { // if image is loaded call all functions
      this.hammer = new Hammer(document.getElementById('wrapper'));
      this.hammer.get('pinch').set({enable: true});

      this.imgSelector.style.width = this.imgSize; // set img size

      this.imgW = +this.imgSelector.offsetWidth; // get current width and height of elements
      this.imgH = +this.imgSelector.offsetHeight;
      this.startW = this.imgW;
      this.startH = this.imgH;

      const wrapper = document.getElementById('wrapper');
      wrapper.style.width = this.wrapperWidth;
      wrapper.style.height = this.wrapperHeight;

      this.wrapperW = wrapper.offsetWidth;
      this.wrapperH = wrapper.offsetHeight;

      if (!this.isDeviceMobile()) { // mouse position getter if not mobile
        window.addEventListener('mousemove', (e) => this.onMouseMoveUpdate(e), false);
        window.addEventListener('mouseenter', (e) => this.onMouseMoveUpdate(e), false);
      }

      this.imgCenterX = (this.wrapperW - this.imgW) / 2; // center image
      this.imgCenterY = (this.wrapperH - this.imgH) / 2;
      this.imgX = this.imgCenterX;
      this.imgY = this.imgCenterY;

      this.setImgXY();

      // call on needed handlers
      if (this.isDeviceMobile()) { // define touch type
        this.imgSelector.addEventListener('touchstart', (start) => this.setPositionTouch(start), false);
      } else {
        this.imgSelector.addEventListener('mousedown', (start) => this.setPositionMouse(start), false);
      }

      document.getElementById('wrapper').addEventListener('mouseleave', () => this.checkOverflow(), false);
      document.getElementById('wrapper').addEventListener('mouseup', () => this.checkOverflow(), false);
      document.getElementById('wrapper').addEventListener('touchend', () => this.checkOverflow(), false);
      document.getElementById('wrapper').addEventListener('touchcancel', () => this.checkOverflow(), false);

      this.handleDoubleClick();
      this.imageInspectorService.setValues(this.isZoomed, this.imgX, this.imgY, this.imgW,
        this.imgH, this.startW, this.startH, this.imgCenterX, this.imgCenterY, this.scale);
    });
  }

  private checkOverflow() {
    const wrapperX = +document.getElementById('wrapper').style.left.replace(/[^-\d.]/g, '');

    const halfWrapperX = (wrapperX + (this.wrapperW * this.overflowRatio));
    if ((this.imgX + this.imgW) < halfWrapperX) { // Overflow left
      this.imgX = halfWrapperX - this.imgW;
    }
    if (this.imgX > halfWrapperX) { // Overflow right
      this.imgX = halfWrapperX;
    }

    if (this.isYAvailable()) { // if Y is available?
      this.checkOverflowY();
    }

    this.imgSelector.style.left = String(this.imgX) + 'px';
    this.imgSelector.style.top = String(this.imgY) + 'px';

    if (!this.isDeviceMobile()) { // if device is not mobile clear mouse hold interval
      clearInterval(this.interval);
    }
  }

  private checkOverflowY() {
    const wrapperY = +document.getElementById('wrapper').style.top.replace(/[^-\d.]/g, '');

    const halfWrapperY = (wrapperY + (this.wrapperH * this.overflowRatio));
    if ((this.imgY + this.imgH) < halfWrapperY) { // Overflow top
      this.imgY = halfWrapperY - this.imgH;
    }
    if (this.imgY > halfWrapperY) { // Overflow bottom
      this.imgY = halfWrapperY;
    }
  }

  private setPositionTouch(start: TouchEvent) {
    const lastObjX = this.imgX; // getting img X,Y
    const lastObjY = this.imgY;

    start.preventDefault();
    const startTouches = start.touches[0];
    this.lastX = startTouches.pageX; // getting start X,Y
    this.lastY = startTouches.pageY;
    this.imgSelector.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.currentX = touch.pageX;
      this.currentY = touch.pageY;

      this.definePosition(lastObjX, lastObjY);
    });
  }

  private setPositionMouse(start: MouseEvent) {
    const lastObjX = this.imgX; // getting img X,Y
    const lastObjY = this.imgY;

    this.lastX = this.currentX; // getting start X,Y
    this.lastY = this.currentY;

    this.interval = setInterval(() => { // when holding mouse1
      this.definePosition(lastObjX, lastObjY);
    }, 10);
  }

  private definePosition(lastObjX: number, lastObjY: number) {
    const distanceToMoveX = this.currentX - this.lastX;
    if (distanceToMoveX !== 0) {
      this.imgX = lastObjX + distanceToMoveX; // setting new X
    }
    if (this.isYAvailable()) { // if Y available set new value
      const distanceToMoveY = this.currentY - this.lastY;
      if (distanceToMoveY !== 0) {
        this.imgY = lastObjY + distanceToMoveY;
      }
    }
    this.setImgXY();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private handleDoubleClick() {
    this.isZoomed = false;
    this.hammer.on('doubletap', () => {
      this.imageInspectorService.setZoom();
    });
  }

  private onMouseMoveUpdate(e) {
    this.currentX = e.pageX;
    this.currentY = e.pageY;
  }

  private isDeviceMobile() {
    return 'ontouchstart' in document.documentElement;
  }

  private isYAvailable() {
    return this.imgH > this.wrapperH;
  }

  private setImgXY() {
    this.imgSelector.style.top = String(this.imgY) + 'px';
    this.imgSelector.style.left = String(this.imgX) + 'px';
  }
}
