import { useState, useEffect } from "react";
import { useRepoTree } from "../../hooks/useRepoTree";
import type { RepoNode } from "../../api/types";
import { getRepoFile } from "../../api/repos";

function FileTreeNode({ node, onSelectFile }: { node: RepoNode; onSelectFile: (path: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  if (node.type === "directory") {
    return (
      <div className="ml-2">
        <button
          className="flex items-center text-sm py-1 px-2 w-full text-left hover:bg-gray-800 rounded text-gray-300"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="w-4 inline-block text-center text-gray-500 font-mono text-xs">{expanded ? "v" : ">"}</span>
          <span className="ml-1 truncate">{node.name}</span>
        </button>
        {expanded && node.children && (
          <div className="border-l border-gray-800 ml-3">
            {node.children.map((child) => (
              <FileTreeNode key={child.path} node={child} onSelectFile={onSelectFile} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ml-2">
      <button
        className="flex items-center text-sm py-1 px-2 w-full text-left hover:bg-gray-800 rounded text-gray-400"
        onClick={() => onSelectFile(node.path)}
      >
        <span className="w-4 inline-block"></span>
        <span className="ml-1 truncate">{node.name}</span>
      </button>
    </div>
  );
}

export function FilePanel({ repoName }: { repoName: string | null }) {
  const { tree, loading, error } = useRepoTree(repoName);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    setSelectedFilePath(null);
    setFileContent(null);
  }, [repoName]);

  useEffect(() => {
    if (!selectedFilePath || !repoName) return;
    setFileLoading(true);
    getRepoFile(repoName, selectedFilePath)
      .then(setFileContent)
      .catch((err) => setFileContent(`Error loading file: ${err.message}`))
      .finally(() => setFileLoading(false));
  }, [selectedFilePath, repoName]);

  if (!repoName) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-600 text-sm bg-gray-950">
        No repository active
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Code Viewer (Left side of the right panel) */}
      {selectedFilePath && (
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-800 bg-gray-950">
          <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-900 flex-shrink-0">
            <span className="text-xs text-gray-300 font-mono truncate mr-2" title={selectedFilePath}>
              {selectedFilePath.split("/").pop()}
            </span>
            <button 
              onClick={() => setSelectedFilePath(null)}
              className="text-gray-500 hover:text-white px-2 rounded hover:bg-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {fileLoading && <div className="text-gray-500 text-sm">Loading file...</div>}
            {!fileLoading && fileContent !== null && (
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words">
                {fileContent}
              </pre>
            )}
            {!fileLoading && fileContent === null && (
              <div className="text-gray-700 text-sm">Error loading file.</div>
            )}
          </div>
        </div>
      )}

      {/* File Tree (Right side of the right panel) */}
      <div className="w-64 flex-shrink-0 flex flex-col bg-gray-900">
        <div className="p-3 border-b border-gray-800 font-medium text-sm truncate bg-gray-900 flex-shrink-0">
          <span className="text-gray-500 mr-2">repo</span>
          {repoName}
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading && <div className="text-gray-500 text-sm p-2">Loading tree...</div>}
          {error && <div className="text-red-400 text-sm p-2">{error}</div>}
          {tree.map((node) => (
            <FileTreeNode key={node.path} node={node} onSelectFile={setSelectedFilePath} />
          ))}
        </div>
      </div>
    </div>
  );
}
