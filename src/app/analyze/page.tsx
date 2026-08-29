'use client';
import { useState, useEffect } from 'react';
import { Box, Play, AlertTriangle, ShieldCheck, Activity, Search, RefreshCw, Layers, Database, GitCommit, FileText, CheckCircle2, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GraphView from '@/components/GraphView';
import NodeDetailPanel from '@/components/NodeDetailPanel';
import { Command } from 'cmdk';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [changeDesc, setChangeDesc] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<string>('All');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const setDemoQuery = (query: string) => {
    setRepoUrl('');
    setChangeDesc(query);
  };

  const analyze = async () => {
    if (!changeDesc) return;
    setAnalyzing(true);
    setResult(null);
    setError(null);
    setSelectedNode(null);
    setAnalysisStage(1); // Repository resolved
    
    try {
      // Fake staging progression for UX
      const stageInterval = setInterval(() => {
        setAnalysisStage(s => Math.min(s + 1, 5));
      }, 800);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/analyze` 
        : '/api/analyze';

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeDescription: changeDesc, repoUrl })
      });
      clearInterval(stageInterval);
      setAnalysisStage(6); // Done

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
      setAnalysisStage(0);
    }
  };

  const isDemoActive = !repoUrl || repoUrl.trim() === '';

  return (
    <>
      <Command.Dialog open={cmdOpen} onOpenChange={setCmdOpen} className="cmdk-dialog" overlayClassName="cmdk-overlay">
        <Command.Input placeholder="Type a command or search..." className="cmdk-input" />
        <Command.List className="cmdk-list">
          <Command.Empty>No results found.</Command.Empty>
          <Command.Group heading="Actions">
            <Command.Item onSelect={() => { analyze(); setCmdOpen(false); }}>
              <Play size={14} /> Analyze Repository
            </Command.Item>
            <Command.Item onSelect={() => { setEvidenceFilter('All'); setCmdOpen(false); }}>
              <Layers size={14} /> Show All Evidence
            </Command.Item>
            <Command.Item onSelect={() => { setEvidenceFilter('Runtime'); setCmdOpen(false); }}>
              <Database size={14} /> Show Runtime Couplings
            </Command.Item>
            <Command.Item onSelect={() => { setEvidenceFilter('Documentation'); setCmdOpen(false); }}>
              <FileText size={14} /> Show Documentation
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>

      <NodeDetailPanel node={selectedNode} evidence={result?.evidence || []} onClose={() => setSelectedNode(null)} />

      <main className="min-h-screen bg-[#050505] text-gray-200 font-mono p-4 sm:p-6 lg:p-12 flex flex-col items-center">
        <div className="w-full max-w-7xl">

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

              {analyzing && (
                <div className="mt-6 p-4 bg-[#0a0a0a] border border-gray-800 rounded text-xs space-y-2">
                  <div className="font-bold text-gray-300 mb-3 flex items-center gap-2">
                    <RefreshCw className="animate-spin" size={14} /> ANALYZING REPOSITORY
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStage >= 1 ? 'text-green-400' : 'text-gray-600'}`}>
                    {analysisStage >= 1 ? '✓' : '○'} Repository resolved
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStage >= 2 ? 'text-green-400' : analysisStage === 1 ? 'text-blue-400' : 'text-gray-600'}`}>
                    {analysisStage >= 2 ? '✓' : analysisStage === 1 ? '●' : '○'} Scanning repository
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStage >= 3 ? 'text-green-400' : analysisStage === 2 ? 'text-blue-400' : 'text-gray-600'}`}>
                    {analysisStage >= 3 ? '✓' : analysisStage === 2 ? '●' : '○'} Building dependency graph
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStage >= 4 ? 'text-green-400' : analysisStage === 3 ? 'text-blue-400' : 'text-gray-600'}`}>
                    {analysisStage >= 4 ? '✓' : analysisStage === 3 ? '●' : '○'} Finding hidden relationships
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStage >= 5 ? 'text-green-400' : analysisStage === 4 ? 'text-blue-400' : 'text-gray-600'}`}>
                    {analysisStage >= 5 ? '✓' : analysisStage === 4 ? '●' : '○'} Calculating blast radius
                  </div>
                </div>
              )}

              {!analyzing && (
                <button 
                  onClick={analyze}
                  disabled={!changeDesc}
                  className="mt-6 w-full bg-white text-black font-semibold py-2.5 px-4 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  <Play size={18} />
                  Analyze Blast Radius
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start gap-3">
                <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                <div className="text-sm font-sans">{error}</div>
              </div>
            )}

            {/* Understood Change */}
            {result && result.changeSpecification && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0f0f0f] border border-gray-800 rounded-lg shadow-2xl overflow-hidden mb-6"
              >
                <div className="bg-[#141414] border-b border-gray-800 p-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Search size={16}/> Understood Change
                  </h3>
                </div>
                <div className="p-4 text-sm font-mono space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-950/50 text-red-400 border border-red-900/50 px-2 py-0.5 rounded text-xs font-bold">
                      {result.changeSpecification.operation}
                    </span>
                    {result.changeSpecification.target.type !== 'unknown' && (
                      <span className="text-gray-500 text-xs">({result.changeSpecification.target.type})</span>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-white font-bold">{result.changeSpecification.target.name}</div>
                    {result.changeSpecification.property && (
                      <div className="text-gray-400 text-xs mt-1">Property: <span className="text-blue-400">{result.changeSpecification.property}</span></div>
                    )}
                    {result.changeSpecification.replacement && (
                      <div className="text-gray-400 text-xs mt-1">→ <span className="text-green-400">{result.changeSpecification.replacement}</span></div>
                    )}
                  </div>
                  
                  {result.changeSpecification.contextBoundary && (
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
                      Context: <span className="text-gray-300">{result.changeSpecification.contextBoundary}</span>
                    </div>
                  )}
                </div>
              </motion.div>
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
                    <Layers size={16}/> Value Comparison
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                    <div>
                      <div className="text-xs text-gray-500 mb-2">NORMAL STATIC ANALYSIS</div>
                      <div className="text-gray-300 mb-1">{result.baseline.componentsAffected} components</div>
                      <div className="text-gray-300 mb-2">0 hidden relationships</div>
                      <div className="text-white font-bold">{result.baseline.riskLevel} RISK</div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-400 mb-2">BLASTRADIUS</div>
                      <div className="text-white mb-1">{result.componentsAffected} affected</div>
                      <div className="text-white mb-2">{result.implicitCouplings} hidden</div>
                      <div className="text-red-500 font-bold">{result.riskLevel} RISK</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed mt-4 pt-4 border-t border-gray-800">
                    {result.primaryConcern}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Target Repository Info */}
            {result && result.metadata && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0f0f0f] border border-gray-800 rounded-lg shadow-2xl overflow-hidden mt-6"
              >
                <div className="bg-[#141414] border-b border-gray-800 p-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Terminal size={16}/> Repository Info
                  </h3>
                </div>
                <div className="p-4 text-xs font-mono space-y-2 text-gray-400">
                  <div className="text-white mb-3 truncate">{isDemoActive ? '/bundled/demo-repo' : repoUrl}</div>
                  <div className="flex justify-between"><span>Files scanned:</span> <span className="text-white">{result.metadata.filesScanned?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Directories:</span> <span className="text-white">{result.metadata.dirsScanned?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Analysis time:</span> <span className="text-white">{(result.metadata.analysisTimeMs / 1000).toFixed(2)}s</span></div>
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
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Evidence & Hidden Impact</h3>
                    <div className="flex bg-[#141414] border border-gray-800 rounded p-1">
                      {['All', 'Runtime', 'Dependencies', 'Documentation'].map(filter => {
                        // Map internal types to user friendly labels
                        const typeMap: any = { 'Runtime': 'runtime', 'Dependencies': 'dependency', 'Documentation': 'history', 'All': 'all' };
                        const hasItems = filter === 'All' || result.evidence?.some((e: any) => e.type === typeMap[filter] || (filter === 'Documentation' && e.type === 'invariant'));
                        
                        return (
                          <button
                            key={filter}
                            disabled={!hasItems}
                            onClick={() => setEvidenceFilter(filter)}
                            className={`px-3 py-1 text-xs font-mono rounded ${evidenceFilter === filter ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'} ${!hasItems && 'opacity-30 cursor-not-allowed'} transition-all`}
                          >
                            {filter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    {result.evidence?.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-gray-800 rounded text-gray-500 text-sm">
                        <CheckCircle2 size={24} className="mx-auto mb-2 opacity-50" />
                        NO HIDDEN IMPACT DETECTED<br/>
                        BlastRadius found no additional relationships beyond the direct dependency graph.
                      </div>
                    ) : (
                      result.evidence?.filter((ev: any) => {
                        if (evidenceFilter === 'All') return true;
                        if (evidenceFilter === 'Runtime') return ev.type === 'runtime';
                        if (evidenceFilter === 'Dependencies') return ev.type === 'dependency';
                        if (evidenceFilter === 'Documentation') return ev.type === 'history' || ev.type === 'invariant';
                        return true;
                      }).map((ev: any, i: number) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedNode(result.graph.nodes.find((n: any) => n.id === ev.target || n.label === ev.target))}
                        className="flex gap-4 p-4 bg-[#141414] rounded-lg border border-gray-800/80 hover:border-gray-600 hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                      >
                        <div className="mt-0.5">
                          {ev.type === 'runtime' && <Database size={18} className="text-blue-400" />}
                          {(ev.type === 'history' || ev.type === 'invariant') && <FileText size={18} className="text-purple-400" />}
                          {ev.type === 'dependency' && <Layers size={18} className="text-gray-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-200 font-medium mb-1.5">{ev.description}</div>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                            <span className="flex items-center gap-1.5"><span className="text-gray-600 uppercase tracking-widest text-[10px]">Type</span> <span className="text-white capitalize">{ev.type}</span></span>
                            <span className="flex items-center gap-1.5"><span className="text-gray-600 uppercase tracking-widest text-[10px]">Source</span> <span className="text-red-400 truncate max-w-[200px]">{ev.evidenceSource}</span></span>
                            <span className="flex items-center gap-1.5"><span className="text-gray-600 uppercase tracking-widest text-[10px]">Confidence</span> <span className="text-green-400">{(ev.confidence * 100).toFixed(0)}%</span></span>
                          </div>
                        </div>
                      </div>
                    )))}
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
    </>
  );
}
