import { useState, useRef, useEffect } from "react";

export function AppShell({
  sidebar,
  center,
  rightPanel,
  isRightExpanded = false,
}: {
  sidebar: React.ReactNode;
  center: React.ReactNode;
  rightPanel: React.ReactNode;
  isRightExpanded?: boolean;
}) {
  const [rightWidth, setRightWidth] = useState(320);
  const isDragging = useRef(false);

  useEffect(() => {
    if (isRightExpanded) {
      setRightWidth(Math.max(600, document.body.clientWidth * 0.4));
    } else {
      setRightWidth(320);
    }
  }, [isRightExpanded]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = document.body.clientWidth - e.clientX;
      // Prevent making it too small or too large
      setRightWidth(Math.max(200, Math.min(newWidth, document.body.clientWidth - 400)));
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-100 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
        {sidebar}
      </div>

      {/* Center Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-950">
        {center}
      </div>

      {/* Resizer */}
      <div 
        className="w-1 cursor-col-resize hover:bg-blue-500 bg-gray-800 z-10 transition-colors"
        onMouseDown={(e) => {
          e.preventDefault();
          isDragging.current = true;
          document.body.style.cursor = "col-resize";
        }}
      />

      {/* Right Sidebar */}
      <div 
        className="flex-shrink-0 bg-gray-900 flex flex-col"
        style={{ width: rightWidth }}
      >
        {rightPanel}
      </div>
    </div>
  );
}
