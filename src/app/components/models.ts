import { KEY_CODES } from '@cu/keyboard/consts/key-codes';

export enum MazeValue {
  Empty = 0,
  Wall = 1,
  ClickMan = 2,
  Agent = 3,
}

export type MazeMatrix = MazeValue[];

export type Position = { x: number; y: number };

export enum Direction {
  Right = KEY_CODES.ARROW_RIGHT,
  Left = KEY_CODES.ARROW_LEFT,
  Up = KEY_CODES.ARROW_UP,
  Down = KEY_CODES.ARROW_DOWN,
}

export interface Loser {
  id: string;
  name: string;
  speed: number;
  randomness: number;
}

export type InitialLoser = Pick<Loser, 'id' | 'name'>;
