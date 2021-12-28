import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  ViewEncapsulation,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { timer } from '@rx-angular/cdk/zone-less';
import { animationFrameScheduler } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

import { Direction } from '../models';
import { GameFacade } from '../game.facade';
import { cellSize, directionToDegrees, moveable, speed } from '../utils';

@UntilDestroy()
@Component({
  selector: 'cu-clickup-agent',
  templateUrl: './clickup-agent.component.html',
  styleUrls: ['./clickup-agent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ClickupAgentComponent {
  @HostBinding('class')
  elementClass = 'cu-clickup-agent';

  @HostBinding('style.width.px')
  readonly width = cellSize;

  @HostBinding('style.height.px')
  readonly height = cellSize;

  @HostBinding('style.transition')
  get transition() {
    const time = this.timer / 1000 / 2;
    return `left ${time}s linear, top ${time}s linear`;
  }

  readonly timer = 70;
  readonly speed = speed;

  constructor(private el: ElementRef, private facade: GameFacade) {
    this.facade.clickupPosPixel$.pipe(untilDestroyed(this)).subscribe((pos) => {
      this.el.nativeElement.style.left = pos.x + 'px';
      this.el.nativeElement.style.top = pos.y + 'px';
    });

    this.facade.clickupDir$.pipe(untilDestroyed(this)).subscribe((dir) => {
      const deg = directionToDegrees(dir);
      this.el.nativeElement.style.transform = `rotate(${deg}deg)`;
    });

    timer(this.timer, this.timer, animationFrameScheduler)
      .pipe(
        withLatestFrom(
          this.facade.maze$,
          this.facade.clickupPosPixel$,
          this.facade.clickupDir$,
          this.facade.clickupDirIntended$
        ),
        untilDestroyed(this)
      )
      .subscribe(([, maze, pos, dir, dirIntended]) => {
        let curDir = dir;
        if (dir !== dirIntended) {
          switch (dir) {
            case Direction.Left:
            case Direction.Right:
              if (!(pos.x % cellSize)) {
                curDir = dirIntended;
                this.facade.clickupDir$.next(curDir);
              }
              break;
            case Direction.Up:
            case Direction.Down:
              if (!(pos.y % cellSize)) {
                curDir = dirIntended;
                this.facade.clickupDir$.next(curDir);
              }
              break;
          }
        }

        switch (curDir) {
          case Direction.Left:
            if (
              moveable(
                maze,
                Math.floor(pos.y / cellSize),
                Math.floor((pos.x - this.speed) / cellSize)
              )
            ) {
              this.facade.clickupPosPixel$.next({
                x: pos.x - this.speed,
                y: pos.y,
              });
            }
            break;
          case Direction.Up:
            if (
              moveable(
                maze,
                Math.floor((pos.y - this.speed) / cellSize),
                Math.floor(pos.x / cellSize)
              )
            ) {
              this.facade.clickupPosPixel$.next({
                x: pos.x,
                y: pos.y - this.speed,
              });
            }
            break;
          case Direction.Right:
            if (
              moveable(
                maze,
                Math.floor(pos.y / cellSize),
                Math.floor((pos.x + cellSize) / cellSize)
              )
            ) {
              this.facade.clickupPosPixel$.next({
                x: pos.x + this.speed,
                y: pos.y,
              });
            }
            break;
          case Direction.Down:
            if (
              moveable(
                maze,
                Math.floor((pos.y + cellSize) / cellSize),
                Math.floor(pos.x / cellSize)
              )
            ) {
              this.facade.clickupPosPixel$.next({
                x: pos.x,
                y: pos.y + this.speed,
              });
            }
            break;
        }
      });
  }
}
