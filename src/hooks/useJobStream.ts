import { useState, useEffect } from "react";
import type { StreamEvent } from "../api/types";
import { API_BASE } from "../api/client";

export function useJobStream(jobId: string | null) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "disconnected">("idle");

  useEffect(() => {
    if (!jobId) {
      setEvents([]);
      setStatus("idle");
      return;
    }

    setStatus("connecting");
    setEvents([]);
    const eventSource = new EventSource(`${API_BASE}/execution-jobs/${jobId}/stream`);

    eventSource.onopen = () => {
      setStatus("connected");
    };

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((prev) => [...prev, data]);
        if (data.type === "job_completed" || data.type === "job_failed") {
          eventSource.close();
          setStatus("disconnected");
        }
      } catch (err) {
        console.error("Failed to parse event", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setStatus("disconnected");
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  return { events, status };
}
