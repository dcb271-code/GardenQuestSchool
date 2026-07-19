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
];
