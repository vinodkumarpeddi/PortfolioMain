import React, { useEffect } from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import gsap from "gsap";

const Contact = () => {
  useEffect(() => {
    gsap.from(".reveal-up", {
      opacity: 0,
      y: 50,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
    });
  }, []);

  const socialLinks = [
    { href: "https://github.com/vinodkumarpeddi", icon: <FaGithub />, alt: "GitHub" },
    { href: "https://www.linkedin.com/in/vinod-kumar-peddi-4a34b7262/", icon: <FaLinkedin />, alt: "LinkedIn" },
    { href: "https://x.com/vinod_kumar_200", icon: <FaTwitter />, alt: "Twitter X" },
    { href: "https://www.instagram.com/vinod_kumar_02_/", icon: <FaInstagram />, alt: "Instagram" },
  ];

  return (
    <section id="contact" className="relative p-10 bg-zinc-900 text-white rounded-2xl shadow-lg overflow-hidden">
      <div className="container mx-auto relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:items-stretch">
          
          {/* Left Side */}
          <div className="mb-12 lg:mb-0 lg:flex lg:flex-col reveal-up">
            <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r  from-blue-400 to-purple-500 drop-shadow-lg">
              Let&apos;s Work Together!
            </h2>
            <p className="text-zinc-400 mb-8 max-w-md">
              Get in touch to start an exciting collaboration! I'm always open to new opportunities.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map(({ href, icon, alt }, key) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center w-14 h-14 text-xl bg-zinc-800 hover:bg-gradient-to-r from-blue-500 to-purple-600 transition-all rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 reveal-up"
                  aria-label={alt}
                >
                  {icon}
                  {/* Tooltip */}
                  <span className="absolute -bottom-10 hidden group-hover:flex px-3 py-1 text-sm text-white bg-black bg-opacity-80 rounded-md shadow-lg transition-all">
                    {alt}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <form
            action="https://getform.io/f/bpjjdywb"
            method="POST"
            className="max-w-lg mx-auto lg:pl-10 2xl:pl-20 bg-zinc-800 p-8 rounded-xl shadow-xl border border-zinc-700 backdrop-blur-md reveal-up"
          >
            <div className="md:grid md:grid-cols-2 md:gap-4">
              {/* Name Input */}
              <div className="mb-4">
                <label htmlFor="name" className="text-zinc-300">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  placeholder="Vinod Kumar"
                  className="w-full p-3 rounded-lg bg-zinc-700 border-none focus:ring-2 focus:ring-blue-500 text-white transition"
                />
              </div>

              {/* Email Input */}
              <div className="mb-4">
                <label htmlFor="email" className="text-zinc-300">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="vinod@gmail.com"
                  className="w-full p-3 rounded-lg bg-zinc-700 border-none focus:ring-2 focus:ring-blue-500 text-white transition"
                />
              </div>
            </div>

            {/* Message Textarea */}
            <div className="mb-4">
              <label htmlFor="message" className="text-zinc-300">Message</label>
              <textarea
                name="message"
                id="message"
                required
                placeholder="Hey Vinod, let's work on something amazing!"
                className="w-full p-3 rounded-lg bg-zinc-700 border-none focus:ring-2 focus:ring-blue-500 text-white transition resize-y min-h-32 max-h-80"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transition-all duration-300 hover:scale-105 shadow-md focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Send Message 
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;


