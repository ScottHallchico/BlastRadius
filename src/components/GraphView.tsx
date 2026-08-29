'use client';

import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Database, FileText, Box, GitCommit } from 'lucide-react';

const nodeTypes = {
  customNode: ({ data }: any) => {
    const isDoc = data.type === 'document';
    const isResource = data.type === 'resource';
    const isChange = data.type === 'change';

    let bgClass = 'bg-[#1a1a1a] border-gray-600 text-white';
    let icon = <Box size={14} className="text-gray-400" />;
    
    if (isChange) {
      bgClass = 'bg-white border-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]';
      icon = <GitCommit size={14} className="text-black" />;
    } else if (isDoc) {
      bgClass = 'bg-[#0a0a0a] border-purple-900/50 text-purple-400 rounded-full';
      icon = <FileText size={12} />;
    } else if (isResource) {
      bgClass = 'bg-[#0a0a0a] border-blue-900/50 text-blue-400 rounded-full';
      icon = <Database size={12} />;
    }

    return (
      <div className={`px-4 py-2 text-xs font-mono rounded border flex items-center gap-2 ${bgClass} ${data.selected ? 'ring-2 ring-red-500' : ''} ${data.dimmed ? 'opacity-30' : 'opacity-100'} transition-opacity`}>
        <Handle type="target" position={Position.Top} className="opacity-0" />
        {icon}
        <span>{data.label}</span>
        <Handle type="source" position={Position.Bottom} className="opacity-0" />
      </div>
    );
  }
};

export default function GraphView({ data, onNodeSelect }: { data: any, onNodeSelect: (n: any) => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  useEffect(() => {
    if (!data || !data.nodes) return;

    // Simple auto layout (tree structure)
    const levelMap: any = { change: 0, service: 1, resource: 2, document: 2 };
    
    const initialNodes = data.nodes.map((n: any, i: number) => {
      const level = levelMap[n.type] ?? 1;
      // Spread nodes horizontally based on index
      const x = (i % 5) * 200 - 400;
      const y = level * 150 + 50;

      return {
        id: n.id,
        type: 'customNode',
        position: { x, y },
        data: { ...n }
      };
    });

    const initialEdges = data.edges.map((e: any, i: number) => {
      let stroke = '#333';
      let animated = false;
      let dasharray = undefined;

      if (e.type === 'runtime') {
        stroke = '#ef4444';
        animated = true;
      } else if (e.type === 'invariant') {
        stroke = '#a855f7';
        dasharray = '5 5';
      }

      return {
        id: `e-${i}`,
        source: e.source,
        target: e.target,
        animated,
        style: { stroke, strokeWidth: 2, strokeDasharray: dasharray },
        markerEnd: { type: MarkerType.ArrowClosed, color: stroke }
      };
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [data]);

  const onNodeClick = useCallback((_: any, node: any) => {
    onNodeSelect(node.data);
    
    // Highlight logic
    setNodes(nds => nds.map(n => {
      // Find connections
      const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
      const connectedNodeIds = connectedEdges.flatMap(e => [e.source, e.target]);
      
      const isConnected = connectedNodeIds.includes(n.id) || n.id === node.id;
      
      return {
        ...n,
        data: {
          ...n.data,
          selected: n.id === node.id,
          dimmed: !isConnected
        }
      };
    }));

    setEdges((eds: any) => eds.map((e: any) => ({
      ...e,
      style: {
        ...e.style,
        opacity: (e.source === node.id || e.target === node.id) ? 1 : 0.2
      }
    })));

  }, [edges, onNodeSelect, setNodes, setEdges]);

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, selected: false, dimmed: false } })));
    setEdges(eds => eds.map((e: any) => ({ ...e, style: { ...e.style, opacity: 1 } })));
  }, [onNodeSelect, setNodes, setEdges]);

  return (
    <div className="w-full h-full min-h-[400px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#0a0a0a]"
      >
        <Background color="#222" gap={20} size={1} />
        <Controls className="!bg-[#111] !border-gray-800 !fill-white" />
      </ReactFlow>
    </div>
  );
}
