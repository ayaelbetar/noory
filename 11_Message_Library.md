# 11_Message_Library

# Noor Message Library

**Version:** 2.0  
**Status:** Final — **single source of truth** for all child-visible Arabic copy  
**Locale:** Arabic (`ar`) · RTL  
**Rule:** Implementation MUST use these strings (or `message_key` lookups). Do not invent child-facing text in code.

---

# Purpose

Provide a consistent library of child-friendly **Arabic** messages used by Noor across the entire **Reading Session**. English appears only as **developer reference** (comment / `en_reference`), never in the child UI.

---

# Voice & Tone Rules

Always:
- Warm
- Positive
- Short
- Encouraging
- Age-appropriate
- Arabic-first

Never:
- Blame the child.
- Use technical language.
- Mention AI, algorithms, robots, or “evaluation.”
- Use forbidden terms (see `README.md` terminology table): **Wrong**, **Failed**, **Incorrect**, **Try Again** (as English product label), exam framing, **نتيجتك**, score percentages, letter grades, or rank — child copy stays effort-focused only.

---

# UI Labels (Child-Facing, Arabic)

| `message_key` | Arabic (canonical) | `en_reference` (dev only) | Canonical term |
|---------------|-------------------|---------------------------|----------------|
| `cta.read_with_noor` | اقرأ مع نور | Read with Noor | Read with Noor |
| `cta.start_reading` | ابدأ القراءة | Start Reading | Recording start |
| `cta.done_reading` | انتهيت | Done | Recording stop |
| `cta.retry` | حاول مرة أخرى | Retry | **Retry** |
| `cta.next_page` | الصفحة التالية | Next Page | **Continue** (after Success) |
| `cta.continue_reading` | لنكمل القراءة | Continue | **Continue** (Decision 7 — skip page) |
| `cta.read_another_story` | قصة أخرى | Another story | — |
| `cta.listen_to_reading` | استمع لقراءتك | Listen to your reading | — |
| `cta.choose_story` | هيا نبدأ أول قصة! 📚 | Let's start the first story! | — |

---

# Welcome Messages

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `welcome.01` | مرحبًا! أنا نور. هيا نقرأ معًا. | Hi! I'm Noor. Let's read together. |
| `welcome.02` | أنا متحمس لقراءة هذه القصة معك! | I'm excited to read this story with you! |
| `welcome.03` | هل أنت مستعد لمغامرة جديدة؟ | Ready for a new adventure? |
| `noor_intro.01` | أهلًا بك! | Welcome! |
| `noor_intro.02` | أنا نور 🌟 | I am Noor. |
| `noor_intro.03` | سنقرأ القصص معًا خطوة بخطوة. | We will read stories together, step by step. |
| `noor_intro.04` | أستمع إلى صوتك، وأشجعك، وأساعدك عندما تحتاج. | I listen, encourage, and help when needed. |

---

# Before Reading

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `before.01` | خذ وقتك. | Take your time. |
| `before.02` | اقرأ عندما تكون جاهزًا. | Read when you're ready. |
| `before.03` | سأكون هنا وأستمع إليك. | I'll be here listening. |

---

# Listening (During Recording)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `listen.01` | أنا أستمع... | I'm listening... |
| `listen.02` | أنت تبلي بلاءً حسنًا. | You're doing great. |
| `listen.03` | واصل! | Keep going! |

---

# Success Messages (Outcome: **Success**)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `success.01` | قراءة رائعة! | Wonderful reading! |
| `success.02` | أحسنت! | Great job! |
| `success.03` | كان ذلك رائعًا! | That was fantastic! |
| `success.04` | لنقلب الصفحة. | Let's turn the page. |
| `success.05` | أنا فخور بجهدك. | I'm proud of your effort. |

---

# Retry Messages (Outcome: **Retry**)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `retry.01` | محاولة جميلة! | Nice try! |
| `retry.02` | لنستمع معًا. | Let's listen together. |
| `retry.03` | نستطيع فعل ذلك معًا. | We can do it together. |
| `retry.04` | كل محاولة تساعدك على التقدُّم. | Every try helps you improve. |

---

# Before Narrator Audio

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `narrator.01` | لنسمع هذه الصفحة معًا. | Let's hear this page together. |
| `narrator.02` | استمع جيدًا، ثم نضغط «حاول مرة أخرى». | Listen carefully, then tap Retry. |

---

# Loading Messages (During Upload / Evaluation)

Do not imply grading or tests.

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `loading.01` | لحظة واحدة... | One moment... |
| `loading.02` | أنا معك... | I'm with you... |
| `loading.03` | قريبًا... | Almost ready... |

---

# Story Completion & **Reading Summary**

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `complete.01` | أنهيت القصة! | You finished the story! |
| `complete.02` | كل قصة تفتح لك عالمًا جديدًا. | Every story opens a new world. |
| `complete.03` | أحببت القراءة معك. | I loved reading with you. |
| `summary.line_pages` | قرأنا {completedPages} صفحة من {totalPages}. | We read {completedPages} of {totalPages} pages. |
| `summary.line_effort` | جهودك اليوم رائعة! | Your effort today was wonderful! |
| `summary.final_score` | نتيجة قراءتك | Your reading score |
| `voice.welcome` | مرحبًا{name}، اقرأ الصفحة بصوت واضح، وأنا سأستمع إليك. | Hello{name}, read the page clearly and I will listen. |
| `voice.meet` | مرحبًا{name}! أنا نور، رفيقك في رحلة القراءة. | Hello{name}! I am Noor, your reading companion. |
| `voice.start_reading` | ابدأ القراءة بصوت واضح، وأنا سأستمع إليك. | Start reading clearly and I will listen. |
| `voice.complete` | مبروك{name}! أنهيت القصة. | Congratulations{name}! You finished the story. |

---

# Internet Messages

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `network.01` | يبدو أن الاتصال انقطع. | It looks like we lost the connection. |
| `network.02` | لنحاول مرة أخرى بعد قليل. | Let's try again in a moment. |

---

# Microphone Messages

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `mic.01` | أحتاج أن أسمع صوتك. | I need to hear your voice. |
| `mic.02` | يرجى السماح بالمايكروفون حتى نقرأ معًا. | Please allow microphone access so we can read together. |

---

# Decision 7 — Continue After Max Retries

Shown when the child reaches **3** **Retry** outcomes on the same page (see `03_Product_Decisions.md` Decision 7).

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `continue.01` | قرأت بجهد رائع! لنكمل إلى الصفحة التالية. | You tried so hard! Let's continue to the next page. |
| `continue.02` | أحيانًا نتابع القصة ونعود لاحقًا. | Sometimes we move on and come back later. |

Primary CTA: `cta.continue_reading` (**Continue**).

---

# Delight Messages

Use occasionally; **contextual** selection with rotation (not purely random). See `03_Product_Decisions.md` Decision 11.

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `delight.01` | القراءة معك ممتعة جدًا! | Reading with you is so much fun! |
| `delight.02` | أنت تصبح قارئًا واثقًا. | You're becoming a confident reader. |
| `delight.03` | كل صفحة مغامرة جديدة. | Every page is a new adventure. |
| `delight.04` | لا أطيق انتظار القصة التالية! | I can't wait for the next story! |

---

# Personalization (Optional MVP)

Use only if the Noory app already provides a display name for the active child profile (**no new auth** in MVP). If absent, use non-personalized messages.

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `personal.01` | أحسنت يا {ChildName}! | Great job, {ChildName}! |
| `personal.02` | سعيد بوجودك يا {ChildName}. | I'm happy you're here, {ChildName}. |
| `personal.03` | لنتابع القراءة يا {ChildName}. | Let's keep reading, {ChildName}. |

---

# Encouragement (`encourage.*`)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `encourage.01` | أنت تبلي بلاءً رائعًا! | You are doing wonderfully! |
| `encourage.02` | جهدك يفرحني. | Your effort makes me happy. |
| `encourage.03` | كل كلمة تقرأها تضيء الطريق. | Every word you read lights the way. |
| `encourage.04` | أنا فخور بك. | I am proud of you. |
| `encourage.05` | استمر هكذا! | Keep going like this! |
| `encourage.06` | قراءتك جميلة. | Your reading is beautiful. |
| `encourage.07` | أحب أن أستمع إليك. | I love listening to you. |
| `encourage.08` | أنت بطل قصة اليوم. | You are today's story hero. |
| `encourage.09` | خطوة بعد خطوة، نتقدّم. | Step by step, we move forward. |
| `encourage.10` | صوتك واضح وجميل. | Your voice is clear and lovely. |
| `encourage.11` | ما أجمل محاولتك! | What a beautiful try! |
| `encourage.12` | أنت قريب جدًا! | You are very close! |
| `encourage.13` | لا بأس، نحن معًا. | It is okay, we are together. |
| `encourage.14` | أنت شجاع جدًا. | You are very brave. |
| `encourage.15` | القصة أجمل معك. | The story is nicer with you. |
| `encourage.16` | أنا هنا دائمًا. | I am always here. |
| `encourage.17` | خذ نفسًا عميقًا وواصل. | Take a deep breath and continue. |
| `encourage.18` | محاولتك مهمة. | Your try matters. |
| `encourage.19` | أنت تتعلّم بسرعة. | You are learning fast. |
| `encourage.20` | هيا نكمل المغامرة. | Let's continue the adventure. |
| `encourage.21` | أنت نجم. | You are a star. |
| `encourage.22` | كل صفحة إنجاز. | Every page is an achievement. |
| `encourage.23` | أحسنت القراءة! | Well read! |
| `encourage.24` | أنا مبتسم من أجلك. | I am smiling for you. |
| `encourage.25` | واصل ببطء، أنا أنتظرك. | Go slowly, I am waiting for you. |

# Thinking / Processing (`thinking.*`)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `thinking.01` | أفكّر معك... | I am thinking with you... |
| `thinking.02` | لحظة صغيرة... | Just a small moment... |
| `thinking.03` | أنا أراجع ما سمعت... | I am reviewing what I heard... |
| `thinking.04` | انتظرني قليلًا... | Wait for me a little... |
| `thinking.05` | أنا هنا، لا تقلق. | I am here, do not worry. |
| `thinking.06` | سأعود إليك حالًا. | I will be back with you soon. |
| `thinking.07` | أعدّ لك شيئًا لطيفًا... | I am preparing something nice... |
| `thinking.08` | أنا أعمل بهدوء من أجلك. | I am working quietly for you. |
| `thinking.09` | قريبًا جدًا... | Very soon... |
| `thinking.10` | أنا معك أثناء الانتظار. | I am with you while we wait. |
| `thinking.11` | لا تستعجل، أنا هنا. | No rush, I am here. |
| `thinking.12` | لحظة واحدة فقط. | Just one moment. |
| `thinking.13` | سأخبرك حالًا. | I will tell you in a moment. |
| `thinking.14` | أفكر في كلماتك الجميلة. | I am thinking about your lovely words. |
| `thinking.15` | دعني أسمعك مرة أخرى في ذهني... | Let me hear you again in my mind... |

# Celebration (`celebration.*`)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `celebration.01` | يا سلام! | Wow! |
| `celebration.02` | هذا رائع! | This is wonderful! |
| `celebration.03` | احتفلنا معًا! | We celebrated together! |
| `celebration.04` | أنت مدهش! | You are amazing! |
| `celebration.05` | تصفيق لك! | Applause for you! |
| `celebration.06` | نجمة اليوم أنت! | You are the star of the day! |
| `celebration.07` | ما أجمل هذا! | How beautiful this is! |
| `celebration.08` | فرحة كبيرة! | Big joy! |
| `celebration.09` | لنحتفل بلطف. | Let's celebrate gently. |
| `celebration.10` | أنت تستحق الفرح. | You deserve joy. |
| `celebration.11` | قصة رائعة انتهت! | A wonderful story ended! |
| `celebration.12` | أحب هذه اللحظة. | I love this moment. |
| `celebration.13` | ابتسامة كبيرة لك. | A big smile for you. |
| `celebration.14` | مغامرة جميلة! | A beautiful adventure! |
| `celebration.15` | أنت بطل القراءة. | You are the reading hero. |
| `celebration.16` | أنت أضفت نورًا للقصة. | You added light to the story. |
| `celebration.17` | هيا نقرأ مرة أخرى قريبًا. | Let's read again soon. |
| `celebration.18` | شكرًا لقراءتك معي. | Thank you for reading with me. |
| `celebration.19` | لنحفظ هذه الذكرى. | Let's keep this memory. |
| `celebration.20` | قفزة فرح صغيرة! | A little jump of joy! |

# Recording Error (`record_error.*`)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `record_error.01` | لم أسمع جيدًا، لنحاول مرة أخرى. | I did not hear well, let's try again. |
| `record_error.02` | يبدو أن التسجيل قصير جدًا. | The recording seems too short. |
| `record_error.03` | لنضغط «ابدأ القراءة» ونقرأ معًا. | Let's tap Start Reading and read together. |
| `record_error.04` | حاول أن تقترب من المايكروفون. | Try to come closer to the microphone. |
| `record_error.05` | لنبدأ تسجيلًا جديدًا. | Let's start a new recording. |
| `record_error.06` | أحتاج صوتك أوضح قليلًا. | I need your voice a little clearer. |
| `record_error.07` | لنقرأ ببطء أكثر. | Let's read a little slower. |
| `record_error.08` | حاول مرة أخرى عندما تكون جاهزًا. | Try again when you are ready. |
| `record_error.09` | التسجيل لم يُحفظ، لنكرر. | Recording was not saved, let's repeat. |
| `record_error.10` | أنا هنا، جرب من جديد. | I am here, try again. |
| `record_error.11` | يبدو أن هناك ضوضاء، جرب مرة أخرى. | There seems to be noise, try again. |
| `record_error.12` | اضغط «انتهيت» عندما تنتهي. | Tap Done when you finish. |
| `record_error.13` | نحن نستطيع إعادة المحاولة. | We can try again. |
| `record_error.14` | لنستمع ثم نسجّل. | Let's listen then record. |
| `record_error.15` | لم ينتهِ التسجيل، جرب مرة أخرى. | Recording did not finish, try again. |

# Permission (extended) (`permission.*`)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `permission.01` | نحتاج المايكروفون لنقرأ معًا. | We need the mic to read together. |
| `permission.02` | اسأل الكبار عن الإذن، أنا أنتظرك. | Ask a grown-up for permission, I will wait. |
| `permission.03` | بدون المايكروفون لا أسمع قراءتك. | Without the mic I cannot hear your reading. |
| `permission.04` | يمكن للكبار مساعدتك في الإعدادات. | A grown-up can help in settings. |
| `permission.05` | عندما تسمح، نبدأ فورًا. | When you allow, we start right away. |
| `permission.06` | المايكروفون يساعدني أن أستمع إليك فقط. | The mic helps me listen to you only. |
| `permission.07` | لا تقلق، صوتك آمن معنا. | Do not worry, your voice is safe with us. |
| `permission.08` | لنبدأ بعد السماح. | We will start after you allow. |
| `permission.09` | شكرًا، الآن نستطيع القراءة! | Thank you, now we can read! |
| `permission.10` | أنا هنا عندما تكون جاهزًا. | I am here when you are ready. |

# Connection (extended) (`connection.*`)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `connection.01` | الإنترنت ضعيف، لننتظر قليلًا. | The internet is weak, let's wait a little. |
| `connection.02` | سأحاول مرة أخرى تلقائيًا. | I will try again automatically. |
| `connection.03` | يمكنك الضغط للمحاولة مرة أخرى. | You can tap to try again. |
| `connection.04` | القصة محفوظة، لا تقلق. | The story is saved, do not worry. |
| `connection.05` | نحتاج اتصالًا لنكمل هذه الصفحة. | We need connection to finish this page. |
| `connection.06` | لنحاول عندما يعود الاتصال. | Let's try when connection returns. |
| `connection.07` | أنا معك حتى يعود الشبكة. | I am with you until the network returns. |
| `connection.08` | محاولة أخرى قريبًا... | Another try soon... |
| `connection.09` | لا يمكن الرفع الآن، جرب لاحقًا. | Cannot upload now, try later. |
| `connection.10` | اتصالك مهم، سننتظرك. | Your connection matters, we will wait. |
| `connection.11` | يبدو أن الخادم مشغول. | The server seems busy. |
| `connection.12` | تحقق من الواي فاي مع الكبار. | Check Wi-Fi with a grown-up. |
| `connection.13` | سأخبرك عندما ينجح الاتصال. | I will tell you when connection succeeds. |
| `connection.14` | نحن نحاول بهدوء. | We are trying calmly. |
| `connection.15` | لنحفظ محاولتك ونكمل لاحقًا. | We will save your try and continue later. |

# Book Finished (extended) (`book_finished.*`)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `book_finished.01` | أنهيت القصة كاملة! | You finished the whole story! |
| `book_finished.02` | ما أجمل ختامًا! | What a beautiful ending! |
| `book_finished.03` | لنختار قصة أخرى؟ | Shall we pick another story? |
| `book_finished.04` | أنت قارئ حقيقي. | You are a real reader. |
| `book_finished.05` | كل صفحة كانت مغامرة. | Every page was an adventure. |
| `book_finished.06` | أفخر بقراءتك اليوم. | I am proud of your reading today. |
| `book_finished.07` | جهدك كان رائعًا طوال القصة. | Your effort was wonderful through the story. |
| `book_finished.08` | القصة التالية في انتظارك. | The next story waits for you. |
| `book_finished.09` | شكرًا لوقتك الجميل. | Thank you for your lovely time. |
| `book_finished.10` | لنحتفل بلطف بإنهائك. | Let's celebrate gently your finish. |
| `book_finished.11` | أنت تستحق قصة جديدة. | You deserve a new story. |
| `book_finished.12` | أحببت صوتك في هذه القصة. | I loved your voice in this story. |
| `book_finished.13` | لنكمل رحلتنا غدًا. | Let's continue our journey tomorrow. |
| `book_finished.14` | وداعًا لقصة اليوم، مرحبًا بالقادمة. | Goodbye to today's story, hello to the next. |
| `book_finished.15` | كل قصة تفتح بابًا جديدًا. | Every story opens a new door. |

# Additional Welcome (`welcome.*` extended)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `welcome.04` | مرحبًا بك في مغامرة القراءة! | Welcome to the reading adventure! |
| `welcome.05` | أنا نور، صديقك في القراءة. | I am Noor, your reading friend. |
| `welcome.06` | اليوم قصة جميلة تنتظرنا. | A beautiful story waits for us today. |
| `welcome.07` | هل أنت مستعد؟ لا تستعجل. | Are you ready? No rush. |
| `welcome.08` | سأستمع إليك بابتسامة. | I will listen to you with a smile. |
| `welcome.09` | لنبدأ عندما تشاء. | We will start when you want. |
| `welcome.10` | أنا سعيد لرؤيتك. | I am happy to see you. |

# Additional Retry (`retry.*` extended)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `retry.05` | محاولة رائعة! | Great try! |
| `retry.06` | لنجرب معًا مرة أخرى. | Let's try together again. |
| `retry.07` | أنا بجانبك. | I am beside you. |
| `retry.08` | كل محاولة تقربنا. | Every try brings us closer. |
| `retry.09` | لا بأس، القصة معنا. | It's okay, the story is with us. |
| `retry.10` | سننجح معًا. | We will succeed together. |
| `retry.11` | استمع ثم حاول. | Listen then try. |
| `retry.12` | أنت تتحسّن. | You are improving. |
| `retry.13` | لنأخذ نفسًا ونكرر. | Let's take a breath and repeat. |
| `retry.14` | أنا فخور بمحاولتك. | I am proud of your try. |
| `retry.15` | جرب مرة أخرى، أنا هنا. | Try again, I am here. |
| `retry.help` | لنقرأ هذه الكلمات معًا: | Let's read these words together: |

# Additional Success (`success.*` extended)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `success.06` | قراءة موفقة! | Successful reading! |
| `success.07` | أحببت صوتك. | I loved your voice. |
| `success.08` | إجابة صحيحة! | Correct answer! |
| `success.09` | لننتقل للمغامرة التالية. | On to the next adventure. |
| `success.10` | أنت تقرأ بثقة. | You read with confidence. |
| `success.11` | ما أجمل كلماتك! | How beautiful your words! |
| `success.12` | استمر، أنت رائع. | Keep going, you are great. |
| `success.13` | صفحة تلو الأخرى! | Page after page! |
| `success.14` | قراءة تلمع مثل النور. | Reading that shines like light. |
| `success.15` | أنا معجب بك. | I am impressed by you. |

# Additional Listening (`listen.*` extended)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `listen.04` | أسمعك بوضوح. | I hear you clearly. |
| `listen.05` | واصل قراءتك. | Continue your reading. |
| `listen.06` | أنا أنتظر نهاية جملتك. | I wait for the end of your sentence. |
| `listen.07` | خذ وقتك في القراءة. | Take your time reading. |
| `listen.08` | صوتك جميل. | Your voice is beautiful. |
| `listen.09` | أنا أركز عليك. | I am focused on you. |
| `listen.10` | لا تستعجل، أنا أستمع. | Do not rush, I am listening. |

# Processing (`processing.*`)

| Key | Arabic | `en_reference` |
|-----|--------|----------------|
| `processing.01` | أجهّز ردًا لطيفًا... | Preparing a kind response... |
| `processing.02` | لحظة من فضلك... | One moment please... |
| `processing.03` | أنا أعمل من أجلك. | I am working for you. |
| `processing.04` | سأخبرك قريبًا. | I will tell you soon. |
| `processing.05` | انتظرني، أنا هنا. | Wait for me, I am here. |
| `processing.06` | نحن على وشك الانتهاء. | We are almost done. |
| `processing.07` | شكرًا على صبرك. | Thank you for your patience. |
| `processing.08` | أرسلت صوتك بأمان. | Your voice was sent safely. |
| `processing.09` | أراجع قراءتك بلطف. | I review your reading gently. |
| `processing.10` | لا تقلق، كل شيء بخير. | Do not worry, all is well. |

---

# Message Selection Rules

- Avoid repeating the same message consecutively.
- Choose messages based on context (page index, Success vs Retry, completion).
- Celebrate effort before achievement.
- Keep messages under two short sentences.
- All visible strings MUST come from this file.

---

# PM Thinking

The message library is a product asset: Noor's personality stays consistent regardless of engineering or AI provider changes.

---

# Decision Summary

## Decisions Made

- Arabic-first canonical copy.
- Positive-only messaging.
- Context-aware responses with rotation.
- Optional personalization when Noory profile name exists.

## Open Questions

None.

## Future Enhancements

- Seasonal messages (`delight.*` rotation).
- Age-band message **selection** weights per **`Child Accessibility.md`** (still no forbidden terms).
- Additional locales (post-MVP).
