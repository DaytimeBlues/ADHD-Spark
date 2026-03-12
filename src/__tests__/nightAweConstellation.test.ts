import {
  getNightAweTransitionTargets,
  NIGHT_AWE_CONSTELLATION_EDGES,
  NIGHT_AWE_CONSTELLATION_NODES,
} from '../ui/nightAwe/nightAweConstellation';

describe('Night Awe constellation transitions', () => {
  it('keeps the active node and its connected lines as the only transition targets', () => {
    const targets = getNightAweTransitionTargets('fogCutter');

    expect(targets.activeNodeId).toBe('fogCutter');
    expect(targets.connectedNodeIds).toEqual(['ignite', 'checkIn', 'brainDump']);
    expect(targets.activeEdgeIds).toEqual([
      'ignite-fogCutter',
      'fogCutter-checkIn',
      'brainDump-fogCutter',
    ]);
  });

  it('keeps Fog Cutter available in the shared feature-node system', () => {
    expect(
      NIGHT_AWE_CONSTELLATION_NODES.some((node) => node.id === 'fogCutter'),
    ).toBe(true);
    expect(
      NIGHT_AWE_CONSTELLATION_EDGES.some(
        ([fromId, toId]) => fromId === 'fogCutter' || toId === 'fogCutter',
      ),
    ).toBe(true);
  });
});
