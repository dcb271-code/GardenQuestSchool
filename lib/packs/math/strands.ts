export const MATH_STRANDS = [
  { code: 'counting', name: 'Counting & Cardinality', sortOrder: 1 },
  { code: 'operations', name: 'Operations & Algebraic Thinking', sortOrder: 2 },
  { code: 'place_value', name: 'Place Value', sortOrder: 3 },
  { code: 'multiplication', name: 'Multiplication Foundations', sortOrder: 4 },
  // Division is its own strand, not a wing of multiplication.
  //
  // All five math.divide.* skills used to live inside 'multiplication',
  // which is why division never showed up as a destination anywhere —
  // not in the compass, not in the planner, not in Hodge's
  // recommendations. It was a handful of stops inside somebody else's
  // territory. Sorting it directly after multiplication keeps the
  // teaching order (you do need the facts first) while making it a
  // place of its own.
  { code: 'division', name: 'Division', sortOrder: 5 },
  { code: 'measurement', name: 'Measurement & Data', sortOrder: 6 },
] as const;
