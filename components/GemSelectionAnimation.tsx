import React, { useEffect, useRef } from 'react';
import { Gem } from '../types';
import GemAvatar from './GemAvatar';
import { gsap } from 'gsap';

interface GemSelectionAnimationProps {
    gem: Gem;
    sourceRect: DOMRect;
    onComplete: () => void;
}

const GemSelectionAnimation: React.FC<GemSelectionAnimationProps> = ({ gem, sourceRect, onComplete }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement>(null);
    const shockwaveRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const avatar = avatarRef.current;
        const particlesContainer = particlesRef.current;
        const shockwave = shockwaveRef.current;
        if (!avatar || !particlesContainer || !shockwave) return;

        // Create particles
        const particles = Array.from({ length: 20 }).map(() => {
            const p = document.createElement('div');
            p.className = 'absolute rounded-full';
            p.style.backgroundColor = `hsl(${gsap.utils.random(250, 280)}, 90%, 70%)`;
            gsap.set(p, { x: 0, y: 0, scale: gsap.utils.random(0.5, 1.5), opacity: 0 });
            particlesContainer.appendChild(p);
            return p;
        });

        const tl = gsap.timeline({
            onComplete: () => {
                onComplete();
                particles.forEach(p => p.remove());
            }
        });

        // 1. Set initial state
        gsap.set(avatar, {
            left: sourceRect.left,
            top: sourceRect.top,
            width: sourceRect.width,
            height: sourceRect.height,
        });

        gsap.set(shockwave, {
            left: '50%',
            top: '50%',
            xPercent: -50,
            yPercent: -50,
            scale: 0,
            opacity: 1,
            border: '2px solid white',
        });
        
        gsap.set(particlesContainer, {
            left: '50%',
            top: '50%',
        });


        // 2. Animate to center
        tl.to(avatar, {
            left: '50%',
            top: '50%',
            xPercent: -50,
            yPercent: -50,
            width: 120,
            height: 120,
            duration: 0.7,
            ease: 'power2.inOut'
        })
        // 3. Main burst effect
        .to(avatar, { scale: 1.2, duration: 0.2, ease: 'power1.out' }, "-=0.2")
        .to(avatar, { opacity: 0, scale: 0, duration: 0.3, ease: 'power1.in' }, "+=0.1");

        // Particle animation
        tl.to(particles, {
            x: () => gsap.utils.random(-250, 250),
            y: () => gsap.utils.random(-250, 250),
            opacity: 0,
            scale: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.01
        }, "-=0.6");
        
        // Shockwave animation
        tl.to(shockwave, {
            scale: 1.5,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
        }, "-=0.7");


        return () => {
            tl.kill();
        };

    }, [gem, sourceRect, onComplete]);

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] pointer-events-none">
            <div ref={particlesRef} className="absolute"></div>
            <div ref={shockwaveRef} className="absolute rounded-full w-40 h-40"></div>
            <div ref={avatarRef} className="absolute rounded-full">
                <GemAvatar gem={gem} className="w-full h-full" />
            </div>
        </div>
    );
};

export default GemSelectionAnimation;
