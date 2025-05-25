
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PlatformSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlatformSelect?: (platform: string) => void;
}

const platforms = [
  "Betway",
  "1xBet", 
  "Hollywoodbets",
  "Supabets"
];

export const PlatformSelector = ({ open, onOpenChange, onPlatformSelect }: PlatformSelectorProps) => {
  const handlePlatformSelect = (platform: string) => {
    console.log(`Selected platform: ${platform}`);
    if (onPlatformSelect) {
      onPlatformSelect(platform);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-800">
            Select Platform
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 p-4">
          {platforms.map((platform) => (
            <Button
              key={platform}
              onClick={() => handlePlatformSelect(platform)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-medium transition-all duration-200"
            >
              {platform}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
