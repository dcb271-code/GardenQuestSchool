'use client';

import { GRID_COLS, GRID_ROWS, allCells } from '@/lib/world/gardenLayout';
import type { GridPos } from '@/lib/world/gardenLayout';

export const CELL_SIZE = 100;

export interface PlacedHabitatView {
  id: string;
  code: string;
  emoji: string;
  position: GridPos;
}

export default function GardenGrid({
  placed,
  placeMode,
  onCellTap,
}: {
  placed: PlacedHabitatView[];
  placeMode: boolean;
  onCellTap?: (pos: GridPos) => void;
}) {
  const occupiedSet = new Set(placed.map(h => `${h.position.x},${h.position.y}`));
  return (
    <>
      {allCells().map(cell => {
        const isOccupied = occupiedSet.has(`${cell.x},${cell.y}`);
        const showCell = placeMode && !isOccupied;
        return (
          <rect
            key={`${cell.x},${cell.y}`}
            x={cell.x * CELL_SIZE}
            y={cell.y * CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={showCell ? 'rgba(232, 168, 124, 0.25)' : 'transparent'}
            stroke={showCell ? '#E8A87C' : 'rgba(0,0,0,0.05)'}
            strokeDasharray={showCell ? '8 6' : undefined}
            strokeWidth={showCell ? 3 : 1}
            style={{
              cursor: placeMode && !isOccupied ? 'pointer' : 'default',
              touchAction: 'manipulation',
            }}
            onClick={() => { if (placeMode && !isOccupied && onCellTap) onCellTap(cell); }}
          />
        );
      })}
      {placed.map(h => (
        <g key={h.id}>
          <text
            x={h.position.x * CELL_SIZE + CELL_SIZE / 2}
            y={h.position.y * CELL_SIZE + CELL_SIZE / 2 + 24}
            fontSize={64}
            textAnchor="middle"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {h.emoji}
          </text>
        </g>
      ))}
    </>
  );
}

export const GARDEN_WIDTH = GRID_COLS * CELL_SIZE;
export const GARDEN_HEIGHT = GRID_ROWS * CELL_SIZE;
