import React from "react";
import PropTypes from "prop-types";

const Skillcard = ({ imgSrc, label, desc, glowColor = "white", classes = "" }) => {
    const colorMap = {
        cyan: "group-hover:text-cyan-400",
        blue: "group-hover:text-blue-400",
        orange:"group-hover:text-orange-400",
        yellow: "group-hover:text-yellow-400",
        green: "group-hover:text-green-400",
        gray: "group-hover:text-gray-400",
        sky: "group-hover:text-sky-400",
        red: "group-hover:text-red-400",
        purple: "group-hover:text-purple-400",
        white: "group-hover:text-white",
    };

    return (
        <div 
            className={`flex items-center gap-4 ring-2 ring-inset ring-zinc-50/10 rounded-2xl p-4 bg-white/10 backdrop-blur-md shadow-lg 
            hover:bg-zinc-800/60 hover:scale-105 transition-all duration-300 group ${classes}`}
        >
            {/* Icon Box with Glow Effect */}
            <figure className="relative bg-zinc-900/50 rounded-lg overflow-hidden w-10 h-10 p-2 group-hover:bg-zinc-900 transition-all shadow-md">
                <img 
                    src={imgSrc} 
                    width={36}
                    height={36}
                    alt={label} 
                    className="transition-all group-hover:scale-110"
                />
                {/* Glowing Effect on Hover */}
                <div className={`absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity rounded-lg`} 
                    style={{ backgroundColor: `${glowColor}20` }} // Adjust glow color dynamically
                ></div>
            </figure>

            {/* Skill Info */}
            <div>
                <h3 className={`text-lg font-semibold text-white transition-colors ${colorMap[glowColor] || colorMap.white}`}>
                    {label}
                </h3>
                <p className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">
                    {desc}
                </p>
            </div>
        </div>
    );
};

Skillcard.propTypes = {
    imgSrc: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    glowColor: PropTypes.string,
    classes: PropTypes.string
};

export default Skillcard;
