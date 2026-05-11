// Shared taxonomy-based selection algorithm used by PDF upload + end-sem generator
export interface TaxonomyItem {
  marks: number;
  difficulty: string;
  bloomLevel: string;
}

export const shuffleArray = <T,>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * Select `count` items from `pool` honoring difficulty + Bloom quotas.
 * Items already in `usedIds` are skipped. Returns picked items + their ids.
 */
export const selectByTaxonomy = <T extends TaxonomyItem>(
  pool: Array<{ q: T; id: string }>,
  count: number,
  bloomDistribution: Record<string, number>,
  difficultyMix: Record<string, number>,
  usedIds: Set<string>,
): { selected: T[]; ids: string[] } => {
  if (count <= 0) return { selected: [], ids: [] };
  const available = pool.filter(({ id }) => !usedIds.has(id));
  if (available.length === 0) return { selected: [], ids: [] };

  const diffQuotas: Record<string, number> = {};
  const totalDiff = Object.values(difficultyMix).reduce((s, v) => s + v, 0) || 1;
  for (const [k, v] of Object.entries(difficultyMix)) {
    if (v > 0) diffQuotas[k] = Math.max(1, Math.round((v / totalDiff) * count));
  }

  const bloomQuotas: Record<string, number> = {};
  const totalBloom = Object.values(bloomDistribution).reduce((s, v) => s + v, 0) || 1;
  for (const [k, v] of Object.entries(bloomDistribution)) {
    if (v > 0) bloomQuotas[k] = Math.max(1, Math.round((v / totalBloom) * count));
  }

  const picked: { q: T; id: string }[] = [];
  const usedLocal = new Set<string>();

  // Phase 1: difficulty quotas
  for (const [diff, quota] of Object.entries(diffQuotas).sort((a, b) => b[1] - a[1])) {
    const matching = available.filter(
      ({ q, id }) => q.difficulty.toLowerCase() === diff && !usedLocal.has(id),
    );
    const sorted = matching.sort((a, b) => {
      const aBQ = bloomQuotas[a.q.bloomLevel.toLowerCase()] || 0;
      const bBQ = bloomQuotas[b.q.bloomLevel.toLowerCase()] || 0;
      return bBQ - aBQ + (Math.random() - 0.5) * 2;
    });
    const take = Math.min(quota, sorted.length, count - picked.length);
    for (let j = 0; j < take; j++) {
      picked.push(sorted[j]);
      usedLocal.add(sorted[j].id);
      const bl = sorted[j].q.bloomLevel.toLowerCase();
      if (bloomQuotas[bl]) bloomQuotas[bl]--;
    }
    if (picked.length >= count) break;
  }

  // Phase 2: bloom quotas
  if (picked.length < count) {
    const remaining = available.filter(({ id }) => !usedLocal.has(id));
    for (const [bloom] of Object.entries(bloomQuotas)
      .filter(([, q]) => q > 0)
      .sort((a, b) => b[1] - a[1])) {
      if (picked.length >= count) break;
      const matches = remaining.filter(
        ({ q, id }) => q.bloomLevel.toLowerCase() === bloom && !usedLocal.has(id),
      );
      if (matches.length) {
        const pick = matches[Math.floor(Math.random() * matches.length)];
        picked.push(pick);
        usedLocal.add(pick.id);
      }
    }
  }

  // Phase 3: random fill
  if (picked.length < count) {
    const remaining = available
      .filter(({ id }) => !usedLocal.has(id))
      .sort(() => Math.random() - 0.5);
    for (const item of remaining) {
      if (picked.length >= count) break;
      picked.push(item);
      usedLocal.add(item.id);
    }
  }

  return {
    selected: picked.slice(0, count).map((p) => p.q),
    ids: picked.slice(0, count).map((p) => p.id),
  };
};
