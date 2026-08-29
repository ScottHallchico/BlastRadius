'use client';
import { X, ExternalLink, Activity, Database, FileText, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NodeDetailPanel({ node, evidence, onClose }: { node: any, evidence: any[], onClose: () => void }) {
  if (!node) return null;

  const nodeEvidence = evidence.filter(e => e.target === node.id || e.target === node.label);

  const getIcon = () => {
    if (node.type === 'document') return <FileText size={20} className="text-purple-400" />;
    if (node.type === 'resource') return <Database size={20} className="text-blue-400" />;
    if (node.type === 'change') return <Activity size={20} className="text-white" />;
    return <Box size={20} className="text-gray-400" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="absolute top-0 right-0 h-full w-80 bg-[#111] border-l border-gray-800 shadow-2xl flex flex-col z-50 font-mono"
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="font-bold text-white truncate max-w-[200px]">{node.label}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-6">
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Node Type</h4>
            <div className="text-sm text-gray-300 capitalize">{node.type}</div>
          </div>

          <div className="mb-6">
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Evidence ({nodeEvidence.length})</h4>
            {nodeEvidence.length === 0 ? (
              <div className="text-sm text-gray-600 italic">No specific evidence recorded.</div>
            ) : (
              <div className="space-y-3">
                {nodeEvidence.map((ev, i) => (
                  <div key={i} className="bg-[#1a1a1a] border border-gray-800 p-3 rounded text-sm">
                    <div className="text-gray-300 mb-2">{ev.description}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-gray-500">Source:</span>
                      <span className="text-red-400 font-mono truncate max-w-full">{ev.evidenceSource}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
