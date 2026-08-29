import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, Activity, Database, FileText, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export default function NodeDetailPanel({ node, evidence, onClose }) {
    if (!node)
        return null;
    const nodeEvidence = evidence.filter(e => e.target === node.id || e.target === node.label);
    const getIcon = () => {
        if (node.type === 'document')
            return _jsx(FileText, { size: 20, className: "text-purple-400" });
        if (node.type === 'resource')
            return _jsx(Database, { size: 20, className: "text-blue-400" });
        if (node.type === 'change')
            return _jsx(Activity, { size: 20, className: "text-white" });
        return _jsx(Box, { size: 20, className: "text-gray-400" });
    };
    return (_jsx(AnimatePresence, { children: _jsxs(motion.div, { initial: { x: 300, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 300, opacity: 0 }, className: "absolute top-0 right-0 h-full w-80 bg-[#111] border-l border-gray-800 shadow-2xl flex flex-col z-50 font-mono", children: [_jsxs("div", { className: "p-4 border-b border-gray-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getIcon(), _jsx("h3", { className: "font-bold text-white truncate max-w-[200px]", children: node.label })] }), _jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-white transition-colors", children: _jsx(X, { size: 18 }) })] }), _jsxs("div", { className: "p-4 flex-1 overflow-y-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h4", { className: "text-xs text-gray-500 uppercase tracking-wider mb-2", children: "Node Type" }), _jsx("div", { className: "text-sm text-gray-300 capitalize", children: node.type })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("h4", { className: "text-xs text-gray-500 uppercase tracking-wider mb-2", children: ["Evidence (", nodeEvidence.length, ")"] }), nodeEvidence.length === 0 ? (_jsx("div", { className: "text-sm text-gray-600 italic", children: "No specific evidence recorded." })) : (_jsx("div", { className: "space-y-3", children: nodeEvidence.map((ev, i) => (_jsxs("div", { className: "bg-[#1a1a1a] border border-gray-800 p-3 rounded text-sm", children: [_jsx("div", { className: "text-gray-300 mb-2", children: ev.description }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs", children: [_jsx("span", { className: "text-gray-500", children: "Source:" }), _jsx("span", { className: "text-red-400 font-mono truncate max-w-full", children: ev.evidenceSource })] })] }, i))) }))] })] })] }) }));
}
