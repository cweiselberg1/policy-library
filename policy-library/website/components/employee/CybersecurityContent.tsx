'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldExclamationIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthProvider';
import { upsertTrainingProgress, completeModule } from '@/lib/supabase/training';

interface TrainingProgress {
  current_module: string;
  current_step: string;
  modules_completed: string[];
  percentage: number;
  last_updated: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const sections = [
  {
    id: 1,
    title: 'Common Cybersecurity Threats',
    icon: ShieldExclamationIcon,
    content: [
      {
        subtitle: 'Phishing',
        description: 'Fraudulent emails designed to steal sensitive information by impersonating trusted entities.',
        keyPoints: [
          'Look for suspicious sender addresses',
          'Verify links before clicking',
          'Never provide credentials via email',
          'Report suspicious emails immediately',
        ],
      },
      {
        subtitle: 'Ransomware',
        description: 'Malicious software that encrypts your data and demands payment for its release.',
        keyPoints: [
          'Regular backups are critical',
          'Keep software updated',
          'Don\'t open suspicious attachments',
          'Use antivirus protection',
        ],
      },
      {
        subtitle: 'Malware',
        description: 'Software designed to harm or exploit devices, networks, or data.',
        keyPoints: [
          'Only download from trusted sources',
          'Keep antivirus software current',
          'Scan external drives before use',
          'Be cautious with email attachments',
        ],
      },
      {
        subtitle: 'Social Engineering',
        description: 'Manipulation tactics used to trick people into divulging confidential information.',
        keyPoints: [
          'Verify identities before sharing information',
          'Be skeptical of urgent requests',
          'Don\'t trust caller ID alone',
          'Follow verification protocols',
        ],
      },
      {
        subtitle: 'Insider Threats',
        description: 'Security risks from individuals within the organization who misuse access privileges.',
        keyPoints: [
          'Follow least privilege principle',
          'Report suspicious behavior',
          'Secure physical workspaces',
          'Log out when away from desk',
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Password Security & Authentication',
    icon: LockClosedIcon,
    content: [
      {
        subtitle: 'Password Best Practices',
        description: 'Strong passwords are your first line of defense against unauthorized access.',
        keyPoints: [
          'Use at least 12 characters',
          'Combine uppercase, lowercase, numbers, and symbols',
          'Avoid common words and personal information',
          'Use unique passwords for each account',
          'Consider using a password manager',
        ],
      },
      {
        subtitle: 'Multi-Factor Authentication (MFA)',
        description: 'Requiring two or more verification methods to log in significantly enhances security.',
        keyPoints: [
          'Enable MFA on all accounts that support it',
          'Use authenticator apps over SMS when possible',
          'Keep backup codes in a secure location',
          'Never share MFA codes with anyone',
        ],
      },
      {
        subtitle: 'Account Security',
        description: 'Protecting your accounts goes beyond just passwords.',
        keyPoints: [
          'Change passwords immediately if breach suspected',
          'Review account activity regularly',
          'Set up security alerts',
          'Use security questions wisely',
        ],
      },
      {
        subtitle: 'Session Management',
        description: 'Proper session handling prevents unauthorized access.',
        keyPoints: [
          'Log out when finished, especially on shared devices',
          'Lock your screen when away from desk',
          'Don\'t save passwords on public computers',
          'Clear browser cache on shared devices',
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Email Security & Phishing Prevention',
    icon: EnvelopeIcon,
    content: [
      {
        subtitle: 'Identifying Phishing Emails',
        description: 'Recognizing phishing attempts is critical to preventing security breaches.',
        keyPoints: [
          'Check sender address carefully (not just display name)',
          'Look for spelling and grammar errors',
          'Be suspicious of urgent or threatening language',
          'Verify unexpected requests through another channel',
          'Hover over links to see actual destination',
        ],
      },
      {
        subtitle: 'Safe Email Practices',
        description: 'Following email security guidelines protects both you and the organization.',
        keyPoints: [
          'Don\'t click links or open attachments from unknown senders',
          'Use email encryption for sensitive information',
          'Be cautious with "Reply All"',
          'Verify recipient addresses before sending',
          'Use BCC for large recipient lists',
        ],
      },
      {
        subtitle: 'PHI in Email',
        description: 'Protected Health Information requires special handling in email communications.',
        keyPoints: [
          'Use encrypted email for PHI transmission',
          'Verify recipient has authorization to receive PHI',
          'Include minimum necessary information only',
          'Follow organizational policies for secure messaging',
        ],
      },
      {
        subtitle: 'Red Flags to Watch For',
        description: 'Common indicators that an email may be malicious.',
        keyPoints: [
          'Requests for passwords or sensitive information',
          'Unexpected invoices or payment requests',
          'Urgent requests to take immediate action',
          'Links to unfamiliar websites',
          'Attachments with suspicious file extensions (.exe, .zip)',
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Incident Response & Reporting',
    icon: ExclamationTriangleIcon,
    content: [
      {
        subtitle: 'What Constitutes a Security Incident',
        description: 'Understanding what needs to be reported is the first step in incident response.',
        keyPoints: [
          'Suspected phishing attempts',
          'Lost or stolen devices containing PHI',
          'Unauthorized access to systems or data',
          'Malware infections',
          'Suspicious system behavior',
          'Unintended PHI disclosure',
        ],
      },
      {
        subtitle: 'Immediate Actions',
        description: 'What to do when you suspect a security incident.',
        keyPoints: [
          'Stop - don\'t click further or enter more information',
          'Disconnect from network if malware suspected',
          'Document what happened (screenshots, notes)',
          'Don\'t attempt to fix it yourself',
          'Preserve evidence',
        ],
      },
      {
        subtitle: 'Reporting Requirements',
        description: 'Timely reporting is critical for effective incident response.',
        keyPoints: [
          'Report immediately to IT/Security team',
          'Include all relevant details',
          'Don\'t wait to be "sure" - report suspicions',
          'Follow your organization\'s reporting procedures',
          'Cooperate fully with investigation',
        ],
      },
      {
        subtitle: 'Prevention is Key',
        description: 'The best incident is one that never happens.',
        keyPoints: [
          'Stay vigilant and trust your instincts',
          'Keep security training current',
          'Follow all security policies and procedures',
          'Update software and devices regularly',
          'Report security concerns proactively',
        ],
      },
    ],
  },
];

const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is phishing?',
    options: [
      'A type of fishing technique',
      'Fraudulent emails designed to steal information',
      'A legitimate marketing practice',
      'A method of data encryption',
    ],
    correctAnswer: 1,
    explanation: 'Phishing is a cyberattack method where fraudulent emails impersonate trusted entities to steal sensitive information like passwords and financial data.',
  },
  {
    question: 'What is the minimum recommended password length?',
    options: [
      '6 characters',
      '8 characters',
      '10 characters',
      '12 characters',
    ],
    correctAnswer: 3,
    explanation: 'Industry best practice recommends at least 12 characters for passwords to provide adequate security against brute force attacks.',
  },
  {
    question: 'What should you do if you receive a suspicious email asking for your password?',
    options: [
      'Reply with your password',
      'Call the sender to verify',
      'Report it to IT/Security and delete it',
      'Forward it to your colleagues',
    ],
    correctAnswer: 2,
    explanation: 'Never provide your password via email. Legitimate organizations will never ask for your password. Always report suspicious emails to your IT/Security team immediately.',
  },
  {
    question: 'What is Multi-Factor Authentication (MFA)?',
    options: [
      'Using the same password for multiple accounts',
      'Requiring two or more verification methods to log in',
      'A type of password manager',
      'An email encryption method',
    ],
    correctAnswer: 1,
    explanation: 'MFA requires two or more different verification methods (like password + code from phone) to authenticate, significantly improving account security.',
  },
  {
    question: 'What should you do if you accidentally click on a link in a phishing email?',
    options: [
      'Ignore it and hope nothing happens',
      'Report it to IT/Security immediately',
      'Change your email password only',
      'Delete the email and forget about it',
    ],
    correctAnswer: 1,
    explanation: 'Immediately report any suspected phishing incidents to IT/Security. Quick reporting enables rapid response to prevent or minimize damage.',
  },
];

export default function CybersecurityContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>(Array(quizQuestions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('training_progress');
    if (stored) {
      setProgress(JSON.parse(stored));
    }
  }, []);

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    const correct = quizAnswers.filter((answer, index) => answer === quizQuestions[index].correctAnswer).length;
    setQuizScore(correct);
    setShowResults(true);
  };

  const handleCompleteModule = async () => {
    setSaveError(null);

    // Save to localStorage as fallback
    const updatedProgress: TrainingProgress = {
      current_module: 'complete',
      current_step: 'complete',
      modules_completed: [...(progress?.modules_completed || []), 'cybersecurity'],
      percentage: 100,
      last_updated: new Date().toISOString(),
    };
    localStorage.setItem('training_progress', JSON.stringify(updatedProgress));

    // Save to Supabase if user is authenticated
    if (user?.id) {
      try {
        // Record module completion
        await completeModule(user.id, 'cybersecurity', quizScore);

        // Update overall training progress
        await upsertTrainingProgress({
          user_id: user.id,
          cybersecurity_complete: true,
          overall_percentage: 100,
          current_step: 'complete'
        });
      } catch (error) {
        console.error('Failed to save progress to Supabase:', error);
        setSaveError('Progress saved locally but failed to sync to server. Your progress will sync later.');
        // Don't block navigation - allow user to continue
      }
    }

    router.push('/dashboard/employee/training');
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers(Array(quizQuestions.length).fill(-1));
    setShowResults(false);
    setQuizScore(0);
  };

  const passedQuiz = quizScore >= quizQuestions.length * 0.8;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/employee/training"
            className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Training
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <ShieldExclamationIcon className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Cybersecurity Awareness</h1>
              <p className="text-slate-400 mt-1">Learn to identify and prevent security threats</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Progress */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">Training Progress</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-300">Policy Review</div>
                    <div className="text-xs text-slate-400 mt-0.5">Completed</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-300">HIPAA 101</div>
                    <div className="text-xs text-slate-400 mt-0.5">Completed</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <div className="text-sm font-medium text-white">Cybersecurity</div>
                    <div className="text-xs text-orange-400 mt-0.5">In Progress</div>
                  </div>
                </div>
              </div>

              {!showQuiz && (
                <>
                  <div className="h-px bg-slate-700/50 my-6" />
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Section Progress</span>
                      <span className="text-white font-medium">{currentSection + 1}/{sections.length}</span>
                    </div>
                    <div className="flex gap-1">
                      {sections.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 flex-1 rounded-full ${
                            index < currentSection
                              ? 'bg-emerald-500'
                              : index === currentSection
                              ? 'bg-orange-500'
                              : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <ClockIcon className="w-4 h-4" />
                  <span>~20 minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!showQuiz ? (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  {(() => {
                    const Icon = sections[currentSection].icon;
                    return <Icon className="w-8 h-8 text-orange-500" />;
                  })()}
                  <h2 className="text-2xl font-bold text-white">{sections[currentSection].title}</h2>
                </div>

                <div className="space-y-6">
                  {sections[currentSection].content.map((item, index) => (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">{item.subtitle}</h3>
                      <p className="text-slate-300 mb-4">{item.description}</p>
                      <ul className="space-y-2">
                        {item.keyPoints.map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start gap-3 text-slate-300">
                            <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
                  <button
                    onClick={handlePrevSection}
                    disabled={currentSection === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      currentSection === 0
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ArrowLeftIcon className="w-5 h-5" />
                      Previous
                    </div>
                  </button>

                  <button
                    onClick={handleNextSection}
                    className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 transition-all shadow-lg shadow-orange-500/20"
                  >
                    <div className="flex items-center gap-2">
                      {currentSection < sections.length - 1 ? 'Next Section' : 'Take Quiz'}
                      <ArrowRightIcon className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Knowledge Check</h2>

                {!showResults ? (
                  <div className="space-y-8">
                    {quizQuestions.map((question, qIndex) => (
                      <div key={qIndex} className="bg-slate-900/50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          {qIndex + 1}. {question.question}
                        </h3>
                        <div className="space-y-3">
                          {question.options.map((option, oIndex) => (
                            <button
                              key={oIndex}
                              onClick={() => handleQuizAnswer(qIndex, oIndex)}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                quizAnswers[qIndex] === oIndex
                                  ? 'bg-orange-500/20 border-2 border-orange-500 text-white'
                                  : 'bg-slate-800 border-2 border-slate-700 text-slate-300 hover:border-slate-600'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-6 border-t border-slate-700/50">
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={quizAnswers.includes(-1)}
                        className={`px-8 py-3 rounded-lg font-medium transition-all ${
                          quizAnswers.includes(-1)
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 shadow-lg shadow-orange-500/20'
                        }`}
                      >
                        Submit Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div
                      className={`p-6 rounded-xl border-2 ${
                        passedQuiz
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {passedQuiz ? (
                          <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
                        ) : (
                          <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
                        )}
                        <div>
                          <h3 className={`text-xl font-bold ${passedQuiz ? 'text-emerald-400' : 'text-red-400'}`}>
                            {passedQuiz ? 'Congratulations!' : 'Not Quite There'}
                          </h3>
                          <p className="text-slate-300 mt-1">
                            You scored {quizScore} out of {quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                          </p>
                          {!passedQuiz && (
                            <p className="text-slate-400 text-sm mt-2">You need 80% to pass. Please review the material and try again.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {quizQuestions.map((question, qIndex) => {
                        const isCorrect = quizAnswers[qIndex] === question.correctAnswer;
                        return (
                          <div key={qIndex} className="bg-slate-900/50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                              {qIndex + 1}. {question.question}
                            </h3>
                            <div className="space-y-3 mb-4">
                              {question.options.map((option, oIndex) => {
                                const isSelected = quizAnswers[qIndex] === oIndex;
                                const isCorrectOption = oIndex === question.correctAnswer;
                                return (
                                  <div
                                    key={oIndex}
                                    className={`px-4 py-3 rounded-lg border-2 ${
                                      isCorrectOption
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                        : isSelected
                                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                        : 'bg-slate-800 border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{option}</span>
                                      {isCorrectOption && <CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
                                      {isSelected && !isCorrectOption && (
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div
                              className={`p-4 rounded-lg ${
                                isCorrect ? 'bg-emerald-500/10' : 'bg-orange-500/10'
                              }`}
                            >
                              <p className="text-sm text-slate-300">{question.explanation}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-4">
                      {saveError && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-sm text-yellow-300">{saveError}</p>
                        </div>
                      )}

                      <div className="flex justify-end gap-4 pt-6 border-t border-slate-700/50">
                        {!passedQuiz && (
                          <button
                            onClick={handleRetakeQuiz}
                            className="px-6 py-3 rounded-lg font-medium bg-slate-700 text-white hover:bg-slate-600 transition-all"
                          >
                            Retake Quiz
                          </button>
                        )}
                        {passedQuiz && (
                          <button
                            onClick={handleCompleteModule}
                            className="px-8 py-3 rounded-lg font-medium bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-500 hover:to-cyan-500 transition-all shadow-lg shadow-emerald-500/20"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="w-5 h-5" />
                              Complete Module
                            </div>
                          </button>
                        )}
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
