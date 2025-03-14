"use client";

import { useEffect, useState } from "react";

export function BackgroundGrid() {
  const [gridItems, setGridItems] = useState<number[]>([]);

  useEffect(() => {
    const calculateGridItems = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cellSize = 50; // 50px per cell
      const cols = Math.ceil(width / cellSize) + 1; // Add one extra column
      const rows = Math.ceil(height / cellSize) + 1; // Add one extra row
      const totalCells = cols * rows;

      setGridItems(Array.from({ length: totalCells }, (_, i) => i));
    };

    calculateGridItems();
    window.addEventListener("resize", calculateGridItems);

    return () => {
      window.removeEventListener("resize", calculateGridItems);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
      <div className="bg-grid w-full h-full">
        {gridItems.map(i => (
          <div key={i} className="grid-item" />
        ))}
      </div>
    </div>
  );
}
