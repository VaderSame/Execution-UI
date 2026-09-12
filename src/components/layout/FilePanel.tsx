import { useState } from "react";
import { useRepoTree } from "../../hooks/useRepoTree";
import type { RepoNode } from "../../api/types";
import { CodeEditor } from "./CodeEditor";

function FileTreeNode({ node, onSelectFile, selectedPath }: { node: RepoNode; onSelectFile: (path: string) => void; selectedPath: string | null }) {
  const [expanded, setExpanded] = useState(false);

  const isSelected = selectedPath === node.path;

  if (node.type === "directory") {
    return (
      <div className="ml-2">
        <div 
          className="flex items-center cursor-pointer text-gray-400 hover:text-gray-200 py-1 px-2 rounded hover:bg-gray-800/50 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="w-4 text-center mr-1 text-xs">{expanded ? "▾" : "▸"}</span>
          <span className="text-yellow-600/80 mr-2 text-sm">📁</span>
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {expanded && node.children && (
          <div className="border-l border-gray-800/60 ml-2">
            {node.children.map((child) => (
              <FileTreeNode key={child.path} node={child} onSelectFile={onSelectFile} selectedPath={selectedPath} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`ml-2 flex items-center cursor-pointer py-1 px-2 rounded transition-colors ${
        isSelected ? "bg-blue-900/30 text-blue-300" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
      }`}
      onClick={() => onSelectFile(node.path)}
    >
      <span className="w-4 mr-1"></span>
      <span className="text-blue-400/70 mr-2 text-sm">📄</span>
      <span className="text-sm truncate">{node.name}</span>
    </div>
  );
}

interface Props {
  repoName: string | null;
  selectedFilePath: string | null;
  onSelectFile: (path: string | null) => void;
  refreshTrigger?: number;
}

export function FilePanel({ repoName, selectedFilePath, onSelectFile, refreshTrigger = 0 }: Props) {
  const { tree, loading, error } = useRepoTree(repoName, refreshTrigger);

  if (!repoName) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-600 text-sm bg-[#11111a]">
        No repository active
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Code Viewer (Left side of the right panel) */}
      {selectedFilePath && (
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-800/60 bg-[#0a0a0f] shadow-2xl relative z-10">
          <CodeEditor 
            repoName={repoName} 
            filePath={selectedFilePath} 
            onClose={() => onSelectFile(null)} 
          />
        </div>
      )}

      {/* File Tree (Right side of the right panel) */}
      <div className={`${selectedFilePath ? "w-64 flex-shrink-0" : "flex-1"} flex flex-col bg-[#11111a]`}>
        <div className="p-3 border-b border-gray-800/60 font-medium text-xs tracking-wider uppercase text-gray-500 flex-shrink-0 bg-[#0a0a0f]">
          Explorer
        </div>
        
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-[#11111a] flex-shrink-0 uppercase truncate">
          {repoName}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading && <div className="text-blue-500/70 text-sm p-2 animate-pulse">Loading workspace...</div>}
          {error && <div className="text-red-500/70 text-sm p-2 bg-red-500/10 rounded">{error}</div>}
          
          {!loading && tree.map((node) => (
            <FileTreeNode 
              key={node.path} 
              node={node} 
              onSelectFile={onSelectFile} 
              selectedPath={selectedFilePath} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
