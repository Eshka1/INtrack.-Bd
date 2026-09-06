const UNITS = {
  ton: ['mass', 1000000], t: ['mass', 1000000], kg: ['mass', 1000], kgs: ['mass', 1000],
  kilogram: ['mass', 1000], kilograms: ['mass', 1000], g: ['mass', 1], gram: ['mass', 1], grams: ['mass', 1],
  mg: ['mass', 0.001], l: ['volume', 1000], liter: ['volume', 1000], liters: ['volume', 1000],
  ml: ['volume', 1], milliliter: ['volume', 1], milliliters: ['volume', 1], km: ['length', 1000000],
  m: ['length', 1000], meter: ['length', 1000], meters: ['length', 1000], cm: ['length', 10],
  centimeter: ['length', 10], mm: ['length', 1], yard: ['length', 914.4], yards: ['length', 914.4],
  yd: ['length', 914.4], ft: ['length', 304.8], feet: ['length', 304.8]
};

function convertUnits(quantity, fromUnit, toUnit) {
  const from = String(fromUnit || 'units').toLowerCase().trim();
  const to = String(toUnit || 'units').toLowerCase().trim();
  if (from === to) return Number(quantity);
  const source = UNITS[from];
  const target = UNITS[to];
  if (!source || !target || source[0] !== target[0]) return Number(quantity);
  return Number(quantity) * source[1] / target[1];
}

module.exports = { convertUnits };
