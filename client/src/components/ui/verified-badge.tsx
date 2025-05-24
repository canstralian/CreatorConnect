import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface VerifiedBadgeProps {
  className?: string;
  size?: "xs" | "sm" | "md";
}

export function VerifiedBadge({ className = "", size = "sm" }: VerifiedBadgeProps) {
  const sizeClasses = {
    xs: "text-[10px] px-1 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2 py-0.5",
  };

  return (
    <Badge
      variant="secondary"
      className={`text-white ${sizeClasses[size]} rounded-full flex items-center gap-0.5 ${className}`}
    >
      <CheckCircle className={size === "xs" ? "h-2 w-2" : "h-3 w-3"} />
      {size !== "xs" && "Verified"}
    </Badge>
  );
}
