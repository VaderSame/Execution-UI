

export interface Session {
  id: string;
  repoName: string;
  instruction: string;
}

interface Props {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export function SessionSidebar({ sessions, activeSessionId, onSelectSession, onNewSession }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={onNewSession}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors shadow-sm"
        >
          New Session
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.length === 0 ? (
          <div className="text-gray-500 text-sm p-2 text-center mt-4">No recent sessions</div>
        ) : (
          sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`w-full text-left p-3 rounded transition-colors border ${
                activeSessionId === s.id ? "bg-gray-800 border-gray-700" : "border-transparent hover:bg-gray-800/50"
              }`}
            >
              <div className="font-medium text-sm text-gray-200 truncate">{s.repoName}</div>
              <div className="text-xs text-gray-400 truncate mt-1">{s.instruction}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
