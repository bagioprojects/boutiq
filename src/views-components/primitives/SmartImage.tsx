'use client';

import React, { useState } from 'react';

export interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width: number;
  height: number;
  lqipBase64?: string;
  priority?: boolean;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  width,
  height,
  lqipBase64,
  priority = false,
  className,
  style,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectRatio = `${width} / ${height}`;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        backgroundImage: lqipBase64 ? `url('${lqipBase64}')` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
      }}
      className={className}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.3s ease-in-out',
          opacity: isLoaded ? 1 : 0,
        }}
        {...rest}
      />
    </div>
  );
};

