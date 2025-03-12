import { useEffect, useRef, useState } from 'react';
import '../../styles/cyberpunk.css';

class Particle {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.baseSpeed = Math.random() * 0.5 + 0.1;
        this.speed = this.baseSpeed;
        this.brightness = Math.random();
        this.alpha = 1;
        this.distanceFromBlackHole = 0;
        this.isBeingAbsorbed = false;
    }

    update(mouseX, mouseY, blackHoleX, blackHoleY) {
        // Oblicz odległość od kursora
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distanceFromMouse = Math.sqrt(dx * dx + dy * dy);

        // Oblicz odległość od czarnej dziury
        const bhDx = this.x - blackHoleX;
        const bhDy = this.y - blackHoleY;
        this.distanceFromBlackHole = Math.sqrt(bhDx * bhDx + bhDy * bhDy);

        // Efekt odpychania od kursora
        if (distanceFromMouse < 100) {
            const angle = Math.atan2(dy, dx);
            const force = (100 - distanceFromMouse) / 100;
            this.direction = angle;
            this.speed = this.baseSpeed + force * 2;
        } else {
            this.speed = this.baseSpeed;
        }

        // Efekt przyciągania przez czarną dziurę
        if (this.distanceFromBlackHole < 150) {
            const bhAngle = Math.atan2(bhDy, bhDx);
            const bhForce = 1 - (this.distanceFromBlackHole / 150);
            this.direction = bhAngle + Math.PI; // Odwrócone, bo przyciąga
            this.speed = this.baseSpeed + bhForce * 3;
            this.isBeingAbsorbed = true;

            // Zmniejsz rozmiar i przezroczystość gdy zbliża się do czarnej dziury
            if (this.distanceFromBlackHole < 30) {
                this.alpha = this.distanceFromBlackHole / 30;
                this.size *= 0.95;
            }
        }

        // Aktualizacja pozycji
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        // Zawracanie na krawędziach
        if (this.x < 0) this.x = this.canvas.width;
        if (this.x > this.canvas.width) this.x = 0;
        if (this.y < 0) this.y = this.canvas.height;
        if (this.y > this.canvas.height) this.y = 0;

        // Pulsowanie jasności
        this.brightness = Math.sin(Date.now() * 0.001 + this.speed) * 0.5 + 0.5;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * this.brightness})`;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    shouldBeRemoved() {
        return this.isBeingAbsorbed && this.size < 0.1;
    }
}

const Background = () => {
    const canvasRef = useRef(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: null, y: null });
    const blackHoleRef = useRef({ x: 0, y: 0 });
    const requestRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            blackHoleRef.current = {
                x: canvas.width * 0.5,
                y: canvas.height * 0.5
            };
        };

        const handleMouseMove = (e) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY
            };
        };

        const initParticles = () => {
            particlesRef.current = Array.from({ length: 100 }, () => 
                new Particle(
                    canvas,
                    Math.random() * canvas.width,
                    Math.random() * canvas.height
                )
            );
        };

        const animate = () => {
            if (!isEnabled) return;

            ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Rysowanie czarnej dziury
            const gradient = ctx.createRadialGradient(
                blackHoleRef.current.x,
                blackHoleRef.current.y,
                0,
                blackHoleRef.current.x,
                blackHoleRef.current.y,
                50
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.5, 'rgba(102, 102, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(blackHoleRef.current.x, blackHoleRef.current.y, 50, 0, Math.PI * 2);
            ctx.fill();

            // Aktualizacja i rysowanie cząsteczek
            particlesRef.current = particlesRef.current.filter(particle => {
                particle.update(
                    mouseRef.current.x,
                    mouseRef.current.y,
                    blackHoleRef.current.x,
                    blackHoleRef.current.y
                );
                particle.draw(ctx);
                return !particle.shouldBeRemoved();
            });

            // Dodawanie nowych cząsteczek
            while (particlesRef.current.length < 100) {
                particlesRef.current.push(
                    new Particle(
                        canvas,
                        Math.random() * canvas.width,
                        Math.random() * canvas.height
                    )
                );
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        // Inicjalizacja
        handleResize();
        initParticles();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(requestRef.current);
        };
    }, [isEnabled]);

    // Toggle animacji z localStorage
    useEffect(() => {
        const savedPreference = localStorage.getItem('backgroundEnabled');
        if (savedPreference !== null) {
            setIsEnabled(savedPreference === 'true');
        }
    }, []);

    return (
        <>
            <canvas 
                ref={canvasRef} 
                className={`background-canvas ${!isEnabled ? 'disabled' : ''}`}
                style={{ opacity: isEnabled ? 0.3 : 0 }}
            />
            <button 
                className="background-toggle cyber-button cyber-button-outlined"
                onClick={() => {
                    const newState = !isEnabled;
                    setIsEnabled(newState);
                    localStorage.setItem('backgroundEnabled', newState.toString());
                }} 
                title={isEnabled ? 'Disable background animation' : 'Enable background animation'}
            >
                {isEnabled ? '✨' : '🌌'}
            </button>
        </>
    );
};

export default Background;
