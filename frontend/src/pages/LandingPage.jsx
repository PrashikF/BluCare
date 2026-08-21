// src/pages/LandingPage.jsx
import React from 'react';
import Hero from '../components/Hero';
import Cocktails from '../components/Cocktails';
import About from '../components/About';
import Menu from '../components/Menu';
import Contact from '../components/Contact';

const LandingPage = () => {
  return (
    <>
      <Hero />
      <Cocktails />
      <About />
      <Menu />
      <Contact />
    </>
  );
};

export default LandingPage;
