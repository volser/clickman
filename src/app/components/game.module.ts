import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ClickupAgentComponent } from './clickup-agent/clickup-agent.component';
import { LoserAgentComponent } from './loser-agent/loser-agent.component';
import { MazeComponent } from './maze/maze.component';
import { GameComponent } from './game/game.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    MazeComponent,
    GameComponent,
    ClickupAgentComponent,
    LoserAgentComponent,
  ],
  exports: [GameComponent],
})
export class GameModule {}
