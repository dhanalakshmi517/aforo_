import React from "react";
import "./Landing.css";
import LandNavBar from "../LandingComponents/LandNavBar";
import HeroSection from "./HeroSection";
import BuiltSection from "./BuiltSection";
import PricingMarquee from "./PricingMarquee";
import AudienceSection from "./AudienceSection";
import FAQSection, { FAQItem } from "./FAQSection";
import Footer from "./Footer";
import ProductShowcaseScroll from "./ProductShowcaseScroll";
import TestimonialBox from "./TestimonialBox";
import SecuritySection from "./SecuritySection";
import IntegrationsSection from "./IntegrationsSection";
import InsightCards from "./InsightCards";

const faqItems: FAQItem[] = [
  {
    q: "What is usage-based pricing?",
    a: "Usage-based pricing charges customers based on their actual consumption of your product or service, such as API calls, data processed, or tokens used.",
  },
  {
    q: "How does Aforo handle metering?",
    a: "Aforo tracks usage in real-time with millisecond-level accuracy, supporting APIs, LLM tokens, file delivery, and custom events.",
  },
  {
    q: "Can I mix different pricing models?",
    a: "Yes! Aforo supports flat-fee, tiered, volume-based, and per-transaction models. You can combine them for different customer segments.",
  },
  {
    q: "Does Aforo integrate with my existing systems?",
    a: "Aforo offers native integrations with API gateways, billing platforms, and portals. We also provide flexible APIs for custom integrations.",
  },
  {
    q: "How quickly can I get started?",
    a: "Most teams are up and running within days. Our onboarding process is designed to be fast and straightforward.",
  },
  {
    q: "What kind of support do you offer?",
    a: "We provide dedicated support for all customers, including implementation assistance, technical documentation, and ongoing optimization guidance.",
  },
];

const Landing: React.FC = () => {
  return (
    <>
      <LandNavBar active="home" />
      <main>
        <HeroSection />
        <BuiltSection />
        <PricingMarquee />
        <AudienceSection />
                <ProductShowcaseScroll />
                <IntegrationsSection />
                  <InsightCards />

        <FAQSection items={faqItems} />
        <SecuritySection />
                <TestimonialBox />

        <Footer />
      </main>
    </>
  );
};

export default Landing;
