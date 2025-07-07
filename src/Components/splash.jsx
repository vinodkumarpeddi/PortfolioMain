import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotLoader } from "react-spinners";
import './splash.css'
const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center min-h-screen 
                   bg-gradient-to-br from-[#0A192F] via-[#1E3A8A] to-[#2563EB] overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1 } }}
      >
        {/* Holographic Rotating Ring */}
        <motion.div
          className="absolute w-56 h-56 border-[6px] border-blue-500 rounded-full opacity-60 shadow-2xl"
          animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        ></motion.div>

        {/* Energy Waves */}
        <motion.div
          className="absolute w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        ></motion.div>

        {/* Floating 3D Logo with Glowing Effect */}
        <motion.img
          src="/logo.svg"
          alt="Logo"
          className="w-44 h-44 object-contain drop-shadow-[0_0_30px_cyan] rounded-full p-2"
          initial={{ y: -20, scale: 0.5, opacity: 0, rotateY: 180 }}
          animate={{
            y: [0, -10, 0],
            scale: [0.5, 1.5, 1],
            opacity: 1,
            rotateY: [180, 0],
            transition: { duration: 1.5, ease: "easeInOut" },
          }}
          whileHover={{ scale: 1.3, rotateY: 15, filter: "drop-shadow(0 0 30px cyan)" }}
          exit={{ scale: 1.2, opacity: 0, transition: { duration: 0.8 } }}
        />

        {/* Brand Name Animation with Pulsing Effect */}
        <motion.h1
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1, duration: 1 }}
  className="mt-4 text-5xl font-extrabold tracking-wider flex gap-3 dancing-script"
>
  <span className="bg-gradient-to-r from-cyan-400 to-red-600 bg-clip-text text-transparent  ">
    Vinod
  </span>
  <span className="bg-gradient-to-r from-red-400 to-sky-500 bg-clip-text text-transparent ">
    Kumar
  </span>
</motion.h1>


        {/* Energy Beam Behind Brand Name */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-48 h-16 bg-blue-400 blur-xl opacity-40"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        ></motion.div>

        {/* Futuristic Spinning Loader */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeInOut" } }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
        >
          <DotLoader color="#ffffff" size={50} />
        </motion.div>

        {/* Soft Background Motion */}
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPositionX: ["0%", "100%", "0%"] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        ></motion.div>

        {/* Cyberpunk Light Beams */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400 to-transparent rounded-full opacity-30"
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        ></motion.div>

        {/* Rotating 3D Particles */}
        <motion.div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.7, 1.2, 0.7],
              }}
              transition={{
                repeat: Infinity,
                duration: 2 + Math.random() * 2,
                ease: "easeInOut",
              }}
            ></motion.div>
          ))}
        </motion.div>

        {/* Cyber Grid Floor Effect */}
        <motion.div
          className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-blue-500 to-transparent opacity-50"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        ></motion.div>

        {/* 🚀 Warp Speed Entry Animation */}
        <motion.div
          className="absolute inset-0 bg-black opacity-50"
          initial={{ scaleY: 2, opacity: 1 }}
          animate={{ scaleY: 0, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        ></motion.div>

        {/* 🚀 Laser Scan Effect */}
        <motion.div
          className="absolute top-0 left-1/2 w-32 h-1 bg-cyan-400"
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: ["-100%", "100%"], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        ></motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
export default SplashScreen;
