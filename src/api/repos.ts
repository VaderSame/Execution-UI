import { fetchApi } from "./client";
import type { RepoNode } from "./types";

export async function listRepos(): Promise<string[]> {
  const data = await fetchApi<{ repos: string[] }>("/repos");
  return data.repos;
}

export async function getRepoTree(repoName: string): Promise<RepoNode[]> {
  const data = await fetchApi<{ tree: RepoNode[] }>(`/repos/${repoName}/tree`);
  return data.tree;
}

export async function createRepoSnapshot(repoName: string): Promise<boolean> {
  const data = await fetchApi<{ status: string }>(`/repos/${encodeURIComponent(repoName)}/snapshot`, {
    method: "POST"
  });
  return data.status === "success";
}

export async function getRepoFile(repoName: string, path: string): Promise<{ content: string, original_content: string | null }> {
  const data = await fetchApi<{ content: string, original_content: string | null }>(`/repos/${repoName}/file?path=${encodeURIComponent(path)}`);
  return data;
}

export async function updateRepoFile(repoName: string, path: string, content: string): Promise<boolean> {
  const data = await fetchApi<{ status: string }>(`/repos/${encodeURIComponent(repoName)}/file?path=${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  return data.status === "success";
}
