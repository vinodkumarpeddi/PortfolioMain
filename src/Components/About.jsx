import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const About = () => {
  const aboutItems = [
    { label: "Projects Done", number: 10 },
    { label: "Years of Experience", number: 2 },
  ];

  const [counts, setCounts] = useState(aboutItems.map(() => 0));

  useEffect(() => {
    aboutItems.forEach((item, index) => {
      let start = 0;
      const step = Math.ceil(item.number / 40);
      const updateCounter = () => {
        start += step;
        if (start >= item.number) {
          start = item.number;
        }
        setCounts((prevCounts) => {
          if (prevCounts[index] !== start) {
            const newCounts = [...prevCounts];
            newCounts[index] = start;
            return newCounts;
          }
          return prevCounts;
        });
        if (start < item.number) {
          requestAnimationFrame(updateCounter);
        }
      };
      requestAnimationFrame(updateCounter);
    });
  }, []);

  return (
    <section id="about" className="relative section bg-zinc-900 py-16">
      <div className="container relative z-10">
        
        {/* Glassmorphism Card */}
        <motion.div
          className="bg-zinc-800/80 backdrop-blur-xl border border-white/20 p-8 md:p-14 rounded-3xl shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Animated Text Reveal */}
          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Welcome! I'm{" "}
            <span className="text-sky-400 font-semibold">Vinod Kumar</span>, a
            passionate web developer who thrives on creating visually stunning
            and highly functional websites. With a blend of creativity and
            technical expertise, I bring digital visions to life that excel in
            both performance and aesthetics.
          </motion.p>

          {/* Stats Section */}
          <div className="flex flex-wrap items-center gap-8 md:gap-12 mt-8">
            {aboutItems.map(({ label }, key) => (
              <motion.div
                key={key}
                className="relative group text-center transform transition duration-300 hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: key * 0.3, duration: 0.6 }}
              >
                {/* Counter Animation */}
                <motion.div
                  className="flex items-center justify-center mb-2 relative z-10"
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: key * 0.2, duration: 0.5, ease: "easeOut" }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="text-5xl font-extrabold md:text-6xl text-white drop-shadow-md"
                  >
                    {counts[key]}
                  </motion.span>
                  <span className="text-sky-400 font-semibold text-4xl md:text-5xl">
                    +
                  </span>
                </motion.div>

                <p className="text-sm text-gray-400 md:text-base">{label}</p>
              </motion.div>
            ))}

            {/* Floating Logo with Hover Effect */}
            <motion.div
              className="ml-auto hidden md:block"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              whileHover={{ scale: 1.2, rotate: 15 }}
            >
              <img
                src="logo.svg"
                alt="logo"
                width={60}
                height={60}
                className="opacity-80 transition-transform duration-500 hover:scale-125"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
