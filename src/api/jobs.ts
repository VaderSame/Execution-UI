import { fetchApi } from "./client";

export interface CreateJobResponse {
  job_id: string;
}

export async function createJob(repoName: string, instruction: string, chatSessionId: string): Promise<string> {
  const formData = new FormData();
  formData.append("repo_name", repoName);
  formData.append("instruction", instruction);
  formData.append("chat_session_id", chatSessionId);

  const data = await fetchApi<CreateJobResponse>("/execution-jobs", {
    method: "POST",
    body: formData,
  });
  return data.job_id;
}

export async function approveJob(jobId: string, approved: boolean, feedback: string = ""): Promise<boolean> {
  const data = await fetchApi<{ status: string }>(`/execution-jobs/${encodeURIComponent(jobId)}/approval`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ approved, feedback }),
  });
  return data.status === "resumed";
}
