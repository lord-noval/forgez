"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareModal } from "./ShareModal";
import type { ShareData } from "@/lib/social-share";

interface ShareButtonProps {
  shareData: ShareData;
  variant?: "default" | "secondary" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function ShareButton({
  shareData,
  variant = "secondary",
  size = "default",
  className,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      <ShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        shareData={shareData}
      />
    </>
  );
}
