// src/pages/LandingPage.jsx
import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import About from '../components/About';
import Architecture from '../components/Architecture';
import Contact from '../components/Contact';

const LandingPage = () => {
  return (
    <>
      <Hero />
      <Features />
      <About />
      <Architecture />
      <Contact />
    </>
  );
};

export default LandingPage;
