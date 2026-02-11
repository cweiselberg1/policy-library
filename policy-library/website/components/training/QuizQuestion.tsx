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
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h4 className="text-lg font-semibold text-slate-900 mb-4">{question}</h4>

      <div className="space-y-3 mb-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={showFeedback}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
              showFeedback
                ? index === correctAnswer
                  ? 'border-emerald-500 bg-emerald-50'
                  : index === selectedAnswer
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-200 bg-slate-50'
                : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
            } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">{option}</span>
              {showFeedback && index === correctAnswer && (
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
              )}
              {showFeedback && index === selectedAnswer && index !== correctAnswer && (
                <XCircleIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div
          className={`rounded-lg p-4 ${
            isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {isCorrect ? (
              <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </p>
              <p className={`text-sm mt-1 ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                {explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
