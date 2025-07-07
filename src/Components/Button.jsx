import React from 'react';
import PropTypes from 'prop-types';

const ButtonPrimary = ({ href, target = '_self', label, icon, classes, download }) => {
  if (href) {
    return (
      <a 
        href={href} 
        target={target} 
        rel={target === '_blank' ? 'noopener noreferrer' : undefined} 
        className={`btn btn-primary ${classes || ''}`} 
        download={download ? download : undefined} // Ensures correct behavior for downloads
      >
        {label}
        {icon && (
          <span className="material-symbols-rounded" aria-hidden="true">
            {icon}
          </span>
        )}
      </a>
    );
  } else {
    return (
      <button className={`btn btn-primary ${classes || ''}`}>
        {label}
        {icon && (
          <span className="material-symbols-rounded" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
};

ButtonPrimary.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string,
  target: PropTypes.string,
  icon: PropTypes.string,
  classes: PropTypes.string,
  download: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), // Allows both string (filename) and boolean
};

// ButtonOutline remains unchanged
const ButtonOutline = ({ href, target = '_self', label, icon, classes }) => {
  if (href) {
    return (
      <a 
        href={href} 
        target={target} 
        className={`btn btn-outline ${classes || ''}`}
      >
        {label}
        {icon && (
          <span className="material-symbols-rounded" aria-hidden="true">
            {icon}
          </span>
        )}
      </a>
    );
  } else {
    return (
      <button className={`btn btn-outline ${classes || ''}`}>
        {label}
        {icon && (
          <span className="material-symbols-rounded" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
};

ButtonOutline.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string,
  target: PropTypes.string,
  icon: PropTypes.string,
  classes: PropTypes.string,
};

export { ButtonPrimary, ButtonOutline };
