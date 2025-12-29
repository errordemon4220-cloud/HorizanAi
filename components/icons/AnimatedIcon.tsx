import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

const AnimatedIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [animationsEnabled, setAnimationsEnabled] = useState(
        !document.body.classList.contains('animations-disabled')
    );
    const [colorfulModeEnabled, setColorfulModeEnabled] = useState(
        document.body.classList.contains('colorful-icons')
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setAnimationsEnabled(!document.body.classList.contains('animations-disabled'));
            setColorfulModeEnabled(document.body.classList.contains('colorful-icons'));
        });

        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);


    useEffect(() => {
        if (!animationsEnabled || !colorfulModeEnabled) {
             // Cleanup logic is in the return function of the effect, so just return
            return;
        }

        const wrapper = wrapperRef.current;
        const svg = wrapper?.querySelector('svg');
        if (!wrapper || !svg) return;

        const elements = Array.from(svg.querySelectorAll('path, line, rect, circle, polygon'));
        if (elements.length === 0) return;

        gsap.set(elements, { transformOrigin: '50% 50%', willChange: 'transform' });

        const timeline = gsap.timeline({
            repeat: -1,
            repeatDelay: 5,
            delay: Math.random() * 5,
        });

        timeline
            .to(elements, {
                y: -2,
                scale: 1.2,
                rotation: 'random(-25, 25)',
                duration: 0.2,
                ease: 'power2.out',
                stagger: {
                    each: 0.03,
                    from: 'center'
                }
            })
            .to(elements, {
                y: 0,
                scale: 1,
                rotation: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)',
                stagger: {
                    each: 0.03,
                    from: 'center'
                }
            }, "-=0.1");

        return () => {
            timeline.kill();
            // Reset properties on cleanup
            gsap.set(elements, { clearProps: 'all' });
        };
    }, [animationsEnabled, colorfulModeEnabled]); // Depend on both settings

    return <div ref={wrapperRef} className="inline-block align-middle leading-none animated-icon-wrapper">{children}</div>;
};

export default AnimatedIcon;
