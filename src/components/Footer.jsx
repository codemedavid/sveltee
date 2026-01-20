import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer animate-fade-in delay-300">
            <p className="footer-tagline">
                Science meets beauty
            </p>
            <p className="footer-copyright">
                © {new Date().getFullYear()} SVELTEE
            </p>
        </footer>
    );
};

export default Footer;
