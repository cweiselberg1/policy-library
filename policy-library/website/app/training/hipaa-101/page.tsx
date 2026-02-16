'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import QuizQuestion from '@/components/training/QuizQuestion';
import ProgressIndicator from '@/components/training/ProgressIndicator';
import { orgStorage } from '@/lib/supabase/org-storage';

interface Section {
  id: string;
  title: string;
  content: string;
  completed: boolean;
}

export default function Hipaa101Page() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'intro',
      title: 'Introduction to HIPAA',
      content: `HIPAA (Health Insurance Portability and Accountability Act) was enacted in 1996 to protect sensitive patient health information. The law establishes national standards for the protection of certain health information.

Key Components:
• Privacy Rule: Protects all "individually identifiable health information"
• Security Rule: Sets standards for patient data security
• Breach Notification Rule: Requires covered entities to notify patients of breaches
• Enforcement Rule: Contains provisions for investigations and penalties`,
      completed: false,
    },
    {
      id: 'phi',
      title: 'Protected Health Information (PHI)',
      content: `PHI is any information in a medical record that can identify an individual and relates to their health condition, healthcare provision, or payment for healthcare.

Examples of PHI:
• Names, addresses, dates (birth, admission, discharge, death)
• Phone numbers, email addresses, social security numbers
• Medical record numbers, health plan beneficiary numbers
• Account numbers, certificate/license numbers
• Biometric identifiers (fingerprints, voice prints)
• Full-face photos and comparable images
• Any other unique identifying number or code

All PHI must be protected, whether in electronic, paper, or oral form.`,
      completed: false,
    },
    {
      id: 'rights',
      title: 'Patient Rights Under HIPAA',
      content: `HIPAA grants patients significant rights over their health information:

1. Right to Access: Patients can request copies of their medical records
2. Right to Amend: Patients can request corrections to their records
3. Right to Accounting: Patients can request a list of disclosures
4. Right to Restrict: Patients can request limits on uses/disclosures
5. Right to Confidential Communications: Patients can request communications via alternative means
6. Right to Notice: Patients must receive a Notice of Privacy Practices

Organizations must have processes in place to honor these rights within specified timeframes.`,
      completed: false,
    },
    {
      id: 'security',
      title: 'Security Best Practices',
      content: `Every team member plays a critical role in maintaining HIPAA compliance:

Physical Security:
• Lock doors and file cabinets containing PHI
• Never leave PHI unattended in public areas
• Properly dispose of PHI (shred paper, wipe devices)
• Escort visitors in areas where PHI is accessible

Technical Security:
• Use strong, unique passwords (minimum 8 characters)
• Never share login credentials
• Lock your computer when stepping away
• Use encrypted communication for PHI
• Report suspicious emails or security incidents immediately

Administrative Security:
• Only access PHI necessary for your job
• Complete required training and acknowledge policies
• Report any suspected privacy violations
• Follow the minimum necessary standard`,
      completed: false,
    },
  ]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const quizQuestions = [
    {
      question: 'What does PHI stand for?',
      options: [
        'Personal Health Insurance',
        'Protected Health Information',
        'Private Hospital Information',
        'Public Health Initiative',
      ],
      correctAnswer: 1,
      explanation: 'PHI stands for Protected Health Information - any individually identifiable health information that must be protected under HIPAA.',
    },
    {
      question: 'Which of the following is NOT a patient right under HIPAA?',
      options: [
        'Right to access their medical records',
        'Right to request amendments to their records',
        'Right to choose their healthcare provider',
        'Right to receive a Notice of Privacy Practices',
      ],
      correctAnswer: 2,
      explanation: 'While patients have many rights under HIPAA regarding their health information, choosing their healthcare provider is not specifically a HIPAA-granted right.',
    },
    {
      question: 'What should you do if you receive a suspicious email asking for patient information?',
      options: [
        'Reply with the requested information if it seems legitimate',
        'Forward it to colleagues to verify',
        'Report it to IT/Security immediately',
        'Delete it and continue working',
      ],
      correctAnswer: 2,
      explanation: 'You should always report suspicious emails to IT/Security immediately. This could be a phishing attempt to steal PHI.',
    },
    {
      question: 'Which of these is an example of PHI?',
      options: [
        'General statistics about hospital admission rates',
        "A patient's medical record number",
        'Information about hospital policies',
        'Publicly available health education materials',
      ],
      correctAnswer: 1,
      explanation: "A patient's medical record number is individually identifiable information that can be linked to a specific person, making it PHI that must be protected.",
    },
  ];

  const handleNextSection = () => {
    const updatedSections = [...sections];
    updatedSections[currentSection].completed = true;
    setSections(updatedSections);

    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handleQuizAnswer = (questionIndex: number, correct: boolean) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: correct,
    }));
  };

  const handleComplete = () => {
    setSaving(true);
    setError('');

    try {
      // Load existing progress to preserve policies_completed
      const saved = orgStorage.getItem('hipaa-training-progress');
      const existingProgress = saved ? JSON.parse(saved) : {};

      // Save progress to localStorage
      const progressData = {
        policies_completed: existingProgress.policies_completed || [],
        modules_completed: ['policies', 'hipaa-101'],
        current_step: 'cybersecurity',
        percentage: 66,
      };

      orgStorage.setItem('hipaa-training-progress', JSON.stringify(progressData));
      router.push('/training/cybersecurity');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const allQuestionsAnswered = Object.keys(quizAnswers).length === quizQuestions.length;
  const quizScore = Object.values(quizAnswers).filter((v) => v).length;
  const quizPassed = quizScore >= quizQuestions.length * 0.75; // 75% passing

  const trainingSteps = [
    { id: 'policies', title: 'Policy Review', completed: true },
    { id: 'hipaa-101', title: 'HIPAA 101', completed: false },
    { id: 'cybersecurity', title: 'Cybersecurity Awareness', completed: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-evergreen-50/30 to-sand-50">
      {/* Header */}
      <header className="bg-white border-b border-pearl-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-evergreen-700 to-evergreen-600 shadow-lg">
                <ShieldCheckIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-evergreen-950" style={{ fontFamily: 'var(--font-dm-serif)' }}>HIPAA 101</h1>
                <p className="mt-1 text-[--text-muted]">Learn the fundamentals of HIPAA compliance</p>
              </div>
            </div>
            <Link
              href="/training"
              className="text-sm text-copper-600 hover:text-copper-700 font-medium transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          {/* Main Content */}
          <div>
            {!showQuiz ? (
              <>
                {/* Section Progress */}
                <div className="bg-white rounded-lg shadow-sm border border-pearl-200 p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-evergreen-950">
                      Section {currentSection + 1} of {sections.length}
                    </h2>
                    <span className="text-sm text-[--text-muted]">
                      {sections.filter((s) => s.completed).length} completed
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {sections.map((section, index) => (
                      <div
                        key={section.id}
                        className={`flex-1 h-2 rounded-full ${
                          section.completed
                            ? 'bg-emerald-500'
                            : index === currentSection
                            ? 'bg-copper-500'
                            : 'bg-pearl-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm border border-pearl-200 p-8 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-evergreen-100">
                      <ShieldCheckIcon className="h-6 w-6 text-evergreen-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-evergreen-950">
                      {sections[currentSection].title}
                    </h2>
                  </div>

                  <div className="prose prose-slate max-w-none">
                    {sections[currentSection].content.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-[--text-secondary] mb-4 whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                    disabled={currentSection === 0}
                    className="px-6 py-3 border-2 border-pearl-300 text-[--text-secondary] font-semibold rounded-lg hover:bg-pearl-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <button
                    onClick={handleNextSection}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-copper-600 to-copper-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    {currentSection < sections.length - 1 ? 'Next Section' : 'Start Quiz'}
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Quiz Section */}
                <div className="bg-white rounded-lg shadow-sm border border-pearl-200 p-8 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-copper-100">
                      <ShieldCheckIcon className="h-6 w-6 text-copper-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-evergreen-950">Knowledge Check</h2>
                      <p className="text-sm text-[--text-muted]">
                        Answer all questions to complete this module (75% required to pass)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {quizQuestions.map((question, index) => (
                      <QuizQuestion
                        key={index}
                        question={question.question}
                        options={question.options}
                        correctAnswer={question.correctAnswer}
                        explanation={question.explanation}
                        onAnswer={(correct) => handleQuizAnswer(index, correct)}
                      />
                    ))}
                  </div>
                </div>

                {/* Quiz Results */}
                {allQuestionsAnswered && (
                  <div
                    className={`rounded-lg border-2 p-8 mb-8 ${
                      quizPassed
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {quizPassed ? (
                        <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                      ) : (
                        <ClockIcon className="h-8 w-8 text-red-600" />
                      )}
                      <div>
                        <h3 className={`text-xl font-bold ${quizPassed ? 'text-emerald-900' : 'text-red-900'}`}>
                          {quizPassed ? 'Congratulations!' : 'Keep Practicing'}
                        </h3>
                        <p className={`text-sm ${quizPassed ? 'text-emerald-800' : 'text-red-800'}`}>
                          You scored {quizScore} out of {quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                        </p>
                      </div>
                    </div>

                    {quizPassed ? (
                      <p className="text-emerald-800">
                        You've successfully completed the HIPAA 101 module. Click Continue to proceed to Cybersecurity Awareness.
                      </p>
                    ) : (
                      <p className="text-red-800">
                        You need at least {Math.ceil(quizQuestions.length * 0.75)} correct answers to pass. Please review the material and try again.
                      </p>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowQuiz(false)}
                    className="px-6 py-3 border-2 border-pearl-300 text-[--text-secondary] font-semibold rounded-lg hover:bg-pearl-50 transition-all"
                  >
                    Review Content
                  </button>

                  <button
                    onClick={handleComplete}
                    disabled={!allQuestionsAnswered || !quizPassed || saving}
                    className="relative flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-copper-600 to-copper-500 text-white font-black rounded-lg shadow-[8px_8px_0px_0px_rgba(168,90,40,0.3)] hover:shadow-[12px_12px_0px_0px_rgba(168,90,40,0.4)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 uppercase tracking-wider overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                    {saving ? (
                      <>
                        <ClockIcon className="h-6 w-6 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">Continue to Cybersecurity</span>
                        <ArrowRightIcon className="h-6 w-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <ProgressIndicator steps={trainingSteps} currentStepId="hipaa-101" />
          </aside>
        </div>
      </main>
    </div>
  );
}
