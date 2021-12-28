import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

import { Loser } from '../models';
import { GameFacade } from '../game.facade';

@Component({
  selector: 'cu-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GameFacade],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('loadingEnter', [
      transition(':enter', [
        style({ transform: 'scale(0.6)', opacity: 0 }),
        animate('200ms', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class GameComponent implements OnInit, OnDestroy {
  @HostBinding('class')
  elementClass = 'cu-game';

  trackById = (item: Loser) => item?.id;

  audio?: HTMLAudioElement;

  constructor(public facade: GameFacade) {}

  ngOnInit(): void {
    this.audio = new Audio(
      'https://www.chosic.com/wp-content/uploads/2021/08/Loyalty_Freak_Music_-_04_-_It_feels_good_to_be_alive_too.mp3'
    );
    this.audio.play();
  }

  ngOnDestroy(): void {
    this.audio?.pause();
    this.audio?.removeAttribute('src'); // empty source
    this.audio?.load();
    this.audio = undefined;
  }
}
