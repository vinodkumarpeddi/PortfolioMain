import { ArcherContainer, ArcherElement } from "react-archer";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const educationData = [
  {
    year: "2022 - 2026",
    title: "Aditya University",
    subtitle: "Information Technology",
    description:
      "Studying Information Technology at Aditya University, gaining expertise in software development, algorithms, and web technologies through hands-on projects.",
    logo: "/clg1.jpg",
  },
  {
    year: "2020 - 2022",
    title: "Chaitanya Junior College",
    subtitle: "Intermediate",
    description:
      "I pursued my education at Chaitanya College, where I secured a 19,000 rank in the EAMCET exam. During my time there, I developed a strong foundation in academics and honed my problem-solving skills.",
    logo: "/clg2.jpeg",
  },
  {
    year: "2019 - 2020",
    title: "ZPHS",
    subtitle: "10th",
    description:
      "Completed 10th grade at ZPHS, building a strong academic foundation and essential skills for future studies.",
    logo: "/clg3.png",
  },
];

const EducationTimeline = () => {
  const educationRef = useRef(null);

  useEffect(() => {
    if (educationRef.current) {
      gsap.fromTo(
        educationRef.current.children,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          stagger: 0.3,
          scrollTrigger: {
            trigger: educationRef.current,
            start: "top 90%",
            end: "top 50%",
            scrub: 0.5,
          },
        }
      );
    }
  }, []);

  return (
    <section id="education" className="section py-10 relative bg-zinc-900">
      <div className="container mx-auto max-w-6xl px-4 sm:px-0 relative">
        <motion.h1
          className="headline-2 mb-16 text-center text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Education
        </motion.h1>

        {/* Animated Gradient Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full sm:w-[400px] md:w-[500px] z-0">
          <svg viewBox="0 0 500 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto animate-pulse">
            <defs>
              <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00c6ff" />
                <stop offset="100%" stopColor="#0072ff" />
              </linearGradient>
            </defs>
            <path
              d="M 250 50 Q 350 200, 150 300 Q 350 400, 250 500 Q 150 600, 250 750"
              stroke="url(#skyGradient)"
              strokeWidth="6"
              strokeDasharray="10, 15"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="drop-shadow(0px 0px 15px rgba(0, 114, 255, 0.8))"
            />
          </svg>
        </div>

        <ArcherContainer strokeColor="transparent">
          <ul ref={educationRef} className="flex flex-col items-center gap-12 w-full relative">
            {educationData.map(({ year, title, subtitle, description, logo }, i) => (
              <ArcherElement key={title} id={`element-${i}`}>
                <motion.li
                  className="flex flex-col sm:flex-row items-center w-full gap-8 sm:items-start z-10"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <motion.div
                    className={`p-6 relative bg-gray-800 text-white rounded-lg Z w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col items-center sm:items-start transition-transform duration-300  ${
                      i % 2 === 0 ? " sm:mr-auto " : " sm:ml-auto"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute -top-10 sm:top-4 right-1/2 sm:right-4 transform translate-x-1/2 sm:translate-x-0 h-20 w-20 md:w-24 md:h-24 lg:right-10 shadow-lg flex items-center justify-center border-2 border-sky-500 rounded-full bg-white overflow-hidden"
                      style={{
                        boxShadow: "0px 4px 10px rgba(0, 255, 255, 0.5)",
                      }}
                    >
                      <img src={logo} alt={`${title} logo`} className="w-full h-full object-cover" />
                    </motion.div>

                    <div className="flex flex-col items-center sm:items-start mt-8 sm:mt-0">
                      <h3 className="text-sky-400 text-lg font-medium">{year}</h3>
                      <h2 className="font-semibold text-xl text-center sm:text-left mt-2">{title}</h2>
                      <h3 className="text-gray-400 mb-2 text-center sm:text-left text-md">{subtitle}</h3>
                      <p className="text-zinc-300 text-center sm:text-left leading-relaxed">{description}</p>
                    </div>
                  </motion.div>
                </motion.li>
              </ArcherElement>
            ))}
          </ul>
        </ArcherContainer>
      </div>
    </section>
  );
};

export default EducationTimeline;
