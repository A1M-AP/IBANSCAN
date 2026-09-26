import { ArrowRight, ScanLine, Building2, Globe2, Sparkles, Layers3, TextCursorInput, Code2, Landmark, MapPin, ListChecks, FileSpreadsheet, ShieldCheck, Check, X, Copy, RotateCcw, Moon, Sun, Menu, LockKeyhole, ChevronDown, ExternalLink, Upload, Download, Share2, Clipboard, Info, ArrowUpRight, Zap, Terminal, Loader2 } from "lucide-react";
const icons = { arrow: ArrowRight, scan: ScanLine, building: Building2, globe: Globe2, sparkles: Sparkles, layers: Layers3, text: TextCursorInput, code: Code2, landmark: Landmark, map: MapPin, list: ListChecks, file: FileSpreadsheet, shield: ShieldCheck, check: Check, x: X, copy: Copy, reset: RotateCcw, moon: Moon, sun: Sun, menu: Menu, lock: LockKeyhole, chevron: ChevronDown, external: ExternalLink, upload: Upload, download: Download, share: Share2, clipboard: Clipboard, info: Info, upRight: ArrowUpRight, zap: Zap, terminal: Terminal, loading: Loader2 };
export function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  const Component = icons[name as keyof typeof icons] ?? ScanLine;
  return <Component size={size} strokeWidth={1.7} aria-hidden="true" className={className} />;
}
