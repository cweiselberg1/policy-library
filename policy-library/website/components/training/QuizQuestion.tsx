'use client';

import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface QuizQuestionProps {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  onAnswer: (correct: boolean) => void;
}

export default function QuizQuestion({
  question,
  options,
  correctAnswer,
  explanation,
  onAnswer,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (index: number) => {
    if (showFeedback) return;

    setSelectedAnswer(index);
    setShowFeedback(true);
    const isCorrect = index === correctAnswer;
    onAnswer(isCorrect);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="bg-dark-800 rounded-lg border border-dark-700 p-6 shadow-sm">
      <h4 className="text-lg font-semibold text-white mb-4">{question}</h4>

      <div className="space-y-3 mb-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={showFeedback}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
              showFeedback
                ? index === correctAnswer
                  ? 'border-emerald-500 bg-emerald-900/20'
                  : index === selectedAnswer
                  ? 'border-red-500 bg-red-900/20'
                  : 'border-dark-700 bg-dark-900/50'
                : 'border-dark-700 hover:border-copper-500 hover:bg-copper-900/20'
            } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{option}</span>
              {showFeedback && index === correctAnswer && (
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
              )}
              {showFeedback && index === selectedAnswer && index !== correctAnswer && (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div
          className={`rounded-lg p-4 ${
            isCorrect ? 'bg-emerald-900/20 border border-emerald-500/30' : 'bg-red-900/20 border border-red-500/30'
          }`}
        >
          <div className="flex items-start gap-2">
            {isCorrect ? (
              <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </p>
              <p className={`text-sm mt-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
