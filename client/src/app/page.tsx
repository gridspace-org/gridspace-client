"use client";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import {
  Navigation,
  HeroSection,
  HowItWorks,
  WhyChoose,
  PopularSpaces,
  Testimonials,
  CallToAction,
  Newsletter,
  Footer,
  FeaturedSpaces,
  HostingWorkspace,
} from "./components";

export default function Home() {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      // Fade in animation for sections
      const sections = [
        ".popular-spaces",
        ".how-it-works",
        ".why-choose",
        ".featured-spaces",
        ".hosting-workspace",
        ".testimonials",
        ".cta-section",
        ".newsletter",
      ];

      sections.forEach((section) => {
        gsap.fromTo(
          section,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "top 50%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Hero section animation on load
      gsap.fromTo(
        ".hero-section",
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.5,
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--color-bg-secondary)]"
    >
      <Navigation />
      <div className="hero-section opacity-0">
        <HeroSection />
      </div>
      <div className="popular-spaces opacity-0">
        <PopularSpaces />
      </div>
      <div className="how-it-works opacity-0">
        <HowItWorks />
      </div>
      <div className="why-choose opacity-0">
        <WhyChoose />
      </div>
      <div className="featured-spaces opacity-0">
        <FeaturedSpaces />
      </div>
      <div className="hosting-workspace opacity-0">
        <HostingWorkspace />
      </div>
      <div className="testimonials opacity-0">
        <Testimonials />
      </div>
      <div className="cta-section opacity-0">
        <CallToAction />
      </div>
      <div className="newsletter opacity-0">
        <Newsletter />
      </div>
      <Footer />
    </div>
  );
}
