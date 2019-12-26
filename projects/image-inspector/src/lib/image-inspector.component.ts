import {Component, Input, OnInit} from '@angular/core';
import * as $ from 'jquery';
import 'hammerjs';

@Component({
  selector: 'angular-image-inspector',
  templateUrl: `image-inspector.template.html`,
  styleUrls: [`image-inspector.styles.css`]
})
export class ImageInspectorComponent implements OnInit {

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

  private hammer;

  constructor() {
  }

  private static isDeviceMobile() {
    return 'ontouchstart' in document.documentElement;
  }

  private static getPropNum(selector: string, prop: string) {
    return +$(selector).css(prop).replace(/[^-\d.]/g, '');
  }

  ngOnInit() {
    const img = $('img');

    img.on('load', () => { // if image is loaded call all functions
      this.hammer = new Hammer(document.getElementById('wrapper'));
      this.hammer.get('pinch').set({enable: true});

      img.css('width', this.imgSize); // set img size

      this.imgW = img.width(); // get current width and height of elements
      this.imgH = img.height();
      this.startW = this.imgW;
      this.startH = this.imgH;

      const wrapper = $('#wrapper');
      wrapper.css('width', this.wrapperWidth);
      wrapper.css('height', this.wrapperHeight);

      this.wrapperW = wrapper.width();
      this.wrapperH = wrapper.height();

      if (!ImageInspectorComponent.isDeviceMobile()) { // mouse position getter if not mobile
        window.addEventListener('mousemove', (e) => this.onMouseMoveUpdate(e), false);
        window.addEventListener('mouseenter', (e) => this.onMouseMoveUpdate(e), false);
      }

      this.imgCenterX = (this.wrapperW - this.imgW) / 2; // center image
      this.imgCenterY = (this.wrapperH - this.imgH) / 2;
      this.imgX = this.imgCenterX;
      this.imgY = this.imgCenterY;

      this.setImgXY();

      this.setPosition(); // call on needed handlers
      this.checkOverflow();
      this.handleDoubleClick();
    });
  }

  private checkOverflow() {
    $(document).on('mouseleave mouseup touchend touchcancel', () => { // On mouse/touch end

      this.checkOverflowX();

      if (this.isYAvailable()) { // if Y is available?
        this.checkOverflowY();
      }

      $('img').animate({left: this.imgX, top: this.imgY}, this.overflowAnimationSpeed);

      if (!ImageInspectorComponent.isDeviceMobile()) { // if device is not mobile clear mouse hold interval
        clearInterval(this.interval);
      }
    });
  }

  private checkOverflowX() {
    const wrapperX = ImageInspectorComponent.getPropNum('#wrapper', 'left');

    const halfWrapperX = (wrapperX + (this.wrapperW / 2));
    if ((this.imgX + this.imgW) < halfWrapperX) { // Overflow left
      this.imgX = halfWrapperX - this.imgW;
    }
    if (this.imgX > halfWrapperX) { // Overflow right
      this.imgX = halfWrapperX;
    }
  }

  private checkOverflowY() {
    const wrapperY = ImageInspectorComponent.getPropNum('#wrapper', 'top');

    const halfWrapperY = (wrapperY + (this.wrapperH / 2));
    if ((this.imgY + this.imgH) < halfWrapperY) { // Overflow top
      this.imgY = halfWrapperY - this.imgH;
    }
    if (this.imgY > halfWrapperY) { // Overflow bottom
      this.imgY = halfWrapperY;
    }
  }

  private setPosition() {
    $('img').on('mousedown touchstart', (start) => {
      const lastObjX = this.imgX; // getting img X,Y
      const lastObjY = this.imgY;
      if (ImageInspectorComponent.isDeviceMobile()) { // define touch type
        start.preventDefault();
        const startTouches = start.touches[0];
        this.lastX = startTouches.pageX; // getting start X,Y
        this.lastY = startTouches.pageY;
        $('img').on('touchmove', (e) => {
          const touch = e.touches[0];
          this.currentX = touch.pageX;
          this.currentY = touch.pageY;

          this.definePosition(lastObjX, lastObjY);
        });
      } else {
        this.lastX = this.currentX; // getting start X,Y
        this.lastY = this.currentY;
        this.interval = setInterval(() => { // when holding mouse1
          this.definePosition(lastObjX, lastObjY);
        }, 10);
      }
    });
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

  private handleDoubleClick() {
    this.isZoomed = false;
    this.hammer.on('doubletap', () => {
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
      $('img').animate({
        width: this.imgW,
        height: this.imgH,
        left: this.imgX,
        top: this.imgY
      }, 100);
      this.isZoomed = !this.isZoomed;
    });
  }

  private onMouseMoveUpdate(e) {
    this.currentX = e.pageX;
    this.currentY = e.pageY;
  }

  private isYAvailable() {
    return this.imgH > this.wrapperH;
  }

  private setImgXY() {
    $('img').css({
      top: this.imgY,
      left: this.imgX
    });
  }
}
