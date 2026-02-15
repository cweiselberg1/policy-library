'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRightIcon,
  ClockIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import QuizQuestion from '@/components/training/QuizQuestion';
import ProgressIndicator from '@/components/training/ProgressIndicator';

interface Section {
  id: string;
  title: string;
  content: string;
  completed: boolean;
}

export default function CybersecurityPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'threats',
      title: 'Common Cybersecurity Threats',
      content: `Healthcare organizations are prime targets for cybercriminals. Understanding common threats is your first line of defense:

Phishing Attacks:
• Fraudulent emails appearing to be from legitimate sources
• Often request sensitive information or contain malicious links
• Can be highly sophisticated and personalized (spear phishing)

Ransomware:
• Malicious software that encrypts your data
• Attackers demand payment for decryption keys
• Can paralyze healthcare operations

Malware:
• Viruses, trojans, and other malicious software
• Can steal data, monitor activity, or damage systems
• Often spread through email attachments or downloads

Social Engineering:
• Manipulating people into divulging confidential information
• Can occur via phone, email, or in person
• Exploits trust and authority

Insider Threats:
• Unauthorized access by employees or contractors
• Can be malicious or accidental
• Regular audits help detect unusual access patterns`,
      completed: false,
    },
    {
      id: 'passwords',
      title: 'Password Security & Authentication',
      content: `Strong authentication is critical for protecting PHI:

Password Best Practices:
• Use minimum 12 characters (longer is better)
• Combine uppercase, lowercase, numbers, and symbols
• Avoid personal information (birthdays, names, etc.)
• Never reuse passwords across systems
• Use a password manager for complex passwords

Multi-Factor Authentication (MFA):
• Requires two or more verification methods
• Something you know (password)
• Something you have (phone, token)
• Something you are (fingerprint, face scan)
• Dramatically reduces unauthorized access risk

Account Security:
• Never share your credentials with anyone
• Log out when leaving your workstation
• Use screen locks (automatic after 5 minutes idle)
• Report suspicious login attempts immediately
• Change passwords immediately if compromised

Session Management:
• Lock your computer when stepping away (Windows: Win+L, Mac: Cmd+Ctrl+Q)
• Close applications containing PHI when not in use
• Log out completely at end of day`,
      completed: false,
    },
    {
      id: 'email',
      title: 'Email Security & Phishing Prevention',
      content: `Email is the most common attack vector. Stay vigilant:

Identifying Phishing Emails:
• Check sender address carefully (spoofed domains)
• Suspicious subject lines (urgent, threatening, too good to be true)
• Generic greetings ("Dear Customer" instead of your name)
• Spelling and grammar errors
• Requests for sensitive information
• Unexpected attachments or links
• Mismatched URLs (hover to see actual destination)

Safe Email Practices:
• Verify sender identity before clicking links
• Never open unexpected attachments
• Don't download files from unknown sources
• Be wary of urgent requests for action
• Use official channels to verify requests
• Report suspicious emails to IT/Security

PHI in Email:
• Never send unencrypted PHI via regular email
• Use secure messaging systems for patient information
• Verify recipient email addresses carefully
• Use "Reply" instead of "Reply All" for sensitive info
• Be cautious with auto-complete email suggestions

Red Flags:
• "Verify your account" requests
• Fake password reset notifications
• Delivery failure notifications for emails you didn't send
• Requests to update payment information
• Prize/lottery winnings notifications`,
      completed: false,
    },
    {
      id: 'incident',
      title: 'Incident Response & Reporting',
      content: `Quick response to security incidents minimizes damage:

What Constitutes a Security Incident:
• Suspected or confirmed data breach
• Lost or stolen devices containing PHI
• Unauthorized access to patient records
• Ransomware or malware infection
• Phishing email with clicked link or opened attachment
• Suspicious system behavior
• Accidental disclosure of PHI

Immediate Actions:
1. Don't panic - but act quickly
2. Disconnect affected device from network (if malware suspected)
3. Don't delete anything (preserve evidence)
4. Document what happened (date, time, actions taken)
5. Report to IT/Security immediately
6. Follow organization's incident response plan

Reporting Requirements:
• Report ALL suspected incidents immediately
• Contact: IT Security team, Privacy Officer, or Compliance
• Use established reporting channels (hotline, email, portal)
• Better to over-report than under-report
• No retaliation for good-faith reporting

Prevention Through Awareness:
• Complete all required security training
• Stay informed about current threats
• Follow security policies and procedures
• Ask questions if unsure about security
• Encourage team members to be security-conscious

Remember: Early detection and reporting of security incidents can prevent small issues from becoming major breaches.`,
      completed: false,
    },
  ]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const quizQuestions = [
    {
      question: 'What is phishing?',
      options: [
        'A type of computer virus',
        'Fraudulent emails designed to steal information',
        'A network security protocol',
        'A password encryption method',
      ],
      correctAnswer: 1,
      explanation: 'Phishing is a social engineering attack where fraudulent emails or messages are sent to trick people into revealing sensitive information or clicking malicious links.',
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
      explanation: 'Modern best practices recommend passwords of at least 12 characters. Longer passwords are exponentially more secure against brute-force attacks.',
    },
    {
      question: 'What should you do if you receive a suspicious email asking for your password?',
      options: [
        'Reply with your password if the sender seems legitimate',
        'Click the link to verify your account',
        'Report it to IT/Security and delete it',
        'Forward it to colleagues to warn them',
      ],
      correctAnswer: 2,
      explanation: 'Never provide your password via email. Report suspicious emails to IT/Security immediately. Legitimate organizations will never ask for your password via email.',
    },
    {
      question: 'What is multi-factor authentication (MFA)?',
      options: [
        'Using multiple passwords on the same account',
        'Requiring two or more verification methods to log in',
        'Changing your password multiple times',
        'Having multiple user accounts',
      ],
      correctAnswer: 1,
      explanation: 'Multi-factor authentication requires two or more different types of verification (like password + phone code) to access an account, making it much more secure.',
    },
    {
      question: 'What should you do if you accidentally click a link in a phishing email?',
      options: [
        'Continue working and hope nothing happens',
        'Delete the email and forget about it',
        'Report it to IT/Security immediately',
        'Change your password next week',
      ],
      correctAnswer: 2,
      explanation: "Report the incident to IT/Security immediately. Quick response can prevent or minimize damage. Don't wait or try to handle it yourself.",
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
      const saved = localStorage.getItem('hipaa-training-progress');
      const existingProgress = saved ? JSON.parse(saved) : {};

      // Save progress to localStorage
      const progressData = {
        policies_completed: existingProgress.policies_completed || [],
        modules_completed: ['policies', 'hipaa-101', 'cybersecurity'],
        current_step: 'complete',
        percentage: 100,
      };

      localStorage.setItem('hipaa-training-progress', JSON.stringify(progressData));
      router.push('/training');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const allQuestionsAnswered = Object.keys(quizAnswers).length === quizQuestions.length;
  const quizScore = Object.values(quizAnswers).filter((v) => v).length;
  const quizPassed = quizScore >= quizQuestions.length * 0.8; // 80% passing

  const trainingSteps = [
    { id: 'policies', title: 'Policy Review', completed: true },
    { id: 'hipaa-101', title: 'HIPAA 101', completed: true },
    { id: 'cybersecurity', title: 'Cybersecurity Awareness', completed: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-sand-50/30 to-pearl-100">
      {/* Header */}
      <header className="bg-white border-b border-pearl-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-red-600 shadow-lg">
                <ShieldExclamationIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-evergreen-950" style={{ fontFamily: 'var(--font-dm-serif)' }}>Cybersecurity Awareness</h1>
                <p className="mt-1 text-[--text-muted]">Master essential security practices</p>
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
                            ? 'bg-orange-500'
                            : 'bg-pearl-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm border border-pearl-200 p-8 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                      <ShieldExclamationIcon className="h-6 w-6 text-orange-600" />
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
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                      <ShieldExclamationIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-evergreen-950">Security Assessment</h2>
                      <p className="text-sm text-[--text-muted]">
                        Answer all questions to complete this module (80% required to pass)
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
                          {quizPassed ? 'Excellent Work!' : 'Keep Practicing'}
                        </h3>
                        <p className={`text-sm ${quizPassed ? 'text-emerald-800' : 'text-red-800'}`}>
                          You scored {quizScore} out of {quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                        </p>
                      </div>
                    </div>

                    {quizPassed ? (
                      <p className="text-emerald-800">
                        Congratulations! You've completed all HIPAA training modules. Click Complete Training to finish and return to the dashboard.
                      </p>
                    ) : (
                      <p className="text-red-800">
                        You need at least {Math.ceil(quizQuestions.length * 0.8)} correct answers to pass. Please review the material and try again.
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
                    className="relative flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-evergreen-700 to-evergreen-600 text-white font-black rounded-lg shadow-[8px_8px_0px_0px_rgba(18,43,34,0.3)] hover:shadow-[12px_12px_0px_0px_rgba(18,43,34,0.4)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 uppercase tracking-wider overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                    {saving ? (
                      <>
                        <ClockIcon className="h-6 w-6 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-6 w-6 relative z-10" />
                        <span className="relative z-10">Complete Training</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <ProgressIndicator steps={trainingSteps} currentStepId="cybersecurity" />
          </aside>
        </div>
      </main>
    </div>
  );
}
