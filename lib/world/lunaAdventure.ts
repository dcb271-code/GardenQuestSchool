/**
 * Luna's Lost Treasure — episodic story adventure.
 *
 * Tap Luna in the garden to enter the current episode: a storybook
 * sequence of narration, choices (no wrong answers — they branch
 * flavor), and PRACTICE GATES where advancing the story requires
 * completing a real focus session. Gates are the whole point: the
 * adventure is a frame around genuine practice, not a parallel game
 * economy. Gate passage is verified server-side against the real
 * session row (app/api/adventure/luna).
 *
 * Progress persists in world_state.garden.lunaAdventure (same
 * convention as pendingArrivalSpeciesCode / unlocked_branches).
 */

export type SceneArt =
  | { type: 'luna' }
  | { type: 'species'; code: string }
  | { type: 'emoji'; emoji: string };

export type LunaScene =
  | {
      kind: 'narration';
      id: string;
      text: string;          // narrated aloud via useNarrator
      art: SceneArt;
    }
  | {
      kind: 'choice';
      id: string;
      prompt: string;
      art: SceneArt;
      options: Array<{
        id: string;
        label: string;
        emoji: string;
        responseText: string; // narration shown+spoken after choosing
      }>;
    }
  | {
      kind: 'gate';
      id: string;
      inviteText: string;    // why Luna needs her help right now
      art: SceneArt;
      focusSubject: 'math' | 'reading';
      afterText: string;     // narration once the gate is passed
    };

export interface LunaEpisode {
  episode: number;
  title: string;
  scenes: LunaScene[];
}

export interface LunaAdventureState {
  episode: number;
  sceneIndex: number;
  choices: Record<string, string>;
  gatesPassed: string[];
  pendingGate: { gateId: string; sessionId: string } | null;
  completedEpisodes: number[];
}

export function defaultAdventureState(): LunaAdventureState {
  return {
    episode: 1,
    sceneIndex: 0,
    choices: {},
    gatesPassed: [],
    pendingGate: null,
    completedEpisodes: [],
  };
}

export function getEpisode(episode: number): LunaEpisode | undefined {
  return LUNA_EPISODES.find(e => e.episode === episode);
}

export const LUNA_EPISODES: LunaEpisode[] = [
  {
    episode: 1,
    title: 'Luna and the Moonflower Seed',
    scenes: [
      {
        kind: 'narration',
        id: 'ep1_open',
        text: 'Luna the cat is waiting for you by the garden gate, and her tail is doing the thing it does when she has a secret. "Mrow," she says, which today means: follow me.',
        art: { type: 'luna' },
      },
      {
        kind: 'narration',
        id: 'ep1_secret',
        text: 'Under the old fence, half-buried in soft dark soil, something glints. It is a seed — but not like any seed from the packet drawer. It is silver, and faintly warm, and it hums very quietly, like a bee dreaming.',
        art: { type: 'emoji', emoji: '🌱' },
      },
      {
        kind: 'choice',
        id: 'ep1_fork',
        prompt: 'Luna trots off with the seed in her mouth. Which way does she lead you?',
        art: { type: 'luna' },
        options: [
          {
            id: 'brook',
            label: 'Along the chattering brook',
            emoji: '🏞️',
            responseText: 'The brook giggles over the stones as you follow. Luna keeps to the dry bank, obviously. A dragonfly rides along on your shoulder for three whole steps.',
          },
          {
            id: 'grass',
            label: 'Through the tall whisper-grass',
            emoji: '🌾',
            responseText: 'The grass closes over your head like a green tent. Somewhere ahead, Luna\'s bell goes ting… ting… so you never lose her. Grasshoppers spring away like popcorn.',
          },
        ],
      },
      {
        kind: 'gate',
        id: 'ep1_gate_math',
        inviteText: 'You reach Hodge the beaver\'s dam — the only bridge across the deep water. Hodge tips his hat: "Toll for crossing! Not sticks, not stones — five good tries at your practice. That\'s the rule of the bridge."',
        art: { type: 'emoji', emoji: '🦫' },
        focusSubject: 'math',
        afterText: 'Hodge nods slowly, the way builders do when a thing is done right. "Sturdy work. Cross when ready." The dam holds steady under your feet, and Luna is already on the far bank.',
      },
      {
        kind: 'narration',
        id: 'ep1_meadow',
        text: 'On the far side lies a meadow you have never seen from the path. In the middle stands a stone with a hollow in its top, shaped exactly like a seed. Moss grows on the stone in curling letters, but they are old and hard to read.',
        art: { type: 'emoji', emoji: '🪨' },
      },
      {
        kind: 'gate',
        id: 'ep1_gate_reading',
        inviteText: 'The moss-letters are a message, and messages want reading. Luna puts her paw on the stone and looks at you the way she looks at a closed door she expects you to open. Time to read like a naturalist.',
        art: { type: 'luna' },
        focusSubject: 'reading',
        afterText: 'The words come clear under your eyes, the way words do once you know them: "PLANT ME WHERE THE MOON CAN FIND ME."',
      },
      {
        kind: 'choice',
        id: 'ep1_plant_spot',
        prompt: 'Where the moon can find it… Where do you plant the silver seed?',
        art: { type: 'emoji', emoji: '🌙' },
        options: [
          {
            id: 'hollow',
            label: 'In the hollow of the stone',
            emoji: '🪨',
            responseText: 'You press the seed into the stone\'s hollow, where rain has gathered a spoonful of soil. It fits like it was measured. The humming grows a little braver.',
          },
          {
            id: 'open',
            label: 'In the open meadow grass',
            emoji: '🌾',
            responseText: 'You choose the widest patch of sky and tuck the seed in where nothing will shade it. Luna pats the soil down with one paw, very seriously, like a tiny gardener.',
          },
        ],
      },
      {
        kind: 'narration',
        id: 'ep1_bloom',
        text: 'That night — Luna will swear to this forever — a flower opens in the dark, wide and white as a small moon come down to rest. Moths arrive like a soft grey snowfall. A moonflower. The first one the garden has ever grown.',
        art: { type: 'emoji', emoji: '🌸' },
      },
      {
        kind: 'narration',
        id: 'ep1_end',
        text: 'Luna curls up beneath it, entirely pleased with herself. Treasure, it turns out, is not always gold. Sometimes it is a seed that needed somebody brave enough to carry it, and clever enough to read the way. The end — of chapter one.',
        art: { type: 'luna' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Episode 2 — written for Esme.
  //
  // She finished episode 1 in full, made her choices, passed both
  // gates, and then the story simply stopped, because there was only
  // ever one chapter. This is the sequel, and it is built on the last
  // image of the first: the moths that came to the moonflower.
  //
  // The natural history is real and is the point. A Luna Moth has no
  // mouth — it lives about a week on what it stored as a caterpillar —
  // so every hour it spends circling a porch lamp is an hour it does
  // not spend finding another moth. Turning the light off genuinely
  // helps. Both facts come straight from SPECIES_CATALOG's luna_moth
  // entry, so the story cannot drift from what the field journal says.
  //
  // Which is also why the moth never feeds at the end. It would be the
  // obvious warm ending and it would contradict the thing the episode
  // just taught her.
  //
  // Gate order is reading-then-maths, the mirror of episode 1, so the
  // shape does not feel copied.
  {
    episode: 2,
    title: 'Luna and the Light That Told Lies',
    scenes: [
      {
        kind: 'narration',
        id: 'ep2_open',
        text: 'The moonflower still opens every night, wide and white, exactly as it promised. Tonight there is something else in the garden. Something big and pale green, with long trailing tails like ribbons, going round and round the porch lantern. Bump. Bump. Bump.',
        art: { type: 'emoji', emoji: '🏮' },
      },
      {
        kind: 'narration',
        id: 'ep2_moth',
        text: 'It is a moth, and it is enormous — as big as your whole hand. Luna sits very still on the step with her tail wrapped round her paws, which is what she does when something matters. The moth bumps the hot glass again. It looks so tired.',
        art: { type: 'species', code: 'luna_moth' },
      },
      {
        kind: 'choice',
        id: 'ep2_first_move',
        prompt: 'The moth keeps circling. What do you do first?',
        art: { type: 'luna' },
        options: [
          {
            id: 'watch',
            label: 'Sit still and watch it',
            emoji: '👀',
            responseText: 'You sit down on the cold step beside Luna and just watch. That is a real thing naturalists do, and it is harder than it sounds. You notice the tails on its wings curl like ribbon when it turns.',
          },
          {
            id: 'bachan',
            label: 'Fetch Bachan',
            emoji: '👵',
            responseText: 'Bachan comes out in her slippers without a single question, because she has known you a long time. She looks up at the moth for a while. "Ah," she says softly. "One of the green ones. Wait here."',
          },
        ],
      },
      {
        kind: 'gate',
        id: 'ep2_gate_reading',
        inviteText: 'Bachan brings out her old field guide, the fat one with the cracked spine, and opens it across both your knees. There is a page with this exact moth on it — pale green, long tails, drawn by hand. But the words are long ones. "Read it to me," she says. "My eyes are tired." (They are not tired. She wants you to read it.)',
        art: { type: 'emoji', emoji: '📖' },
        focusSubject: 'reading',
        afterText: 'You get to the end of the page, and it says something so strange you read it twice. A Luna Moth has NO MOUTH. Not a small one — none at all. It eats nothing its whole life as a moth. It lives about one week on food it saved up while it was a caterpillar, and it spends that week looking for another moth.',
      },
      {
        kind: 'narration',
        id: 'ep2_realise',
        text: 'One week. And this one is spending it going round and round a lantern. Bachan says the thing you were already thinking: "It steers by the moon. That is the map it was born knowing. Our lamp is telling it lies."',
        art: { type: 'emoji', emoji: '🌙' },
      },
      {
        kind: 'choice',
        id: 'ep2_light',
        prompt: 'The lantern is telling the moth lies. What do you do about it?',
        art: { type: 'emoji', emoji: '🏮' },
        options: [
          {
            id: 'switch',
            label: 'Turn the lantern off',
            emoji: '🔌',
            responseText: 'You reach up and click the switch. The porch goes dark, and for a moment you cannot see anything at all — then your eyes catch up, and the whole garden is there in silver.',
          },
          {
            id: 'cover',
            label: 'Cover it with Bachan’s cloth',
            emoji: '🧣',
            responseText: 'Bachan hands you the indigo cloth from the back of her chair and you drape it over the lantern. The light goes soft and low and blue, like a lamp under deep water, and the garden fills up with dark.',
          },
        ],
      },
      {
        kind: 'gate',
        id: 'ep2_gate_math',
        inviteText: 'One lamp is not enough. Bachan looks along the row of houses. "Every light out here is another lie," she says. "Come. We count them, and we knock on doors, and we ask." Counting in the dark, house by house — that is a job for good, careful numbers.',
        art: { type: 'emoji', emoji: '🔢' },
        focusSubject: 'math',
        afterText: 'Six lamps. Four neighbours who say yes straight away, one who is out, and Mr. Pell next door who says "for a moth?" and then turns his off anyway. The street goes quiet and dim, one window at a time.',
      },
      {
        kind: 'narration',
        id: 'ep2_dark',
        text: 'With the lights gone the moon comes out properly, the way it can only do in the dark. The moonflower glows like something switched on. And the green moth stops circling. It hangs in the air, completely still, as if it is listening.',
        art: { type: 'emoji', emoji: '🌸' },
      },
      {
        kind: 'narration',
        id: 'ep2_rise',
        text: 'Then it climbs. Straight up and away over the fence, sure as an arrow, going somewhere it has always known how to find. And out of the dark trees on the other side, another pale green shape rises to meet it.',
        art: { type: 'species', code: 'luna_moth' },
      },
      {
        kind: 'narration',
        id: 'ep2_end',
        text: 'Two moths, in the dark, who found each other because somebody turned off a light. Luna washes one paw as if none of this was remarkable. Bachan says only: "Good. Now bed." The end — of chapter two.',
        art: { type: 'luna' },
      },
    ],
  },
];
