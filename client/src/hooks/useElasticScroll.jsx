import { useEffect, useRef } from 'react';

/**
 * ElasticGridScroll Hook
 * Creates an elastic scroll effect where grid items move at different speeds
 * Based on: https://github.com/codrops/ElasticGridScroll
 */
export const useElasticScroll = (options = {}) => {
    const containerRef = useRef(null);
    const itemsRef = useRef([]);
    const scrollPositionRef = useRef(0);
    const requestIdRef = useRef(null);

    const {
        stagger = 0.15,           // Delay multiplier for each column
        ease = 0.08,              // Smoothness of the animation (0-1, lower = smoother)
        maxOffset = 100,          // Maximum offset in pixels
        enabled = true,
    } = options;

    useEffect(() => {
        if (!enabled || !containerRef.current) return;

        const container = containerRef.current;
        const items = Array.from(container.querySelectorAll('.elastic-item'));
        itemsRef.current = items;

        // Calculate columns based on grid layout
        const getColumnCount = () => {
            if (!items.length) return 0;
            const containerWidth = container.offsetWidth;
            const itemWidth = items[0].offsetWidth;
            return Math.floor(containerWidth / itemWidth) || 1;
        };

        // Store item data with column index
        const itemData = items.map((item, index) => {
            const columnCount = getColumnCount();
            const columnIndex = index % columnCount;
            return {
                element: item,
                columnIndex,
                targetOffset: 0,
                currentOffset: 0,
            };
        });

        // Scroll handler
        const handleScroll = () => {
            scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
        };

        // Animation loop
        const animate = () => {
            const scrollDelta = scrollPositionRef.current;

            itemData.forEach((data, index) => {
                // Calculate target offset based on column index
                const staggerMultiplier = 1 + (data.columnIndex * stagger);
                data.targetOffset = Math.min(scrollDelta * staggerMultiplier * 0.05, maxOffset);

                // Smoothly interpolate to target
                data.currentOffset += (data.targetOffset - data.currentOffset) * ease;

                // Apply transform
                if (Math.abs(data.targetOffset - data.currentOffset) > 0.01) {
                    data.element.style.transform = `translateY(${data.currentOffset}px)`;
                }
            });

            requestIdRef.current = requestAnimationFrame(animate);
        };

        // Start
        window.addEventListener('scroll', handleScroll, { passive: true });
        requestIdRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (requestIdRef.current) {
                cancelAnimationFrame(requestIdRef.current);
            }
            // Reset transforms
            itemData.forEach(data => {
                data.element.style.transform = '';
            });
        };
    }, [stagger, ease, maxOffset, enabled]);

    return containerRef;
};

/**
 * ElasticGrid Component
 * Wrapper component that applies elastic scroll to its children
 */
export const ElasticGrid = ({ children, className = '', stagger = 0.15, ease = 0.08, maxOffset = 100, enabled = true }) => {
    const containerRef = useElasticScroll({ stagger, ease, maxOffset, enabled });

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
};

export default useElasticScroll;
