// app/page.tsx
"use client";

import Image from "next/image";
import React from "react";
import LandingIllustration from "@/public/landingIllustration.jpg";
import darkLandingIllustration from "@/public/darkLandingIllustration.jpg";
import Link from "next/link";
import { Facebook, Github, Twitter } from "@/components/UI/Icons";
import { useSession } from "next-auth/react";
import DashboardPage from "./dashboard/page";

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
      "Adapt the platform to fit your cooperative's unique processes.",
  },
];

const LandingPage: React.FC = () => {
  const { data: session } = useSession();

  if (session?.user) {
    return <DashboardPage />;
  }

  return (
    <main className="space-y-32 w-full">
      {/* Hero Section */}
      <section className="section flex-1 w-full mx-auto bg-background">
        <div className="grid md:grid-cols-2 grid-cols-1 container gap-4 !pt-20">
          <div className="col-span-1 flex flex-col justify-center gap-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-primary">
              Manage Your Cooperative Wisely
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary/90 max-w-2xl mx-auto">
              CoopManager helps your cooperative thrive by organizing members,
              tracking resources, managing finances, and streamlining
              communication — all in one intuitive platform. Make informed
              decisions, boost transparency, and focus on growing your community
              sustainably.
            </p>

            <Link href="/auth/register">
              <button className="bg-cta text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-ctaHover transition shadow-lg shadow-cta/30">
                Start Free Trial
              </button>
            </Link>
          </div>
          <div className="col-span-1 relative">
            <Image
              src={LandingIllustration}
              alt="Cooperative management illustration"
              className="object-cover w-full dark:hidden rounded-2xl dark:border border-lightBorder"
            />
            <Image
              src={darkLandingIllustration}
              alt="Cooperative management illustration"
              className="object-cover w-full hidden dark:block rounded-2xl dark:border border-lightBorder"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section !py-16">
        <h2 className="text-4xl font-bold text-center mb-12 backdrop-blur-lg py-3 w-full max-w-screen-2xl mx-auto border border-secondary rounded-lg bg-background/50">
          Features That Make a Difference
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-background px-6 pb-12 pt-8 rounded-lg border border-lightBorder hover:border-secondary transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-6 h-6 border-2 border-secondary relative rounded-full mb-4">
                <div className="w-14 h-4 border border-secondary rounded-full border-b-0 absolute top-1/2 left-1/4 origin-top-left -rotate-120" />
              </div>
              <h3 className="text-xl text-primary font-bold mb-2">
                {feature.title}
              </h3>
              <p className="text-primary/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="bg-primary/5 backdrop-blur-lg border-y border-lightBorder !py-32 px-6 text-center text-primary section"
      >
        <div className="py-20">
          <h2 className="text-4xl font-bold mb-6">About CoopManager</h2>
          <p className="max-w-3xl mx-auto text-lg mb-8 text-primary/90">
            CoopManager is designed specifically for modern cooperatives by a
            team with over a decade of experience in cooperative management and
            software development. We understand the unique challenges
            cooperatives face in member engagement, resource allocation, and
            financial transparency.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-background p-6 rounded-lg border border-lightBorder hover:border-secondary transition">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <div className="w-6 h-6 bg-secondary rounded-full" />
              </div>
              <h3 className="text-xl font-bold mb-4">Our Mission</h3>
              <p className="text-primary/80">
                To empower cooperatives with technology that enhances
                collaboration, transparency, and sustainable growth.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-lightBorder hover:border-third transition">
              <div className="w-12 h-12 bg-third/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <div className="w-6 h-6 bg-third rounded-full" />
              </div>
              <h3 className="text-xl font-bold mb-4">Our Vision</h3>
              <p className="text-primary/80">
                A world where every cooperative can focus on their community
                impact while we handle the operational complexities.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-lightBorder hover:border-cta transition">
              <div className="w-12 h-12 bg-cta/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <div className="w-6 h-6 bg-cta rounded-full" />
              </div>
              <h3 className="text-xl font-bold mb-4">Our Values</h3>
              <p className="text-primary/80">
                Transparency, collaboration, innovation, and commitment to the
                cooperative movement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-screen-2xl w-full rounded-2xl px-6 text-center backdrop-blur-xl py-16 mx-auto border border-lightBorder bg-background/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="p-6">
            <div className="text-3xl md:text-4xl font-bold text-third mb-2">
              50+
            </div>
            <div className="text-primary/80">Cooperatives</div>
          </div>
          <div className="p-6">
            <div className="text-3xl md:text-4xl font-bold text-third mb-2">
              230+
            </div>
            <div className="text-primary/80">Members</div>
          </div>
          <div className="p-6">
            <div className="text-3xl md:text-4xl font-bold text-third mb-2">
              98%
            </div>
            <div className="text-primary/80">Satisfaction Rate</div>
          </div>
          <div className="p-6">
            <div className="text-3xl md:text-4xl font-bold text-third mb-2">
              24/7
            </div>
            <div className="text-primary/80">Support</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="max-w-screen-2xl mx-auto px-6 !py-16 text-center section"
      >
        <h2 className="text-4xl font-bold mb-12 text-primary">Pricing Plans</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-background px-8 rounded-lg border border-lightBorder hover:border-secondary transition hover:shadow-lg py-20">
            <h3 className="text-2xl font-bold mb-4 text-primary">Basic</h3>
            <p className="text-primary/90 mb-6">
              Free plan for small cooperatives
            </p>
            <p className="text-3xl font-bold mb-6 text-secondary">$0/month</p>
            <ul className="mb-6 text-primary/80 space-y-2">
              <li>Up to 50 members</li>
              <li>Basic tracking</li>
              <li>Email support</li>
              <li>Standard reports</li>
            </ul>
            <Link
              href="/auth/register"
              className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition inline-block"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-background px-8 rounded-lg border-2 border-third relative overflow-hidden shadow-lg shadow-third/20">
            <span className="absolute top-0 right-0 bg-third text-white font-bold px-8 py-2 rounded-bl-2xl">
              Popular
            </span>
            <h3 className="text-2xl font-bold mb-4 text-primary">Pro</h3>
            <p className="text-primary/90 mb-6">For growing cooperatives</p>
            <p className="text-3xl font-bold mb-6 text-third">$29/month</p>
            <ul className="mb-6 text-primary/80 space-y-2">
              <li>Up to 500 members</li>
              <li>Full analytics</li>
              <li>Priority support</li>
              <li>Advanced reporting</li>
              <li>Custom fields</li>
            </ul>
            <Link
              href="/auth/register"
              className="bg-third text-white px-6 py-3 rounded-lg hover:bg-third/90 transition inline-block"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-background px-8 rounded-lg border border-lightBorder hover:border-cta transition hover:shadow-lg py-20">
            <h3 className="text-2xl font-bold mb-4 text-primary">Enterprise</h3>
            <p className="text-primary/90 mb-6">For large-scale cooperatives</p>
            <p className="text-3xl font-bold mb-6 text-cta">Contact us</p>
            <ul className="mb-6 text-primary/80 space-y-2">
              <li>Unlimited members</li>
              <li>Custom workflows</li>
              <li>Dedicated support</li>
              <li>API access</li>
              <li>White-label options</li>
            </ul>
            <Link
              href="/contact"
              className="bg-cta text-white px-6 py-3 rounded-lg hover:bg-ctaHover transition inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Contact / Signup Section */}
      <section
        id="signup"
        className="bg-gradient-to-br from-cta/10 to-third/10 backdrop-blur-lg border border-cta/30 text-primary py-32 px-6 text-center max-w-4xl w-full my-16 rounded-3xl mx-auto section"
      >
        <h2 className="text-4xl font-bold mb-6">Get Started Today</h2>
        <p className="text-primary/90 mb-8 max-w-2xl mx-auto text-lg">
          Join CoopManager and take your cooperative management to the next
          level. Free trial available for all new users.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-cta text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-ctaHover transition shadow-lg shadow-cta/30"
          >
            Start Free Trial
          </Link>
          <Link
            href="/demo"
            className="border border-cta text-cta px-8 py-4 rounded-lg text-lg font-semibold hover:bg-cta hover:text-white transition"
          >
            Book a Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary/5 border-t border-lightBorder text-primary py-16 px-6 section backdrop-blur-lg">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">CoopManager</h3>
              <p className="text-primary/80 mb-6 max-w-md">
                Empowering cooperatives with innovative management solutions.
                We're committed to helping your cooperative thrive through
                technology, transparency, and collaboration.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-primary/70 hover:text-secondary transition"
                >
                  <span className="sr-only">Facebook</span>
                  <Facebook />
                </a>
                <a
                  href="#"
                  className="text-primary/70 hover:text-secondary transition"
                >
                  <span className="sr-only">Twitter</span>
                  <Twitter />
                </a>
                <a
                  href="#"
                  className="text-primary/70 hover:text-secondary transition"
                >
                  <span className="sr-only">GitHub</span>
                  <Github />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-primary/80">
                <li>
                  <a
                    href="#features"
                    className="hover:text-secondary transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-secondary transition"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-secondary transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#signup" className="hover:text-secondary transition">
                    Get Started
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-primary/80">
                <li className="hover:text-secondary transition">
                  miraclecode11@gmail.com
                </li>
                <li className="hover:text-secondary transition">
                  (+250) 794 881 466
                </li>
                <li className="hover:text-secondary transition">
                  Rwanda
                  <br />
                  Kigali City, Remote
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-lightBorder mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary/60 text-sm">
              © {new Date().getFullYear()} CoopManager. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-primary/60 hover:text-secondary text-sm transition"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-primary/60 hover:text-secondary text-sm transition"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-primary/60 hover:text-secondary text-sm transition"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
