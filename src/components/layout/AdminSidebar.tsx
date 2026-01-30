"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
// import { sidebarRoutes, type SidebarRoute } from "@/dummy/constant.data";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, MenuIcon } from "lucide-react";
import { SIDEBAR_ROUTES } from "@/lib/config";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
// import { useAuthStore } from "@/store/authStore";
// import { LogoIcon } from "./icons/icons"
// import Image from "next/image"

interface SidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    isMobile?: boolean;
}

interface SidebarItemProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    route: (typeof SIDEBAR_ROUTES)[number];
    isCollapsed: boolean;
    isMobile?: boolean;
    level?: number;
}

export const AdminSidebarItem: React.FC<SidebarItemProps> = ({
    open,
    setOpen,
    route,
    isCollapsed,
    isMobile = false,
    level = 0,
}) => {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = false;
    const isActive = pathname === route.path;
    // const Icon = null;

    const handleClick = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };

    const itemContent = (
        <div
            className={cn(
                "flex gap-1 p-2 items-center hover:bg-t-green hover:text-t-black text-t-gray ",
                isActive && "bg-t-green text-t-black  ",
                !isActive && "text-gray-400",
                level > 0 && "",
                isCollapsed && !isMobile && "justify-center flex-col text-xs"
            )}
        >
            <span>{route.icon && <route.icon size={route.iconSize as any || "16"} />}</span>
            {(!isCollapsed || isMobile) && (
                <span className="px-2">{route.title}</span>
            )}
        </div>
    );

    const wrappedContent = isCollapsed && !isMobile ? (
        <Tooltip>
            <TooltipTrigger asChild>
                {itemContent}
            </TooltipTrigger>
            <TooltipContent  side="right" className="bg-t-green mx-2  text-t-white">
                {route.title}
            </TooltipContent>
        </Tooltip>
    ) : (
        itemContent
    );

    if (hasChildren) {
        const parentContent = (
            <div>
                <div onClick={handleClick} className="cursor-pointer">
                    {wrappedContent}
                </div>
                {isExpanded && (!isCollapsed || isMobile) && (
                    <div className="mt-1 space-y-1">
                        {SIDEBAR_ROUTES.map((child) => (
                            child && <AdminSidebarItem
                                open={open}
                                setOpen={setOpen}
                                key={child?.id}
                                route={child as (typeof SIDEBAR_ROUTES)[number]}
                                isCollapsed={isCollapsed}
                                isMobile={isMobile}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );

        return parentContent;
    }

    const linkContent = (
        <Link
            href={route?.path || ""}
            className="block"
            onClick={() => setOpen(false)}
        >
            {wrappedContent}
        </Link>
    );

    return linkContent;
};

export const AdminSidebarContent: React.FC<{
    open: boolean;
    setOpen: (open: boolean) => void;
    isCollapsed: boolean;
    isMobile?: boolean;
    onToggleCollapse: () => void;
}> = ({ open, setOpen, isCollapsed, isMobile = false, onToggleCollapse }) => {

    // Filter routes based on user role
    //   const filteredRoutes = SIDEBAR_ROUTES.filter((route) => {
    //     return true;
    //   });

    return (
        <div className="flex h-full flex-col  backdrop-blur-lg ">
            {/* Header */}
            {!isMobile && (
                <div
                    className={`flex  h-16  border-b border-t-gray/30 gap-3 items-center  ${!isCollapsed ? "px-6" : "justify-center"
                        } `}
                >
                    <div
                        onClick={onToggleCollapse}
                        className="p-0  hidden md:flex cursor-pointer"
                    >
                        <MenuIcon size={24} className="w-full  text-t-green " />
                    </div>
                    {!isCollapsed && <p className="text-white/80 ">Welcome</p>}
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4 ">
                {SIDEBAR_ROUTES.map((route) => (
                    <AdminSidebarItem
                        open={open}
                        setOpen={setOpen}
                        key={route?.id}
                        route={route}
                        isCollapsed={isCollapsed}
                        isMobile={isMobile}
                    />
                ))}
            </nav>
        </div>
    );
};

export const AdminSidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    isMobile = false,
    onToggleCollapse,
}) => {
    if (isMobile) {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <AdminSidebarContent
                        open={false}
                        setOpen={() => { }}
                        isCollapsed={false}
                        isMobile={true}
                        onToggleCollapse={onToggleCollapse}
                    />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div
            className={cn(
                "hidden md:flex h-full  bg-t-black flex-col border-r border-t-gray/30 transition-all duration-300",
                isCollapsed ? "w-16" : "w-56"
            )}
        >
            <AdminSidebarContent
                open={false}
                setOpen={() => undefined}
                isCollapsed={isCollapsed}
                isMobile={false}
                onToggleCollapse={onToggleCollapse}
            />
        </div>
    );
};
