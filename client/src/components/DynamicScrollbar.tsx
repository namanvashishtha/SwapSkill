import { useEffect } from 'react';

export default function DynamicScrollbar() {
  useEffect(() => {
    // Function to update scrollbar color based on scroll position
    const updateScrollbarColor = () => {
      const scrollPosition = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = documentHeight > 0 ? (scrollPosition / documentHeight) * 100 : 0;
      
      // Create a dynamic style element if it doesn't exist
      let styleElement = document.getElementById('dynamic-scrollbar-style');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-scrollbar-style';
        document.head.appendChild(styleElement);
      }
      
      // Define the hues for purple and pink
      const primaryHue = 271; // Purple hue
      const secondaryHue = 328; // Pink hue
      
      // Interpolate hues for top and bottom based on scroll percentage
      const topHue = primaryHue + (secondaryHue - primaryHue) * (scrollPercentage / 100);
      const bottomHue = secondaryHue - (secondaryHue - primaryHue) * (scrollPercentage / 100);
      
      // Update the scrollbar style with normal and hover states
      styleElement.textContent = `
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, 
                    hsl(${topHue}, 90%, 50%) 0%, 
                    hsl(${(topHue + bottomHue) / 2}, 90%, 50%) 50%, 
                    hsl(${bottomHue}, 100%, 54%) 100%) !important;
          z-index: 1;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, 
                    hsl(${bottomHue}, 100%, 54%) 0%, 
                    hsl(${(topHue + bottomHue) / 2}, 90%, 50%) 50%, 
                    hsl(${topHue}, 90%, 50%) 100%) !important;
        }
      `;
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', updateScrollbarColor);
    
    // Initial call to set the initial color
    updateScrollbarColor();
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', updateScrollbarColor);
      const styleElement = document.getElementById('dynamic-scrollbar-style');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
}