"use client";

import React, { useState } from "react";
import { MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminSidebarContent } from "./AdminSidebar";
import Link from "next/link";
import Image from "next/image";

interface AdminMobileNavbarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const LogoImage = React.memo(() => (
  <Image
    className="w-auto h-8"
    src="/assets/logo22.png"
    alt="logo"
    width={600}
    height={600}
    priority
    unoptimized
  />
));
LogoImage.displayName = "LogoImage";

export const AdminMobileNavbar: React.FC<AdminMobileNavbarProps> = ({
  open,
  setOpen,
}) => {
  return (
    <Sheet open={open} onOpenChange={() => setOpen(!open)}>
      <SheetTrigger asChild>
        <MenuIcon className="h-5 w-5 cursor-pointer text-white" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 ">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <Link
          href="/"
          className="cursor-pointer flex items-center gap-3 px-5  pt-5 pb-0"
        >
          <div>
            <LogoImage />
          </div>
        </Link>
        <div>
          <AdminSidebarContent
            open={open}
            setOpen={setOpen}
            isCollapsed={false}
            isMobile={true}
            onToggleCollapse={() => undefined}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

//Default component props
// interface NavbarProps {
//   isCollapsed: boolean;
//   // onToggleCollapse: () => void
// }

export const AdminNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky bg-t-black border-b border-t-gray/30 top- z-50 w-full  ">
      <div className=" flex h-[63px] items-center justify-between px-4">
        <div className="flex items-center  w-full gap-2">
          <div className="md:hidden">
            <AdminMobileNavbar open={open} setOpen={setOpen} />
          </div>
          <Link href="/" className="cursor-pointer flex items-center gap-3">
            <div>
              <LogoImage />
            </div>
          </Link>
        </div>

        <div className="flex items-center pr-8 text-right gap-3 bg-t-black/70 px-4 py-1.5   shadow">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white leading-tight">
              demo@example.com
            </span>
            <span className="text-xs text-white/70 leading-tight">
              Admin
            </span>
          </div>
          <Image
            className="w-8 h-8 rounded-full object-cover"
            src="/assets/warrior.jpg"
            alt="avatar"
            width={32}
            height={32}
          />
        </div>
      </div>
    </header>
  );
};
