import React from 'react';
import { motion } from "framer-motion";
import { ButtonPrimary, ButtonOutline } from './Button';

const textVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.5 } },
};

const Hero = () => {
  return (
    <section id="home" className="pt-28 lg:pt-36 ">
      <div className="container lg:grid lg:grid-cols-2 items-center lg:gap-10">

        {/* Left Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={textVariants}
        >
          {/* Avatar & Availability */}
          <div className="flex items-center gap-3">
            <figure className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 p-1">
              <img 
                src="main.png" // Use WebP format if available
                width={60}
                height={60}
                alt="Vinod Kumar"
                className="rounded-lg shadow-md"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="flex items-center gap-1.5 text-zinc-400 text-sm tracking-wide">
              <span className="relative w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-white">Available for Work</span>
            </div>
          </div>

          {/* Headline */}
          <h2 className="headline-1 max-w-[20ch] mt-6 mb-8 text-white text-shadow-lg">
            Building Scalable Modern Websites for the Future
          </h2>

          {/* Buttons */}
          <motion.div 
            className="flex flex-wrap items-center gap-3"
            initial="hidden"
            animate="visible"
            variants={buttonVariants}
          >
            <ButtonPrimary 
              href="/Vinod_Resume.pdf"
              label="Download CV"
              icon="download"
              download="Vinod_Resume.pdf"
              className="w-full sm:w-auto transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1"
            />

            <ButtonOutline
              href="#about"
              label="Scroll down"
              icon="arrow_downward"
              className="w-full sm:w-auto transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1"
            />
          </motion.div>
        </motion.div>

        {/* Right Section */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <figure className="w-full max-w-[480px] ml-auto bg-gradient-to-t from-sky-400 via-25% via-sky-400 to-55% rounded-[60px] overflow-hidden">
            <img 
              src="main.png"
              width={656}
              height={800}
              alt="Vinod"
              className="w-full"
              loading="lazy"
            />
          </figure>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
