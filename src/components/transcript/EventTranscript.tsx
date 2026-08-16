import { useEffect, useRef } from "react";
import type { StreamEvent } from "../../api/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { sanitizeLLMContent, parseToolArgs, normalizeFilePath, stripMarkdownFences } from "../../utils/formatters";

function AgentTurnEntry({ data }: { data: any }) {
  const content = sanitizeLLMContent(data.content);
  
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{data.node}</span>
      </div>
      {content && (
        <div className="prose prose-invert prose-sm max-w-none mb-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}
      {data.tool_calls && data.tool_calls.length > 0 && (
        <div className="mt-3 space-y-2">
          {data.tool_calls.map((tc: any, i: number) => {
            const args = parseToolArgs(tc.args);
            return (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded overflow-hidden">
                <div className="bg-gray-800 px-3 py-1.5 text-xs font-mono text-gray-300 border-b border-gray-700 flex justify-between items-center">
                  <span>{tc.name}</span>
                  <span className="text-gray-500 text-[10px] uppercase">Tool Call</span>
                </div>
                <div className="p-3 bg-gray-950/50">
                  {Object.entries(args).map(([k, v]) => (
                    <div key={k} className="mb-1 last:mb-0">
                      <span className="text-xs font-semibold text-gray-500 mr-2">{k}:</span>
                      <span className="text-xs font-mono text-gray-300 break-all">
                        {k.includes("path") || k === "command" ? normalizeFilePath(String(v)) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToolResultEntry({ data }: { data: any }) {
  const isMultiLine = typeof data.result === 'string' && data.result.includes('\n');
  const cleanedResult = stripMarkdownFences(data.result);
  
  return (
    <div className="mb-6 pl-4 border-l-2 border-gray-800">
      <div className="text-xs font-mono text-gray-500 mb-2 flex items-center">
        <span>{data.tool_name}</span>
        <span className="mx-2 text-gray-700">•</span>
        <span className="text-gray-600 uppercase tracking-wider text-[10px]">Result</span>
      </div>
      
      {isMultiLine ? (
        <div className="rounded overflow-hidden border border-gray-800">
          <SyntaxHighlighter
            language="python"
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '1rem', fontSize: '0.75rem', background: '#0f111a' }}
            wrapLines={true}
          >
            {cleanedResult}
          </SyntaxHighlighter>
        </div>
      ) : (
        <pre className="text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-x-auto border border-gray-800 inline-block max-w-full whitespace-pre-wrap">
          {cleanedResult}
        </pre>
      )}
    </div>
  );
}

function UnifiedTerminal({ stdout, stderr, sandboxOutputs }: { stdout?: string, stderr?: string, sandboxOutputs: any[] }) {
  if (!stdout && !stderr && sandboxOutputs.length === 0) return null;
  
  return (
    <div className="mt-4 mb-6 rounded border border-gray-800 overflow-hidden shadow-lg">
      <div className="bg-gray-900 px-3 py-2 text-xs font-mono text-gray-400 border-b border-gray-800 flex items-center">
        <div className="flex space-x-1.5 mr-4">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
        </div>
        Sandbox Terminal
      </div>
      <div className="bg-[#0f111a] p-3 text-xs font-mono leading-relaxed overflow-x-auto max-h-64 overflow-y-auto">
        {sandboxOutputs.map((out, i) => (
          <div key={`out-${i}`} className={out.stream === "stderr" ? "text-red-400" : "text-gray-300 whitespace-pre-wrap"}>
            {out.chunk}
          </div>
        ))}
        {sandboxOutputs.length === 0 && stdout && (
          <div className="text-gray-300 whitespace-pre-wrap mt-1">{stdout}</div>
        )}
        {sandboxOutputs.length === 0 && stderr && (
          <div className="text-red-400 whitespace-pre-wrap mt-1">{stderr}</div>
        )}
      </div>
    </div>
  );
}

function ExecutionStatusChip({ data }: { data: any }) {
  const isSuccess = data.success;
  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${isSuccess ? "bg-green-900/20 text-green-400 border-green-900/50" : "bg-red-900/20 text-red-400 border-red-900/50"}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isSuccess ? "bg-green-500" : "bg-red-500"}`}></span>
      Execution {isSuccess ? "Succeeded" : "Failed"} (Exit Code: {data.exit_code})
    </div>
  );
}

function ApprovalLogEntry({ data }: { data: any }) {
  return (
    <div className="mb-6 p-3 bg-yellow-900/10 border border-yellow-900/30 rounded flex items-start">
      <div className="mt-0.5 text-yellow-600 mr-3">⚠️</div>
      <div>
        <div className="text-xs font-semibold text-yellow-600 mb-0.5">Approval Log (Auto-Skipped)</div>
        <div className="text-sm text-gray-300">Agent requested write to <span className="font-mono text-gray-400 bg-gray-900 px-1 rounded">{normalizeFilePath(data.filepath)}</span></div>
      </div>
    </div>
  );
}

function JobStatusEntry({ type, data }: { type: string, data: any }) {
  if (type === "job_completed") {
    return <div className="mb-6 text-sm font-semibold text-green-500 flex items-center"><span className="mr-2">✓</span> Job Completed Successfully</div>;
  }
  if (type === "job_failed") {
    return <div className="mb-6 p-3 bg-red-900/10 border border-red-900/30 rounded text-sm text-red-400 font-mono break-words">{data.error}</div>;
  }
  return null;
}

export function EventTranscript({ events }: { events: StreamEvent[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const renderedItems = [];
  let currentSandboxOutputs: any[] = [];

  for (let i = 0; i < events.length; i++) {
    const evt = events[i];

    if (evt.type === "sandbox_output") {
      currentSandboxOutputs.push(evt.data);
      continue;
    }

    if (evt.type === "execution_result") {
      renderedItems.push(
        <div key={`exec-${i}`} className="mb-6">
          <ExecutionStatusChip data={evt.data} />
          <UnifiedTerminal 
            stdout={evt.data.stdout} 
            stderr={evt.data.stderr} 
            sandboxOutputs={currentSandboxOutputs} 
          />
        </div>
      );
      currentSandboxOutputs = [];
      continue;
    }

    if (currentSandboxOutputs.length > 0) {
      renderedItems.push(
        <div key={`term-${i}`} className="mb-6">
          <UnifiedTerminal sandboxOutputs={currentSandboxOutputs} />
        </div>
      );
      currentSandboxOutputs = [];
    }

    switch (evt.type) {
      case "agent_turn":
        renderedItems.push(<AgentTurnEntry key={i} data={evt.data} />);
        break;
      case "tool_result":
        renderedItems.push(<ToolResultEntry key={i} data={evt.data} />);
        break;
      case "approval_required":
        renderedItems.push(<ApprovalLogEntry key={i} data={evt.data} />);
        break;
      case "job_completed":
      case "job_failed":
        renderedItems.push(<JobStatusEntry key={i} type={evt.type} data={evt.data} />);
        break;
    }
  }

  if (currentSandboxOutputs.length > 0) {
    renderedItems.push(
      <div key="term-final" className="mb-6">
        <UnifiedTerminal sandboxOutputs={currentSandboxOutputs} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-smooth" ref={scrollRef}>
      {events.length === 0 ? (
        <div className="text-gray-500 text-sm h-full flex flex-col items-center justify-center">
          <div className="text-4xl mb-4 opacity-20">⚡</div>
          Waiting for execution to start...
        </div>
      ) : (
        <div className="max-w-4xl mx-auto pb-8">
          {renderedItems}
        </div>
      )}
    </div>
  );
}
