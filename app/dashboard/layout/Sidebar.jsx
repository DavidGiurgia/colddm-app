"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  MessageCircle, 
  Zap, 
  Users, 
  Star, 
  Settings, 
  LogOut, 
  PlusCircle,
  ArrowRight,
  LayoutDashboard,
  Lightbulb,
  Menu,
  X,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  messageLimit,
}) => {
  const pathname = usePathname();
  const [totalMessages, setTotalMessages] = useState(0); // Will store generated messages count
  const supabase = createClientComponentClient();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);
  };

  const usagePercentage = (totalMessages / messageLimit) * 100;

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      {/* Logo and Close Button */}
      <div className="flex-shrink-0 flex items-center justify-between h-16 px-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
            ColdDM.AI
          </h1>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 rounded-md hover:bg-gray-50"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Create New Message Button */}
      <div className="flex-shrink-0 p-6">
        <Link href="/generate" passHref>
          <Button className="w-full bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-full py-3 px-4 flex items-center justify-center space-x-2 font-semibold hover:from-red-600 hover:to-purple-700 transition-all duration-200 shadow hover:shadow-md">
            <PlusCircle className="w-5 h-5" />
            <span>New Message</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-6 space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
          Navigation
        </div>

        <Link
          href="/dashboard"
          passHref
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg ${
            pathname === "/dashboard"
              ? "bg-red-50 text-red-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          } transition-colors`}
          onClick={() => setSidebarOpen(false)}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/dashboard/messages"
          passHref
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg ${
            pathname === "/dashboard/messages"
              ? "bg-red-50 text-red-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          } transition-colors`}
          onClick={() => setSidebarOpen(false)}
        >
          <MessageCircle className="w-5 h-5" />
          <span>My Messages</span>
        </Link>

        <Link
          href="/dashboard/templates"
          passHref
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg ${
            pathname === "/dashboard/templates"
              ? "bg-red-50 text-red-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          } transition-colors`}
          onClick={() => setSidebarOpen(false)}
        >
          <Lightbulb className="w-5 h-5" />
          <span>Templates</span>
        </Link>

        <Link
          href="/dashboard/contacts"
          passHref
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg ${
            pathname === "/dashboard/contacts"
              ? "bg-red-50 text-red-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          } transition-colors`}
          onClick={() => setSidebarOpen(false)}
        >
          <Users className="w-5 h-5" />
          <span>My Contacts</span>
        </Link>
      </nav>

      {/* Usage Stats */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Messages this month
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-red-500 to-purple-600 h-2 rounded-full" 
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500">
          {totalMessages} of {messageLimit} messages used
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0 p-6 border-t border-gray-100">
        <div className="space-y-2">
          <Link
            href="/dashboard/account"
            passHref
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
              pathname === "/dashboard/account"
                ? "bg-red-50 text-red-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } transition-colors`}
            onClick={() => setSidebarOpen(false)}
          >
            <User className="w-5 h-5" />
            <span>Account</span>
          </Link>

          <button
            onClick={signOut}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};