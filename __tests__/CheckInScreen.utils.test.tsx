import { ROUTES } from '../src/navigation/routes';
import { getRecommendationAction } from '../src/screens/CheckInScreen.utils';

const CASES = [
  {
    mood: 5,
    energy: 5,
    route: ROUTES.FOCUS,
    cta: 'START IGNITE',
  },
  {
    mood: 1,
    energy: 2,
    route: ROUTES.ANCHOR,
    cta: 'OPEN ANCHOR',
  },
  {
    mood: 4,
    energy: 2,
    route: ROUTES.FOG_CUTTER,
    cta: 'OPEN FOG CUTTER',
  },
  {
    mood: 3,
    energy: 3,
    route: ROUTES.TASKS,
    cta: 'OPEN BRAIN DUMP',
  },
] as const;

describe('getRecommendationAction', () => {
  CASES.forEach(({ mood, energy, route, cta }) => {
    it(`returns ${route} with "${cta}" for mood=${mood} energy=${energy}`, () => {
      const action = getRecommendationAction(mood, energy);

      expect(action).toEqual({
        route,
        source: 'checkin_prompt',
        cta,
      });
    });
  });
});
