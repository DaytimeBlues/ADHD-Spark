import {
  CADDI_OVERVIEW,
  CADDI_REQUIREMENTS,
  CADDI_SOURCES,
  getCaddiSourceById,
} from '../src/config/caddi';

describe('CADDI config integrity', () => {
  it('has unique source ids and valid https urls', () => {
    const ids = new Set<string>();

    for (const source of CADDI_SOURCES) {
      expect(ids.has(source.id)).toBe(false);
      ids.add(source.id);

      expect(source.url.startsWith('https://')).toBe(true);
      expect(source.label.length).toBeGreaterThan(0);
      expect(source.title.length).toBeGreaterThan(0);
    }
  });

  it('requirements only reference known source ids', () => {
    const sourceIds = new Set(CADDI_SOURCES.map((source) => source.id));

    for (const requirement of CADDI_REQUIREMENTS) {
      expect(requirement.id.length).toBeGreaterThan(0);
      expect(requirement.title.length).toBeGreaterThan(0);
      expect(requirement.sourceIds.length).toBeGreaterThan(0);

      for (const sourceId of requirement.sourceIds) {
        expect(sourceIds.has(sourceId)).toBe(true);
      }
    }
  });

  it('exposes stable overview content and source lookup', () => {
    expect(CADDI_OVERVIEW.title).toBe('WHAT IS CADDI?');
    expect(CADDI_OVERVIEW.bullets.length).toBeGreaterThan(0);
    expect(getCaddiSourceById('caddi-rct-2025')?.label).toBe('RCT STUDY');
    expect(getCaddiSourceById('missing-id')).toBeUndefined();
  });
});
