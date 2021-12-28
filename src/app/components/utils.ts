import { Direction, MazeMatrix, MazeValue, Position } from './models';

export const mazeWidth = 21;
export const mazeHeight = 21;
export const cellSize = 30;
export const speed = 10;

export function generateMaze(startX: number, startY: number): MazeMatrix {
  const width = mazeHeight;
  const height = mazeHeight;

  // fill wall
  const maze: MazeValue[] = Array(width * height).fill(MazeValue.Wall);

  // every other not wall
  for (let y = startY; y < height; y += 2) {
    for (let x = startX; x < width; x += 2) {
      maze[coordToIndex(x, y)] = MazeValue.Empty;
    }
  }

  maze[startY * mazeWidth + startX] = 0;

  function dfs(maze: MazeMatrix, startY: number, startX: number) {
    const frontier: Position[] = [];
    frontier.push({ x: startX, y: startY });
    const explored = new Set();
    explored.add([startY, startX]);
    let coord: Position;
    let gridY, gridX: number;
    let temp: Position[];

    while (frontier.length != 0) {
      coord = frontier.pop() ?? { x: 0, y: 0 };
      (gridY = coord.y), (gridX = coord.x);
      temp = [];

      if (
        moveable(maze, gridY + 2, gridX) &&
        !explored.has((gridY + 2) * width + gridX)
      ) {
        explored.add((gridY + 2) * width + gridX);
        maze[(gridY + 1) * width + gridX] = MazeValue.Empty;
        maze[(gridY + 2) * width + gridX] = MazeValue.Empty;
        temp.push({ x: gridX, y: gridY + 2 });
      }
      if (
        moveable(maze, gridY - 2, gridX) &&
        !explored.has((gridY - 2) * width + gridX)
      ) {
        explored.add((gridY - 2) * width + gridX);
        maze[(gridY - 1) * width + gridX] = MazeValue.Empty;
        maze[(gridY - 2) * width + gridX] = MazeValue.Empty;
        temp.push({ x: gridX, y: gridY - 2 });
      }
      if (
        moveable(maze, gridY, gridX + 2) &&
        !explored.has(gridY * width + gridX + 2)
      ) {
        explored.add(gridY * width + gridX + 2);
        maze[gridY * width + gridX + 1] = MazeValue.Empty;
        maze[gridY * width + gridX + 2] = MazeValue.Empty;
        temp.push({ x: gridX + 2, y: gridY });
      }
      if (
        moveable(maze, gridY, gridX - 2) &&
        !explored.has(gridY * width + gridX - 2)
      ) {
        explored.add(gridY * width + gridX - 2);
        maze[gridY * width + gridX - 1] = MazeValue.Empty;
        maze[gridY * width + gridX - 2] = MazeValue.Empty;
        temp.push({ x: gridX - 2, y: gridY });
      }
      shuffle(temp);
      for (let i = 0; i < temp.length; i++) {
        frontier.push(temp[i]);
      }
    }
  }

  dfs(maze, startY, startX);

  let r;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      r = Math.random();
      if (
        maze[(i - 1) * width + j] === MazeValue.Wall &&
        maze[(i + 1) * width + j] === MazeValue.Wall &&
        maze[i * width + j - 1] === MazeValue.Empty &&
        maze[i * width + j + 1] === MazeValue.Empty
      ) {
        if (r < 0.3) {
          maze[i * width + j] = MazeValue.Empty;
        }
      }
      if (
        maze[(i - 1) * width + j] === MazeValue.Empty &&
        maze[(i + 1) * width + j] === MazeValue.Empty &&
        maze[i * width + j - 1] === MazeValue.Wall &&
        maze[i * width + j + 1] === MazeValue.Wall
      ) {
        if (r < 0.3) {
          maze[i * width + j] = MazeValue.Empty;
        }
      }
    }
  }

  // rooms
  maze[(height - 2) * width + width - 2] = MazeValue.Empty;
  maze[(height - 3) * width + width - 2] = MazeValue.Empty;
  maze[(height - 2) * width + width - 3] = MazeValue.Empty;
  maze[(height - 3) * width + width - 3] = MazeValue.Empty;

  return maze;
}

export function coordToIndex(x: number, y: number) {
  return y * mazeWidth + x;
}

export function indexToCoord(index: number) {
  return {
    x: index % mazeWidth,
    y: Math.floor(index / mazeWidth),
  };
}

function shuffle(a: Position[]) {
  let j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}

export function moveable(grid: MazeMatrix, gridY: number, gridX: number) {
  if (gridY < 0 || gridY >= mazeHeight || gridX < 0 || gridX >= mazeHeight) {
    return false;
  }
  return grid[coordToIndex(gridX, gridY)] === MazeValue.Empty;
}

export function getNextPos(pos: Position, dir: Direction): Position {
  switch (dir) {
    case Direction.Right:
      return { ...pos, x: pos.x + 1 };

    case Direction.Left:
      return { ...pos, x: pos.x - 1 };
    case Direction.Down:
      return { ...pos, y: pos.y + 1 };
    case Direction.Up:
      return { ...pos, y: pos.y - 1 };
    default:
      return pos;
  }
}

export function directionToDegrees(dir: Direction) {
  let r = 90;
  switch (dir) {
    case Direction.Left:
      r = 270;
      break;
    case Direction.Right:
      r = 90;
      break;
    case Direction.Up:
      r = 0;
      break;
    case Direction.Down:
      r = 180;
  }
  return r;
}

export function randomDirection(): Direction {
  const rn = Math.random();
  if (rn < 0.25) {
    return Direction.Left;
  } else if (rn < 0.5) {
    return Direction.Right;
  } else if (rn < 0.75) {
    return Direction.Up;
  } else {
    return Direction.Down;
  }
}

export function randomInt(length: number) {
  return Math.round(Math.random() * length);
}

export function randomFromArray<T>(list: T[]): T {
  return list[randomInt(list.length - 1)];
}

export function getInitialPos() {
  return {
    x: randomInt(Math.round((mazeWidth - 1) / 2)) * 2,
    y: randomInt(Math.round((mazeHeight - 1) / 2)) * 2,
  };
}

export function getAvailableDirs(grid: MazeMatrix, pos: Position): Direction[] {
  return [
    { dir: Direction.Right, pos: { ...pos, x: pos.x + 1 } },
    { dir: Direction.Left, pos: { ...pos, x: pos.x - 1 } },
    { dir: Direction.Down, pos: { ...pos, y: pos.y + 1 } },
    { dir: Direction.Up, pos: { ...pos, y: pos.y + 1 } },
  ]
    .filter((p) => moveable(grid, p.pos.y, p.pos.x))
    .map((p) => p.dir);
}

export function getDistance(p1: Position, p2: Position) {
  const a = p1.x - p2.x;
  const b = p1.y - p2.y;

  return Math.sqrt(a * a + b * b);
}
