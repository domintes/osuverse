import { useEffect, useRef, useState } from 'react';
import './Background.scss';

const Background = () => {
    const canvasRef = useRef(null);
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let stars = [];

        // Dostosowanie rozmiaru canvas do okna
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars(); // Reinicjalizacja gwiazd przy zmianie rozmiaru
        };

        // Inicjalizacja gwiazd
        const initStars = () => {
            stars = Array.from({ length: 100 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.1,
                brightness: Math.random(),
                direction: Math.random() * Math.PI * 2
            }));
        };

        // Animacja gwiazd
        const animate = () => {
            if (!isEnabled) return;

            ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                // Aktualizacja pozycji
                star.x += Math.cos(star.direction) * star.speed;
                star.y += Math.sin(star.direction) * star.speed;

                // Pulsowanie jasności
                star.brightness = Math.sin(Date.now() * 0.001 + star.speed) * 0.5 + 0.5;

                // Zawracanie gwiazd na krawędziach
                if (star.x < 0) star.x = canvas.width;
                if (star.x > canvas.width) star.x = 0;
                if (star.y < 0) star.y = canvas.height;
                if (star.y > canvas.height) star.y = 0;

                // Rysowanie gwiazdy
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // Inicjalizacja
        handleResize();
        window.addEventListener('resize', handleResize);
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isEnabled]);

    // Toggle animacji z localStorage
    useEffect(() => {
        const savedPreference = localStorage.getItem('backgroundEnabled');
        if (savedPreference !== null) {
            setIsEnabled(savedPreference === 'true');
        }
    }, []);

    const toggleBackground = () => {
        const newState = !isEnabled;
        setIsEnabled(newState);
        localStorage.setItem('backgroundEnabled', newState);
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                className={`background-canvas ${!isEnabled ? 'disabled' : ''}`}
            />
            <button
                className="background-toggle"
                onClick={toggleBackground}
                title={isEnabled ? 'Disable background animation' : 'Enable background animation'}
            >
                {isEnabled ? '✨' : '⭐'}
            </button>
        </>
    );
};

export default Background;
