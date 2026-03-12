/**
 * Night Awe Colors
 *
 * Uluru-inspired horizon and natural sky palette.
 */

export const nightAweColors = {
  skyBlack: '#08111E',
  deepIndigo: '#132238',
  mutedBlue: '#24415F',
  dustBlue: '#5D7A96',
  moonMist: '#D9E4F2',
  softIvory: '#F6F1E7',

  sandstoneLight: '#D9BC92',
  ochreWash: '#C7935C',
  rustStone: '#9E5C3C',
  burntSienna: '#7D4731',
  umberShadow: '#4B2F28',
  mauveStone: '#735B63',

  starCool: '#E7EEF8',
  starWarm: '#F5E6C9',
  starDim: 'rgba(231, 238, 248, 0.52)',
  constellationLine: 'rgba(217, 228, 242, 0.22)',
  constellationNode: '#E7EEF8',
  constellationActive: '#AFC7FF',

  homeAccent: '#AFC7FF',
  igniteAccent: '#E8C08D',
  fogCutterAccent: '#C7935C',
  tasksAccent: '#D9BC92',
  brainDumpAccent: '#B79AA6',
  checkInAccent: '#8FA7BF',

  success: '#8FBFA8',
  warning: '#E8C08D',
  error: '#C87A68',
  info: '#AFC7FF',
} as const;

export type NightAweColor = keyof typeof nightAweColors;
