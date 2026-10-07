'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DigraphSortContent, DigraphSortResponse } from '@/lib/packs/reading/types';
import { isListeningSort, poolOrder } from '@/lib/packs/reading/digraphSort';
import { useReadAloud } from '@/lib/audio/useReadAloud';

/**
 * Listening mode (see lib/packs/reading/digraphSort.ts): cards show the
 * picture only, and a tap says the word. `hear` is null otherwise.
 */
const ListenContext = createContext<{ hear: ((word: string) => void) | null; playing: string | null }>(
  { hear: null, playing: null },
);

/**
 * Drag-and-drop sorting — words are dragged into bucket columns by
 * digraph. Works identically on touch and mouse. Drag a placed card
 * back to the pool to undo.
 *
 * For sound-distinct digraphs (ch/sh/th) the word is hidden: she sees
 * the picture, taps it to hear the word, and sorts by ear.
 */
export default function DigraphSort({
  content, onSubmit,
}: {
  content: DigraphSortContent;
  onSubmit: (r: DigraphSortResponse) => void;
  retries: number;
}) {
  const [placements, setPlacements] = useState<Record<string, string | null>>(
    Object.fromEntries(content.words.map(w => [w.word, null]))
  );
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const listen = isListeningSort(content);
  // Never in bucket order — that order WAS the answer.
  const ordered = useMemo(() => poolOrder(content.words, content.digraphs), [content]);
  const readAloud = useReadAloud();
  const listenValue = useMemo(() => ({
    hear: listen ? (word: string) => readAloud.say(`word:${word}`, word) : null,
    playing: readAloud.readingKey?.startsWith('word:') ? readAloud.readingKey.slice(5) : null,
  }), [listen, readAloud]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
  );

  const unsorted = ordered.filter(w => placements[w.word] === null);
  const allPlaced = Object.values(placements).every(v => v !== null);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveWord(String(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveWord(null);
    const word = String(e.active.id);
    const target = e.over ? String(e.over.id) : null;
    if (!target) return;
    if (target === '__POOL__') {
      setPlacements(prev => ({ ...prev, [word]: null }));
    } else {
      setPlacements(prev => ({ ...prev, [word]: target }));
    }
  };

  const submit = () => {
    const finalPlacements: Record<string, string> = {};
    for (const [w, d] of Object.entries(placements)) {
      if (d) finalPlacements[w] = d;
    }
    onSubmit({ placements: finalPlacements });
  };

  const activeWordData = activeWord ? content.words.find(w => w.word === activeWord) : null;

  return (
    <ListenContext.Provider value={listenValue}>
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-5 py-2">
        <div className="font-display text-[22px] text-bark text-center" style={{ fontWeight: 600 }}>
          {/* The seeded prompts talk about "words"; by ear there are none
              on screen, so say what to listen for instead. */}
          {listen
            ? `Listen! Which sound do you hear: ${content.digraphs.join(', ').replace(/, ([^,]*)$/, ', or $1')}?`
            : content.promptText}
        </div>
        <div className="font-display italic text-[13px] text-bark/55 text-center tracking-[0.15em] uppercase -mt-3">
          {listen ? 'tap a picture to hear it, then drag it to its letters' : 'drag each word into a bucket'}
        </div>

        {/* Buckets */}
        <div className="grid grid-cols-3 gap-3">
          {content.digraphs.map(dg => (
            <Bucket
              key={dg}
              id={dg}
              label={dg}
              words={ordered.filter(w => placements[w.word] === dg)}
              isDragging={!!activeWord}
            />
          ))}
        </div>

        {/* Unsorted word pool */}
        <UnsortedPool words={unsorted} isDragging={!!activeWord} />

        <button
          onClick={submit}
          disabled={!allPlaced}
          className="block mx-auto bg-forest text-white rounded-full px-8 py-4 text-kid-md disabled:opacity-50 font-display"
          style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
        >
          Check
        </button>
      </div>

      {/* Drag overlay — the floating card that follows the pointer */}
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.22, 0.9, 0.34, 1)' }}>
        {activeWordData && <DraggingCard word={activeWordData.word} emoji={activeWordData.emoji} listen={listen} />}
      </DragOverlay>
    </DndContext>
    </ListenContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Bucket — drop target for a digraph
// ─────────────────────────────────────────────────────────────────────────

function Bucket({
  id, label, words, isDragging,
}: {
  id: string;
  label: string;
  words: Array<{ word: string; emoji?: string }>;
  isDragging: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl p-3 min-h-36 border-4 transition-colors ${
        isOver
          ? 'border-forest bg-forest/15 ring-2 ring-forest/40'
          : isDragging
            ? 'border-terracotta/80 bg-cream border-dashed'
            : 'border-terracotta bg-cream'
      }`}
    >
      <div className="text-center font-display text-[22px] text-bark mb-2" style={{ fontWeight: 700 }}>
        {label}
      </div>
      <div className="flex flex-col gap-1.5">
        {words.map(w => (
          <DraggableWord key={w.word} word={w.word} emoji={w.emoji} />
        ))}
        {words.length === 0 && (
          <div className="text-center font-display italic text-[12px] text-bark/35 py-2">
            drop here
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// UnsortedPool — drop target for returning words to the pool
// ─────────────────────────────────────────────────────────────────────────

function UnsortedPool({
  words, isDragging,
}: {
  words: Array<{ word: string; emoji?: string }>;
  isDragging: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: '__POOL__' });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl p-3 border-2 transition-colors ${
        isOver
          ? 'border-sage bg-sage/15 ring-2 ring-sage/40'
          : 'border-ochre/50 bg-white'
      }`}
    >
      <div className="font-display italic text-[12px] text-bark/55 text-center tracking-[0.15em] uppercase mb-2">
        {words.length > 0 ? 'still to sort' : 'all sorted — hit check!'}
      </div>
      {words.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {words.map(w => (
            <DraggableWord key={w.word} word={w.word} emoji={w.emoji} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// DraggableWord — a word chip that can be dragged
// ─────────────────────────────────────────────────────────────────────────

function DraggableWord({ word, emoji }: { word: string; emoji?: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: word });
  const { hear, playing } = useContext(ListenContext);
  if (hear) {
    // Picture only. A tap (no movement) says the word; a drag sorts it.
    return (
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={() => hear(word)}
        className={`bg-white border-2 rounded-xl px-2 py-1 select-none cursor-grab active:cursor-grabbing inline-flex items-center gap-1 ${
          playing === word ? 'border-forest ring-2 ring-forest/40' : 'border-ochre'
        } ${isDragging ? 'opacity-30' : ''}`}
        style={{ touchAction: 'none', minHeight: 64, minWidth: 76 }}
        aria-label="a picture: tap to hear its word, drag it to sort it"
      >
        <span className="text-[36px] leading-none" aria-hidden>{emoji}</span>
        <SpeakerGlyph />
      </button>
    );
  }
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-white border-2 border-ochre rounded-xl px-3 py-1.5 text-sm font-display select-none cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-30' : ''
      }`}
      style={{ touchAction: 'none', fontWeight: 600 }}
      aria-label={`drag ${word}`}
    >
      {emoji && <span className="mr-1">{emoji}</span>}
      {word}
    </button>
  );
}

/** A small drawn speaker — "this one talks". */
function SpeakerGlyph() {
  return (
    <svg viewBox="0 0 20 20" width={16} height={16} aria-hidden>
      <path d="M 3 7.5 h 3 l 4 -3.5 v 12 l -4 -3.5 h -3 Z" fill="#3f2614" />
      <path d="M 12.5 7 q 2 3 0 6 M 14.5 5 q 3.6 5 0 10" stroke="#3f2614"
            strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// The floating card shown while dragging
function DraggingCard({ word, emoji, listen }: { word: string; emoji?: string; listen: boolean }) {
  if (listen) {
    return (
      <div className="bg-white border-2 border-forest rounded-xl px-2 py-1 shadow-lg inline-flex items-center"
           style={{ minHeight: 64, minWidth: 76 }}>
        <span className="text-[36px] leading-none">{emoji}</span>
      </div>
    );
  }
  return (
    <div
      className="bg-white border-2 border-forest rounded-xl px-3 py-1.5 text-sm font-display shadow-lg"
      style={{ fontWeight: 600 }}
    >
      {emoji && <span className="mr-1">{emoji}</span>}
      {word}
    </div>
  );
}
