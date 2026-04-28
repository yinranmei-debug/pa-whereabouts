import { SceneL1, SceneL2, SceneL3, SceneL4 } from './SettlementScenes';

export const LEVELS = [
  {
    id: 'arrival',
    week: 1,
    title: 'First Camp',
    vibe: 'Pitched a tent. Lit a fire. You made it.',
    rule: 'Set your status 2+ days in a week.',
    Scene: SceneL1,
    ringFrom: '#ff8030', ringTo: '#ffd060',
    tagBg: 'rgba(255,180,80,0.15)', tagFg: '#ffd060',
  },
  {
    id: 'foundation',
    week: 2,
    title: 'Foundation',
    vibe: 'Shelters rising. A sapling sprouts. This place is yours now.',
    rule: 'Keep it up for 2 consecutive weeks.',
    Scene: SceneL2,
    ringFrom: '#60d0ff', ringTo: '#c060ff',
    tagBg: 'rgba(96,208,255,0.15)', tagFg: '#aef0ff',
  },
  {
    id: 'establishment',
    week: 3,
    title: 'Settlement',
    vibe: 'Lights in windows. Neighbors on the path. A real home.',
    rule: 'Keep it up for 3 consecutive weeks.',
    Scene: SceneL3,
    ringFrom: '#aef0a0', ringTo: '#60d0ff',
    tagBg: 'rgba(174,240,160,0.15)', tagFg: '#aef0a0',
  },
  {
    id: 'metropolis',
    week: 4,
    title: 'Metropolis',
    vibe: 'Neon towers. Hover-traffic. You built a civilization.',
    rule: 'Keep it up for 4 consecutive weeks.',
    Scene: SceneL4,
    ringFrom: '#ff60c0', ringTo: '#60d0ff',
    tagBg: 'rgba(255,96,192,0.18)', tagFg: '#ff8fd0',
  },
];
