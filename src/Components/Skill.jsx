import React from "react";
import { motion } from "framer-motion";
import Skillcard from "./skillcard";

const Skill = () => {
  const skillItem = [
    { imgSrc: "/c.svg", label: "C", desc: "Problem Solving", color: "cyan" },
    { imgSrc: "/html.svg", label: "Html", desc: "Markup Language", color: "orange" },
    { imgSrc: "/css3.svg", label: "CSS", desc: "User Interface", color: "blue" },
    { imgSrc: "/javascript.svg", label: "JavaScript", desc: "Interaction", color: "yellow" },
    { imgSrc: "/nodejs.svg", label: "NodeJS", desc: "Web Server", color: "green" },
    { imgSrc: "/expressjs.svg", label: "ExpressJS", desc: "Node Framework", color: "gray" },
    { imgSrc: "/mongodb.svg", label: "MongoDB", desc: "Database", color: "green" },
    { imgSrc: "/react.svg", label: "React", desc: "Framework", color: "sky" },
    { imgSrc: "/icons8-next.js.svg", label: "NextJs", desc: "Framework", color: "gray" },
    { imgSrc: "/tailwindcss.svg", label: "TailwindCSS", desc: "User Interface", color: "blue" },
    { imgSrc: "/icons8-java-logo-96.svg", label: "Java", desc: "Problem Solving", color: "red" },
    { imgSrc: "/icons8-c++.svg", label: "C++", desc: "Problem Solving", color: "purple" },

  {
    imgSrc: "/icons8-python.svg",
    label: "Python",
    desc: "Problem Solving",
    color: "yellow"
  },
  {
    imgSrc: "/icons8-react-native.svg", // corrected icon for React Native
    label: "React Native",
    desc: "Mobile Development",
    color: "blue"
  },
  {
    imgSrc: "/sql.svg", // corrected icon for SQL
    label: "SQL",
    desc: "Database",
    color: "green"
  }


  ];

  return (
    <section className="section">
      <div className="container">
        {/* Title */}
        <motion.h2 
          className="headline-2 reveal-up text-white text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Essential Tools I Use...
        </motion.h2>
        
        {/* Description */}
        <motion.p 
          className="text-zinc-400 mt-3 mb-8 max-w-[50ch] mx-auto text-center reveal-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Discover the powerful tools and technologies I use to create exceptional, high-performing websites & applications.
        </motion.p>
        
        {/* Skills Grid */}
        <motion.div 
          className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {skillItem.map(({ imgSrc, label, desc, color }, index) => (
            <Skillcard 
              key={index} 
              imgSrc={imgSrc} 
              label={label} 
              desc={desc} 
              classes="reveal-up"
              glowColor={color} // Adding dynamic glow
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skill;
