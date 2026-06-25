import React, { useState, useEffect } from "react";

interface TypingTextProps {
  texts: string[]; // lines to type
  speed?: number; // ms per char
}

export const TypingText: React.FC<TypingTextProps> = ({ texts, speed = 40 }) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= texts.length) return;

    const timer = setTimeout(() => {
      const fullText = texts[currentLineIndex];
      const typedPart = fullText.slice(0, currentCharIndex + 1);
      
      setDisplayedLines(prev => {
        const copy = [...prev];
        copy[currentLineIndex] = typedPart;
        return copy;
      });

      if (currentCharIndex + 1 < fullText.length) {
        setCurrentCharIndex(prev => prev + 1);
      } else {
        // Line fully typed, move to next line
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [currentLineIndex, currentCharIndex, texts, speed]);

  return (
    <span className="block space-y-1">
      {displayedLines.map((line, idx) => (
        <span key={idx} className="block">
          {line}
          {idx === currentLineIndex && currentLineIndex < texts.length && (
            <span className="inline-block w-0.5 h-4 bg-brand-500 ml-0.5 animate-pulse">|</span>
          )}
        </span>
      ))}
    </span>
  );
};
