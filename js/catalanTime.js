/**
 * Converts a JS Date into the spoken Catalan time phrase.
 *
 * Catalan tells time by counting quarters *towards* the next hour
 * ("un quart de cinc" = a quarter towards five = 16:15), so most
 * phrases below reference `next` (the upcoming hour) rather than
 * `cur` (the hour that just passed).
 */

const HOUR_NAMES = [
  'dotze', 'una', 'dues', 'tres', 'quatre', 'cinc', 'sis',
  'set', 'vuit', 'nou', 'deu', 'onze',
];

function hourName(hourIndex) {
  return HOUR_NAMES[hourIndex];
}

// "La una", but "Les dues" / "Les dotze" / etc.
function article(hourIndex) {
  return hourIndex === 1 ? 'La' : 'Les';
}

// "d'una" / "d'onze" (vowel elision), but "de dues", "de tres", ...
function preposition(hourIndex) {
  return hourIndex === 1 || hourIndex === 11 ? "d'" : 'de ';
}

const QUARTER_LEAD = {
  6: 'Gairebé mig quart', 7: 'Mig quart', 8: 'Mig quart',
  9: 'Gairebé cinc minuts per un quart', 10: 'Cinc minuts per un quart',
  11: 'Quatre minuts per un quart', 12: 'Tres minuts per un quart',
  13: 'Dos minuts per un quart', 14: 'Gairebé un quart',
  15: 'Un quart', 16: 'Un quart', 17: 'Un quart',
  18: 'Dos minuts per un quart i cinc', 19: 'Gairebé un quart i cinc',
  20: 'Un quart i cinc',
  21: 'Gairebé un quart i mig', 22: 'Un quart i mig', 23: 'Un quart i mig',
  24: 'Gairebé cinc minuts per dos quarts', 25: 'Cinc minuts per dos quarts',
  26: 'Quatre minuts per dos quarts', 27: 'Tres minuts per dos quarts',
  28: 'Dos minuts per dos quarts', 29: 'Gairebé dos quarts',
  30: 'Dos quarts', 31: 'Dos quarts', 32: 'Dos quarts',
  33: 'Dos minuts per dos quarts i cinc', 34: 'Un minut per dos quarts i cinc',
  35: 'Dos quarts i cinc',
  36: 'Gairebé dos quarts i mig', 37: 'Dos quarts i mig', 38: 'Dos quarts i mig',
  39: 'Gairebé cinc minuts per tres quarts', 40: 'Cinc minuts per tres quarts',
  41: 'Quatre minuts per tres quarts', 42: 'Tres minuts per tres quarts',
  43: 'Dos minuts per tres quarts', 44: 'Gairebé tres quarts',
  45: 'Tres quarts', 46: 'Tres quarts', 47: 'Tres quarts',
  48: 'Dos minuts per tres quarts i cinc', 49: 'Un minut per tres quarts i cinc',
  50: 'Tres quarts i cinc',
  51: 'Gairebé tres quarts i mig', 52: 'Tres quarts i mig', 53: 'Tres quarts i mig',
};

// Minutes where a "tocat/tocats" style qualifier is appended at the very end.
const QUALIFIER = {
  16: 'tocat', 17: 'ben tocat',
  31: 'tocats', 32: 'ben tocats',
  46: 'tocats', 47: 'ben tocats',
};

const FIFTY_LEAD = {
  54: 'Gairebé cinc minuts per', 55: 'Cinc minuts per',
  56: 'Quatre minuts per', 57: 'Tres minuts per',
  58: 'Dos minuts per', 59: 'Un minut per',
};

/**
 * @param {Date} date
 * @returns {string} spoken Catalan phrase, e.g. "Dos quarts de cinc"
 */
function catalanTimePhrase(date) {
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const cur = hour24 % 12; // 0 = "dotze"
  const next = (cur + 1) % 12;

  if (minute <= 2) {
    const tail = minute === 0
      ? 'en punt'
      : minute === 1
        ? (cur === 1 ? 'tocada' : 'tocades')
        : (cur === 1 ? 'ben tocada' : 'ben tocades');
    return `${article(cur)} ${hourName(cur)} ${tail}`;
  }

  if (minute <= 5) {
    const lead = minute === 3
      ? 'Passen tres minuts'
      : minute === 4
        ? 'Passen gairebé cinc minuts'
        : 'Passen cinc minuts';
    return `${lead} ${preposition(cur)}${hourName(cur)}`;
  }

  if (minute <= 53) {
    const phrase = `${QUARTER_LEAD[minute]} ${preposition(next)}${hourName(next)}`;
    const qualifier = QUALIFIER[minute];
    return qualifier ? `${phrase} ${qualifier}` : phrase;
  }

  // minute 54..59: approaching the next full hour (article lowercase, mid-sentence)
  const lowerArticle = article(next).toLowerCase();
  return `${FIFTY_LEAD[minute]} ${lowerArticle} ${hourName(next)} en punt`;
}

/**
 * @param {Date} date
 * @returns {string} digital HH:MM, 24h
 */
function digitalTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { catalanTimePhrase, digitalTime, HOUR_NAMES };
}
