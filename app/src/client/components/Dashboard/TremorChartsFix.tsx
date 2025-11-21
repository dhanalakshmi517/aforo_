import React, { useEffect } from 'react';

/**
 * Component to inject direct DOM fixes for Tremor chart rendering issues.
 * This is a workaround to force charts to display properly when CSS alone isn't working.
 */
const TremorChartsFix: React.FC = () => {
  useEffect(() => {
    // Apply direct style overrides after the component mounts
    const fixChartsStyles = () => {
      console.log('Applying Tremor chart fixes');
      
      // Find all chart containers and fix them
      const chartDivs = document.querySelectorAll('.tremor-BarChart');
      console.log(`Found ${chartDivs.length} chart containers to fix`);
      
      chartDivs.forEach((div, index) => {
        // Apply fixes to each chart container
        if (div instanceof HTMLElement) {
          div.style.display = 'block';
          div.style.height = '400px';
          div.style.width = '100%';
          div.style.overflow = 'visible';
          console.log(`Fixed chart container ${index}`);
        }
      });
      
      // Fix SVG elements inside charts
      const chartSvgs = document.querySelectorAll('.recharts-surface');
      console.log(`Found ${chartSvgs.length} SVG elements to fix`);
      
      chartSvgs.forEach((svg, index) => {
        if (svg instanceof SVGElement) {
          svg.style.overflow = 'visible';
          svg.style.display = 'block';
          svg.style.height = '100%';
          svg.style.width = '100%';
          console.log(`Fixed SVG element ${index}`);
        }
      });
    };
    
    // Apply fixes immediately and then after a delay to ensure they take effect
    fixChartsStyles();
    
    // Apply fixes again after a short delay in case of dynamic loading
    const timeoutId = setTimeout(fixChartsStyles, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  return null; // This component doesn't render anything visibly
};

export default TremorChartsFix;
