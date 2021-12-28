import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, timer } from 'rxjs';

import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import { Direction, Loser } from '../models';
import { GameFacade } from '../game.facade';
import {
  cellSize,
  directionToDegrees,
  getAvailableDirs,
  getDistance,
  getNextPos,
  moveable,
  randomDirection,
  randomFromArray,
} from '../utils';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { animationFrameScheduler } from '@rx-angular/cdk/zone-less';

const hints = [
  'SOS!',
  'Mayday!',
  'Help me!',
  'Fuck off!',
  'Don’t touch me',
  'I don’t want to die',
  'I’m too young to die',
  'WTF!?',
  'Go away!',
  'Leave me alone!',
  'You are better than me!',
  'You are the best!',
  'I love ClickUp',
  'I will be your slave!',
  'You are crazy!',
  'I’m leaving the game',
  'I’m out of the game',
  'Damn!',
  'Oh, My Lord',
  'Oh, My God',
];

@UntilDestroy()
@Component({
  selector: 'cu-loser-agent',
  templateUrl: './loser-agent.component.html',
  styleUrls: ['./loser-agent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class LoserAgentComponent implements OnChanges {
  @Input() item!: Loser;

  @HostBinding('class')
  elementClass = 'cu-loser-agent';

  @HostBinding('style.width.px')
  readonly width = cellSize;

  @HostBinding('style.height.px')
  readonly height = cellSize;

  @HostBinding('style.transition')
  get transition() {
    if (this.item) {
      const time = 1 / this.item.speed;
      return `left ${time}s linear, top ${time}s linear`;
    }
    return '';
  }

  item$ = new BehaviorSubject<Loser>(this.item);
  pos$ = this.item$.pipe(
    filter((it) => !!it),
    switchMap((item) => this.facade.getLoserPos(item.id))
  );
  clickupClose$ = combineLatest([this.pos$, this.facade.clickupPos$]).pipe(
    map(([p1, p2]) => getDistance(p1, p2) <= 5),
    distinctUntilChanged()
  );
  hint$ = this.clickupClose$.pipe(
    map((isClose) => (isClose ? randomFromArray(hints) : undefined)),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );

  dir = Direction.Right;

  constructor(private el: ElementRef, private facade: GameFacade) {
    this.pos$.pipe(untilDestroyed(this)).subscribe((pos) => {
      this.el.nativeElement.style.left = pos.x * cellSize + 'px';
      this.el.nativeElement.style.top = pos.y * cellSize + 'px';
    });

    this.item$
      .pipe(
        switchMap((item) =>
          item
            ? timer(
                1000 / item.speed,
                1000 / item.speed,
                animationFrameScheduler
              )
            : EMPTY
        ),
        withLatestFrom(this.facade.maze$, this.pos$),
        untilDestroyed(this)
      )
      .subscribe(([, maze, pos]) => {
        const validDirs = getAvailableDirs(maze, pos);

        if (validDirs.length > 2 && Math.random() < this.item.randomness) {
          this.dir = randomFromArray(validDirs);
        }
        const nextPos = getNextPos(pos, this.dir);
        if (moveable(maze, nextPos.y, nextPos.x)) {
          this.facade.setLoserPos(this.item.id, nextPos);
        } else {
          this.dir = randomDirection();
        }
        const deg = directionToDegrees(this.dir);
        this.el.nativeElement.children[0].style.transform = `rotate(${deg}deg)`;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item) {
      this.item$.next(this.item);
    }
  }
}
