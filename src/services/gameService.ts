import { geminiService } from './geminiService';
import { supabaseService, QuizScore } from './supabaseService';

export interface GameMove {
  id: string;
  roomId: string;
  moveType: 'tictactoe' | 'chess' | 'puzzle';
  data: any;
  createdAt: Date;
}

export interface GameState {
  id: string;
  type: 'tictactoe' | 'chess' | 'puzzle' | 'quiz';
  status: 'waiting' | 'active' | 'finished';
  players: string[];
  currentPlayer: string;
  data: any;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

class GameService {
  private activeGames: Map<string, GameState> = new Map();
  private gameHistory: GameMove[] = [];

  // Chess Game Logic
  async createChessGame(roomId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<GameState> {
    const gameState: GameState = {
      id: roomId,
      type: 'chess',
      status: 'active',
      players: ['player1', 'ai'],
      currentPlayer: 'player1',
      data: {
        board: this.initializeChessBoard(),
        moves: [],
        capturedPieces: [],
        check: false,
        checkmate: false,
        stalemate: false
      },
      difficulty,
      createdAt: new Date()
    };

    this.activeGames.set(roomId, gameState);
    
    // Save to Supabase
    await supabaseService.saveGameMove(roomId, 'chess', {
      type: 'game_start',
      difficulty,
      gameState: gameState.data
    });
    
    return gameState;
  }

  private initializeChessBoard(): any {
    // Initialize standard chess board
    return {
      // This would be a proper chess board representation
      // For now, returning a simplified structure
      pieces: [],
      turn: 'white'
    };
  }

  async makeChessMove(roomId: string, move: any): Promise<GameState> {
    const game = this.activeGames.get(roomId);
    if (!game || game.status !== 'active') {
      throw new Error('Game not found or not active');
    }

    // Validate move logic here
    // Update game state
    game.data.moves.push(move);
    
    // Save move to Supabase
    await supabaseService.saveGameMove(roomId, 'chess', {
      type: 'move',
      move,
      gameState: game.data
    });
    
    // AI move logic
    if (game.currentPlayer === 'ai') {
      await this.makeAIMove(roomId);
    }

    return game;
  }

  private async makeAIMove(roomId: string): Promise<void> {
    const game = this.activeGames.get(roomId);
    if (!game) return;

    // Generate AI move using Gemini
    const scenario = await geminiService.generateGameScenario('chess', game.difficulty);
    
    // Parse scenario and make move
    // This is a simplified version - in reality you'd have proper chess logic
    game.currentPlayer = 'player1';
  }

  // Tic Tac Toe Game Logic
  async createTicTacToeGame(roomId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<GameState> {
    const gameState: GameState = {
      id: roomId,
      type: 'tictactoe',
      status: 'active',
      players: ['player1', 'ai'],
      currentPlayer: 'player1',
      data: {
        board: Array(9).fill(null),
        winner: null,
        isDraw: false
      },
      difficulty,
      createdAt: new Date()
    };

    this.activeGames.set(roomId, gameState);
    
    // Save to Supabase
    await supabaseService.saveGameMove(roomId, 'tictactoe', {
      type: 'game_start',
      difficulty,
      gameState: gameState.data
    });
    
    return gameState;
  }

  async makeTicTacToeMove(roomId: string, position: number): Promise<GameState> {
    const game = this.activeGames.get(roomId);
    if (!game || game.status !== 'active') {
      throw new Error('Game not found or not active');
    }

    if (game.data.board[position] !== null) {
      throw new Error('Invalid move: position already taken');
    }

    // Player move
    game.data.board[position] = 'X';
    
    // Save move to Supabase
    await supabaseService.saveGameMove(roomId, 'tictactoe', {
      type: 'player_move',
      position,
      board: game.data.board
    });
    
    // Check for win
    if (this.checkTicTacToeWin(game.data.board, 'X')) {
      game.status = 'finished';
      game.data.winner = 'player1';
      
      // Save final state
      await supabaseService.saveGameMove(roomId, 'tictactoe', {
        type: 'game_end',
        winner: 'player1',
        finalBoard: game.data.board
      });
      
      return game;
    }

    // Check for draw
    if (game.data.board.every(cell => cell !== null)) {
      game.status = 'finished';
      game.data.isDraw = true;
      
      // Save final state
      await supabaseService.saveGameMove(roomId, 'tictactoe', {
        type: 'game_end',
        winner: 'draw',
        finalBoard: game.data.board
      });
      
      return game;
    }

    // AI move
    const aiPosition = this.getAIMove(game.data.board, game.difficulty);
    if (aiPosition !== -1) {
      game.data.board[aiPosition] = 'O';
      
      // Save AI move to Supabase
      await supabaseService.saveGameMove(roomId, 'tictactoe', {
        type: 'ai_move',
        position: aiPosition,
        board: game.data.board
      });
      
      // Check for AI win
      if (this.checkTicTacToeWin(game.data.board, 'O')) {
        game.status = 'finished';
        game.data.winner = 'ai';
        
        // Save final state
        await supabaseService.saveGameMove(roomId, 'tictactoe', {
          type: 'game_end',
          winner: 'ai',
          finalBoard: game.data.board
        });
      }
    }

    return game;
  }

  private checkTicTacToeWin(board: (string | null)[], player: string): boolean {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    return winPatterns.some(pattern => 
      pattern.every(pos => board[pos] === player)
    );
  }

  private getAIMove(board: (string | null)[], difficulty: 'easy' | 'medium' | 'hard'): number {
    const availablePositions = board
      .map((cell, index) => cell === null ? index : -1)
      .filter(pos => pos !== -1);

    if (availablePositions.length === 0) return -1;

    switch (difficulty) {
      case 'easy':
        // Random move
        return availablePositions[Math.floor(Math.random() * availablePositions.length)];
      
      case 'medium':
        // Try to win, then block, then random
        // Win move
        for (const pos of availablePositions) {
          const testBoard = [...board];
          testBoard[pos] = 'O';
          if (this.checkTicTacToeWin(testBoard, 'O')) {
            return pos;
          }
        }
        // Block move
        for (const pos of availablePositions) {
          const testBoard = [...board];
          testBoard[pos] = 'X';
          if (this.checkTicTacToeWin(testBoard, 'X')) {
            return pos;
          }
        }
        // Random move
        return availablePositions[Math.floor(Math.random() * availablePositions.length)];
      
      case 'hard':
        // Perfect play using minimax
        return this.minimax(board, 0, true, -Infinity, Infinity).position;
      
      default:
        return availablePositions[0];
    }
  }

  private minimax(board: (string | null)[], depth: number, isMaximizing: boolean, alpha: number, beta: number): { score: number; position: number } {
    const availablePositions = board
      .map((cell, index) => cell === null ? index : -1)
      .filter(pos => pos !== -1);

    if (this.checkTicTacToeWin(board, 'O')) return { score: 10 - depth, position: -1 };
    if (this.checkTicTacToeWin(board, 'X')) return { score: depth - 10, position: -1 };
    if (availablePositions.length === 0) return { score: 0, position: -1 };

    if (isMaximizing) {
      let bestScore = -Infinity;
      let bestPosition = -1;
      
      for (const pos of availablePositions) {
        const testBoard = [...board];
        testBoard[pos] = 'O';
        const score = this.minimax(testBoard, depth + 1, false, alpha, beta).score;
        
        if (score > bestScore) {
          bestScore = score;
          bestPosition = pos;
        }
        
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }
      
      return { score: bestScore, position: bestPosition };
    } else {
      let bestScore = Infinity;
      let bestPosition = -1;
      
      for (const pos of availablePositions) {
        const testBoard = [...board];
        testBoard[pos] = 'X';
        const score = this.minimax(testBoard, depth + 1, true, alpha, beta).score;
        
        if (score < bestScore) {
          bestScore = score;
          bestPosition = pos;
        }
        
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;
      }
      
      return { score: bestScore, position: bestPosition };
    }
  }

  // Quiz Game Logic
  async createQuizGame(roomId: string, category: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<GameState> {
    const questions = await this.generateQuizQuestions(category, difficulty);
    
    const gameState: GameState = {
      id: roomId,
      type: 'quiz',
      status: 'active',
      players: ['player1'],
      currentPlayer: 'player1',
      data: {
        questions,
        currentQuestion: 0,
        score: 0,
        streak: 0,
        answers: []
      },
      difficulty,
      createdAt: new Date()
    };

    this.activeGames.set(roomId, gameState);
    
    // Save to Supabase
    await supabaseService.saveGameMove(roomId, 'tictactoe', {
      type: 'quiz_start',
      category,
      difficulty,
      questions: questions.length
    });
    
    return gameState;
  }

  private async generateQuizQuestions(category: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<QuizQuestion[]> {
    const response = await geminiService.createQuizQuestions(category, difficulty, 5);
    
    // Parse the AI response to extract questions
    // This is a simplified parser - in reality you'd want more robust parsing
    const questions: QuizQuestion[] = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i += 5) {
      if (i + 4 < lines.length) {
        const question = lines[i].replace('Q:', '').trim();
        const optionA = lines[i + 1].replace('A:', '').trim();
        const optionB = lines[i + 2].replace('B:', '').trim();
        const optionC = lines[i + 3].replace('C:', '').trim();
        const optionD = lines[i + 4].replace('D:', '').trim();
        
        questions.push({
          id: `q${questions.length + 1}`,
          question,
          options: { A: optionA, B: optionB, C: optionC, D: optionD },
          correctAnswer: 'A', // This would need to be determined by the AI
          category,
          difficulty
        });
      }
    }
    
    return questions;
  }

  async submitQuizAnswer(roomId: string, questionId: string, answer: 'A' | 'B' | 'C' | 'D', username: string): Promise<{ correct: boolean; score: number; nextQuestion?: QuizQuestion }> {
    const game = this.activeGames.get(roomId);
    if (!game || game.status !== 'active') {
      throw new Error('Game not found or not active');
    }

    const currentQuestion = game.data.questions[game.data.currentQuestion];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      game.data.score += 10;
      game.data.streak += 1;
    } else {
      game.data.streak = 0;
    }
    
    game.data.answers.push({ questionId, answer, correct: isCorrect });
    game.data.currentQuestion += 1;
    
    // Save answer to Supabase
    await supabaseService.saveGameMove(roomId, 'tictactoe', {
      type: 'quiz_answer',
      questionId,
      answer,
      correct: isCorrect,
      score: game.data.score,
      streak: game.data.streak
    });
    
    if (game.data.currentQuestion >= game.data.questions.length) {
      game.status = 'finished';
      
      // Save final score to leaderboard
      await supabaseService.saveQuizScore(
        username,
        game.data.category || 'general',
        game.data.score,
        game.data.streak
      );
      
      return { correct: isCorrect, score: game.data.score };
    }
    
    const nextQuestion = game.data.questions[game.data.currentQuestion];
    return { correct: isCorrect, score: game.data.score, nextQuestion };
  }

  // Game Management
  getGame(roomId: string): GameState | undefined {
    return this.activeGames.get(roomId);
  }

  getAllGames(): GameState[] {
    return Array.from(this.activeGames.values());
  }

  endGame(roomId: string): void {
    const game = this.activeGames.get(roomId);
    if (game) {
      game.status = 'finished';
    }
  }

  deleteGame(roomId: string): void {
    this.activeGames.delete(roomId);
  }

  // Leaderboard - Now integrated with Supabase
  async getLeaderboard(category: string): Promise<{ username: string; score: number; streak: number }[]> {
    try {
      const scores = await supabaseService.getQuizLeaderboard(category, 10);
      return scores.map(score => ({
        username: score.username,
        score: score.score,
        streak: score.streak
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      // Fallback to mock data
      return [
        { username: 'Player1', score: 100, streak: 5 },
        { username: 'Player2', score: 85, streak: 3 },
        { username: 'Player3', score: 70, streak: 2 }
      ];
    }
  }

  // Load game history from Supabase
  async loadGameHistory(roomId: string): Promise<GameMove[]> {
    try {
      const moves = await supabaseService.getGameMoves(roomId, 100);
      return moves.map(move => ({
        id: move.id.toString(),
        roomId: move.room_id,
        moveType: move.move_type,
        data: move.data,
        createdAt: new Date(move.created_at)
      }));
    } catch (error) {
      console.error('Error loading game history:', error);
      return [];
    }
  }
}

export const gameService = new GameService();