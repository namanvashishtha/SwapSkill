import { useEffect, useState } from "react";

type AnimatedTextProps = {
  text: string;
  className?: string;
  typingEffect?: boolean;
  colorShift?: boolean;
};

export default function AnimatedText({ 
  text, 
  className = "", 
  typingEffect = false,
  colorShift = false
}: AnimatedTextProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
  }, []);
  
  const baseClasses = `${className} ${visible ? "opacity-100" : "opacity-0"} transition-opacity duration-500`;
  const typingClasses = typingEffect ? "typing-effect inline-block" : "";
  const colorClasses = colorShift ? "animate-color-shift" : "";
  
  return (
    <span className={`${baseClasses} ${typingClasses} ${colorClasses}`}>
      {text}
    </span>
  );
}
