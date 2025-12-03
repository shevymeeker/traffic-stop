import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, BookOpen, Target, FileText, ChevronRight, ChevronDown, Clock, Camera, Phone, Volume2, Play } from 'lucide-react';

export default function TrafficStopSimulator() {
  const [mode, setMode] = useState('home');
  const [scenarioStep, setScenarioStep] = useState(0);
  const [responses, setResponses] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [learnTab, setLearnTab] = useState('lane1'); // lane1, lane2, lane3, script
  const [expandedSections, setExpandedSections] = useState({});
  const [docData, setDocData] = useState(() => {
    // Load saved documentation from localStorage on mount
    const saved = localStorage.getItem('trafficStopDoc');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Save docData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('trafficStopDoc', JSON.stringify(docData));
  }, [docData]);

  const handleClearDocumentation = () => {
    // Ask for confirmation before clearing
    if (window.confirm("Are you sure you want to clear all documentation data? This cannot be undone.")) {
      setDocData({});
      // Your useEffect will automatically update localStorage
    }
  };

  const threeLines = [
    "Officer, I am exercising my right to remain silent.",
    "I do not consent to any searches.",
    "Am I being detained, or am I free to go?"
  ];

  const scenarios = [
    {
      officer: "Do you know why I pulled you over?",
      correct: 0,
      options: [
        { text: '"Officer, I am exercising my right to remain silent."', legal: true, explanation: "Never admit guilt. This invokes your Fifth Amendment right." },
        { text: '"I was going a bit fast, sorry."', legal: false, explanation: "You just admitted guilt. This becomes evidence." },
        { text: '"I was hoping you could tell me why you pulled me over."', legal: true, explanation: "Forces them to articulate the reason. Also acceptable." }
      ]
    },
    {
      officer: "Where are you coming from tonight?",
      correct: 0,
      options: [
        { text: '"I am exercising my right to remain silent."', legal: true, explanation: "Travel questions are not legally required. This ends it." },
        { text: '"Just heading home from work."', legal: false, explanation: "Voluntary information. Gets catalogued as an indicator." },
        { text: '"Why do you need to know that?"', legal: false, explanation: "Sounds confrontational. Still answered the question by engaging. Use the script." }
      ]
    },
    {
      officer: "Where are you headed?",
      correct: 0,
      options: [
        { text: '"I am exercising my right to remain silent."', legal: true, explanation: "This is a 'hook question' designed to develop reasonable suspicion. Don't answer." },
        { text: '"Just visiting family."', legal: false, explanation: "Voluntary information. They'll ask who, where, when - building a profile." },
        { text: '"Why does that matter?"', legal: false, explanation: "You're engaging and sound defensive. Stick to the script." }
      ]
    },
    {
      officer: "What's the purpose of your trip?",
      correct: 0,
      options: [
        { text: '"I am exercising my right to remain silent."', legal: true, explanation: "They're building a travel profile. This ends the questioning." },
        { text: '"Business trip."', legal: false, explanation: "Now they'll ask what kind of business, where, contradictions become 'indicators'." },
        { text: '"That\'s private."', legal: false, explanation: "Sounds evasive. Use the constitutional script instead." }
      ]
    },
    {
      officer: "Who knows you're traveling?",
      correct: 0,
      options: [
        { text: '"I am exercising my right to remain silent."', legal: true, explanation: "This question assesses if you'll be reported missing. Don't answer." },
        { text: '"My family."', legal: false, explanation: "You just told them people expect you. This becomes part of their suspicion analysis." },
        { text: '"Nobody."', legal: false, explanation: "Wrong answer AND you engaged. Never speculate or lie." }
      ]
    },
    {
      officer: "Mind if I take a look in the vehicle?",
      correct: 1,
      options: [
        { text: '"I guess that\'s fine."', legal: false, explanation: "You just consented. If they had probable cause, they wouldn't ask." },
        { text: '"I do not consent to any searches."', legal: true, explanation: "Perfect. If they had grounds for a warrant, they wouldn't need your consent." },
        { text: '"Do you have a warrant?"', legal: false, explanation: "Sounds like you're hiding something. Just state no consent." }
      ]
    },
    {
      officer: "You seem really nervous. Why is that?",
      correct: 0,
      options: [
        { text: '"I am exercising my right to remain silent."', legal: true, explanation: "Nervousness is used as an indicator. Don't explain yourself." },
        { text: '"I\'m not nervous, I\'m just tired."', legal: false, explanation: "Now you're both nervous AND making excuses. Use the script." },
        { text: '"Being pulled over makes me nervous."', legal: false, explanation: "Reasonable, but still voluntary information. Don't engage." }
      ]
    },
    {
      officer: "If you have nothing to hide, why not let me search?",
      correct: 1,
      options: [
        { text: '"I have nothing to hide, go ahead."', legal: false, explanation: "You consented. They won. Your rights mean nothing now." },
        { text: '"I do not consent to any searches."', legal: true, explanation: "The question is manipulation. Repeat the script." },
        { text: '"Because it\'s my right to refuse."', legal: false, explanation: "You're explaining yourself. Don't. Just state no consent." }
      ]
    },
    {
      officer: "Why not, if nothing to hide?",
      correct: 1,
      options: [
        { text: '"You\'re right, go ahead."', legal: false, explanation: "They manipulated you into consent. This question is a trap." },
        { text: '"I do not consent. I\'m exercising my Fourth Amendment rights."', legal: true, explanation: "Restate your position clearly. You don't need to justify your rights." },
        { text: '"I know my rights!"', legal: false, explanation: "Sounds confrontational without substance. State the specific right." }
      ]
    },
    {
      officer: "I'm going to call for a K-9 unit.",
      correct: 2,
      options: [
        { text: '"Fine, I\'ll wait."', legal: false, explanation: "You're consenting to the extension. Ask if you're detained." },
        { text: '"You can\'t do that!"', legal: false, explanation: "They can if they have reasonable suspicion. Ask if you're detained." },
        { text: '"Am I being detained, or am I free to go?"', legal: true, explanation: "Forces them to articulate legal basis. Rodriguez limits apply." }
      ]
    },
    {
      officer: "Step out of the vehicle.",
      correct: 0,
      options: [
        { text: 'Comply silently, exit the vehicle', legal: true, explanation: "Pennsylvania v. Mimms. This is a lawful order you must obey." },
        { text: '"Why? What did I do?"', legal: false, explanation: "Lawful order. You must comply. Ask questions later." },
        { text: '"I don\'t have to do that."', legal: false, explanation: "Wrong. You do. Comply with lawful orders." }
      ]
    },
    {
      officer: "Can I see your phone?",
      correct: 1,
      options: [
        { text: 'Hand over unlocked phone', legal: false, explanation: "Riley v. California. They need a warrant. Never unlock it." },
        { text: '"I do not consent to any searches of my phone."', legal: true, explanation: "Perfect. Your phone requires a warrant." },
        { text: '"It\'s dead."', legal: false, explanation: "Lying to police. Just state no consent." }
      ]
    },
    {
      officer: "Can I look in your trunk?",
      correct: 1,
      options: [
        { text: '"Sure, I have nothing in there."', legal: false, explanation: "You consented to expand the search. Never consent." },
        { text: '"I do not consent to any searches."', legal: true, explanation: "Trunk requires probable cause or consent. You just refused consent." },
        { text: 'Pop the trunk without saying anything', legal: false, explanation: "Actions can constitute consent. Verbally refuse first." }
      ]
    },
    {
      officer: "I'm searching anyway.",
      correct: 1,
      options: [
        { text: '"No, you can\'t!"', legal: false, explanation: "Don't physically resist. State non-consent and document." },
        { text: '"I do not consent, but I will not physically resist. I want this search on record as non-consensual."', legal: true, explanation: "Perfect. You preserved your rights and documented the violation." },
        { text: 'Step back silently', legal: false, explanation: "Silence can be interpreted as consent. Verbally state your objection." }
      ]
    }
  ];

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12 pt-6">
          <div className="inline-block mb-4 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <span className="text-blue-400 text-sm font-medium">Kentucky Rights Toolkit</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Know Your Rights.<br/>Protect Yourself.
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Master the 3-sentence script, understand your constitutional protections, and document encounters with confidence.
          </p>
        </div>

        {/* Interactive Cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Learn Card */}
          <button
            onClick={() => setMode('learn')}
            className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10 p-6 md:p-8 rounded-2xl transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 text-left"
          >
            <div className="absolute top-4 right-4 text-blue-400/40 group-hover:text-blue-400/70 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </div>
            <div className="bg-blue-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <BookOpen className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors">
              Your Rights
            </h2>
            <p className="text-slate-400 text-sm md:text-base mb-4 leading-relaxed">
              Constitutional protections, case law, and what officers are trained to look for
            </p>
            <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
              <span>Start Learning</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Practice Card - Featured */}
          <button
            onClick={() => { setMode('practice'); setScenarioStep(0); setResponses([]); }}
            className="group relative bg-gradient-to-br from-green-500/10 to-emerald-600/5 hover:from-green-500/20 hover:to-emerald-600/10 p-6 md:p-8 rounded-2xl transition-all duration-300 border-2 border-green-500/30 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 text-left md:scale-105"
          >
            <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              ESSENTIAL
            </div>
            <div className="absolute top-4 right-4 text-green-400/40 group-hover:text-green-400/70 transition-colors mt-6">
              <ChevronRight className="w-6 h-6" />
            </div>
            <div className="bg-green-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
              <Target className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-white group-hover:text-green-300 transition-colors">
              Practice Scenarios
            </h2>
            <p className="text-slate-400 text-sm md:text-base mb-4 leading-relaxed">
              Train your responses to 14 real officer questions. Drill until it's instinct.
            </p>
            <div className="flex items-center gap-2 text-green-400 font-medium text-sm">
              <span>Train Now</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Document Card */}
          <button
            onClick={() => setMode('document')}
            className="group relative bg-gradient-to-br from-yellow-500/10 to-orange-600/5 hover:from-yellow-500/20 hover:to-orange-600/10 p-6 md:p-8 rounded-2xl transition-all duration-300 border border-yellow-500/20 hover:border-yellow-500/40 hover:shadow-xl hover:shadow-yellow-500/10 hover:-translate-y-1 text-left"
          >
            <div className="absolute top-4 right-4 text-yellow-400/40 group-hover:text-yellow-400/70 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </div>
            <div className="bg-yellow-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
              <FileText className="w-7 h-7 text-yellow-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-white group-hover:text-yellow-300 transition-colors">
              Document Stop
            </h2>
            <p className="text-slate-400 text-sm md:text-base mb-4 leading-relaxed">
              Record every detail while memory is fresh. Build your legal record.
            </p>
            <div className="flex items-center gap-2 text-yellow-400 font-medium text-sm">
              <span>Start Recording</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">3</div>
            <div className="text-xs md:text-sm text-slate-400">Sentences to Master</div>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">14</div>
            <div className="text-xs md:text-sm text-slate-400">Practice Scenarios</div>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">100%</div>
            <div className="text-xs md:text-sm text-slate-400">Offline Ready</div>
          </div>
        </div>

        {/* Reality Check - Redesigned */}
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex gap-4 items-start">
            <div className="bg-red-500/20 p-3 rounded-xl flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-bold mb-2 text-red-400 text-lg">This Is Not Protection</h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                This tool teaches legal responses, not physical safety. <strong>Always comply with lawful orders.</strong> Your remedy is in court, not on the roadside. Stay alive first.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Tagline */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>The Constitution protects you only if you assert it.</p>
        </div>
      </div>
    </div>
  );

  const renderLearn = () => {
    const ExpandableCard = ({ id, title, icon, children, defaultOpen = false }) => {
      const isExpanded = expandedSections[id] ?? defaultOpen;

      return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden mb-4">
          <button
            onClick={() => toggleSection(id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <h3 className="text-lg font-bold text-left">{title}</h3>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {isExpanded && (
            <div className="px-6 pb-6 pt-2 animate-in fade-in duration-300">
              {children}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setMode('home')}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              <span>Back</span>
            </button>

            <div className="text-sm text-slate-400">
              Tap sections to expand
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Your Rights Masterclass
          </h1>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
            <button
              onClick={() => setLearnTab('lane1')}
              className={`px-4 md:px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                learnTab === 'lane1'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>🛡️</span>
              <span className="hidden sm:inline">Know Your Rights</span>
              <span className="sm:hidden">Rights</span>
            </button>

            <button
              onClick={() => setLearnTab('lane2')}
              className={`px-4 md:px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                learnTab === 'lane2'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>👁️</span>
              <span className="hidden sm:inline">Recognize The Hunt</span>
              <span className="sm:hidden">Hunt</span>
            </button>

            <button
              onClick={() => setLearnTab('lane3')}
              className={`px-4 md:px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                learnTab === 'lane3'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>⚠️</span>
              <span className="hidden sm:inline">Search & Defense</span>
              <span className="sm:hidden">Search</span>
            </button>

            <button
              onClick={() => setLearnTab('script')}
              className={`px-4 md:px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                learnTab === 'script'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>🗣️</span>
              <span className="hidden sm:inline">The Script</span>
              <span className="sm:hidden">Script</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {/* LANE 1: KNOW YOUR RIGHTS */}
            {/* LANE 1: KNOW YOUR RIGHTS */}
            {learnTab === 'lane1' && (
              <div className="space-y-4 animate-in fade-in duration-500">

                {/* The Three Sentences - Always Visible */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 rounded-xl border-2 border-green-500/30 p-6">
                  <h3 className="text-2xl font-bold mb-4 text-green-400">🎯 The Three Sentences</h3>
                  <p className="text-slate-300 mb-4">Memorize these. Use only these.</p>
                  {threeLines.map((line, i) => (
                    <div key={i} className="bg-slate-900 p-4 rounded-lg mb-2 font-mono text-sm border-l-4 border-green-500">
                      {i + 1}. "{line}"
                    </div>
                  ))}
                </div>

                <ExpandableCard id="constitutional" title="Constitutional Framework" icon="🛡️" defaultOpen={true}>
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2">Fourth Amendment Protection:</h4>
                      <ul className="text-slate-300 space-y-1 ml-4 text-sm">
                        <li>• Free from unreasonable searches</li>
                        <li>• Traffic stop = "seizure"</li>
                        <li>• Need: Reasonable suspicion to stop, probable cause to search</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2">Fifth Amendment Protection:</h4>
                      <ul className="text-slate-300 space-y-1 ml-4 text-sm">
                        <li>• Right to remain silent</li>
                        <li>• <span className="text-red-400 font-bold">DON'T</span> answer beyond ID</li>
                        <li>• Silence ≠ probable cause</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2">📋 What You MUST Provide:</h4>
                      <ol className="text-slate-300 space-y-1 text-sm">
                        <li>1. Driver's license</li>
                        <li>2. Vehicle registration</li>
                        <li>3. Proof of insurance</li>
                        <li className="font-bold text-slate-200 mt-2">THAT'S IT. FULL STOP.</li>
                      </ol>
                    </div>
                  </div>
                </ExpandableCard>

                <ExpandableCard id="caselaw" title="Case Law You Need to Know" icon="⚖️">
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 border-l-4 border-slate-600 rounded p-4">
                      <h4 className="font-bold text-slate-200 mb-2">🚗 Whren v. U.S. (1996) - THE TRAP</h4>
                      <p className="text-slate-300 text-sm mb-1"><strong>The Bad News:</strong> Pretextual stops are legal</p>
                      <p className="text-slate-300 text-sm"><strong>Defense:</strong> Assume EVERY stop is pretextual. Stick to the script.</p>
                    </div>

                    <div className="bg-slate-900/50 border-l-4 border-slate-600 rounded p-4">
                      <h4 className="font-bold text-slate-200 mb-2">⏱️ Rodriguez v. U.S. (2015) - THE CLOCK</h4>
                      <p className="text-slate-300 text-sm mb-1"><strong>The Rule:</strong> CANNOT extend stop beyond traffic mission time</p>
                      <p className="text-slate-300 text-sm"><strong>Your Move:</strong> After docs returned: <span className="text-green-400">"Am I free to go?"</span></p>
                    </div>

                    <div className="bg-slate-900/50 border-l-4 border-slate-600 rounded p-4">
                      <h4 className="font-bold text-slate-200 mb-1 text-sm">🚫 The "Wall Stop" Scenario</h4>
                      <p className="text-slate-300 text-sm">Intel (DEA/FBI) can ID your car, BUT patrol needs <strong>INDEPENDENT</strong> probable cause</p>
                    </div>

                    <div className="bg-slate-900/50 border-l-4 border-slate-600 rounded p-4">
                      <h4 className="font-bold text-slate-200 mb-1 text-sm">Pennsylvania v. Mimms (1977)</h4>
                      <p className="text-slate-300 text-sm">Officers can order you out during any stop. <span className="text-green-400 font-bold">You must comply.</span></p>
                    </div>

                    <div className="bg-slate-900/50 border-l-4 border-slate-600 rounded p-4">
                      <h4 className="font-bold text-slate-200 mb-1 text-sm">Riley v. California (2014)</h4>
                      <p className="text-slate-300 text-sm">Police need a warrant to search your phone. <span className="text-red-400 font-bold">Never</span> unlock it.</p>
                    </div>
                  </div>
                </ExpandableCard>

                <ExpandableCard id="must-do" title="What You Must / Don't Have To Do" icon="✅">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-3">What You Must Do</h4>
                      <ul className="space-y-2 text-slate-300 text-sm">
                        <li className="flex gap-2"><span className="text-green-400 font-bold flex-shrink-0">ALWAYS:</span> Pull over safely</li>
                        <li className="flex gap-2"><span className="text-green-400 font-bold flex-shrink-0">ALWAYS:</span> Show license, registration, insurance</li>
                        <li className="flex gap-2"><span className="text-green-400 font-bold flex-shrink-0">ALWAYS:</span> Exit vehicle if ordered (Mimms)</li>
                        <li className="flex gap-2"><span className="text-green-400 font-bold flex-shrink-0">ALWAYS:</span> Keep hands visible</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-3">What You Don't Have To Do</h4>
                      <ul className="space-y-2 text-slate-300 text-sm">
                        <li className="flex gap-2"><span className="text-red-400 font-bold flex-shrink-0">DON'T:</span> Answer destination questions</li>
                        <li className="flex gap-2"><span className="text-red-400 font-bold flex-shrink-0">DON'T:</span> Consent to searches</li>
                        <li className="flex gap-2"><span className="text-red-400 font-bold flex-shrink-0">DON'T:</span> Stay after stop is completed</li>
                        <li className="flex gap-2"><span className="text-red-400 font-bold flex-shrink-0">DON'T:</span> Unlock your phone (Riley)</li>
                        <li className="flex gap-2"><span className="text-red-400 font-bold flex-shrink-0">DON'T:</span> Explain yourself</li>
                      </ul>
                    </div>
                  </div>
                </ExpandableCard>
              </div>
            )}

            {/* LANE 2: RECOGNIZE THE HUNT */}
            {learnTab === 'lane2' && (
              <div className="space-y-4 animate-in fade-in duration-500">

                <ExpandableCard id="pre-stop" title="Pre-Stop 'Indicators' They Watch" icon="👁️" defaultOpen={true}>
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">👁️ "The Stare" Trap</h4>
                      <ul className="text-slate-300 space-y-1 ml-4 text-sm">
                        <li>• NOT looking = "studiously avoiding" (suspicious)</li>
                        <li>• LOOKING = "locked stare" (suspicious)</li>
                        <li><strong>Reality:</strong> Unfalsifiable. Drive normally.</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🪞 "Mirror Fixation" Trap</h4>
                      <p className="text-slate-300 mb-1 text-sm">Checking mirrors frequently = suspicious</p>
                      <p className="text-slate-300 text-sm"><strong>Reality:</strong> That's defensive driving.</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🚙 "Irrational Driving" Trap</h4>
                      <ul className="text-slate-300 space-y-1 ml-4 text-sm">
                        <li>• Braking when you see police</li>
                        <li>• "Lane camping" (staying in lane)</li>
                        <li>• Driving exactly speed limit</li>
                        <li><strong>Reality:</strong> Legal, cautious behavior.</li>
                      </ul>
                    </div>
                  </div>
                </ExpandableCard>

                <ExpandableCard id="vehicle-forensics" title="Vehicle 'Forensics' They Run" icon="🔑">
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🔑 The Rental Game</h4>
                      <p className="text-slate-300 mb-2 text-sm"><strong>RED FLAGS (to them):</strong></p>
                      <ul className="text-slate-300 space-y-1 ml-4 text-sm">
                        <li>• Third-party rental (not driver's name)</li>
                        <li>• One-way trip</li>
                        <li>• "Inefficient" routes</li>
                      </ul>
                      <p className="text-slate-300 mt-2 text-sm"><strong>Know This:</strong> Have docs ready.</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🧼 "Clean/Dirty" Conflict</h4>
                      <ul className="text-slate-300 space-y-1 ml-4 text-sm">
                        <li>• Dirty exterior + clean interior = suspicious</li>
                        <li>• Clean interior + dirty exterior = suspicious</li>
                        <li><strong>Reality:</strong> Confirmation bias.</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🔧 Hardware Red Flags</h4>
                      <ul className="text-slate-300 space-y-1 ml-4 text-sm">
                        <li>• New bolts on old plates (switched)</li>
                        <li>• Fresh welds on gas tank</li>
                        <li>• Aftermarket undercarriage mods</li>
                        <li><strong className="text-red-400">DON'T</strong> consent to "look underneath"</li>
                      </ul>
                    </div>
                  </div>
                </ExpandableCard>

                <ExpandableCard id="interview-trap" title="The Interview Trap" icon="🪝">
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🎯 Their Goal:</h4>
                      <ul className="text-slate-300 space-y-1 text-sm ml-4">
                        <li>• Normalize interaction → detect "deviations"</li>
                        <li>• Build rapport → volunteer info</li>
                        <li>• Separate driver/passenger → find conflicts</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🪝 "Hook" Questions</h4>
                      <ul className="text-slate-300 space-y-1 ml-4 text-sm mb-2">
                        <li>• "Where coming from/going to?"</li>
                        <li>• "What's the purpose of your trip?"</li>
                        <li>• "Who knows you're traveling?"</li>
                      </ul>
                      <div className="bg-slate-900 border border-slate-600 rounded p-3 mt-2">
                        <p className="text-slate-300 text-sm">Response: <span className="text-green-400 font-bold">"I'm not discussing my day. Am I free to go?"</span></p>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🚨 "Deception Cues" (Pseudoscience)</h4>
                      <p className="text-slate-300 text-sm mb-1"><strong>Verbal:</strong> "Swearing to God," over-explaining</p>
                      <p className="text-slate-300 text-sm mb-1"><strong>Body:</strong> Fidgeting, avoiding eye contact, yawning</p>
                      <p className="text-slate-300 text-sm"><strong>REALITY:</strong> Nervousness ≠ probable cause</p>
                    </div>
                  </div>
                </ExpandableCard>

                <ExpandableCard id="interdiction" title="The Interdiction Playbook" icon="📋">
                  <p className="text-slate-300 mb-3 text-sm">What they're trained to do:</p>
                  <ol className="space-y-2 text-slate-300 list-decimal list-inside text-sm">
                    <li><strong>Target Selection:</strong> Profile-based indicators before any violation</li>
                    <li><strong>Pretext Stop:</strong> Follow until minor violation occurs (Whren)</li>
                    <li><strong>"Consensual" Interview:</strong> Systematic interrogation about travel</li>
                    <li><strong>Manufacturing Suspicion:</strong> Stack indicators (nervousness, air fresheners)</li>
                    <li><strong>K-9 Gambit:</strong> Use stacked indicators to justify dog, then search</li>
                  </ol>
                </ExpandableCard>
              </div>
            )}

            {/* LANE 3: THE SEARCH & YOUR DEFENSE */}
            {learnTab === 'lane3' && (
              <div className="space-y-4 animate-in fade-in duration-500">

                <ExpandableCard id="search-pattern" title="The Search Pattern" icon="🔍" defaultOpen={true}>
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🔍 Systematic Search (Zone 1→8)</h4>
                      <p className="text-slate-300 text-sm mb-2">NOT random - methodical:</p>
                      <p className="text-slate-300 text-sm mb-2">Z1: Front seats • Z2-8: Console, doors, trunk, undercarriage, engine, tires, frame voids</p>
                      <p className="text-slate-300 text-sm"><strong>Why Know:</strong> If systematic, they're committed. DOCUMENT EVERYTHING.</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🕳️ "Rule of Voids"</h4>
                      <p className="text-slate-300 mb-2 text-sm">Every car has hollow spaces (door panels, frame rails). They know them.</p>
                      <p className="text-slate-200 font-bold text-sm">REQUIRES PROBABLE CAUSE.</p>
                      <p className="text-slate-300 text-sm">Voids ≠ "plain view"</p>
                    </div>
                  </div>
                </ExpandableCard>

                <ExpandableCard id="where-look" title="Where They're Trained to Look" icon="🛞">
                  <div className="space-y-2">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-sm"><strong className="text-slate-200">🛞 Tires:</strong> <span className="text-slate-300">Hit with mallet. "Thud"=solid (drugs), "Ring"=air (normal)</span></p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-sm"><strong className="text-slate-200">🚗 Undercarriage:</strong> <span className="text-slate-300">Fresh welds/cuts on gas tank, disturbed undercoating</span></p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-sm"><strong className="text-slate-200">📻 Dash/Console:</strong> <span className="text-slate-300">Non-factory switches, loose screws, vents that don't blow</span></p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-sm"><strong className="text-slate-200">🪤 Traps:</strong> <span className="text-slate-300">Complex sequences (Defrost+Neutral+Rear Switch = hidden compartment)</span></p>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 mt-4">
                    <p className="text-slate-200 font-bold mb-2 text-sm">⚠️ CRITICAL:</p>
                    <p className="text-slate-300 text-sm">ALL require: CONSENT, PROBABLE CAUSE, or WARRANT. Plain view ≠ hidden compartments/voids/containers.</p>
                  </div>
                </ExpandableCard>

                <ExpandableCard id="safety-protocols" title="Safety Protocols & What to Expect" icon="🚪">
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🚪 "Passenger Side Approach"</h4>
                      <p className="text-slate-300 mb-2 text-sm">Approach from passenger side = avoid mirrors, surprise you, view console</p>
                      <p className="text-slate-300 text-sm"><strong>Know This:</strong> Tactical, not safety. Creates disorientation. Stay calm.</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">🚛 Trunk Check</h4>
                      <p className="text-slate-300 mb-2 text-sm">Push down on trunk (checking latch). If it pops = search.</p>
                      <p className="text-slate-300 text-sm">State clearly: <span className="text-green-400 font-bold">"I do not consent to searches."</span></p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-2 text-sm">☠️ Fentanyl/Xylazine Risk</h4>
                      <p className="text-slate-300 mb-2 text-sm"><span className="text-red-400 font-bold">NEVER</span> field test powder (aerosol risk). Special protocols, PPE required</p>
                      <p className="text-slate-300 text-sm"><strong>Why Matters:</strong> If they're taking precautions, they're assuming guilt.</p>
                    </div>
                  </div>
                </ExpandableCard>

                <ExpandableCard id="totality" title="Totality of Circumstances" icon="📋">
                  <p className="text-slate-300 mb-2 text-sm">They bundle indicators together. Pile of non-criminal behaviors ≠ crime.</p>
                  <p className="text-red-400 text-sm"><strong>Your Defense:</strong> Each must be valid.</p>
                </ExpandableCard>
              </div>
            )}

            {/* THE SCRIPT */}
            {learnTab === 'script' && (
              <div className="space-y-4 animate-in fade-in duration-500">

                <ExpandableCard id="before-stop" title="Before the Stop" icon="📱" defaultOpen={true}>
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="font-bold text-slate-200 mb-2 text-sm">Preparation:</p>
                      <ul className="ml-4 space-y-1 text-sm text-slate-300">
                        <li>• Dashcam (front + interior, audio ON)</li>
                        <li>• Phone ready to record</li>
                        <li>• Docs in one place (NOT glove box)</li>
                        <li>• GPS/directions visible</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="font-bold text-slate-200 mb-2 text-sm">Mental Prep:</p>
                      <ul className="ml-4 space-y-1 text-sm text-slate-300">
                        <li>• You WILL be nervous (normal)</li>
                        <li>• You WILL want to explain (<span className="text-red-400 font-bold">don't</span>)</li>
                        <li>• You WILL want to "cooperate" (trap)</li>
                      </ul>
                    </div>
                  </div>
                </ExpandableCard>

                <ExpandableCard id="during-stop" title="During the Stop" icon="🛑">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="font-bold text-slate-200 mb-2 text-sm">The Stop:</p>
                    <ol className="ml-4 space-y-1 text-sm list-decimal text-slate-300">
                      <li><span className="text-green-400 font-bold">ALWAYS:</span> Pull over safely, promptly</li>
                      <li><span className="text-green-400 font-bold">ALWAYS:</span> Engine OFF, lights ON, hands on wheel</li>
                      <li>Window down 2-3 inches ONLY</li>
                      <li><span className="text-red-400 font-bold">DON'T</span> reach until asked</li>
                    </ol>
                  </div>
                </ExpandableCard>

                <ExpandableCard id="the-script" title="The Script (MEMORIZE THIS)" icon="🗣️" defaultOpen={true}>
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 border-l-4 border-slate-600 rounded p-4">
                      <p className="font-bold text-slate-200 mb-2 text-sm">Officer asks for documents:</p>
                      <p className="text-slate-300 text-sm">"Here is my license, registration, and insurance."</p>
                    </div>

                    <div className="bg-slate-900/50 border-l-4 border-slate-600 rounded p-4">
                      <p className="font-bold text-slate-200 mb-2 text-sm">Officer: "Do you know why I stopped you?"</p>
                      <p className="text-slate-300 text-sm">"No, officer."</p>
                      <p className="text-slate-400 text-xs italic mt-1">(<span className="text-red-400 font-bold">DO NOT SPECULATE. DO NOT ADMIT.</span>)</p>
                    </div>

                    <div className="bg-slate-900/50 border-l-4 border-slate-600 rounded p-4">
                      <p className="font-bold text-slate-200 mb-2 text-sm">Officer: "Where are you coming from/going?"</p>
                      <p className="text-slate-300 text-sm">"I'm not answering questions. <span className="text-green-400 font-bold">Am I free to go?</span>"</p>
                    </div>

                    <div className="bg-slate-900/50 border-l-4 border-slate-600 rounded p-4">
                      <p className="font-bold text-slate-200 mb-2 text-sm">Officer: "Can I search your car?"</p>
                      <p className="text-slate-300 text-sm">"<span className="text-red-400 font-bold">I do not consent to any searches.</span> <span className="text-green-400 font-bold">Am I free to go?</span>"</p>
                    </div>

                    <div className="bg-slate-900/50 border-l-4 border-slate-600 rounded p-4">
                      <p className="font-bold text-slate-200 mb-2 text-sm">Officer: "Why not, if nothing to hide?"</p>
                      <p className="text-slate-300 text-sm">"<span className="text-red-400 font-bold">I do not consent.</span> I'm exercising my Fourth Amendment rights. <span className="text-green-400 font-bold">Am I free to go?</span>"</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-600 rounded p-4">
                      <p className="font-bold text-slate-200 mb-2 text-sm">⏰ AFTER DOCUMENTS RETURNED:</p>
                      <p className="text-green-400 font-bold text-lg">"Am I free to go?"</p>
                      <p className="text-slate-400 text-xs italic">(Repeat until answered)</p>
                      <p className="text-slate-300 mt-2 text-sm"><strong>If YES:</strong> <span className="text-green-400 font-bold">Leave immediately.</span></p>
                      <p className="text-slate-300 text-sm"><strong>If NO:</strong> "Why am I being detained?"</p>
                    </div>
                  </div>
                </ExpandableCard>

                <ExpandableCard id="dos-donts" title="Do's and Don'ts" icon="✅">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-3 text-sm">What Not To Do</h4>
                      <ul className="space-y-2 text-slate-300 text-sm">
                        <li><span className="text-red-400 font-bold">DON'T:</span> Answer questions beyond ID</li>
                        <li><span className="text-red-400 font-bold">DON'T:</span> Consent to searches</li>
                        <li><span className="text-red-400 font-bold">DON'T:</span> Exit vehicle unless ordered</li>
                        <li><span className="text-red-400 font-bold">DON'T:</span> Get argumentative</li>
                        <li><span className="text-red-400 font-bold">NEVER:</span> Lie (lying IS probable cause)</li>
                        <li><span className="text-red-400 font-bold">DON'T:</span> Physically resist</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-200 mb-3 text-sm">What To Do</h4>
                      <ul className="space-y-2 text-slate-300 text-sm">
                        <li><span className="text-green-400 font-bold">ALWAYS:</span> Stay calm, polite tone</li>
                        <li><span className="text-green-400 font-bold">ALWAYS:</span> Use the script</li>
                        <li><span className="text-green-400 font-bold">ALWAYS:</span> Record everything</li>
                        <li>• Document badge numbers, time</li>
                        <li>• Note everything searched</li>
                        <li>• Ask for supervisor if searched</li>
                      </ul>
                    </div>
                  </div>
                </ExpandableCard>

                <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-center text-slate-200">⚖️ THE CORE TRUTH</h3>
                  <div className="space-y-3 text-center text-slate-200 text-sm">
                    <p className="font-bold">They are trained to work at the edge of your rights.</p>
                    <p className="font-bold">You must know exactly where that edge is.</p>

                    <div className="bg-slate-900 rounded-lg p-4 my-3 text-left">
                      <p className="text-slate-300 text-sm mb-2">The "totality of circumstances" doctrine bundles innocent behaviors into "reasonable suspicion."</p>
                      <p className="text-slate-300 text-sm">Your defense: Force them to articulate specific facts for each escalation.</p>
                    </div>

                    <div className="bg-slate-900 rounded-lg p-4 my-4">
                      <p className="font-bold text-slate-200 mb-2">You cannot talk your way out of a stop.</p>
                      <p className="font-bold text-slate-200">You can only invoke your rights and document violations.</p>
                    </div>

                    <p className="font-bold text-lg uppercase mt-4">
                      The Constitution protects you<br/>ONLY IF YOU ASSERT IT.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Kentucky Reality - Always Visible */}
          <div className="mt-6 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <h3 className="font-bold mb-2 text-red-400 text-sm">Kentucky Reality</h3>
            <p className="text-slate-300 text-xs mb-1">
              42 Kentucky agencies paid for Street Cop Training - banned in multiple states for teaching unconstitutional tactics.
            </p>
            <p className="text-slate-300 text-xs">
              Kentucky law enforcement gets 100% of civil forfeiture proceeds: 85% to seizing agency, 15% to prosecutors. D- grade from Institute for Justice.
            </p>
          </div>
        </div>
      </div>
    );
  };
  const renderPractice = () => {
    if (scenarioStep >= scenarios.length) {
      const correct = responses.filter(r => r).length;
      const total = scenarios.length;
      const percent = Math.round((correct / total) * 100);

      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                {percent >= 80 ? '✓ Strong Performance' : percent >= 60 ? 'Needs Work' : 'Critical Gaps'}
              </h1>
              <p className="text-3xl mb-2">{correct}/{total} correct</p>
              <p className="text-slate-400">{percent}%</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Results Breakdown</h2>
              <div className="space-y-2">
                {scenarios.map((scenario, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-900 rounded">
                    {responses[i] ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-slate-300">{scenario.officer}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => { setScenarioStep(0); setResponses([]); }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Practice Again
              </button>
              <button
                onClick={() => setMode('home')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    const scenario = scenarios[scenarioStep];

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => setMode('home')}
              className="text-blue-400 hover:text-blue-300"
            >
              ← Exit Practice
            </button>
            <span className="text-slate-400">Scenario {scenarioStep + 1}/{scenarios.length}</span>
          </div>

          <div className="bg-slate-800 rounded-lg p-8 mb-6">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-blue-600 rounded-full p-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-2">OFFICER</p>
                <p className="text-xl">{scenario.officer}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-slate-400 mb-4">How do you respond?</p>
              {scenario.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const isCorrect = option.legal;
                    setResponses([...responses, isCorrect]);
                    setFeedback({ correct: isCorrect, explanation: option.explanation });
                  }}
                  className="w-full text-left p-4 bg-slate-900 hover:bg-slate-700 rounded-lg border-2 border-slate-700 hover:border-blue-500 transition-colors"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4">
            <p className="text-sm text-slate-300">
              <strong>Remember:</strong> The three sentences cover every situation. Repetition is strength, not weakness.
            </p>
          </div>
        </div>

        {/* Feedback Modal */}
        {feedback && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className={`max-w-2xl w-full rounded-lg p-8 ${feedback.correct ? 'bg-green-900/90 border-2 border-green-500' : 'bg-red-900/90 border-2 border-red-500'}`}>
              <div className="flex items-start gap-4 mb-6">
                {feedback.correct ? (
                  <CheckCircle className="w-12 h-12 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {feedback.correct ? '✓ CORRECT' : '✗ INCORRECT'}
                  </h2>
                  <p className="text-lg text-slate-200">{feedback.explanation}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFeedback(null);
                  setScenarioStep(scenarioStep + 1);
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDocument = () => (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setMode('home')}
          className="mb-6 text-blue-400 hover:text-blue-300"
        >
          ← Back to Home
        </button>

        <h1 className="text-3xl font-bold mb-2">Document Traffic Stop</h1>
        <p className="text-slate-400 mb-8">Complete this immediately after the encounter. Your memory fades faster than you think.</p>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time & Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Date & Time of Stop</label>
                <input
                  type="datetime-local"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2"
                  onChange={(e) => setDocData({...docData, datetime: e.target.value})}
                  value={docData.datetime || ''}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Exact Location (street, mile marker, landmarks)</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2"
                  placeholder="I-64 westbound, mile marker 87, near Exit 86 for Simpsonville"
                  onChange={(e) => setDocData({...docData, location: e.target.value})}
                  value={docData.location || ''}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Officer Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Officer Name(s) & Badge Number(s)</label>
                <textarea
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-20"
                  placeholder="Officer J. Smith, Badge #1234"
                  onChange={(e) => setDocData({...docData, officers: e.target.value})}
                  value={docData.officers || ''}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Patrol Car Number(s)</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2"
                  placeholder="Unit 456"
                  onChange={(e) => setDocData({...docData, vehicles: e.target.value})}
                  value={docData.vehicles || ''}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Agency</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2"
                  placeholder="Kentucky State Police, Daviess County Sheriff, etc."
                  onChange={(e) => setDocData({...docData, agency: e.target.value})}
                  value={docData.agency || ''}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Recording Equipment
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="dashcam"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, dashcam: e.target.checked})}
                  checked={!!docData.dashcam}
                />
                <label htmlFor="dashcam" className="text-slate-300">Dash cam visible on patrol car</label>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="bodycam"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, bodycam: e.target.checked})}
                  checked={!!docData.bodycam}
                />
                <label htmlFor="bodycam" className="text-slate-300">Body cam visible on officer</label>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="myrecording"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, myrecording: e.target.checked})}
                  checked={!!docData.myrecording}
                />
                <label htmlFor="myrecording" className="text-slate-300">I recorded the interaction</label>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Timeline of Events</h2>
            <textarea
              className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-32"
              placeholder="10:15 PM - Pulled over&#10;10:16 PM - Officer approached, requested license&#10;10:20 PM - Officer asked about destination, I stated 'I am exercising my right to remain silent'&#10;10:25 PM - Officer requested consent to search, I stated 'I do not consent to any searches'&#10;10:30 PM - Officer returned documents, I asked 'Am I free to go?', was told yes, departed"
              onChange={(e) => setDocData({...docData, timeline: e.target.value})}
              value={docData.timeline || ''}
            />
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Officer Questions & Your Responses</h2>
            <textarea
              className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-32"
              placeholder="Officer: 'Where are you headed?'&#10;Me: 'I am exercising my right to remain silent.'&#10;&#10;Officer: 'Mind if I search your vehicle?'&#10;Me: 'I do not consent to any searches.'"
              onChange={(e) => setDocData({...docData, dialogue: e.target.value})}
              value={docData.dialogue || ''}
            />
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Search Details (if applicable)</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="searched"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, searched: e.target.checked})}
                  checked={!!docData.searched}
                />
                <label htmlFor="searched" className="text-slate-300">Vehicle was searched</label>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="consented"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, consented: e.target.checked})}
                  checked={!!docData.consented}
                />
                <label htmlFor="consented" className="text-slate-300">I consented to search (if unchecked, search was without consent)</label>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Items removed from vehicle</label>
                <textarea
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-20"
                  onChange={(e) => setDocData({...docData, itemsRemoved: e.target.value})}
                  value={docData.itemsRemoved || ''}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Damage to vehicle</label>
                <textarea
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-20"
                  onChange={(e) => setDocData({...docData, damage: e.target.value})}
                  value={docData.damage || ''}
                />
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="k9"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, k9: e.target.checked})}
                  checked={!!docData.k9}
                />
                <label htmlFor="k9" className="text-slate-300">K-9 unit was called/used</label>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Witnesses</h2>
            <textarea
              className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-20"
              placeholder="Passenger: Jane Doe, 555-1234&#10;Other vehicle at scene: White Toyota, plate ABC-123"
              onChange={(e) => setDocData({...docData, witnesses: e.target.value})}
              value={docData.witnesses || ''}
            />
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Additional Notes</h2>
            <textarea
              className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-32"
              placeholder="Weather conditions, lighting, officer demeanor, anything else relevant"
              onChange={(e) => setDocData({...docData, notes: e.target.value})}
              value={docData.notes || ''}
            />
          </div>

          <div className="bg-blue-900/20 border-2 border-blue-500 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-400" />
              Next Steps: Kentucky Open Records Request
            </h2>
            <div className="text-slate-300 space-y-2">
              <p>File request with agency within days for:</p>
              <ul className="list-disc list-inside ml-4">
                <li>All dash cam footage</li>
                <li>All body cam footage</li>
                <li>Officer reports</li>
                <li>Radio communications</li>
              </ul>
              <p className="mt-4">Agency must respond within 5 business days (up to 20 in exceptional circumstances).</p>
              <p>Send to: Agency's official custodian of records (usually administrative office).</p>
            </div>
          </div>

          <button
            onClick={() => {
              const text = `TRAFFIC STOP DOCUMENTATION

Date/Time: ${docData.datetime || '[Not provided]'}
Location: ${docData.location || '[Not provided]'}

OFFICER INFORMATION:
${docData.officers || '[Not provided]'}
Patrol Car: ${docData.vehicles || '[Not provided]'}
Agency: ${docData.agency || '[Not provided]'}

RECORDING EQUIPMENT:
Dash cam: ${docData.dashcam ? 'Yes' : 'No'}
Body cam: ${docData.bodycam ? 'Yes' : 'No'}
I recorded: ${docData.myrecording ? 'Yes' : 'No'}

TIMELINE:
${docData.timeline || '[Not provided]'}

DIALOGUE:
${docData.dialogue || '[Not provided]'}

SEARCH:
Vehicle searched: ${docData.searched ? 'Yes' : 'No'}
I consented: ${docData.consented ? 'Yes' : 'No'}
Items removed: ${docData.itemsRemoved || '[None]'}
Damage: ${docData.damage || '[None]'}
K-9 used: ${docData.k9 ? 'Yes' : 'No'}

WITNESSES:
${docData.witnesses || '[None]'}

ADDITIONAL NOTES:
${docData.notes || '[None]'}`;

              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `traffic-stop-${new Date().toISOString().split('T')[0]}.txt`;
              a.click();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg"
          >
            Download Documentation
          </button>

          <button
            onClick={handleClearDocumentation}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg"
          >
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === 'home') return renderHome();
  if (mode === 'learn') return renderLearn();
  if (mode === 'practice') return renderPractice();
  if (mode === 'document') return renderDocument();
}
