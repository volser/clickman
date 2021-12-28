import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent } from '@rx-angular/cdk';
import * as confetti from 'canvas-confetti';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  withLatestFrom,
} from 'rxjs/operators';
import { CU2_COLORS, KEY_CODES } from './const';

import { Direction, InitialLoser, Loser, MazeMatrix, Position } from './models';
import { cellSize, generateMaze, getInitialPos, randomInt } from './utils';

const monday: InitialLoser = {
  id: 'monday',
  name: 'Monday',
};

const airtable: InitialLoser = {
  id: 'airtable',
  name: 'Airtable',
};

const asana: InitialLoser = {
  id: 'asana',
  name: 'Asana',
};

const basecamp: InitialLoser = {
  id: 'basecamp',
  name: 'Basecamp',
};

const jira: InitialLoser = {
  id: 'jira',
  name: 'Jira',
};

const notion: InitialLoser = {
  id: 'notion',
  name: 'Notion',
};

const smartsheet: InitialLoser = {
  id: 'smartsheet',
  name: 'Smartsheet',
};

const todoist: InitialLoser = {
  id: 'todoist',
  name: 'Todoist',
};

const wrike: InitialLoser = {
  id: 'wrike',
  name: 'Wrike',
};

const trello: InitialLoser = {
  id: 'trello',
  name: 'Trello',
};

const defaultLosers = [
  monday,
  airtable,
  asana,
  basecamp,
  jira,
  notion,
  smartsheet,
  todoist,
  wrike,
  trello,
];

@UntilDestroy()
@Injectable()
export class GameFacade {
  readonly maze$ = new BehaviorSubject<MazeMatrix>(generateMaze(0, 0));
  readonly clickupPosPixel$ = new BehaviorSubject<Position>({ x: 0, y: 0 });
  readonly clickupPos$ = this.clickupPosPixel$.pipe(
    map((pos) => ({
      x: Math.floor(pos.x / cellSize),
      y: Math.floor(pos.y / cellSize),
    })),
    distinctUntilChanged(isEqual)
  );
  readonly clickupDir$ = new BehaviorSubject<Direction>(Direction.Right);
  readonly clickupDirIntended$ = new BehaviorSubject<Direction>(
    Direction.Right
  );
  readonly losers$ = new BehaviorSubject<Loser[]>(this.getLosers());
  readonly eatenLosers$ = new BehaviorSubject<Loser[]>([]);
  readonly losersPos$ = new BehaviorSubject<Record<Loser['id'], Position>>(
    this.getRandomLosersPos()
  );

  constructor(@Inject(DOCUMENT) private document: Document) {
    fromEvent<KeyboardEvent>(this.document, 'keydown')
      .pipe(withLatestFrom(this.clickupDir$), untilDestroyed(this))
      .subscribe(([e, dir]) => {
        if (
          [
            Direction.Right,
            Direction.Left,
            Direction.Up,
            Direction.Down,
          ].includes(e.which) &&
          dir !== e.which
        ) {
          this.clickupDirIntended$.next(e.which);
          console.log('New direction', e.which);
        }
        if (e.which === KEY_CODES.ENTER) {
          this.reset();
        }
      });

    combineLatest([this.clickupPos$, this.losers$, this.losersPos$])
      .pipe(untilDestroyed(this))
      .subscribe(([clickupPos, losers, loserPosMap]) => {
        losers.forEach((loser) => {
          if (
            loserPosMap[loser.id]?.x === clickupPos.x &&
            loserPosMap[loser.id]?.y === clickupPos.y
          ) {
            this.eatLoser(loser);
          }
        });
      });

    this.losers$
      .pipe(
        filter((d) => !d.length),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.showConfetti();
      });
  }

  getLoserPos(id: Loser['id']): Observable<Position> {
    return this.losersPos$.pipe(
      map((posMap) => posMap[id] ?? { x: 0, y: 0 }),
      distinctUntilChanged(isEqual)
    );
  }

  setLoserPos(id: Loser['id'], pos: Position) {
    this.losersPos$.pipe(first(), untilDestroyed(this)).subscribe((posMap) => {
      this.losersPos$.next({ ...posMap, [id]: pos });
    });
  }

  eatLoser(loser: Loser) {
    combineLatest([this.losers$, this.eatenLosers$])
      .pipe(first(), untilDestroyed(this))
      .subscribe(([losers, eatenLosers]) => {
        this.losers$.next(losers.filter((l) => l.id !== loser.id));
        this.eatenLosers$.next([...eatenLosers, loser]);
      });
  }

  getLosers(): Loser[] {
    return defaultLosers.map((l) => ({
      ...l,
      randomness: Math.random(),
      speed: 1 + randomInt(9),
    }));
  }

  getRandomLosersPos() {
    return defaultLosers.reduce((s, it) => {
      s[it.id] = getInitialPos();
      return s;
    }, {} as Record<Loser['id'], Position>);
  }

  reset() {
    this.clickupPosPixel$.next({ x: 0, y: 0 });
    this.maze$.next(generateMaze(0, 0));
    this.clickupDir$.next(Direction.Right);
    this.losers$.next(this.getLosers());
    this.eatenLosers$.next([]);
    this.losersPos$.next(this.getRandomLosersPos());
  }

  private showConfetti() {
    confetti({
      particleCount: 600,
      spread: 500,
      startVelocity: 150,
      origin: {
        y: 1.4,
      },
      zIndex: 1000,
      colors: [
        CU2_COLORS.yellow,
        CU2_COLORS.cyan,
        CU2_COLORS.magenta,
        CU2_COLORS.purple,
      ],
    });
  }
}
