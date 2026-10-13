import { Icon } from "./icon";
import { toolTone } from "@/lib/tools";

/** Minimal icon chip tinted by the tool's category. Decorative: the tool name is always next to it. */
export function ToolBadge({ icon, group, size = "md" }: { icon: string; group: string; size?: "md" | "lg" }) {
  return (
    <span className={`tool-badge tool-badge-${size}`} data-tone={toolTone(group)} aria-hidden="true">
      <Icon name={icon} size={size === "lg" ? 26 : 20} />
    </span>
  );
}
