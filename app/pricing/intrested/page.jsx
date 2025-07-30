// app/pricing/interested/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, CheckCircle2, Sparkles, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { submitInterest } from '../actions'; // Import the server action
import Link from 'next/link';

export default function PricingInterestedPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = { email, message };

    try {
      const result = await submitInterest(formData);

      if (result.error) {
        toast.error('Failed to submit your interest', { description: result.error });
      } else {
        toast.success('Thank you for your interest!', {
          description: 'We\'ve received your inquiry and will notify you when the Pro Plan is available.',
          duration: 8000,
        });
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An unexpected error occurred during submission.', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground dark:bg-slate-900 dark:text-slate-100">
      <Card className="w-full max-w-2xl dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl dark:text-slate-100">Interested in the Pro Plan?</CardTitle>
          <CardDescription className="dark:text-slate-400">
            We're currently perfecting our Pro Plan to bring you even more powerful features.
            Leave your details below, and we'll notify you as soon as it's ready!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold dark:text-slate-100">Your interest has been recorded!</h3>
              <p className="text-muted-foreground dark:text-slate-400">
                Thank you for helping us prioritize. We'll be in touch.
              </p>
              <Link href="/" passHref>
                <Button className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
                  Go back to FoundrSight
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="dark:text-slate-200">Your Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message" className="dark:text-slate-200">What features are you most excited about? (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="E.g., I'm really looking forward to the advanced insights and unlimited ideas!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  disabled={loading}
                  className="min-h-[100px] dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Notify Me When Ready
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
