// app/dashboard/settings/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Crown, ArrowRight, Zap, CheckCircle } from "lucide-react"; // Import Crown and ArrowRight for plan section
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import Link from "next/link"; // Import Link for navigation

const UserSettingsPage = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // New states for plan information
  const [currentPlan, setCurrentPlan] = useState("Free"); // Default to Free
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [ideaLimit, setIdeaLimit] = useState(3); // Default limit for Free plan
  const [messageLimit, setMessageLimit] = useState(5); // Default limit for Free plan
  const [totalMessages, setTotalMessages] = useState(0); // Default total messages

  // Effect to fetch user, profile, and plan data on component mount
  const fetchUserDataAndPlan = useCallback(async () => {
    setInitialLoad(true);
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();

    if (!fetchedUser) {
      router.push("/auth/login"); // Redirect to login if no user
      return;
    }

    setUser(fetchedUser);
    setEmail(fetchedUser.email || "");

    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url, plan_type")
        .eq("id", fetchedUser.id)
        .single();

      // Refined error handling for profile fetch
      if (profileError) {
        // PGRST116 means "No rows found" - this is expected if a profile doesn't exist yet
        if (profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
          toast.error(
            `Error loading profile: ${profileError.message || "Unknown error"}`
          );
        }
        // If profileError.code is PGRST116 or profileData is null, it means no profile exists.
        // We proceed to set default values or values from user_metadata.
        const oauthFullName =
          fetchedUser.user_metadata?.full_name ||
          fetchedUser.user_metadata?.name ||
          "";
        const nameParts = oauthFullName.split(" ").filter(Boolean);
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
        setCurrentPlan("Free"); // Default to Free if no profile or plan_type
        setIdeaLimit(3);
      } else if (profileData) {
        setProfile(profileData);
        setFirstName(profileData.first_name || "");
        setLastName(profileData.last_name || "");
        setCurrentPlan(profileData.plan_type === "pro" ? "Pro" : "Free");
        setIdeaLimit(profileData.plan_type === "pro" ? Infinity : 3); // Set limit based on plan
      }

      // Fetch total ideas count
      const { count, error: countError } = await supabase
        .from("ideas")
        .select("*", { count: "exact" })
        .eq("user_id", fetchedUser.id);

      if (countError) {
        console.error("Error fetching idea count:", countError);
        toast.error("Failed to load idea count.");
      } else {
        setTotalIdeas(count);
      }
    } catch (err) {
      console.error("Unexpected error fetching data:", err);
      toast.error(
        `An unexpected error occurred while loading data: ${err.message}`
      );
    } finally {
      setInitialLoad(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    fetchUserDataAndPlan();

    // Corrected destructuring for onAuthStateChange subscription
    const {
      data: { subscription: authListenerSubscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "USER_UPDATED"
      ) {
        fetchUserDataAndPlan(); // Re-fetch all data on auth change
      }
    });

    // Corrected cleanup function to use the subscription object
    return () => {
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, [supabase, fetchUserDataAndPlan]);

  // Helper to get initials for avatar fallback based on first and last name
  const getInitials = (first = "", last = "", email = "") => {
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }
    if (first) {
      return first.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "";
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          // avatar_url is typically updated separately or comes from OAuth
        },
        { onConflict: "id" }
      );

      if (error) {
        toast.error(`Error updating profile: ${error.message}`);
      } else {
        toast.success("Profile updated successfully!");
        router.refresh(); // Refresh to ensure latest profile data is picked up
      }
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error("Email cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } =
        await supabase.auth.updateUser({ email: email });

      if (authError) {
        toast.error(`Error updating email: ${authError.message}`);
      } else {
        toast.success(
          "Email update initiated! Please check your new email to confirm the change."
        );
      }
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(`Error updating password: ${error.message}`);
      } else {
        toast.success("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground dark:bg-slate-900 dark:text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading user
        data...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground dark:bg-slate-900 dark:text-slate-400">
        You are not logged in. Please log in to view settings.
      </div>
    );
  }

  const usagePercentage =
    ideaLimit !== Infinity ? (totalIdeas / ideaLimit) * 100 : 0;

  return (
    <div className="space-y-8 p-4 max-w-2xl mx-auto dark:bg-slate-900 dark:text-slate-100">
      <h1 className="text-3xl font-bold tracking-tight mb-4">
        Account Settings
      </h1>
      <p className="text-muted-foreground dark:text-slate-400">
        Manage your profile information and security settings.
      </p>

      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-slate-100">
            Profile Information
          </CardTitle>
          <CardDescription className="dark:text-slate-400">
            Update your account's profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 border-b pb-4 border-border dark:border-slate-700">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={
                  profile?.avatar_url ||
                  user.user_metadata?.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${
                    firstName || user.email
                  }${lastName}`
                }
                alt={`${firstName} ${lastName}`.trim() || user.email}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {getInitials(firstName, lastName, user.email)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold dark:text-slate-100">
              {`${firstName} ${lastName}`.trim() || user.email}
            </h2>
            <p className="text-muted-foreground text-sm dark:text-slate-400">
              {user.email}
            </p>
          </div>

          {/* Profile Name & Username Update Section */}
          <form
            onSubmit={handleUpdateProfile}
            className="space-y-4 border-b pb-4 border-border dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold dark:text-slate-100">
              Update Profile Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="firstName" className="dark:text-slate-200">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="dark:text-slate-200">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}{" "}
              Update Profile
            </Button>
          </form>

          {/* Email Update Section */}
          <form
            onSubmit={handleUpdateEmail}
            className="space-y-4 border-b pb-4 border-border dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold dark:text-slate-100">
              Update Email
            </h3>
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-slate-200">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}{" "}
              Update Email
            </Button>
          </form>

          {/* Password Update Section */}
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-slate-100">
              Change Password
            </h3>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="dark:text-slate-200">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="dark:text-slate-200">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}{" "}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Plan & Billing Section */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Plan & Billing
          </CardTitle>
          <CardDescription className="text-gray-600">
            Manage your subscription and message limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-900">
              Current Plan: {currentPlan}
            </span>
          </div>

          {currentPlan === "Free" ? (
            <div className="space-y-3">
              <p className="text-gray-600">
                You're on the Free plan with {messageLimit} messages per month.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-purple-600 h-2 rounded-full"
                  style={{ width: `${(totalMessages / messageLimit) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {totalMessages} of {messageLimit} messages used
              </p>
              <Link href="/pricing" passHref>
                <Button className="w-full bg-gradient-to-r from-red-500 to-purple-600 text-white hover:from-red-600 hover:to-purple-700 mt-4">
                  Upgrade to Pro <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-gray-500">
                Pro plan includes unlimited messages, analytics, and priority
                support
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600">
                You're on the <span className="font-semibold">Pro Plan</span>{" "}
                with unlimited messages and advanced features.
              </p>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>All features unlocked</span>
              </div>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 mt-4"
                onClick={() => toast.info("Billing portal coming soon!")}
              >
                Manage Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettingsPage;
