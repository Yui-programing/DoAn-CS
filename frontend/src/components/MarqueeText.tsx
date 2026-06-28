import React, { useRef, useState, useEffect } from 'react';

interface MarqueeTextProps {
  text: string;
  className?: string;
  title?: string;
  children?: React.ReactNode;
}

export const MarqueeText: React.FC<MarqueeTextProps> = ({ text, className = '', title, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        
        if (containerWidth === 0) {
          setIsOverflowing(false);
          return;
        }
        
        setIsOverflowing(textWidth > containerWidth);
      }
    };

    checkOverflow();

    if (containerRef.current) {
      const observer = new ResizeObserver(checkOverflow);
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [text, children]);

  return (
    <div 
      ref={containerRef} 
      className={`marquee-on-hover ${isOverflowing ? 'overflowing' : ''} ${className}`}
      title={title || text}
    >
      <span ref={textRef} className="marquee-text">
        {children || text}
      </span>
    </div>
  );
};
