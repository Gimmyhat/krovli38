import React, { useState, useEffect } from 'react';
import { ImageProps } from '../../types/common';

const Image: React.FC<ImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio,
  objectFit = 'cover',
  priority = false,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [localSrc, setLocalSrc] = useState<string>('');

  useEffect(() => {
    if (priority) {
      const img = new window.Image();
      img.src = src;
      
      img.onload = () => {
        setLoaded(true);
        setLocalSrc(src);
      };
      
      img.onerror = () => {
        setError(true);
        setLocalSrc('https://via.placeholder.com/400x300?text=Image+Not+Found');
      };
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new window.Image();
            img.src = src;
            
            img.onload = () => {
              setLoaded(true);
              setLocalSrc(src);
            };
            
            img.onerror = () => {
              setError(true);
              setLocalSrc('https://via.placeholder.com/400x300?text=Image+Not+Found');
            };
            
            observer.disconnect();
          }
        });
      });

      const container = document.createElement('div');
      observer.observe(container);

      return () => {
        observer.disconnect();
      };
    }
  }, [src, priority]);

  const containerStyle = aspectRatio
    ? { paddingBottom: `${(1 / aspectRatio) * 100}%` }
    : undefined;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={containerStyle}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={localSrc || src}
        alt={alt}
        className={`w-full h-full transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } object-${objectFit}`}
        loading={priority ? 'eager' : 'lazy'}
        {...props}
      />
    </div>
  );
};

export default Image; 