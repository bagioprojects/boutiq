import React from 'react';

export interface NineSliceBoxProps {
  sliceImage: string;
  slice: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const NineSliceBox: React.FC<NineSliceBoxProps> = ({
  sliceImage,
  slice,
  children,
  className,
  style,
}) => {
  const borderImageStyle: React.CSSProperties = {
    borderImageSource: `url('${sliceImage}')`,
    borderImageSlice: `${slice.top} ${slice.right} ${slice.bottom} ${slice.left} fill`,
    borderImageWidth: `${slice.top}px ${slice.right}px ${slice.bottom}px ${slice.left}px`,
    borderImageRepeat: 'stretch',
    padding: `${slice.top}px ${slice.right}px ${slice.bottom}px ${slice.left}px`,
    display: 'inline-block',
    boxSizing: 'border-box',
    ...style,
  };

  return (
    <div className={className} style={borderImageStyle}>
      {children}
    </div>
  );
};

