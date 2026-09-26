"use client";
import { useState } from "react";
import { Icon } from "./icon";
import { useUi } from "./locale-provider";
export function CopyButton({ value, label }: { value: string; label?: string }) {
  const ui = useUi();
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  async function copy() { try { await navigator.clipboard.writeText(value); setStatus("done"); setTimeout(() => setStatus("idle"), 2200); } catch { setStatus("error"); } }
  return <span className="copy-wrap"><button type="button" className="copy-button" onClick={copy} aria-label={status === "done" ? ui.scanner.copied : (label ?? ui.scanner.copy)} title={label ?? ui.scanner.copy}><Icon name={status === "done" ? "check" : "copy"} size={15}/><span>{status === "done" ? ui.scanner.copied : (label ?? ui.scanner.copy)}</span></button>{status === "error" && <span className="inline-error" role="status">{ui.scanner.copyError}</span>}</span>;
}
