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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Send, Loader2, CheckCircle2, Lightbulb, Mail, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client'; // Assuming this correctly points to your Supabase client
import { toast } from 'sonner'; // For displaying notifications

export default function GiveFeedbackPage() {
    const router = useRouter();
    const [feedbackType, setFeedbackType] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState(''); // For unauthenticated users
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [userSession, setUserSession] = useState(null); // To store user session

    // Check user session on component mount
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserSession(user);
            if (user) {
                setEmail(user.email || ''); // Pre-fill email if logged in
            }
        };
        checkUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Prepare data to send to the API
        const feedbackData = {
            feedbackType,
            message,
            email: userSession ? userSession.email : email, // Use session email if logged in, else form email
            userId: userSession ? userSession.id : null, // Pass user ID if logged in
        };

        try {
            const response = await fetch('/api/submit-general-feedback', { // New API route for general feedback
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit feedback.');
            } else {
                toast.success('Feedback Submitted!', {
                    description: 'Thank you for helping us improve ColdDM.AI!',
                    duration: 5000,
                });
                setSubmitted(true);
                // Optionally clear form or redirect after successful submission
                setFeedbackType('');
                setMessage('');
                if (!userSession) setEmail(''); // Only clear email if it was manually entered
            }
        } catch (err) {
            console.error('Error submitting feedback:', err);
            toast.error('Failed to submit feedback', {
                description: err.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-inter text-gray-900 antialiased py-12 px-4 sm:px-6 lg:px-8"> {/* Changed bg-gray-50 to bg-white and added font-inter */}
            <div className="max-w-3xl mx-auto mt-20">
                <Card className="border border-gray-100 shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="border-b border-gray-100 px-6 py-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-7 h-7 text-gray-700" /> {/* Changed icon color to gray-700 */}
                            <CardTitle className="text-3xl font-bold text-gray-900">Give Us Your Feedback</CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-8">
                        {submitted ? (
                            <div className="text-center py-12 space-y-4">
                                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                                <h3 className="text-xl font-semibold text-gray-900">Thank You for Your Feedback!</h3>
                                <p className="text-gray-600">
                                    Your input helps us make ColdDM.AI even better. We appreciate it!
                                </p>
                                <Button
                                    className="mt-6 bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md" // Updated button style to match landing page primary CTA
                                    onClick={() => router.push('/dashboard')}
                                >
                                    Back to Dashboard 
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="feedbackType" className="flex items-center text-gray-700">
                                        <Lightbulb className="h-5 w-5 mr-2 text-gray-700" /> {/* Changed icon color to gray-700 */}
                                        What kind of feedback is this? (Optional)
                                    </Label>
                                    <Select value={feedbackType} onValueChange={setFeedbackType}>
                                        <SelectTrigger className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"> {/* Adjusted focus ring color */}
                                            <SelectValue placeholder="Select type (e.g., Suggestion, Bug Report)" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg">
                                            <SelectItem value="suggestion">Suggestion / Feature Request</SelectItem>
                                            <SelectItem value="bug_report">Bug Report</SelectItem>
                                            <SelectItem value="general_comment">General Comment</SelectItem>
                                            <SelectItem value="praise">Praise / What you love</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message" className="flex items-center text-gray-700">
                                        <Mail className="h-5 w-5 mr-2 text-gray-700" /> {/* Changed icon color to gray-700 */}
                                        Your Message <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Tell us what's on your mind..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="min-h-[120px] rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400" // Adjusted focus ring color
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {!userSession && ( // Only show email field if user is NOT logged in
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center text-gray-700">
                                            <Mail className="h-5 w-5 mr-2 text-gray-500" /> Your Email (Optional, if not logged in)
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                            className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                                        />
                                        <p className="text-sm text-gray-500">
                                            We'll use this if we need to follow up on your feedback.
                                        </p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md" // Updated button style to match landing page primary CTA
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" /> Submit Feedback
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
