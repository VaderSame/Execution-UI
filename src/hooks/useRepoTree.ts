import { useState, useEffect } from "react";
import type { RepoNode } from "../api/types";
import { getRepoTree } from "../api/repos";

export function useRepoTree(repoName: string | null) {
  const [tree, setTree] = useState<RepoNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repoName) {
      setTree([]);
      return;
    }

    setLoading(true);
    setError(null);
    getRepoTree(repoName)
      .then(setTree)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [repoName]);

  return { tree, loading, error };
}
