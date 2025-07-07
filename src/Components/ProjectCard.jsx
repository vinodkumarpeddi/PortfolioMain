import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { FaExternalLinkAlt } from "react-icons/fa";

const ProjectCard = ({ imgSrc, title, tags, projectLink, classes }) => {
  return (
    <motion.div
      className={`relative p-5 rounded-xl bg-zinc-900/90 shadow-md border border-zinc-700 transition-all duration-500 
      hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 ${classes}`}
    >
      {/* Project Image */}
      <figure className="relative rounded-lg overflow-hidden mb-4">
        <img
          src={imgSrc}
          alt={`Project preview of ${title}`}
          loading="lazy"
          className="w-full h-48 md:h-56 lg:h-64 object-cover rounded-lg"
        />
      </figure>

      {/* Project Info */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg md:text-xl font-semibold text-white">{title}</h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((label, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs md:text-sm text-white bg-blue-500/20 border border-blue-500 rounded-full"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Project Link Button - Show only if valid link */}
      {projectLink && projectLink !== "#" && (
        <a
          href={projectLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md 
          hover:bg-blue-600 hover:shadow-lg transition-all duration-300"
        >
          <FaExternalLinkAlt size={16} />
        </a>
      )}
    </motion.div>
  );
};

ProjectCard.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  projectLink: PropTypes.string,
  classes: PropTypes.string,
};

export default ProjectCard;
