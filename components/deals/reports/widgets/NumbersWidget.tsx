"use client";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function NumbersWidget() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="text-6xl font-semibold tracking-tight">$0</div>
      <Button className="rounded-md bg-teal-700 hover:bg-teal-700/90">
        Sum <ChevronDown className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}
