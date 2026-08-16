import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { SessionSidebar } from "./components/layout/SessionSidebar";
import type { Session } from "./components/layout/SessionSidebar";
import { FilePanel } from "./components/layout/FilePanel";
import { EventTranscript } from "./components/transcript/EventTranscript";
import { RepoPicker } from "./components/RepoPicker";
import { InstructionBar } from "./components/InstructionBar";
import { useJobStream } from "./hooks/useJobStream";
import { createJob } from "./api/jobs";

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // New session state
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  
  // Currently active job stream
  const { events, status: streamStatus } = useJobStream(activeSessionId);
  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleNewSessionClick = () => {
    setActiveSessionId(null);
    setIsCreatingNew(true);
    setSelectedRepo(null);
  };

  const handleSelectRepo = (repo: string) => {
    setSelectedRepo(repo);
  };

  const handleSubmitInstruction = async (instruction: string) => {
    if (!selectedRepo) return;
    try {
      const jobId = await createJob(selectedRepo, instruction, "session-1");
      
      const newSession: Session = {
        id: jobId,
        repoName: selectedRepo,
        instruction
      };
      
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(jobId);
      setIsCreatingNew(false);
    } catch (err) {
      console.error("Failed to start job", err);
      alert("Failed to start job. Check console.");
    }
  };

  const isStreamActive = streamStatus === "connecting" || streamStatus === "connected";

  const renderCenter = () => {
    if (isCreatingNew) {
      if (!selectedRepo) {
        return <RepoPicker onSelect={handleSelectRepo} />;
      }
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="text-xl mb-2 text-gray-300">Ready to start execution</div>
            <div>
              Target Repo: <span className="text-blue-400 font-mono ml-1 bg-gray-900 px-2 py-1 rounded">{selectedRepo}</span>
            </div>
          </div>
          <InstructionBar onSubmit={handleSubmitInstruction} disabled={false} />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b border-gray-800 bg-gray-900 flex items-center justify-between flex-shrink-0">
          <div className="flex-1 truncate mr-4">
            <span className="text-gray-500 text-sm mr-2">Instruction:</span>
            <span className="text-gray-300 font-medium">{activeSession?.instruction}</span>
          </div>
          <div className="flex items-center flex-shrink-0">
            {isStreamActive && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>}
            <span className="text-xs text-gray-500 uppercase">{streamStatus}</span>
          </div>
        </div>
        <EventTranscript events={events} />
        <InstructionBar onSubmit={() => {}} disabled={true} />
      </div>
    );
  }

  return (
    <AppShell
      sidebar={
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setIsCreatingNew(false);
          }}
          onNewSession={handleNewSessionClick}
        />
      }
      center={renderCenter()}
      rightPanel={
        <FilePanel repoName={isCreatingNew ? selectedRepo : activeSession?.repoName ?? null} />
      }
    />
  );
}
