import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HeroSection from '../../components/public/HeroSection';
import ServicesSection from '../../components/public/ServicesSection';
import WhyChooseUsSection from '../../components/public/WhyChooseUsSection';
import RepairProcessSection from '../../components/public/RepairProcessSection';
import CTASection from '../../components/public/CTASection';

export default function LandingPage() {
  const { onScrollToSection } = useOutletContext() || {};

  return (
    <>
      <HeroSection />

      <ServicesSection />

      <RepairProcessSection />

      <WhyChooseUsSection />

      <CTASection
        onScrollToSection={onScrollToSection}
      />
    </>
  );
}
