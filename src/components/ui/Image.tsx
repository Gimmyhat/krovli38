import React, { useState, useEffect, useRef } from 'react';
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
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadImage = () => {
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
    };

    if (priority) {
      loadImage();
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px'
        }
      );

      if (imageRef.current) {
        observer.observe(imageRef.current);
      }

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
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={containerStyle}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {(loaded || error) && (
        <img
          src={localSrc || src}
          alt={alt}
          className={`w-full h-full transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } object-${objectFit}`}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      )}
    </div>
  );
};

export default Image; 