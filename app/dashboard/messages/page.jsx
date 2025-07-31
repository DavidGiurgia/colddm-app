'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, MessageSquare, Copy, ThumbsUp, ThumbsDown, Loader2, Mail, Linkedin, Twitter, ArrowRight  } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';


export default function AllMessagesPage() {
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null); // To store the current user

    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            setError(null);

            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                setError("You must be logged in to view your messages.");
                setIsLoading(false);
                // Optionally redirect to login
                router.push('/login');
                return;
            }
            setUser(user);

            try {
                // Fetch all generated messages for the current user, ordered by creation date
                const { data, error: fetchError } = await supabase
                    .from('generated_messages')
                    .select('id, input_data, output_messages, channel, tone, created_at, feedback_rating')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false }); // Show most recent first

                if (fetchError) {
                    throw new Error(fetchError.message || "Failed to fetch messages.");
                }

                setMessages(data || []);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching messages:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [router]); // Re-fetch if router changes (e.g., after login/logout)

    const copyToClipboard = (text) => {
        // Using document.execCommand('copy') for broader iframe compatibility
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            // In a real app, you'd use a Shadcn Toast here instead of alert
            // For this environment, a console log or temporary UI message is better than alert
            console.log("Message copied to clipboard!"); 
        } catch (err) {
            console.error("Failed to copy text: ", err);
            // In a real app, you'd use a Shadcn Toast here instead of alert
            console.log("Failed to copy message.");
        } finally {
            document.body.removeChild(textarea);
        }
    };

    const handleFeedback = async (messageId, rating) => {
        if (!user) {
            // In a real app, you'd use a Shadcn Toast here instead of alert
            console.log("Please log in to submit feedback."); 
            return;
        }

        try {
            const { error: updateError } = await supabase
                .from("generated_messages")
                .update({ feedback_rating: rating })
                .eq('id', messageId)
                .eq('user_id', user.id); // Ensure user can only update their own messages

            if (updateError) {
                console.error("Error saving feedback:", updateError);
                // In a real app, you'd use a Shadcn Toast here instead of alert
                console.log("Failed to save feedback."); 
            } else {
                // Optimistically update the UI to reflect the new feedback
                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === messageId ? { ...msg, feedback_rating: rating } : msg
                    )
                );
                // In a real app, you'd use a Shadcn Toast here instead of alert
                console.log("Feedback submitted! Thank you."); 
            }
        } catch (err) {
            console.error("Error during feedback submission:", err);
            // In a real app, you'd use a Shadcn Toast here instead of alert
            console.log("An unexpected error occurred while submitting feedback."); 
        }
    };

    const getChannelIcon = (channel) => {
        switch (channel) {
            case 'Email':
                return <Mail className="h-4 w-4 text-gray-600" />;
            case 'LinkedIn':
                return <Linkedin className="h-4 w-4 text-gray-600" />;
            case 'Twitter/X DM':
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
                                <p className="text-lg mb-4">You haven't generated any messages yet!</p>
                                <Link href="/generate" passHref>
                                    <Button className="bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md">
                                        Generate Your First Message <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((messageEntry) => (
                                    <Card key={messageEntry.id} className="p-6 rounded-xl shadow-sm border border-gray-200 bg-white">
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
                                                <div key={idx} className="mb-4 last:mb-0 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <p className="text-sm font-medium text-gray-600 mb-2">
                                                        {msg.subject ? `Subject: ${msg.subject}` : `Variant ${idx + 1}`}
                                                    </p>
                                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                        {msg.content}
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        className="mt-3 rounded-full border-gray-200 hover:bg-gray-100 transition-colors text-sm py-2 px-4 text-gray-700 hover:text-gray-900"
                                                        onClick={() => copyToClipboard(msg.subject ? `Subject: ${msg.subject}\n\n${msg.content}` : msg.content)}
                                                    >
                                                        <Copy className="h-4 w-4 mr-2" /> Copy
                                                    </Button>
                                                </div>
                                            ))}

                                            {/* Feedback buttons */}
                                            <div className="flex space-x-2 mt-4">
                                                <Button
                                                    variant="outline"
                                                    className={`flex-1 rounded-full border-gray-200 transition-colors py-2 px-4 ${
                                                        messageEntry.feedback_rating === 'positive' ? 'bg-green-100 border-green-400 text-green-700' : 'hover:bg-green-50 hover:border-green-400 text-gray-700 hover:text-green-700'
                                                    }`}
                                                    onClick={() => handleFeedback(messageEntry.id, 'positive')}
                                                    disabled={messageEntry.feedback_rating === 'positive' || messageEntry.feedback_rating === 'negative'}
                                                >
                                                    <ThumbsUp className="h-4 w-4 mr-2" /> Useful
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className={`flex-1 rounded-full border-gray-200 transition-colors py-2 px-4 ${
                                                        messageEntry.feedback_rating === 'negative' ? 'bg-red-100 border-red-400 text-red-700' : 'hover:bg-red-50 hover:border-red-400 text-gray-700 hover:text-red-700'
                                                    }`}
                                                    onClick={() => handleFeedback(messageEntry.id, 'negative')}
                                                    disabled={messageEntry.feedback_rating === 'positive' || messageEntry.feedback_rating === 'negative'}
                                                >
                                                    <ThumbsDown className="h-4 w-4 mr-2" /> Not Useful
                                                </Button>
                                            </div>
                                            {messageEntry.feedback_rating && (
                                                <p className="text-sm text-gray-500 mt-2 text-center">
                                                    Feedback submitted: <span className="font-semibold">{messageEntry.feedback_rating === 'positive' ? 'Useful 👍' : 'Not Useful 👎'}</span>
                                                </p>
                                            )}
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
