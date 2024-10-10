import React, { useState, useEffect, useRef } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const MAZE_SIZE = 10;
const INITIAL_MONSTER_PROBABILITY = 0.2;
const MONSTER_PROBABILITY_INCREASE = 0.05;
const ENEMY_HEALTH = 10;

// Updated monster video URLs
const monsterVideos = [
  "https://dcact2.s3.amazonaws.com/rAtsAttack!+-+Made+with+Clipchamp.mp4",
  "https://dcact2.s3.amazonaws.com/GeorgeOrc+-+Made+with+Clipchamp.mp4",
  "https://dcact2.s3.amazonaws.com/Ernie+monster+level+1+video+-+Made+with+Clipchamp.mp4",
  "https://dcact2.s3.amazonaws.com/bert+level+1+monster+video+-+Made+with+Clipchamp.mp4",
  "https://dcact2.s3.amazonaws.com/chad+monster+video+-+Made+with+Clipchamp.mp4"
];

// If you want to add new videos, append them here as needed
const additionalMonsterVideos = [
  "https://dcact2.s3.amazonaws.com/Ernie+Level+2+video+-+Made+with+Clipchamp.mp4",
  "https://dcact2.s3.amazonaws.com/Ernie+3+video+-+Made+with+Clipchamp.mp4"
];
const generateMaze = (size) => {
  const maze = Array(size).fill(null).map(() => Array(size).fill('wall'));
  const stack = [[0, 0]];
  maze[0][0] = 'path';

  while (stack.length) {
    const [x, y] = stack.pop();
    const directions = [
      [0, 2], [2, 0], [0, -2], [-2, 0],
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < size && ny >= 0 && ny < size && maze[nx][ny] === 'wall') {
        maze[nx][ny] = 'path';
        maze[x + dx / 2][y + dy / 2] = 'path';
        stack.push([nx, ny]);
      }
    }
  }
  return maze;
};

const MazeSquare = ({ type, isPlayer }) => (
  <div
    className={`w-full h-0 pb-[100%] border border-gray-800 relative`}
    style={{
      backgroundImage: type === 'wall'
        ? "url('/gameboard background.jpg')"
        : "url('/castle hall1.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    {isPlayer && (
      <img
        src="/AidenPNG.png"
        alt="Hero"
        className="player-character absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 object-contain"
      />
    )}
  </div>
);

const Board = ({ board, playerPosition }) => (
  <div className="grid gap-0 border-4 border-gray-800 p-2 bg-gray-300 rounded-lg shadow-lg w-full max-w-md mx-auto"
       style={{ gridTemplateColumns: `repeat(${MAZE_SIZE}, minmax(0, 1fr))` }}>
    {board.map((row, i) =>
      row.map((cell, j) => (
        <MazeSquare
          key={`${i}-${j}`}
          type={cell}
          isPlayer={playerPosition[0] === i && playerPosition[1] === j}
        />
      ))
    )}
  </div>
);

const DiceRoll = ({ onRoll }) => {
  const [result, setResult] = useState(1);
  const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const DiceIcon = diceIcons[result - 1];
  const audioRef = useRef(null);

  const rollDice = () => {
    const newResult = Math.floor(Math.random() * 6) + 1;
    setResult(newResult);
    onRoll(newResult);
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button onClick={rollDice} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
        Roll Dice
      </button>
      <DiceIcon size={48} className="text-blue-500" />
      <audio ref={audioRef} src="/dice-95077.mp3" />
    </div>
  );
};

const ControlButtons = ({ onMove }) => (
  <div className="flex flex-col items-center mt-4">
    <div className="flex space-x-2 mb-2">
      <button onClick={() => onMove('up')} className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 transition duration-200">
        Up
      </button>
    </div>
    <div className="flex space-x-2 mb-2">
      <button onClick={() => onMove('left')} className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 transition duration-200">
        Left
      </button>
      <button onClick={() => onMove('right')} className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 transition duration-200">
        Right
      </button>
    </div>
    <div className="flex space-x-2">
      <button onClick={() => onMove('down')} className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 transition duration-200">
        Down
      </button>
    </div>
  </div>
);

const MonsterEncounter = ({ video, onClose, inCombat }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-75">
      <video
        ref={videoRef}
        src={video}
        className="max-w-full max-h-full"
        loop
        autoPlay
      />
      {!inCombat && (
        <button
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      )}
    </div>
  );
};

const CombatSystem = ({ onCombatEnd }) => {
  const [enemyHealth, setEnemyHealth] = useState(ENEMY_HEALTH);
  const [playerRoll, setPlayerRoll] = useState(null);
  const defeatSoundRef = useRef(null);

  const handleRoll = (result) => {
    setPlayerRoll(result);
    setEnemyHealth(prevHealth => Math.max(0, prevHealth - result));
  };

  useEffect(() => {
    if (enemyHealth === 0) {
      if (defeatSoundRef.current) {
        defeatSoundRef.current.play()
          .then(() => {
            console.log("Defeat sound played successfully");
            setTimeout(onCombatEnd, 1000);
          })
          .catch(error => {
            console.error("Error playing defeat sound:", error);
            onCombatEnd();
          });
      } else {
        console.error("Defeat sound reference not found");
        onCombatEnd();
      }
    }
  }, [enemyHealth, onCombatEnd]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-50">
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Combat!</h2>
          <p>Enemy Health: {enemyHealth}</p>
          {playerRoll && <p>You rolled: {playerRoll}</p>}
        </div>
        <DiceRoll onRoll={handleRoll} />
        <audio ref={defeatSoundRef} src="/sword-slash-and-swing-185432.mp3" preload="auto" />
      </div>
    </div>
  );
};

function App() {
  const [playerPosition, setPlayerPosition] = useState([0, 0]);
  const [board, setBoard] = useState(generateMaze(MAZE_SIZE));
  const [movesLeft, setMovesLeft] = useState(0);
  const [visitedSquares, setVisitedSquares] = useState(new Set(['0,0']));
  const [monsterProbability, setMonsterProbability] = useState(INITIAL_MONSTER_PROBABILITY);
  const [currentMonster, setCurrentMonster] = useState(null);
  const [inCombat, setInCombat] = useState(false);
  const footstepsAudioRef = useRef(null);

  const spawnMonster = () => {
    if (Math.random() < monsterProbability) {
      return monsterVideos[Math.floor(Math.random() * monsterVideos.length)];
    }
    return null;
  };

  const movePlayer = (newPosition) => {
    const [x, y] = newPosition;
    setPlayerPosition(newPosition);
    setMovesLeft(prevMoves => prevMoves - 1);
    
    setVisitedSquares(prev => new Set(prev).add(`${x},${y}`));

    const monster = spawnMonster();
    if (monster) {
      setCurrentMonster(monster);
      setInCombat(true);
      setMonsterProbability(INITIAL_MONSTER_PROBABILITY);
    } else {
      setMonsterProbability(prev => Math.min(prev + MONSTER_PROBABILITY_INCREASE, 1));
    }

    if (footstepsAudioRef.current) {
      footstepsAudioRef.current.currentTime = 0;
      footstepsAudioRef.current.play();
    }
  };

  const handleKeyPress = (event) => {
    if (movesLeft > 0 && !inCombat) {
      const [x, y] = playerPosition;
      let newPosition = [...playerPosition];

      switch (event.key) {
        case 'ArrowUp':
          newPosition = [x > 0 && board[x - 1][y] === 'path' ? x - 1 : x, y];
          break;
        case 'ArrowDown':
          newPosition = [x < MAZE_SIZE - 1 && board[x + 1][y] === 'path' ? x + 1 : x, y];
          break;
        case 'ArrowLeft':
          newPosition = [x, y > 0 && board[x][y - 1] === 'path' ? y - 1 : y];
          break;
        case 'ArrowRight':
          newPosition = [x, y < MAZE_SIZE - 1 && board[x][y + 1] === 'path' ? y + 1 : y];
          break;
        default:
          return;
      }

      if (newPosition[0] !== x || newPosition[1] !== y) {
        movePlayer(newPosition);
      }
    }
  };

  const handleRoll = (result) => {
    setMovesLeft(result);
  };

  const handleMove = (direction) => {
    if (movesLeft > 0 && !inCombat) {
      const [x, y] = playerPosition;
      let newPosition = [...playerPosition];

      switch (direction) {
        case 'up':
          newPosition = [x > 0 && board[x - 1][y] === 'path' ? x - 1 : x, y];
          break;
        case 'down':
          newPosition = [x < MAZE_SIZE - 1 && board[x + 1][y] === 'path' ? x + 1 : x, y];
          break;
        case 'left':
          newPosition = [x, y > 0 && board[x][y - 1] === 'path' ? y - 1 : y];
          break;
        case 'right':
          newPosition = [x, y < MAZE_SIZE - 1 && board[x][y + 1] === 'path' ? y + 1 : y];
          break;
        default:
          return;
      }

      if (newPosition[0] !== x || newPosition[1] !== y) {
        movePlayer(newPosition);
      }
    }
  };

  const handleCombatEnd = () => {
    setInCombat(false);
    setCurrentMonster(null);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [playerPosition, board, movesLeft, inCombat]);

  return (
    <div className="App container mx-auto p-4 min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Legend of the Minotaur</h1>
      <div className="flex flex-col md:flex-row justify-center items-center w-full">
        <Board board={board} playerPosition={playerPosition} />
        <DiceRoll onRoll={handleRoll} />
      </div>
      <ControlButtons onMove={handleMove} />
      <p className="mt-4 text-lg font-semibold">Moves left: {movesLeft}</p>
      <p className="mt-2 text-md">Monster Probability: {(monsterProbability * 100).toFixed(1)}%</p>
      <audio ref={footstepsAudioRef} src="/Footsteps-running-on-dry-leaves.mp3" />
      {currentMonster && (
        <MonsterEncounter
          video={currentMonster}
          onClose={handleCombatEnd}
          inCombat={inCombat}
        />
      )}
      {inCombat && <CombatSystem onCombatEnd={handleCombatEnd} />}
    </div>
  );
}

export default App;