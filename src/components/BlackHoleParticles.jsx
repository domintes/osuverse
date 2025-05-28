"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from "react";

const FloatingParticles = () => {
    const canvasRef = useRef(null);
    const [mouse, setMouse] = useState({ x: null, y: null });
    const particles = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 2;
                this.speedY = (Math.random() - 0.5) * 2;
                this.life = Math.random() * 100 + 200;
                this.opacity = 1;
            }
            update() {
                this.life--;

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 20) {
                    const angle = Math.atan2(dy, dx);
                    const force = 3;
                    this.speedX = -Math.cos(angle) * force;
                    this.speedY = -Math.sin(angle) * force;
                } else if (distance < 80) {
                    this.x -= dx * 0.05;
                    this.y -= dy * 0.05;
                }

                this.x += this.speedX;
                this.y += this.speedY;

                if (this.life < 20) {
                    this.opacity -= 0.05;
                }
            }
            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(this.opacity, 0.1)})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            setInterval(() => {
                if (particles.current.length < 150) {
                    particles.current.push(
                        new Particle(Math.random() * canvas.width, Math.random() * canvas.height)
                    );
                }
            }, 100);
        }

        function animate() {
            ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Ensure background is always black
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.current = particles.current.filter(particle =>
                particle.life > 0 &&
                particle.x >= 0 && particle.x <= canvas.width &&
                particle.y >= 0 && particle.y <= canvas.height &&
                particle.opacity > 0
            );

            particles.current.forEach((particle) => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        }

        initParticles();
        animate();

        const handleMouseMove = (event) => {
            setMouse({ x: event.clientX, y: event.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
        };
    }, []);

    return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: -1, pointerEvents: "none" }}></canvas>;
};

export default FloatingParticles;
