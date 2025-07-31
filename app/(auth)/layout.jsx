'use client';

import React from "react";
import { CheckCircle, Zap, Users, MessageCircle } from "lucide-react";
import Link from "next/link";

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-white font-inter text-gray-900 antialiased">
            <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 md:p-12">
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
};

export default AuthLayout;
