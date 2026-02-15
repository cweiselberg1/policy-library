'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthProvider';
import { upsertTrainingProgress, completeModule } from '@/lib/supabase/training';

interface Section {
  id: string;
  title: string;
  content: {
    intro: string;
    points: string[];
  };
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

const sections: Section[] = [
  {
    id: 'introduction',
    title: 'Introduction to HIPAA',
    content: {
      intro: 'The Health Insurance Portability and Accountability Act (HIPAA) was enacted in 1996 to protect sensitive patient health information from being disclosed without patient consent or knowledge.',
      points: [
        'Privacy Rule: Establishes national standards for the protection of health information',
        'Security Rule: Sets standards for securing electronic protected health information (ePHI)',
        'Breach Notification Rule: Requires covered entities to notify affected individuals of breaches',
        'Enforcement Rule: Contains provisions relating to compliance and investigations',
      ],
    },
  },
  {
    id: 'phi',
    title: 'Protected Health Information (PHI)',
    content: {
      intro: 'PHI refers to any information about health status, provision of healthcare, or payment for healthcare that can be linked to a specific individual.',
      points: [
        'Names, addresses, and telephone numbers',
        'Dates (birth, admission, discharge, death)',
        'Social Security numbers',
        'Medical record numbers',
        'Health plan beneficiary numbers',
        'Account numbers and certificate/license numbers',
        'Vehicle identifiers and license plate numbers',
        'Full-face photographs and comparable images',
        'Biometric identifiers (fingerprints, voiceprints)',
        'Any other unique identifying number, characteristic, or code',
      ],
    },
  },
  {
    id: 'patient-rights',
    title: 'Patient Rights Under HIPAA',
    content: {
      intro: 'HIPAA grants patients several important rights regarding their health information.',
      points: [
        'Right to Access: Patients can request copies of their medical records',
        'Right to Amend: Patients can request corrections to their medical records',
        'Right to an Accounting: Patients can request a list of disclosures of their PHI',
        'Right to Restrict: Patients can request restrictions on how their PHI is used',
        'Right to Confidential Communications: Patients can request to receive communications by alternative means',
        'Right to Notice: Patients must receive a notice of privacy practices',
      ],
    },
  },
  {
    id: 'security',
    title: 'Security Best Practices',
    content: {
      intro: 'Protecting PHI requires a combination of physical, technical, and administrative safeguards.',
      points: [
        'Physical Security: Lock cabinets, secure workstations, dispose of PHI properly',
        'Technical Security: Use strong passwords, enable encryption, log out when away',
        'Administrative Security: Complete required training, follow policies, report incidents',
        'Never share login credentials with anyone',
        'Be cautious of phishing emails requesting patient information',
        'Only access PHI when necessary for your job duties',
        'Report any suspected breaches immediately to your supervisor or privacy officer',
        'Ensure mobile devices containing PHI are encrypted and password-protected',
      ],
    },
  },
];

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'What does PHI stand for?',
    options: [
      'Personal Health Insurance',
      'Protected Health Information',
      'Private Healthcare Information',
      'Patient Health Index',
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    question: 'Which of the following is NOT a patient right under HIPAA?',
    options: [
      'Right to access their medical records',
      'Right to request amendments to their records',
      'Right to choose their healthcare provider',
      'Right to receive a notice of privacy practices',
    ],
    correctIndex: 2,
  },
  {
    id: 3,
    question: 'What should you do if you receive a suspicious email asking for patient information?',
    options: [
      'Reply with the requested information',
      'Forward it to colleagues to verify',
      'Report it to IT/Security immediately',
      'Delete it without reporting',
    ],
    correctIndex: 2,
  },
  {
    id: 4,
    question: 'Which of the following is an example of PHI?',
    options: [
      'A general hospital policy document',
      'A patient\'s medical record number',
      'A list of hospital departments',
      'The hospital\'s mission statement',
    ],
    correctIndex: 1,
  },
];

export default function Hipaa101Content() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    quizAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correctIndex) {
        correct++;
      }
    });
    setQuizScore(correct);
    setQuizSubmitted(true);
  };

  const handleContinue = async () => {
    setSaveError(null);

    try {
      // Save to Supabase if user is authenticated
      if (user?.id) {
        await completeModule(user.id, 'hipaa-101', quizScore);
        await upsertTrainingProgress({
          user_id: user.id,
          hipaa_101_complete: true,
          overall_percentage: 66,
          current_step: 'cybersecurity',
        });
      }
    } catch (error) {
      console.error('Failed to save progress to Supabase:', error);
      setSaveError('Progress saved locally only. You may need to reconnect to save to server.');
      // Don't block navigation - continue with localStorage fallback
    }

    // Update localStorage progress (fallback cache)
    const progressKey = 'training_progress';
    const currentProgress = JSON.parse(localStorage.getItem(progressKey) || '{"modules_completed":[],"current_step":"policy-review","percentage":0}');

    const updatedProgress = {
      ...currentProgress,
      modules_completed: [...new Set([...currentProgress.modules_completed, 'hipaa-101'])],
      current_step: 'cybersecurity',
      percentage: 66,
    };

    localStorage.setItem(progressKey, JSON.stringify(updatedProgress));

    // Navigate to next module
    router.push('/dashboard/employee/training/cybersecurity');
  };

  const passingScore = Math.ceil(quizQuestions.length * 0.75);
  const hasPassed = quizScore >= passingScore;

  return (
    <div className="min-h-screen bg-gradient-to-br from-evergreen-950 via-dark-900 to-evergreen-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/employee/training"
            className="inline-flex items-center text-sm text-dark-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Training
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <ShieldCheckIcon className="h-8 w-8 text-copper-400" />
                HIPAA 101
              </h1>
              <p className="mt-2 text-dark-400">
                Learn the fundamentals of HIPAA compliance and patient privacy
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <ClockIcon className="h-5 w-5" />
              <span>15-20 minutes</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Progress */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-6 sticky top-8">
              <h2 className="text-sm font-semibold text-dark-400 uppercase mb-4">
                Training Steps
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-dark-300">Policy Review</p>
                    <p className="text-xs text-dark-500">Completed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-copper-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">HIPAA 101</p>
                    <p className="text-xs text-copper-400">In Progress</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-dark-600 flex-shrink-0 mt-0.5"></div>
                  <div>
                    <p className="text-sm font-medium text-dark-500">Cybersecurity</p>
                    <p className="text-xs text-dark-600">Locked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!showQuiz ? (
              <div className="space-y-6">
                {/* Section Progress */}
                <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-dark-400">
                      Section {currentSection + 1} of {sections.length}
                    </h3>
                    <span className="text-sm text-dark-400">
                      {Math.round(((currentSection + 1) / sections.length) * 100)}% Complete
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {sections.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 flex-1 rounded-full ${
                          index < currentSection
                            ? 'bg-emerald-500'
                            : index === currentSection
                            ? 'bg-copper-500'
                            : 'bg-dark-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Section Content */}
                <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {sections[currentSection].title}
                  </h2>
                  <p className="text-dark-300 mb-6 leading-relaxed">
                    {sections[currentSection].content.intro}
                  </p>
                  <div className="space-y-3">
                    {sections[currentSection].content.points.map((point, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <ChevronRightIcon className="h-5 w-5 text-copper-400 flex-shrink-0 mt-0.5" />
                        <p className="text-dark-300">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePreviousSection}
                    disabled={currentSection === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      currentSection === 0
                        ? 'bg-dark-700/50 text-dark-500 cursor-not-allowed'
                        : 'bg-dark-700 text-white hover:bg-dark-600'
                    }`}
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                    Previous
                  </button>
                  <button
                    onClick={handleNextSection}
                    className="px-6 py-3 bg-gradient-to-r from-copper-600 to-copper-700 text-white rounded-lg font-medium hover:from-copper-500 hover:to-copper-600 transition-all flex items-center gap-2"
                  >
                    {currentSection === sections.length - 1 ? 'Take Quiz' : 'Next'}
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quiz Header */}
                <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Knowledge Check</h2>
                  <p className="text-dark-400">
                    Answer all questions to complete this module. You need {passingScore} out of{' '}
                    {quizQuestions.length} correct to pass.
                  </p>
                </div>

                {/* Quiz Questions */}
                {!quizSubmitted ? (
                  <div className="space-y-6">
                    {quizQuestions.map((question, qIndex) => (
                      <div
                        key={question.id}
                        className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-6"
                      >
                        <h3 className="text-lg font-semibold text-white mb-4">
                          {qIndex + 1}. {question.question}
                        </h3>
                        <div className="space-y-3">
                          {question.options.map((option, oIndex) => (
                            <label
                              key={oIndex}
                              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                                quizAnswers[qIndex] === oIndex
                                  ? 'bg-copper-500/10 border-copper-500/50'
                                  : 'bg-dark-700/30 border-dark-600/50 hover:border-dark-500'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                checked={quizAnswers[qIndex] === oIndex}
                                onChange={() => handleQuizAnswer(qIndex, oIndex)}
                                className="mt-0.5"
                              />
                              <span className="text-dark-300">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setShowQuiz(false)}
                        className="px-6 py-3 bg-dark-700 text-white rounded-lg font-medium hover:bg-dark-600 transition-all flex items-center gap-2"
                      >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Back to Sections
                      </button>
                      <button
                        onClick={handleQuizSubmit}
                        disabled={quizAnswers.includes(null)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          quizAnswers.includes(null)
                            ? 'bg-dark-700/50 text-dark-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-copper-600 to-copper-700 text-white hover:from-copper-500 hover:to-copper-600'
                        }`}
                      >
                        Submit Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Save Error Message */}
                    {saveError && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                        <p className="text-yellow-400 text-sm">{saveError}</p>
                      </div>
                    )}

                    {/* Quiz Results */}
                    <div
                      className={`backdrop-blur-xl border rounded-xl p-8 text-center ${
                        hasPassed
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      {hasPassed ? (
                        <>
                          <CheckCircleIcon className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-white mb-2">
                            Congratulations!
                          </h2>
                          <p className="text-dark-300 mb-4">
                            You passed with a score of {quizScore} out of {quizQuestions.length}
                          </p>
                          <button
                            onClick={handleContinue}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-evergreen-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-evergreen-700 transition-all inline-flex items-center gap-2"
                          >
                            Continue to Cybersecurity
                            <ArrowRightIcon className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-white mb-2">
                            Additional Review Needed
                          </h2>
                          <p className="text-dark-300 mb-4">
                            You scored {quizScore} out of {quizQuestions.length}. You need at least{' '}
                            {passingScore} to pass.
                          </p>
                          <button
                            onClick={() => {
                              setQuizSubmitted(false);
                              setQuizAnswers(new Array(quizQuestions.length).fill(null));
                              setShowQuiz(false);
                              setCurrentSection(0);
                            }}
                            className="px-8 py-3 bg-gradient-to-r from-copper-600 to-copper-700 text-white rounded-lg font-medium hover:from-copper-500 hover:to-copper-600 transition-all inline-flex items-center gap-2"
                          >
                            Review Material & Retake
                            <ArrowLeftIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Answer Review */}
                    <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Answer Review</h3>
                      <div className="space-y-4">
                        {quizQuestions.map((question, qIndex) => {
                          const userAnswer = quizAnswers[qIndex];
                          const isCorrect = userAnswer === question.correctIndex;
                          return (
                            <div
                              key={question.id}
                              className={`p-4 rounded-lg border ${
                                isCorrect
                                  ? 'bg-emerald-500/10 border-emerald-500/20'
                                  : 'bg-red-500/10 border-red-500/20'
                              }`}
                            >
                              <div className="flex items-start gap-3 mb-2">
                                {isCorrect ? (
                                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <p className="text-white font-medium">{question.question}</p>
                                  {!isCorrect && (
                                    <p className="text-sm text-dark-400 mt-1">
                                      Your answer: {question.options[userAnswer!]}
                                    </p>
                                  )}
                                  <p className="text-sm text-emerald-400 mt-1">
                                    Correct answer: {question.options[question.correctIndex]}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
