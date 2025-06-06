import React from "react";
import "./osuverseLogo.scss";


export default function OsuverseLogo() {
    return (
        <div className="osuverse-logo-container">
            <div className="wonderful-void"></div>
            <div className="osuverse-logo">
                <img src="/favicon.ico" alt="O" className="osuniverse-logo-favicon" />
                <span className="osuniverse-logo-letter">S</span>
                <span className="osuniverse-logo-letter">U</span>
                <span className="osuniverse-logo-letter">V</span>
                <span className="osuniverse-logo-letter">E</span>
                <span className="osuniverse-logo-letter">R</span>
                <span className="osuniverse-logo-letter">S</span>
                <span className="osuniverse-logo-letter">E</span>
            </div>
        </div>
    );
};
