import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  console.log("ScrollToTop triggered for pathname:", pathname);
  useLayoutEffect(() => {
    // Scroll to top when the pathname changes
    window.scrollTo({
      top: 0, // Scroll to the top of the page
      left: 0, // Scroll to the leftmost position
      behavior: 'smooth' // Smooth scroll effect
    });
  }, [pathname]);

  return null; // This component does not render anything
}