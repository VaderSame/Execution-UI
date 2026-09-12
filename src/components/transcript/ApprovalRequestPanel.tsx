import { useState } from "react";
import { approveJob } from "../../api/jobs";
import { normalizeFilePath } from "../../utils/formatters";

export function ApprovalRequestPanel({ data, jobId }: { data: any, jobId: string | null }) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolved, setResolved] = useState<boolean | null>(null); // true = approved, false = rejected

  const handleDecision = async (approved: boolean) => {
    if (!jobId) return;
    setIsSubmitting(true);
    try {
      await approveJob(jobId, approved, feedback);
      setResolved(approved);
    } catch (err) {
      console.error("Failed to submit approval", err);
      alert("Failed to submit decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (resolved !== null) {
    return (
      <div className={`mb-6 p-3 rounded flex items-start ${resolved ? "bg-green-900/10 border border-green-900/30" : "bg-red-900/10 border border-red-900/30"}`}>
        <div className={`mt-0.5 mr-3 ${resolved ? "text-green-500" : "text-red-500"}`}>
          {resolved ? "✓" : "✗"}
        </div>
        <div>
          <div className={`text-xs font-semibold mb-0.5 ${resolved ? "text-green-500" : "text-red-500"}`}>
            {resolved ? "Approved" : "Rejected"}
          </div>
          <div className="text-sm text-gray-300">
            Write to <span className="font-mono text-gray-400 bg-gray-900 px-1 rounded">{normalizeFilePath(data.filepath)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 border border-yellow-900/50 rounded overflow-hidden shadow-lg shadow-yellow-900/10">
      <div className="bg-yellow-900/20 px-3 py-2 border-b border-yellow-900/30 flex items-center">
        <span className="text-yellow-500 mr-2">⚠️</span>
        <span className="text-sm font-semibold text-yellow-500">Approval Required</span>
      </div>
      
      <div className="p-4 bg-gray-900/50">
        <p className="text-sm text-gray-300 mb-3">
          Agent requested to write to <span className="font-mono text-blue-400 bg-gray-950 px-1 py-0.5 rounded border border-gray-800">{normalizeFilePath(data.filepath)}</span>
        </p>
        
        <div className="mb-4 max-h-64 overflow-y-auto bg-[#0a0a0f] border border-gray-800 rounded p-3 text-xs font-mono text-gray-300 whitespace-pre-wrap">
          {data.content}
        </div>
        
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-400 mb-1">Feedback (Optional)</label>
          <textarea 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            rows={2}
            placeholder="e.g. Reject, please use a for-loop instead."
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => handleDecision(true)}
            disabled={isSubmitting || !jobId}
            className="flex-1 bg-green-600/80 hover:bg-green-500 text-white font-medium py-1.5 px-4 rounded transition-colors text-sm disabled:opacity-50"
          >
            Approve
          </button>
          <button 
            onClick={() => handleDecision(false)}
            disabled={isSubmitting || !jobId}
            className="flex-1 bg-red-600/80 hover:bg-red-500 text-white font-medium py-1.5 px-4 rounded transition-colors text-sm disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
