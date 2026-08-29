'use client';

import Link from 'next/link';
import { ArrowRight, Database, FileText, CheckCircle2, AlertTriangle, Play, Box, Layers, ShieldCheck, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

const GraphView = dynamic(() => import('@/components/GraphView'), { ssr: false });
const ColorBends = dynamic(() => import('@/components/ColorBends'), { ssr: false });

export default function LandingPage() {
  const exampleGraphData = {
    nodes: [
      { id: 'change', label: 'Proposed Change', type: 'change' },
      { id: 'Button', label: 'Button.tsx', type: 'service' },
      { id: 'NewChatButton', label: 'NewChatButton.tsx', type: 'service' },
      { id: 'test', label: 'OpenUIDevtools.test.ts', type: 'service' },
      { id: 'adr', label: 'README.md', type: 'document' },
      { id: 'theme', label: 'ThemeContext', type: 'resource' }
    ],
    edges: [
      { source: 'change', target: 'Button', label: 'modifies', type: 'direct' },
      { source: 'Button', target: 'NewChatButton', label: 'imported by', type: 'direct' },
      { source: 'Button', target: 'test', label: 'runtime coupling', type: 'runtime' },
      { source: 'Button', target: 'adr', label: 'documented in', type: 'invariant' },
      { source: 'theme', target: 'Button', label: 'consumes', type: 'runtime' }
    ]
  };

  return (
    <main className="flex flex-col min-h-screen font-mono text-gray-200">
      {/* 1. HERO */}
      <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center overflow-hidden">
        {/* ColorBends Background */}
        <ColorBends 
          colors={["#ef4444", "#8a5cff", "#00ffd1"]}
          rotation={90}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          noise={0.15}
          parallax={0.5}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
          transparent={true}
          autoRotate={0}
          className="-z-20 opacity-80"
        />
        
        {/* Subtle Dark Overlay to ensure readability */}
        <div className="absolute inset-0 bg-black/60 -z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] -z-10"></div>
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:40px_40px] -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm text-xs font-semibold text-gray-400 mb-8 tracking-widest">
          <Activity size={12} className="text-red-500" /> LATENTFORCE ENGINE
        </div>
        
        <h1 className="relative z-10 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 max-w-4xl drop-shadow-2xl">
          Know what your change can <span className="text-red-500">break</span> before you ship it.
        </h1>
        
        <p className="relative z-10 text-lg md:text-xl text-gray-300 mb-10 max-w-3xl leading-relaxed drop-shadow-md">
          Analyze real software repositories to discover the components, dependencies, runtime couplings, and architectural constraints that a change could affect.
        </p>
        
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/analyze" className="bg-white text-black font-bold py-3 px-8 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
            Analyze a Repository <ArrowRight size={18} />
          </Link>
          <a href="#how-it-works" className="bg-[#111] text-white border border-gray-700 font-bold py-3 px-8 rounded flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-colors">
            See How It Works
          </a>
        </div>

        <div className="w-full max-w-5xl mt-20 h-[350px] rounded-lg border border-gray-800 bg-[#0a0a0a] shadow-2xl overflow-hidden relative pointer-events-none">
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></span>
          </div>
          <GraphView data={exampleGraphData} onNodeSelect={() => {}} />
        </div>
      </section>

      {/* 2. PROBLEM -> SOLUTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-12 bg-[#0a0a0a] border-y border-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-red-500 uppercase mb-4">The Blind Spot</h2>
            <h3 className="text-3xl font-bold text-white mb-6">Traditional static analysis only sees explicit imports.</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Linters and IDE dependency graphs build a comfortable illusion of safety. But real software breaks at the boundaries they can&apos;t see.
            </p>
            <ul className="space-y-3 font-mono text-sm text-gray-300">
              <li className="flex items-center gap-3"><XCircle /> <span className="text-gray-500">Misses</span> runtime relationships (Pub/Sub)</li>
              <li className="flex items-center gap-3"><XCircle /> <span className="text-gray-500">Misses</span> test dependencies</li>
              <li className="flex items-center gap-3"><XCircle /> <span className="text-gray-500">Misses</span> architectural constraints (ADRs)</li>
              <li className="flex items-center gap-3"><XCircle /> <span className="text-gray-500">Misses</span> documentation-driven assumptions</li>
            </ul>
          </div>
          <div className="bg-[#111] p-8 rounded-lg border border-red-900/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl -z-10"></div>
            <h2 className="text-xs font-bold tracking-widest text-green-500 uppercase mb-4">The Solution</h2>
            <h3 className="text-2xl font-bold text-white mb-4">BlastRadius maps the wider impact.</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Using the LatentForce engine, we scan the entire repository dynamically to extract the true semantic dependencies of your change, no matter how implicitly they are coupled.
            </p>
            <div className="flex gap-4">
              <div className="bg-[#1a1a1a] p-3 border border-gray-800 rounded flex-1 text-center">
                <Database className="mx-auto mb-2 text-blue-400" size={20} />
                <div className="text-xs text-gray-400">Runtime Configs</div>
              </div>
              <div className="bg-[#1a1a1a] p-3 border border-gray-800 rounded flex-1 text-center">
                <FileText className="mx-auto mb-2 text-purple-400" size={20} />
                <div className="text-xs text-gray-400">ADR Invariants</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATIC ANALYSIS VS BLASTRADIUS */}
      <section className="py-24 px-4 sm:px-6 lg:px-12 bg-[#050505]">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-white">Compare the difference</h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-8 opacity-70">
            <div className="text-xs text-gray-500 font-bold tracking-widest mb-6">NORMAL STATIC ANALYSIS</div>
            <div className="text-4xl font-bold text-white mb-2">14</div>
            <div className="text-sm text-gray-500 mb-8">Components Affected</div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Direct dependencies</span>
                <span className="text-white">Found</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Explicit imports</span>
                <span className="text-white">Found</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Runtime coupling</span>
                <span className="text-red-500">Missed</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Architectural constraints</span>
                <span className="text-red-500">Missed</span>
              </div>
            </div>
            <div className="mt-8 py-3 bg-[#141414] text-center border border-gray-800 rounded text-gray-400 font-bold">
              LOW RISK
            </div>
          </div>

          <div className="bg-[#111] border border-red-900/40 rounded-lg p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
            <div className="text-xs text-blue-400 font-bold tracking-widest mb-6 flex items-center gap-2">
              <Activity size={14} /> BLASTRADIUS
            </div>
            <div className="text-4xl font-bold text-white mb-2">19</div>
            <div className="text-sm text-gray-400 mb-8">Components Affected <span className="text-red-400">(+5 Hidden)</span></div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Direct dependencies</span>
                <span className="text-white">Found</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Explicit imports</span>
                <span className="text-white">Found</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Runtime coupling</span>
                <span className="text-green-400">Extracted</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Architectural constraints</span>
                <span className="text-green-400">Extracted</span>
              </div>
            </div>
            <div className="mt-8 py-3 bg-red-950/30 text-center border border-red-900/50 rounded text-red-500 font-bold">
              HIGH RISK
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-12 bg-[#0a0a0a] border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white">How it works</h2>
            <p className="text-gray-400 mt-2">The complete analysis pipeline</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Choose a repository', desc: 'Provide a local path or public GitHub URL to clone the workspace safely.' },
              { num: '02', title: 'Describe the change', desc: 'Input a natural language description of what you intend to refactor.' },
              { num: '03', title: 'Build dependency graph', desc: 'Extract explicit codebase imports across the entire tree.' },
              { num: '04', title: 'Discover hidden linkages', desc: 'Trace events, contexts, queues, and implicit bindings.' },
              { num: '05', title: 'Calculate blast radius', desc: 'Determine total components affected and grade the overall risk level.' },
              { num: '06', title: 'Review verification plan', desc: 'Get actionable, numbered steps on how to verify before shipping.' }
            ].map((step, i) => (
              <div key={i} className="p-6 bg-[#111] border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
                <div className="text-red-500 font-bold text-xl mb-4 font-mono">{step.num}</div>
                <h4 className="text-white font-bold mb-2">{step.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. EVIDENCE-FIRST DESIGN */}
      <section className="py-24 px-4 sm:px-6 lg:px-12 bg-[#050505] border-t border-gray-800 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Every hidden relationship should have evidence.</h2>
          <p className="text-gray-400 text-lg">We don&apos;t invent dependencies. If BlastRadius flags a risk, it gives you the exact file path and reason.</p>
        </div>
        
        <div className="max-w-5xl mx-auto grid gap-4 relative z-10">
          <div className="flex gap-4 p-4 bg-[#141414] rounded-lg border border-gray-800/80">
            <Database size={24} className="text-blue-400 mt-1 shrink-0" />
            <div>
              <div className="text-gray-200 font-medium mb-1">Implicit runtime dependency detected for Button</div>
              <div className="text-xs text-gray-500 flex gap-4 font-mono mt-2">
                <span className="flex items-center gap-1"><span className="text-gray-600">Type</span> <span className="text-white">Runtime</span></span>
                <span className="flex items-center gap-1"><span className="text-gray-600">Source</span> <span className="text-red-400">packages/devtools/src/OpenUIDevtools.test.ts</span></span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 bg-[#141414] rounded-lg border border-gray-800/80 ml-0 sm:ml-8">
            <ShieldCheck size={24} className="text-green-400 mt-1 shrink-0" />
            <div>
              <div className="text-gray-200 font-medium mb-1">Backward compatibility required for ORDER_CREATED event schema</div>
              <div className="text-xs text-gray-500 flex gap-4 font-mono mt-2">
                <span className="flex items-center gap-1"><span className="text-gray-600">Type</span> <span className="text-white">Invariant</span></span>
                <span className="flex items-center gap-1"><span className="text-gray-600">Source</span> <span className="text-red-400">docs/ADR-012.md</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-32 px-4 sm:px-6 text-center bg-[#0a0a0a] border-t border-gray-800 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#111_0%,#0a0a0a_100%)] -z-10"></div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Before you ship, know the blast radius.</h2>
        <p className="text-gray-400 mb-10 max-w-2xl mx-auto text-lg">Stop guessing what your architecture looks like. Let the engine map the true impact.</p>
        <Link href="/analyze" className="inline-flex items-center gap-2 bg-white text-black font-bold py-4 px-10 rounded hover:bg-gray-200 transition-transform hover:scale-105">
          <Play fill="currentColor" size={16} /> Start Analysis
        </Link>
      </section>
    </main>
  );
}

function XCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  );
}
