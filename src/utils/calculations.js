export function getCableType(length) {
  return length <= 150 ? "RG-6" : "RG-11";
}

export function getAttenuation(length, lossPer100Feet) {
  return Number(((length / 100) * lossPer100Feet).toFixed(1));
}

export function isWithinTolerance(userValue, correctValue, tolerance = 0.5) {
  return Math.abs(userValue - correctValue) <= tolerance;
}