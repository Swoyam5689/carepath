/**
 * CarePath 2.0 Voice Matcher & Semantic Parser
 * 
 * Provides robust speech normalization, token matching, and multilingual
 * synonym resolution across English, Hindi, Bengali, Marathi, Telugu, and Tamil.
 */

// Normalizes speech text for robust comparison across English and Indian languages
export function normalizeSpeech(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    // Strip punctuation: ? ! . , ; : " ' ( ) / - _ ¿ ¡ ~ # $ % ^ & * + = < > [ ] { }
    .replace(/[?!.,;:\"'()[\]{}<>\/\\–—\-_~`@#$%^&*+=|]/g, " ")
    // Normalize Indic Devanagari characters:
    // Chandrabindu (\u0901: ँ) -> Anusvara (\u0902: ं)
    .replace(/\u0901/g, "\u0902")
    // Remove Nukta (\u093C: ़)
    .replace(/\u093C/g, "")
    // Remove Zero-Width characters (ZWJ / ZWNJ / BOM)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

// Parses numbers 1 to 10 from English and major Indian languages
export function parseSpokenNumber(text) {
  if (!text) return null;
  const norm = normalizeSpeech(text);
  const numMatch = norm.match(/\b([1-9]|10)\b/);
  if (numMatch) return parseInt(numMatch[1], 10);

  const wordMap = {
    // English
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    // Hindi
    "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5,
    "छह": 6, "सात": 7, "आठ": 8, "नौ": 9, "दस": 10,
    // Bengali
    "এক": 1, "দুই": 2, "তিন": 3, "চার": 4, "পাঁচ": 5,
    "ছয়": 6, "সাত": 7, "আট": 8, "নয়": 9, "দশ": 10,
    // Telugu
    "ఒకటి": 1, "రెండు": 2, "మూడు": 3, "నాలుగు": 4, "ఐదు": 5,
    "ఆరు": 6, "ఏడు": 7, "ఎనిమిది": 8, "తొమ్మిది": 9, "పది": 10,
    // Tamil
    "ஒன்று": 1, "இரண்டு": 2, "மூன்று": 3, "நான்கு": 4, "ஐந்து": 5,
    "ஆறு": 6, "ஏழு": 7, "எட்டு": 8, "ஒன்பது": 9, "பத்து": 10,
    // Marathi
    "दोन": 2, "पाच": 5, "सहा": 6, "नऊ": 9, "दहा": 10
  };

  for (const [w, val] of Object.entries(wordMap)) {
    const normW = normalizeSpeech(w);
    if (norm.includes(normW)) return val;
  }
  return null;
}

// Multilingual Chief Complaints Keywords
const CHIEF_COMPLAINT_KEYWORDS = {
  chest_pain: [
    "chest", "pain", "tightness", "pressure", "angina", "heart", "heavy",
    "सीने", "सीना", "छाती", "दर्द", "भारीपन", "जकड़न", "दिल",
    "বুক", "বুকে", "ব্যথা", "অস্বস্তি",
    "छातीत", "दुखणे", "जडपणा",
    "ఛాతీ", "గుండె", "నొప్పి", "బిగుతు",
    "நெஞ்சு", "மார்பு", "வலி", "இறுக்கம்"
  ],
  fever: [
    "fever", "chills", "temperature", "hot", "shivering", "cold", "pyrexia",
    "बुखार", "ठंड", "कांपना", "ताप", "हरारत", "गरम",
    "জ্বর", "কাঁপুনি",
    "ताप", "थंडी",
    "జ్వరం", "చలి",
    "காய்ச்சல்", "நடுக்கம்"
  ],
  cough_breathlessness: [
    "cough", "coughing", "breath", "breathless", "breathlessness", "asthma", "wheezing", "dyspnea", "phlegm", "sputum",
    "खांसी", "खाँसी", "सांस", "साँस", "फूलना", "दमा", "बलगम", "कफ", "घबराहट",
    "কাশি", "শ্বাসকষ্ট", "শ্বাস",
    "खोकला", "धाप",
    "దగ్గు", "శ్వాస", "ఆయాసం",
    "இருமல்", "மூச்சு", "மூச்சுத்திணறல்"
  ],
  abdominal_pain: [
    "stomach", "abdominal", "abdomen", "belly", "tummy", "gut", "cramp", "cramps", "gastric", "acidity",
    "पेट", "दर्द", "ऐंठन", "मरोड़", "गैस", "बदहजमी",
    "পেট", "পেটে", "ব্যথা", "মোচড়",
    "पोट", "पोटात", "पोटदुखी", "मुरडा",
    "కడుపు", "నొప్పి", "తిమ్మిరి",
    "வயிறு", "வயிற்று", "வலி", "பிடிப்பு"
  ],
  headache: [
    "headache", "head", "migraine", "dizziness", "giddy", "vertigo",
    "सिरदर्द", "सिर", "सर", "चक्कर", "माइग्रेन", "माथा",
    "মাথা", "মাথাব্যথা", "মাথা ঘোরা",
    "डोके", "डोकेदुखी", "चक्कर",
    "తల", "తలనొప్పి", "తలతిరగడం",
    "தலை", "தலைவலி", "தலைச்சுற்றல்"
  ],
  joint_pain: [
    "joint", "joints", "arthritis", "body pain", "body ache", "knee", "back", "backache", "stiffness",
    "जोड़", "जोड़ों", "बदन", "दर्द", "घुटना", "कमर", "पीठ", "अकड़न",
    "জয়েন্ট", "শরীর", "শরীরে", "ব্যথা",
    "सांधे", "सांधेदुखी", "अंग", "अंगदुखी", "कंबर",
    "కీళ్ల", "కీళ్లు", "ఒంటి", "నొప్పులు",
    "மூட்டு", "உடல்", "வலி"
  ],
  skin_rash: [
    "skin", "rash", "itching", "itch", "allergy", "hives", "redness", "eczema",
    "त्वचा", "चमड़ी", "दाने", "दाद", "खुजली", "एलर्जी", "लाल",
    "ত্বক", "ত্বকে", "ফুসকুড়ি", "চুলকানি",
    "त्वचा", "त्वचेवर", "पुरळ", "खाज",
    "చర్మం", "దద్దుర్లు", "దురద",
    "தோல்", "தடிப்பு", "அரிப்பு"
  ],
  diabetes_followup: [
    "diabetes", "diabetic", "sugar", "glucose", "insulin", "hba1c", "checkup",
    "शुगर", "मधुमेह", "डायबिटीज", "डाइबिटीज", "जांच", "शर्करा",
    "সুগার", "ডায়াবেটিস", "মধুমেহ",
    "साखर", "मधुमेह", "डायबिटीस",
    "షుగర్", "మధుమేహం", "డయాబెటిస్",
    "சர்க்கரை", "நீரிழிவு", "டயபெட்டீஸ்"
  ],
  hypertension_followup: [
    "bp", "blood pressure", "hypertension", "pressure",
    "बीपी", "रक्तचाप", "ब्लड प्रेशर", "प्रेशर", "उच्च रक्तचाप",
    "রক্তচাপ", "ব্লাড প্রেসার", "প্রেসার",
    "रक्तदाब", "बीपी", "ब्लड प्रेशर",
    "రక్తపోటు", "బీపీ", "బ్లడ్ ప్రెజర్",
    "ரத்த அழுத்தம்", "பிபி"
  ],
  weakness_fatigue: [
    "weakness", "weak", "fatigue", "tired", "exhaustion", "lethargy",
    "कमजोरी", "थकान", "सुस्ती", "थकावट",
    "দুর্বলতা", "ক্লান্তি",
    "अशक्तपणा", "थकवा",
    "బలహీనత", "అలసట",
    "பலவீனம்", "சோர்வு"
  ]
};

// Matches spoken complaint against CHIEF_COMPLAINTS list
export function matchChiefComplaint(spokenText, chiefComplaintsList) {
  if (!spokenText || !chiefComplaintsList) return null;
  const norm = normalizeSpeech(spokenText);
  if (!norm) return null;

  // 1. Keyword dictionary matching (highest accuracy for natural speech)
  for (const [complaintId, keywords] of Object.entries(CHIEF_COMPLAINT_KEYWORDS)) {
    for (const kw of keywords) {
      const normKw = normalizeSpeech(kw);
      if (!normKw) continue;
      if (norm.includes(normKw) || (norm.length >= 3 && normKw.includes(norm))) {
        const found = chiefComplaintsList.find((c) => c.id === complaintId);
        if (found) return found;
      }
    }
  }

  // 2. Bidirectional matching against all localized labels
  for (const c of chiefComplaintsList) {
    const labels = [
      c.label, c.labelHi, c.labelBn, c.labelMr, c.labelTe, c.labelTa,
      c.id.replace(/_/g, " ")
    ].filter(Boolean);

    for (const l of labels) {
      const normL = normalizeSpeech(l);
      if (!normL) continue;
      if (norm === normL || norm.includes(normL) || (norm.length >= 3 && normL.includes(norm))) {
        return c;
      }
    }
  }

  // 3. Token-level overlap
  const stopWords = new Set(["या", "or", "in", "the", "a", "an", "का", "की", "के", "में", "से", "को", "है", "था"]);
  const speechWords = norm.split(" ").filter((w) => w.length >= 3 && !stopWords.has(w));
  for (const c of chiefComplaintsList) {
    const allText = normalizeSpeech(`${c.label} ${c.labelHi || ""} ${c.labelBn || ""} ${c.labelMr || ""} ${c.labelTe || ""} ${c.labelTa || ""}`);
    for (const word of speechWords) {
      if (allText.includes(word)) {
        return c;
      }
    }
  }

  return null;
}

// Matches spoken text to an option from a list of option objects
export function matchOption(spokenText, options) {
  if (!spokenText || !options || options.length === 0) return null;
  const norm = normalizeSpeech(spokenText);
  if (!norm) return null;

  // 1. Direct bidirectional matching on labels and IDs
  for (const opt of options) {
    const candidates = [
      opt.label,
      opt.labelHi,
      opt.title,
      opt.titleHi,
      opt.dosha,
      (opt.id || "").replace(/_/g, " ")
    ].filter(Boolean);

    for (const cand of candidates) {
      const normCand = normalizeSpeech(cand);
      if (!normCand) continue;
      if (norm === normCand || norm.includes(normCand) || (norm.length >= 3 && normCand.includes(norm))) {
        return opt;
      }
    }
  }

  // 2. Token overlap: check if any significant word in spoken text matches any word in an option
  const stopWords = new Set([
    "the", "a", "an", "is", "in", "of", "to", "and", "or", "for", "with", "on", "at", "by",
    "i", "have", "my", "me", "it", "was", "has", "am", "are",
    "या", "और", "का", "की", "के", "में", "से", "को", "है", "था", "थी", "मुझे", "मेरा", "मेरी", "हो", "रहा", "रही"
  ]);

  const speechTokens = norm.split(" ").filter((w) => w.length >= 2 && !stopWords.has(w));

  let bestMatch = null;
  let maxOverlap = 0;

  for (const opt of options) {
    const optText = normalizeSpeech(`
      ${opt.label || ""} 
      ${opt.labelHi || ""} 
      ${opt.title || ""} 
      ${opt.titleHi || ""} 
      ${opt.desc || ""} 
      ${opt.descHi || ""} 
      ${opt.dosha || ""} 
      ${(opt.id || "").replace(/_/g, " ")}
    `);

    let overlap = 0;
    for (const token of speechTokens) {
      if (optText.includes(token)) {
        overlap++;
      }
    }

    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestMatch = opt;
    }
  }

  return maxOverlap > 0 ? bestMatch : null;
}
