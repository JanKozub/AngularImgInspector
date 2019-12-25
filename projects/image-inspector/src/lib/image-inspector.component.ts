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
  private imgWidth: string;
  @Input()
  private imgHeight: string;
  @Input()
  private overflowAnimationSpeed = 100;

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
    this.hammer = new Hammer(document.getElementById('wrapper'));
    this.hammer.get('pinch').set({enable: true});

    const img = $('img');
    img.css('width', this.imgWidth);
    img.css('height', this.imgHeight);

    this.imgW = img.width();
    this.imgH = img.height();

    const wrapper = $('#wrapper');
    wrapper.css('width', this.wrapperWidth);
    wrapper.css('height', this.wrapperHeight);

    this.wrapperW = wrapper.width();
    this.wrapperH = wrapper.height();

    if (!ImageInspectorComponent.isDeviceMobile()) {
      window.addEventListener('mousemove', (e) => this.onMouseMoveUpdate(e), false);
      window.addEventListener('mouseenter', (e) => this.onMouseMoveUpdate(e), false);
    }

    this.imgX = ImageInspectorComponent.getPropNum('img', 'left');
    this.imgY = ImageInspectorComponent.getPropNum('img', 'top');

    this.imgY = (this.wrapperH - this.imgH) / 2;
    this.imgX = (this.wrapperW - this.imgW) / 2;

    img.css({
      top: this.imgY,
      left: this.imgX
    });

    this.setPosition();
    this.checkOverflow();
    this.handleDoubleClick();
    this.handlePinch();
  }

  private checkOverflow() {
    $(document).on('mouseleave mouseup touchend touchcancel', () => {

      this.checkOverflowX();

      if (this.imgH > this.wrapperH) {
        this.checkOverflowY();
      }

      $('img').animate({left: this.imgX, top: this.imgY}, this.overflowAnimationSpeed);

      clearInterval(this.interval);
    });
  }

  private checkOverflowX() {
    const halfBoxW = (this.wrapperW / 2);
    if (this.imgX > (this.wrapperW - halfBoxW)) {
      this.imgX = (this.wrapperW - halfBoxW);
    }
    if ((this.imgX + this.imgW) < halfBoxW) {
      this.imgX = (this.imgW * -1) + halfBoxW;
    }
  }

  private checkOverflowY() {
    const halfBoxH = (this.wrapperH / 2);
    if (this.imgY > this.wrapperH - halfBoxH) {
      this.imgY = (this.wrapperH - halfBoxH);
    }
    if ((this.imgY + this.imgH) < halfBoxH) {
      this.imgY = (this.imgH * -1) + halfBoxH;
    }
  }

  private setPosition() {
    $('img').on('mousedown touchstart', (start) => {
      const lastObjX = this.imgX;
      const lastObjY = this.imgY;
      if (ImageInspectorComponent.isDeviceMobile()) {
        start.preventDefault();
        const startTouches = start.touches[0];
        this.lastX = startTouches.pageX;
        this.lastY = startTouches.pageY;
        $('img').on('touchmove', (e) => {
          const touch = e.touches[0];
          this.currentX = touch.pageX;
          this.currentY = touch.pageY;

          this.definePosition(lastObjX, lastObjY);
        });
      } else {
        this.lastX = this.currentX;
        this.lastY = this.currentY;
        this.interval = setInterval(() => {
          this.definePosition(lastObjX, lastObjY);
        }, 10);
      }
    });
  }

  private definePosition(lastObjX: number, lastObjY: number) {
    const distanceToMoveX = this.currentX - this.lastX;
    if (distanceToMoveX !== 0) {
      this.imgX = lastObjX + distanceToMoveX;
    }
    if ((this.imgH > this.wrapperH)) {
      const distanceToMoveY = this.currentY - this.lastY;
      if (distanceToMoveY !== 0) {
        this.imgY = lastObjY + distanceToMoveY;
      }
    }
    $('img').css({
      left: this.imgX,
      top: this.imgY
    });
  }

  private onMouseMoveUpdate(e) {
    this.currentX = e.pageX;
    this.currentY = e.pageY;
  }

  private handleDoubleClick() {
    this.isZoomed = false;
    this.hammer.on('doubletap', () => {
      if (this.isZoomed) {
        $('img').css('transform', 'scale(1)');
      } else {
        $('img').css('transform', 'scale(1.5)');
      }
      this.isZoomed = !this.isZoomed;
    });
  }

  private handlePinch() {
    this.hammer.on('pinch', (e) => {
      this.isZoomed = true;
      if (e.scale > 0.8 && e.scale < 2) {
        $('img').css('transform', 'scale(' + e.scale + ')');
      }
    });

    this.hammer.on('pinchend', (e) => {
      if (e.scale > 0.8 && e.scale < 2) {
        $('img').css('transform', 'scale(' + e.scale + ')');
      }
    });
  }
}
