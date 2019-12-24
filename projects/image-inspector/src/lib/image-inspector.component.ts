import {Component, Input, OnInit} from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'angular-image-inspector',
  templateUrl: `image-inspector.template.html`,
  styleUrls: [`image-inspector.styles.css`]
})
export class ImageInspectorComponent implements OnInit {

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
  mouseX: number;
  mouseY: number;
  imgContainerX: number;
  imgContainerY: number;

  constructor() {
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

    window.addEventListener('mousemove', (e) => this.onMouseMoveUpdate(e), false);
    window.addEventListener('mouseenter', (e) => this.onMouseMoveUpdate(e), false);
    this.imgContainerX = this.getPropNum('img', 'left');
    this.imgContainerY = this.getPropNum('img', 'top');

    if (!(this.imgH > this.wrapperH)) {  // is Y axis available
      this.imgContainerY = (this.wrapperH - this.imgH) / 2;
      imgContainer.css('top', this.imgContainerY);
    }

    this.setPosition();
    this.checkOverflow();
  }

  onMouseMoveUpdate(e) {
    this.mouseX = e.pageX;
    this.mouseY = e.pageY;
  }

  getPropNum(selector: string, prop: string) {
    return +$(selector).css(prop).replace(/[^-\d.]/g, '');
  }

  checkOverflow() {
    $(document).on('mouseleave mouseup', () => {

      this.checkOverflowX();

      if (this.imgH > this.wrapperH) {
        this.checkOverflowY();
      }

      $('img').animate({left: this.imgContainerX, top: this.imgContainerY}, this.overflowAnimationSpeed);

      window.clearInterval(this.interval);
    });
  }

  checkOverflowX() {
    const halfBoxW = (this.wrapperW / 2);
    if (this.imgContainerX > (this.wrapperW - halfBoxW)) {
      this.imgContainerX = (this.wrapperW - halfBoxW);
    }
    if ((this.imgContainerX + this.imgW) < halfBoxW) {
      this.imgContainerX = (this.imgW * -1) + halfBoxW;
    }
  }

  checkOverflowY() {
    const halfBoxH = (this.wrapperH / 2);
    if (this.imgContainerY > this.wrapperH - halfBoxH) {
      this.imgContainerY = (this.wrapperH - halfBoxH);
    }
    if ((this.imgContainerY + this.imgH) < halfBoxH) {
      this.imgContainerY = (this.imgH * -1) + halfBoxH;
    }
  }

  setPosition() {
    $('img').on('mousedown', () => {
      const lastX = this.mouseX;
      const lastY = this.mouseY;
      const lastObjX = this.imgContainerX;
      const lastObjY = this.imgContainerY;
      let lastDistanceX = 0;
      let lastDistanceY = 0;
      this.interval = window.setInterval(() => {
        const distanceToMoveX = this.mouseX - lastX;
        if (distanceToMoveX !== lastDistanceX) {
          lastDistanceX = distanceToMoveX;
          this.imgContainerX = lastObjX + distanceToMoveX;
        }
        if ((this.imgH > this.wrapperH)) {
          const distanceToMoveY = this.mouseY - lastY;
          if (distanceToMoveY !== lastDistanceY) {
            lastDistanceY = distanceToMoveY;
            this.imgContainerY = lastObjY + distanceToMoveY;
          }
        } else {
          this.imgContainerY = (this.wrapperH - this.imgH) / 2;
        }
        $('img').css({
          left: this.imgContainerX,
          top: this.imgContainerY
        });
      }, 10);
    });
  }
}
