import React from "react";
import { motion } from "framer-motion";
import ProjectCard from "./ProjectCard";

const Work = () => {
  const works = [
   {
  imgSrc: "p5.png",
  title: "Exam Seating Management",
  tags: ["MERN Stack", "Automation", "Admin Dashboard", "Development"],
  projectLink: "https://exam-seating-management.vercel.app/",
}
,
    {
      imgSrc: "p1.png",
      title: "GrillBot (AI Mock Interview)",
      tags: ["ReactJs", "NodeJs", "MongoDB", "ExpressJs", "Clerk", "Tailwind CSS"],
      projectLink: "https://grillbot.vercel.app",
    },
    {
      imgSrc: "p2.png",
      title: "Power-X (Fitness Blogger)",
      tags: ["React.js", "Node.js", "MongoDB", "Express.js", "Tailwind CSS"],
      projectLink: "https://power-x-fitness.vercel.app/login",
    },
    {

      
      imgSrc: "project-2.jpg",
      title: "Resume Builder",
      tags: ["React.js", "Node.js", "MongoDB", "Express.js"],
      projectLink: "#",
    },
    {
      imgSrc: "project-3.jpg",
      title: "Travel Website (Travel Tale)",
      tags: ["HTML", "CSS", "JavaScript"],
      projectLink: "https://sivagangadharthecoder.github.io/travel_tale_final/index.html",
    },
    {
      imgSrc: "p4.png",
      title: "Personal Portfolio",
      tags: ["ReactJs", "Tailwind CSS"],
      projectLink: "https://vinodkumarpeddi.vercel.app",
    },
   
  ];

  return (
    <section id="work" className="pt-24 lg:pt-24 pb-14 lg:pb-20 min-h-screen bg-zinc-900">

      <div className="container">
        {/* Section Title */}
        <motion.h2
          className="headline-2 mb-10 text-center reveal-up text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          My Portfolio Highlights
        </motion.h2>

        {/* Project Grid */}
        <motion.div
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.15 } },
          }}
        >
          {works.map((work, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            >
              <ProjectCard
                imgSrc={work.imgSrc}
                title={work.title}
                tags={work.tags}
                projectLink={work.projectLink}
                classes={`reveal-up transition-all duration-300 ${
                  work.projectLink === "#"
                    ? "opacity-75 grayscale hover:opacity-100 hover:grayscale-0"
                    : "hover:shadow-lg hover:shadow-gray-500"
                }`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Work;
