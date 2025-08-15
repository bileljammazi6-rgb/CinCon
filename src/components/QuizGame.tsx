import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, ArrowRight, Trophy, Star } from 'lucide-react';
import { QuizQuestion } from '../services/gameService';
import { geminiService } from '../services/geminiService';

interface QuizGameProps {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onGameComplete: (score: number, streak: number) => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ category, difficulty, onGameComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [category, difficulty]);

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await geminiService.createQuizQuestions(category, difficulty, 5);
      
      // Parse the AI response to extract questions
      const parsedQuestions: QuizQuestion[] = [];
      const lines = response.split('\n').filter(line => line.trim());
      
      for (let i = 0; i < lines.length; i += 5) {
        if (i + 4 < lines.length) {
          const question = lines[i].replace('Q:', '').trim();
          const optionA = lines[i + 1].replace('A:', '').trim();
          const optionB = lines[i + 2].replace('B:', '').trim();
          const optionC = lines[i + 3].replace('C:', '').trim();
          const optionD = lines[i + 4].replace('D:', '').trim();
          
          parsedQuestions.push({
            id: `q${parsedQuestions.length + 1}`,
            question,
            options: { A: optionA, B: optionB, C: optionC, D: optionD },
            correctAnswer: 'A', // This would need to be determined by the AI
            category,
            difficulty
          });
        }
      }
      
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      // Fallback questions
      setQuestions([
        {
          id: 'q1',
          question: 'What is the capital of France?',
          options: { A: 'London', B: 'Berlin', C: 'Paris', D: 'Madrid' },
          correctAnswer: 'C',
          category,
          difficulty
        },
        {
          id: 'q2',
          question: 'Which planet is known as the Red Planet?',
          options: { A: 'Venus', B: 'Mars', C: 'Jupiter', D: 'Saturn' },
          correctAnswer: 'B',
          category,
          difficulty
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setGameComplete(true);
      onGameComplete(score, streak);
    }
  };

  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setGameComplete(false);
    generateQuestions();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-400">AI is generating your quiz questions...</p>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
        
        <div className="bg-gray-800 rounded-xl p-6 mb-6 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-400">{score}</div>
              <div className="text-sm text-gray-400">Total Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{streak}</div>
              <div className="text-sm text-gray-400">Best Streak</div>
            </div>
          </div>
        </div>
        
        <button
          onClick={restartGame}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
        >
          Play Again
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">No questions available</p>
        <button
          onClick={generateQuestions}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          Generate Questions
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Score Display */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span className="font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-400" />
            <span className="font-bold">{streak}</span>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-6 w-6 text-purple-400" />
          <span className="text-sm text-purple-400 font-medium">{category}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-6 text-white">
          {currentQuestion.question}
        </h3>
        
        <div className="space-y-3">
          {(['A', 'B', 'C', 'D'] as const).map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              disabled={isAnswered}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === option
                  ? isCorrect
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-red-500 bg-red-500/20'
                  : 'border-gray-600 hover:border-gray-500 bg-gray-700 hover:bg-gray-600'
              } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">
                  {option}. {currentQuestion.options[option]}
                </span>
                {isAnswered && selectedAnswer === option && (
                  isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {isAnswered && (
        <div className={`text-center p-4 rounded-lg mb-6 ${
          isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-semibold">Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-semibold">Incorrect!</span>
              </>
            )}
          </div>
          <p className="text-gray-300">
            {isCorrect 
              ? `Great job! +10 points. Streak: ${streak}`
              : `The correct answer was: ${currentQuestion.correctAnswer}. Streak reset.`
            }
          </p>
        </div>
      )}

      {/* Next Button */}
      {isAnswered && (
        <div className="text-center">
          <button
            onClick={nextQuestion}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizGame;