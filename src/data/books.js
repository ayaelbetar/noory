import { getArabicLetterActivity } from "./arabic-letter-activities.js";

/**
 * Source-of-truth manifest for supplied reading materials. Every configured
 * physical PDF page has been rendered to a standalone WebP image at build time.
 */
const storyPage = (bookId, number, text, audioFile, sourcePdfPage = number, activity = {}) => ({
  id: `${bookId}-${number}`,
  pageNumber: number,
  sourcePdfPage,
  // Some supplied story pages include the sentence inside the artwork. When a
  // paired illustration-only page is available, keep the reading text below
  // the image and use that clean illustration instead.
  imageSourcePdfPage: activity.imageSourcePdfPage || sourcePdfPage,
  // Ground truth for child-reading evaluation. This is never Nouri UI copy.
  expectedText: text,
  displayText: activity.displayText || text,
  activityType: activity.activityType || "story",
  expectedSpokenForm: activity.expectedSpokenForm || text,
  expectedPhonemes: activity.expectedPhonemes || [],
  narratorReferenceAudioUrl: activity.narratorReferenceAudioUrl || "",
  competingReferenceAudioUrls: activity.competingReferenceAudioUrls || [],
  letterReferenceAudioUrls: activity.letterReferenceAudioUrls || {},
  letterReferenceCalibration: activity.letterReferenceCalibration || {},
  letterActivity: activity.letterActivity || null,
  imagePosition: activity.imagePosition || "center",
  // Isolated short-vowel practice is deliberately outside the final
  // reading-content score until its acoustic assessment is validated.
  scoreInFinal: activity.scoreInFinal !== false,
  // Professional page narration, used only for listening/pronunciation help.
  // This is an explicit manifest value for the current displayed page. UI
  // code must pass it through to the narrator service; it must never derive a
  // filename from a page number.
  narratorAudio: audioFile ? `./assets/books/${bookId}/narration/${audioFile}` : "",
  // Retained for callers that have not yet switched to narratorAudio.
  narratorAudioUrl: audioFile ? `./assets/books/${bookId}/narration/${audioFile}` : "",
  imageUrl: `./assets/books/${bookId}/pages/page-${String(activity.imageSourcePdfPage || sourcePdfPage).padStart(2, "0")}.webp`,
});

// Keep each sound/word exercise once. The supplied PDF repeats the standalone
// letter before every new word, but those duplicate pages do not add a new
// reading item for the child.
const baa = [
  [2, "بَ", { displayText: "بَ", activityType: "letter-sound", expectedSpokenForm: "بَ", expectedPhonemes: ["b", "a"], letterActivity: getArabicLetterActivity("baa-fatha"), scoreInFinal: false }],
  [3, "بَيْتٌ", { activityType: "word" }], [5, "بَحْرٌ", { activityType: "word" }],
  [6, "بِ", { displayText: "بِ", activityType: "letter-sound", expectedSpokenForm: "بِ", expectedPhonemes: ["b", "i"], letterActivity: getArabicLetterActivity("baa-kasra"), scoreInFinal: false }],
  [7, "بِطِّيخٌ", { activityType: "word" }], [9, "بِنْتٌ", { activityType: "word" }],
  [10, "بُ", { displayText: "بُ", activityType: "letter-sound", expectedSpokenForm: "بُ", expectedPhonemes: ["b", "u"], letterActivity: getArabicLetterActivity("baa-damma"), scoreInFinal: false }],
  [11, "بُومَةٌ", { activityType: "word" }],
  [13, "بُرْتُقَالٌ", { activityType: "word" }]
].map(([sourcePdfPage, text, activity], index) => storyPage(
  "baa",
  index + 1,
  text,
  `Copy%20of%20${sourcePdfPage}.mp3`,
  sourcePdfPage,
  activity
));

const mosqueCleanIllustrationPages = Object.freeze({
  2: 3,
  5: 4,
  6: 7,
  8: 8,
  9: 9,
  11: 10,
  13: 12,
  15: 14,
  17: 16,
  19: 18
});

const mosque = [
  [2, "هُنَاكَ مَسْجِدٌ جَمِيلٌ قَرِيبٌ مِنْ مَنْزِلِي.", "1.mp3"],
  [5, "يَا تُرَى، مَاذَا يُوجَدُ فِي المَسْجِدِ؟", "4.mp3"],
  [6, "أَرْضٌ وَاسِعَةٌ، وسَجَّادٌ مَفْرُوشٌ.", "5.mp3"],
  [8, "مِنْبَرٌ.", "7.mp3"],
  [9, "مِحْرَابٌ.", "8.mp3"],
  [11, "مُؤَذِّنٌ يُؤَذِّنُ: اللهُ أَكْبَرُ. صَوْتُهُ جَمِيلٌ.", "10.mp3"],
  [13, "إِمَامٌ يُصَلِّي بِنَا جَمَاعَةً.", "12.mp3"],
  [15, "مُصْحَفٌ.", "14.mp3"],
  [17, "شَيْخٌ يُعَلِّمُنَا القُرْآنَ.", "16.mp3"],
  [19, "كَمْ أُحِبُّ المَسْجِدَ!", "18.mp3"]
// Source pages are intentionally non-contiguous because illustration-only
// pages are not reading activities. Keep their source reference, but present
// the selected reading activities to the child as pages 1–10.
].map(([sourcePdfPage, text, audioFile], index) => storyPage(
  "mosque",
  index + 1,
  text,
  audioFile,
  sourcePdfPage,
  { imageSourcePdfPage: mosqueCleanIllustrationPages[sourcePdfPage] }
));

// Explicit, verified page-to-recording manifest. 12–15 and 33 are
// intentionally absent; do not replace this list with a numeric offset.
const girlNarratorFiles = Object.freeze([
  "2.mp3", "3.mp3", "4.mp3", "5.mp3", "6.mp3", "7.mp3", "8.mp3", "9.mp3", "10.mp3", "11.mp3",
  "16.mp3", "17.mp3", "18.mp3", "19.mp3", "20.mp3", "21.mp3", "22.mp3", "23.mp3", "24.mp3", "25.mp3",
  "26.mp3", "27.mp3", "28.mp3", "29.mp3", "30.mp3", "31.mp3", "32.mp3", "34.mp3", "35.mp3"
]);

const girl = [
  "جَاءَ المَسَاء", "وَبَكَتِ الطَّفْلَةُ وَاء وَاء!", "لَعِبَ بَابَا مَعَهَا الغُمَّيْضَةَ", "وَدَعْدَعَتْهَا مَامَا لِسَاعَةٍ وَزِيَادَة", "فَضَحِكَتِ الطَّفْلَةُ لَحْظَةً", "لَكِنَّهَا عَادَتْ سَرِيعًا لِلبُكَاءِ", "وَقَفَ بَابَا عَلَى رَأْسِهِ", "وَأَخْرَجَتْ مَامَا لِسَانَهَا", "فَسَكَنَتِ الطَّفْلَةُ لَحْظَةً", "ثُمَّ عَادَتْ ثَانِيَةً لِلبُكَاءِ", "رَقَصَتِ مَامَا رَقْصَةَ الدَّجَاجَةِ", "وَجَلَسَ بَابَا فَوْقَ الثَّلَّاجَةِ", "لَكِنَّ الطَّفْلَةَ بَكَتْ وَبَكَتْ", "حَتَّى أَغْرَقَتْ دُمُوعُهَا البَيْتَ", "وَلَمَّا رَأَتْ مَامَا تَطْفُو", "وَبَابَا يَغْطِسُ", "كَرْكَرَتِ الطِّفْلَةُ لَحْظَةً", "لَكِنَّهَا عَادَتْ بِسُرْعَةٍ لِلبُكَاءِ", "ثُمَّ جَاءَ الجَدُّ", "وَمَعَهُ الجَدَّةُ", "وَجَاءَ الجِيرَانُ", "وَشُرْطَةُ النَّجْدَةِ", "وَحَاوَلُوا جَمِيعًا إِضْحَاكَهَا", "لَكِنَّ الطَّفْلَةَ اسْتَمَرَّتْ فِي البُكَاءِ", "وَفَجْأَةً سَمِعَ الكُلُّ صَوْتًا غَرِيبًا!", "بْرُوووووف!", "وَظَهَرَ أَنَّهُ - وَيَالَعَجَبِ! كَانَ المَغَصُ هُوَ السَّبَبْ!", "وَقَبْلَ طُلُوعِ شَمْسِ اليَوْمِ", "وَتَوَقَّفَ الطِّفْلُ عَنِ البُكَاءِ.", "رَاحَ الكُلُّ أَخِيرًا فِي النَّوْمِ"
].filter((_text, sourceIndex) => sourceIndex !== 28).map((text, index) => {
  const pageNumber = index + 1;
  const sourcePdfPage = pageNumber === 29 ? 31 : pageNumber + 1;
  return storyPage("girl", pageNumber, text, girlNarratorFiles[index], sourcePdfPage);
});

export const books = [
  {
    id: "baa",
    title: "حرف الباء",
    level: "تدريب الحروف",
    minutes: 3,
    coverColor: "linear-gradient(135deg, #f6b73c, #e67237)",
    coverImage: "./assets/books/baa/pages/page-01.webp",
    pages: baa
  },
  {
    id: "mosque",
    title: "ماذا يوجد في المسجد؟",
    level: "سهل",
    minutes: 4,
    coverColor: "linear-gradient(135deg, #167b79, #2762a4)",
    coverImage: "./assets/books/mosque/pages/page-01.webp",
    pages: mosque
  },
  {
    id: "girl",
    title: "الطفلة التي لم تتوقف عن البكاء",
    level: "متوسط",
    minutes: 6,
    coverColor: "linear-gradient(135deg, #b25b7e, #7851a9)",
    coverImage: "./assets/books/girl/pages/page-01.webp",
    pages: girl
  }
];
