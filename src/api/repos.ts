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

export async function getRepoFile(repoName: string, path: string): Promise<string> {
  const data = await fetchApi<{ content: string }>(`/repos/${repoName}/file?path=${encodeURIComponent(path)}`);
  return data.content;
}
