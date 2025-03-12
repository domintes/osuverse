import React from "react";
import { Link } from "react-router-dom";
import '@fontsource-variable/orbitron';

export default function OsuverseLogo() {
    return (
        <Link to="/" className="osuverse-logo-container">
            <div className="wonderful-void"></div>
            <div className="osuverse-logo">
                <span className="osuniverse-logo-letter-first">O</span>
                <span className="osuniverse-logo-letter">S</span>
                <span className="osuniverse-logo-letter">U</span>
                <span className="osuniverse-logo-letter">V</span>
                <span className="osuniverse-logo-letter">E</span>
                <span className="osuniverse-logo-letter">R</span>
                <span className="osuniverse-logo-letter">S</span>
                <span className="osuniverse-logo-letter">E</span>
            </div>
        </Link>
    );
};
