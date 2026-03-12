import { Platform } from 'react-native';
import { skyColors } from './semantic';

export type NightAweBackgroundVariant = 'horizon' | 'focus' | 'plain';

type BackgroundStyle = {
  background?: string;
  backgroundColor?: string;
};

export const backgroundStyles: Record<
  NightAweBackgroundVariant,
  BackgroundStyle | undefined
> = {
  horizon: Platform.select({
    web: {
      background: `linear-gradient(180deg, ${skyColors.night[0]} 0%, ${skyColors.night[1]} 52%, ${skyColors.night[2]} 100%)`,
    },
    default: {
      backgroundColor: skyColors.night[0],
    },
  }),
  focus: Platform.select({
    web: {
      background: `linear-gradient(180deg, ${skyColors.predawn[0]} 0%, ${skyColors.predawn[1]} 55%, ${skyColors.predawn[2]} 100%)`,
    },
    default: {
      backgroundColor: skyColors.predawn[0],
    },
  }),
  plain: Platform.select({
    web: {
      background: `linear-gradient(180deg, ${skyColors.day[0]} 0%, ${skyColors.day[1]} 60%, ${skyColors.day[2]} 100%)`,
    },
    default: {
      backgroundColor: skyColors.day[0],
    },
  }),
};
