import { useEffect } from "react";
import { toast } from "sonner";

const DRM_MESSAGE = `⚠️ IP PROTECTED CONTENT

This product is intellectual property protected by IBATUR Education CC. You have agreed to the Terms & Conditions upon purchase.

Screenshots, copying, screen recording, and any form of content duplication is strictly prohibited.

For queries, contact IBATUR Education:
📞 +27 83 332 9584
📧 info@ibatur.co.za`;

const DRMProtection = () => {
  useEffect(() => {
    // Prevent copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error(DRM_MESSAGE);
    };

    // Prevent cut
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error(DRM_MESSAGE);
    };

    // Prevent context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error(DRM_MESSAGE);
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C, Ctrl+X, Ctrl+P, Ctrl+S, PrintScreen
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "x" || e.key === "p" || e.key === "s" || e.key === "u")) ||
        (e.metaKey && (e.key === "c" || e.key === "x" || e.key === "p" || e.key === "s" || e.key === "u")) ||
        e.key === "PrintScreen" ||
        e.key === "F12"
      ) {
        e.preventDefault();
        toast.error(DRM_MESSAGE);
      }
    };

    // Prevent drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Prevent select all
    const handleSelectStart = (e: Event) => {
      // Allow selection in input/textarea elements
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      e.preventDefault();
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("selectstart", handleSelectStart);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("selectstart", handleSelectStart);
    };
  }, []);

  return null;
};

export default DRMProtection;
