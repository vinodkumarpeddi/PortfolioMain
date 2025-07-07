import React, { useState, useEffect } from 'react';
import Header from './Components/Header';
import Hero from './Components/Hero';
import About from './Components/About';
import Skill from './Components/Skill';
import Work from './Components/Work';
import Contact from './Components/contact';
import Footer from './Components/Footer';
import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import CertificatesPage from './Components/Certs';
import EducationTimeline from './Components/EducationTimeline';
import SplashScreen from './Components/splash'; // Ensure correct file name
import { Analytics } from "@vercel/analytics/next"


gsap.registerPlugin(ScrollTrigger); // ✅ Only register ScrollTrigger

const App = () => {
  const [loading, setLoading] = useState(true);

  // Hide SplashScreen after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useGSAP(() => {
    if (!loading) {
      // Only run animations after splash screen disappears
      const elements = gsap.utils.toArray('.reveal-up');
      elements.forEach((element) => {
        gsap.fromTo(
          element,
          { y: 50, opacity: 0 },
          {
            scrollTrigger: {
              trigger:element,
              start:'-200 bottom',
              end:'bottom 80%',
              scrub:true
            },
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power1.inOut',
          }
        );
      });
    }
  }, [loading]); // ✅ Runs when `loading` changes

  return (
    <>
      {loading ? (
        <SplashScreen onComplete={() => setLoading(false)} />
      ) : (
        <ReactLenis root>
          <Header />
          <main>
            <Hero />
            <About />
            <Skill />
            <Work />
            <EducationTimeline />
            <CertificatesPage />
            <Contact />
          </main>
          <Footer />
        </ReactLenis>
      )}
    </>
  );
};

export default App;
