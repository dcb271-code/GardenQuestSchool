'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { GRID_COLS, GRID_ROWS, adjacentCells } from '@/lib/world/gardenLayout';
import { CELL_SIZE } from './GardenGrid';

export default function LunaWanderer() {
  const [pos, setPos] = useState({ x: Math.floor(GRID_COLS / 2), y: Math.floor(GRID_ROWS / 2) });

  useEffect(() => {
    const id = setInterval(() => {
      setPos(prev => {
        const adj = adjacentCells(prev);
        if (adj.length === 0) return prev;
        return adj[Math.floor(Math.random() * adj.length)];
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.text
      fontSize={48}
      animate={{
        x: pos.x * CELL_SIZE + CELL_SIZE / 2,
        y: pos.y * CELL_SIZE + CELL_SIZE / 2 + 16,
      }}
      transition={{ duration: 2, ease: 'easeInOut' }}
      textAnchor="middle"
      style={{ userSelect: 'none', pointerEvents: 'none' }}
    >
      🐈
    </motion.text>
  );
}
