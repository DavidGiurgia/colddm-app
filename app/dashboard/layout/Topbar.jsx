"use client";
import { Menu, Bell, Settings, User } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Topbar = ({ setSidebarOpen }) => {
  return (
    <div className="md:hidden bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden hover:bg-gray-50"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="text-xl font-semibold text-gray-900">ColdDM.AI</div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* <Button variant="ghost" size="icon" className="hover:bg-gray-50">
            <Bell className="w-5 h-5 text-gray-600" />
          </Button> */}
          <Link href="/dashboard/account">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="hover:bg-gray-50"
            >
              <User className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
