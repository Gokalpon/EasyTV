import React from 'react';

/**
 * H3Heading component
 * - Responsive font size
 * - Tight letter tracking
 * - Smooth color transitions
 * - Per-letter fade-in, slide-up, blur-reduce animation
 *
 * Usage: <H3Heading>Başlık</H3Heading>
 */
const H3Heading = ({ children }) => {
  // Split children into letters for animation
  const letters = String(children).split("");
  return (
    <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white transition-colors duration-300">
      {letters.map((char, i) => (
        <span
          key={i}
          className="inline-block opacity-0 translate-y-6 blur-sm animate-h3fadein"
          style={{ animationDelay: `${i * 0.04 + 0.1}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h3>
  );
};

export default H3Heading;
