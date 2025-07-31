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
  User,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react"; // Import useEffect

// Assuming you have these Tabler icons installed or replace with Lucide equivalents if not
import { IconDashboard, IconMessage, IconTemplate } from "@tabler/icons-react";
import { supabase } from "@/lib/supabase/client";

export const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  // messageLimit prop is no longer needed as it's fetched internally
}) => {
  const pathname = usePathname();
  const [totalMessages, setTotalMessages] = useState(0); // State for messages used
  const [messageLimit, setMessageLimit] = useState(5); // State for message limit (default to free tier)
  const [currentPlan, setCurrentPlan] = useState("free"); // State for user's plan

  // Fetch user's message usage and plan on component mount or auth state change
  useEffect(() => {
    const fetchUsageData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select(
            "current_plan, messages_used_this_month, messages_limit_per_month"
          )
          .eq("id", user.id)
          .single();

        if (profile && !error) {
          setCurrentPlan(profile.current_plan);
          setTotalMessages(profile.messages_used_this_month);
          // If Pro, set a very high limit or a specific 'unlimited' indicator
          setMessageLimit(
            profile.current_plan === "pro"
              ? 999999
              : profile.messages_limit_per_month
          );
        } else {
          console.error(
            "Error fetching user profile for sidebar usage:",
            error?.message
          );
          // Fallback to default free tier if profile fetch fails
          setCurrentPlan("free");
          setTotalMessages(0);
          setMessageLimit(5);
        }
      } else {
        // If no user is logged in, show default free tier limits
        setCurrentPlan("free");
        setTotalMessages(0);
        setMessageLimit(5);
      }
    };

    fetchUsageData();

    // Listen for auth state changes to update usage dynamically
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUsageData(); // Re-fetch data whenever auth state changes
    });

    return () => {
      subscription.unsubscribe(); // Clean up the listener
    };
  }, []); // Empty dependency array means this runs once on mount and on auth state changes

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);
    // Optionally redirect to login or home page after sign out
    // router.push('/login');
  };

  // Calculate usage percentage (handle division by zero for unlimited/pro plans)
  const usagePercentage =
    messageLimit === 0 || currentPlan === "pro"
      ? 0 // Or 100 if you want to show full for unlimited
      : (totalMessages / messageLimit) * 100;

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 rounded-r-xl`}
    >
      {/* Logo and Close Button */}
      <div className="flex-shrink-0 flex items-center justify-between h-16 px-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center space-x-3">
          {/* Updated logo gradient to match brand colors */}
          <div className="text-xl font-semibold text-gray-900">ColdDM.AI</div>
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
          <Button
            className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-full py-3 px-4 flex items-center justify-center space-x-2 font-semibold transition-all duration-200 transform hover:scale-105 shadow-md" // Updated to match landing page button style
          >
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
              ? "bg-gray-100 text-gray-900 font-semibold" // Updated active link colors for a more subtle look
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          } transition-colors`}
          onClick={() => setSidebarOpen(false)}
        >
          <IconDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/dashboard/messages" // Assuming this path for all generated messages
          passHref
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg ${
            pathname === "/dashboard/messages"
              ? "bg-gray-100 text-gray-900 font-semibold" // Updated active link colors
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          } transition-colors`}
          onClick={() => setSidebarOpen(false)}
        >
          <IconMessage className="w-5 h-5" />
          <span>My Messages</span>
        </Link>

        <Link
          href="/dashboard/templates" // Assuming this path for saved templates
          passHref
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg ${
            pathname === "/dashboard/templates"
              ? "bg-gray-100 text-gray-900 font-semibold" // Updated active link colors
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          } transition-colors`}
          onClick={() => setSidebarOpen(false)}
        >
          <Bookmark className="w-5 h-5" />
          <span>Templates</span>
        </Link>

        {/* New: Link to General Feedback Section */}
        <Link
          href="/dashboard/feedback" // Path for the general feedback page
          passHref
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg ${
            pathname === "/dashboard/feedback"
              ? "bg-gray-100 text-gray-900 font-semibold" // Updated active link colors
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          } transition-colors`}
          onClick={() => setSidebarOpen(false)}
        >
          <Lightbulb className="w-5 h-5" />{" "}
          {/* Using Lucide's Lightbulb for feedback */}
          <span>Give Feedback</span>
        </Link>
      </nav>

      {/* Usage Stats */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Messages this month
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-gray-900 h-2 rounded-full" // Changed to solid gray-900 for consistency with landing page's progress bar aesthetic
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500">
          {currentPlan === "pro"
            ? `Unlimited messages used: ${totalMessages}` // For Pro users
            : `${totalMessages} of ${messageLimit} messages used`}
        </div>
        {currentPlan === "free" && totalMessages >= messageLimit && (
          <div className="mt-2 text-xs text-red-500 font-semibold">
            Limit reached!{" "}
            <Link
              href="/pricing/interested"
              className="underline hover:text-red-600"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0 p-6 border-t border-gray-100">
        <div className="space-y-2">
          <Link
            href="/dashboard/account"
            passHref
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
              pathname === "/dashboard/account"
                ? "bg-gray-100 text-gray-900 font-semibold" // Updated active link colors
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
