"use client"

import { ReactNode, useState } from "react";
import { cn } from "../lib/utils";

export default function Tabs({ tabs, className, children }: { tabs: string[], className?: string, children: ReactNode[] }) {
  if (tabs.length !== children.length) {
    throw new Error("Tabs and children length must be equal");
  }
  const [tab, setTab] = useState(0);
  const oneElementWidth = 100 / tabs.length;
  return (
    <>
      <div className={cn(`bg-[ rgb(43_140_238/1)]`, className)}>
        <div className="flex border-b border-slate-800 px-4 justify-between relative">
          <div style={{ width: oneElementWidth.toString() + "%", left: oneElementWidth * tab + "%" }} className="absolute transition-[left] bottom-0 h-0.75 bg-[rgb(43_140_238/1)] "></div>
          {tabs.map((t, i) => (
            <div className={cn("flex flex-col items-center justify-center pb-3.75 pt-4 flex-1 transition-all duration-200", i == tab ? "text-[rgb(43_140_238/1)] " : "text-white/80")} onClick={() => { setTab(i) }} key={i}>
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">{t}</p>
            </div>
          ))}
        </div>
      </div>
      {children[tab]}
    </>
  )
    ;
}
