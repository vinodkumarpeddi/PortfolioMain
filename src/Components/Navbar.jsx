import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const Navbar = ({ navOpen }) => {
  const lastActiveLink = useRef(null);
  const activebox = useRef(null);
  const homeLinkRef = useRef(null);
  const aboutLinkRef = useRef(null);
  const workLinkRef = useRef(null);
  const educationLinkRef = useRef(null);
  const certsLinkRef = useRef(null);
  const contactLinkRef = useRef(null);

  const updateActiveBox = (target) => {
    if (activebox.current && target) {
      activebox.current.style.top = `${target.offsetTop}px`;
      activebox.current.style.left = `${target.offsetLeft}px`;
      activebox.current.style.width = `${target.offsetWidth}px`;
      activebox.current.style.height = `${target.offsetHeight}px`;
    }
  };

  const activecurrentlink = (event) => {
    if (lastActiveLink.current) {
      lastActiveLink.current.classList.remove("active");
    }

    event.target.classList.add("active");
    lastActiveLink.current = event.target;

    updateActiveBox(event.target);
  };

  useEffect(() => {
    if (homeLinkRef.current) {
      homeLinkRef.current.classList.add("active");
      lastActiveLink.current = homeLinkRef.current;
      updateActiveBox(homeLinkRef.current);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (lastActiveLink.current) {
        updateActiveBox(lastActiveLink.current);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { label: "Home", link: "#home", className: "nav-link", ref: homeLinkRef },
    { label: "About", link: "#about", className: "nav-link", ref: aboutLinkRef },
    { label: "Work", link: "#work", className: "nav-link", ref: workLinkRef },
    { label: "Education", link: "#education", className: "nav-link", ref: educationLinkRef },
    { label: "Certificates", link: "#certs", className: "nav-link", ref: certsLinkRef },
    { label: "Contact", link: "#contact", className: "nav-link md:hidden", ref: contactLinkRef },
  ];

  return (
    <nav className={`navbar ${navOpen ? "active" : ""}`}>
      {navItems.map(({ label, link, className, ref }, key) => (
        <a href={link} key={key} ref={ref} className={className} onClick={activecurrentlink}>
          {label}
        </a>
      ))}
      <div className="active-box" ref={activebox}></div>
    </nav>
  );
};

Navbar.propTypes = {
  navOpen: PropTypes.bool.isRequired,
};

export default Navbar;
