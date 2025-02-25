import React, { useState, useEffect } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

const Image: React.FC<ImageProps> = ({ src, alt, className = '', ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [localSrc, setLocalSrc] = useState<string>('');

  useEffect(() => {
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
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={localSrc || src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default Image; 