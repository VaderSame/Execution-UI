import { useEffect, useState } from "react";
import { listRepos } from "../api/repos";

interface Props {
  onSelect: (repoName: string) => void;
}

export function RepoPicker({ onSelect }: Props) {
  const [repos, setRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRepos()
      .then(setRepos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-lg max-w-md w-full shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Select a Repository</h2>
        <p className="text-sm text-gray-400 mb-6">Choose a repository to begin an execution session.</p>
        
        {loading ? (
          <div className="text-gray-500">Loading repositories...</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {repos.length === 0 ? (
              <div className="text-gray-500 text-sm">No repositories found in code_repo/</div>
            ) : (
              repos.map((repo) => (
                <button
                  key={repo}
                  onClick={() => onSelect(repo)}
                  className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors text-gray-200"
                >
                  {repo}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
