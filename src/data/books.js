export const books = [
  {
    id: "moon-light",
    title: "نور والقمر",
    level: "سهل",
    minutes: 2,
    coverColor: "linear-gradient(135deg, #167b79, #2762a4)",
    coverImage: "./assets/images/stories/moon-light.png",
    pages: [
      {
        id: "moon-1",
        text: "هذا قمر جميل",
        narratorText: "هذا قمر جميل",
        question: { prompt: "ماذا ترى في السماء؟", options: ["قمر", "زهرة"], answer: "قمر" }
      },
      {
        id: "moon-2",
        text: "نور تنظر إلى السماء",
        narratorText: "نور تنظر إلى السماء",
        question: { prompt: "إلى أين تنظر نور؟", options: ["السماء", "النهر"], answer: "السماء" }
      },
      {
        id: "moon-3",
        text: "القمر يضيء الطريق",
        narratorText: "القمر يضيء الطريق",
        question: { prompt: "ماذا يضيء القمر؟", options: ["الطريق", "الحقيبة"], answer: "الطريق" }
      }
    ]
  },
  {
    id: "garden-colors",
    title: "ألوان الحديقة",
    level: "سهل",
    minutes: 3,
    coverColor: "linear-gradient(135deg, #ee6f57, #f7bd38)",
    coverImage: "./assets/images/stories/garden-colors.png",
    pages: [
      {
        id: "garden-1",
        text: "هذه زهرة حمراء",
        narratorText: "هذه زهرة حمراء",
        question: { prompt: "ما لون الزهرة؟", options: ["حمراء", "زرقاء"], answer: "حمراء" }
      },
      {
        id: "garden-2",
        text: "العشب أخضر وجميل",
        narratorText: "العشب أخضر وجميل",
        question: { prompt: "ما لون العشب؟", options: ["أخضر", "بنفسجي"], answer: "أخضر" }
      },
      {
        id: "garden-3",
        text: "الشمس دافئة اليوم",
        narratorText: "الشمس دافئة اليوم",
        question: { prompt: "كيف هي الشمس اليوم؟", options: ["دافئة", "باردة"], answer: "دافئة" }
      }
    ]
  },
  {
    id: "small-journey",
    title: "رحلة صغيرة",
    level: "متوسط",
    minutes: 4,
    coverColor: "linear-gradient(135deg, #2762a4, #8ccfc0)",
    coverImage: "./assets/images/stories/small-journey.png",
    pages: [
      {
        id: "journey-1",
        text: "سارة تحمل حقيبة صغيرة",
        narratorText: "سارة تحمل حقيبة صغيرة",
        question: { prompt: "ماذا تحمل سارة؟", options: ["حقيبة", "كتاب"], answer: "حقيبة" }
      },
      {
        id: "journey-2",
        text: "تمشي سارة قرب النهر",
        narratorText: "تمشي سارة قرب النهر",
        question: { prompt: "قرب ماذا تمشي سارة؟", options: ["النهر", "القمر"], answer: "النهر" }
      },
      {
        id: "journey-3",
        text: "تعود سارة إلى البيت سعيدة",
        narratorText: "تعود سارة إلى البيت سعيدة",
        question: { prompt: "إلى أين تعود سارة؟", options: ["البيت", "الحديقة"], answer: "البيت" }
      }
    ]
  }
];
