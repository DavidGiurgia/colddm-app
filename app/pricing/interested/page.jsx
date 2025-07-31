'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Loader2,
    Send,
    CheckCircle2,
    Sparkles,
    Mail,
    ArrowLeft,
} from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed for toasts
import { supabase } from "@/lib/supabase/client"; // Import your Supabase client
import Link from "next/link";

// This action will handle saving the interest to Supabase
// You'll need to create this server action or API route.
// For MVP, let's create a placeholder function for now.
async function submitInterest(formData) {
    const { email, message, userId } = formData;

    try {
        // If userId is provided, it means the user is logged in.
        // We'll store interest in a new table, e.g., 'pro_plan_interests'
        const { data, error } = await supabase.from("pro_plan_interests").insert([
            {
                user_id: userId, // Link to user if logged in
                email: email, // Email might still be useful even if user_id is present (e.g., for direct email outreach)
                message: message,
            },
        ]);

        if (error) {
            console.error("Supabase error submitting interest:", error);
            return { error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Unexpected error submitting interest:", error);
        return { error: "An unexpected error occurred." };
    }
}

export default function PricingInterestedPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [userSession, setUserSession] = useState(null); // To store user session
    const router = useRouter();

    // Check user session on component mount
    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUserSession(user);
            if (user) {
                setEmail(user.email || ""); // Pre-fill email if logged in
            }
        };
        checkUser();

        // Optional: Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserSession(session?.user || null);
            if (session?.user) {
                setEmail(session.user.email || "");
            } else {
                setEmail("");
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = {
            email: userSession ? userSession.email : email, // Use session email if logged in, else form email
            message,
            userId: userSession ? userSession.id : null, // Pass user ID if logged in
        };

        try {
            const result = await submitInterest(formData);

            if (result.error) {
                toast.error("Failed to submit your interest", {
                    description: result.error,
                });
            } else {
                toast.success("Thank you for your interest!", {
                    description:
                        "We've received your inquiry and will notify you when the Pro Plan is available.",
                    duration: 8000,
                });
                setSubmitted(true);
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An unexpected error occurred during submission.", {
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white font-inter text-gray-900 antialiased"> {/* Changed bg-gray-50 to bg-white and added font-inter */}
            <Card className="w-full max-w-2xl border border-gray-100 shadow-lg rounded-xl mt-20">
                <CardHeader className="space-y-1 text-center p-6 sm:p-8">
                    <CardTitle className="text-3xl font-bold text-gray-900">
                        Interested in the Pro Plan?
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 max-w-lg mx-auto">
                        We're currently perfecting our Pro Plan to bring you even more
                        powerful features. Leave your details below, and we'll notify you as
                        soon as it's ready!
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                    {submitted ? (
                        <div className="text-center py-12 space-y-4">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                            <h3 className="text-xl font-semibold text-gray-900">
                                Your interest has been recorded!
                            </h3>
                            <p className="text-gray-600">
                                Thank you for helping us prioritize. We'll be in touch.
                            </p>
                            <Link href={userSession ? "/dashboard" : "/"} passHref>
                                <Button className="mt-6 bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"> {/* Updated button style to match landing page primary CTA */}
                                    {userSession ? "Go to Dashboard" : "Go back to ColdDM.AI"}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid gap-6">
                            {!userSession && ( // Conditionally render email field if user is NOT logged in
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-gray-700">
                                        Your Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200" // Added border and focus styles
                                    />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="message" className="text-gray-700">
                                    What features are you most excited about? (Optional)
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="E.g., I'm really looking forward to unlimited messages and follow-up generation!"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    disabled={loading}
                                    className="min-h-[100px] rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200" // Added border and focus styles
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md" // Updated button style to match landing page primary CTA
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Mail className="mr-2 h-5 w-5" />
                                )}
                                Notify Me When Ready
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
