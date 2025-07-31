"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  MessageSquareText,
  Target,
  Package,
  Zap,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Bookmark,
  Mail,
  Music2,
  Linkedin,
  Twitter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client"; // Assuming this correctly points to your Supabase client
import { toast } from "sonner";
import CopyButton from "@/components/shared/copy-button";

export default function GeneratePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    recipient: "",
    goal: "",
    product: "",
    channel: "",
    tone: "",
    userContext: "",
  });

  const [generatedMessages, setGeneratedMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [messagesLimit, setMessagesLimit] = useState(0);
  const [generatedMessageDbId, setGeneratedMessageDbId] = useState(null); // DB ID of the generated message batch
  const [user, setUser] = useState(null);
  const [savedTemplateContents, setSavedTemplateContents] = useState(new Set());

  // State for Save Template Modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Fetch initial user usage data on component mount
  useEffect(() => {
    const fetchUsage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user); // Set user session
      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("messages_used_this_month, messages_limit_per_month")
          .eq("id", user.id)
          .single();

        if (profile && !error) {
          setMessagesUsed(profile.messages_used_this_month);
          setMessagesLimit(profile.messages_limit_per_month);
        } else {
          console.error(
            "Error fetching initial profile usage:",
            error?.message
          );
          // Handle case where profile might not exist or error occurs
          // For MVP, default to free tier limits
          setMessagesUsed(0);
          setMessagesLimit(5); // Default free limit if profile fetch fails
        }
      } else {
        // If no user, assume free tier limits for display
        setMessagesUsed(0);
        setMessagesLimit(5);
      }

      const { data: fetchedTemplates, error: fetchTemplatesError } =
        await supabase
          .from("saved_templates")
          .select("content")
          .eq("user_id", user.id);

      if (fetchTemplatesError) {
        console.error("Error fetching saved templates:", fetchTemplatesError);
        // Don't throw error here, just log, as messages can still be displayed
      } else {
        // Create a Set of saved message contents for quick lookup
        const contents = new Set(
          fetchedTemplates.map((template) => template.content)
        );
        setSavedTemplateContents(contents);
      }
    };

    fetchUsage();
  }, []); // Run once on component mount

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedMessages([]); // Clear previous messages
    setGeneratedMessageDbId(null); // Reset DB ID

    try {
      const response = await fetch("/api/generate-dm", {
        // Make sure this path is correct
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError(
            data.message || "You have exceeded your message generation limit."
          );
          router.push("/pricing/interested"); // Redirect to pricing page
        } else if (response.status === 401) {
          setError(data.message || "Please log in to generate messages.");
          router.push("/login"); // Redirect to login page
        } else {
          throw new Error(
            data.message || "Failed to generate messages. Please try again."
          );
        }
      } else {
        setGeneratedMessages(data.messages);
        setMessagesUsed(data.currentUsage);
        setMessagesLimit(data.limit);
        setGeneratedMessageDbId(data.generatedMessageId); // Store the DB ID for feedback
      }
    } catch (err) {
      setError(err.message);
      console.error("Frontend error during message generation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to open the save template modal
  const openSaveModal = () => {
    if (!user) {
      toast.info("Login Required", {
        description: "Please log in to save templates.",
      });
      //router.push("/login");
      return;
    }
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
        // Call the new API route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName.trim(),
          content: formData.product,
          channel: formData.channel, // Use channel from current form data
          tone: formData.tone, // Use tone from current form data
          originalGeneratedMessageId: generatedMessageDbId, // Link to the original generation batch
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save template.");
      } else {
        toast.success("Template Saved!", {
          description: `"${templateName}" has been added to your templates.`,
        });
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

  const handleFeedback = async (rating) => {
    if (!user) {
      toast.error("Please log in to submit feedback.");
      return;
    }

    if (!generatedMessageDbId) {
      toast.error("No message to submit feedback for.");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("generated_messages")
        .update({ feedback_rating: rating })
        .eq("id", generatedMessageDbId)
        .eq("user_id", user.id); // Ensure user can only update their own messages

      if (updateError) {
        console.error("Error saving feedback:", updateError);
        toast.error("Failed to save feedback.");
      } else {
        // Optimistically update the UI to reflect the new feedback
        setGeneratedMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === generatedMessageDbId
              ? { ...msg, feedback_rating: rating }
              : msg
          )
        );
        toast.success("Feedback submitted! Thank you.");
      }
    } catch (err) {
      console.error("Error during feedback submission:", err);
      toast.error("An unexpected error occurred while submitting feedback.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-inter text-gray-900 antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mt-20">
        <Card className="border border-gray-100 shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                Craft Your Perfect Outreach Message
              </CardTitle>
              <p className="text-lg text-gray-600 max-w-lg mx-auto">
                Tell our AI a few details, and get messages that actually get
                replies.
              </p>
            </div>

            {/* Display usage count for free users */}
            {messagesLimit > 0 && messagesUsed < messagesLimit && (
              <div className="text-center text-sm text-gray-600 mb-6">
                You have{" "}
                <span className="font-semibold text-gray-900">
                  {" "}
                  {/* Changed color to gray-900 */}
                  {messagesLimit - messagesUsed}
                </span>{" "}
                messages remaining this month.
              </div>
            )}
            {messagesUsed >= messagesLimit && messagesLimit > 0 && (
              <div className="text-center text-sm text-red-500 font-semibold mb-6">
                You have used all your free messages this month. Please upgrade
                to Pro for unlimited access!
                <Button
                  className="m-2 bg-gray-900 text-white hover:bg-gray-800 py-1 px-3 text-sm rounded-full" // Updated button style
                  onClick={() => router.push("/pricing/interested")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Type */}
              <div className="space-y-2">
                <Label
                  htmlFor="recipient"
                  className="flex items-center text-gray-700"
                >
                  <Target className="h-5 w-5 mr-2 text-gray-700" />{" "}
                  {/* Changed icon color to gray-700 */}
                  Who are you reaching out to?
                </Label>
                <Input
                  id="recipient"
                  placeholder="e.g., SaaS founder, marketing director"
                  value={formData.recipient}
                  onChange={handleChange}
                  className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200" // Added border and focus styles
                  required
                />
                <p className="text-sm text-gray-500">
                  Be specific for best results!
                </p>
              </div>

              {/* Desired Goal */}
              <div className="space-y-2">
                <Label
                  htmlFor="goal"
                  className="flex items-center text-gray-700"
                >
                  <Zap className="h-5 w-5 mr-2 text-gray-700" />{" "}
                  {/* Changed icon color to gray-700 */}
                  What's your desired outcome?
                </Label>
                <Input
                  id="goal"
                  placeholder="e.g., Get feedback, propose collaboration"
                  value={formData.goal}
                  onChange={handleChange}
                  className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200" // Added border and focus styles
                  required
                />
                <p className="text-sm text-gray-500">
                  What action do you want them to take?
                </p>
              </div>

              {/* Your Product/Service */}
              <div className="space-y-2">
                <Label
                  htmlFor="product"
                  className="flex items-center text-gray-700"
                >
                  <Package className="h-5 w-5 mr-2 text-gray-700" />{" "}
                  {/* Changed icon color to gray-700 */}
                  Tell us about your product/service
                </Label>
                <Textarea
                  id="product"
                  placeholder="Brief description with key benefits"
                  value={formData.product}
                  onChange={handleChange}
                  className="min-h-[100px] rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200" // Added border and focus styles
                  required
                />
              </div>

              {/* Communication Channel full width */}
              <div className="space-y-2">
                <Label
                  htmlFor="channel"
                  className="flex items-center text-gray-700"
                >
                  <Mail className="h-5 w-5 mr-2 text-gray-700" />{" "}
                  {/* Changed icon color to gray-700 */}
                  Communication channel
                </Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value) =>
                    handleSelectChange("channel", value)
                  }
                  required
                >
                  <SelectTrigger className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200 w-full">
                    {" "}
                    {/* Added border and focus styles */}
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="Email">
                      <Mail className="h-4 w-4 mr-2" /> Email
                    </SelectItem>
                    <SelectItem value="LinkedIn">
                      <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                    </SelectItem>
                    <SelectItem value="Twitter/X DM">
                      <Twitter className="h-4 w-4 mr-2" /> Twitter/X DM
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desired Tone */}
              <div className="space-y-2">
                <Label
                  htmlFor="tone"
                  className="flex items-center text-gray-700"
                >
                  <Music2 className="h-5 w-5 mr-2 text-gray-700" /> Message tone
                </Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value) => handleSelectChange("tone", value)}
                  required
                >
                  <SelectTrigger className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200 w-full">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Friendly">Friendly</SelectItem>
                    <SelectItem value="Concise">Concise</SelectItem>
                    <SelectItem value="Humorous">Humorous</SelectItem>
                    <SelectItem value="Empathetic">Empathetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Optional Context */}
              <div className="space-y-2">
                <Label
                  htmlFor="userContext"
                  className="flex items-center text-gray-700"
                >
                  <MessageSquareText className="h-5 w-5 mr-2 text-gray-700" />{" "}
                  {/* Changed icon color to gray-500 */}
                  Additional context (optional)
                </Label>
                <Textarea
                  id="userContext"
                  placeholder="e.g., We met at X event, I saw your post about Y"
                  value={formData.userContext}
                  onChange={handleChange}
                  className="min-h-[100px] rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200" // Added border and focus styles
                />
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md"
                  disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Messages <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg mt-4 text-center">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                </div>
              )}
            </form>

            {/* Generated Messages Display */}
            {generatedMessages.length > 0 && (
              <div className="mt-12 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                  Your AI-Generated Messages:
                </h2>
                {generatedMessages.map((msg, index) => (
                  <Card
                    key={index}
                    className="p-6 rounded-xl shadow-sm border border-gray-200 bg-white"
                  >
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-xl font-semibold text-gray-800">
                        {msg.subject
                          ? `Subject: ${msg.subject}`
                          : `Message Variant ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                        {msg.content}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <CopyButton
                          textToCopy={msg.content}
                          label="Message"
                          size="sm"
                        />
                        {!savedTemplateContents.has(msg.content) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full border-gray-300 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 text-gray-700 transition-colors"
                            onClick={() => openSaveModal(msg.content)}
                            // Disable button if this specific message content is already saved
                            disabled={savedTemplateContents.has(msg.content)}
                          >
                            <Bookmark className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-end w-fit space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full border-gray-200 transition-colors py-2 px-4 hover:bg-green-50 hover:border-green-400 text-gray-700 hover:text-green-700" // Updated button style
                    onClick={() => handleFeedback("positive")}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" /> Useful
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full border-gray-200 transition-colors py-2 px-4 hover:bg-red-50 hover:border-red-400 text-gray-700 hover:text-red-700" // Updated button style
                    onClick={() => handleFeedback("negative")}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" /> Not Useful
                  </Button>
                </div>
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
