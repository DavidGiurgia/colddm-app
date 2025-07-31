'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    ArrowRight,
    MessageSquareText,
    Target,
    Package,
    Zap,
    ArrowLeft,
    Loader2,
    Copy,
    ThumbsUp,
    ThumbsDown,
    Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client'; // Assuming this correctly points to your Supabase client

export default function GeneratePage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        recipient: "",
        goal: "",
        product: "",
        channel: "",
        tone: "",
        userContext: ""
    });

    const [generatedMessages, setGeneratedMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [messagesUsed, setMessagesUsed] = useState(0);
    const [messagesLimit, setMessagesLimit] = useState(0);
    const [generatedMessageDbId, setGeneratedMessageDbId] = useState(null); // New state to store the DB ID of the generated message batch

    // Fetch initial user usage data on component mount
    useEffect(() => {
        const fetchUsage = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('messages_used_this_month, messages_limit_per_month')
                    .eq('id', user.id)
                    .single();

                if (profile && !error) {
                    setMessagesUsed(profile.messages_used_this_month);
                    setMessagesLimit(profile.messages_limit_per_month);
                } else {
                    console.error("Error fetching initial profile usage:", error?.message);
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
        };

        fetchUsage();
    }, []); // Run once on component mount

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGeneratedMessages([]); // Clear previous messages
        setGeneratedMessageDbId(null); // Reset DB ID

        try {
            const response = await fetch("/api/generate-dm", { // Make sure this path is correct
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    setError(data.message || "You have exceeded your message generation limit.");
                    router.push("/pricing/interested"); // Redirect to pricing page
                } else if (response.status === 401) {
                    setError(data.message || "Please log in to generate messages.");
                    router.push("/login"); // Redirect to login page
                } else {
                    throw new Error(data.message || "Failed to generate messages. Please try again.");
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

    const copyToClipboard = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            console.log("Message copied to clipboard!"); // Replaced alert
        } catch (err) {
            console.error("Failed to copy text: ", err);
            console.log("Failed to copy message."); // Replaced alert
        } finally {
            document.body.removeChild(textarea);
        }
    };

    const handleFeedback = async (rating) => {
        if (!generatedMessageDbId) {
            console.log("Cannot submit feedback. Message ID not found."); // Replaced alert
            return;
        }

        // Update the feedback_rating for the specific generated_messages entry in Supabase
        try {
            const { data, error } = await supabase
                .from("generated_messages")
                .update({ feedback_rating: rating }) // 'positive' or 'negative'
                .eq('id', generatedMessageDbId); // Update the specific record

            if (error) {
                console.error("Error saving feedback:", error);
                console.log("Failed to save feedback."); // Replaced alert
            } else {
                console.log("Feedback saved:", data);
                console.log("Feedback submitted! Thank you."); // Replaced alert
            }
        } catch (err) {
            console.error("Error during feedback submission:", err);
            console.log("An unexpected error occurred while submitting feedback."); // Replaced alert
        }
    };

    return (
        <div className="min-h-screen bg-white font-inter text-gray-900 antialiased py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mt-20">
                <Card className="border border-gray-100 shadow-lg rounded-xl overflow-hidden">
                    {/* <CardHeader className="border-b border-gray-100 px-6 py-4">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 rounded-full px-4 py-2" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </CardHeader> */}

                    <CardContent className="p-6 sm:p-8">
                        <div className="text-center mb-8">
                            <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                                Craft Your Perfect Outreach Message
                            </CardTitle>
                            <p className="text-lg text-gray-600 max-w-lg mx-auto">
                                Tell our AI a few details, and get messages that actually get replies.
                            </p>
                        </div>

                        {/* Display usage count for free users */}
                        {messagesLimit > 0 && messagesUsed < messagesLimit && (
                            <div className="text-center text-sm text-gray-600 mb-6">
                                You have{" "}
                                <span className="font-semibold text-gray-900"> {/* Changed color to gray-900 */}
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
                                    <Target className="h-5 w-5 mr-2 text-gray-700" /> {/* Changed icon color to gray-700 */}
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
                                    <Zap className="h-5 w-5 mr-2 text-gray-700" /> {/* Changed icon color to gray-700 */}
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
                                    <Package className="h-5 w-5 mr-2 text-gray-700" /> {/* Changed icon color to gray-700 */}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Communication Channel */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="channel"
                                        className="flex items-center text-gray-700"
                                    >
                                        <MessageSquareText className="h-5 w-5 mr-2 text-gray-700" /> {/* Changed icon color to gray-700 */}
                                        Communication channel
                                    </Label>
                                    <Select
                                        value={formData.channel}
                                        onValueChange={(value) =>
                                            handleSelectChange("channel", value)
                                        }
                                        required
                                    >
                                        <SelectTrigger className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200"> {/* Added border and focus styles */}
                                            <SelectValue placeholder="Select channel" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg">
                                            <SelectItem value="Email">Email</SelectItem>
                                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                            <SelectItem value="Twitter/X DM">Twitter/X DM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Desired Tone */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="tone"
                                        className="flex items-center text-gray-700"
                                    >
                                        <MessageSquareText className="h-5 w-5 mr-2 text-gray-700" /> {/* Changed icon color to gray-700 */}
                                        Message tone
                                    </Label>
                                    <Select
                                        value={formData.tone}
                                        onValueChange={(value) => handleSelectChange("tone", value)}
                                        required
                                    >
                                        <SelectTrigger className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200"> {/* Added border and focus styles */}
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
                            </div>

                            {/* Optional Context */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="userContext"
                                    className="flex items-center text-gray-700"
                                >
                                    <MessageSquareText className="h-5 w-5 mr-2 text-gray-500" /> {/* Changed icon color to gray-500 */}
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
                                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 rounded-full border-gray-200 hover:bg-gray-100 transition-colors text-sm py-2 px-4 text-gray-700 hover:text-gray-900" // Updated button style
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            msg.subject
                                                                ? `Subject: ${msg.subject}\n\n${msg.content}`
                                                                : msg.content
                                                        )
                                                    }
                                                >
                                                    <Copy className="h-4 w-4 mr-2" /> Copy Message
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 rounded-full border-gray-200 transition-colors py-2 px-4 hover:bg-green-50 hover:border-green-400 text-gray-700 hover:text-green-700" // Updated button style
                                                    onClick={() =>
                                                        handleFeedback("positive")
                                                    }
                                                >
                                                    <ThumbsUp className="h-4 w-4 mr-2" /> Useful
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 rounded-full border-gray-200 transition-colors py-2 px-4 hover:bg-red-50 hover:border-red-400 text-gray-700 hover:text-red-700" // Updated button style
                                                    onClick={() =>
                                                        handleFeedback("negative")
                                                    }
                                                >
                                                    <ThumbsDown className="h-4 w-4 mr-2" /> Not Useful
                                                </Button>
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
