import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HeroSection from '../../components/public/HeroSection';
import ServicesSection from '../../components/public/ServicesSection';
import WhyChooseUsSection from '../../components/public/WhyChooseUsSection';
import RepairProcessSection from '../../components/public/RepairProcessSection';
import TrackRepairSection from '../../components/public/TrackRepairSection';
import CTASection from '../../components/public/CTASection';

export default function LandingPage() {
  const { onOpenBooking, onScrollToSection } = useOutletContext() || {};

  return (
    <>
      <HeroSection
        onOpenBooking={onOpenBooking}
        onScrollToSection={onScrollToSection}
      />

      <ServicesSection
        onOpenBooking={onOpenBooking}
      />

      <RepairProcessSection />

      <WhyChooseUsSection />

      <TrackRepairSection />

      <CTASection
        onOpenBooking={onOpenBooking}
        onScrollToSection={onScrollToSection}
      />
    </>
  );
}
