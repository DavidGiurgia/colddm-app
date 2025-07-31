"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import {
  Loader2,
  Crown,
  ArrowRight,
  Zap,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";

const UserSettingsPage = () => {
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

  // Delete account modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPlan, setCurrentPlan] = useState("Free");
  const [messageLimit, setMessageLimit] = useState(5);
  const [totalMessages, setTotalMessages] = useState(0);

  const fetchUserDataAndPlan = useCallback(async () => {
    setInitialLoad(true);
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();

    if (!fetchedUser) {
      router.push("/login");
      return;
    }

    setUser(fetchedUser);
    setEmail(fetchedUser.email || "");

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "first_name, last_name, current_plan, messages_used_this_month, messages_limit_per_month"
        )
        .eq("id", fetchedUser.id)
        .single();

      if (profileError) {
        if (profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
          toast.error(
            `Error loading profile: ${profileError.message || "Unknown error"}`
          );
        }
        const oauthFullName =
          fetchedUser.user_metadata?.full_name ||
          fetchedUser.user_metadata?.name ||
          "";
        const nameParts = oauthFullName.split(" ").filter(Boolean);
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
        setCurrentPlan("Free");
        setMessageLimit(5);
        setTotalMessages(0);
      } else if (profileData) {
        setProfile(profileData);
        setFirstName(profileData.first_name || "");
        setLastName(profileData.last_name || "");
        setCurrentPlan(profileData.current_plan === "pro" ? "Pro" : "Free");
        setMessageLimit(
          profileData.current_plan === "pro"
            ? Infinity
            : profileData.messages_limit_per_month || 5
        );
        setTotalMessages(profileData.messages_used_this_month || 0);
      }

      const { count: messagesCount, error: messagesCountError } = await supabase
        .from("generated_messages")
        .select("*", { count: "exact" })
        .eq("user_id", fetchedUser.id);

      if (messagesCountError) {
        console.error("Error fetching message count:", messagesCountError);
        toast.error("Failed to load message count.");
      } else {
        setTotalMessages(messagesCount);
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

    const {
      data: { subscription: authListenerSubscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "USER_UPDATED"
      ) {
        fetchUserDataAndPlan();
      }
    });

    return () => {
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, [supabase, fetchUserDataAndPlan]);

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
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(`Error updating profile: ${result.error}`);
      } else {
        toast.success("Profile updated successfully!");
        router.refresh();
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

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error("You must be logged in to delete your account.");
      return;
    }

    setIsDeleteModalOpen(true);
  };

  const confirmAccountDeletion = async () => {
    if (confirmationEmail !== user?.email) {
      toast.error("Email does not match your account email.");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully. You have been signed out.");
      router.push("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error(`Failed to delete account: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-900 font-inter antialiased">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" /> Loading user
        data...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-600 font-inter antialiased">
        You are not logged in. Please log in to view settings.
      </div>
    );
  }

  const usagePercentage =
    messageLimit !== Infinity ? (totalMessages / messageLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-white font-inter text-gray-900 antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mt-20">
        {/* Delete Account Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Trash2 className="h-6 w-6 text-red-500" />
                Confirm Account Deletion
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                This action cannot be undone. This will permanently delete your
                account and all associated data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="confirmationEmail" className="text-gray-700">
                  Type your email to confirm
                </Label>
                <Input
                  id="confirmationEmail"
                  type="email"
                  value={confirmationEmail}
                  onChange={(e) => setConfirmationEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200"
                />
                <p className="text-sm text-gray-500">
                  Current account email:{" "}
                  <span className="font-medium">{user.email}</span>
                </p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <p className="text-red-700 text-sm">
                  <strong>Warning:</strong> All your data will be permanently
                  deleted. This includes:
                </p>
                <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                  <li>Profile information</li>
                  <li>Message history</li>
                  <li>Subscription data</li>
                </ul>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmAccountDeletion}
                disabled={isDeleting || confirmationEmail !== user?.email}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Delete Account Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="border border-gray-100 shadow-lg rounded-xl overflow-hidden mb-8">
          <CardHeader className="border-b border-gray-100 px-6 py-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Profile Information
            </CardTitle>
            <CardDescription className="text-gray-600">
              Update your account's profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col items-center gap-4 border-b pb-4 border-gray-100">
              <Avatar className="h-24 w-24 rounded-full shadow-md">
                <AvatarImage
                  src={
                    user.user_metadata?.avatar_url ||
                    `https://placehold.co/96x96/E0F7FA/00C6FF?text=${getInitials(
                      firstName,
                      lastName,
                      user.email
                    )}`
                  }
                  alt={`${firstName} ${lastName}`.trim() || user.email}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/96x96/E0F7FA/00C6FF?text=${getInitials(
                      firstName,
                      lastName,
                      user.email
                    )}`;
                  }}
                />
                <AvatarFallback className="bg-gray-100 text-gray-700 text-3xl rounded-full">
                  {getInitials(firstName, lastName, user.email)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-gray-900">
                {`${firstName} ${lastName}`.trim() || user.email}
              </h2>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>

            <form
              onSubmit={handleUpdateProfile}
              className="space-y-4 border-b pb-4 border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Update Profile Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6 py-2 transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}{" "}
                Update Profile
              </Button>
            </form>

            <form
              onSubmit={handleUpdateEmail}
              className="space-y-4 border-b pb-4 border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Update Email
              </h3>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6 py-2 transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}{" "}
                Update Email
              </Button>
            </form>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Change Password
              </h3>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  required
                  className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 border-gray-200"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6 py-2 transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}{" "}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-lg rounded-xl overflow-hidden mb-8">
          <CardHeader className="border-b border-gray-100 px-6 py-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Plan & Billing
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage your subscription and message limits
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-gray-700" />
              <span className="text-lg font-semibold text-gray-900">
                Current Plan: {currentPlan}
              </span>
            </div>

            {currentPlan === "Free" ? (
              <div className="space-y-3">
                <p className="text-gray-600">
                  You're on the Free plan with {messageLimit} messages per
                  month.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full"
                    style={{
                      width: `${(totalMessages / messageLimit) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  {totalMessages} of {messageLimit} messages used
                </p>
                <Link href="/pricing" passHref>
                  <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6 py-2 transition-all duration-200 transform hover:scale-105 shadow-md mt-4">
                    Upgrade to Pro <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-xs text-gray- mt-4">
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
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-100 rounded-full mt-4"
                  onClick={() => toast.info("Billing portal coming soon!")}
                >
                  Manage Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="border-b border-gray-200 px-6 py-4">
            <CardTitle className="text-2xl font-bold text-gray-700 flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-red-400" /> Danger Zone
            </CardTitle>
            <CardDescription className="text-gray-600">
              Proceed with caution. These actions are irreversible.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Account
              </h3>
              <p className="text-gray-600">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              className="bg-red-500 text-white hover:bg-red-600 rounded-full px-6 py-2 transition-colors duration-200 shadow-md"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete My Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserSettingsPage;
