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
  MessageSquare,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Mail,
  Linkedin,
  Twitter,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";
import CopyButton from "@/components/shared/copy-button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AllMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // To store the current user
  // State for Save Template Modal
  const [templateName, setTemplateName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [selectedMessageContent, setSelectedMessageContent] = useState(""); // Content of the specific message variant
  const [selectedMessageChannel, setSelectedMessageChannel] = useState(""); // Channel of the batch
  const [selectedMessageTone, setSelectedMessageTone] = useState(""); // Tone of the batch
  const [selectedMessageBatchId, setSelectedMessageBatchId] = useState(null);
  // New state to track which message contents have been saved as templates
  const [savedTemplateContents, setSavedTemplateContents] = useState(new Set());

  useEffect(() => {
    const fetchMessagesAndTemplates = async () => {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      setUser(user);

      if (userError || !user) {
        setError("You must be logged in to view your messages.");
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        // Fetch all generated messages for the current user, ordered by creation date
        const { data: fetchedMessages, error: fetchMessagesError } = await supabase
          .from("generated_messages")
          .select(
            "id, input_data, output_messages, channel, tone, created_at, feedback_rating"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchMessagesError) {
          throw new Error(fetchMessagesError.message || "Failed to fetch messages.");
        }

        setMessages(fetchedMessages || []);

        // Fetch all saved templates for the current user
        const { data: fetchedTemplates, error: fetchTemplatesError } = await supabase
          .from("saved_templates")
          .select("content")
          .eq("user_id", user.id);

        if (fetchTemplatesError) {
          console.error("Error fetching saved templates:", fetchTemplatesError);
          // Don't throw error here, just log, as messages can still be displayed
        } else {
          // Create a Set of saved message contents for quick lookup
          const contents = new Set(fetchedTemplates.map(template => template.content));
          setSavedTemplateContents(contents);
        }

      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessagesAndTemplates();
  }, [router]); // Re-fetch if router changes (e.g., after login/logout)

  // Function to open the save template modal
  const openSaveModal = (messageContent, messageEntry) => {
    if (!user) {
      toast.info("Login Required", {
        description: "Please log in to save templates.",
      });
      router.push("/login"); // Redirect to login
      return;
    }
    setSelectedMessageContent(messageContent);
    setSelectedMessageChannel(messageEntry.channel);
    setSelectedMessageTone(messageEntry.tone);
    setSelectedMessageBatchId(messageEntry.id);
    setTemplateName(""); // Reset template name
    setShowSaveModal(true);
  };

  // Function to handle saving the template
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setIsSavingTemplate(true);

    if (!user) {
      toast.error("Authentication Required", {
        description: "Please log in to save templates.",
      });
      setIsSavingTemplate(false);
      return;
    }
    if (!templateName.trim()) {
      toast.error("Template name is required.");
      setIsSavingTemplate(false);
      return;
    }

    try {
      const response = await fetch("/api/save-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id, // Pass user_id from the authenticated user
          name: templateName.trim(),
          content: selectedMessageContent, // Use the specific content
          channel: selectedMessageChannel, // Use the specific channel
          tone: selectedMessageTone, // Use the specific tone
          original_generated_message_id: selectedMessageBatchId, // Use the specific batch ID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save template.");
      } else {
        toast.success("Template Saved!", {
          description: `"${templateName}" has been added to your templates.`,
        });
        // Add the saved content to the set to disable the button immediately
        setSavedTemplateContents(prev => new Set(prev).add(selectedMessageContent));
        setShowSaveModal(false); // Close modal on success
      }
    } catch (err) {
      console.error("Unexpected error saving template:", err);
      toast.error("Save Error", {
        description:
          err.message ||
          "An unexpected error occurred while saving the template.",
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleFeedback = async (messageId, rating) => {
    if (!user) {
      toast.error("Please log in to submit feedback.");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("generated_messages")
        .update({ feedback_rating: rating })
        .eq("id", messageId)
        .eq("user_id", user.id); // Ensure user can only update their own messages

      if (updateError) {
        console.error("Error saving feedback:", updateError);
        toast.error("Failed to save feedback.");
      } else {
        // Optimistically update the UI to reflect the new feedback
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, feedback_rating: rating } : msg
          )
        );
        toast.success("Feedback submitted! Thank you.");
      }
    } catch (err) {
      console.error("Error during feedback submission:", err);
      toast.error("An unexpected error occurred while submitting feedback.");
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case "Email":
        return <Mail className="h-4 w-4 text-gray-600" />;
      case "LinkedIn":
        return <Linkedin className="h-4 w-4 text-gray-600" />;
      case "Twitter/X DM":
        return <Twitter className="h-4 w-4 text-gray-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-inter text-gray-900 antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto mt-20">
        <Card className="border border-gray-100 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              <MessageSquare className="w-7 h-7 text-gray-700" />
              Your Messages History
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-1">
              Review all your AI-generated outreach messages.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-gray-900" />
                Loading your messages...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500 bg-red-50 border border-red-200 p-6 rounded-lg">
                <p className="font-semibold">Error loading messages:</p>
                <p>{error}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-4">
                  You haven't generated any messages yet!
                </p>
                <Link href="/generate" passHref>
                  <Button className="bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md">
                    Generate Your First Message{" "}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((messageEntry) => (
                  <Card
                    key={messageEntry.id}
                    className="p-6 rounded-xl shadow-sm border border-gray-200 bg-white"
                  >
                    <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(messageEntry.channel)}
                        <CardTitle className="text-xl font-semibold text-gray-800">
                          {messageEntry.channel} Message
                        </CardTitle>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(messageEntry.created_at).toLocaleString()}
                      </span>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Display each variant of the generated message */}
                      {messageEntry.output_messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className="mb-4 last:mb-0 p-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            {msg.subject
                              ? `Subject: ${msg.subject}`
                              : `Variant ${idx + 1}`}
                          </p>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                            {msg.content}
                          </p>
                          <div className="flex flex-wrap gap-2"> {/* Use flex-wrap for responsiveness */}
                            <CopyButton
                              textToCopy={msg.content}
                              label="Message"
                              size="sm"
                            />
                            {!savedTemplateContents.has(msg.content) && (<Button
                              size="sm"
                              variant="outline"
                              className="rounded-full border-gray-300 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 text-gray-700 transition-colors"
                              onClick={() =>
                                openSaveModal(msg.content, messageEntry)
                              }
                              // Disable button if this specific message content is already saved
                              disabled={savedTemplateContents.has(msg.content)}
                            >
                              <Bookmark className="h-4 w-4 mr-2" />
                              Save
                            </Button>)}
                          </div>
                        </div>
                      ))}

                      {/* Feedback buttons - moved to the end of the message batch card */}
                      {messageEntry.feedback_rating === null && (
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button
                            variant="outline"
                            className={`rounded-full border-gray-200 transition-colors py-2 px-4 ${
                              messageEntry.feedback_rating === "positive"
                                ? "bg-green-100 border-green-400 text-green-700"
                                : "hover:bg-green-50 hover:border-green-400 text-gray-700 hover:text-green-700"
                            }`}
                            onClick={() =>
                              handleFeedback(messageEntry.id, "positive")
                            }
                            disabled={
                              messageEntry.feedback_rating === "positive" ||
                              messageEntry.feedback_rating === "negative"
                            }
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" /> Useful
                          </Button>
                          <Button
                            variant="outline"
                            className={`rounded-full border-gray-200 transition-colors py-2 px-4 ${
                              messageEntry.feedback_rating === "negative"
                                ? "bg-red-100 border-red-400 text-red-700"
                                : "hover:bg-red-50 hover:border-red-400 text-gray-700 hover:text-red-700"
                            }`}
                            onClick={() =>
                              handleFeedback(messageEntry.id, "negative")
                            }
                            disabled={
                              messageEntry.feedback_rating === "positive" ||
                              messageEntry.feedback_rating === "negative"
                            }
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" /> Not Useful
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-inter">
        <Card className="w-full max-w-md rounded-xl shadow-lg border border-gray-100 bg-white">
          <CardHeader className="border-b border-gray-100 px-6 py-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Save Template
            </CardTitle>
            <CardDescription className="text-gray-600">
              Give your new template a name.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Label htmlFor="templateName" className="text-gray-700">
              Template Name
            </Label>
            <Input
              id="templateName"
              type="text"
              placeholder="e.g., My Best LinkedIn Opener"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200"
              required
            />
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSaveModal(false)}
                disabled={isSavingTemplate}
                className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-100 px-6 py-2 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={isSavingTemplate || !templateName.trim()}
                className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {isSavingTemplate ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-2 h-4 w-4" /> Save
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
}
