function normalizeSearchText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[ـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function allowedEdits(length: number) {
  if (length < 4) return 0;
  if (length < 7) return 1;
  return 2;
}

function damerauLevenshteinWithin(left: string, right: string, maximum: number) {
  if (Math.abs(left.length - right.length) > maximum) return maximum + 1;

  const previousPrevious = new Array<number>(right.length + 1).fill(0);
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = new Array<number>(right.length + 1).fill(0);
    current[0] = leftIndex;
    let rowMinimum = current[0];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );

      if (
        leftIndex > 1 &&
        rightIndex > 1 &&
        left[leftIndex - 1] === right[rightIndex - 2] &&
        left[leftIndex - 2] === right[rightIndex - 1]
      ) {
        current[rightIndex] = Math.min(current[rightIndex], previousPrevious[rightIndex - 2] + 1);
      }
      rowMinimum = Math.min(rowMinimum, current[rightIndex]);
    }

    if (rowMinimum > maximum) return maximum + 1;
    for (let index = 0; index <= right.length; index += 1) previousPrevious[index] = previous[index];
    previous = current;
  }

  return previous[right.length];
}

/**
 * Scores a translated name for autocomplete fallback. Every query token must
 * match, which keeps typo tolerance useful without returning unrelated names.
 */
function fuzzyTextScore(value: string, query: string) {
  const normalizedValue = normalizeSearchText(value);
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedValue || !normalizedQuery) return null;
  if (normalizedValue === normalizedQuery) return 120;
  if (normalizedValue.startsWith(normalizedQuery)) return 110;
  if (normalizedValue.includes(normalizedQuery)) return 100;

  const valueTokens = normalizedValue.split(' ');
  const queryTokens = normalizedQuery.split(' ');
  let total = 0;

  for (const queryToken of queryTokens) {
    let best = -1;
    for (const valueToken of valueTokens) {
      if (valueToken === queryToken) best = Math.max(best, 95);
      else if (valueToken.startsWith(queryToken)) best = Math.max(best, 85);
      else if (queryToken.length >= 3 && valueToken.includes(queryToken)) best = Math.max(best, 75);
      else {
        const maximum = allowedEdits(queryToken.length);
        if (maximum === 0) continue;
        const distance = damerauLevenshteinWithin(queryToken, valueToken, maximum);
        if (distance <= maximum) best = Math.max(best, 70 - distance * 10);
      }
    }
    if (best < 0) return null;
    total += best;
  }

  return total / queryTokens.length;
}

export { fuzzyTextScore, normalizeSearchText };
