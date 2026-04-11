import { lossTable } from "./constants";
import { getCableType, getAttenuation } from "./calculations";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(1));
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateRandomDrop() {
  const length = getRandomInt(20, 320);
  const cableType = getCableType(length);

  const startingTX = getRandomFloat(37.9, 47.9);

  const lowFrequencyChoices = Object.keys(lossTable)
    .map(Number)
    .filter((freq) => freq >= 55 && freq < 400);

  const highFrequencyChoices = Object.keys(lossTable)
    .map(Number)
    .filter((freq) => freq >= 400);

  const lowFreq = getRandomItem(lowFrequencyChoices);
  const highFreq = getRandomItem(highFrequencyChoices);

  const startingLowRX = getRandomFloat(3.5, 12.5);
  const startingHiRX = getRandomFloat(8.9, 19.9);

  const txLoss = getAttenuation(length, lossTable[5][cableType]);
  const lowRxLoss = getAttenuation(length, lossTable[lowFreq][cableType]);
  const hiRxLoss = getAttenuation(length, lossTable[highFreq][cableType]);

  const correctTX = Number((startingTX + txLoss).toFixed(1));
  const correctLowRX = Number((startingLowRX - lowRxLoss).toFixed(1));
  const correctHiRX = Number((startingHiRX - hiRxLoss).toFixed(1));

  return {
    length,
    cableType,
    startingTX,
    lowFreq,
    highFreq,
    startingLowRX,
    startingHiRX,
    correctTX,
    correctLowRX,
    correctHiRX,
  };
}