"use client";
import React from "react";
import { CheckCircle, Zap, Users, MessageCircle } from "lucide-react";
import Link from "next/link";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white font-inter text-gray-900 antialiased">
      

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Branding (matches landing style) */}
        <div className="lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12 xl:p-16">
          <div className="max-w-md mx-auto h-full flex flex-col justify-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-gray-900">
                  Stop getting <span className="text-red-500">ignored</span>.
                  <br />
                  Start getting <span className="text-green-600">replies</span>.
                </h1>
                <p className="text-lg text-gray-600">
                  The AI that writes cold messages so good, people actually want
                  to respond.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Optimized for replies
                    </h3>
                    <p className="text-gray-600">
                      Messages crafted using proven psychology principles
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Used by founders worldwide
                    </h3>
                    <p className="text-gray-600">
                      Trusted by indie hackers and SaaS builders
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Zap className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Lightning fast
                    </h3>
                    <p className="text-gray-600">
                      Generate perfect messages in seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
