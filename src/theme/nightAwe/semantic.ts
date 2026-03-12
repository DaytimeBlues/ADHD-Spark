import { nightAweColors } from './colors';

export const semanticColors = {
  primary: nightAweColors.homeAccent,
  secondary: nightAweColors.igniteAccent,
  success: nightAweColors.success,
  warning: nightAweColors.warning,
  error: nightAweColors.error,
  info: nightAweColors.info,
} as const;

export const neutralScale = {
  lightest: nightAweColors.softIvory,
  lighter: '#E7D8C1',
  light: nightAweColors.sandstoneLight,
  medium: nightAweColors.dustBlue,
  dark: nightAweColors.deepIndigo,
  darker: '#0D1828',
  darkest: nightAweColors.skyBlack,
  border: 'rgba(217, 228, 242, 0.18)',
  borderSubtle: 'rgba(217, 228, 242, 0.1)',
} as const;

export const brandScale = {
  50: '#F2F6FB',
  100: '#E3ECF6',
  200: '#CCDCEE',
  300: '#AFC7FF',
  400: '#8FA7BF',
  500: nightAweColors.homeAccent,
  600: '#88A4D8',
  700: '#667EAB',
  800: '#465A7D',
  900: '#2B3950',
} as const;

export const surfaceColors = {
  base: 'rgba(8, 17, 30, 0.76)',
  raised: 'rgba(13, 24, 40, 0.84)',
  sunken: 'rgba(6, 13, 24, 0.9)',
  border: 'rgba(217, 228, 242, 0.14)',
  timer: 'rgba(12, 22, 36, 0.82)',
  timerBorder: 'rgba(217, 228, 242, 0.16)',
  timerActive: 'rgba(24, 42, 62, 0.88)',
} as const;

export const textColors = {
  primary: nightAweColors.softIvory,
  secondary: 'rgba(246, 241, 231, 0.78)',
  muted: 'rgba(217, 228, 242, 0.56)',
  onAccent: nightAweColors.skyBlack,
} as const;

export const utilityColors = {
  border: 'rgba(217, 228, 242, 0.14)',
  borderStrong: 'rgba(217, 228, 242, 0.24)',
  overlay: 'rgba(8, 17, 30, 0.66)',
  scrim: 'rgba(8, 17, 30, 0.46)',
} as const;

export const skyColors = {
  predawn: ['#08111E', '#16283F', '#4F5E73'],
  sunrise: ['#30445D', '#9E6A57', '#D9BC92'],
  day: ['#7C9AB7', '#B7C6D4', '#E8D8B8'],
  sunset: ['#1A2436', '#7D4731', '#C7935C'],
  night: ['#08111E', '#132238', '#24415F'],
} as const;

export const horizonColors = {
  rim: nightAweColors.sandstoneLight,
  lit: nightAweColors.ochreWash,
  face: nightAweColors.rustStone,
  shadow: nightAweColors.burntSienna,
  base: nightAweColors.umberShadow,
  far: nightAweColors.mauveStone,
} as const;

export const starColors = {
  bright: nightAweColors.starCool,
  warm: nightAweColors.starWarm,
  dim: nightAweColors.starDim,
} as const;

export const constellationColors = {
  line: nightAweColors.constellationLine,
  node: nightAweColors.constellationNode,
  active: nightAweColors.constellationActive,
  glow: 'rgba(175, 199, 255, 0.16)',
} as const;

export const featureColors = {
  home: nightAweColors.homeAccent,
  ignite: nightAweColors.igniteAccent,
  fogCutter: nightAweColors.fogCutterAccent,
  tasks: nightAweColors.tasksAccent,
  brainDump: nightAweColors.brainDumpAccent,
  checkIn: nightAweColors.checkInAccent,
} as const;
