import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

// Images and constants
const PLAYER_IMAGE = "https://dungeon-quest-rpg-assets.s3.amazonaws.com/aiden2.PNG";
const WALL_IMAGE = "https://dungeon-quest-rpg-assets.s3.amazonaws.com/cage+wall.jpg";
const EXIT_IMAGE = "https://dungeon-quest-rpg-assets.s3.amazonaws.com/maze+exit.jpg";
const LOGO_IMAGE = "https://dungeon-quest-rpg-assets.s3.amazonaws.com/DQlogoPNG2.png";
const DICE_ROLL_SOUND = "https://example.com/dice-roll-sound.mp3"; // Replace with actual sound file URL

const MAZE_SIZE = 15;
const CELL_SIZE = 40;
const PLAYER_SIZE = 40; // Adjusted size to fit cells
const EXIT_SIZE = 40;
const LOGO_SIZE = 500;

// Generate Maze Function
const generateMaze = (size) => {
  const maze = Array(size).fill().map(() => Array(size).fill(1));
  const stack = [[1, 1]];
  maze[1][1] = 0;

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const directions = [
      [0, -2], [0, 2], [-2, 0], [2, 0]
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && maze[ny][nx] === 1) {
        maze[y + dy / 2][x + dx / 2] = 0;
        maze[ny][nx] = 0;
        stack.push([nx, ny]);
      }
    }
  }

  maze[size - 2][size - 2] = 2; // Set exit
  return maze;
};

const AmazingMaze = () => {
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState([1, 1]);
  const [gameWon, setGameWon] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [diceResult, setDiceResult] = useState(0);

  useEffect(() => {
    setMaze(generateMaze(MAZE_SIZE));
  }, []);

  const movePlayer = (dx, dy) => {
    const [x, y] = playerPos;
    const newX = x + dx;
    const newY = y + dy;

    if (newX >= 0 && newX < MAZE_SIZE && newY >= 0 && newY < MAZE_SIZE && maze[newY][newX] !== 1) {
      setPlayerPos([newX, newY]);
      if (maze[newY][newX] === 2) {
        setGameWon(true);
        setFadeOut(true);
        setTimeout(() => resetGame(), 10000); // Reset after 10 seconds
      }
    }
  };

  // Dice roll functionality
  const rollDice = () => {
    console.log("Rolling dice...");

    const audio = new Audio(DICE_ROLL_SOUND);
    audio.play()
      .then(() => console.log("Playing sound"))  // Confirm sound played
      .catch((err) => console.error("Audio error: ", err));  // Log errors

    const result = Math.floor(Math.random() * 6) + 1; // Simulate dice roll
    setDiceResult(result);

    console.log(`Dice result: ${result}`);

    const directions = [
      [0, -1], // Up
      [0, 1],  // Down
      [-1, 0], // Left
      [1, 0],  // Right
    ];
    const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
    movePlayer(dx * result, dy * result);
  };

  const resetGame = () => {
    setMaze(generateMaze(MAZE_SIZE));
    setPlayerPos([1, 1]);
    setGameWon(false);
    setFadeOut(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
         style={{ backgroundImage: `url('https://dungeon-quest-rpg-assets.s3.amazonaws.com/mazebackground.jpg')` }}>
      <img src={LOGO_IMAGE} alt="Game Logo" className="w-80 h-auto mx-auto mb-4" />
      <h1 className="text-white text-5xl font-bold mb-6">It's A-MAZE-ing!</h1>
      {gameWon ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Congratulations! You've escaped the maze!</h2>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className={`relative ${fadeOut ? 'fade-out' : ''}`}>
          {maze.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px`, opacity: fadeOut ? 0 : 1, transition: 'opacity 5s' }}
                  className="border border-gray-300 flex items-center justify-center"
                >
                  {cell === 1 ? (
                    <img src={WALL_IMAGE} alt="Wall" style={{ width: '100%', height: '100%' }} />
                  ) : cell === 2 ? (
                    <img src={EXIT_IMAGE} alt="Exit" style={{ width: `${EXIT_SIZE}px`, height: `${EXIT_SIZE}px` }} />
                  ) : null}
                  {x === playerPos[0] && y === playerPos[1] && (
                    <img src={PLAYER_IMAGE} alt="Player" style={{ width: `${PLAYER_SIZE}px`, height: `${PLAYER_SIZE}px`, position: 'absolute' }} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 gap-2">
        <button onClick={rollDice} className="p-2 bg-gray-200 rounded">Roll Dice</button>
        <div className="text-white text-2xl">Dice Result: {diceResult}</div>
      </div>
    </div>
  );
};

export default AmazingMaze;
