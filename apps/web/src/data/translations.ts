export type Language = 'en' | 'bn';

export const translations = {
  en: {
    brand: "BandBloom",
    brandTagline: "Independent IELTS Preparation Platform",
    disclaimerShort: "Practice result only. BandBloom is an independent preparation platform, not affiliated with British Council, Cambridge, or IDP.",
    nav: {
      home: "Home",
      howItWorks: "How It Works",
      testTypes: "Test Types",
      lessons: "Lessons",
      practice: "Practice Lab",
      testDayGuide: "Test-Day Guide",
      dashboard: "Dashboard",
      studyPlan: "Study Plan",
      reading: "Reading",
      listening: "Listening",
      writing: "Writing",
      speaking: "Speaking",
      mockCentre: "Mock Centre",
      notebook: "Mistake Notebook",
      vocabulary: "Vocabulary",
      tutor: "AI Tutor",
      settings: "Settings",
      signUp: "Create account",
      signIn: "Sign In",
    },
    hero: {
      badge: "Independent IELTS Preparation",
      titlePre: "Practice for IELTS with",
      titleHighlight: "Structured Tests & Clear Feedback",
      titlePost: "",
      subtitle: "Independent preparation for computer-delivered IELTS (Academic & General Training). Practice with timed mock tests, four-skill exercises, and answer explanations.",
      signInCta: "Create Account to Start",
      secondaryCta: "Try a Sample Exercise",
      targetHeading: "Choose Your Target Band",
      targetDesc: "Set your goal to personalize your study plan.",
      trustFreePractice: "Free practice exercises",
      trustAllSkills: "All 4 IELTS skills",
      trustAiGuidance: "Writing and Speaking include unofficial AI estimates",
      trustUnofficialScores: "Independent preparation platform",
    },
    globeSection: {
      badge: "Skill Practice",
      titlePre: "Four Skills.",
      titleHighlight: "One IELTS Goal.",
      subtitle: "Build confidence in every part of your English journey.",
      readingTitle: "Reading",
      readingDesc: "Find key ideas and details.",
      listeningTitle: "Listening",
      listeningDesc: "Understand spoken English with ease.",
      writingTitle: "Writing",
      writingDesc: "Write clear, structured essays.",
      speakingTitle: "Speaking",
      speakingDesc: "Speak clearly and confidently.",
      ctaLabel: "Practice Skill",
    },
    features: {
      heading: "Practice All Four IELTS Skills",
      subheading: "Familiarize yourself with the computer-delivered format across reading, listening, writing, and speaking.",
      readingTitle: "Academic & GT Reading",
      readingDesc: "Practice question types like True/False/Not Given and Headings Matching with answer explanations.",
      listeningTitle: "Listening Practice",
      listeningDesc: "Audio sections with question prompts and post-practice transcripts.",
      writingTitle: "Writing Practice & AI Feedback",
      writingDesc: "Task 1 & Task 2 editor with word counters and unofficial AI band estimates.",
      speakingTitle: "Speaking Practice",
      speakingDesc: "Timed prompts for Parts 1, 2, and 3 with audio recording and unofficial AI scoring.",
    },
    mockEngine: {
      badge: "Example Mock Test",
      title: "Computer-Delivered Test Format",
      desc: "Practice with 40-question sections, split reading layout, and timed test conditions.",
      item1: "Timed practice sessions with question navigation",
      item2: "Band Calculator: Score rounding (e.g., 6.25 -> 6.5, 6.75 -> 7.0)",
      item3: "Practice individual test components at your pace",
    },
    tutor: {
      badge: "Answers show their sources",
      title: "Ask Questions About IELTS Format & Scoring",
      desc: "Ask questions about test format, band criteria, or writing tasks. Answers cite published test guides and rubrics.",
      samplePrompt: "How is Coherence and Cohesion evaluated in Task 2?",
      confidenceLabel: "Answers show their sources from public scoring rubrics",
    },
    cta: {
      title: "Start Your IELTS Preparation Today",
      subtitle: "Practice computer-delivered IELTS reading, listening, writing, and speaking with structured exercises.",
      button: "Create Account to Start",
    },
    footer: {
      about: "BandBloom provides structured, accessible self-study tools for IELTS learners worldwide.",
      quickLinks: "Quick Links",
      legal: "Legal & Governance",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      aiPolicy: "AI & Rubric Policy",
      disclaimer: "Non-Affiliation Disclaimer",
      accessibility: "Accessibility Statement",
      rights: "All rights reserved.",
    },
    calculator: {
      title: "Band Calculator",
      subtitle: "Enter your four section scores to estimate your overall band.",
      helperLine: "Use band scores, not raw marks.",
      presetLabel: "Quick fill (all sections)",
      chipAriaPrefix: "Set all sections to Band ",
      chipAriaSuffix: "",
      listening: "Listening band",
      reading: "Reading band",
      writing: "Writing band",
      speaking: "Speaking band",
      bandValuePrefix: "Band ",
      resultLabel: "Estimated overall band",
      averagePrefix: "Average of your four scores: ",
      averageArrow: " → rounded to Band ",
      ruleTitle: "How rounding works",
      ruleBody: "The overall band is the average of your four scores, rounded to the nearest half band. An average ending in .25 rounds up to the next half band (6.25 -> 6.5). An average ending in .75 rounds up to the next whole band (6.75 -> 7.0). Other averages round to the nearest half band (6.625 -> 6.5).",
      footnote: "Unofficial estimate. Your official band appears only on your IELTS Test Report Form.",
      setTargetPrefix: "Set Band ",
      setTargetSuffix: " as my target",
      targetBelowRange: "This result is below the available target range (6.5–9.0). Choose a target in that range to save it.",
      savedConfirmation: "Target saved!",
      closeButton: "Close calculator",
      navTrigger: "Band Calculator",
    }
  },
  bn: {
    brand: "BandBloom",
    brandTagline: "স্বাধীন IELTS প্রস্তুতি প্ল্যাটফর্ম", // needs human review
    disclaimerShort: "অনুশীলন মূল্যায়ন। BandBloom একটি স্বাধীন প্রস্তুতি সাইট; British Council, Cambridge বা IDP-এর সাথে কোনো আনুষ্ঠানিক সম্পর্ক নেই।",
    nav: {
      home: "মূলপাতা",
      howItWorks: "কীভাবে কাজ করে",
      testTypes: "পরীক্ষার ধরন",
      lessons: "লেসন",
      practice: "প্র্যাকটিস ল্যাব",
      testDayGuide: "পরীক্ষার দিনের গাইড",
      dashboard: "ড্যাশবোর্ড",
      studyPlan: "স্টাডি প্ল্যান",
      reading: "রিডিং",
      listening: "লিসেনিং",
      writing: "রাইটিং",
      speaking: "স্পিকিং",
      mockCentre: "মক টেস্ট সেন্টার",
      notebook: "ভুলের নোটবুক",
      vocabulary: "শব্দভাণ্ডার",
      tutor: "AI গৃহশিক্ষক",
      settings: "সেটিংস",
      signUp: "অ্যাকাউন্ট তৈরি করুন", // needs human review
      signIn: "সাইন ইন", // needs human review
    },
    hero: {
      badge: "স্বাধীন IELTS প্রস্তুতি", // needs human review
      titlePre: "কাঠামোগত টেস্ট ও স্পষ্ট ফিডব্যাক সহ", // needs human review
      titleHighlight: "IELTS প্রস্তুতি নিন", // needs human review
      titlePost: "",
      subtitle: "কম্পিউটার-ডেলিভার্ড IELTS (Academic ও General Training)-এর স্বাধীন প্রস্তুতি। বাস্তবধর্মী মক টেস্ট, চার স্কিলের অনুশীলন এবং ব্যাখ্যামূলক উত্তর দিয়ে অনুশীলন করুন।", // needs human review
      signInCta: "শুরু করতে অ্যাকাউন্ট তৈরি করুন", // needs human review
      secondaryCta: "নমুনা অনুশীলন দেখুন", // needs human review
      targetHeading: "আপনার টার্গেট ব্যান্ড বেছে নিন",
      targetDesc: "আপনার স্টাডি প্ল্যান ব্যক্তিগতকৃত করতে লক্ষ্য নির্ধারণ করুন।",
      trustFreePractice: "বিনামূল্যে অনুশীলন", // needs human review
      trustAllSkills: "সব ৪টি IELTS স্কিল",
      trustAiGuidance: "রাইটিং ও স্পিকিং-এ অনানুষ্ঠানিক AI অনুমান অন্তর্ভুক্ত", // needs human review
      trustUnofficialScores: "স্বাধীন প্রস্তুতি প্ল্যাটফর্ম", // needs human review
    },
    globeSection: {
      badge: "স্কিল অনুশীলন", // needs human review
      titlePre: "চারটি স্কিল।",
      titleHighlight: "একটি IELTS লক্ষ্য।",
      subtitle: "আপনার ইংরেজি শিক্ষার প্রতিটি ধাপে আত্মবিশ্বাস গড়ে তুলুন।",
      readingTitle: "রিডিং",
      readingDesc: "মূল ভাব এবং খুঁটিনাটি সহজে চিহ্নিত করুন।",
      listeningTitle: "লিসেনিং",
      listeningDesc: "সহজেই স্পোকেন ইংলিশ অনুধাবন করুন।",
      writingTitle: "রাইটিং",
      writingDesc: "সুস্পষ্ট ও কাঠামোগত প্রবন্ধ লিখুন।",
      speakingTitle: "স্পিকিং",
      speakingDesc: "স্পষ্ট ও আত্মবিশ্বাসের সাথে কথা বলুন।",
      ctaLabel: "স্কিল অনুশীলন করুন",
    },
    features: {
      heading: "সব চারটি IELTS স্কিল অনুশীলন করুন", // needs human review
      subheading: "রিডিং, লিসেনিং, রাইটিং ও স্পিকিং-এ কম্পিউটার-ডেলিভার্ড ফরম্যাটের সাথে পরিচিত হন।", // needs human review
      readingTitle: "Academic ও GT রিডিং",
      readingDesc: "ব্যাখ্যামূলক উত্তর সহ True/False/Not Given ও হেডিং ম্যাচিং-এর মতো প্রশ্ন অনুশীলন করুন।", // needs human review
      listeningTitle: "লিসেনিং অনুশীলন", // needs human review
      listeningDesc: "প্রশ্ন এবং অনুশীলন-পরবর্তী ট্রান্সক্রিপ্ট সহ অডিও সেকশন।", // needs human review
      writingTitle: "রাইটিং অনুশীলন ও AI ফিডব্যাক", // needs human review
      writingDesc: "ওয়ার্ড কাউন্টার এবং অনানুষ্ঠানিক AI ব্যান্ড স্কোর অনুমান সহ টাস্ক ১ ও ২ এডিটর।", // needs human review
      speakingTitle: "স্পিকিং অনুশীলন", // needs human review
      speakingDesc: "অডিও রেকর্ডিং এবং অনানুষ্ঠানিক AI স্কোরিং সহ পার্ট ১, ২ ও ৩-এর জন্য নির্ধারিত সময়ের অনুশীলন।", // needs human review
    },
    mockEngine: {
      badge: "নমুনা মক টেস্ট", // needs human review
      title: "কম্পিউটার-ডেলিভার্ড টেস্ট ফরম্যাট", // needs human review
      desc: "৪০টি প্রশ্নের সেকশন, স্প্লিট রিডিং লেআউট এবং নির্ধারিত সময়ের শর্তে অনুশীলন করুন।", // needs human review
      item1: "প্রশ্ন নেভিগেশন সহ নির্ধারিত সময়ের অনুশীলন সেশন", // needs human review
      item2: "ব্যান্ড ক্যালকুলেটর: স্কোর রাউন্ডিং (যেমন ৬.২৫ -> ৬.৫, ৬.৭৫ -> ৭.০)", // needs human review
      item3: "আপনার সুবিধাজনক গতিতে পৃথক টেস্ট অংশ অনুশীলন করুন", // needs human review
    },
    tutor: {
      badge: "উত্তরে উৎস উল্লেখ থাকে", // needs human review
      title: "IELTS ফরম্যাট ও স্কোরিং সম্পর্কিত প্রশ্ন জিজ্ঞাসা করুন", // needs human review
      desc: "টেস্ট ফরম্যাট, ব্যান্ড মাপকাঠি বা রাইটিং টাস্ক সম্পর্কে প্রশ্ন করুন। উত্তরে প্রকাশিত টেস্ট গাইড ও রুব্রিক উদ্ধৃত করা হয়।", // needs human review
      samplePrompt: "টাস্ক ২-এ Coherence & Cohesion কীভাবে মূল্যায়ন করা হয়?", // needs human review
      confidenceLabel: "উত্তরে উন্মুক্ত স্কোরিং রুব্রিক থেকে উৎস উদ্ধৃত থাকে", // needs human review
    },
    cta: {
      title: "আজই আপনার IELTS প্রস্তুতি শুরু করুন", // needs human review
      subtitle: "কাঠামোগত অনুশীলন সহ কম্পিউটার-ডেলিভার্ড IELTS রিডিং, লিসেনিং, রাইটিং ও স্পিকিং অনুশীলন করুন।", // needs human review
      button: "শুরু করতে অ্যাকাউন্ট তৈরি করুন", // needs human review
    },
    footer: {
      about: "BandBloom বিশ্বব্যাপী IELTS শিক্ষার্থীদের জন্য একটি উন্মুক্ত, কাঠামোগত স্ব-প্রস্তুতি প্ল্যাটফর্ম।", // needs human review
      quickLinks: "গুরুত্বপূর্ণ লিঙ্ক",
      legal: "আইনি ও পলিসি",
      privacy: "প্রাইভেসি পলিসি",
      terms: "ব্যবহারের নিয়মাবলী",
      aiPolicy: "AI ও মূল্যায়ন নীতি",
      disclaimer: "স্বাধীন প্ল্যাটফর্ম দাবিত্যাগ",
      accessibility: "অ্যাক্সেসিবিলিটি নির্দেশিকা",
      rights: "সর্বস্বত্ব সংরক্ষিত।",
    },
    calculator: {
      title: "ব্যান্ড ক্যালকুলেটর", // needs human review
      subtitle: "আপনার সার্বিক ব্যান্ড স্কোর অনুমান করতে চারটি সেকশনের স্কোর লিখুন।", // needs human review
      helperLine: "কাঁচা নম্বরের পরিবর্তে ব্যান্ড স্কোর ব্যবহার করুন।", // needs human review
      presetLabel: "সব সেকশন পূরণ করুন", // needs human review
      chipAriaPrefix: "সব সেকশন ব্যান্ড ", // needs human review
      chipAriaSuffix: "-এ সেট করুন", // needs human review
      listening: "লিসেনিং ব্যান্ড", // needs human review
      reading: "রিডিং ব্যান্ড", // needs human review
      writing: "রাইটিং ব্যান্ড", // needs human review
      speaking: "স্পিকিং ব্যান্ড", // needs human review
      bandValuePrefix: "ব্যান্ড ", // needs human review
      resultLabel: "অনুমানকৃত সার্বিক ব্যান্ড", // needs human review
      averagePrefix: "চারটি স্কোরের গড়: ", // needs human review
      averageArrow: " → রাউন্ডিং অনুযায়ী ব্যান্ড ", // needs human review
      ruleTitle: "রাউন্ডিং যেভাবে কাজ করে", // needs human review
      ruleBody: "সার্বিক ব্যান্ড হলো চারটি স্কোরের গড়, যা নিকটবর্তী অর্ধ ব্যান্ডে রাউন্ড করা হয়। .২৫-এ শেষ হওয়া গড় পরবর্তী অর্ধ ব্যান্ডে রাউন্ড আপ হয় (৬.২৫ -> ৬.৫)। .৭৫-এ শেষ হওয়া গড় পরবর্তী পূর্ণ ব্যান্ডে রাউন্ড আপ হয় (৬.৭৫ -> ৭.০)। অন্যান্য গড় নিকটবর্তী অর্ধ ব্যান্ডে রাউন্ড হয় (৬.৬২৫ -> ৬.৫)।", // needs human review
      footnote: "অনানুষ্ঠানিক অনুমান। আপনার অফিসিয়াল ব্যান্ড শুধুমাত্র আপনার IELTS টেস্ট রিপোর্ট ফর্মে (TRF) পাওয়া যাবে।", // needs human review
      setTargetPrefix: "ব্যান্ড ", // needs human review
      setTargetSuffix: " আমার টার্গেট হিসেবে সেট করুন", // needs human review
      targetBelowRange: "এই ফলাফলটি বিদ্যমান টার্গেট রেঞ্জের (৬.৫–৯.০) নিচে। টার্গেট সংরক্ষণ করতে এই রেঞ্জের মধ্যে একটি ব্যান্ড বেছে নিন।", // needs human review
      savedConfirmation: "টার্গেট সংরক্ষিত হয়েছে!", // needs human review
      closeButton: "ক্যালকুলেটর বন্ধ করুন", // needs human review
      navTrigger: "ব্যান্ড ক্যালকুলেটর", // needs human review
    }
  }
};
