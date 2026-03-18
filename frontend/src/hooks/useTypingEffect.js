import { useState, useEffect } from 'react';

const useTypingEffect = (text, speedMs = 15) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Reset states
    setDisplayedText('');
    setIsTyping(true);

    if (!text) {
      setIsTyping(false);
      return;
    }

    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        const nextChar = text.charAt(i);
        i++;
        return prev + nextChar;
      });

      if (i >= text.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, speedMs);

    return () => clearInterval(intervalId);
  }, [text, speedMs]);

  return { displayedText, isTyping };
};

export default useTypingEffect;
