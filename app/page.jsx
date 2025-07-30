"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Users,
  Zap,
  Star,
  Quote,
} from "lucide-react";
import Link from "next/link";

export default function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeDemo, setActiveDemo] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const demoMessages = [
    {
      input: "A SaaS founder, feedback on my task management app",
      output:
        "Hi Sarah, I saw your thoughts on productivity tools on LinkedIn. As a fellow founder, I'm building TaskFlow—a minimalist approach to task management. Would you spare 5 minutes for honest feedback? I'd love to learn from your experience.",
    },
    {
      input: "Designer for collaboration, my design system tool",
      output:
        "Hey Alex, your recent portfolio update caught my eye—especially the design system work. I'm creating DesignSync, a tool for design system collaboration. Interested in being an early tester? I'd love your designer perspective.",
    },
    {
      input: "Investor for demo, my AI writing assistant",
      output:
        "Hi Michael, I noticed your investment in writing tools. I'm John, founder of WriteAI—we're seeing 40% higher engagement rates for content creators. Would you be open to a 10-minute demo this week?",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-inter text-gray-900 antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-semibold text-gray-900">ColdDM.AI</div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#problem"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Problem
            </a>
            <a
              href="#solution"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Solution
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </a>

            <Link href="/login">
              <Button className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-100 rounded-full px-6 py-2 transition-all duration-200">
                Login
              </Button>
            </Link>

            <Link href="/register">
              <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6 py-2 transition-all duration-200">
                Try Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className={`pt-32 pb-20 px-6 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-gray-50 rounded-full px-4 py-2 mb-8 border border-gray-200">
            <Star className="h-4 w-4 text-yellow-500 mr-2" />
            <span className="text-sm text-gray-700">
              {/* Trusted by 2,000+ indie founders */}
              Helping founders craft better messages
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
            Stop getting <span className="text-red-500">ignored</span>.<br />
            Start getting <span className="text-green-600">replies</span>.
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            The AI that writes cold messages so good, people actually want to
            respond. Built for founders who hate being ignored.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Button className="bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105">
              Generate Your First Message
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex items-center text-gray-500 text-sm">
              <span>Free • 30 seconds</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex justify-center items-center space-x-8 text-gray-400 text-sm">
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              {/* <span>50k+ messages sent</span> */}
              <span>Industry avg: 2-5% reply rate</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {/* <span>73% reply rate</span> */}
              <span>Early users seeing improved results</span>
            </div>
            {/* <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              <span>5-star rating</span>
            </div> */}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8 text-gray-900">
                Every founder's nightmare:
                <br />
                <span className="text-gray-500">
                  "Will they even read this?"
                </span>
              </h2>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
                  <Quote className="h-5 w-5 text-gray-400 mb-2" />
                  <p className="text-gray-700 italic">
                    "How do I write a LinkedIn message that won't make me look
                    desperate when asking for product feedback?"
                  </p>
                  {/* <p className="text-sm text-gray-500 mt-2">
                    — Sarah, SaaS founder
                  </p> */}
                </div>

                <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
                  <Quote className="h-5 w-5 text-gray-400 mb-2" />
                  <p className="text-gray-700 italic">
                    "I spent 2 hours writing one email to a potential customer.
                    No reply. I'm tired of being ignored."
                  </p>
                  {/* <p className="text-sm text-gray-500 mt-2">
                    — Mike, indie hacker
                  </p> */}
                </div>

                <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
                  <Quote className="h-5 w-5 text-gray-400 mb-2" />
                  <p className="text-gray-700 italic">
                    "What should I write to get founders to agree to validation
                    interviews without sounding pushy?"
                  </p>
                  {/* <p className="text-sm text-gray-500 mt-2">
                    — Alex, first-time founder
                  </p> */}
                </div>
              </div>

              <p className="text-lg text-gray-700 mt-8">
                <strong className="text-gray-900">Sound familiar?</strong>{" "}
                You're not alone. Based on industry research,{" "}
                <strong>89% of founders struggle</strong> with cold outreach. 
              </p>
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">😰</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    The Reality
                  </h3>
                  <div className="space-y-4 text-left">
                    <div className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span>2-5% average reply rate for cold messages</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span>Hours wasted crafting "perfect" messages</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span>Fear of looking desperate or spammy</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span>Missed opportunities with potential customers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              What if writing cold messages was this simple?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No more staring at blank screens. No more wondering if your
              message sounds right. Just tell us what you need, and get messages
              that actually work.
            </p>
          </div>

          {/* Interactive Demo */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Try it right now:
              </h3>

              <Card className="p-6 bg-gray-50 border-2 border-dashed border-gray-300">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who are you writing to?
                    </label>
                    <Input
                      placeholder="e.g., A SaaS founder"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What do you want?
                    </label>
                    <Input
                      placeholder="e.g., Feedback on my product"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your product/service?
                    </label>
                    <Input
                      placeholder="e.g., Task management app for teams"
                      className="w-full"
                    />
                  </div>

                  <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 py-3">
                    Generate Message
                  </Button>
                </div>
              </Card>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Your AI-generated message:
              </h3>

              <div className="space-y-4">
                {demoMessages.map((demo, index) => (
                  <Card
                    key={index}
                    className={`p-6 cursor-pointer transition-all duration-200 ${
                      activeDemo === index
                        ? "border-2 border-green-500 bg-green-50"
                        : "border border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveDemo(index)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        LinkedIn Message
                      </span>
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {/* <span>73% reply rate</span> */}
                        <span>Optimized for replies</span>
                      </div>
                    </div>

                    <p className="text-gray-800 leading-relaxed">
                      {demo.output}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Input: {demo.input}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* How it Works */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                1. Tell us the basics
              </h3>
              <p className="text-gray-600">
                Who you're writing to, what you want, and your product. Takes 30
                seconds.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                2. AI crafts your message
              </h3>
              <p className="text-gray-600">
                Our AI generates 3 variants optimized for your platform and
                goal.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                3. Get replies that matter
              </h3>
              <p className="text-gray-600">
                Copy, send, and watch your reply rates soar. 
                {/* Our users average
                73% responses. */}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      {/* <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Real founders, real results
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-white">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  S
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Chen</p>
                  <p className="text-sm text-gray-500">SaaS Founder</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "I went from 5% to 68% reply rate in a week. ColdDM.AI writes messages I wish I could write myself."
              </p>
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </Card>

            <Card className="p-8 bg-white">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  M
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mike Rodriguez</p>
                  <p className="text-sm text-gray-500">Indie Hacker</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Finally got 3 investor meetings after months of radio silence. The messages feel natural, not robotic."
              </p>
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </Card>

            <Card className="p-8 bg-white">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  A
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Alex Kim</p>
                  <p className="text-sm text-gray-500">Product Designer</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Landed 4 consulting gigs this month. The messages sound like me, just... better. Worth every penny."
              </p>
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section> */}

      {/* The Cold Outreach Challenge */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              The Cold Outreach Challenge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Based on industry research and early user feedback, these are the
              common pain points we're solving:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-white">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Time-Consuming
              </h3>
              <p className="text-gray-700">
                Crafting personalized cold messages takes most founders 15-30
                minutes per message.
              </p>
            </Card>

            <Card className="p-8 bg-white">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📉</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Low Response Rates
              </h3>
              <p className="text-gray-700">
                Industry averages show only 2-5% of cold messages get replies.
              </p>
            </Card>

            <Card className="p-8 bg-white">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤔</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Uncertainty
              </h3>
              <p className="text-gray-700">
                89% of founders report doubting their message effectiveness.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Simple pricing that makes sense
          </h2>
          <p className="text-xl text-gray-600 mb-16">
            Start free, upgrade when you see results
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="p-8 border-2 border-gray-200">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600 mb-6">
                  Perfect for testing the waters
                </p>
                <div className="text-5xl font-bold text-gray-900 mb-2">€0</div>
                <p className="text-gray-500 mb-8">Forever free</p>

                <div className="space-y-4 text-left mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">5 messages per month</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      All platforms (LinkedIn, Email, Twitter)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">3 message variants</span>
                  </div>
                </div>

                <Button className="w-full border-2 border-gray-300 text-gray-100 hover:text-gray-700 hover:bg-gray-50 py-3">
                  Start Free
                </Button>
              </div>
            </Card>

            {/* Pro Plan */}
            <Card className="p-8 border-2 border-gray-900 bg-gray-900 text-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-gray-300 mb-6">For serious outreach</p>
                <div className="text-5xl font-bold mb-2">€9</div>
                <p className="text-gray-300 mb-8">per month</p>

                <div className="space-y-4 text-left mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-300">Unlimited messages</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-300">All tone options</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-300">
                      Save message templates
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-300">
                      Follow-up message generation
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-300">
                      Message optimization analysis
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 py-3 font-semibold">
                  Upgrade to Pro
                </Button>
              </div>
            </Card>
          </div>

          <p className="text-gray-500 mt-8">
             Cancel anytime • No hidden fees
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to stop being ignored?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            {/* Join 2,000+ founders who've transformed their outreach from crickets
            to conversations. */}
            Join founders who are transforming their outreach approach with AI
            assistance.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4 rounded-full font-semibold">
              Generate Your First Message
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-gray-400 mt-6 text-sm">
            Free forever • No credit card required • Start in 30 seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-xl font-semibold text-gray-900 mb-2">
                ColdDM.AI
              </div>
              <p className="text-gray-600">
                Transform your outreach. Get replies.
              </p>
            </div>

            <div className="flex space-x-8 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Support
              </a>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2025 ColdDM.AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
