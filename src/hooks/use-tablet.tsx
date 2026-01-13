import * as React from "react";

const TABLET_MIN_WIDTH = 768;
const TABLET_MAX_WIDTH = 1024;

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Check if it's in tablet portrait range (768px - 1024px width, and height > width)
      const isTabletPortrait = 
        width >= TABLET_MIN_WIDTH && 
        width <= TABLET_MAX_WIDTH && 
        height > width;
      
      setIsTablet(isTabletPortrait);
    };

    checkTablet();
    window.addEventListener("resize", checkTablet);
    window.addEventListener("orientationchange", checkTablet);
    
    return () => {
      window.removeEventListener("resize", checkTablet);
      window.removeEventListener("orientationchange", checkTablet);
    };
  }, []);

  return !!isTablet;
}













