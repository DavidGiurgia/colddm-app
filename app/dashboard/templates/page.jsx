"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Copy,
  Loader2,
  MessageSquareText,
  Bookmark,
  ArrowRight,
  Pencil,
  Trash,
} from "lucide-react"; // Using Bookmark for templates
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client"; // Assuming this correctly points to your Supabase client
import Link from "next/link";
import CopyButton from "@/components/shared/copy-button";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // To store the current user

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be logged in to view your templates.");
        setIsLoading(false);
        // Optionally redirect to login if not logged in
        router.push("/login");
        return;
      }
      setUser(user);

      try {
        // Fetch all saved templates for the current user, ordered by creation date
        const { data, error: fetchError } = await supabase
          .from("saved_templates")
          .select("id, name, content, channel, tone, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }); // Show most recent first

        if (fetchError) {
          throw new Error(fetchError.message || "Failed to fetch templates.");
        }

        setTemplates(data || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching templates:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [router]); // Re-fetch if router changes (e.g., after login/logout)

  const copyToClipboard = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      console.log("Template copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      console.log("Failed to copy template.");
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="min-h-screen bg-white font-inter text-gray-900 antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto mt-20">
        <Card className="border border-gray-100 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 px-6 py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-7 h-7 text-gray-700" />{" "}
              {/* Changed icon color to gray-700 */}
              <CardTitle className="text-3xl font-bold text-gray-900">
                Your Saved Templates
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-gray-900" />{" "}
                {/* Changed loader color to gray-900 */}
                Loading your templates...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500 bg-red-50 border border-red-200 p-6 rounded-lg">
                <p className="font-semibold">Error loading templates:</p>
                <p>{error}</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-4">
                  You haven't saved any templates yet!
                </p>
                <p className="text-md mb-6">
                  Save your favorite AI-generated messages from the "Your
                  Messages History" page.
                </p>
                <Link href="/generate" passHref>
                  <Button className="bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md">
                    {" "}
                    {/* Updated button style to match landing page primary CTA */}
                    Generate New Message <ArrowRight className="ml-2 h-5 w-5" />{" "}
                    {/* Adjusted icon size */}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="p-6 rounded-xl shadow-sm border border-gray-200 bg-white"
                  >
                    <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bookmark className="h-5 w-5 text-gray-600" />{" "}
                        {/* Icon for individual template */}
                        <CardTitle className="text-xl font-semibold text-gray-800">
                          {template.name || "Untitled Template"}
                        </CardTitle>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(template.created_at).toLocaleString()}
                      </span>
                    </CardHeader>
                    <CardContent className="p-0 ">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Channel:{" "}
                        <span className="font-normal">{template.channel}</span>{" "}
                        | Tone:{" "}
                        <span className="font-normal">{template.tone}</span>
                      </p>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                        {template.content}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <CopyButton
                          textToCopy={template.content}
                          label="Template"
                          size="sm"
                        />
                        {/* <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-gray-200 hover:bg-gray-100 transition-colors text-sm py-2 px-4 text-gray-700 hover:text-gray-900"
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-gray-200 hover:bg-gray-100 transition-colors text-sm py-2 px-4 text-gray-700 hover:text-gray-900"
                        >
                          <Trash className="h-4 w-4 mr-2" /> Delete
                        </Button> */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
