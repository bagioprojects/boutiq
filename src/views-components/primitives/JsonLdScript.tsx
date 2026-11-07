import React from 'react';

export interface JsonLdScriptProps {
  data: object;
}

export const JsonLdScript: React.FC<JsonLdScriptProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
};

