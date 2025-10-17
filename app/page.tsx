// app/page.tsx
"use client";

import Image from "next/image";
import React from "react";
import LandingIllustration from "@/public/landingIllustration.jpg";
import darkLandingIllustration from "@/public/darkLandingIllustration.jpg";
import Link from "next/link";

interface Feature {
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    title: "Member Management",
    description:
      "Track all members, their contributions, and roles efficiently in one place.",
  },
  {
    title: "Resource Tracking",
    description:
      "Monitor cooperative resources and ensure nothing goes missing.",
  },
  {
    title: "Analytics & Reports",
    description:
      "Generate reports on contributions, growth, and performance in seconds.",
  },
  {
    title: "Communication Tools",
    description: "Send announcements and updates to members instantly.",
  },
  {
    title: "Secure & Reliable",
    description: "All your cooperative data is encrypted and safely stored.",
  },
  {
    title: "Customizable Workflows",
    description:
      "Adapt the platform to fit your cooperative’s unique processes.",
  },
];

const LandingPage: React.FC = () => {
  return (
    <main className="space-y-32 w-full">
      {/* Hero Section */}
      <section className="section flex-1 w-full mx-auto bg-zinc-100 dark:bg-[#010326]">
        <div className="grid md:grid-cols-2 grid-cols-1 container gap-4 pt-12">
          <div className="col-span-1 flex flex-col justify-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-primary">
              Manage Your Cooperative wisely
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary/90 dark:text-zinc-300 max-w-2xl mx-auto">
              CoopManager helps your cooperative thrive by organizing members,
              tracking resources, managing finances, and streamlining
              communication — all in one intuitive platform. Make informed
              decisions, boost transparency, and focus on growing your community
              sustainably.
            </p>

            <Link href="#signup">
              <button className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition">
                Start Free Trial
              </button>
            </Link>
          </div>
          <div className="col-span-1 relative">
            <Image
              src={LandingIllustration}
              alt="illustration"
              className="object-cover w-full dark:hidden"
            />
            <Image
              src={darkLandingIllustration}
              alt="illustration"
              className="object-cover w-full hidden dark:block"
            />
            <Link href={"/auth/register"}>
              <div className="absolute bottom-0 right-0 left-0 h-32 " />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12 backdrop-blur-lg py-3">
          Features That Make a Difference
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-background px-6 pb-12 pt-8 rounded-lg shadow hover:shadow-lg hover:-translate-0.5 transition shadow-colorPrimary"
            >
              <div className="w-6 h-6 border-2 border-colorPrimary relative rounded-full mb-4">
                <div className="w-14 h-4 border border-colorPrimary rounded-full border-b-0 absolute top-1/2 left-1/4 origin-top-left -rotate-120" />
              </div>
              <h3 className="text-xl text-primary font-bold mb-2">
                {feature.title}
              </h3>
              <p className="text-lightborder">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="bg-lightBackground/90 text-inverse py-32 px-6 text-center"
      >
        <h2 className="text-4xl font-bold mb-6">About CoopManager</h2>
        <p className="max-w-3xl mx-auto text-primary/90 text-lg">
          CoopManager is designed for modern cooperatives. Whether you’re
          managing members, resources, or finances, our platform simplifies
          everything. Save time, reduce errors, and focus on growing your
          cooperative.
        </p>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-12">Pricing Plans</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-background p-8 rounded-lg shadow shadow-lightBackground transition">
            <h3 className="text-2xl font-bold mb-4">Basic</h3>
            <p className="text-primary/90 mb-6">
              Free plan for small cooperatives
            </p>
            <p className="text-3xl font-bold mb-6">$0/month</p>
            <ul className="mb-6 text-primary/80 space-y-2">
              <li>Up to 50 members</li>
              <li>Basic tracking</li>
              <li>Email support</li>
            </ul>
            <a
              href="#signup"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Get Started
            </a>
          </div>

          <div className="bg-background p-8 rounded-lg shadow hover:shadow-xl transition border-2 border-green-600 relative">
            <h3 className="text-2xl font-bold mb-4">Pro</h3>
            <p className="text-primary/90 mb-6">For growing cooperatives</p>
            <p className="text-3xl font-bold mb-6">$29/month</p>
            <ul className="mb-6 text-primary/80 space-y-2">
              <li>Up to 500 members</li>
              <li>Full analytics</li>
              <li>Priority support</li>
            </ul>
            <a
              href="#signup"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Get Started
            </a>
          </div>

          <div className="bg-background shadow p-8 rounded-lg shadow hover:shadow-xl transition">
            <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
            <p className="text-primary/90 mb-6">For large-scale cooperatives</p>
            <p className="text-3xl font-bold mb-6">Contact us</p>
            <ul className="mb-6 text-primary/80 space-y-2">
              <li>Unlimited members</li>
              <li>Custom workflows</li>
              <li>Dedicated support</li>
            </ul>
            <a
              href="#contact"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Contact / Signup Section */}
      <section id="signup" className="bg-green-50 py-32 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">Get Started Today</h2>
        <p className="text-primary/90 mb-8 max-w-2xl mx-auto">
          Join CoopManager and take your cooperative management to the next
          level. Free trial available for all new users.
        </p>
        <a
          href="#"
          className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
        >
          Start Free Trial
        </a>
      </section>
    </main>
  );
};

export default LandingPage;
