import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  ViewEncapsulation,
} from '@angular/core';
import { map } from 'rxjs/operators';

import { MazeValue } from '../models';
import { GameFacade } from '../game.facade';
import { cellSize, indexToCoord, mazeWidth } from '../utils';

interface Cell {
  id: string;
  value: MazeValue;
  x: number;
  y: number;
}

@Component({
  selector: 'cu-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['./maze.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MazeComponent {
  @HostBinding('class')
  elementClass = 'cu-maze';

  @HostBinding('style.width.px')
  readonly width = mazeWidth * cellSize;

  MazeValue = MazeValue;
  cellSize = cellSize;

  cells$ = this.facade.maze$.pipe(
    map((maze) =>
      maze.map((value, i) => ({
        id: i,
        value,
        ...indexToCoord(i),
      }))
    )
  );

  trackById = (item: Cell) => item?.id;

  constructor(public facade: GameFacade) {
    //
  }
}
