'use client';
import { useState } from 'react';
import { Box, Play, AlertTriangle, ShieldCheck, Activity, Search, RefreshCw, Layers, Database, GitCommit, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [changeDesc, setChangeDesc] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const setDemoQuery = (query: string) => {
    setRepoUrl('');
    setChangeDesc(query);
  };

  const analyze = async () => {
    if (!changeDesc) return;
    setAnalyzing(true);
    setResult(null);
    setError(null);
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeDescription: changeDesc, repoUrl })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to analyze repository');
      } else {
        setResult(data);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Network error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

  const isDemoActive = !repoUrl || repoUrl.trim() === '';

  return (
    <main className="min-h-screen bg-[#050505] text-gray-200 font-mono p-4 sm:p-6 lg:p-12 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <header className="mb-8 flex items-center justify-between border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Activity className="text-red-500" /> BlastRadius
            </h1>
            <p className="mt-2 text-gray-400 text-sm">Know what your change can break before you ship it.</p>
          </div>
          <div className="flex items-center gap-3">
            {isDemoActive ? (
              <span className="text-xs bg-gray-900 border border-gray-800 px-3 py-1.5 rounded text-gray-400 font-sans flex items-center gap-2 transition-colors">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Demo Repo Active
              </span>
            ) : (
              <span className="text-xs bg-blue-950 border border-blue-900 px-3 py-1.5 rounded text-blue-200 font-sans flex items-center gap-2 transition-colors">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Live Repo Active
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f0f0f] border border-gray-800 p-5 rounded-lg shadow-2xl">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layers size={16}/> Target Repository
              </h2>
              
              <input 
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="GitHub URL or local path (e.g. /home/boypablo/openui)"
                className="w-full bg-[#141414] border border-gray-700 rounded p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-600 transition-all text-white mb-6"
              />

              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-t border-gray-800 pt-6">
                <Search size={16}/> Proposed Change
              </h2>
              
              <textarea 
                value={changeDesc}
                onChange={(e) => setChangeDesc(e.target.value)}
                placeholder="e.g. Replace the Redis event publisher in OrderService with Kafka..."
                className="w-full bg-[#141414] border border-gray-700 rounded p-3 text-sm h-32 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none placeholder:text-gray-600 transition-all text-white"
              />

              <div className="mt-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-sans">Or Try Demo Scenario:</span>
                <div className="mt-2 space-y-2">
                  <button 
                    onClick={() => setDemoQuery("Replace the Redis event publisher in OrderService with Kafka.")}
                    className="w-full text-left text-xs bg-[#1a1a1a] hover:bg-gray-800 border border-gray-800 p-2.5 rounded text-gray-300 transition-colors flex items-center gap-2"
                  >
                    <GitCommit size={14} className="text-red-400 shrink-0"/> Replace Redis Pub/Sub with Kafka
                  </button>
                </div>
              </div>

              <button 
                onClick={analyze}
                disabled={analyzing || !changeDesc}
                className="mt-6 w-full bg-white text-black font-semibold py-2.5 px-4 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {analyzing ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                {analyzing ? (isDemoActive ? 'Tracing Blast Radius...' : 'Acquiring & Tracing...') : 'Analyze Blast Radius'}
              </button>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start gap-3">
                <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                <div className="text-sm font-sans">{error}</div>
              </div>
            )}

            {/* Baseline comparison shown when result is active */}
            {result && result.baseline && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0f0f0f] border border-gray-800 rounded-lg shadow-2xl overflow-hidden"
              >
                <div className="bg-[#141414] border-b border-gray-800 p-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={16}/> Normal Static Analysis
                  </h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={20} className="text-green-500" />
                    <span className="text-lg font-bold text-white">{result.baseline.riskLevel} RISK</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {result.baseline.primaryConcern}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest pt-4 border-t border-gray-800">
                    <span>Components: {result.baseline.componentsAffected}</span>
                    <span>Hidden Links: 0</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-8">
            {!result && !analyzing && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-gray-600 border border-dashed border-gray-800 rounded-lg p-12 bg-[#0a0a0a]">
                <Layers size={48} className="mb-4 opacity-40 text-red-500" />
                <p className="text-gray-400 font-semibold">Ready for Analysis</p>
                <p className="text-xs mt-2 text-gray-500 max-w-sm text-center leading-relaxed">
                  BlastRadius parses explicit imports, implicit runtime relationships (Redis channels, queues), and historical ADRs/invariants.
                </p>
              </div>
            )}
            
            {analyzing && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center border border-gray-800 rounded-lg p-12 bg-[#0a0a0a]">
                <div className="flex gap-2 mb-6">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></span>
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></span>
                </div>
                <p className="text-red-400 font-semibold animate-pulse">LatentForce is analyzing codebase context...</p>
                <p className="text-xs text-gray-500 mt-2">Checking explicit imports, runtime channels, and historical ADRs</p>
              </div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f0f] border border-red-900/40 rounded-lg shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="bg-red-950/20 border-b border-red-900/40 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-red-500 flex items-center gap-3">
                      <AlertTriangle size={24} /> BlastRadius: {result.riskLevel} RISK
                    </h2>
                    <p className="text-red-200/80 mt-3 text-sm leading-relaxed max-w-2xl">
                      {result.primaryConcern}
                    </p>
                  </div>
                  <div className="flex gap-8 sm:text-right">
                    <div>
                      <div className="text-4xl font-bold text-white">{result.componentsAffected}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Affected</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-white">{result.implicitCouplings}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Hidden</div>
                    </div>
                  </div>
                </div>

                {/* Graph Visualization */}
                {result.graph && result.graph.nodes && (
                  <div className="p-8 border-b border-gray-800 bg-[#0a0a0a] min-h-[250px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    
                    <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
                      
                      {/* Top Level: Change */}
                      <div className="flex justify-center w-full z-20">
                        <div className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                          Proposed Change
                        </div>
                      </div>
                      
                      {/* Dynamic Nodes Wrapper */}
                      <div className="flex flex-wrap justify-center gap-6 w-full relative z-20">
                        {result.graph.nodes.filter((n: any) => n.type !== 'change').slice(0, 12).map((node: any) => {
                          const isDoc = node.type === 'document';
                          const isResource = node.type === 'resource';
                          
                          if (isDoc) {
                            return (
                              <div key={node.id} className="px-3 py-1.5 bg-[#0a0a0a] text-purple-400 text-xs font-mono rounded-full border border-purple-900/50 flex items-center gap-1.5 shadow-lg">
                                <FileText size={12} /> {node.label}
                              </div>
                            );
                          }
                          if (isResource) {
                            return (
                              <div key={node.id} className="px-3 py-1.5 bg-[#0a0a0a] text-blue-400 text-xs font-mono rounded-full border border-blue-900/50 flex items-center gap-1.5 shadow-lg">
                                <Database size={12} /> {node.label}
                              </div>
                            );
                          }
                          // Default: Service
                          return (
                            <div key={node.id} className="px-4 py-2 bg-[#1a1a1a] text-white text-sm font-mono rounded border border-gray-600 shadow-lg flex items-center gap-2">
                              <Box size={14} className="text-gray-400" /> {node.label}
                            </div>
                          );
                        })}
                        {result.graph.nodes.length > 13 && (
                          <div className="px-4 py-2 bg-[#111] text-gray-500 text-sm font-mono rounded border border-gray-800 border-dashed flex items-center gap-2">
                            + {result.graph.nodes.length - 13} more
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-8 border-b border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Evidence & Hidden Impact</h3>
                  <div className="grid gap-3">
                    {result.evidence?.map((ev: any, i: number) => (
                      <div key={i} className="flex gap-4 p-4 bg-[#141414] rounded-lg border border-gray-800/80 hover:border-gray-700 transition-colors">
                        <div className="mt-0.5">
                          {ev.type === 'runtime' && <Database size={18} className="text-blue-400" />}
                          {ev.type === 'history' && <FileText size={18} className="text-purple-400" />}
                          {ev.type === 'invariant' && <ShieldCheck size={18} className="text-green-400" />}
                        </div>
                        <div>
                          <div className="text-sm text-gray-200 font-medium mb-1.5">{ev.description}</div>
                          <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3 font-mono">
                            <span className="flex items-center gap-1.5"><span className="text-gray-600">Source:</span> <span className="text-red-400">{ev.evidenceSource}</span></span>
                            <span className="flex items-center gap-1.5"><span className="text-gray-600">Target:</span> <span className="text-white">{ev.target}</span></span>
                            <span className="flex items-center gap-1.5"><span className="text-gray-600">Confidence:</span> <span className="text-green-400">{(ev.confidence * 100).toFixed(0)}%</span></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 sm:p-8 bg-[#0a0a0a] rounded-b-lg">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Verification Plan</h3>
                  <div className="space-y-3">
                    {result.verificationPlan?.map((plan: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start p-3 text-sm text-gray-300 bg-[#141414] rounded border border-gray-800/50">
                        <div className="text-red-500 font-bold shrink-0 font-mono mt-0.5">{(i + 1).toString().padStart(2, '0')}</div>
                        <div className="leading-relaxed">{plan}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -8;
          }
        }
      `}} />
    </main>
  );
}
