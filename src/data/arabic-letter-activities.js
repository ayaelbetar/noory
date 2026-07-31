// Data-driven isolated Arabic letter activities. Each class accepts multiple
// approved references. `approved: false` makes the result safely
// `not-calibrated`, never an automatic pass.
const baaNarration = "./assets/books/baa/narration/";
const baaReferences = {
  ba: [`${baaNarration}Copy%20of%202.mp3`],
  bi: [`${baaNarration}Copy%20of%206.mp3`],
  bu: [`${baaNarration}Copy%20of%2010.mp3`]
};
const split = { consonantEndRatio: 0.45, vowelStartRatio: 0.40, vowelEndRatio: 1 };

export const arabicLetterActivities = {
  "baa-fatha": { id: "baa-fatha", baseLetter: "ب", targetDiacritic: "fatha", displayText: "بَ", targetClass: "ba", contrastClasses: ["bi", "bu"], references: baaReferences, segmentation: split, calibration: { approved: false } },
  "baa-kasra": { id: "baa-kasra", baseLetter: "ب", targetDiacritic: "kasra", displayText: "بِ", targetClass: "bi", contrastClasses: ["ba", "bu"], references: baaReferences, segmentation: split, calibration: { approved: false } },
  "baa-damma": { id: "baa-damma", baseLetter: "ب", targetDiacritic: "damma", displayText: "بُ", targetClass: "bu", contrastClasses: ["ba", "bi"], references: baaReferences, segmentation: split, calibration: { approved: false } }
};

export function getArabicLetterActivity(id) { return arabicLetterActivities[id] || null; }
