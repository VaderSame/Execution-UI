export interface AgentTurnEvent {
  node: string;
  content: string;
  tool_calls: any[];
}

export interface ToolResultEvent {
  tool_name: string;
  result: string;
}

export interface SandboxOutputEvent {
  stream: "stdout" | "stderr";
  chunk: string;
}

export interface ApprovalRequiredEvent {
  type: "approval_required";
  filepath: string;
  content: string;
}

export interface ExecutionResultEvent {
  success: boolean;
  exit_code: number;
  stdout: string;
  stderr: string;
  error?: string;
}

export interface JobCompletedEvent {}

export interface JobFailedEvent {
  error: string;
}

export type JobEventType = 
  | "agent_turn" 
  | "tool_result" 
  | "sandbox_output" 
  | "approval_required" 
  | "execution_result" 
  | "job_completed" 
  | "job_failed";

export interface StreamEvent {
  type: JobEventType;
  data: any;
}

export interface RepoNode {
  name: string;
  path: string;
  type: "directory" | "file";
  children?: RepoNode[];
}
