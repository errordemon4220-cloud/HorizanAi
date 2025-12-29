import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export const Logo: React.FC = () => {
    const logoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const logo = logoRef.current;
        if (!logo) return;
        // Respect user's animation settings
        if (document.body.classList.contains('animations-disabled')) return;

        const sun = logo.querySelector('.sun');
        const sunGlow = logo.querySelector('.sun-glow-filter feGaussianBlur');
        const horizonLines = gsap.utils.toArray('.horizon-line');
        const stars = gsap.utils.toArray('.star');
        const holographicGlare = logo.querySelector('.holographic-glare');
        const mainGroup = logo.querySelector('.main-group');

        if (!sun || !sunGlow || !mainGroup || !holographicGlare || horizonLines.length === 0 || stars.length === 0) return;

        gsap.set(mainGroup, { transformOrigin: '50% 50%' });

        // --- IDLE ANIMATION ---
        const idleTl = gsap.timeline({ repeat: -1 });

        // Sun pulse
        idleTl.to(sun, { scale: 1.05, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
        idleTl.to(sunGlow, { attr: { stdDeviation: 1.5 }, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);

        // Horizon wave
        gsap.to(horizonLines, { y: (i) => (i % 2 === 0 ? -0.5 : 0.5), duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.15, yoyo: true, repeat: -1 } });

        // Star twinkle
        gsap.to(stars, { opacity: () => gsap.utils.random(0.2, 0.8), duration: () => gsap.utils.random(1, 3), repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.2 });

        // --- HOVER ANIMATION ---
        let glareTween: gsap.core.Tween | null;

        const handleMouseMove = (e: MouseEvent) => {
            const { left, top, width, height } = logo.getBoundingClientRect();
            const xPercent = ((e.clientX - left) / width - 0.5) * 2;
            const yPercent = ((e.clientY - top) / height - 0.5) * 2;
            gsap.to(mainGroup, { rotationY: xPercent * 10, rotationX: -yPercent * 10, duration: 0.5, ease: 'power1.out' });
        };

        const handleMouseEnter = () => {
            glareTween = gsap.fromTo(holographicGlare, 
                { x: '-125%', skewX: '-30deg' },
                { x: '125%', duration: 1.2, ease: 'power2.inOut' }
            );
        };

        const handleMouseLeave = () => {
            gsap.to(mainGroup, { rotationY: 0, rotationX: 0, duration: 0.5, ease: 'power1.out' });
            glareTween?.kill();
        };

        logo.addEventListener('mousemove', handleMouseMove);
        logo.addEventListener('mouseenter', handleMouseEnter);
        logo.addEventListener('mouseleave', handleMouseLeave);

        // Cleanup function
        return () => {
            idleTl.kill();
            gsap.killTweensOf([logo, mainGroup, sun, sunGlow, horizonLines, stars, holographicGlare]);
            logo.removeEventListener('mousemove', handleMouseMove);
            logo.removeEventListener('mouseenter', handleMouseEnter);
            logo.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div ref={logoRef} className="w-8 h-8 rounded-lg flex-shrink-0 relative overflow-hidden [transform:translateZ(0)]" style={{ perspective: '400px' }} aria-label="HorizonAI Logo">
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                <defs>
                    <radialGradient id="sun-grad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                        <stop offset="80%" stopColor="#f5d0fe" stopOpacity="1" />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity="1" />
                    </radialGradient>
                    <linearGradient id="sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2c1d4a" />
                        <stop offset="50%" stopColor="#1e1b4b" />
                        <stop offset="100%" stopColor="#4c1d95" />
                    </linearGradient>
                     <filter id="sun-glow-filter">
                        <feGaussianBlur className="sun-glow-filter" stdDeviation="1" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <rect width="100" height="100" fill="url(#sky-grad)" rx="10" />
                
                <g className="stars">
                    <circle cx="20" cy="20" r="1" fill="#fff" className="star opacity-30"/>
                    <circle cx="80" cy="30" r="1.2" fill="#fff" className="star opacity-50"/>
                    <circle cx="30" cy="60" r="0.8" fill="#fff" className="star opacity-20"/>
                    <circle cx="75" cy="80" r="1" fill="#fff" className="star opacity-40"/>
                    <circle cx="40" cy="15" r="0.7" fill="#fff" className="star opacity-60"/>
                    <circle cx="90" cy="55" r="0.8" fill="#fff" className="star opacity-30"/>
                </g>
                
                <g className="main-group">
                    <g className="sun" style={{ transformOrigin: '50% 50%' }} filter="url(#sun-glow-filter)">
                       <circle cx="50" cy="50" r="15" fill="url(#sun-grad)" />
                    </g>
                    <g className="horizon-lines" stroke="#e9d5ff" strokeWidth="1.5" strokeOpacity="0.7">
                        <path className="horizon-line" d="M0 60 H100" />
                        <path className="horizon-line" d="M0 65 H100" strokeOpacity="0.6"/>
                        <path className="horizon-line" d="M0 70 H100" strokeOpacity="0.5"/>
                        <path className="horizon-line" d="M0 75 H100" strokeOpacity="0.4"/>
                        <path className="horizon-line" d="M0 80 H100" strokeOpacity="0.3"/>
                        <path className="horizon-line" d="M0 85 H100" strokeOpacity="0.2"/>
                    </g>
                </g>
            </svg>
            {/* Holographic Glare */}
            <div className="holographic-glare absolute top-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none transform -skew-x-12" style={{ left: '-50%' }}></div>
        </div>
    );
};
