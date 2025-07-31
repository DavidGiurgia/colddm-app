'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, ArrowRight, User as UserIcon } from 'lucide-react'; // Simplified Lucide icons
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

const Dashboard = () => {
    // State for user data (for welcome message)
    const [userProfile, setUserProfile] = useState({
        firstName: "Founder", // Default placeholder
    });

    // State for recent messages
    const [recentMessages, setRecentMessages] = useState([]);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);
    const [recentError, setRecentError] = useState(null);

    // Fetch user profile and recent messages on component mount
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch user profile
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('first_name')
                    .eq('id', user.id)
                    .single();

                if (profile && !profileError) {
                    setUserProfile({
                        firstName: profile.first_name || "Founder",
                    });
                } else {
                    console.error("Error fetching user profile for dashboard:", profileError?.message);
                }

                // Fetch recent messages
                const { data: messages, error: messagesError } = await supabase
                    .from('generated_messages')
                    .select('output_messages, channel, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(4); // Get only the 2 most recent messages

                if (messages && !messagesError) {
                    // Flatten the output_messages array to show individual messages if needed,
                    // or just show the first variant of the latest generation.
                    // For a "relaxed" view, let's just show the first message from the latest two generations.
                    const formattedRecent = messages.map(gen => ({
                        content: gen.output_messages[0]?.content || 'No content available', // Take the first variant
                        channel: gen.channel,
                        time: new Date(gen.created_at).toLocaleString(), // Format time nicely
                        id: gen.id // Keep ID if needed for future linking
                    }));
                    setRecentMessages(formattedRecent);
                } else {
                    console.error("Error fetching recent messages:", messagesError?.message);
                    setRecentError("Failed to load recent messages.");
                }
            } else {
                // Handle case where user is not logged in - maybe redirect or show login prompt
                // For now, just set empty profile and messages
                setUserProfile({ firstName: "Guest" });
                setRecentError("Please log in to see your messages.");
            }
            setIsLoadingRecent(false);
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-white font-inter text-gray-900 antialiased p-6 md:p-8 lg:p-10"> {/* Changed bg-gray-50 to bg-white and added font-inter */}
            {/* Header - Welcoming and clean */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Welcome back!</h1>
                    <p className="text-lg text-gray-600 mt-1">Ready to craft your next message that gets replies?</p>
                </div>
                <Link href="/generate" passHref>
                    <Button className="mt-6 sm:mt-0 bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md"> {/* Updated button style to match landing page primary CTA */}
                        New Message <Sparkles className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>

            {/* Recent Messages - Simplified and Clean */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10"> {/* Adjusted grid for 2 recent messages */}
                <Card className="lg:col-span-2 rounded-xl shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                            <MessageSquare className="w-5 h-5 text-gray-700" />
                            Your Latest Messages
                        </CardTitle>
                        <CardDescription className="text-gray-600">A quick look at your most recent AI-generated messages.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingRecent ? (
                            <div className="text-center py-8 text-gray-500">Loading your messages...</div>
                        ) : recentError ? (
                            <div className="text-center py-8 text-red-500">{recentError}</div>
                        ) : recentMessages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                You haven't generated any messages yet. Click "New Message" to start!
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {recentMessages.map((message, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-sm font-medium text-gray-600 mb-2">{message.channel} - {message.time}</p>
                                        <p className="text-gray-800 line-clamp-3">{message.content}</p> {/* Clamp to 3 lines */}
                                        {/* Optionally add a "View Full Message" button */}
                                        <Link href={`/dashboard/messages/${message.id}`} passHref>
                                            <Button variant="link" className="px-0 py-0 h-auto text-gray-700 hover:text-gray-900 mt-2"> {/* Updated link color */}
                                                View Full Message
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
};

export default Dashboard;
