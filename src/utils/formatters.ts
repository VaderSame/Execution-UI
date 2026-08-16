export function sanitizeLLMContent(content: string | undefined | null): string {
  if (!content) return "";
  
  // Strip trailing "ool_call>" or `<tool_call>`
  let cleaned = content.replace(/<?t?ool_call>?/g, "");
  cleaned = cleaned.replace(/<tool_call>/g, "");
  return cleaned.trim();
}

export function parseToolArgs(argsStr: string | Record<string, any> | undefined): Record<string, any> {
  if (!argsStr) return {};
  if (typeof argsStr === "object") return argsStr;
  
  try {
    return JSON.parse(argsStr);
  } catch (e) {
    return { raw: argsStr };
  }
}

export function normalizeFilePath(filepath: string | undefined): string {
  if (!filepath) return "";
  
  // Replace double backslashes and single backslashes with forward slashes
  let normalized = filepath.replace(/\\\\/g, "/").replace(/\\/g, "/");
  
  // Try to strip out absolute workspace paths
  const marker = "code_repo/";
  const idx = normalized.indexOf(marker);
  if (idx !== -1) {
    normalized = normalized.substring(idx + marker.length);
  } else {
    const parts = normalized.split("/");
    if (parts.length > 3) {
      normalized = parts.slice(-3).join("/");
    }
  }
  
  return normalized;
}

export function stripMarkdownFences(content: string | undefined): string {
  if (!content) return "";
  
  let cleaned = content.trim();
  if (cleaned.startsWith("```")) {
    const firstNewline = cleaned.indexOf("\n");
    if (firstNewline !== -1) {
      cleaned = cleaned.substring(firstNewline + 1);
    } else {
      cleaned = ""; 
    }
  }
  
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3).trim();
  }
  
  return cleaned;
}
