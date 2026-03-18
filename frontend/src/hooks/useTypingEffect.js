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

    let currentIndex = 0;
    
    const intervalId = setInterval(() => {
      currentIndex++;
      setDisplayedText(text.slice(0, currentIndex));

      if (currentIndex >= text.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, speedMs);

    return () => clearInterval(intervalId);
  }, [text, speedMs]);

  return { displayedText, isTyping };
};

export default useTypingEffect;
