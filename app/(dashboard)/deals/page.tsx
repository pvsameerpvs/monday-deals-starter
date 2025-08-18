"use client";

import { DealsTabs } from "@/components/deals/deals-tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  MoreHorizontal,
  Download,
  Plug,
  Bot,
  MessageCircle,
  Link2,
} from "lucide-react";

export default function DealsPage() {
  return (
    <section className="space-y-3 font-normal min-w-0">
      <div className="space-y-3 px-3 min-w-0">
        {/* Header row (compact + thin) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Title + caret */}
          <div className="flex items-center gap-1.5">
            <h1 className="text-[18px] font-bold tracking-tight">Deals</h1>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </div>

          {/* Right: actions (thin) */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              className="h-8 gap-1.5 px-2 text-[13px] font-normal"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Import</span>
            </Button>

            <Button
              variant="ghost"
              className="h-8 gap-1.5 px-2 text-[13px] font-normal"
            >
              <Plug className="h-3.5 w-3.5" />
              <span>Integrate</span>
            </Button>

            <Button
              variant="ghost"
              className="h-8 gap-1.5 px-2 text-[13px] font-normal"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Automate</span>
              <span className="text-[10px] opacity-70">/</span>
              <Badge
                variant="secondary"
                className="h-4 rounded px-1 text-[9px] font-normal"
              >
                9
              </Badge>
            </Button>

            <Button variant="ghost" className="h-8 px-1.5 font-normal">
              <MessageCircle className="h-3.5 w-3.5" />
            </Button>

            <Avatar className="h-7 w-7">
              <AvatarImage alt="@ajmal" />
              <AvatarFallback className="bg-purple-500 text-white text-[11px]">
                SP
              </AvatarFallback>
            </Avatar>

            <div className="flex overflow-hidden rounded-md border">
              <Button
                variant="ghost"
                className="h-8 rounded-none px-2 text-[13px] font-normal"
              >
                Invite <span className="mx-1">/</span> 1
              </Button>
              <Button
                variant="ghost"
                className="h-8 rounded-none border-l px-1.5 font-normal"
                aria-label="Copy link"
              >
                <Link2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              variant="ghost"
              className="h-8 px-1.5 font-normal"
              aria-label="More"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Tabs below */}
        <DealsTabs />
      </div>
    </section>
  );
}
