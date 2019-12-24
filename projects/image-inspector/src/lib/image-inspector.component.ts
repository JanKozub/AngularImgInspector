import {Component, Input, OnInit} from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'angular-image-inspector',
  templateUrl: `image-inspector.template.html`,
  styleUrls: [`image-inspector.styles.css`]
})
export class ImageInspectorComponent implements OnInit {

  currentX: number;

  @Input()
  wrapperW: number;
  @Input()
  wrapperH: number;
  @Input()
  imgW: number;
  @Input()
  imgH: number;
  @Input()
  overflowAnimationSpeed = 100;

  interval: number;
  currentY: number;
  imgX: number;
  imgY: number;

  constructor() {
  }

  private static isDeviceMobile() {
    return 'ontouchstart' in document.documentElement;
  }

  private static getPropNum(selector: string, prop: string) {
    return +$(selector).css(prop).replace(/[^-\d.]/g, '');
  }

  ngOnInit() {
    const imgContainer = $('img');
    imgContainer.css({
      width: this.imgW,
      height: this.imgH
    });
    $('#wrapper').css({
      width: this.wrapperW,
      height: this.wrapperH
    });
    if (!ImageInspectorComponent.isDeviceMobile()) {
      window.addEventListener('mousemove', (e) => this.onMouseMoveUpdate(e), false);
      window.addEventListener('mouseenter', (e) => this.onMouseMoveUpdate(e), false);
    }

    this.imgX = ImageInspectorComponent.getPropNum('img', 'left');
    this.imgY = ImageInspectorComponent.getPropNum('img', 'top');

    this.imgY = (this.wrapperH - this.imgH) / 2;
    this.imgX = (this.wrapperW - this.imgW) / 2;
    imgContainer.css({
      top: this.imgY,
      left: this.imgX
    });

    this.setPosition();
    this.checkOverflow();
  }

  private onMouseMoveUpdate(e) {
    this.currentX = e.pageX;
    this.currentY = e.pageY;
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
      let lastX;
      let lastY;
      const lastObjX = this.imgX;
      const lastObjY = this.imgY;
      if (ImageInspectorComponent.isDeviceMobile()) {
        start.preventDefault();
        const startTouches = start.touches[0];
        lastX = startTouches.pageX;
        lastY = startTouches.pageY;
        $('img').on('touchmove', (e) => {
          const touch = e.touches[0];
          this.currentX = touch.pageX;
          this.currentY = touch.pageY;

          this.definePosition(lastX, lastY, lastObjX, lastObjY);
        });
      } else {
        lastX = this.currentX;
        lastY = this.currentY;
        this.interval = setInterval(() => {
          this.definePosition(lastX, lastY, lastObjX, lastObjY);
        }, 10);
      }
    });
  }

  private definePosition(lastX, lastY, lastObjX, lastObjY) {
    const distanceToMoveX = this.currentX - lastX;
    if (distanceToMoveX !== 0) {
      this.imgX = lastObjX + distanceToMoveX;
    }
    if ((this.imgH > this.wrapperH)) {
      const distanceToMoveY = this.currentY - lastY;
      if (distanceToMoveY !== 0) {
        this.imgY = lastObjY + distanceToMoveY;
      }
    } else {
      this.imgY = (this.wrapperH - this.imgH) / 2;
    }
    $('img').css({
      left: this.imgX,
      top: this.imgY
    });
  }
}
