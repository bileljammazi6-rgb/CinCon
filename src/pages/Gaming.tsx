import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Chess, 
  Brain, 
  Trophy, 
  Settings, 
  Play, 
  Users, 
  Target,
  Zap,
  Star,
  TrendingUp,
  Award,
  User
} from 'lucide-react';
import { gameService, GameState, QuizQuestion } from '../services/gameService';
import { geminiService } from '../services/geminiService';
import { supabaseService } from '../services/supabaseService';

interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  averageScore: number;
}

const Gaming: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameState | null>(null);
  const [gameType, setGameType] = useState<'chess' | 'tictactoe' | 'quiz' | 'puzzle'>('tictactoe');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizCategory, setQuizCategory] = useState('general');
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageScore: 0
  });
  const [leaderboard, setLeaderboard] = useState<{ username: string; score: number; streak: number }[]>([]);
  const [aiScenario, setAiScenario] = useState<string>('');
  const [username, setUsername] = useState<string>('Anonymous');

  useEffect(() => {
    loadGameStats();
    loadLeaderboard();
  }, []);

  const loadGameStats = () => {
    // Load from localStorage or database
    const stats = localStorage.getItem('gameStats');
    if (stats) {
      setGameStats(JSON.parse(stats));
    }
  };

  const loadLeaderboard = async () => {
    try {
      const leaderboardData = await gameService.getLeaderboard(quizCategory);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      // Fallback to mock data
      setLeaderboard([
        { username: 'Player1', score: 100, streak: 5 },
        { username: 'Player2', score: 85, streak: 3 },
        { username: 'Player3', score: 70, streak: 2 }
      ]);
    }
  };

  const startNewGame = async () => {
    try {
      let game: GameState;
      
      switch (gameType) {
        case 'chess':
          game = await gameService.createChessGame(`chess_${Date.now()}`, difficulty);
          break;
        case 'tictactoe':
          game = await gameService.createTicTacToeGame(`tictactoe_${Date.now()}`, difficulty);
          break;
        case 'quiz':
          game = await gameService.createQuizGame(`quiz_${Date.now()}`, quizCategory, difficulty);
          break;
        default:
          game = await gameService.createTicTacToeGame(`game_${Date.now()}`, difficulty);
      }
      
      setActiveGame(game);
      
      // Generate AI scenario for the game
      const scenario = await geminiService.generateGameScenario(gameType, difficulty);
      setAiScenario(scenario);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const makeMove = async (position: number) => {
    if (!activeGame || activeGame.type !== 'tictactoe') return;
    
    try {
      const updatedGame = await gameService.makeTicTacToeMove(activeGame.id, position);
      setActiveGame(updatedGame);
      
      if (updatedGame.status === 'finished') {
        updateGameStats(updatedGame);
        // Refresh leaderboard after game ends
        loadLeaderboard();
      }
    } catch (error) {
      console.error('Failed to make move:', error);
    }
  };

  const updateGameStats = (game: GameState) => {
    const newStats = { ...gameStats };
    newStats.totalGames += 1;
    
    if (game.type === 'tictactoe') {
      if (game.data.winner === 'player1') {
        newStats.wins += 1;
        newStats.currentStreak += 1;
        newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
      } else if (game.data.winner === 'ai') {
        newStats.losses += 1;
        newStats.currentStreak = 0;
      } else if (game.data.isDraw) {
        newStats.draws += 1;
        newStats.currentStreak = 0;
      }
    }
    
    setGameStats(newStats);
    localStorage.setItem('gameStats', JSON.stringify(newStats));
  };

  const renderTicTacToeBoard = () => {
    if (!activeGame || activeGame.type !== 'tictactoe') return null;
    
    const board = activeGame.data.board;
    
    return (
      <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto">
        {board.map((cell: string | null, index: number) => (
          <button
            key={index}
            onClick={() => makeMove(index)}
            disabled={cell !== null || activeGame.status !== 'active'}
            className="w-20 h-20 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 rounded-lg flex items-center justify-center text-3xl font-bold transition-colors"
          >
            {cell === 'X' ? (
              <span className="text-blue-400">X</span>
            ) : cell === 'O' ? (
              <span className="text-red-400">O</span>
            ) : null}
          </button>
        ))}
      </div>
    );
  };

  const renderGameStatus = () => {
    if (!activeGame) return null;
    
    if (activeGame.status === 'finished') {
      if (activeGame.type === 'tictactoe') {
        if (activeGame.data.winner === 'player1') {
          return (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">🎉 You Won! 🎉</div>
              <button
                onClick={startNewGame}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Play Again
              </button>
            </div>
          );
        } else if (activeGame.data.winner === 'ai') {
          return (
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-2">😔 AI Won</div>
              <button
                onClick={startNewGame}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          );
        } else if (activeGame.data.isDraw) {
          return (
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">🤝 It's a Draw!</div>
              <button
                onClick={startNewGame}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg"
              >
                Play Again
              </button>
            </div>
          );
        }
      }
    }
    
    return (
      <div className="text-center text-gray-300">
        {activeGame.currentPlayer === 'player1' ? 'Your turn' : 'AI is thinking...'}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🎮 AI Gaming Hub
          </h1>
          <p className="text-xl text-gray-300">
            Challenge the AI in chess, puzzles, and more. Experience adaptive difficulty and AI-generated scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Selection & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Username Input */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <User className="mr-2" />
                Player Info
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Game Selection */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Gamepad2 className="mr-2" />
                Select Game
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Game Type</label>
                  <select
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="tictactoe">Tic Tac Toe</option>
                    <option value="chess">Chess</option>
                    <option value="quiz">AI Quiz</option>
                    <option value="puzzle">Puzzle</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                {gameType === 'quiz' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={quizCategory}
                      onChange={(e) => {
                        setQuizCategory(e.target.value);
                        loadLeaderboard();
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="general">General Knowledge</option>
                      <option value="movies">Movies & TV</option>
                      <option value="science">Science</option>
                      <option value="history">History</option>
                      <option value="technology">Technology</option>
                    </select>
                  </div>
                )}
                
                <button
                  onClick={startNewGame}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <Play className="mr-2" />
                  Start New Game
                </button>
              </div>
            </div>

            {/* Game Statistics */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Trophy className="mr-2" />
                Your Stats
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Games:</span>
                  <span className="font-bold">{gameStats.totalGames}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">Wins:</span>
                  <span className="font-bold">{gameStats.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">Losses:</span>
                  <span className="font-bold">{gameStats.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400">Draws:</span>
                  <span className="font-bold">{gameStats.draws}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Current Streak:</span>
                  <span className="font-bold">{gameStats.currentStreak}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">Best Streak:</span>
                  <span className="font-bold">{gameStats.bestStreak}</span>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <TrendingUp className="mr-2" />
                Leaderboard
              </h2>
              
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div key={player.username} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg font-bold mr-2">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </span>
                      <span className="text-gray-300">{player.username}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{player.score}</div>
                      <div className="text-sm text-gray-400">Streak: {player.streak}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Game */}
            {activeGame ? (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-6">
                  {gameType === 'chess' && <Chess className="inline mr-2" />}
                  {gameType === 'tictactoe' && <Gamepad2 className="inline mr-2" />}
                  {gameType === 'quiz' && <Brain className="inline mr-2" />}
                  {gameType === 'puzzle' && <Target className="inline mr-2" />}
                  {gameType.charAt(0).toUpperCase() + gameType.slice(1)} - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </h2>
                
                {renderTicTacToeBoard()}
                {renderGameStatus()}
                
                <div className="mt-6 text-sm text-gray-400">
                  Game ID: {activeGame.id}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold mb-4">No Active Game</h2>
                <p className="text-gray-400 mb-6">
                  Select a game type and difficulty, then click "Start New Game" to begin!
                </p>
                <button
                  onClick={startNewGame}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Start Your First Game
                </button>
              </div>
            )}

            {/* AI Scenario */}
            {aiScenario && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Zap className="mr-2" />
                  AI-Generated Scenario
                </h3>
                <div className="bg-gray-700 rounded-lg p-4 text-gray-200">
                  <p className="whitespace-pre-wrap">{aiScenario}</p>
                </div>
              </div>
            )}

            {/* Game Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Brain className="mr-2" />
                  AI Game Master
                </h3>
                <p className="text-gray-300 mb-4">
                  Experience AI-generated game scenarios that adapt to your skill level and preferences.
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Dynamic difficulty adjustment</li>
                  <li>• Personalized challenges</li>
                  <li>• Learning algorithms</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Users className="mr-2" />
                  Multiplayer Ready
                </h3>
                <p className="text-gray-300 mb-4">
                  Challenge friends or join tournaments with real-time multiplayer support.
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Real-time gameplay</li>
                  <li>• Tournament system</li>
                  <li>• Global leaderboards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gaming;