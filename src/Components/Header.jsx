import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';

const Header = () => {
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef(null);

  // Close navbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navOpen && navRef.current && !navRef.current.contains(event.target)) {
        setNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navOpen]);

  return (
    <header className="fixed top-0 left-0 w-full h-20 flex items-center z-50 bg-gradient-to-b from-zinc-900 to-transparent">
      <div className="max-w-screen-2xl w-full mx-auto px-4 flex justify-between items-center md:px-6">
        
        {/* Logo */}
        <h1>
          <a href="/" className="logo">
            <img src="/logo.svg" width={40} height={40} alt="Vinod Logo" />
          </a>
        </h1>

        {/* Navbar */}
        <div className="relative md:justify-self-center" ref={navRef}>
          <button 
            className="menu-btn" 
            onClick={() => setNavOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            aria-expanded={navOpen}
          >
            <span className="material-symbols-rounded">
              {navOpen ? 'close' : 'menu'}
            </span>
          </button>
          <Navbar navOpen={navOpen} />
        </div>

        {/* Contact Button */}
        <a
  href="#contact"
  className="hidden md:block px-6 py-2 rounded-lg font-medium text-white 
    bg-gradient-to-r from-cyan-400 to-purple-500 
    text-sm
    hover:from-cyan-300 hover:to-purple-400 
    transition-transform transform hover:scale-110 
    shadow-[0_0_10px_rgba(0,255,255,0.6),0_0_20px_rgba(138,43,226,0.6)]"
>
  Contact Me
</a>

      </div>
    </header>
  );
};

export default Header;
