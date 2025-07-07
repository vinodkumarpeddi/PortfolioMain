import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import './slick.css';

gsap.registerPlugin(ScrollTrigger);

const certificates = [
  {
    title: "ServiceNow CSA",
    imgSrc: "/OIP.jpeg",
    certificateLink: "#",
    description:
      "The ServiceNow Certified System Administrator (CSA) certification validates foundational knowledge of the ServiceNow platform, including navigation, user interfaces, data management, security, and automation.",
  },
  {
    title: "ServiceNow CAD",
    imgSrc: "/OIP.jpeg",
    certificateLink: "https://link-to-cad-cert",
    description:
      "The ServiceNow Certified Application Developer (CAD) certification demonstrates expertise in designing, building, and implementing applications on the ServiceNow platform using best development practices.",
  },
  {
    title: "ServiceNow Micro",
    imgSrc: "/OIP.jpeg",
    certificateLink: "https://media.licdn.com/dms/image/v2/D5622AQGg_N4t3i73Vw/feedshare-shrink_800/B56ZS8vGawHwAg-/0/1738333251922?e=1743033600&v=beta&t=nIPTMR5pO7iGgB-8HrhbUP9ZgYAGicnqfXStNbgqTXs",
    description:
      "ServiceNow Micro-Certifications validate specialized skills in Flow Designer, Integration Hub, and Performance Analytics.",
  },
  {
    title: "Cisco (JavaScript Essentials 1)",
    imgSrc: "/cisco.jpeg",
    certificateLink: "https://drive.google.com/file/d/1KqBQnFNRdb3YExxZqigXFWGiTF2mVmRI/view",
    description:
      "The Cisco JavaScript Essentials 1 certification validates foundational knowledge of JavaScript programming, preparing learners for web development.",
  },
  {
    title: "IT Specialist (Pearson)",
    imgSrc: "/R.png",
    certificateLink: "https://media.licdn.com/dms/image/v2/D5622AQH7DwVXlhc0zQ/feedshare-shrink_800/feedshare-shrink_800/0/1683561671370?e=1743033600&v=beta&t=x3hUeU35-x0r0Eg_awWJsAgPM2I9NMm7WZwHpTX-zcQ",
    description:
      "The IT Specialist certification by Pearson validates foundational skills in software development, networking, cybersecurity, and databases.",
  },
];

const CertificatesPage = () => {
  const certificatesRef = useRef(null);
  const [showDots, setShowDots] = useState(window.innerWidth > 640);

  useEffect(() => {
    if (certificatesRef.current) {
      gsap.fromTo(
        certificatesRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: certificatesRef.current,
            start: "top 85%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Optimize window resize listener
    const handleResize = () => setShowDots(window.innerWidth > 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const settings = {
    dots: showDots,
    infinite: true,
    speed: 600, // Faster transition speed
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000, // Smoother autoplay timing
    arrows: false,
    swipe: true,
    touchMove: true,
    lazyLoad: "progressive", // Optimized image loading
  };

  return (
    <section id="certs" className="py-10 bg-zinc-900">
      <div className="container mx-auto px-4">
        <h2 className="headline-2 mb-10 text-center text-white">Certifications</h2>

        {/* Slider Wrapper */}
        <div className="w-full mx-auto sm:w-3/4" ref={certificatesRef}>
          <Slider {...settings}>
            {certificates.map(({ title, imgSrc, certificateLink, description }, index) => (
              <div key={index} className="px-4">
                <div className="relative flex flex-col sm:flex-row items-center bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md shadow-lg p-6 sm:p-4 rounded-xl transition-transform transform hover:scale-[1.04] hover:shadow-2xl duration-500 group will-change-transform min-h-[350px] sm:min-h-[250px]">
                  
                  {/* ✨ Floating Glow Effect */}
                  <div className="absolute -top-3 left-4 w-16 h-16 rounded-full bg-blue-500/20 blur-3xl opacity-40 group-hover:opacity-100 transition duration-500"></div>
                  <div className="absolute -bottom-3 right-4 w-16 h-16 rounded-full bg-purple-500/20 blur-3xl opacity-40 group-hover:opacity-100 transition duration-500"></div>

                  {/* 🖼 Image Section */}
                  <div className="w-full sm:w-1/3 flex justify-center p-4">
                    <img
                      src={imgSrc}
                      alt={title}
                      className="rounded-lg shadow-lg object-cover w-32 h-32 sm:w-40 sm:h-40 transition-transform transform group-hover:scale-105 duration-300"
                    />
                  </div>

                  {/* 📜 Description Section */}
                  <div className="w-full sm:w-2/3 text-center sm:text-left p-4 flex flex-col justify-between h-full">
                    <h3 className="text-lg font-extrabold text-white tracking-wide drop-shadow-md group-hover:text-blue-400 transition duration-300">
                      {title}
                    </h3>

                    <p className="mt-2 text-gray-300 text-xs md:text-sm leading-relaxed font-light flex-grow">
                      {description}
                    </p>

                    {/* 🎓 Certificate Button */}
                    <div className="mt-5 flex justify-center sm:justify-start">
                      {certificateLink !== "#" ? (
                        <a
                          href={certificateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 hover:shadow-blue-500/50 group-hover:ring-2 ring-blue-500 transition-shadow shadow-md duration-300"
                        >
                          🎓 View Certificate
                        </a>
                      ) : (
                        <span className="inline-block text-sm px-4 py-2 rounded-lg bg-gray-600 text-gray-300 opacity-75 cursor-not-allowed">
                          🚀 Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default CertificatesPage;
