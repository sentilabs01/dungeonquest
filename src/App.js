import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const MAZE_SIZE = 15;
const CELL_SIZE = 45;
const PLAYER_SIZE = 150;
const EXIT_SIZE = 40;
const TREASURE_SIZE = 30; // New constant for treasure size

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

  // Randomly place treasures
  for (let i = 0; i < 5; i++) {
    let tx, ty;
    do {
      tx = Math.floor(Math.random() * (size - 2)) + 1;
      ty = Math.floor(Math.random() * (size - 2)) + 1;
    } while (maze[ty][tx] !== 0);
    maze[ty][tx] = 3; // Treasure
  }

  maze[size - 2][size - 2] = 2; // Set exit
  return maze;
};

const AmazingMaze = () => {
  const [maze, setMaze] = useState(() => generateMaze(MAZE_SIZE));
  const [playerPos, setPlayerPos] = useState([1, 1]);
  const [gameWon, setGameWon] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showTreasure, setShowTreasure] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTreasureVideo, setCurrentTreasureVideo] = useState('');
  const [showPrologue, setShowPrologue] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const treasureAudioRef = useRef(null);
  const videoRef = useRef(null);
  const prologueVideoRef = useRef(null);

  const treasureVideos = [
    "https://labyrinth-of-shadows.s3.amazonaws.com/Treasure+Magic+Compass+-+Made+with+Clipchamp.mp4",
    "https://labyrinth-of-shadows.s3.amazonaws.com/Treasure+Armor+-+Made+with+Clipchamp.mp4",
    "https://labyrinth-of-shadows.s3.amazonaws.com/Treasure+Magical+Sword+-+Made+with+Clipchamp.mp4",
    "https://labyrinth-of-shadows.s3.amazonaws.com/Treasure+vid+-+Made+with+Clipchamp.mp4"
  ];

  const resetGame = useCallback(() => {
    try {
      const newMaze = generateMaze(MAZE_SIZE);
      setMaze(newMaze);
      setPlayerPos([1, 1]);
      setGameWon(false);
      setFadeOut(false);
      setShowTreasure(false);
      setCurrentTreasureVideo('');
      setError(null);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } catch (err) {
      console.error("Error resetting game:", err);
      setError("Failed to reset the game. Please refresh the page.");
    }
  }, []);

  useEffect(() => {
    if (!maze) {
      resetGame();
    }
  }, [maze, resetGame]);

  const movePlayer = useCallback((dx, dy) => {
    if (!maze) return;
    setPlayerPos(prevPos => {
      const [x, y] = prevPos;
      const newX = x + dx;
      const newY = y + dy;

      if (newX >= 0 && newX < MAZE_SIZE && newY >= 0 && newY < MAZE_SIZE && maze[newY][newX] !== 1) {
        if (maze[newY][newX] === 2) {
          setGameWon(true);
          setFadeOut(true);
          setTimeout(() => resetGame(), 10000);
        } else if (maze[newY][newX] === 3) {
          const randomVideo = treasureVideos[Math.floor(Math.random() * treasureVideos.length)];
          setCurrentTreasureVideo(randomVideo);
          setShowTreasure(true);
          if (treasureAudioRef.current) {
            treasureAudioRef.current.play().catch(err => console.error("Audio play failed:", err));
          }
          setMaze(prevMaze => {
            const newMaze = prevMaze.map(row => [...row]);
            newMaze[newY][newX] = 0;
            return newMaze;
          });
        }
        return [newX, newY];
      }
      return prevPos;
    });
  }, [maze, resetGame, treasureVideos]);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowUp': movePlayer(0, -1); break;
      case 'ArrowDown': movePlayer(0, 1); break;
      case 'ArrowLeft': movePlayer(-1, 0); break;
      case 'ArrowRight': movePlayer(1, 0); break;
      default: break;
    }
  }, [movePlayer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const startGame = () => {
    setShowPrologue(true);
    if (prologueVideoRef.current) {
      prologueVideoRef.current.play().catch(err => {
        console.error("Video play failed:", err);
        handlePrologueEnded(); // Start the game anyway if video fails to play
      });
    }
  };

  const handlePrologueEnded = () => {
    setShowPrologue(false);
    setGameStarted(true);
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error("Audio play failed:", err));
    }
  };

  const handleVideoEnded = () => {
    setShowTreasure(false);
    setCurrentTreasureVideo('');
    if (treasureAudioRef.current) {
      treasureAudioRef.current.pause();
      treasureAudioRef.current.currentTime = 0;
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!maze) {
    return <div>Loading maze...</div>;
  }

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url(https://labyrinth-of-shadows.s3.amazonaws.com/castle+hall1.jpg)' }}
    >
      {showPrologue ? (
        <div className="fixed top-0 left-0 w-full h-full bg-black z-50">
          <video
            ref={prologueVideoRef}
            src="https://labyrinth-of-shadows.s3.amazonaws.com/Prologue+Labyrinth+of+Shadows+-+Made+with+Clipchamp.mp4"
            className="w-full h-full object-cover"
            onEnded={handlePrologueEnded}
            autoPlay
          />
        </div>
      ) : (
        <>
          <img src={`${process.env.PUBLIC_URL}/DQlogoPNG2.png`} alt="Game Logo" className="w-80 h-auto mx-auto mb-4" />
          <h1 className="text-white text-5xl font-bold mb-6"></h1>
          {!gameStarted ? (
            <button
              onClick={startGame}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-6"
            >
              Start Game
            </button>
          ) : gameWon ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-green-600">Congratulations! You can now leave the Castle!</h2>
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
                        <img src={`${process.env.PUBLIC_URL}/cage wall.jpg`} alt="Wall" style={{ width: '100%', height: '100%' }} />
                      ) : cell === 2 ? (
                        <img src={`${process.env.PUBLIC_URL}/maze exit.jpg`} alt="Exit" style={{ width: `${EXIT_SIZE}px`, height: `${EXIT_SIZE}px` }} />
                      ) : cell === 3 ? (
                        <img src="https://labyrinth-of-shadows.s3.amazonaws.com/closedtreasurechest.jpg" alt="Treasure" style={{ width: `${TREASURE_SIZE}px`, height: `${TREASURE_SIZE}px` }} />
                      ) : null}
                      {x === playerPos[0] && y === playerPos[1] && (
                        <img src={`${process.env.PUBLIC_URL}/AidenPNG.png`} alt="Player" style={{ width: `${PLAYER_SIZE}px`, height: `${PLAYER_SIZE}px`, position: 'absolute' }} />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button onClick={() => movePlayer(0, -1)} className="p-2 bg-gray-200 rounded"><ArrowUp /></button>
            <button onClick={() => movePlayer(-1, 0)} className="p-2 bg-gray-200 rounded"><ArrowLeft /></button>
            <button onClick={() => movePlayer(1, 0)} className="p-2 bg-gray-200 rounded"><ArrowRight /></button>
            <button onClick={() => movePlayer(0, 1)} className="p-2 bg-gray-200 rounded"><ArrowDown /></button>
          </div>
          {showTreasure && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <video
                ref={videoRef}
                src={currentTreasureVideo}
                autoPlay
                controls
                onEnded={handleVideoEnded}
                className="w-64 h-auto"
              />
              <audio ref={treasureAudioRef} src={`${process.env.PUBLIC_URL}/treasure_sound.mp3`} />
            </div>
          )}
          <audio ref={audioRef} src={`${process.env.PUBLIC_URL}/ambient.mp3`} loop />
        </>
      )}
    </div>
  );
};

export default AmazingMaze;