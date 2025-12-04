import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Play,
  Shield,
  Target,
  Zap
} from 'lucide-react';
import { getDocumentation, logPracticeSession, saveDocumentation } from './db';

const initialDoc = {
  stopDate: '',
  stopTime: '',
  location: '',
  agency: '',
  officerName: '',
  badge: '',
  reason: '',
  actions: '',
  consentRequests: '',
  searches: '',
  passengers: '',
  recording: '',
  followUp: '',
  personalNotes: ''
};

export default function TrafficStopSimulator() {
  const [mode, setMode] = useState('overview');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [docData, setDocData] = useState(initialDoc);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [savingDoc, setSavingDoc] = useState(false);
  const [practiceLog, setPracticeLog] = useState([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const stored = await getDocumentation();
      if (stored && active) {
        setDocData(stored.data || stored);
      }
      if (active) setLoadingDoc(false);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loadingDoc) return;
    let active = true;
    setSavingDoc(true);
    saveDocumentation({ data: docData, updatedAt: new Date().toISOString() }).finally(() => {
      if (active) setSavingDoc(false);
    });
    return () => {
      active = false;
    };
  }, [docData, loadingDoc]);

  const threeLines = [
    'Officer, I am exercising my right to remain silent.',
    'I do not consent to any searches.',
    'Am I being detained, or am I free to go?'
  ];

  const scenarios = useMemo(
    () => [
      {
        officer: 'Do you know why I pulled you over?',
        correct: 0,
        options: [
          { text: threeLines[0], legal: true, explanation: 'Never admit guilt. This invokes your Fifth Amendment right.' },
          { text: 'I was going a bit fast, sorry.', legal: false, explanation: 'You just admitted guilt. This becomes evidence.' },
          { text: 'I was hoping you could tell me why you pulled me over.', legal: true, explanation: 'Forces them to articulate the reason.' }
        ]
      },
      {
        officer: 'Where are you coming from tonight?',
        correct: 0,
        options: [
          { text: threeLines[0], legal: true, explanation: 'Travel questions are not legally required. This ends it.' },
          { text: 'Just heading home from work.', legal: false, explanation: 'Voluntary information that builds a profile.' },
          { text: 'Why do you need to know that?', legal: false, explanation: 'Sounds confrontational and still answers the question.' }
        ]
      },
      {
        officer: 'Mind if I take a look in the vehicle?',
        correct: 1,
        options: [
          { text: "I guess that's fine.", legal: false, explanation: 'You just consented. If they had probable cause, they would not ask.' },
          { text: 'I do not consent to any searches.', legal: true, explanation: 'Clear refusal preserves your Fourth Amendment rights.' },
          { text: 'Do you have a warrant?', legal: false, explanation: 'You do not need to debate. Simply state no consent.' }
        ]
      },
      {
        officer: "I'm going to call for a K-9 unit.",
        correct: 2,
        options: [
          { text: "Fine, I'll wait.", legal: false, explanation: 'You are consenting to extend the stop. Ask if you are detained.' },
          { text: "You can't do that!", legal: false, explanation: 'They can if they have reasonable suspicion. Challenge the detention instead.' },
          { text: 'Am I being detained, or am I free to go?', legal: true, explanation: 'Forces them to articulate a legal basis. Rodriguez limits apply.' }
        ]
      },
      {
        officer: 'Step out of the vehicle.',
        correct: 0,
        options: [
          { text: 'Comply silently, exit the vehicle', legal: true, explanation: 'Pennsylvania v. Mimms. This is a lawful order you must obey.' },
          { text: 'Why? What did I do?', legal: false, explanation: 'It is a lawful order. Ask questions later.' },
          { text: "I don't have to do that.", legal: false, explanation: 'You do. Non-compliance can escalate quickly.' }
        ]
      },
      {
        officer: "I'm searching anyway.",
        correct: 1,
        options: [
          { text: 'No, you cannot!', legal: false, explanation: 'Do not physically resist. Document instead.' },
          { text: 'I do not consent, but I will not physically resist. I want this search on record as non-consensual.', legal: true, explanation: 'You preserved your objection while staying safe.' },
          { text: 'Step back silently', legal: false, explanation: 'Silence can look like consent. State your non-consent clearly.' }
        ]
      }
    ],
    [threeLines]
  );

  const learnLanes = [
    {
      id: 'lane1',
      title: 'Lane 1 – Stop Mechanics',
      items: [
        'Officer needs reasonable suspicion for the stop.',
        'Request: license, registration, proof of insurance.',
        'You must exit the vehicle if ordered (Mimms).',
        'Rodriguez: Detention cannot extend beyond mission without new suspicion.'
      ]
    },
    {
      id: 'lane2',
      title: 'Lane 2 – Constitutional Anchors',
      items: [
        'Fourth Amendment: protects against unreasonable searches.',
        'Fifth Amendment: protects against self-incrimination (remain silent).',
        'Sixth Amendment: right to counsel attaches after charges.',
        'Riley v. California: your phone requires a warrant.'
      ]
    },
    {
      id: 'lane3',
      title: 'Lane 3 – Officer Plays to Expect',
      items: [
        'Fishing expedition questions to build a travel profile.',
        'Requests for consent when probable cause is thin.',
        'K-9 delay attempts (challenge as unlawful extension).',
        'Miranda is not required for roadside questioning—silence is on you.'
      ]
    }
  ];

  const quickSaves = [
    { label: 'Baseline', payload: initialDoc },
    {
      label: 'Minimal facts only',
      payload: {
        ...initialDoc,
        stopDate: new Date().toISOString().slice(0, 10),
        stopTime: new Date().toISOString().slice(11, 16),
        recording: 'Dash/body camera noted. Personal recording saved.'
      }
    }
  ];

  const handleChoice = async (choiceIndex) => {
    const scenario = scenarios[scenarioIndex];
    const selected = scenario.options[choiceIndex];
    const correct = choiceIndex === scenario.correct;
    setFeedback({
      correct,
      explanation: selected.explanation,
      legal: selected.legal,
      text: selected.text
    });
    const entry = {
      scenario: scenario.officer,
      selected: selected.text,
      correct,
      legal: selected.legal
    };
    setPracticeLog((prev) => [{ ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...prev].slice(0, 6));
    await logPracticeSession(entry);
  };

  const handleNextScenario = () => {
    setFeedback(null);
    setScenarioIndex((prev) => (prev + 1) % scenarios.length);
  };

  const handleDocChange = (field, value) => {
    setDocData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTemplate = (payload) => {
    setDocData(payload);
  };

  const handleClearDocumentation = () => {
    if (window.confirm('Clear all saved documentation?')) {
      setDocData(initialDoc);
    }
  };

  const modeConfig = [
    { id: 'overview', label: 'Mission Control', icon: Shield },
    { id: 'learn', label: 'Legal Playbook', icon: FileText },
    { id: 'practice', label: 'Simulation Lab', icon: Target },
    { id: 'document', label: 'Incident Log', icon: Zap }
  ];

  const renderOverview = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 border border-blue-500/30 p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-200/80">Quick start</p>
              <h2 className="text-2xl font-bold text-white">Keep calm, follow the script, capture the facts.</h2>
              <p className="text-slate-200/80 mt-2">Three lines to say, drills to practice, and a log that saves as you type.</p>
            </div>
            <div className="bg-blue-500/20 text-blue-200 px-3 py-2 rounded-xl text-sm border border-blue-400/30">{savingDoc ? 'Saving…' : 'Saved'}</div>
          </div>
          <div className="grid md:grid-cols-3 gap-3 mt-5">
            {threeLines.map((line) => (
              <div key={line} className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-blue-100/70">Script line</p>
                <p className="text-white font-semibold leading-relaxed">{line}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: 'Study the lanes',
                body: 'Clear legal summaries with quick references.',
                icon: FileText
              },
              {
                title: 'Drill muscle memory',
                body: 'Tactical simulations with instant feedback.',
                icon: Target
              },
              {
                title: 'Document while fresh',
                body: 'Time-stamped log ready for later export.',
                icon: Zap
              }
            ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <card.icon className="w-5 h-5 text-blue-300" />
                <p className="text-lg font-semibold text-white">{card.title}</p>
              </div>
              <p className="text-sm text-slate-200/80 mt-2">{card.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-emerald-400/30 bg-emerald-900/40 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-300" />
            <p className="text-lg font-semibold text-white">Readiness checklist</p>
          </div>
          <ul className="text-sm text-emerald-50/90 space-y-2 mt-3 list-disc list-inside">
            <li>Keep your three-line script handy.</li>
            <li>Log what happens while details are clear.</li>
            <li>Practice scenarios to stay composed.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h3 className="text-white font-semibold">Quick log templates</h3>
          {quickSaves.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleTemplate(preset.payload)}
              className="w-full rounded-xl bg-slate-800/70 border border-white/10 px-3 py-2 text-left text-slate-100 hover:border-blue-400/40"
            >
              <div className="flex items-center justify-between">
                <span>{preset.label}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
          <button
            onClick={handleClearDocumentation}
            className="w-full rounded-xl bg-red-900/40 border border-red-500/30 px-3 py-2 text-left text-red-100 hover:border-red-400/60"
          >
            Reset saved log
          </button>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 text-blue-300" />
            <p className="text-white font-semibold">Latest drill</p>
          </div>
          {practiceLog.length === 0 ? (
            <p className="text-sm text-slate-300 mt-2">Run a simulation to populate practice history.</p>
          ) : (
            <ul className="text-sm text-slate-200 space-y-2 mt-3">
              {practiceLog.map((entry) => (
                <li key={entry.id} className="rounded-xl bg-white/5 border border-white/5 p-3">
                  <p className="font-semibold text-white">{entry.scenario}</p>
                  <p className="text-xs text-slate-200/80">Response: {entry.selected}</p>
                  <p className={entry.correct ? 'text-emerald-300 text-xs' : 'text-amber-300 text-xs'}>
                    {entry.correct ? 'Protected' : 'Risky'} – {entry.legal ? 'Legally safe' : 'Creates exposure'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  const renderLearn = () => (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-5">
        {learnLanes.map((lane) => (
          <div key={lane.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-blue-300" />
              <p className="text-lg font-semibold text-white">{lane.title}</p>
            </div>
            <ul className="mt-3 space-y-2 text-slate-200 text-sm list-disc list-inside">
              {lane.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-blue-400/40 bg-blue-900/40 p-4">
          <p className="text-white font-semibold">3-line script</p>
          <ul className="mt-3 space-y-2 text-blue-50">
            {threeLines.map((line) => (
              <li key={line} className="rounded-xl bg-blue-500/10 px-3 py-2 border border-blue-400/20">{line}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
          <p className="text-white font-semibold">Case law anchors</p>
          <div className="text-sm text-slate-200 space-y-2">
            <p><span className="font-semibold text-white">Whren:</span> Traffic infractions justify the stop regardless of officer motive.</p>
            <p><span className="font-semibold text-white">Rodriguez:</span> No fishing expeditions after the mission without new suspicion.</p>
            <p><span className="font-semibold text-white">Mimms:</span> Exiting the vehicle is a lawful order.</p>
            <p><span className="font-semibold text-white">Riley:</span> Phones require warrants.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPractice = () => {
    const scenario = scenarios[scenarioIndex];
    return (
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900 p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200/80">Scenario {scenarioIndex + 1} of {scenarios.length}</p>
              <h3 className="text-2xl font-semibold text-white">Officer: {scenario.officer}</h3>
            </div>
            <div className="text-xs text-slate-300">Rapid drill</div>
          </div>
          <div className="grid gap-3">
            {scenario.options.map((opt, idx) => (
              <button
                key={opt.text}
                onClick={() => handleChoice(idx)}
                className="w-full text-left rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:border-blue-400/50"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-blue-300 font-semibold">{String.fromCharCode(65 + idx)}.</div>
                  <div>
                    <p className="text-white font-semibold">{opt.text}</p>
                    <p className="text-sm text-slate-300">{opt.explanation}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {feedback && (
            <div className={`rounded-2xl border p-4 ${feedback.correct ? 'border-emerald-400/50 bg-emerald-900/40' : 'border-amber-400/60 bg-amber-900/30'}`}>
              <div className="flex items-center gap-2">
                {feedback.correct ? (
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-300" />
                )}
                <p className="text-white font-semibold">{feedback.correct ? 'Protected response' : 'Risk detected'}</p>
              </div>
              <p className="text-sm text-slate-100 mt-2">{feedback.explanation}</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleNextScenario}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-semibold"
                >
                  Next scenario
                </button>
                <button
                  onClick={() => setFeedback(null)}
                  className="rounded-xl px-4 py-2 border border-white/20 text-slate-100 hover:border-white/40"
                >
                  Review choices again
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-white font-semibold">Training notes</p>
            <p className="text-sm text-slate-200 mt-2">Repeat the drill until responses become automatic. Rotate scenarios to avoid pattern guessing.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
            <p className="text-white font-semibold">History (local)</p>
            {practiceLog.length === 0 ? (
              <p className="text-sm text-slate-300 mt-2">No runs yet.</p>
            ) : (
              <ul className="space-y-2 mt-3 text-sm text-slate-200">
                {practiceLog.map((entry) => (
                  <li key={entry.id} className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="font-semibold text-white">{entry.scenario}</p>
                    <p className="text-xs text-slate-200/80">{entry.selected}</p>
                    <p className={entry.correct ? 'text-emerald-300 text-xs' : 'text-amber-300 text-xs'}>
                      {entry.correct ? 'Protected' : 'Risky'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDocument = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200/80">Incident log</p>
              <h3 className="text-2xl font-semibold text-white">Capture facts while they are fresh</h3>
            </div>
            <div className="text-xs text-slate-200">{savingDoc ? 'Saving…' : 'Saved'}</div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="Date" value={docData.stopDate} onChange={(e) => handleDocChange('stopDate', e.target.value)} />
            <TextField label="Time" value={docData.stopTime} onChange={(e) => handleDocChange('stopTime', e.target.value)} />
            <TextField label="Location" value={docData.location} onChange={(e) => handleDocChange('location', e.target.value)} />
            <TextField label="Agency" value={docData.agency} onChange={(e) => handleDocChange('agency', e.target.value)} />
            <TextField label="Officer name" value={docData.officerName} onChange={(e) => handleDocChange('officerName', e.target.value)} />
            <TextField label="Badge" value={docData.badge} onChange={(e) => handleDocChange('badge', e.target.value)} />
          </div>
          <TextArea label="Reason stated by officer" value={docData.reason} onChange={(e) => handleDocChange('reason', e.target.value)} />
          <TextArea label="Actions observed (searches, orders)" value={docData.actions} onChange={(e) => handleDocChange('actions', e.target.value)} />
          <div className="grid md:grid-cols-2 gap-4">
            <TextArea label="Consent requests & responses" value={docData.consentRequests} onChange={(e) => handleDocChange('consentRequests', e.target.value)} />
            <TextArea label="What was searched / seized" value={docData.searches} onChange={(e) => handleDocChange('searches', e.target.value)} />
          </div>
          <TextArea label="Passengers / witnesses" value={docData.passengers} onChange={(e) => handleDocChange('passengers', e.target.value)} />
          <div className="grid md:grid-cols-2 gap-4">
            <TextArea label="Recording status" value={docData.recording} onChange={(e) => handleDocChange('recording', e.target.value)} />
            <TextArea label="Follow-up needed" value={docData.followUp} onChange={(e) => handleDocChange('followUp', e.target.value)} />
          </div>
          <TextArea label="Personal notes" value={docData.personalNotes} onChange={(e) => handleDocChange('personalNotes', e.target.value)} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-white font-semibold">Logging tips</p>
          <p className="text-sm text-slate-200 mt-2">Capture the officer's statements, timing, and any searches in your own words.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-white font-semibold">Controls</p>
          <div className="flex flex-col gap-3 mt-3">
            <button onClick={handleClearDocumentation} className="rounded-xl bg-red-900/40 border border-red-400/40 px-3 py-2 text-left text-red-100 hover:border-red-300/60">Clear log</button>
            {quickSaves.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleTemplate(preset.payload)}
                className="rounded-xl bg-slate-800/70 border border-white/10 px-3 py-2 text-left text-slate-100 hover:border-blue-400/40"
              >
                Apply {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-blue-200/80">Kentucky Rights Toolkit</p>
            <h1 className="text-3xl font-bold text-white">Traffic Stop Coach</h1>
            <p className="text-slate-300">Drill the script, review the law, and log the encounter.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {modeConfig.map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${mode === item.id ? 'bg-blue-600 text-white border-blue-400' : 'bg-white/5 text-slate-100 border-white/10 hover:border-blue-400/40'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </header>

        {loadingDoc ? (
          <div className="text-center text-slate-300 py-10">Loading saved data…</div>
        ) : (
          <>
            {mode === 'overview' && renderOverview()}
            {mode === 'learn' && renderLearn()}
            {mode === 'practice' && renderPractice()}
            {mode === 'document' && renderDocument()}
          </>
        )}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-2 text-slate-100">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        value={value}
        onChange={onChange}
        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:border-blue-400"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-2 text-slate-100">
      <span className="text-sm text-slate-300">{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        rows={3}
        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:border-blue-400"
      />
    </label>
  );
}
