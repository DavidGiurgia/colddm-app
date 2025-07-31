'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, Mail, Eye, EyeOff, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { IconBrandGoogle } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase/client';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            toast.error('Registration failed', { description: error.message });
        } else {
            setEmailSent(true);
            toast.success('Registration successful!', {
                description: 'Please check your email to confirm your account.',
            });
        }
        setLoading(false);
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            toast.error('Google registration failed', { description: error.message });
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="space-y-6 bg-white font-inter text-gray-900 antialiased p-6 sm:p-8 md:p-12 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-gray-700" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
                    <p className="text-lg text-gray-600">
                        We've sent a confirmation link to <strong className="text-gray-800">{email}</strong>
                    </p>
                </div>

                <Alert className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg">
                    <Info className="h-4 w-4 text-gray-500" />
                    <AlertDescription>
                        Click the link in your email to complete your registration.
                        You can close this tab once you've clicked the link.
                    </AlertDescription>
                </Alert>

                <div className="text-center">
                    <Button
                        variant="outline"
                        className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-100 px-6 py-2 transition-colors"
                        onClick={() => setEmailSent(false)}
                    >
                        Back to registration
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <Badge className="mb-2 bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm font-medium">
                    Start Free
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
                <p className="text-lg text-gray-600">
                    Join founders who are transforming their outreach approach with AI assistance.
                </p>
            </div>

            <Card className="border border-gray-100 shadow-lg rounded-xl">
                <CardContent className="p-6 sm:p-8">
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a secure password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 pr-10 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200"
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
                            {password && (
                                <div className="space-y-1">
                                    <div className="flex items-center text-xs text-gray-600">
                                        <CheckCircle className={`h-3 w-3 mr-1 ${password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`} />
                                        At least 8 characters
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <UserPlus className="mr-2 h-5 w-5" />
                            )}
                            Create account
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
                        className="w-full h-12 border-gray-200 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={handleGoogleSignUp}
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
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="font-medium text-gray-700 hover:underline hover:text-gray-900 underline-offset-4 transition-colors"
                >
                    Sign in
                </Link>
            </div>

            <div className="text-sm text-gray-600 text-center mt-4">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="hover:underline underline-offset-4 text-gray-700 hover:text-gray-900 transition-colors">
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="hover:underline underline-offset-4 text-gray-700 hover:text-gray-900 transition-colors">
                    Privacy Policy
                </Link>
            </div>
        </div>
    );
}
