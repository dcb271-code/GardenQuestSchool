'use client';

// Per-skill math hints for the lesson player. A hint teaches the
// METHOD, not the answer: a times table for fact work, a stacked
// column setup for multi-digit arithmetic, the long-division dance,
// place-value charts for decimals, and strategy words for the rest.
//
// Dispatch is by skillCode (available on the item payload), because
// nearly all Level 4/5 arithmetic shares one generic renderer
// (EquationTap) — the item type alone can't tell 47×3 from 372÷3.

import type { ReactNode } from 'react';

export interface MathHint {
  title: string;
  body: ReactNode;
}

/** "3,240 + 1,875 = ?" → { a: 3240, op: '+', b: 1875 } */
function parseEquation(content: any): { a: number; op: string; b: number } | null {
  const eq = typeof content?.equation === 'string' ? content.equation : '';
  const m = eq.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*([+×x*÷/\-−])\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const op = m[2] === 'x' || m[2] === '*' ? '×' : m[2] === '/' ? '÷' : m[2] === '−' ? '−' : m[2];
  return { a: Number(m[1]), op, b: Number(m[3]) };
}

const fmt = (n: number) => Number.isInteger(n) ? n.toLocaleString('en-US') : String(n);

/** The 12×12 multiplication table, with the problem's row/column lit up. */
function TimesTable({ row, col }: { row?: number; col?: number }) {
  const ns = Array.from({ length: 12 }, (_, i) => i + 1);
  const hiRow = row && row >= 1 && row <= 12 ? row : undefined;
  const hiCol = col && col >= 1 && col <= 12 ? col : undefined;
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-collapse select-none" style={{ fontSize: 10.5, lineHeight: 1 }}>
        <tbody>
          <tr>
            <td className="border border-ochre/50 bg-ochre/30 font-bold text-center" style={{ width: 22, height: 20 }}>×</td>
            {ns.map(c => (
              <td key={c}
                className={`border border-ochre/50 font-bold text-center ${c === hiCol ? 'bg-[#FFD93D]' : 'bg-ochre/20'}`}
                style={{ width: 22, height: 20 }}>{c}</td>
            ))}
          </tr>
          {ns.map(r => (
            <tr key={r}>
              <td className={`border border-ochre/50 font-bold text-center ${r === hiRow ? 'bg-[#FFD93D]' : 'bg-ochre/20'}`}
                style={{ height: 20 }}>{r}</td>
              {ns.map(c => {
                const onPath = r === hiRow || c === hiCol;
                const target = r === hiRow && c === hiCol;
                return (
                  <td key={c}
                    className={`border border-ochre/40 text-center text-bark ${
                      target ? 'bg-[#FFD93D] font-bold' : onPath ? 'bg-[#FFF3C4]' : 'bg-white'
                    }`}
                    style={{ height: 20 }}>
                    {r * c}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The problem written the tall way, columns lined up, answer blank. */
function StackedProblem({ a, op, b }: { a: number; op: string; b: number }) {
  const top = fmt(a), bottom = fmt(b);
  const width = Math.max(top.length, bottom.length) + 2;
  return (
    <div className="bg-white border-2 border-ochre/50 rounded-xl py-3 px-4 mx-auto w-fit font-mono text-[24px] text-bark leading-snug"
      style={{ fontVariantNumeric: 'tabular-nums' }}>
      <div className="text-right" style={{ minWidth: `${width}ch` }}>{top}</div>
      <div className="text-right border-b-4 border-bark pb-1" style={{ minWidth: `${width}ch` }}>
        <span className="float-left text-terracotta font-bold">{op}</span>{bottom}
      </div>
      <div className="text-right text-bark/35 pt-1" style={{ minWidth: `${width}ch` }}>?</div>
    </div>
  );
}

/** Long-division bracket with the numbers in place. */
function LongDivisionSetup({ dividend, divisor }: { dividend: number; divisor: number }) {
  return (
    <div className="mx-auto w-fit font-mono text-[26px] text-bark" style={{ fontVariantNumeric: 'tabular-nums' }}>
      <div className="text-bark/35 text-right pr-1" style={{ marginLeft: `${String(divisor).length + 1}ch` }}>?</div>
      <div className="flex items-start">
        <span className="pr-1">{divisor}</span>
        <span className="border-l-4 border-t-4 border-bark pl-1 pt-0.5 rounded-tl">{fmt(dividend)}</span>
      </div>
    </div>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="text-left space-y-1.5 font-display text-[14px] text-bark/85 leading-snug list-none">
      {items.map((s, i) => (
        <li key={i} className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-sage/40 text-bark text-[11px] font-bold inline-flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function TextHint({ lines }: { lines: string[] }) {
  return <Steps items={lines} />;
}

/** Decimal place-value chart. */
function DecimalChart() {
  const cols = [
    ['hundreds', '100s'], ['tens', '10s'], ['ones', '1s'],
    ['•', '•'], ['tenths', '1/10'], ['hundredths', '1/100'],
  ];
  return (
    <div className="flex justify-center gap-0 font-display text-bark">
      {cols.map(([name, small], i) => (
        <div key={i} className={`px-2 py-1.5 text-center ${name === '•' ? '' : 'border-2 border-ochre/50 bg-white'} ${i > 0 && name !== '•' && cols[i-1][0] !== '•' ? '-ml-0.5' : ''} rounded-lg`}>
          <div className="text-[12px] font-bold">{name === '•' ? <span className="text-terracotta text-[20px]">.</span> : name}</div>
          {name !== '•' && <div className="text-[10px] text-bark/55">{small}</div>}
        </div>
      ))}
    </div>
  );
}

export function getMathHint(skillCode: string | undefined, content: any): MathHint | null {
  if (!skillCode || !skillCode.startsWith('math.')) return null;
  const eq = parseEquation(content);

  // ── times-table facts: the 12×12 chart, path highlighted ─────────
  if (skillCode === 'math.multiply.facts_to_5' || skillCode === 'math.multiply.facts_to_10'
      || skillCode === 'math.multiply.skip_count_bridge' || skillCode === 'math.multiply.equal_groups'
      || skillCode === 'math.multiply.arrays') {
    const row = eq?.op === '×' ? eq.a : undefined;
    const col = eq?.op === '×' ? eq.b : undefined;
    return {
      title: 'the times table',
      body: (
        <div className="space-y-3">
          <p className="font-display italic text-[14px] text-bark/75">
            follow the gold row and column — they meet at the answer.
          </p>
          <TimesTable row={row} col={col} />
        </div>
      ),
    };
  }

  // ── division facts live in the same table, walked backwards ──────
  if (skillCode === 'math.divide.facts_to_10' || skillCode === 'math.divide.unknown_factor') {
    const row = eq?.op === '÷' ? eq.b : undefined;
    return {
      title: 'division is the table backwards',
      body: (
        <div className="space-y-3">
          <p className="font-display italic text-[14px] text-bark/75">
            {eq && eq.op === '÷'
              ? `walk along row ${eq.b} until you find ${fmt(eq.a)} — the column number is your answer.`
              : 'find the row for the divider, walk along it to the big number — the column is your answer.'}
          </p>
          <TimesTable row={row} />
        </div>
      ),
    };
  }

  if (skillCode === 'math.multiply.by_10s_100s') {
    return {
      title: 'tens and hundreds trick',
      body: (
        <div className="space-y-3">
          <TextHint lines={[
            'cover the zeros for a moment.',
            'use the small fact you already know.',
            'put every zero back on the end.',
          ]} />
          {eq?.op === '×' && <TimesTable />}
        </div>
      ),
    };
  }

  // ── multi-digit multiply: stack it, work right to left ───────────
  if (skillCode === 'math.multiply.2digit_by_1digit'
      || skillCode === 'math.multiply.2digit_by_2digit'
      || skillCode === 'math.multiply.multi_digit') {
    return {
      title: 'stack it up',
      body: (
        <div className="space-y-3">
          {eq && eq.op === '×' && <StackedProblem a={eq.a} op="×" b={eq.b} />}
          <Steps items={[
            'multiply the ones first.',
            'then the tens (that answer ends in 0!), then the hundreds.',
            'add your rows together.',
          ]} />
          <TimesTable />
        </div>
      ),
    };
  }

  // ── multi-digit add/subtract: columns + carry/borrow ─────────────
  if (skillCode === 'math.operations.multi_digit_add_subtract'
      || skillCode === 'math.add.within_100.no_regrouping'
      || skillCode === 'math.add.within_100.with_regrouping'
      || skillCode === 'math.add.within_1000'
      || skillCode === 'math.subtract.within_100.no_regrouping'
      || skillCode === 'math.subtract.within_100.with_regrouping'
      || skillCode === 'math.subtract.within_1000') {
    const subtracting = eq?.op === '−' || eq?.op === '-';
    return {
      title: 'line up the columns',
      body: (
        <div className="space-y-3">
          {eq && <StackedProblem a={eq.a} op={subtracting ? '−' : '+'} b={eq.b} />}
          <Steps items={subtracting ? [
            'start with the ones column, on the right.',
            'top digit too small? borrow 10 from the next column over.',
            'work left, one column at a time.',
          ] : [
            'start with the ones column, on the right.',
            'if a column adds to 10 or more, carry the 1 to the next column.',
            'work left, one column at a time.',
          ]} />
          <p className="font-display italic text-[13px] text-bark/60">
            ✏️ the scratchpad is perfect for this one — write it out the tall way!
          </p>
        </div>
      ),
    };
  }

  // ── long division ────────────────────────────────────────────────
  if (skillCode === 'math.divide.long_division' || skillCode === 'math.divide.with_remainders') {
    return {
      title: 'divide, multiply, subtract, bring down',
      body: (
        <div className="space-y-3">
          {eq && eq.op === '÷' && <LongDivisionSetup dividend={eq.a} divisor={eq.b} />}
          <Steps items={[
            'divide: how many times does it fit into the first digit(s)?',
            'multiply and subtract to find what is left over.',
            'bring down the next digit and repeat.',
            'anything left at the very end is the remainder (R).',
          ]} />
        </div>
      ),
    };
  }

  // ── decimals ─────────────────────────────────────────────────────
  if (skillCode === 'math.decimals.tenths_hundredths') {
    return {
      title: 'the decimal point is home base',
      body: (
        <div className="space-y-3">
          <DecimalChart />
          <TextHint lines={[
            'the first spot after the point is tenths (7/10 = 0.7).',
            'the second spot is hundredths (7/100 = 0.07).',
          ]} />
        </div>
      ),
    };
  }
  if (skillCode === 'math.decimals.compare') {
    return {
      title: 'line up the points',
      body: (
        <div className="space-y-3">
          <DecimalChart />
          <TextHint lines={[
            'line up the decimal points one above the other.',
            'compare place by place, starting from the left.',
            '0.7 is 0.70 — add a zero if it helps you compare!',
          ]} />
        </div>
      ),
    };
  }
  if (skillCode === 'math.decimals.add_subtract') {
    return {
      title: 'points in a line',
      body: (
        <div className="space-y-3">
          {eq && <StackedProblem a={eq.a} op={eq.op === '+' ? '+' : '−'} b={eq.b} />}
          <TextHint lines={[
            'stack the numbers so the decimal points line up exactly.',
            'add or subtract like normal, column by column.',
            'the point drops straight down into your answer.',
          ]} />
        </div>
      ),
    };
  }
  if (skillCode === 'math.decimals.multiply_divide_10s') {
    return {
      title: 'the point takes a hop',
      body: <TextHint lines={[
        '× 10 hops the decimal point one spot right. × 100 hops it two.',
        '÷ 10 hops it one spot left. ÷ 100 hops it two.',
        'count the zeros — that is how many hops.',
      ]} />,
    };
  }

  // ── fractions ────────────────────────────────────────────────────
  if (skillCode === 'math.fractions.equivalent') {
    return {
      title: 'same slice, new name',
      body: <TextHint lines={[
        'multiply the top AND bottom by the same number — the fraction keeps its size.',
        '1/2 → ×2 on top and bottom → 2/4. same amount of pie!',
      ]} />,
    };
  }
  if (skillCode === 'math.fractions.add_subtract_like') {
    return {
      title: 'bottoms stay put',
      body: <TextHint lines={[
        'the bottoms match, so the slices are the same size.',
        'just add or subtract the tops.',
        'the bottom stays exactly the same in your answer.',
      ]} />,
    };
  }
  if (skillCode === 'math.fractions.add_subtract_unlike') {
    return {
      title: 'make the bottoms match',
      body: <TextHint lines={[
        'you can only add slices that are the same size.',
        'rename the fractions so the bottoms match, then add or subtract the tops.',
        'the matched bottom stays the same in your answer.',
      ]} />,
    };
  }
  if (skillCode === 'math.fractions.multiply') {
    return {
      title: 'tops times tops',
      body: <TextHint lines={[
        'multiply the tops together.',
        'multiply the bottoms together.',
        'that is the whole trick!',
      ]} />,
    };
  }
  if (skillCode === 'math.fractions.of_a_set') {
    return {
      title: 'fraction of a number',
      body: <TextHint lines={[
        'divide the number by the bottom of the fraction.',
        'then multiply by the top.',
        '2/3 of 12 → 12 ÷ 3 = 4, then 4 × 2 = 8.',
      ]} />,
    };
  }

  // ── rounding & big place value ───────────────────────────────────
  if (skillCode === 'math.placevalue.round_nearest_10'
      || skillCode === 'math.placevalue.round_nearest_100'
      || skillCode === 'math.placevalue.round_large') {
    return {
      title: 'look next door',
      body: <TextHint lines={[
        'find the digit in the place you are rounding to.',
        'look at the digit just to its right.',
        '5 or more? round up. 4 or less? it stays. everything after becomes zeros.',
      ]} />,
    };
  }
  if (skillCode === 'math.placevalue.to_1_000_000') {
    return {
      title: 'read big numbers in chunks',
      body: <TextHint lines={[
        'the commas cut the number into groups of three.',
        'read each group like a small number, then say its family: million, thousand…',
        '452,081 → "452 thousand, 81."',
      ]} />,
    };
  }

  // ── order of operations, volume, elapsed time, word problems ─────
  if (skillCode === 'math.order_of_operations') {
    return {
      title: 'the order of the garden gates',
      body: <TextHint lines={[
        'parentheses ( ) first — always.',
        'then × and ÷, left to right.',
        'then + and −, left to right.',
      ]} />,
    };
  }
  if (skillCode === 'math.volume.rectangular') {
    return {
      title: 'boxes are layers',
      body: <TextHint lines={[
        'volume = length × width × height.',
        'first find one floor layer: length × width.',
        'then stack it: multiply by the height.',
      ]} />,
    };
  }
  if (skillCode === 'math.time.elapsed_intervals' || skillCode === 'math.time.elapsed_across_hours') {
    return {
      title: 'count up in jumps',
      body: <TextHint lines={[
        'start at the earlier time.',
        'jump to the next friendly number (the next o\'clock).',
        'then jump the rest — add your jumps together.',
      ]} />,
    };
  }
  if (skillCode.startsWith('math.word_problem.')) {
    return {
      title: 'story detective',
      body: <TextHint lines={[
        'read the story twice — slowly the second time.',
        'circle the numbers. what is the story asking for?',
        'joining things → add or multiply. taking away or sharing → subtract or divide.',
        'two-step story? solve the first part, then use that answer.',
      ]} />,
    };
  }

  return null;
}
