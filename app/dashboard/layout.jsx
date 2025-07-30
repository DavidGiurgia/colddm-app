"use client";

import React, { useState } from "react";
import { Sidebar } from "./layout/Sidebar";
import Topbar from "./layout/Topbar";
import AuthProvider from "@/lib/providers/AuthProvider";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="lg:ml-64">
        <Topbar setSidebarOpen={setSidebarOpen} />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
    </AuthProvider>
  );
};

export default DashboardLayout;