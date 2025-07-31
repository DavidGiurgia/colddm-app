'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { IconBrandGoogle } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    //if logged in, redirect to dashboard
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClientComponentClient();

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/dashboard');
            }
        };
        checkAuth();
    }, []);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error('Login failed', { description: error.message });
        } else {
            toast.success('Welcome back!');
            router.push('/dashboard');
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            toast.error('Google login failed', { description: error.message });
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4" // Updated text and hover colors
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to home
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1> 
                <p className="text-lg text-gray-600"> 
                    Sign in to your ColdDM account
                </p>
            </div>

            <Card className="border border-gray-100 shadow-lg rounded-xl"> {/* Added border, shadow, rounded corners */}
                <CardContent className="p-6 sm:p-8"> {/* Adjusted padding */}
                    <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700">Email address</Label> {/* Changed text color */}
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200" // Added rounded-lg, focus, and border classes
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-gray-700">Password</Label> {/* Changed text color */}
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm text-gray-700 hover:underline hover:text-gray-900 underline-offset-4 transition-colors" // Updated text and hover colors
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 pr-10 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200" // Added rounded-lg, focus, and border classes
                                    autoComplete="current-password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" /> 
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" /> 
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md" // Updated button style
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                            ) : (
                                <LogIn className="mr-2 h-5 w-5" /> 
                            )}
                            Sign in
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full bg-gray-200" /> 
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500"> 
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full h-12 border-gray-200 text-gray-700 hover:bg-gray-100 rounded-full transition-colors" // Updated button style
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                        ) : (
                            <IconBrandGoogle className="mr-2 h-5 w-5" /> 
                        )}
                        Continue with Google
                    </Button>
                </CardContent>
            </Card>

            <div className="text-center text-base text-gray-600 mt-6"> 
                Don't have an account?{' '}
                <Link
                    href="/register"
                    className="font-medium text-gray-700 hover:underline hover:text-gray-900 underline-offset-4 transition-colors" 
                >
                    Create account
                </Link>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mt-4"> 
                <Link href="/help" className="hover:underline underline-offset-4 hover:text-gray-900 transition-colors"> 
                    Need help?
                </Link>
                <span>•</span>
                <Link href="/contact" className="hover:underline underline-offset-4 hover:text-gray-900 transition-colors"> 
                    Contact support
                </Link>
            </div>
        </div>
    );
}
