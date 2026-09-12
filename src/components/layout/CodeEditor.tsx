import { useState, useEffect } from "react";
import EditorDefault from "react-simple-code-editor";
const Editor = (EditorDefault as any).default || EditorDefault;
// @ts-ignore
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css"; // A dark theme
import { getRepoFile, updateRepoFile } from "../../api/repos";
import ReactDiffViewer from "react-diff-viewer-continued";

interface Props {
  repoName: string | null;
  filePath: string | null;
  onClose: () => void;
}

export function CodeEditor({ repoName, filePath, onClose }: Props) {
  const [snapshotContent, setSnapshotContent] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"code" | "diff">("code");

  useEffect(() => {
    let active = true;
    if (!repoName || !filePath) {
      setContent("");
      setOriginalContent(null);
      setSnapshotContent(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    getRepoFile(repoName, filePath)
      .then((data) => {
        if (!active) return;
        setOriginalContent(data.content);
        setContent(data.content);
        setSnapshotContent(data.original_content); // Baseline from snapshot
        // Default to diff mode if there's a difference from baseline
        setViewMode(data.original_content && data.original_content !== data.content ? "diff" : "code");
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError("Failed to load file");
        setIsLoading(false);
        setContent("");
        setOriginalContent(null);
        setSnapshotContent(null);
      });

    return () => {
      active = false;
    };
  }, [repoName, filePath]);

  const isDirty = originalContent !== null && content !== originalContent;
  const hasDiff = snapshotContent !== null;

  const handleSave = async () => {
    if (!repoName || !filePath || !isDirty) return;
    setIsSaving(true);
    try {
      const success = await updateRepoFile(repoName, filePath, content);
      if (success) {
        setOriginalContent(content);
      } else {
        alert("Failed to save file");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving file");
    } finally {
      setIsSaving(false);
    }
  };

  if (!repoName || !filePath) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0f] text-gray-600">
        <div className="text-center">
          <div className="text-4xl mb-4 opacity-20">📝</div>
          <p>Select a file from the repository explorer to view and edit</p>
        </div>
      </div>
    );
  }

  const getLanguage = (path: string) => {
    if (path.endsWith(".py")) return "python";
    if (path.endsWith(".md")) return "markdown";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".sh")) return "bash";
    return "javascript"; // fallback
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0f]">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800/60 bg-[#11111a] flex-shrink-0">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-gray-500">📄</span>
          <span className="text-sm text-gray-300 font-mono truncate">{filePath}</span>
          {isDirty && <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block ml-2"></span>}
        </div>
        
        <div className="flex items-center space-x-3">
          {hasDiff && (
            <div className="flex items-center bg-gray-900 rounded overflow-hidden border border-gray-700">
              <button
                onClick={() => setViewMode("code")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === "code" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setViewMode("diff")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === "diff" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                Diff
              </button>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              isDirty && !isSaving 
                ? "bg-blue-600 text-white hover:bg-blue-500" 
                : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Saving..." : isDirty ? "Save" : "Saved"}
          </button>
          
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-auto relative bg-[#0a0a0f]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/80 z-10 text-blue-400">
            Loading...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-[#0a0a0f]/80 z-10">
            {error}
          </div>
        )}
        
        {viewMode === "code" || !hasDiff ? (
          <div className="min-h-full font-mono text-[13px] leading-relaxed p-4">
            <Editor
              value={content}
              onValueChange={setContent}
              highlight={(code) => {
                const lang = getLanguage(filePath);
                const grammar = Prism.languages[lang] || Prism.languages.javascript;
                return Prism.highlight(code, grammar, lang);
              }}
              padding={10}
              style={{
                fontFamily: '"Fira Code", "Consolas", monospace',
                minHeight: '100%',
                backgroundColor: 'transparent',
                color: '#d4d4d4'
              }}
              textareaClassName="focus:outline-none"
            />
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <ReactDiffViewer
              oldValue={snapshotContent || ""}
              newValue={content}
              splitView={true}
              useDarkTheme={true}
              leftTitle="Original (Snapshot)"
              rightTitle="Modified"
              styles={{
                variables: {
                  dark: {
                    diffViewerBackground: '#0a0a0f',
                    diffViewerTitleBackground: '#11111a',
                    diffViewerTitleColor: '#a1a1aa',
                    diffViewerTitleBorderColor: '#27272a',
                    addedBackground: '#042f1f',
                    addedColor: '#a7f3d0',
                    removedBackground: '#450a0a',
                    removedColor: '#fecaca',
                    wordAddedBackground: '#065f46',
                    wordRemovedBackground: '#7f1d1d',
                    codeFoldBackground: '#18181b',
                    codeFoldContentColor: '#52525b',
                    emptyLineBackground: '#0a0a0f',
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
