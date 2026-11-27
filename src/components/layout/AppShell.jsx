import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-[264px]">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-[1320px] px-4 pb-20 pt-6 sm:px-6 lg:px-10 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}