import { getArabicLetterActivity } from "./arabic-letter-activities.js";

/**
 * Source-of-truth manifest for supplied reading materials. Every configured
 * physical PDF page has been rendered to a standalone WebP image at build time.
 */
const storyPage = (bookId, number, text, audioFile, sourcePdfPage = number, activity = {}) => ({
  id: `${bookId}-${number}`,
  pageNumber: number,
  sourcePdfPage,
  // Ground truth for child-reading evaluation. This is never Nouri UI copy.
  expectedText: text,
  displayText: activity.displayText || text,
  activityType: activity.activityType || "reading",
  expectedSpokenForm: activity.expectedSpokenForm || text,
  expectedPhonemes: activity.expectedPhonemes || [],
  narratorReferenceAudioUrl: activity.narratorReferenceAudioUrl || "",
  competingReferenceAudioUrls: activity.competingReferenceAudioUrls || [],
  letterReferenceAudioUrls: activity.letterReferenceAudioUrls || {},
  letterReferenceCalibration: activity.letterReferenceCalibration || {},
  letterActivity: activity.letterActivity || null,
  // Professional page narration, used only for listening/pronunciation help.
  narratorAudioUrl: `./assets/books/${bookId}/narration/${audioFile}`,
  imageUrl: `./assets/books/${bookId}/pages/page-${String(sourcePdfPage).padStart(2, "0")}.webp`,
});

// Keep each sound/word exercise once. The supplied PDF repeats the standalone
// letter before every new word, but those duplicate pages do not add a new
// reading item for the child.
const baa = [
  [2, "بَ", { displayText: "بَ", activityType: "letter-sound", expectedSpokenForm: "بَ", expectedPhonemes: ["b", "a"], letterActivity: getArabicLetterActivity("baa-fatha") }],
  [3, "بَيْتٌ"], [5, "بَحْرٌ"],
  [6, "بِ", { displayText: "بِ", activityType: "letter-sound", expectedSpokenForm: "بِ", expectedPhonemes: ["b", "i"], letterActivity: getArabicLetterActivity("baa-kasra") }],
  [7, "بِطِّيخٌ"], [9, "بِنْتٌ"],
  [10, "بُ", { displayText: "بُ", activityType: "letter-sound", expectedSpokenForm: "بُ", expectedPhonemes: ["b", "u"], letterActivity: getArabicLetterActivity("baa-damma") }],
  [11, "بُومَةٌ"],
  [13, "بُرْتُقَالٌ"]
].map(([sourcePdfPage, text, activity], index) => storyPage(
  "baa",
  index + 1,
  text,
  `Copy%20of%20${sourcePdfPage}.mp3`,
  sourcePdfPage,
  activity
));

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
].map(([number, text, audioFile]) => storyPage("mosque", number, text, audioFile));

const girl = [
  "جَاءَ المَسَاء", "وَبَكَتِ الطَّفْلَةُ وَاء وَاء!", "لَعِبَ بَابَا مَعَهَا الغُمَّيْضَةَ", "وَدَعْدَعَتْهَا مَامَا لِسَاعَةٍ وَزِيَادَة", "فَضَحِكَتِ الطَّفْلَةُ لَحْظَةً", "لَكِنَّهَا عَادَتْ سَرِيعًا لِلبُكَاءِ", "وَقَفَ بَابَا عَلَى رَأْسِهِ", "وَأَخْرَجَتْ مَامَا لِسَانَهَا", "فَسَكَنَتِ الطَّفْلَةُ لَحْظَةً", "ثُمَّ عَادَتْ ثَانِيَةً لِلبُكَاءِ", "رَقَصَتِ مَامَا رَقْصَةَ الدَّجَاجَةِ", "وَجَلَسَ بَابَا فَوْقَ الثَّلَّاجَةِ", "لَكِنَّ الطَّفْلَةَ بَكَتْ وَبَكَتْ", "حَتَّى أَغْرَقَتْ دُمُوعُهَا البَيْتَ", "وَلَمَّا رَأَتْ مَامَا تَطْفُو", "وَبَابَا يَغْطِسُ", "كَرْكَرَتِ الطِّفْلَةُ لَحْظَةً", "لَكِنَّهَا عَادَتْ بِسُرْعَةٍ لِلبُكَاءِ", "ثُمَّ جَاءَ الجَدُّ", "وَمَعَهُ الجَدَّةُ", "وَجَاءَ الجِيرَانُ", "وَشُرْطَةُ النَّجْدَةِ", "وَحَاوَلُوا جَمِيعًا إِضْحَاكَهَا", "لَكِنَّ الطَّفْلَةَ اسْتَمَرَّتْ فِي البُكَاءِ", "وَفَجْأَةً سَمِعَ الكُلُّ صَوْتًا غَرِيبًا!", "وَظَهَرَ أَنَّهُ - وَيَالَعَجَبِ! كَانَ المَغَصُ هُوَ السَّبَبْ!", "وَقَبْلَ طُلُوعِ شَمْسِ اليَوْمِ", "رَاحَ الكُلُّ أَخِيرًا فِي النَّوْمِ"
// The supplied PDF and audio pack both begin with a cover. The reading text
// starts on source page 2, while the child-facing sequence remains 1–28.
].map((text, index) => storyPage("girl", index + 1, text, `${index + 2}.mp3`, index + 2));

export const books = [
  {
    id: "baa",
    title: "حرف الباء",
    level: "تدريب الحروف",
    practiceOnly: true,
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
