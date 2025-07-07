import React from "react";
import { ButtonPrimary } from "./Button";
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const sitemap = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Education", href: "#education" },
    { label: "Certificates", href: "#certs" },
    { label: "Contact", href: "#contact" },
  ];

  const socials = [
    { label: "GitHub", href: "https://github.com/vinodkumarpeddi", icon: <FaGithub /> },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/vinod-kumar-peddi-4a34b7262/", icon: <FaLinkedin /> },
    { label: "Twitter X", href: "https://x.com/vinod_kumar_200", icon: <FaTwitter /> },
    { label: "Instagram", href: "https://www.instagram.com/vinod_kumar_02_/", icon: <FaInstagram /> },
  ];

  return (
    <footer className="relative bg-black text-white py-16 px-8 overflow-hidden">
      {/* Floating Blurred Glow */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-blue-500 opacity-20 blur-[100px]"></div>

      <div className="container mx-auto relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">

          {/* Left Section */}
          <div className="mb-12 text-center lg:text-left">
            <h2 className="text-4xl font-extrabold text-transparent  bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg mb-6 animate-pulse">
              Let&apos;s create something amazing! 
            </h2>
            <ButtonPrimary
              href="mailto:vinod783058@gmail.com"
              label="Start a Project"
              icon="chevron_right"
              classes="reveal-up bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 transition-transform transform hover:scale-105 shadow-lg px-6 py-3 rounded-lg"
            />
          </div>

          {/* Right Section */}
          <div className="grid grid-cols-2 gap-6 lg:pl-20">
            
            {/* Sitemap Links */}
            <div>
              <p className="text-lg font-semibold text-zinc-300 mb-3">Sitemap</p>
              <ul>
                {sitemap.map(({ label, href }, key) => (
                  <li key={key} className="mb-2">
                    <a
                      href={href}
                      className="block text-sm text-zinc-400 transition duration-300 hover:text-white hover:translate-x-1 hover:scale-105"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div className="w-full text-center sm:text-left">
  <p className="text-lg font-semibold text-zinc-300 mb-3">Socials</p>
  <ul className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center lg:min-w-3xl sm:justify-start gap-3">
    {socials.map(({ label, href, icon }, key) => (
      <li key={key}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-3 text-xl text-zinc-400 transition-all duration-300 hover:text-white hover:scale-110 bg-zinc-800 hover:bg-zinc-700 rounded-full shadow-md hover:shadow-xl w-12 h-12"
          aria-label={label}
        >
          {icon}
        </a>
      </li>
    ))}
  </ul>
</div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row md:justify-between items-center pt-12 mt-8 border-t border-zinc-700">
          
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 text-lg font-bold text-white hover:scale-105 transition">
            <img src="logo.svg" width={40} height={40} alt="logo" />
            <span className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Vinod Kumar Peddi
            </span>
          </a>

          {/* Copyright */}
          <p className="text-zinc-500 text-sm mt-4 md:mt-0 sm:flex-wrap">
            &copy; 2025 <span className="text-white">Vinod Kumar Peddi</span>
            . All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
