/**
 * MediKiosk Clinical History Ontology & Dialogue Manager
 * 
 * Provides structured clinical taxonomy, SOCRATES symptom exploration,
 * dynamic branching questions, red-flag emergency detection,
 * AYUSH / Ayurvedic Dashavidha Pariksha & Ahara-Vihara assessment,
 * and 8 Indian language dictionaries.
 */

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  { code: "en-IN", name: "English (India)", label: "English" },
  { code: "hi-IN", name: "हिंदी (Hindi)", label: "हिंदी" },
  { code: "ta-IN", name: "தமிழ் (Tamil)", label: "தமிழ்" },
  { code: "te-IN", name: "తెలుగు (Telugu)", label: "తెలుగు" },
  { code: "bn-IN", name: "বাংলা (Bengali)", label: "বাংলা" },
  { code: "mr-IN", name: "मराठी (Marathi)", label: "मराठी" },
  { code: "gu-IN", name: "ગુજરાતી (Gujarati)", label: "ગુજરાતી" },
  { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)", label: "ಕನ್ನಡ" }
];

// Multilingual UI Dictionary
export const TRANSLATIONS = {
  "en-IN": {
    intakeTitle: "Clinical History Intake",
    intakeSubtitle: "Answer by voice or touch to prepare your doctor-ready clinical summary before consultation.",
    stepIdentify: "Identify & Consent",
    stepConverse: "Clinical Intake",
    stepScan: "Prior Documents",
    stepSummary: "Clinical Summary",
    stepRoute: "Doctor Consultation",
    voiceListening: "Listening... Speak naturally in your language",
    voiceTapToSpeak: "Tap to Speak",
    voiceMute: "Stop Listening",
    playAudioPrompt: "Read aloud",
    pauseInterview: "Pause Interview",
    resumeInterview: "Resume Interview",
    emergencyAlertTitle: "EMERGENCY / HIGH PRIORITY TRIAGE DETECTED",
    emergencyAlertDesc: "Your symptoms indicate a potential medical emergency. You are being prioritized for immediate triage evaluation.",
    ayushModeActive: "AYUSH / Ayurvedic Mode Active",
    ayushModeDesc: "Includes Dashavidha Pariksha (10-fold examination) & Ahara-Vihara assessment.",
    nextQuestion: "Next Question",
    previousQuestion: "Previous",
    clearSession: "Clear Session Data (DPDP Privacy)",
    pushToDoctor: "Push to Doctor Consultation",
    consultationPushed: "Summary sent to Doctor's desk! Your token is queued."
  },
  "hi-IN": {
    intakeTitle: "नैदानिक इतिहास पंजीकरण (क्लिनिकल इंटेक)",
    intakeSubtitle: "डॉक्टर से मिलने से पहले बोलकर या छूकर अपनी बीमारी का विवरण दें।",
    stepIdentify: "पहचान व सहमति",
    stepConverse: "इतिहास बातचीत",
    stepScan: "पुराने दस्तावेज़",
    stepSummary: "नैदानिक सारांश",
    stepRoute: "डॉक्टर परामर्श",
    voiceListening: "सुन रहे हैं... अपनी भाषा में बोलें",
    voiceTapToSpeak: "बोलने के लिए दबाएं",
    voiceMute: "सुनना बंद करें",
    playAudioPrompt: "सुनें (ऑडियो)",
    pauseInterview: "रोकें",
    resumeInterview: "जारी रखें",
    emergencyAlertTitle: "आपातकालीन / उच्च प्राथमिकता चेतावनी",
    emergencyAlertDesc: "आपके लक्षण गंभीर हो सकते हैं। आपको तुरंत आपातकालीन ट्राइएज डेस्क पर भेजा जा रहा है।",
    ayushModeActive: "आयुष / आयुर्वेद मोड सक्रिय",
    ayushModeDesc: "दशविध परीक्षा एवं आहार-विहार मूल्यांकन सम्मिलित।",
    nextQuestion: "अगला प्रश्न",
    previousQuestion: "पिछला",
    clearSession: "सत्र डेटा हटाएं (गोपनीयता)",
    pushToDoctor: "डॉक्टर को भेजें",
    consultationPushed: "सारांश डॉक्टर के कक्ष में भेज दिया गया है!"
  },
  "ta-IN": {
    intakeTitle: "மருத்துவ வரலாறு பதிவு",
    intakeSubtitle: "மருத்துவரை சந்திக்கும் முன் குரல் அல்லது தொடுதல் மூலம் விவரிக்கவும்.",
    stepIdentify: "அடையாளம் & ஒப்புதல்",
    stepConverse: "வரலாறு பதிவு",
    stepScan: "பழைய ஆவணங்கள்",
    stepSummary: "சுருக்கம்",
    stepRoute: "மருத்துவர் ஆலோசனை",
    voiceListening: "கேட்கிறது... பேசுங்கள்",
    voiceTapToSpeak: "பேச தட்டவும்",
    voiceMute: "நிறுத்து",
    playAudioPrompt: "கேளுங்கள்",
    pauseInterview: "இடைநிறுத்து",
    resumeInterview: "தொடரவும்",
    emergencyAlertTitle: "அவசர சிகிச்சை தேவை எச்சரிக்கை",
    emergencyAlertDesc: "உங்களுக்கு அவசர மருத்துவ உதவி தேவைப்படலாம். உடனே அவசர சிகிச்சைக்கு அனுப்பப்படுகிறீர்கள்.",
    ayushModeActive: "ஆயுஷ் முறை இயக்கத்தில் உள்ளது",
    ayushModeDesc: "தசவித பரீட்சை மற்றும் உணவு முறை மதிப்பீடு.",
    nextQuestion: "அடுத்த கேள்வி",
    previousQuestion: "முந்தைய",
    clearSession: "அமர்வை அழிக்கவும்",
    pushToDoctor: "மருத்துவருக்கு அனுப்பவும்",
    consultationPushed: "விவரங்கள் மருத்துவரிடம் சமர்ப்பிக்கப்பட்டன!"
  },
  "te-IN": {
    intakeTitle: "వైద్య చరిత్ర నమోదు",
    intakeSubtitle: "డాక్టర్ సంప్రదింపులకు ముందు వాయిస్ లేదా టచ్ ద్వారా లక్షణాలను తెలపండి.",
    stepIdentify: "గుర్తింపు & సమ్మతి",
    stepConverse: "లక్షణాల చరిత్ర",
    stepScan: "పాత రికార్డులు",
    stepSummary: "వైద్య సారాంశం",
    stepRoute: "డాక్టర్ సంప్రదింపు",
    voiceListening: "వింటోంది... మాట్లాడండి",
    voiceTapToSpeak: "మాట్లాడటానికి నొక్కండి",
    voiceMute: "ఆపు",
    playAudioPrompt: "వినండి",
    pauseInterview: "పాజ్",
    resumeInterview: "కొనసాగించు",
    emergencyAlertTitle: "అత్యవసర చికిత్స హెచ్చరిక",
    emergencyAlertDesc: "మీ లక్షణాలకు తక్షణ వైద్యం అవసరం కావచ్చు. ఎమర్జెన్సీ విభాగానికి సూచించబడుతున్నారు.",
    ayushModeActive: "ఆయుష్ మోడ్ ఆన్ చేయబడింది",
    ayushModeDesc: "దశవిధ పరీక్ష మరియు ఆహార-విహార సమాచారం.",
    nextQuestion: "తరువాతి ప్రశ్న",
    previousQuestion: "మునుపటి",
    clearSession: "డేటా క్లియర్ చేయండి",
    pushToDoctor: "డాక్టర్‌కు పంపండి",
    consultationPushed: "సారాంశం డాక్టర్ వద్దకు పంపబడింది!"
  },
  "bn-IN": {
    intakeTitle: "ক্লিনিক্যাল হিস্ট্রি ইনটেক",
    intakeSubtitle: "ডাক্তার দেখার আগে ভয়েস বা টাচ করে আপনার সমস্যার কথা জানান।",
    stepIdentify: "পরিচয় ও সম্মতি",
    stepConverse: "লক্ষণ বিবরণ",
    stepScan: "পূর্ববর্তী নথি",
    stepSummary: "চিকিৎসা সারাংশ",
    stepRoute: "ডাক্তার পরামর্শ",
    voiceListening: "শুনছি... আপনার ভাষায় বলুন",
    voiceTapToSpeak: "বলতে স্পর্শ করুন",
    voiceMute: "থামুন",
    playAudioPrompt: "শুনুন",
    pauseInterview: "বিরতি",
    resumeInterview: "চালিয়ে যান",
    emergencyAlertTitle: "জরুরি সতর্কতা / উচ্চ অগ্রাধিকার",
    emergencyAlertDesc: "আপনার লক্ষণগুলি জরুরি চিকিৎসার ইঙ্গিত দিচ্ছে। অবিলম্বে জরুরি বিভাগে পাঠানো হচ্ছে।",
    ayushModeActive: "আয়ুশ মোড সক্রিয়",
    ayushModeDesc: "দশবিধ পরীক্ষা এবং আহার-বিহার মূল্যায়ন অন্তর্ভুক্ত।",
    nextQuestion: "পরবর্তী প্রশ্ন",
    previousQuestion: "পূর্ববর্তী",
    clearSession: "সেশন তথ্য মুছুন",
    pushToDoctor: "ডাক্তারের কাছে পাঠান",
    consultationPushed: "সারাংশ ডাক্তারের কাছে পাঠানো হয়েছে!"
  },
  "mr-IN": {
    intakeTitle: "वैद्यकीय इतिहास नोंदणी",
    intakeSubtitle: "डॉक्टरांना भेटण्यापूर्वी आवाजाने किंवा स्पर्शाने आपली लक्षणे सांगा.",
    stepIdentify: "ओळख व संमती",
    stepConverse: "लक्षणे विचारणा",
    stepScan: "जुनी कागदपत्रे",
    stepSummary: "वैद्यकीय सारांश",
    stepRoute: "डॉक्टर सल्ला",
    voiceListening: "ऐकत आहे... बोला",
    voiceTapToSpeak: "बोलण्यासाठी दाबा",
    voiceMute: "थांबवा",
    playAudioPrompt: "ऐका",
    pauseInterview: "थांबवा",
    resumeInterview: "सुरू ठेवा",
    emergencyAlertTitle: "तातडीची वैद्यकीय मदत इशारा",
    emergencyAlertDesc: "आपल्या लक्षणांना तातडीच्या उपचारांची गरज आहे. आपत्कालीन कक्षाकडे पाठवले जात आहे.",
    ayushModeActive: "आयुष / आयुर्वेद मोड सक्रिय",
    ayushModeDesc: "दशविध परीक्षा आणि आहार-विहार तपासणी समाविष्ट.",
    nextQuestion: "पुढील प्रश्न",
    previousQuestion: "मागील",
    clearSession: "माहिती नष्ट करा",
    pushToDoctor: "डॉक्टरांकडे पाठवा",
    consultationPushed: "माहिती डॉक्टरांकडे पाठवली गेली आहे!"
  },
  "gu-IN": {
    intakeTitle: "તબીબી ઇતિહાસ નોંધણી",
    intakeSubtitle: "ડૉક્ટરને મળતા પહેલા અવાજ અથવા ટચ દ્વારા તમારા લક્ષણો જણાવો.",
    stepIdentify: "ઓળખ અને સંમતિ",
    stepConverse: "લક્ષણો વિગત",
    stepScan: "જૂના કાગળો",
    stepSummary: "તબીબી સારાંશ",
    stepRoute: "ડૉક્ટર પરામર્શ",
    voiceListening: "સાંભળી રહ્યા છીએ... બોલો",
    voiceTapToSpeak: "બોલવા માટે દબાવો",
    voiceMute: "બંધ કરો",
    playAudioPrompt: "સાંભળો",
    pauseInterview: "અટકાવો",
    resumeInterview: "ચાલુ રાખો",
    emergencyAlertTitle: "કટોકટી / ઉચ્ચ પ્રાથમિકતા ચેતવણી",
    emergencyAlertDesc: "તમારા લક્ષણો ગંભીર હોઈ શકે છે. તમને તાત્કાલિક ઈમરજન્સી ડેસ્ક પર મોકલવામાં આવી રહ્યા છે.",
    ayushModeActive: "આયુષ / આયુર્વેદ મોડ સક્રિય",
    ayushModeDesc: "દશવિધ પરીક્ષા અને આહાર-વિહાર મૂલ્યાંકન સામેલ.",
    nextQuestion: "આગળનો પ્રશ્ન",
    previousQuestion: "પાછળ",
    clearSession: "ડેટા સાફ કરો",
    pushToDoctor: "ડૉક્ટરને મોકલો",
    consultationPushed: "સારાંશ ડૉક્ટરના રૂમમાં મોકલાયો છે!"
  },
  "kn-IN": {
    intakeTitle: "ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ ನೋಂದಣಿ",
    intakeSubtitle: "ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗುವ ಮೊದಲು ಧ್ವನಿ ಅಥವಾ ಸ್ಪರ್ಶದ ಮೂಲಕ ವಿವರ ನೀಡಿ.",
    stepIdentify: "ಗುರುತು ಮತ್ತು ಸಮ್ಮತಿ",
    stepConverse: "ಇತಿಹಾಸ ವಿಚಾರಣೆ",
    stepScan: "ಹಳೆಯ ದಾಖಲೆಗಳು",
    stepSummary: "ವೈದ್ಯಕೀಯ ಸಾರಾಂಶ",
    stepRoute: "ವೈದ್ಯರ ಸಮಾಲೋಚನೆ",
    voiceListening: "ಕೇಳುತ್ತಿದೆ... ಮಾತನಾಡಿ",
    voiceTapToSpeak: "ಮಾತನಾಡಲು ಒತ್ತಿ",
    voiceMute: "ನಿಲ್ಲಿಸಿ",
    playAudioPrompt: "ಕೇಳಿ",
    pauseInterview: "ವಿರಾಮ",
    resumeInterview: "ಮುಂದುವರಿಸಿ",
    emergencyAlertTitle: "ತುರ್ತು ಚಿಕಿತ್ಸಾ ಎಚ್ಚರಿಕೆ",
    emergencyAlertDesc: "ನಿಮ್ಮ ಲಕ್ಷಣಗಳಿಗೆ ತುರ್ತು ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿದೆ. ತಕ್ಷಣ ತುರ್ತು ವಿಭಾಗಕ್ಕೆ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ.",
    ayushModeActive: "ಆಯುಷ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    ayushModeDesc: "ದಶವಿಧ ಪರೀಕ್ಷೆ ಮತ್ತು ಆಹಾರ-ವಿಹಾರ ಮೌಲ್ಯಮಾಪನ ಒಳಗೊಂಡಿದೆ.",
    nextQuestion: "ಮುಂದಿನ ಪ್ರಶ್ನೆ",
    previousQuestion: "ಹಿಂದಿನ",
    clearSession: "ಮಾಹಿತಿ ತೆರವುಗೊಳಿಸಿ",
    pushToDoctor: "ವೈದ್ಯರಿಗೆ ಕಳುಹಿಸಿ",
    consultationPushed: "ಸಾರಾಂಶವನ್ನು ವೈದ್ಯರಿಗೆ ರವಾನಿಸಲಾಗಿದೆ!"
  }
};

// Chief Complaints Directory
export const CHIEF_COMPLAINTS = [
  {
    id: "chest_pain",
    label: "Chest Pain / Tightness",
    labelHi: "सीने में दर्द या भारीपन",
    labelBn: "বুকে ব্যথা বা অস্বস্তি",
    labelMr: "छातीत दुखणे किंवा जडपणा",
    labelTe: "ఛాతీలో నొప్పి లేదా బిగుతు",
    labelTa: "நெஞ்சு வலி அல்லது இறுக்கம்",
    icon: "HeartPulse",
    category: "Cardiovascular",
    snomed: "29857009",
    icd10: "R07.9",
    urgencyDefault: "moderate",
    triggersSocrates: true
  },
  {
    id: "fever",
    label: "Fever / Chills",
    labelHi: "बुखार या ठंड लगना",
    labelBn: "জ্বর বা কাঁপুনি",
    labelMr: "ताप किंवा थंडी वाजणे",
    labelTe: "జ్వరం లేదా చలి",
    labelTa: "காய்ச்சல் அல்லது நடுக்கம்",
    icon: "Thermometer",
    category: "General",
    snomed: "386661006",
    icd10: "R50.9",
    urgencyDefault: "routine",
    triggersSocrates: true
  },
  {
    id: "cough_breathlessness",
    label: "Cough or Breathlessness",
    labelHi: "खांसी या सांस फूलना",
    labelBn: "কাশি বা শ্বাসকষ্ট",
    labelMr: "खोकला किंवा धाप लागणे",
    labelTe: "దగ్గు లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది",
    labelTa: "இருமல் அல்லது மூச்சுத்திணறல்",
    icon: "Wind",
    category: "Respiratory",
    snomed: "49727002",
    icd10: "R05",
    urgencyDefault: "moderate",
    triggersSocrates: true
  },
  {
    id: "abdominal_pain",
    label: "Stomach / Abdominal Pain",
    labelHi: "पेट में दर्द या ऐंठन",
    labelBn: "পেটে ব্যথা বা মোচড়",
    labelMr: "पोटदुखी किंवा पोटात मुरडा",
    labelTe: "కడుపు నొప్పి లేదా తిమ్మిరి",
    labelTa: "வயிற்று வலி அல்லது பிடிப்பு",
    icon: "Activity",
    category: "Gastrointestinal",
    snomed: "21522000",
    icd10: "R10.9",
    urgencyDefault: "moderate",
    triggersSocrates: true
  },
  {
    id: "headache",
    label: "Severe Headache",
    labelHi: "सिरदर्द या चक्कर",
    labelBn: "তীব্র মাথাব্যথা বা মাথা ঘোরা",
    labelMr: "तीव्र डोकेदुखी किंवा चक्कर",
    labelTe: "తీవ్రమైన తలనొప్పి లేదా తలతిరగడం",
    labelTa: "கடுமையான தலைவலி அல்லது தலைச்சுற்றல்",
    icon: "Brain",
    category: "Neurological",
    snomed: "25064002",
    icd10: "R51",
    urgencyDefault: "routine",
    triggersSocrates: true
  },
  {
    id: "joint_pain",
    label: "Joint or Body Pain",
    labelHi: "जोड़ों या बदन का दर्द",
    labelBn: "জয়েন্ট বা শরীরে ব্যথা",
    labelMr: "सांधेदुखी किंवा अंगदुखी",
    labelTe: "కీళ్ల నొప్పులు లేదా ఒంటి నొప్పులు",
    labelTa: "மூட்டு அல்லது உடல் வலி",
    icon: "ShieldAlert",
    category: "Musculoskeletal",
    snomed: "57676002",
    icd10: "M25.50",
    urgencyDefault: "routine",
    triggersSocrates: true
  },
  {
    id: "skin_rash",
    label: "Skin Rash or Itching",
    labelHi: "त्वचा पर दाने या खुजली",
    labelBn: "ত্বকে ফুসকুড়ি বা চুলকানি",
    labelMr: "त्वचेवर पुरळ किंवा खाज",
    labelTe: "చర్మంపై దద్దుర్లు లేదా దురద",
    labelTa: "தோல் தடிப்பு அல்லது அரிப்பு",
    icon: "AlertCircle",
    category: "Dermatological",
    snomed: "271807003",
    icd10: "R21",
    urgencyDefault: "routine",
    triggersSocrates: true
  },
  {
    id: "diabetes_followup",
    label: "Sugar / Diabetes Checkup",
    labelHi: "मधुमेह (डायबिटीज) जांच",
    labelBn: "ডায়াবেটিস বা সুগার পরীক্ষা",
    labelMr: "मधुमेह तपासणी",
    labelTe: "షుగర్ / డయాబెటిస్ తనిఖీ",
    labelTa: "சர்க்கரை நோய் பரிசோதனை",
    icon: "Pill",
    category: "Endocrine",
    snomed: "73211009",
    icd10: "E11.9",
    urgencyDefault: "routine",
    triggersSocrates: true
  },
  {
    id: "hypertension_followup",
    label: "Blood Pressure Checkup",
    labelHi: "रक्तचाप (बीपी) जांच",
    labelBn: "রক্তচাপ (বিপি) পরীক্ষা",
    labelMr: "रक्तदाब (बीपी) तपासणी",
    labelTe: "రక్తపోటు (బీపీ) తనిఖీ",
    labelTa: "இரத்த அழுத்த (பிபி) பரிசோதனை",
    icon: "Activity",
    category: "Cardiovascular",
    snomed: "38341003",
    icd10: "I10",
    urgencyDefault: "routine",
    triggersSocrates: true
  },
  {
    id: "weakness_fatigue",
    label: "General Weakness / Fatigue",
    labelHi: "कमजोरी या अत्यधिक थकान",
    labelBn: "সাধারণ দুর্বলতা বা ক্লান্তি",
    labelMr: "अशक्तपणा किंवा तीव्र थकवा",
    labelTe: "సాధారణ బలహీనత లేదా అలసట",
    labelTa: "பொதுவான பலவீனம் அல்லது சோர்வு",
    icon: "Clock3",
    category: "General",
    snomed: "84229001",
    icd10: "R53.83",
    urgencyDefault: "routine",
    triggersSocrates: true
  }
];

// SOCRATES Framework Questions Configuration by Chief Complaint
export const COMPLAINT_SOCRATES_MAP = {
  // 1. Chest Pain / Tightness
  chest_pain: [
    {
      key: "site",
      label: "Site (Where in the chest is the pain?)",
      labelHi: "स्थान (सीने में दर्द किस जगह हो रहा है?)",
      voicePromptEn: "Where exactly in your chest do you feel this discomfort?",
      voicePromptHi: "सीने के किस हिस्से में दर्द हो रहा है?",
      type: "chips",
      options: [
        { id: "left_precordial", label: "Left Precordial (Over Heart)", labelHi: "बाईं तरफ (दिल के ऊपर)", alertScore: 2 },
        { id: "central_retrosternal", label: "Center / Behind Breastbone", labelHi: "सीने के ठीक बीच में", alertScore: 2 },
        { id: "lower_epigastric", label: "Lower Chest / Upper Stomach", labelHi: "सीने के निचले हिस्से या पेट के ऊपर", alertScore: 1 },
        { id: "diffuse_chest", label: "Diffuse / Entire Chest", labelHi: "पूरे सीने में फैला हुआ", alertScore: 1 }
      ]
    },
    {
      key: "onset",
      label: "Onset (How did the chest pain begin?)",
      labelHi: "शुरुआत (सीने का दर्द कैसे शुरू हुआ?)",
      voicePromptEn: "Did the chest pain start suddenly or build up gradually?",
      voicePromptHi: "क्या यह दर्द अचानक शुरू हुआ या धीरे-धीरे बढ़ा?",
      type: "chips",
      options: [
        { id: "sudden_seconds", label: "Sudden (Within minutes / seconds)", labelHi: "अचानक (कुछ ही मिनटों या सेकंड में)", alertScore: 3 },
        { id: "during_exertion", label: "Started while walking or climbing stairs", labelHi: "चलने या सीढ़ियां चढ़ते समय शुरू हुआ", alertScore: 2 },
        { id: "gradual_hours", label: "Gradual build-up over hours", labelHi: "कुछ घंटों में धीरे-धीरे बढ़ा", alertScore: 1 },
        { id: "chronic_days", label: "Intermittent over several days", labelHi: "कई दिनों से रुक-रुक कर हो रहा है", alertScore: 0 }
      ]
    },
    {
      key: "character",
      label: "Character (What does the chest pain feel like?)",
      labelHi: "प्रकृति (दर्द का अहसास कैसा है?)",
      voicePromptEn: "Is it crushing pressure, burning, sharp stabbing, or dull ache?",
      voicePromptHi: "दर्द भारी दबाव, जलन, चुभन या धीमा दर्द जैसा है?",
      type: "chips",
      options: [
        { id: "heavy_pressure", label: "Crushing / Heavy Pressure / Tight Band", labelHi: "भारी दबाव, जकड़न या भारीपन", alertScore: 3 },
        { id: "sharp_stabbing", label: "Sharp / Stabbing (Worse on deep breath)", labelHi: "तेज चुभन (गहरी सांस लेने पर तेज)", alertScore: 1 },
        { id: "burning_acidity", label: "Burning / Acid-like Retro-sternal", labelHi: "सीने में जलन या एसिडिटी जैसा", alertScore: 0 },
        { id: "dull_ache", label: "Dull Constant Ache", labelHi: "धीमा और लगातार बना रहने वाला दर्द", alertScore: 0 }
      ]
    },
    {
      key: "radiation",
      label: "Radiation (Does the chest pain travel anywhere?)",
      labelHi: "फैलाव (क्या दर्द कहीं और फैलता है?)",
      voicePromptEn: "Does the pain radiate to your left arm, jaw, shoulder, or back?",
      voicePromptHi: "क्या दर्द बाएं हाथ, गर्दन, जबड़े या पीठ की तरफ जाता है?",
      type: "chips",
      options: [
        { id: "left_arm_jaw", label: "Radiates to Left Arm, Neck, or Jaw", labelHi: "बाएं हाथ, गर्दन या जबड़े की तरफ", alertScore: 3 },
        { id: "back_scapula", label: "Radiates to Back between shoulder blades", labelHi: "पीठ में दोनों कंधों के बीच", alertScore: 2 },
        { id: "epigastrium", label: "Spreading down to upper abdomen", labelHi: "ऊपरी पेट की तरफ फैलता हुआ", alertScore: 1 },
        { id: "none", label: "No radiation (strictly localized)", labelHi: "कहीं नहीं फैलता (एक ही जगह रहता है)", alertScore: 0 }
      ]
    },
    {
      key: "associations",
      label: "Associated Symptoms (What accompanying problems do you notice?)",
      labelHi: "संबंधित लक्षण (सीने में दर्द के साथ और क्या महसूस हो रहा है?)",
      voicePromptEn: "Are you also experiencing sweating, breathlessness, nausea, or dizziness?",
      voicePromptHi: "क्या पसीना, सांस फूलना, उल्टी जैसा लगना या चक्कर आ रहे हैं?",
      type: "multi-chips",
      options: [
        { id: "profuse_sweating", label: "Cold Sweats / Diaphoresis", labelHi: "ठंडा पसीना आना", alertScore: 3 },
        { id: "breathlessness", label: "Severe Shortness of Breath", labelHi: "सांस लेने में भारी तकलीफ", alertScore: 3 },
        { id: "palpitations", label: "Racing or Irregular Heartbeat", labelHi: "दिल की धड़कन बहुत तेज होना", alertScore: 2 },
        { id: "dizziness_blackout", label: "Dizziness / Feeling of fainting", labelHi: "चक्कर आना या बेहोशी जैसा लगना", alertScore: 2 },
        { id: "nausea_vomiting", label: "Nausea or Vomiting", labelHi: "जी मिचलाना या उल्टी", alertScore: 1 },
        { id: "none", label: "No other major symptoms", labelHi: "कोई अन्य लक्षण नहीं", alertScore: 0 }
      ]
    },
    {
      key: "time_course",
      label: "Time Course (How is the chest pain behaving over time?)",
      labelHi: "समय चक्र (दर्द समय के साथ कैसे बदल रहा है?)",
      voicePromptEn: "Is the chest pain worsening rapidly, steady, or coming in waves?",
      voicePromptHi: "क्या दर्द तेजी से बढ़ता जा रहा है, लगातार है या रुक-रुक कर आ रहा है?",
      type: "chips",
      options: [
        { id: "progressively_worse", label: "Rapidly worsening right now", labelHi: "तेजी से बिगड़ता जा रहा है", alertScore: 2 },
        { id: "continuous", label: "Continuous steady ache (>20 mins)", labelHi: "लगातार 20 मिनट से अधिक बना हुआ है", alertScore: 2 },
        { id: "intermittent_waves", label: "Comes and goes in waves", labelHi: "रुक-रुक कर लहरों की तरह आता है", alertScore: 0 },
        { id: "gradually_improving", label: "Gradually easing off", labelHi: "धीरे-धीरे कम हो रहा है", alertScore: 0 }
      ]
    },
    {
      key: "exacerbating_relieving",
      label: "Exacerbating & Relieving Factors (What makes it better or worse?)",
      labelHi: "बढ़ाने या घटाने वाले कारक (किस बात से आराम या बढ़ोतरी होती है?)",
      voicePromptEn: "Does walking make it worse and resting make it better?",
      voicePromptHi: "क्या चलने से बढ़ता है और आराम करने से घटता है?",
      type: "chips",
      options: [
        { id: "worse_exertion_relieved_rest", label: "Worse with walking/exertion; Better with rest", labelHi: "चलने-फिरने से बढ़ता है; आराम से घटता है", alertScore: 3 },
        { id: "relieved_nitrate", label: "Relieved by sublingual Sorbitrate/Nitrate", labelHi: "जीभ के नीचे गोली रखने से आराम मिलता है", alertScore: 2 },
        { id: "worse_deep_breath", label: "Worse on taking a deep breath / coughing", labelHi: "गहरी सांस लेने या खांसने पर बढ़ता है", alertScore: 1 },
        { id: "worse_food", label: "Worse after heavy meals or lying flat", labelHi: "खाना खाने या लेटने पर बढ़ता है", alertScore: 0 },
        { id: "no_change", label: "No specific trigger noticed", labelHi: "कोई खास असर नहीं देखा", alertScore: 0 }
      ]
    },
    {
      key: "severity",
      label: "Severity (Rate the chest pain from 1 to 10)",
      labelHi: "तीव्रता (1 से 10 के पैमाने पर सीने के दर्द का स्तर बताएं)",
      voicePromptEn: "On a scale of 1 to 10, how severe is your chest discomfort?",
      voicePromptHi: "1 से 10 के पैमाने पर यह दर्द कितना तीव्र है?",
      type: "scale",
      min: 1,
      max: 10,
      options: [
        { value: 2, label: "Mild (1-3)", labelHi: "हल्का (1-3)", alertScore: 0 },
        { value: 5, label: "Moderate (4-6)", labelHi: "मध्यम (4-6)", alertScore: 1 },
        { value: 8, label: "Severe (7-8)", labelHi: "तीव्र (7-8)", alertScore: 2 },
        { value: 10, label: "Excruciating / Unbearable (9-10)", labelHi: "असहनीय / अत्यधिक तीव्र (9-10)", alertScore: 4 }
      ]
    }
  ],

  // 2. Fever / Chills
  fever: [
    {
      key: "site",
      label: "Site (Where is the fever sensation most prominent?)",
      labelHi: "स्थान (बुखार और गर्माहट का अहसास मुख्य रूप से कहां है?)",
      voicePromptEn: "Where do you feel the fever heat or discomfort most?",
      voicePromptHi: "बुखार की गर्माहट और बेचैनी सबसे ज्यादा कहां लग रही है?",
      type: "chips",
      options: [
        { id: "generalized_body", label: "Whole Body Burning / Hot skin", labelHi: "पूरे शरीर में तेज गर्माहट", alertScore: 0 },
        { id: "forehead_temples", label: "Forehead & Behind Eyes", labelHi: "माथा और आंखों के पीछे भारीपन", alertScore: 0 },
        { id: "chills_extremities", label: "Cold Hands & Feet with Severe Chills", labelHi: "हाथ-पैर ठंडे और तेज कंपकंपी", alertScore: 1 },
        { id: "throat_chest_fever", label: "Throat, Chest & Body Aches", labelHi: "गले और सीने में दर्द के साथ बुखार", alertScore: 0 }
      ]
    },
    {
      key: "onset",
      label: "Onset (When and how did the fever begin?)",
      labelHi: "शुरुआत (बुखार कब और कैसे शुरू हुआ?)",
      voicePromptEn: "Did the fever shoot up suddenly today or develop gradually?",
      voicePromptHi: "क्या बुखार अचानक तेज आया या 2-3 दिन में धीरे-धीरे बढ़ा?",
      type: "chips",
      options: [
        { id: "sudden_high_spike", label: "Sudden high spike (>102°F) today", labelHi: "आज अचानक तेज बुखार (>102°F) चढ़ा", alertScore: 2 },
        { id: "gradual_2_3_days", label: "Gradual rise over 2 to 3 days", labelHi: "2 से 3 दिनों में धीरे-धीरे बढ़ा", alertScore: 0 },
        { id: "low_grade_week", label: "Low grade fever persistent for >1 week", labelHi: "1 सप्ताह से अधिक समय से हल्का बुखार", alertScore: 1 },
        { id: "recurrent_spikes", label: "Periodic spikes every 24-48 hours", labelHi: "हर 1-2 दिन में बार-बार चढ़ता-उतरता है", alertScore: 1 }
      ]
    },
    {
      key: "character",
      label: "Character (What type of fever is it?)",
      labelHi: "प्रकृति (बुखार का मिजाज कैसा है?)",
      voicePromptEn: "Is it continuous high fever, shivering chills, or mild evening rise?",
      voicePromptHi: "क्या लगातार तेज बुखार है, कंपकंपी वाला है, या शाम को बढ़ता है?",
      type: "chips",
      options: [
        { id: "continuous_high", label: "Continuous High Fever (>102°F)", labelHi: "लगातार तेज बना रहने वाला बुखार", alertScore: 2 },
        { id: "shivering_rigors", label: "Fluctuating with Shivering & Rigors", labelHi: "तेज कंपकंपी और थरथराहट के साथ", alertScore: 2 },
        { id: "evening_rise", label: "Evening rise with night sweats", labelHi: "शाम को चढ़ने वाला व रात में पसीना", alertScore: 1 },
        { id: "mild_low_grade", label: "Mild dull feverish feeling (99-100°F)", labelHi: "हल्की हरारत (99-100°F)", alertScore: 0 }
      ]
    },
    {
      key: "radiation",
      label: "Radiation / Distribution (Where are the associated body aches?)",
      labelHi: "फैलाव (दर्द और जकड़न शरीर में कहां तक फैल रही है?)",
      voicePromptEn: "Do you have severe backache, stiff neck, or joint pains?",
      voicePromptHi: "क्या कमर, गर्दन में अकड़न या जोड़ों में दर्द फैल रहा है?",
      type: "chips",
      options: [
        { id: "stiff_neck", label: "Stiff Neck / Inability to bend chin to chest", labelHi: "गर्दन में तेज अकड़न / सिर झुकाने में असमर्थ", alertScore: 3 },
        { id: "severe_low_back", label: "Severe Lower Back & Retro-orbital ache", labelHi: "कमर और आंखों के पीछे तेज दर्द", alertScore: 1 },
        { id: "generalized_joints", label: "Widespread joint and muscle soreness", labelHi: "सभी जोड़ों और मांसपेशियों में दर्द", alertScore: 0 },
        { id: "none", label: "No prominent radiating aches", labelHi: "कहीं विशेष फैलाव नहीं है", alertScore: 0 }
      ]
    },
    {
      key: "associations",
      label: "Associated Symptoms (What other problems accompany this fever?)",
      labelHi: "संबंधित लक्षण (बुखार के साथ और क्या समस्याएं हो रही हैं?)",
      voicePromptEn: "Do you have red spots, vomiting, cough, or burning urination?",
      voicePromptHi: "क्या त्वचा पर लाल दाने, उल्टी, खांसी या पेशाब में जलन है?",
      type: "multi-chips",
      options: [
        { id: "red_spots_petechiae", label: "Red Spots on Skin / Bleeding from gums", labelHi: "त्वचा पर लाल चकत्ते / मसूड़ों से खून", alertScore: 3 },
        { id: "altered_sensorium", label: "Confusion / Drowsiness / Delirium", labelHi: "बेहोशी, भ्रम या अत्यधिक सुस्ती", alertScore: 3 },
        { id: "burning_micturition", label: "Burning or Pain while urinating", labelHi: "पेशाब में तेज जलन या दर्द", alertScore: 1 },
        { id: "persistent_vomiting", label: "Inability to keep liquids down / Vomiting", labelHi: "लगातार उल्टी / पानी भी न पचना", alertScore: 2 },
        { id: "cough_cold", label: "Runny nose, Sore throat, or Cough", labelHi: "जुकाम, गले में खराश या खांसी", alertScore: 0 },
        { id: "none", label: "No other critical symptom", labelHi: "कोई अन्य गंभीर लक्षण नहीं", alertScore: 0 }
      ]
    },
    {
      key: "time_course",
      label: "Time Course (How long has this fever lasted?)",
      labelHi: "समय चक्र (बुखार कितने समय से चल रहा है?)",
      voicePromptEn: "How many days has the fever been present?",
      voicePromptHi: "बुखार कितने दिनों से आ रहा है?",
      type: "chips",
      options: [
        { id: "day_1", label: "Started today (< 24 hours)", labelHi: "आज ही शुरू हुआ (< 24 घंटे)", alertScore: 0 },
        { id: "days_2_4", label: "2 to 4 days", labelHi: "2 से 4 दिन", alertScore: 0 },
        { id: "days_5_7", label: "5 to 7 days (Persistent)", labelHi: "5 से 7 दिन (लगातार)", alertScore: 1 },
        { id: "more_than_week", label: "More than a week", labelHi: "1 सप्ताह से अधिक समय से", alertScore: 2 }
      ]
    },
    {
      key: "exacerbating_relieving",
      label: "Exacerbating & Relieving Factors (What affects the temperature?)",
      labelHi: "बढ़ाने या घटाने वाले कारक (किस चीज से बुखार घटता या बढ़ता है?)",
      voicePromptEn: "Does paracetamol bring the fever down, or does it stay refractory high?",
      voicePromptHi: "क्या पैरासिटामोल लेने से बुखार उतरता है या बना रहता है?",
      type: "chips",
      options: [
        { id: "refractory_paracetamol", label: "Does NOT come down even with Paracetamol", labelHi: "पैरासिटामोल लेने पर भी नहीं उतरता", alertScore: 2 },
        { id: "temporary_relief", label: "Drops with medicine, returns in 4-6 hours", labelHi: "दवा से उतरता है, 4-6 घंटे बाद फिर चढ़ता है", alertScore: 0 },
        { id: "relieved_sponging", label: "Relieved by cold water sponging & fluids", labelHi: "ठंडी पट्टी और तरल पदार्थों से आराम", alertScore: 0 },
        { id: "worse_dehydration", label: "Worse when drinking less water", labelHi: "पानी कम पीने पर बढ़ता है", alertScore: 0 }
      ]
    },
    {
      key: "severity",
      label: "Severity (Recorded or estimated peak temperature)",
      labelHi: "तीव्रता (थर्मामीटर से नापा गया या अनुमानित अधिकतम तापमान)",
      voicePromptEn: "What is your highest recorded temperature?",
      voicePromptHi: "अधिकतम तापमान कितना दर्ज हुआ है?",
      type: "scale",
      min: 1,
      max: 10,
      options: [
        { value: 2, label: "Mild fever (99.0 - 100.4°F)", labelHi: "हल्का बुखार (99.0 - 100.4°F)", alertScore: 0 },
        { value: 5, label: "Moderate fever (100.5 - 102.0°F)", labelHi: "मध्यम बुखार (100.5 - 102.0°F)", alertScore: 1 },
        { value: 8, label: "High fever (102.1 - 104.0°F)", labelHi: "तेज बुखार (102.1 - 104.0°F)", alertScore: 2 },
        { value: 10, label: "Hyperpyrexia (>104.0°F) / Delirious", labelHi: "अत्यधिक तेज बुखार (>104.0°F)", alertScore: 4 }
      ]
    }
  ],

  // 3. Cough or Breathlessness
  cough_breathlessness: [
    {
      key: "site",
      label: "Site (Where in the respiratory tract is the trouble?)",
      labelHi: "स्थान (खांसी या सांस की तकलीफ मुख्य रूप से कहां महसूस हो रही है?)",
      voicePromptEn: "Do you feel it in your throat, upper trachea, or deep in both lungs?",
      voicePromptHi: "तकलीफ गले में, श्वास नली में, या दोनों फेफड़ों में गहराई पर है?",
      type: "chips",
      options: [
        { id: "deep_lungs", label: "Deep Chest / Both Lungs", labelHi: "सीने में गहराई से / दोनों फेफड़ों में", alertScore: 2 },
        { id: "upper_throat", label: "Throat & Upper Windpipe (Tickle)", labelHi: "गले में खराश या ऊपरी श्वास नली में", alertScore: 0 },
        { id: "retrosternal_tight", label: "Tightness across entire front chest", labelHi: "सीने के आगे खिंचाव और जकड़न", alertScore: 2 },
        { id: "nasal_sinuses", label: "Nose and Sinuses draining down", labelHi: "नाक और सिर से बलगम नीचे गिरना", alertScore: 0 }
      ]
    },
    {
      key: "onset",
      label: "Onset (How did the cough or breathing difficulty begin?)",
      labelHi: "शुरुआत (खांसी या सांस फूलना कैसे शुरू हुआ?)",
      voicePromptEn: "Did you suddenly choke or has it been building up over days?",
      voicePromptHi: "क्या सांस अचानक फूली या कई दिनों से धीरे-धीरे बढ़ रही है?",
      type: "chips",
      options: [
        { id: "acute_choking", label: "Sudden onset choking / acute gasping", labelHi: "अचानक सांस अटकना या दम घुटना", alertScore: 3 },
        { id: "gradual_post_cold", label: "Began 3-5 days ago after cold / flu", labelHi: "3-5 दिन पहले सर्दी-जुकाम के बाद शुरू हुआ", alertScore: 0 },
        { id: "chronic_months", label: "Chronic cough for > 3 weeks (Smoker/TB)", labelHi: "3 सप्ताह से अधिक समय से पुरानी खांसी", alertScore: 1 },
        { id: "seasonal_allergic", label: "Sudden attack triggered by dust/weather", labelHi: "धूल, धुएं या मौसम बदलने पर दौरा", alertScore: 1 }
      ]
    },
    {
      key: "character",
      label: "Character (What type of cough or breathing sound is it?)",
      labelHi: "प्रकृति (खांसी कैसी है और सांस की आवाज कैसी आ रही है?)",
      voicePromptEn: "Is it dry, phlegm-filled, whistling wheeze, or coughing blood?",
      voicePromptHi: "क्या सूखी खांसी है, बलगम वाली, सीटी जैसी आवाज, या खून आ रहा है?",
      type: "chips",
      options: [
        { id: "hemoptysis_blood", label: "Coughing up Blood or Rusty Sputum", labelHi: "खांसी में खून या भूरा बलगम आना", alertScore: 4 },
        { id: "audible_wheezing", label: "Whistling / Musical Wheeze on breathing", labelHi: "सांस लेते समय सीटी जैसी आवाज (Wheeze)", alertScore: 2 },
        { id: "productive_phlegm", label: "Heavy Yellow/Green Phlegm / Mucus", labelHi: "गाढ़ा पीला या हरा बलगम आना", alertScore: 1 },
        { id: "dry_barking", label: "Dry hacking, irritating or barking cough", labelHi: "सूखी, लगातार परेशान करने वाली खांसी", alertScore: 0 }
      ]
    },
    {
      key: "radiation",
      label: "Radiation / Position Effect (Does posture affect your breathing?)",
      labelHi: "स्थिति का प्रभाव (क्या लेटने या बैठने से सांस में बदलाव आता है?)",
      voicePromptEn: "Does your breathing worsen when lying flat on your back?",
      voicePromptHi: "क्या सीधा पीठ के बल लेटने पर सांस ज्यादा फूलती है?",
      type: "chips",
      options: [
        { id: "orthopnea_lying_flat", label: "Cannot lie flat; Must sit upright to breathe", labelHi: "सीधा लेट नहीं सकते; बैठकर ही सांस आती है", alertScore: 3 },
        { id: "intercostal_chest_wall", label: "Soreness radiates along ribs on coughing", labelHi: "खांसने पर पसलियों के दोनों तरफ दर्द", alertScore: 0 },
        { id: "throat_to_ears", label: "Pain spreads to throat and ears", labelHi: "दर्द गले से कानों की तरफ जाता है", alertScore: 0 },
        { id: "none", label: "No postural change noticed", labelHi: "लेटने-बैठने से कोई खास फर्क नहीं", alertScore: 0 }
      ]
    },
    {
      key: "associations",
      label: "Associated Symptoms (What other symptoms accompany the breathing trouble?)",
      labelHi: "संबंधित लक्षण (इसके साथ और क्या तकलीफें हो रही हैं?)",
      voicePromptEn: "Are you breathless at rest, unable to speak full sentences, or having blue lips?",
      voicePromptHi: "क्या बैठे-बैठे सांस फूल रही है, बात करने में सांस टूट रही है, या होंठ नीले हैं?",
      type: "multi-chips",
      options: [
        { id: "dyspnea_at_rest", label: "Short of breath even while resting quietly", labelHi: "बिना चले, बैठे-बैठे भी सांस फूलना", alertScore: 3 },
        { id: "cannot_speak_sentences", label: "Unable to speak full sentences without gasping", labelHi: "एक सांस में पूरा वाक्य न बोल पाना", alertScore: 3 },
        { id: "blue_lips_cyanosis", label: "Bluish lips or fingertips (Low oxygen)", labelHi: "होंठ या नाखूनों का नीला पड़ना (ऑक्सीजन कमी)", alertScore: 4 },
        { id: "ankle_edema", label: "Swelling in both feet / ankles", labelHi: "दोनों पैरों व टखनों में सूजन", alertScore: 2 },
        { id: "high_fever", label: "High fever with chills", labelHi: "तेज बुखार व कंपकंपी", alertScore: 1 },
        { id: "none", label: "No critical associated signs", labelHi: "कोई अन्य गंभीर लक्षण नहीं", alertScore: 0 }
      ]
    },
    {
      key: "time_course",
      label: "Time Course (When is the cough or breathlessness at its worst?)",
      labelHi: "समय चक्र (खांसी या सांस किस समय सबसे ज्यादा तकलीफ देती है?)",
      voicePromptEn: "Is it worse at 3 AM, continuous all day, or after climbing stairs?",
      voicePromptHi: "क्या रात के 3 बजे ज्यादा बढ़ती है, पूरे दिन रहती है, या चलने पर?",
      type: "chips",
      options: [
        { id: "nocturnal_early_morning", label: "Worst at night (wakes from sleep) / 4 AM", labelHi: "रात को नींद से जगाने वाली / तड़के ज्यादा", alertScore: 1 },
        { id: "continuous_day_night", label: "Continuous and persistent day & night", labelHi: "दिन-रात लगातार बनी रहने वाली", alertScore: 1 },
        { id: "on_walking_stairs", label: "Only after walking 50-100 meters or stairs", labelHi: "थोड़ा चलने या सीढ़ियां चढ़ने पर ही", alertScore: 1 },
        { id: "morning_clearing", label: "Morning clearing of throat only", labelHi: "केवल सुबह उठने पर बलगम साफ करना", alertScore: 0 }
      ]
    },
    {
      key: "exacerbating_relieving",
      label: "Exacerbating & Relieving Factors (What triggers or calms it?)",
      labelHi: "बढ़ाने या घटाने वाले कारक (किस चीज से खांसी/सांस बिगड़ती या सुधरती है?)",
      voicePromptEn: "Does an inhaler relieve it, and do dust, cold air, or smoke trigger it?",
      voicePromptHi: "क्या इनहेलर से आराम मिलता है, और क्या धूल या ठंडी हवा से बढ़ती है?",
      type: "chips",
      options: [
        { id: "triggered_dust_cold_smoke", label: "Worse with dust, incense, smoke, or cold air", labelHi: "धूल, अगरबत्ती, धुएं या ठंडी हवा से बढ़ता है", alertScore: 0 },
        { id: "relieved_inhaler_steam", label: "Relieved by Asthalin/Budecort inhaler or steam", labelHi: "इनहेलर या भाप लेने से आराम मिलता है", alertScore: 0 },
        { id: "worse_exertion", label: "Worse with physical movement or carrying weight", labelHi: "शारीरिक परिश्रम या वजन उठाने पर तेज", alertScore: 2 },
        { id: "relieved_sitting_up", label: "Relieved when leaning forward or propped with 3 pillows", labelHi: "आगे झुककर बैठने या तकिए लगाकर आराम", alertScore: 2 },
        { id: "no_change", label: "No clear relieving factor", labelHi: "किसी खास चीज से आराम नहीं", alertScore: 0 }
      ]
    },
    {
      key: "severity",
      label: "Severity (Degree of respiratory distress)",
      labelHi: "तीव्रता (सांस लेने में कठिनाई का स्तर)",
      voicePromptEn: "Rate how difficult it is to breathe on a scale of 1 to 10.",
      voicePromptHi: "1 से 10 के पैमाने पर सांस लेने की तकलीफ बताएं।",
      type: "scale",
      min: 1,
      max: 10,
      options: [
        { value: 2, label: "Mild cough; Normal breathing (1-3)", labelHi: "हल्की खांसी; सांस सामान्य (1-3)", alertScore: 0 },
        { value: 5, label: "Moderate breathlessness on walking (4-6)", labelHi: "चलने पर मध्यम सांस फूलना (4-6)", alertScore: 1 },
        { value: 8, label: "Severe breathlessness; Hard to finish words (7-8)", labelHi: "तेज सांस फूलना; बोलने में कठिनाई (7-8)", alertScore: 3 },
        { value: 10, label: "Critical gasping / Imminent respiratory exhaustion (9-10)", labelHi: "अत्यधिक गंभीर / दम घुटना (9-10)", alertScore: 4 }
      ]
    }
  ],

  // 4. Stomach / Abdominal Pain
  abdominal_pain: [
    {
      key: "site",
      label: "Site (Where in the abdomen is the pain centered?)",
      labelHi: "स्थान (पेट में दर्द किस हिस्से में सबसे ज्यादा है?)",
      voicePromptEn: "Where in your stomach do you feel the pain?",
      voicePromptHi: "पेट के किस हिस्से में सबसे ज्यादा दर्द है?",
      type: "chips",
      options: [
        { id: "epigastric_upper", label: "Upper Center (Pit of stomach / Gas area)", labelHi: "ऊपरी बीच का हिस्सा (कलेजे के पास)", alertScore: 1 },
        { id: "right_upper_quadrant", label: "Right Upper (Under ribs / Gallbladder)", labelHi: "दाईं तरफ पसलियों के नीचे (पित्ताशय/लिवर)", alertScore: 1 },
        { id: "right_lower_quadrant", label: "Right Lower (Appendix area / Sharp point)", labelHi: "दाईं तरफ नीचे (अपेंडिक्स का हिस्सा)", alertScore: 3 },
        { id: "periumbilical_navel", label: "Around the Navel (Center belly)", labelHi: "नाभि के चारों ओर", alertScore: 0 },
        { id: "lower_suprapubic", label: "Lower Abdomen / Bladder & pelvic area", labelHi: "पेट के सबसे निचले हिस्से / पेडू में", alertScore: 0 },
        { id: "generalized_cramps", label: "Diffuse across entire stomach", labelHi: "पूरे पेट में मरोड़", alertScore: 0 }
      ]
    },
    {
      key: "onset",
      label: "Onset (How did the stomach pain start?)",
      labelHi: "शुरुआत (पेट का दर्द कैसे शुरू हुआ?)",
      voicePromptEn: "Did it hit suddenly like a bolt, or build up like gas cramps?",
      voicePromptHi: "क्या एकदम तेज झटका लगा या धीरे-धीरे मरोड़ बढ़ी?",
      type: "chips",
      options: [
        { id: "sudden_severe_peritonitic", label: "Sudden agonizing pain (Minutes ago)", labelHi: "अचानक बहुत तेज असहनीय दर्द", alertScore: 3 },
        { id: "few_hours_after_food", label: "Started 1-2 hours after heavy/spicy meal", labelHi: "भारी या तीखा खाना खाने के 1-2 घंटे बाद", alertScore: 0 },
        { id: "cramps_since_morning", label: "Cramps started this morning with loose stools", labelHi: "आज सुबह से दस्त के साथ मरोड़", alertScore: 0 },
        { id: "chronic_months", label: "Chronic recurrent ache for weeks", labelHi: "कई हफ्तों से रुक-रुक कर होने वाला दर्द", alertScore: 0 }
      ]
    },
    {
      key: "character",
      label: "Character (What type of abdominal sensation is it?)",
      labelHi: "प्रकृति (दर्द का अहसास कैसा है?)",
      voicePromptEn: "Is it cramping in waves, burning acid, sharp stabbing, or dull fullness?",
      voicePromptHi: "क्या मरोड़ उठ रही है, जलन है, सुई जैसी चुभन है, या भारीपन?",
      type: "chips",
      options: [
        { id: "colicky_waves", label: "Cramping in waves (Spasms that come and go)", labelHi: "रुक-रुक कर तेज मरोड़ या ऐंठन", alertScore: 1 },
        { id: "burning_acid", label: "Burning / Gnawing hunger-like pain", labelHi: "तेज जलन या खट्टी डकार वाला दर्द", alertScore: 0 },
        { id: "sharp_rigid", label: "Constant sharp pain; Stomach feels rigid/hard", labelHi: "लगातार तेज चुभन; पेट छूने पर सख्त/कड़ा", alertScore: 3 },
        { id: "dull_distension", label: "Dull aching fullness with gas bloating", labelHi: "धीमा दर्द और गैस से पेट फूलना", alertScore: 0 }
      ]
    },
    {
      key: "radiation",
      label: "Radiation (Does the stomach pain travel to your back or groin?)",
      labelHi: "फैलाव (क्या दर्द पीठ या जांघ की ओर फैलता है?)",
      voicePromptEn: "Does the pain shoot to your back, shoulder, or down to your groin?",
      voicePromptHi: "क्या दर्द पीठ, कंधे या जांघ की तरफ फैलता है?",
      type: "chips",
      options: [
        { id: "radiating_to_back", label: "Boring straight through to the back (Pancreatic)", labelHi: "सीधे पीठ की तरफ छेदता हुआ दर्द", alertScore: 2 },
        { id: "radiating_right_shoulder", label: "Shooting up to Right Shoulder / Scapula", labelHi: "दाहिने कंधे की तरफ ऊपर चढ़ता हुआ", alertScore: 2 },
        { id: "radiating_to_groin", label: "Flank radiating down to groin (Kidney stone)", labelHi: "कमर से नीचे जांघ की तरफ (पथरी का दर्द)", alertScore: 2 },
        { id: "none", label: "No radiation (stays in one spot)", labelHi: "कहीं नहीं फैलता (एक ही जगह रहता है)", alertScore: 0 }
      ]
    },
    {
      key: "associations",
      label: "Associated Symptoms (What other symptoms accompany the belly pain?)",
      labelHi: "संबंधित लक्षण (पेट दर्द के साथ और क्या-क्या हो रहा है?)",
      voicePromptEn: "Do you have vomiting of blood, black stool, jaundice, or inability to pass gas?",
      voicePromptHi: "क्या खून की उल्टी, काला मल, पीलिया या गैस का न निकलना शामिल है?",
      type: "multi-chips",
      options: [
        { id: "vomiting_blood_coffee", label: "Vomiting blood or coffee-ground liquid", labelHi: "उल्टी में खून या काले रंग का पदार्थ", alertScore: 4 },
        { id: "black_tarry_stool", label: "Black tarry stools (Melena)", labelHi: "काला तारकोल जैसा बदबूदार मल", alertScore: 3 },
        { id: "cannot_pass_gas", label: "Cannot pass gas or stool (Obstipation / Distended)", labelHi: "गैस या मल बिल्कुल बंद होना और पेट फूलना", alertScore: 3 },
        { id: "yellow_eyes_jaundice", label: "Yellowing of eyes / High fever with rigors", labelHi: "आंखों में पीलापन / तेज कंपकंपी बुखार", alertScore: 2 },
        { id: "watery_diarrhea", label: "Frequent watery diarrhea / dehydration", labelHi: "बार-बार पानी जैसे पतले दस्त", alertScore: 1 },
        { id: "none", label: "No critical associated signs", labelHi: "कोई अन्य गंभीर लक्षण नहीं", alertScore: 0 }
      ]
    },
    {
      key: "time_course",
      label: "Time Course (How does the pain progress?)",
      labelHi: "समय चक्र (दर्द कैसे घट-बढ़ रहा है?)",
      voicePromptEn: "Is it steady non-stop, episodic, or rapidly getting intolerable?",
      voicePromptHi: "क्या यह लगातार बना हुआ है या बीच-बीच में छूटता है?",
      type: "chips",
      options: [
        { id: "progressively_intolerable", label: "Intensifying rapidly into agony", labelHi: "तेजी से असहनीय होता जा रहा है", alertScore: 3 },
        { id: "regular_cramps", label: "Spasms peaking every 5-10 minutes", labelHi: "हर 5-10 मिनट में मरोड़ उठती है", alertScore: 1 },
        { id: "constant_dull", label: "Constant dull ache since yesterday", labelHi: "कल से लगातार धीमा दर्द बना हुआ है", alertScore: 0 },
        { id: "post_prandial_only", label: "Only after eating food", labelHi: "केवल खाना खाने के बाद ही होता है", alertScore: 0 }
      ]
    },
    {
      key: "exacerbating_relieving",
      label: "Exacerbating & Relieving Factors (What triggers or relieves the pain?)",
      labelHi: "बढ़ाने या घटाने वाले कारक (किस चीज से आराम या दर्द बढ़ता है?)",
      voicePromptEn: "Does movement hurt, and do antacids or bowel movements bring relief?",
      voicePromptHi: "क्या हिलने-डुलने से दर्द बढ़ता है और क्या दवा या शौच से आराम मिलता है?",
      type: "chips",
      options: [
        { id: "worse_movement_bumps", label: "Worse with any movement, coughing, or car bumps", labelHi: "हिलने, खांसने या झटके से तेज (Peritonitis)", alertScore: 3 },
        { id: "relieved_antacids_milk", label: "Relieved by antacids, cold milk, or food", labelHi: "एंटासिड, ठंडे दूध या खाना खाने से आराम", alertScore: 0 },
        { id: "worse_fatty_fried", label: "Triggered by oily, fried, or rich dairy foods", labelHi: "तले-भुने या घी-तेल के खाने से बढ़ता है", alertScore: 1 },
        { id: "relieved_after_stool", label: "Relieved after passing stool or gas", labelHi: "शौच या गैस निकलने के बाद आराम", alertScore: 0 },
        { id: "no_change", label: "Nothing changes the pain", labelHi: "किसी चीज से फर्क नहीं पड़ता", alertScore: 0 }
      ]
    },
    {
      key: "severity",
      label: "Severity (Rate the abdominal pain from 1 to 10)",
      labelHi: "तीव्रता (1 से 10 के पैमाने पर पेट दर्द का स्तर बताएं)",
      voicePromptEn: "On a scale of 1 to 10, how intense is your stomach pain?",
      voicePromptHi: "1 से 10 के पैमाने पर पेट दर्द कितना गंभीर है?",
      type: "scale",
      min: 1,
      max: 10,
      options: [
        { value: 2, label: "Mild discomfort (1-3)", labelHi: "हल्की बेचैनी (1-3)", alertScore: 0 },
        { value: 5, label: "Moderate pain / interferes with chores (4-6)", labelHi: "मध्यम दर्द (4-6)", alertScore: 1 },
        { value: 8, label: "Severe pain / curled up in bed (7-8)", labelHi: "तीव्र दर्द / करवट न बदल पाना (7-8)", alertScore: 2 },
        { value: 10, label: "Agonizing / Acute emergency abdomen (9-10)", labelHi: "असहनीय आपातकालीन दर्द (9-10)", alertScore: 4 }
      ]
    }
  ],

  // 5. Severe Headache
  headache: [
    {
      key: "site",
      label: "Site (Where is the headache located?)",
      labelHi: "स्थान (सिरदर्द मुख्य रूप से सिर में कहां है?)",
      voicePromptEn: "Where in your head is the pain located?",
      voicePromptHi: "सिर में दर्द किस हिस्से में हो रहा है?",
      type: "chips",
      options: [
        { id: "unilateral_temple", label: "One side only (Temporal / Half head)", labelHi: "आधे सिर में (कनपटी या एक तरफ)", alertScore: 1 },
        { id: "occipital_back", label: "Back of head & Upper Neck (Occipital)", labelHi: "सिर के पीछे और गर्दन के ऊपरी हिस्से में", alertScore: 2 },
        { id: "frontal_forehead", label: "Forehead & Across Both Temples", labelHi: "माथे पर और दोनों कनपटी में", alertScore: 0 },
        { id: "retro_orbital", label: "Directly Behind One Eye", labelHi: "एक आंख के ठीक पीछे गहरा दर्द", alertScore: 1 },
        { id: "vertex_diffuse", label: "Whole head like a tight helmet", labelHi: "पूरे सिर में हेलमेट की तरह जकड़न", alertScore: 0 }
      ]
    },
    {
      key: "onset",
      label: "Onset (How did the headache strike?)",
      labelHi: "शुरुआत (सिरदर्द कैसे शुरू हुआ?)",
      voicePromptEn: "Did it hit like a thunderclap, or start gradually?",
      voicePromptHi: "क्या यह बिजली कड़कने जैसा अचानक हुआ या धीरे-धीरे?",
      type: "chips",
      options: [
        { id: "thunderclap_instant", label: "Thunderclap (Instant peak within 60 seconds - Worst Ever)", labelHi: "बिजली कड़कने जैसा अचानक (जीवन का सबसे भयानक दर्द)", alertScore: 4 },
        { id: "woke_up_headache", label: "Woke up with severe headache this morning", labelHi: "सुबह उठते ही बहुत तेज दर्द महसूस हुआ", alertScore: 2 },
        { id: "gradual_hours", label: "Gradual build-up over hours with eye strain", labelHi: "कुछ घंटों में काम या तनाव से धीरे-धीरे बढ़ा", alertScore: 0 },
        { id: "throbbing_aura", label: "Started after flashing lights / visual aura", labelHi: "आंखों के आगे रोशनी चमकने के बाद शुरू हुआ", alertScore: 1 }
      ]
    },
    {
      key: "character",
      label: "Character (What does the headache feel like?)",
      labelHi: "प्रकृति (सिरदर्द का अहसास कैसा है?)",
      voicePromptEn: "Is it throbbing with your pulse, tight band pressure, or sharp stabbing?",
      voicePromptHi: "क्या नाड़ी की तरह धड़कने वाला है, कसने वाला, या तेज चुभन?",
      type: "chips",
      options: [
        { id: "throbbing_pulsating", label: "Throbbing / Pulsating like a heartbeat", labelHi: "धड़कन की तरह टीस मारने वाला (Migraine)", alertScore: 1 },
        { id: "vice_like_pressure", label: "Tight vice-like band around entire head", labelHi: "सिर पर शिकंजा कसा हुआ जैसा भारी दबाव", alertScore: 0 },
        { id: "sharp_stabbing", label: "Sharp stabbing / Ice-pick flashes", labelHi: "तेज सुई चुभने जैसा अचानक दर्द", alertScore: 0 },
        { id: "heavy_bursting", label: "Explosive bursting pressure inside head", labelHi: "सिर फटने जैसा भयानक दबाव", alertScore: 3 }
      ]
    },
    {
      key: "radiation",
      label: "Radiation (Does the pain spread into your neck or face?)",
      labelHi: "फैलाव (क्या दर्द गर्दन या चेहरे की तरफ फैलता है?)",
      voicePromptEn: "Does the pain travel down your neck or into your face?",
      voicePromptHi: "क्या दर्द गर्दन या चेहरे की तरफ फैल रहा है?",
      type: "chips",
      options: [
        { id: "down_neck_spine", label: "Radiating down neck and spine with stiffness", labelHi: "गर्दन और रीढ़ में अकड़न के साथ नीचे जाना", alertScore: 3 },
        { id: "into_jaw_face", label: "Radiating into jaw, teeth, or facial nerve", labelHi: "जबड़े, दांतों या चेहरे की नस की तरफ", alertScore: 1 },
        { id: "behind_eyes", label: "Shooting deep behind the eyeballs", labelHi: "आंख की पुतली के पीछे गहराई में", alertScore: 1 },
        { id: "none", label: "Confined strictly to head", labelHi: "केवल सिर तक ही सीमित है", alertScore: 0 }
      ]
    },
    {
      key: "associations",
      label: "Associated Symptoms (What other neurological symptoms are present?)",
      labelHi: "संबंधित लक्षण (सिरदर्द के साथ और क्या-क्या परेशानियां हैं?)",
      voicePromptEn: "Do you have neck stiffness, vomiting, vision loss, or arm/face weakness?",
      voicePromptHi: "क्या गर्दन में अकड़न, उल्टी, धुंधला दिखना या हाथ-मुंह में कमजोरी है?",
      type: "multi-chips",
      options: [
        { id: "stiff_neck_fever", label: "Stiff neck (cannot touch chin to chest) with fever", labelHi: "गर्दन में तेज अकड़न और बुखार (Meningitis alert)", alertScore: 4 },
        { id: "projectile_vomiting", label: "Sudden projectile vomiting without nausea", labelHi: "बिना जी मिचलाए अचानक दूर तक उल्टी होना", alertScore: 3 },
        { id: "focal_weakness_speech", label: "Arm/Leg weakness, facial droop, or slurred speech", labelHi: "हाथ-पैर में कमजोरी, मुंह टेढ़ा या बोली लड़खड़ाना", alertScore: 4 },
        { id: "vision_loss_blur", label: "Partial vision loss, double vision, or bright aura", labelHi: "एक तरफ अंधेरा, दोहरा दिखना (Diplopia) या चकाचौंध", alertScore: 2 },
        { id: "photophobia_phonophobia", label: "Extreme sensitivity to light and sound", labelHi: "रोशनी और तेज आवाज से बहुत चिड़चिड़ापन", alertScore: 1 },
        { id: "none", label: "No other neurological issues", labelHi: "कोई अन्य गंभीर लक्षण नहीं", alertScore: 0 }
      ]
    },
    {
      key: "time_course",
      label: "Time Course (How does the headache behave over time?)",
      labelHi: "समय चक्र (सिरदर्द समय के साथ कैसा रहता है?)",
      voicePromptEn: "Is it non-stop, episodic lasting hours, or increasing with cough?",
      voicePromptHi: "क्या यह लगातार है या कुछ घंटों के लिए आता है?",
      type: "chips",
      options: [
        { id: "continuous_high_plateau", label: "Non-stop severe intensity for hours", labelHi: "कई घंटों से बिना रुके तेज बना हुआ है", alertScore: 2 },
        { id: "episodic_migraine", label: "Attacks lasting 4 to 72 hours then easing", labelHi: "4 से 72 घंटे का दौरा फिर धीरे-धीरे शांति", alertScore: 1 },
        { id: "worse_every_morning", label: "Wakes up with headache every morning", labelHi: "रोज सुबह उठने पर सिर में भारीपन/दर्द", alertScore: 2 },
        { id: "brief_bursts", label: "Quick sharp bursts lasting seconds to minutes", labelHi: "कुछ सेकंड से मिनट के छोटे झटके", alertScore: 0 }
      ]
    },
    {
      key: "exacerbating_relieving",
      label: "Exacerbating & Relieving Factors (What triggers or calms your head?)",
      labelHi: "बढ़ाने या घटाने वाले कारक (किस चीज से दर्द घटता या बढ़ता है?)",
      voicePromptEn: "Does coughing, bending, bright light make it worse?",
      voicePromptHi: "क्या खांसने, झुकने या तेज रोशनी से दर्द बढ़ता है?",
      type: "chips",
      options: [
        { id: "worse_cough_bending", label: "Worse when coughing, straining, or bending down", labelHi: "खांसने, जोर लगाने या झुकने पर सिर फटना", alertScore: 3 },
        { id: "worse_light_sound", label: "Worse with bright light, phone screens, loud noises", labelHi: "तेज रोशनी, मोबाइल स्क्रीन या शोर से बढ़ना", alertScore: 1 },
        { id: "relieved_dark_quiet", label: "Relieved by resting in a dark, silent room", labelHi: "अंधेरे और शांत कमरे में सोने से आराम", alertScore: 0 },
        { id: "relieved_painkiller", label: "Eased with Paracetamol / NSAID tablets", labelHi: "दर्द निवारक दवा लेने से कम होना", alertScore: 0 },
        { id: "no_change", label: "No trigger or relief identified", labelHi: "कोई खास असर नहीं देखा", alertScore: 0 }
      ]
    },
    {
      key: "severity",
      label: "Severity (Rate the headache intensity from 1 to 10)",
      labelHi: "तीव्रता (1 से 10 के पैमाने पर सिरदर्द का स्तर बताएं)",
      voicePromptEn: "On a scale of 1 to 10, how intense is your headache?",
      voicePromptHi: "1 से 10 के पैमाने पर सिरदर्द कितना गंभीर है?",
      type: "scale",
      min: 1,
      max: 10,
      options: [
        { value: 2, label: "Mild tension headache (1-3)", labelHi: "हल्का सिरदर्द (1-3)", alertScore: 0 },
        { value: 5, label: "Moderate migraine / hard to work (4-6)", labelHi: "मध्यम दर्द / काम में रुकावट (4-6)", alertScore: 1 },
        { value: 8, label: "Severe headache / confined to bed (7-8)", labelHi: "तेज सिरदर्द / बिस्तर पर लेटे रहना (7-8)", alertScore: 2 },
        { value: 10, label: "Worst headache of life / Agonizing (9-10)", labelHi: "जीवन का सबसे असहनीय भयानक दर्द (9-10)", alertScore: 4 }
      ]
    }
  ],

  // 6. Joint or Body Pain
  joint_pain: [
    {
      key: "site",
      label: "Site (Which joints or body parts are affected?)",
      labelHi: "स्थान (किन जोड़ों या अंगों में दर्द है?)",
      voicePromptEn: "Which joints or areas of your body hurt?",
      voicePromptHi: "किन जोड़ों या शरीर के किस हिस्से में दर्द है?",
      type: "chips",
      options: [
        { id: "knee_joints", label: "Knee Joints (One or both knees)", labelHi: "घुटनों में (एक या दोनों घुटने)", alertScore: 0 },
        { id: "small_hand_joints", label: "Small Joints of Hands, Wrists & Fingers", labelHi: "हाथों, कलाई और उंगलियों के छोटे जोड़", alertScore: 1 },
        { id: "lower_back_spine", label: "Lower Back / Lumbar Spine", labelHi: "कमर के निचले हिस्से व रीढ़ में", alertScore: 1 },
        { id: "single_big_toe", label: "Single Swollen Red Joint (e.g. Big Toe - Gout)", labelHi: "एक ही जोड़ में तेज सूजन (पैर का अंगूठा)", alertScore: 2 },
        { id: "diffuse_muscles", label: "Whole Body Muscles & Generalized Aches", labelHi: "पूरे शरीर की मांसपेशियों में दर्द", alertScore: 0 }
      ]
    },
    {
      key: "onset",
      label: "Onset (How did the joint pain begin?)",
      labelHi: "शुरुआत (जोड़ों का दर्द कैसे शुरू हुआ?)",
      voicePromptEn: "Did it come on suddenly overnight, or develop slowly over years?",
      voicePromptHi: "क्या रातभर में अचानक सूज गया या महीनों में धीरे-धीरे बढ़ा?",
      type: "chips",
      options: [
        { id: "sudden_overnight_hot", label: "Sudden overnight severe swelling & heat", labelHi: "रातभर में अचानक जोड़ में लालिमा व तेज सूजन", alertScore: 2 },
        { id: "gradual_months_years", label: "Gradual wear-and-tear over months/years", labelHi: "कई महीनों या वर्षों से धीरे-धीरे बढ़ा (OA)", alertScore: 0 },
        { id: "post_viral_fever", label: "Started after viral fever / Chikungunya / Dengue", labelHi: "वायरल बुखार या डेंगू/चिकनगुनिया के बाद", alertScore: 1 },
        { id: "following_injury", label: "Directly after a fall, twist or sports injury", labelHi: "गिरने, मोच आने या चोट लगने के बाद", alertScore: 1 }
      ]
    },
    {
      key: "character",
      label: "Character (What does the joint pain feel like?)",
      labelHi: "प्रकृति (दर्द का स्वभाव कैसा है?)",
      voicePromptEn: "Is it stiff in the morning, grinding on walking, or burning inflammatory pain?",
      voicePromptHi: "क्या सुबह अकड़न रहती है, चलने पर कटकट होती है, या जलन?",
      type: "chips",
      options: [
        { id: "morning_stiffness_inflam", label: "Severe Morning Stiffness (>30 mins) & Warmth", labelHi: "सुबह उठने पर तेज अकड़न (>30 मिनट) व गर्माहट", alertScore: 2 },
        { id: "grinding_crepitus", label: "Mechanical dull ache with grinding / crepitus", labelHi: "चलने पर कटकट की आवाज व घिसाव का दर्द", alertScore: 0 },
        { id: "sharp_catch", label: "Sharp catch that locks the joint suddenly", labelHi: "जोड़ का अचानक लॉक हो जाना / अटकना", alertScore: 1 },
        { id: "diffuse_myalgia", label: "Dull heavy soreness all over body", labelHi: "पूरे बदन में भारीपन व थकान भरा दर्द", alertScore: 0 }
      ]
    },
    {
      key: "radiation",
      label: "Radiation (Does the pain travel down your limbs?)",
      labelHi: "फैलाव (क्या दर्द पैर या हाथ में नीचे की ओर फैलता है?)",
      voicePromptEn: "Does the pain shoot down from your back into your legs or feet?",
      voicePromptHi: "क्या दर्द कमर से पैरों या जांघ की ओर बिजली की तरह जाता है?",
      type: "chips",
      options: [
        { id: "sciatica_down_leg", label: "Shooting down back of leg to foot (Sciatica)", labelHi: "कमर से पैर के पंजे तक बिजली जैसा (साइटिका)", alertScore: 2 },
        { id: "cervical_down_arm", label: "Radiating down neck into arm and fingers", labelHi: "गर्दन से हाथ व उंगलियों में सुन्नपन/दर्द", alertScore: 2 },
        { id: "migrating_joints", label: "Jumps from one joint to another over days", labelHi: "एक जोड़ से दूसरे जोड़ में घूमता हुआ दर्द", alertScore: 1 },
        { id: "none", label: "Strictly confined to affected joint", labelHi: "केवल उसी जोड़ तक सीमित है", alertScore: 0 }
      ]
    },
    {
      key: "associations",
      label: "Associated Symptoms (What other symptoms accompany the pain?)",
      labelHi: "संबंधित लक्षण (जोड़ों के दर्द के साथ और क्या दिक्कतें हैं?)",
      voicePromptEn: "Do you have visible swelling, redness, fever, or difficulty walking?",
      voicePromptHi: "क्या जोड़ में लाल सूजन, बुखार या चलने में असमर्थता है?",
      type: "multi-chips",
      options: [
        { id: "inability_weight_bear", label: "Cannot bear any weight / Inability to walk", labelHi: "पैर जमीन पर न रख पाना / चलने में असमर्थ", alertScore: 3 },
        { id: "hot_red_effusion", label: "Joint is visibly hot, red, and swollen with fluid", labelHi: "जोड़ गर्म, लाल और पानी (द्रव) से फूला हुआ", alertScore: 2 },
        { id: "numbness_weakness_foot", label: "Foot drop / Tingling & numbness in toes", labelHi: "पंजे में कमजोरी या सुन्नपन (Nerve compression)", alertScore: 3 },
        { id: "fever_rash", label: "Accompanying fever, skin rash, or dry eyes", labelHi: "साथ में बुखार, चकत्ते या आंखों में सूखापन", alertScore: 1 },
        { id: "none", label: "No critical associated signs", labelHi: "कोई अन्य गंभीर लक्षण नहीं", alertScore: 0 }
      ]
    },
    {
      key: "time_course",
      label: "Time Course (When is the joint pain at its peak?)",
      labelHi: "समय चक्र (दर्द किस समय सबसे ज्यादा महसूस होता है?)",
      voicePromptEn: "Is it worse in the morning on waking, or at the end of the day?",
      voicePromptHi: "क्या सुबह उठने पर ज्यादा रहता है या शाम को चलने के बाद?",
      type: "chips",
      options: [
        { id: "morning_worse_improves_movement", label: "Worse on waking; Improves with gentle activity", labelHi: "सुबह सबसे ज्यादा; थोड़ा हिलने-डुलने पर सुधरता है", alertScore: 1 },
        { id: "evening_worse_exertion", label: "Mild in morning; Worse in evening after walking", labelHi: "सुबह ठीक; शाम को चलने-फिरने के बाद बढ़ता है", alertScore: 0 },
        { id: "continuous_day_night", label: "Severe and unremitting day and night", labelHi: "दिन-रात लगातार बना रहने वाला दर्द", alertScore: 2 },
        { id: "cold_weather_flares", label: "Worse in cold winter weather or dampness", labelHi: "सर्दियों या नमी के मौसम में ज्यादा बढ़ना", alertScore: 0 }
      ]
    },
    {
      key: "exacerbating_relieving",
      label: "Exacerbating & Relieving Factors (What improves or worsens the joint?)",
      labelHi: "बढ़ाने या घटाने वाले कारक (किस चीज से दर्द बढ़ता या घटता है?)",
      voicePromptEn: "Does climbing stairs aggravate it, and do hot compresses help?",
      voicePromptHi: "क्या सीढ़ियां चढ़ने से बढ़ता है और गर्म सिकाई से आराम मिलता है?",
      type: "chips",
      options: [
        { id: "worse_stairs_squatting", label: "Worse climbing stairs, squatting, or kneeling", labelHi: "सीढ़ी चढ़ने, उकड़ू बैठने या झुकने पर तेज", alertScore: 0 },
        { id: "relieved_hot_compress", label: "Relieved by warm fomentation / hot showers", labelHi: "गर्म पानी की सिकाई या धूप से आराम", alertScore: 0 },
        { id: "relieved_rest_nsaids", label: "Relieved by complete rest and pain relievers", labelHi: "आराम करने और दर्द की गोली से राहत", alertScore: 0 },
        { id: "worse_prolonged_sitting", label: "Joint locks after sitting still for > 1 hour", labelHi: "एक जगह देर तक बैठने पर जोड़ अकड़ जाना", alertScore: 0 }
      ]
    },
    {
      key: "severity",
      label: "Severity (Rate the joint or body pain from 1 to 10)",
      labelHi: "तीव्रता (1 से 10 के पैमाने पर जोड़ों के दर्द का स्तर बताएं)",
      voicePromptEn: "On a scale of 1 to 10, how severe is your joint discomfort?",
      voicePromptHi: "1 से 10 के पैमाने पर जोड़ों का दर्द कितना है?",
      type: "scale",
      min: 1,
      max: 10,
      options: [
        { value: 2, label: "Mild stiffness (1-3)", labelHi: "हल्की अकड़न (1-3)", alertScore: 0 },
        { value: 5, label: "Moderate pain / Limping slightly (4-6)", labelHi: "मध्यम दर्द / थोड़ा लंगड़ा कर चलना (4-6)", alertScore: 1 },
        { value: 8, label: "Severe pain / Difficulty walking (7-8)", labelHi: "तेज दर्द / चलने में बहुत परेशानी (7-8)", alertScore: 2 },
        { value: 10, label: "Intolerable / Bedridden / Cannot touch joint (9-10)", labelHi: "असहनीय / जोड़ छूने पर भी चीख निकलना (9-10)", alertScore: 4 }
      ]
    }
  ],

  // 7. Skin Rash or Itching
  skin_rash: [
    {
      key: "site",
      label: "Site (Where on your skin has the rash appeared?)",
      labelHi: "स्थान (त्वचा पर दाने या चकत्ते शरीर में कहां निकले हैं?)",
      voicePromptEn: "Where on your skin has the rash or itching appeared?",
      voicePromptHi: "त्वचा पर दाने या खुजली शरीर के किस हिस्से में है?",
      type: "chips",
      options: [
        { id: "face_neck_lips", label: "Face, Cheeks, Eyelids, or Lips", labelHi: "चेहरे, गालों, पलकों या होंठों पर", alertScore: 2 },
        { id: "flexural_creases", label: "Folds of Skin (Elbow creases, behind knees)", labelHi: "कोहनी के मोड़ों या घुटनों के पीछे", alertScore: 0 },
        { id: "trunk_chest_back", label: "Torso, Chest, and Back", labelHi: "धड़, सीने और पीठ पर", alertScore: 0 },
        { id: "hands_feet_palms", label: "Palms, Soles, and Fingers / Toes", labelHi: "हथेलियों, तलवों या उंगलियों पर", alertScore: 1 },
        { id: "generalized_all_over", label: "All over entire body", labelHi: "पूरे शरीर पर फैला हुआ", alertScore: 2 }
      ]
    },
    {
      key: "onset",
      label: "Onset (How and when did the rash erupt?)",
      labelHi: "शुरुआत (दाने कब और कैसे निकले?)",
      voicePromptEn: "Did it erupt suddenly after taking a medicine or food, or over days?",
      voicePromptHi: "क्या कोई नई दवा या खाना खाने के बाद अचानक हुआ?",
      type: "chips",
      options: [
        { id: "sudden_after_medication", label: "Sudden eruption within hours of new medication / food", labelHi: "नई दवा या भोजन के कुछ घंटों में अचानक (Drug reaction)", alertScore: 3 },
        { id: "gradual_few_days", label: "Gradual spread over 2 to 5 days", labelHi: "2 से 5 दिनों में धीरे-धीरे फैला", alertScore: 0 },
        { id: "chronic_recurrent", label: "Chronic recurrent patches for months (Eczema/Psoriasis)", labelHi: "महीनों से बार-बार होने वाले चकत्ते", alertScore: 0 },
        { id: "contact_chemical", label: "Appeared after touching a plant, cosmetic, or soap", labelHi: "साबुन, क्रीम या पौधे के संपर्क में आने के बाद", alertScore: 0 }
      ]
    },
    {
      key: "character",
      label: "Character (What do the skin lesions look like?)",
      labelHi: "प्रकृति (दाने या चकत्ते दिखने में कैसे हैं?)",
      voicePromptEn: "Are they raised red wheals, dry scaly patches, fluid blisters, or peeling skin?",
      voicePromptHi: "क्या उभरे हुए लाल चकत्ते हैं, पपड़ीदार, पानी के छाले, या खाल उतर रही है?",
      type: "chips",
      options: [
        { id: "urticarial_wheals", label: "Raised itchy red wheals / hives (Urticaria / Pitta)", labelHi: "उभरे हुए लाल चकत्ते या पित्ती (Hives/पित्त)", alertScore: 2 },
        { id: "fluid_blisters_peeling", label: "Water blisters (vesicles) or skin peeling off", labelHi: "पानी भरे छाले या त्वचा की परत उतरना", alertScore: 4 },
        { id: "scaly_dry_plaques", label: "Dry, scaly, thickened, silvery plaques", labelHi: "सूखे, पपड़ीदार खुरदुरे चकत्ते", alertScore: 0 },
        { id: "maculopapular_spots", label: "Flat red spots / measles-like fine bumps", labelHi: "बारीक लाल दाने या फुंसियां", alertScore: 1 }
      ]
    },
    {
      key: "radiation",
      label: "Spread / Distribution (Is the rash spreading?)",
      labelHi: "फैलाव (क्या दाने तेजी से फैल रहे हैं?)",
      voicePromptEn: "Is the rash spreading rapidly across your body or in a band?",
      voicePromptHi: "क्या दाने पूरे शरीर पर तेजी से फैल रहे हैं या एक पट्टी में?",
      type: "chips",
      options: [
        { id: "rapid_centrifugal_spread", label: "Spreading rapidly to cover new areas every hour", labelHi: "हर घंटे तेजी से नए हिस्सों में फैलना", alertScore: 3 },
        { id: "dermatomal_band", label: "One-sided band following a nerve (Herpes Zoster / Shingles)", labelHi: "शरीर के एक ही तरफ पट्टी की तरह (दाद/ज़ोस्टर)", alertScore: 2 },
        { id: "localized_confined", label: "Confined strictly to initial contact area", labelHi: "केवल शुरुआत वाली जगह तक ही सीमित", alertScore: 0 },
        { id: "symmetrical_both_sides", label: "Symmetrical on both arms or both legs", labelHi: "दोनों हाथों या दोनों पैरों पर एक जैसे", alertScore: 0 }
      ]
    },
    {
      key: "associations",
      label: "Associated Symptoms (Are there warning signs like face swelling or fever?)",
      labelHi: "संबंधित लक्षण (क्या चेहरे पर सूजन, सांस में रुकावट या बुखार है?)",
      voicePromptEn: "Do you have swelling of your lips, throat difficulty, or mouth ulcers?",
      voicePromptHi: "क्या होंठों पर सूजन, सांस लेने में तकलीफ या मुंह में छाले हैं?",
      type: "multi-chips",
      options: [
        { id: "angioedema_lip_throat", label: "Swelling of lips, tongue, or difficulty swallowing", labelHi: "होंठों, जीभ पर सूजन या निगलने में तकलीफ (Angioedema)", alertScore: 4 },
        { id: "mucosal_mouth_involvement", label: "Painful raw ulcers inside mouth or eyes", labelHi: "मुंह या आंखों के अंदर दर्दनाक छाले (SJS alert)", alertScore: 4 },
        { id: "intense_pruritus", label: "Uncontrollable itching interfering with sleep", labelHi: "असहनीय खुजली जिससे नींद न आए", alertScore: 1 },
        { id: "fever_bodyache", label: "High fever and widespread body pain", labelHi: "तेज बुखार और बदन दर्द", alertScore: 2 },
        { id: "none", label: "No critical systemic signs", labelHi: "कोई अन्य गंभीर लक्षण नहीं", alertScore: 0 }
      ]
    },
    {
      key: "time_course",
      label: "Time Course (How does the rash change through the day?)",
      labelHi: "समय चक्र (दाने दिनभर में कैसे बदलते हैं?)",
      voicePromptEn: "Do individual hives vanish and appear in new spots within hours?",
      voicePromptHi: "क्या चकत्ते कुछ घंटों में गायब होकर दूसरी जगह निकल आते हैं?",
      type: "chips",
      options: [
        { id: "evanescent_hives", label: "Individual spots vanish within 24 hours & appear elsewhere", labelHi: "चकत्ते 24 घंटे में गायब होकर दूसरी जगह आ जाते हैं", alertScore: 1 },
        { id: "steadily_deepening", label: "Steadily becoming redder, darker, and crusting", labelHi: "लगातार गहरे लाल और पपड़ीदार होते जा रहे हैं", alertScore: 1 },
        { id: "flares_after_sweating", label: "Flares up during heat/sweating, eases in AC", labelHi: "पसीने या गर्मी में भड़कते हैं, ठंडक में शांत", alertScore: 0 },
        { id: "static_chronic", label: "Static unchanged dry patches", labelHi: "बिना बदलाव के सूखे चकत्ते बने हुए हैं", alertScore: 0 }
      ]
    },
    {
      key: "exacerbating_relieving",
      label: "Exacerbating & Relieving Factors (What aggravates or soothes the skin?)",
      labelHi: "बढ़ाने या घटाने वाले कारक (किस चीज से खुजली बढ़ती या घटती है?)",
      voicePromptEn: "Does hot water worsen it, and do cold packs or antihistamines help?",
      voicePromptHi: "क्या गर्म पानी से बढ़ती है और ठंडी सिकाई या एलर्जी की दवा से आराम मिलता है?",
      type: "chips",
      options: [
        { id: "worse_hot_water_soap", label: "Aggravated by hot showers, harsh soaps, or wool", labelHi: "गर्म पानी, साबुन या ऊनी कपड़ों से बढ़ता है", alertScore: 0 },
        { id: "relieved_antihistamines", label: "Relieved by allergy tablets (Cetirizine / Allegra)", labelHi: "एलर्जी की दवा (सिट्रिजिन आदि) से आराम", alertScore: 0 },
        { id: "relieved_moisturizer", label: "Relieved by moisturizing cream / coconut oil", labelHi: "नारियल तेल या मॉइस्चराइजर से राहत", alertScore: 0 },
        { id: "worse_scratching", label: "Scratching makes it bleed and ooze liquid", labelHi: "खुजलाने से खून या पानी निकलने लगता है", alertScore: 1 }
      ]
    },
    {
      key: "severity",
      label: "Severity (Rate the distress and itching from 1 to 10)",
      labelHi: "तीव्रता (1 से 10 के पैमाने पर खुजली और परेशानी का स्तर बताएं)",
      voicePromptEn: "On a scale of 1 to 10, how severe is your itching or skin pain?",
      voicePromptHi: "1 से 10 के पैमाने पर खुजली या दर्द का स्तर बताएं।",
      type: "scale",
      min: 1,
      max: 10,
      options: [
        { value: 2, label: "Mild occasional itch (1-3)", labelHi: "हल्की कभी-कभार खुजली (1-3)", alertScore: 0 },
        { value: 5, label: "Moderate rash; Annoying but tolerable (4-6)", labelHi: "मध्यम दाने; असहज पर सहनीय (4-6)", alertScore: 1 },
        { value: 8, label: "Severe rash; Sleep disrupted & raw skin (7-8)", labelHi: "तेज दाने; नींद गायब व त्वचा छिलना (7-8)", alertScore: 2 },
        { value: 10, label: "Emergency reaction (Face swelling / Blistering) (9-10)", labelHi: "आपातकालीन रिएक्शन (चेहरे पर सूजन/छाले) (9-10)", alertScore: 4 }
      ]
    }
  ],

  // 8. Sugar / Diabetes Checkup
  diabetes_followup: [
    {
      key: "site",
      label: "System / Location (Which diabetic symptoms are you noticing?)",
      labelHi: "लक्षण व स्थान (डायबिटीज से जुड़ी क्या तकलीफें महसूस हो रही हैं?)",
      voicePromptEn: "Where in your body are you noticing symptoms: feet, vision, or thirst?",
      voicePromptHi: "शरीर में कहां लक्षण दिख रहे हैं: पैरों में, नजर में, या अत्यधिक प्यास?",
      type: "chips",
      options: [
        { id: "peripheral_feet_numb", label: "Feet & Toes (Burning, Tingling, or Numbness)", labelHi: "पैरों व तलवों में जलन, झनझनाहट या सुन्नपन (Neuropathy)", alertScore: 2 },
        { id: "urinary_osmotic", label: "Excessive Thirst & Frequent Urination at night", labelHi: "बार-बार पेशाब आना और अत्यधिक प्यास लगना", alertScore: 1 },
        { id: "blurry_eyes", label: "Eyes & Vision (Blurriness or fluctuations)", labelHi: "आंखों के आगे धुंधलापन या चश्मे का नंबर बदलना", alertScore: 2 },
        { id: "general_metabolic", label: "General fatigue & slow wound healing", labelHi: "अत्यधिक कमजोरी व घाव देर से भरना", alertScore: 1 }
      ]
    },
    {
      key: "onset",
      label: "Onset (When did your blood sugar control change?)",
      labelHi: "शुरुआत (शुगर के स्तर में बदलाव कब से दिख रहा है?)",
      voicePromptEn: "Is this a recent spike or longstanding chronic diabetes?",
      voicePromptHi: "क्या हाल ही में शुगर बढ़ी है या कई सालों से पुरानी बीमारी है?",
      type: "chips",
      options: [
        { id: "recent_high_spike", label: "Recent spike on home glucometer (> 250 mg/dL)", labelHi: "ग्लूकोमीटर पर हाल ही में बहुत ज्यादा शुगर (>250 mg/dL)", alertScore: 2 },
        { id: "known_diabetic_years", label: "Known diabetic for several years on regular meds", labelHi: "कई वर्षों से ज्ञात मरीज, नियमित दवा ले रहे हैं", alertScore: 0 },
        { id: "newly_suspected", label: "First time checking / Family history of diabetes", labelHi: "पहली बार जांच करा रहे हैं / परिवार में इतिहास", alertScore: 0 },
        { id: "missed_meds_week", label: "Sugar uncontrolled after missing medications", labelHi: "दवाएं छूटने के बाद शुगर अनियंत्रित हुई", alertScore: 1 }
      ]
    },
    {
      key: "character",
      label: "Character (What primary diabetic issue concerns you?)",
      labelHi: "प्रकृति (डायबिटीज से जुड़ी मुख्य समस्या क्या है?)",
      voicePromptEn: "Are you concerned about high sugar spikes, low sugar shaky episodes, or foot ulcers?",
      voicePromptHi: "क्या बहुत ज्यादा शुगर, लो-शुगर में कंपकंपी, या पैर का घाव मुख्य चिंता है?",
      type: "chips",
      options: [
        { id: "high_hyperglycemia", label: "High Fasting or Post-Meal Sugar Readings", labelHi: "खाली पेट या खाने के बाद शुगर का बहुत ज्यादा आना", alertScore: 1 },
        { id: "hypoglycemic_shakes", label: "Hypoglycemia (Shakiness, cold sweat, hunger pangs)", labelHi: "लो शुगर के दौरे (कंपकंपी, ठंडा पसीना, घबराहट)", alertScore: 3 },
        { id: "neuropathic_burning", label: "Burning soles of feet like walking on hot coals", labelHi: "तलवों में आग जैसी जलन या सुन्नपन", alertScore: 1 },
        { id: "unexplained_weight_loss", label: "Rapid unintended weight loss despite eating well", labelHi: "अच्छा खाने के बावजूद तेजी से वजन घटना", alertScore: 2 }
      ]
    },
    {
      key: "radiation",
      label: "Distribution (Is nerve tingling spreading up your limbs?)",
      labelHi: "फैलाव (क्या पैरों की झनझनाहट या सुन्नपन ऊपर की ओर बढ़ रहा है?)",
      voicePromptEn: "Does the tingling spread from your toes up to your shins or hands?",
      voicePromptHi: "क्या पैरों का सुन्नपन पिंडलियों या हाथों तक बढ़ रहा है?",
      type: "chips",
      options: [
        { id: "stocking_glove_both_legs", label: "Bilateral feet spreading upwards to shins (Stocking distribution)", labelHi: "दोनों पैरों में ऊपर की ओर बढ़ता हुआ सुन्नपन", alertScore: 2 },
        { id: "hands_and_feet", label: "Both hands and both feet tingling", labelHi: "हाथों और पैरों दोनों में झनझनाहट", alertScore: 2 },
        { id: "localized_one_foot", label: "Confined to one specific spot on foot", labelHi: "पैर के किसी एक ही हिस्से तक सीमित", alertScore: 1 },
        { id: "none", label: "No nerve tingling or numbness", labelHi: "कोई सुन्नपन या झनझनाहट नहीं", alertScore: 0 }
      ]
    },
    {
      key: "associations",
      label: "Associated Symptoms (Check for diabetic complications)",
      labelHi: "संबंधित लक्षण (डायबिटीज के जटिल लक्षणों की जांच करें)",
      voicePromptEn: "Do you have a non-healing foot wound, fruity breath, or nausea?",
      voicePromptHi: "क्या पैर में न भरने वाला घाव, मुंह से खट्टी गंध, या उल्टी जैसा है?",
      type: "multi-chips",
      options: [
        { id: "non_healing_ulcer", label: "Non-healing wound, blister, or ulcer on foot", labelHi: "पैर या अंगूठे में न भरने वाला घाव या छाला (Diabetic Foot)", alertScore: 4 },
        { id: "dka_fruity_breath_vomit", label: "Vomiting, deep rapid breathing, or fruity breath (DKA)", labelHi: "उल्टी, तेज सांसें या मुंह से मीठी गंध (DKA alert)", alertScore: 4 },
        { id: "frequent_infections", label: "Recurrent urinary infections or skin boils", labelHi: "बार-बार पेशाब का संक्रमण या त्वचा के फोड़े-फुंसी", alertScore: 1 },
        { id: "blurred_vision", label: "Noticeable drop in vision clarity", labelHi: "नजर में साफ गिरावट", alertScore: 2 },
        { id: "none", label: "No complications noticed", labelHi: "कोई अन्य जटिलता नहीं", alertScore: 0 }
      ]
    },
    {
      key: "time_course",
      label: "Time Course (How consistent are your blood sugar readings?)",
      labelHi: "समय चक्र (शुगर के आंकड़े दिनभर में कैसे रहते हैं?)",
      voicePromptEn: "Are your sugars high only in the fasting morning or all day?",
      voicePromptHi: "क्या शुगर सिर्फ सुबह खाली पेट ज्यादा आती है या दिनभर?",
      type: "chips",
      options: [
        { id: "fasting_morning_spike", label: "High fasting in morning (Dawn phenomenon)", labelHi: "सुबह खाली पेट सबसे ज्यादा (Dawn phenomenon)", alertScore: 1 },
        { id: "post_meal_surge", label: "Spikes specifically 2 hours after lunch or dinner", labelHi: "दोपहर या रात के खाने के 2 घंटे बाद तेज उछाल", alertScore: 1 },
        { id: "unpredictable_swings", label: "Swings wildly between very low and very high", labelHi: "कभी बहुत कम तो कभी बहुत ज्यादा (Brittle diabetes)", alertScore: 3 },
        { id: "mostly_steady", label: "Mostly stable around current values", labelHi: "वर्तमान स्तर पर लगभग स्थिर", alertScore: 0 }
      ]
    },
    {
      key: "exacerbating_relieving",
      label: "Exacerbating & Relieving Factors (What influences your sugar control?)",
      labelHi: "प्रभावित करने वाले कारक (किस चीज से शुगर घटती या बढ़ती है?)",
      voicePromptEn: "Does walking bring it down, and do stress or rice/sweets cause spikes?",
      voicePromptHi: "क्या टहलने से घटती है और क्या तनाव या मीठे-चावल से उछलती है?",
      type: "chips",
      options: [
        { id: "spikes_carbs_sweets", label: "Spikes after rice, sweets, potatoes, or wheat meals", labelHi: "चावल, मिठाई, आलू या भारी भोजन के बाद बढ़ती है", alertScore: 0 },
        { id: "improves_brisk_walk", label: "Reduces noticeably with daily 30-min brisk walk", labelHi: "रोजाना 30 मिनट टहलने से शुगर कम होती है", alertScore: 0 },
        { id: "spikes_mental_stress", label: "Spikes during work stress, fever, or lack of sleep", labelHi: "तनाव, बीमारी या नींद पूरी न होने पर बढ़ती है", alertScore: 1 },
        { id: "hypo_relieved_sugar", label: "Shakiness promptly relieved by glucose/sugar/fruit juice", labelHi: "घबराहट मीठा या ग्लूकोज लेने पर तुरंत ठीक होती है", alertScore: 1 }
      ]
    },
    {
      key: "severity",
      label: "Severity (Latest Glycemic Level / HbA1c estimate)",
      labelHi: "तीव्रता (हालिया शुगर स्तर या HbA1c का अनुमान)",
      voicePromptEn: "What was your most recent blood sugar or HbA1c reading?",
      voicePromptHi: "हाल ही में आपकी ब्लड शुगर या HbA1c कितनी आई थी?",
      type: "scale",
      min: 1,
      max: 10,
      options: [
        { value: 2, label: "Controlled (Fasting < 110, HbA1c < 6.5%)", labelHi: "नियंत्रित (Fasting < 110, HbA1c < 6.5%)", alertScore: 0 },
        { value: 5, label: "Moderate elevation (Fasting 110-160, HbA1c 7.0-8.0%)", labelHi: "मध्यम वृद्धि (Fasting 110-160, HbA1c 7-8%)", alertScore: 1 },
        { value: 8, label: "High risk (Fasting 160-250, HbA1c 8.0-10.0%)", labelHi: "उच्च जोखिम (Fasting 160-250, HbA1c 8-10%)", alertScore: 2 },
        { value: 10, label: "Critical / Danger (Fasting > 250 mg/dL, HbA1c > 10%)", labelHi: "अत्यधिक गंभीर (Fasting > 250, HbA1c > 10%)", alertScore: 4 }
      ]
    }
  ],

  // 9. Blood Pressure Checkup
  hypertension_followup: [
    {
      key: "site",
      label: "System / Location (Where do you feel high blood pressure symptoms?)",
      labelHi: "लक्षण व स्थान (हाई बीपी का असर मुख्य रूप से कहां महसूस होता है?)",
      voicePromptEn: "Do you feel pressure in your head, chest, or behind your eyes?",
      voicePromptHi: "क्या सिर के पीछे भारीपन, सीने में धड़कन या आंखों में दबाव है?",
      type: "chips",
      options: [
        { id: "occipital_neck_tension", label: "Back of Head & Neck (Occipital Heaviness)", labelHi: "सिर के पीछे और गर्दन में भारी तनाव", alertScore: 2 },
        { id: "chest_flutter", label: "Chest (Pounding heartbeat or flutter)", labelHi: "सीने में दिल का जोर-जोर से धड़कना", alertScore: 2 },
        { id: "eyes_vision_strain", label: "Behind Eyes with visual throbbing", labelHi: "आंखों के पीछे दबाव और नस फड़कना", alertScore: 1 },
        { id: "general_dizziness", label: "Generalized lightheadedness or unsteadiness", labelHi: "सिर घूमना या चक्कर जैसा महसूस होना", alertScore: 1 }
      ]
    },
    {
      key: "onset",
      label: "Onset (When did this blood pressure elevation begin?)",
      labelHi: "शुरुआत (रक्तचाप में यह बढ़ोतरी कब दर्ज हुई?)",
      voicePromptEn: "Was this an accidental high reading today, or a chronic trend?",
      voicePromptHi: "क्या आज अचानक नापने पर ज्यादा निकला या कई हफ्तों से है?",
      type: "chips",
      options: [
        { id: "sudden_spike_today", label: "Sudden spike measured today (> 160/100 mmHg)", labelHi: "आज अचानक नापने पर बहुत तेज आया (>160/100)", alertScore: 2 },
        { id: "erratic_missed_tablets", label: "High after missing BP tablets for few days", labelHi: "कुछ दिनों से बीपी की दवा छूटने के बाद बढ़ा", alertScore: 2 },
        { id: "gradual_upward_trend", label: "Gradual upward trend noted over recent weeks", labelHi: "पिछले कुछ हफ्तों से धीरे-धीरे बढ़ता हुआ आ रहा है", alertScore: 1 },
        { id: "routine_check_normal", label: "Routine clinic follow-up check", labelHi: "नियमित जांच के लिए आए हैं", alertScore: 0 }
      ]
    },
    {
      key: "character",
      label: "Character (What physical sensation accompanies your BP?)",
      labelHi: "प्रकृति (बीपी बढ़ने पर कैसा अहसास होता है?)",
      voicePromptEn: "Do you feel throbbing temples, flushed warm face, or pounding ears?",
      voicePromptHi: "क्या कनपटी पर टीस, चेहरा लाल-गर्म या कानों में धड़कन की आवाज है?",
      type: "chips",
      options: [
        { id: "pulsating_ears_tinnitus", label: "Pounding sound in ears like heartbeat (Pulsatile Tinnitus)", labelHi: "कानों में दिल की धड़कन जैसी तेज आवाज (Tinnitus)", alertScore: 2 },
        { id: "hot_flushed_face", label: "Flushed red, warm face with headache", labelHi: "चेहरा एकदम लाल-गर्म और सिर में भारीपन", alertScore: 1 },
        { id: "dull_band_pressure", label: "Dull heavy pressure like a tight cap", labelHi: "सिर पर भारी टोपी जैसा निरंतर दबाव", alertScore: 0 },
        { id: "asymptomatic_silent", label: "Completely symptom-free (Silent reading only)", labelHi: "कोई विशेष लक्षण नहीं (केवल रीडिंग में ज्यादा)", alertScore: 0 }
      ]
    },
    {
      key: "radiation",
      label: "Radiation (Does tension spread down your shoulders?)",
      labelHi: "फैलाव (क्या तनाव गर्दन और कंधों की ओर फैलता है?)",
      voicePromptEn: "Does the tightness spread down your neck into both shoulders?",
      voicePromptHi: "क्या खिंचाव गर्दन से दोनों कंधों की तरफ जाता है?",
      type: "chips",
      options: [
        { id: "radiates_neck_shoulders", label: "Spreading down nape of neck across shoulders", labelHi: "गर्दन के पीछे से दोनों कंधों तक खिंचाव", alertScore: 1 },
        { id: "radiates_to_jaw", label: "Radiating to jaw or upper chest", labelHi: "जबड़े या ऊपरी सीने की ओर जाता हुआ", alertScore: 2 },
        { id: "none", label: "Localized in head without radiation", labelHi: "केवल सिर तक सीमित, कहीं नहीं फैलता", alertScore: 0 }
      ]
    },
    {
      key: "associations",
      label: "Associated Red-Flag Symptoms (Check for hypertensive emergency)",
      labelHi: "संबंधित लक्षण (हाई बीपी के आपातकालीन संकेतों की जांच करें)",
      voicePromptEn: "Do you have nosebleeds, blurry vision, chest pain, or breathlessness?",
      voicePromptHi: "क्या नाक से खून, धुंधला दिखना, सीने में दर्द या सांस फूल रही है?",
      type: "multi-chips",
      options: [
        { id: "epistaxis_nosebleed", label: "Spontaneous Nosebleed (Epistaxis)", labelHi: "नाक से अचानक खून बहना (Epistaxis)", alertScore: 3 },
        { id: "blurred_double_vision", label: "Sudden Blurred or Double Vision", labelHi: "अचानक धुंधला दिखना या दो-दो दिखना", alertScore: 3 },
        { id: "chest_tightness_dyspnea", label: "Chest tightness or Shortness of Breath", labelHi: "सीने में जकड़न या सांस फूलना (Heart strain)", alertScore: 4 },
        { id: "severe_dizziness_nausea", label: "Severe dizzy spells or vomiting", labelHi: "तेज चक्कर आना या उल्टियां होना", alertScore: 2 },
        { id: "none", label: "No critical red flags", labelHi: "कोई आपातकालीन लक्षण नहीं", alertScore: 0 }
      ]
    },
    {
      key: "time_course",
      label: "Time Course (When during the day is your BP highest?)",
      labelHi: "समय चक्र (दिन के किस समय बीपी सबसे ज्यादा रहता है?)",
      voicePromptEn: "Is your BP highest in the early morning upon waking?",
      voicePromptHi: "क्या सुबह सोकर उठने पर बीपी सबसे ज्यादा रहता है?",
      type: "chips",
      options: [
        { id: "morning_surge", label: "Highest in the early morning upon waking", labelHi: "सुबह उठते ही सबसे ज्यादा (Morning surge)", alertScore: 2 },
        { id: "afternoon_work_stress", label: "Spikes in afternoon during work or tension", labelHi: "दोपहर में काम के तनाव के समय बढ़ता है", alertScore: 1 },
        { id: "continuous_high_all_day", label: "Persistently elevated throughout the entire day", labelHi: "पूरे दिन लगातार बढ़ा हुआ रहता है", alertScore: 2 },
        { id: "fluctuating_widely", label: "Fluctuates up and down unpredictably", labelHi: "दिनभर में बहुत ज्यादा घटता-बढ़ता है", alertScore: 1 }
      ]
    },
    {
      key: "exacerbating_relieving",
      label: "Exacerbating & Relieving Factors (What triggers or calms your BP?)",
      labelHi: "प्रभावित करने वाले कारक (किस चीज से बीपी बढ़ता या घटता है?)",
      voicePromptEn: "Does excess salt, anger, or lack of sleep cause spikes?",
      voicePromptHi: "क्या ज्यादा नमक, गुस्सा या अधूरी नींद से बीपी बढ़ता है?",
      type: "chips",
      options: [
        { id: "worse_salt_pickles_papad", label: "Spikes after salty meals, pickles, or papad", labelHi: "अचार, पापड़ या ज्यादा नमक खाने के बाद बढ़ता है", alertScore: 0 },
        { id: "worse_anger_stress", label: "Worse with emotional stress, anger, or sleeplessness", labelHi: "गुस्सा, तनाव या रात में नींद न आने से बढ़ता है", alertScore: 1 },
        { id: "relieved_antihypertensive", label: "Well controlled when taking prescribed daily tablet", labelHi: "नियमित दवा लेने पर सामान्य रहता है", alertScore: 0 },
        { id: "relieved_deep_breathing", label: "Eases with quiet rest and slow deep breathing", labelHi: "आराम करने और गहरी सांस लेने से घटता है", alertScore: 0 }
      ]
    },
    {
      key: "severity",
      label: "Severity (Latest Blood Pressure Reading)",
      labelHi: "तीव्रता (हालिया बीपी का माप)",
      voicePromptEn: "What was your most recent systolic/diastolic blood pressure reading?",
      voicePromptHi: "हाल ही में नापा गया आपका ब्लड प्रेशर कितना था?",
      type: "scale",
      min: 1,
      max: 10,
      options: [
        { value: 2, label: "Optimal / Normal (< 120/80 mmHg)", labelHi: "सामान्य / उत्तम (< 120/80 mmHg)", alertScore: 0 },
        { value: 5, label: "Stage 1 Hypertension (130-139 / 80-89 mmHg)", labelHi: "स्टेज 1 हाई बीपी (130-139 / 80-89 mmHg)", alertScore: 1 },
        { value: 8, label: "Stage 2 Hypertension (140-179 / 90-119 mmHg)", labelHi: "स्टेज 2 हाई बीपी (140-179 / 90-119 mmHg)", alertScore: 2 },
        { value: 10, label: "Hypertensive Crisis (≥ 180 / ≥ 120 mmHg) — Urgent Care", labelHi: "अति-गंभीर आपातकाल (≥ 180 / ≥ 120 mmHg)", alertScore: 4 }
      ]
    }
  ],

  // 10. General Weakness / Fatigue
  weakness_fatigue: [
    {
      key: "site",
      label: "System / Location (Where do you feel the weakness most?)",
      labelHi: "स्थान (कमजोरी और थकावट का असर शरीर में कहां ज्यादा है?)",
      voicePromptEn: "Do your legs feel like lead, or do you have cognitive brain fog?",
      voicePromptHi: "क्या पैरों में भारीपन है, शरीर में जान नहीं लगती, या सिर में भारीपन?",
      type: "chips",
      options: [
        { id: "generalized_muscular", label: "Generalized Muscular Heaviness (Body feels like lead)", labelHi: "पूरे शरीर में भारीपन / मांसपेशियों में बिल्कुल जान न लगना", alertScore: 1 },
        { id: "lower_limbs_legs", label: "Legs & Calves (Buckling or exhaustion on standing)", labelHi: "पैरों और पिंडलियों में कमजोरी / खड़े होने पर कांपना", alertScore: 1 },
        { id: "cognitive_brain_fog", label: "Cognitive Fatigue, Brain Fog, & Inability to Focus", labelHi: "मानसिक थकान, ध्यान न लगना और सुस्ती (Brain Fog)", alertScore: 0 },
        { id: "postural_dizzy", label: "Head & Eyes (Feeling faint whenever standing up)", labelHi: "खड़े होते ही सिर चकराना और आंखों के आगे अंधेरा", alertScore: 2 }
      ]
    },
    {
      key: "onset",
      label: "Onset (How long have you been feeling this extreme tiredness?)",
      labelHi: "शुरुआत (यह अत्यधिक कमजोरी कब से महसूस हो रही है?)",
      voicePromptEn: "Did it begin after a recent illness or has it been dragging for months?",
      voicePromptHi: "क्या हाल ही में किसी बीमारी के बाद हुई या महीनों से चल रही है?",
      type: "chips",
      options: [
        { id: "post_viral_weeks", label: "Started 1-3 weeks ago after fever or viral illness", labelHi: "1-3 सप्ताह पहले बुखार या वायरल बीमारी के बाद", alertScore: 0 },
        { id: "insidious_months", label: "Slow insidious worsening over 3 to 6 months", labelHi: "3 से 6 महीनों में धीरे-धीरे कमजोरी बढ़ती गई", alertScore: 1 },
        { id: "sudden_acute_drop", label: "Sudden collapse of energy within past 2-3 days", labelHi: "पिछले 2-3 दिनों में अचानक ऊर्जा में भारी गिरावट", alertScore: 2 },
        { id: "chronic_years", label: "Chronic ongoing exhaustion for over a year", labelHi: "एक साल से अधिक समय से पुरानी थकान", alertScore: 1 }
      ]
    },
    {
      key: "character",
      label: "Character (What is the nature of your exhaustion?)",
      labelHi: "प्रकृति (थकान का स्वभाव कैसा है?)",
      voicePromptEn: "Does sleep refresh you, or do you wake up just as exhausted?",
      voicePromptHi: "क्या सोने के बाद भी ताजगी नहीं आती और थके हुए ही उठते हैं?",
      type: "chips",
      options: [
        { id: "unrefreshing_sleep", label: "Unrefreshing sleep; Wake up feeling completely drained", labelHi: "सोने के बाद भी ताजगी नहीं; सुबह उठते ही भारी थकान", alertScore: 1 },
        { id: "post_exertional_crash", label: "Severe crash after even minor walking or housework", labelHi: "थोड़ा सा काम या टहलने के बाद एकदम पस्त हो जाना", alertScore: 2 },
        { id: "breathless_on_stairs", label: "Accompanied by rapid heart pounding and shortness of breath", labelHi: "दिल की धड़कन तेज होना और सांस फूलना (Anemia sign)", alertScore: 2 },
        { id: "sleepy_drowsy", label: "Constant daytime drowsiness and nodding off", labelHi: "दिनभर नींद के झोंके आना और सुस्ती छाई रहना", alertScore: 0 }
      ]
    },
    {
      key: "radiation",
      label: "Distribution (Is there any radiating pain or numbness?)",
      labelHi: "फैलाव (क्या शरीर में कहीं झनझनाहट या दर्द फैलता है?)",
      voicePromptEn: "Do you have numbness in your hands and feet or neck ache?",
      voicePromptHi: "क्या हाथ-पैरों में सुन्नपन या गर्दन में दर्द फैलता है?",
      type: "chips",
      options: [
        { id: "peripheral_numbness", label: "Tingling and numbness in hands and feet (Vitamin B12 alert)", labelHi: "हाथों और पैरों में सुन्नपन व चींटी चलना (B12 कमी)", alertScore: 2 },
        { id: "neck_spine_heaviness", label: "Heavy ache radiating from neck into upper back", labelHi: "गर्दन से पीठ के ऊपरी हिस्से में भारीपन", alertScore: 0 },
        { id: "none", label: "Diffuse weakness without focal radiating pain", labelHi: "पूरे शरीर में सामान्य कमजोरी, कोई विशेष फैलाव नहीं", alertScore: 0 }
      ]
    },
    {
      key: "associations",
      label: "Associated Symptoms (Check for underlying causes)",
      labelHi: "संबंधित लक्षण (कमजोरी के संभावित कारणों की जांच करें)",
      voicePromptEn: "Do you have pale skin, significant hair loss, poor appetite, or black stools?",
      voicePromptHi: "क्या त्वचा में पीलापन, बाल झड़ना, भूख न लगना या काला मल है?",
      type: "multi-chips",
      options: [
        { id: "pallor_pale_conjunctiva", label: "Pale conjunctiva, white nails, and dizziness (Severe Anemia)", labelHi: "आंखों व नाखूनों में पीलापन/सफेदी और चक्कर (खून की कमी)", alertScore: 3 },
        { id: "unintended_weight_loss", label: "Significant unintended weight loss or loss of appetite", labelHi: "बिना कोशिश के तेजी से वजन घटना या भूख न लगना", alertScore: 3 },
        { id: "cold_intolerance_hair", label: "Extreme sensitivity to cold, dry skin, and hair fall (Thyroid)", labelHi: "ज्यादा ठंड लगना, त्वचा रूखी और बाल झड़ना (थायरॉइड)", alertScore: 1 },
        { id: "black_stools_bleeding", label: "History of dark black stools or bleeding hemorrhoids", labelHi: "काला मल या बवासीर से खून बहने का इतिहास", alertScore: 3 },
        { id: "none", label: "No critical systemic red flags", labelHi: "कोई अन्य गंभीर लक्षण नहीं", alertScore: 0 }
      ]
    },
    {
      key: "time_course",
      label: "Time Course (When is your fatigue at its worst?)",
      labelHi: "समय चक्र (थकावट दिनभर में कब सबसे ज्यादा होती है?)",
      voicePromptEn: "Is it worst right upon waking or does it crash in the late afternoon?",
      voicePromptHi: "क्या सुबह उठते ही सबसे ज्यादा होती है या दोपहर बाद?",
      type: "chips",
      options: [
        { id: "worst_on_waking", label: "Hardest to get out of bed in the morning", labelHi: "सुबह बिस्तर से उठने में सबसे ज्यादा भारीपन", alertScore: 1 },
        { id: "afternoon_slump", label: "Major energy crash around 2 to 4 PM", labelHi: "दोपहर 2 से 4 बजे के बीच भारी सुस्ती", alertScore: 0 },
        { id: "constant_drained", label: "Uniformly drained from morning till night", labelHi: "सुबह से रात तक एक जैसी गंभीर कमजोरी", alertScore: 2 },
        { id: "fluctuates_meals", label: "Fluctuates sharply depending on when meals are eaten", labelHi: "खाना खाने या भूखे रहने पर बहुत घटती-बढ़ती है", alertScore: 0 }
      ]
    },
    {
      key: "exacerbating_relieving",
      label: "Exacerbating & Relieving Factors (What affects your energy levels?)",
      labelHi: "प्रभावित करने वाले कारक (किस चीज से ऊर्जा में सुधार या गिरावट होती है?)",
      voicePromptEn: "Does nutritious food or rest help, and does stress cause a crash?",
      voicePromptHi: "क्या पौष्टिक भोजन या आराम से सुधार होता है और तनाव से गिरावट?",
      type: "chips",
      options: [
        { id: "worse_skipped_meals", label: "Worse when skipping meals or drinking too little water", labelHi: "खाना छूटने या कम पानी पीने पर तुरंत चक्कर आना", alertScore: 0 },
        { id: "relieved_iron_fluids", label: "Noticeably better after iron/multivitamin syrup or hydration", labelHi: "ओआरएस, नींबू पानी या विटामिन लेने पर सुधार", alertScore: 0 },
        { id: "worse_standing_up", label: "Dizziness and weakness worse after prolonged standing", labelHi: "ज्यादा देर खड़े रहने पर चक्कर और पैर कांपना", alertScore: 1 },
        { id: "no_relief_rest", label: "Does NOT improve even with 10+ hours of bed rest", labelHi: "10 घंटे सोने के बाद भी कोई आराम नहीं", alertScore: 2 }
      ]
    },
    {
      key: "severity",
      label: "Severity (Impact on daily functional capacity)",
      labelHi: "तीव्रता (दैनिक कार्यों को करने की क्षमता पर प्रभाव)",
      voicePromptEn: "Rate your weakness and inability to do daily chores from 1 to 10.",
      voicePromptHi: "1 से 10 के पैमाने पर अपनी कमजोरी का स्तर बताएं।",
      type: "scale",
      min: 1,
      max: 10,
      options: [
        { value: 2, label: "Mild tiredness; Normal workday possible (1-3)", labelHi: "हल्की थकान; सामान्य काम संभव (1-3)", alertScore: 0 },
        { value: 5, label: "Moderate weakness; Struggle with household chores (4-6)", labelHi: "मध्यम कमजोरी; रोजमर्रा के कामों में कठिनाई (4-6)", alertScore: 1 },
        { value: 8, label: "Severe exhaustion; Limited to bed or couch most of day (7-8)", labelHi: "गंभीर थकावट; दिनभर लेटे रहने की मजबूरी (7-8)", alertScore: 2 },
        { value: 10, label: "Profound debility / Fainting on standing (9-10)", labelHi: "अत्यधिक गंभीर / खड़े होते ही चक्कर खाकर गिरना (9-10)", alertScore: 4 }
      ]
    }
  ]
};

// Helper to return the dedicated SOCRATES question set for a given complaint
export function getSocratesQuestionsForComplaint(complaintId) {
  if (complaintId && COMPLAINT_SOCRATES_MAP[complaintId]) {
    return COMPLAINT_SOCRATES_MAP[complaintId];
  }
  return COMPLAINT_SOCRATES_MAP.chest_pain;
}

// Default export of SOCRATES_QUESTIONS maintains backward compatibility
export const SOCRATES_QUESTIONS = COMPLAINT_SOCRATES_MAP.chest_pain;

// Red Flag Emergency Clinical Rules
export const RED_FLAG_RULES = [
  {
    id: "cardiac_acs",
    title: "Possible Acute Coronary Syndrome (Heart Attack Warning)",
    titleHi: "संभावित हृदय आपातकाल (हार्ट अटैक चेतावनी)",
    criteria: (answers) => {
      const isChestPain = answers.chief_complaint === "chest_pain" || answers.site === "left_chest";
      const hasPressure = answers.character === "heavy_pressure";
      const hasRadiation = answers.radiation === "left_arm_jaw";
      const hasColdSweat = (answers.associations || []).includes("profuse_sweating");
      const hasDyspnea = (answers.associations || []).includes("breathlessness");
      const highSeverity = Number(answers.severity || 0) >= 7;
      
      return isChestPain && ((hasPressure && (hasRadiation || hasColdSweat)) || (hasRadiation && hasDyspnea) || (highSeverity && hasColdSweat));
    },
    urgency: "EMERGENCY_CODE_RED",
    recommendedAction: "Immediate transfer to Emergency Triage Room for ECG, Oxygen & Troponin-I testing."
  },
  {
    id: "stroke_fast",
    title: "FAST Stroke Symptom Alert (Facial drooping / Arm weakness / Slurred speech)",
    titleHi: "स्ट्रोक / लकवा चेतावनी (चेहरे का झुकना, हाथ में कमजोरी, बोलने में कठिनाई)",
    criteria: (answers) => {
      const isNeurological = answers.chief_complaint === "headache" || answers.chief_complaint === "weakness_fatigue";
      const suddenOnset = answers.onset === "sudden_seconds";
      const hasBlackout = (answers.associations || []).includes("dizziness_blackout");
      const text = (answers.free_text || "").toLowerCase();
      const mentionsStroke = text.includes("paralysis") || text.includes("slur") || text.includes("face drooping") || text.includes("stroke");
      return (isNeurological && suddenOnset && hasBlackout) || mentionsStroke;
    },
    urgency: "EMERGENCY_CODE_RED",
    recommendedAction: "Activate Acute Stroke Pathway. Immediate NCCT Brain and Neurologist consultation."
  },
  {
    id: "severe_respiratory_failure",
    title: "Acute Severe Respiratory Distress",
    titleHi: "गंभीर श्वास संकट (सांस फूलना)",
    criteria: (answers) => {
      const isResp = answers.chief_complaint === "cough_breathlessness";
      const hasSevereDyspnea = (answers.associations || []).includes("breathlessness");
      const highSeverity = Number(answers.severity || 0) >= 8;
      const rapidWorse = answers.time_course === "progressively_worse";
      return isResp && hasSevereDyspnea && (highSeverity || rapidWorse);
    },
    urgency: "EMERGENCY_CODE_RED",
    recommendedAction: "Immediate SpO2 pulse oximetry, nebulization, and arterial blood gas evaluation."
  },
  {
    id: "thunderclap_headache",
    title: "Sudden Severe Headache (Possible Subarachnoid Hemorrhage)",
    titleHi: "अचानक सबसे तीव्र सिरदर्द (मस्तिष्क रक्तस्राव की संभावना)",
    criteria: (answers) => {
      const isHeadache = answers.chief_complaint === "headache";
      const sudden = answers.onset === "sudden_seconds";
      const severe = Number(answers.severity || 0) >= 9;
      return isHeadache && sudden && severe;
    },
    urgency: "HIGH_PRIORITY_TRIAGE",
    recommendedAction: "Urgent Neurological assessment and urgent non-contrast CT Head."
  }
];

// Past Medical & Surgical History Options
export const PAST_CONDITIONS = [
  { id: "dm2", label: "Type 2 Diabetes Mellitus", labelHi: "शुगर / डायबिटीज", snomed: "44054006" },
  { id: "htn", label: "High Blood Pressure (Hypertension)", labelHi: "हाई ब्लड प्रेशर (उच्च रक्तचाप)", snomed: "38341003" },
  { id: "cad", label: "Heart Disease / Prior Stent / Angioplasty", labelHi: "हृदय रोग / स्टेंट / एंजियोप्लास्टी", snomed: "53741008" },
  { id: "asthma", label: "Asthma / Bronchial Allergy", labelHi: "दमा / अस्थमा", snomed: "195967001" },
  { id: "thyroid", label: "Thyroid Disorder (Hypo/Hyper)", labelHi: "थायरॉयड की समस्या", snomed: "14304000" },
  { id: "ckd", label: "Kidney Disease / High Creatinine", labelHi: "गुर्दे (किडनी) की बीमारी", snomed: "709044004" },
  { id: "prior_surgery", label: "History of Major Surgery (e.g. Gallbladder, Hernia, C-Section)", labelHi: "पूर्व में कोई बड़ा ऑपरेशन", snomed: "387713003" },
  { id: "none", label: "No prior chronic medical conditions", labelHi: "पहले से कोई पुरानी बीमारी नहीं", snomed: "260413007" }
];

// Personal / Social History & Habits
export const PERSONAL_HISTORY_QUESTIONS = [
  {
    key: "diet",
    label: "Dietary Preference",
    labelHi: "आहार शैली",
    options: [
      { id: "vegetarian", label: "Vegetarian", labelHi: "शाकाहारी" },
      { id: "non_veg", label: "Non-Vegetarian", labelHi: "मांसाहारी" },
      { id: "eggetarian", label: "Eggetarian", labelHi: "अंडाहारी" },
      { id: "jain", label: "Jain Vegetarian (No onion/garlic/root veg)", labelHi: "जैन शाकाहारी" }
    ]
  },
  {
    key: "tobacco",
    label: "Tobacco / Smoking Habit",
    labelHi: "धूम्रपान या तंबाकू",
    options: [
      { id: "none", label: "Non-user / Never", labelHi: "कभी नहीं" },
      { id: "smoker", label: "Cigarette / Bidi smoker", labelHi: "बीड़ी / सिगरेट" },
      { id: "chewing", label: "Smokeless tobacco / Gutkha / Khaini", labelHi: "गुटखा / खैनी / तंबाकू" },
      { id: "former", label: "Quit / Former user", labelHi: "पहले लेते थे, अब छोड़ दिया" }
    ]
  },
  {
    key: "alcohol",
    label: "Alcohol Consumption",
    labelHi: "मद्यपान (शराब)",
    options: [
      { id: "none", label: "Non-drinker / Abstinent", labelHi: "शराब नहीं पीते" },
      { id: "occasional", label: "Occasional / Social", labelHi: "कभी-कभार सामाजिक रूप से" },
      { id: "regular", label: "Regular / Daily consumer", labelHi: "नियमित / प्रतिदिन" }
    ]
  }
];

// Review of Systems (ROS) Quick Screen
export const REVIEW_OF_SYSTEMS = [
  { id: "ros_wt_loss", label: "Unintentional weight loss in last 3 months", labelHi: "पिछले 3 महीनों में अचानक वजन कम होना" },
  { id: "ros_bowel", label: "Recent change in bowel habits (chronic diarrhea / constipation)", labelHi: "शौच की आदत में बदलाव" },
  { id: "ros_urinary", label: "Burning or difficulty during urination", labelHi: "पेशाब में जलन या रुकावट" },
  { id: "ros_sleep", label: "Poor sleep / Insomnia", labelHi: "नींद न आना या बेचैनी" },
  { id: "ros_swelling", label: "Swelling in feet or ankles (Edema)", labelHi: "पैरों या टखनों में सूजन" }
];

// AYUSH / Ayurvedic Dashavidha Pariksha & Ahara-Vihara Ontology
export const AYUSH_ONTOLOGY = {
  prakriti: {
    title: "1. Prakriti Pariksha (Inherent Psychophysical Constitution)",
    titleHi: "१. प्रकृति परीक्षा (शारीरिक एवं मानसिक स्वभाव)",
    options: [
      { id: "vata", label: "Vata Dominant (Thin build, dry skin, quick movements, anxious)", labelHi: "वात प्रधान (दुबला शरीर, शुष्क त्वचा, चंचल मन)" },
      { id: "pitta", label: "Pitta Dominant (Medium build, warm body, sharp appetite, short temper)", labelHi: "पित्त प्रधान (मध्यम शरीर, तीव्र भूख, उष्णता, तीक्ष्ण स्वभाव)" },
      { id: "kapha", label: "Kapha Dominant (Sturdy build, oily smooth skin, calm, steady)", labelHi: "कफ प्रधान (मजबूत शरीर, स्निग्ध त्वचा, शांत व धैर्यवान)" },
      { id: "vata_pitta", label: "Vata-Pitta Dwandwaja (Dual constitution)", labelHi: "वात-पित्त द्वंद्वज" },
      { id: "pitta_kapha", label: "Pitta-Kapha Dwandwaja", labelHi: "पित्त-कफ द्वंद्वज" },
      { id: "sama", label: "Samadoshaja (Equally balanced)", labelHi: "समदोषज (संतुलित)" }
    ]
  },
  vikriti: {
    title: "2. Vikriti Pariksha (Current Doshic Imbalance)",
    titleHi: "२. विकृति परीक्षा (वर्तमान दोष असंतुलन)",
    options: [
      { id: "vata_vriddhi", label: "Vata Dushti (Joint aches, dryness, constipation, sleep disturbance)", labelHi: "वात दृष्टि (जोड़ों में दर्द, कब्ज, अनिद्रा)" },
      { id: "pitta_vriddhi", label: "Pitta Dushti (Hyperacidity, burning sensation, skin flares, irritability)", labelHi: "पित्त दृष्टि (अम्लपित्त/एसिडिटी, दाह, त्वचा रोग)" },
      { id: "kapha_vriddhi", label: "Kapha Dushti (Heavy head, sluggish digestion, excess mucus, lethargy)", labelHi: "कफ दृष्टि (भारीपन, मंदाग्नि, कफ, आलस्य)" },
      { id: "ama_samsrishta", label: "Samadosha / Ama Presence (Coated tongue, heaviness, body ache)", labelHi: "साम दोष / आम संसर्ग (जीभ पर मैल, भारीपन)" }
    ]
  },
  sara: {
    title: "3. Sara Pariksha (Tissue Excellence / Dhatu Essence)",
    titleHi: "३. सार परीक्षा (धातु बल)",
    options: [
      { id: "pravara_sara", label: "Pravara Sara (Strong constitutional immunity & tissue vitality)", labelHi: "प्रवर सार (उत्तम बल एवं ओज)" },
      { id: "madhyama_sara", label: "Madhyama Sara (Moderate strength)", labelHi: "मध्यम सार" },
      { id: "avara_sara", label: "Avara Sara (Low vitality, prone to frequent illness)", labelHi: "अवर सार (अल्प बल, शीघ्र रोगग्रस्त)" }
    ]
  },
  aharaShakti: {
    title: "4. Ahara Shakti & Agni (Digestive Capacity & Metabolic Fire)",
    titleHi: "४. आहार शक्ति एवं अग्नि (पाचन क्षमता)",
    options: [
      { id: "samagni", label: "Samagni (Balanced appetite & smooth digestion)", labelHi: "समाग्नि (संतुलित भूख व पाचन)" },
      { id: "vishmagni", label: "Vishamagni (Erratic, gas/bloating, Vata type)", labelHi: "विषमाग्नि (अनियमित, गैस/अफारा)" },
      { id: "teekshnagni", label: "Teekshnagni (Excessive hunger, acid burning, Pitta type)", labelHi: "तीक्ष्णाग्नि (अत्यधिक भूख, जलन/खट्टी डकार)" },
      { id: "mandagni", label: "Mandagni (Sluggish, heavy post-meal feeling, Kapha type)", labelHi: "मंदाग्नि (धीमा पाचन, भोजन के बाद भारीपन)" }
    ]
  },
  vyayamaShakti: {
    title: "5. Vyayama Shakti (Physical Endurance / Exercise Capacity)",
    titleHi: "५. व्यायाम शक्ति (शारीरिक सहनशीलता)",
    options: [
      { id: "high", label: "Pravara (High stamina, handles heavy physical exertion easily)", labelHi: "प्रवर (उत्कृष्ट सहनशीलता)" },
      { id: "moderate", label: "Madhyama (Moderate physical endurance)", labelHi: "मध्यम (सामान्य सहनशक्ति)" },
      { id: "low", label: "Avara (Tires quickly with minimal movement)", labelHi: "अवर (जल्दी थक जाना)" }
    ]
  },
  aharaVihara: {
    title: "6. Ahara-Vihara Assessment (Dietary & Daily Lifestyle Regimen)",
    titleHi: "६. आहार-विहार मूल्यांकन (दिनचर्या व खानपान)",
    options: [
      { id: "irregular_timing", label: "Irregular meal timings (Vishamashana)", labelHi: "अनियमित भोजन समय (विषमाशन)" },
      { id: "excess_deep_fried", label: "Excess spicy / pungent / deep-fried foods (Vidahi Ahara)", labelHi: "अत्यधिक तला-भुना व तीखा (विदाही आहार)" },
      { id: "night_staying_awake", label: "Late-night screen time / staying awake (Ratri Jagarana)", labelHi: "देर रात तक जागना (रात्रि जागरण)" },
      { id: "daytime_sleep", label: "Daytime sleeping after meals (Divaswapna)", labelHi: "दिन में सोना (दिवास्वप्न)" },
      { id: "balanced_regimen", label: "Maintains healthy Dinacharya & seasonal Ritucharya", labelHi: "संतुलित दिनचर्या व ऋतुचर्या" }
    ]
  }
};

/**
 * Evaluates current intake answers against all red-flag clinical rules.
 * @param {Object} answers - current structured patient answers
 * @returns {Array} List of triggered red flag objects
 */
export function evaluateRedFlags(answers) {
  const triggered = [];
  for (const rule of RED_FLAG_RULES) {
    try {
      if (rule.criteria(answers)) {
        triggered.push(rule);
      }
    } catch (e) {
      console.warn("Red flag evaluation failed for rule:", rule.id, e);
    }
  }
  return triggered;
}

/**
 * Evaluates patient-reported AYUSH responses and computes a transparent,
 * explainable doshic scoring profile.
 * All outputs are explicitly flagged as "Preliminary Assessment (Patient-Reported · Clinician Confirmation Required)".
 */
export function evaluateAyushAssessment(ayushAnswers) {
  if (!ayushAnswers) {
    return {
      assessed: false,
      disclaimer: "No AYUSH assessment completed.",
      statusText: "Not assessed"
    };
  }

  const answeredFields = Object.entries(ayushAnswers).filter(([_, val]) => val && val !== "not_assessed");
  if (answeredFields.length === 0) {
    return {
      assessed: false,
      disclaimer: "No AYUSH assessment completed by patient or clinician.",
      statusText: "Not assessed"
    };
  }

  const scores = { vata: 0, pitta: 0, kapha: 0 };
  const rationale = [];

  if (ayushAnswers.prakriti === "vata") { scores.vata += 3; rationale.push("Thin build / dry skin / quick movements"); }
  else if (ayushAnswers.prakriti === "pitta") { scores.pitta += 3; rationale.push("Medium build / warm body / sharp appetite"); }
  else if (ayushAnswers.prakriti === "kapha") { scores.kapha += 3; rationale.push("Sturdy build / smooth skin / calm disposition"); }
  else if (ayushAnswers.prakriti === "vata_pitta") { scores.vata += 2; scores.pitta += 2; rationale.push("Dual Vata-Pitta constitutional traits"); }
  else if (ayushAnswers.prakriti === "pitta_kapha") { scores.pitta += 2; scores.kapha += 2; rationale.push("Dual Pitta-Kapha constitutional traits"); }
  else if (ayushAnswers.prakriti === "sama") { scores.vata += 1; scores.pitta += 1; scores.kapha += 1; rationale.push("Equally balanced tri-doshic traits"); }

  if (ayushAnswers.vikriti === "vata_vriddhi") { scores.vata += 3; rationale.push("Joint discomfort / dryness / sleep irregularity"); }
  else if (ayushAnswers.vikriti === "pitta_vriddhi") { scores.pitta += 3; rationale.push("Burning sensation / hyperacidity / irritability"); }
  else if (ayushAnswers.vikriti === "kapha_vriddhi") { scores.kapha += 3; rationale.push("Sluggish digestion / heaviness / excess mucus"); }
  else if (ayushAnswers.vikriti === "ama_samsrishta") { scores.vata += 1; scores.kapha += 2; rationale.push("Ama / metabolic sluggishness signs"); }

  if (ayushAnswers.aharaShakti === "vishmagni") { scores.vata += 2; rationale.push("Erratic appetite / bloating"); }
  else if (ayushAnswers.aharaShakti === "teekshnagni") { scores.pitta += 2; rationale.push("Excess hunger / acid burn"); }
  else if (ayushAnswers.aharaShakti === "mandagni") { scores.kapha += 2; rationale.push("Heavy post-meal fullness"); }
  else if (ayushAnswers.aharaShakti === "samagni") { rationale.push("Balanced metabolic fire"); }

  if (ayushAnswers.aharaVihara === "irregular_timing") { scores.vata += 1; }
  else if (ayushAnswers.aharaVihara === "excess_deep_fried") { scores.pitta += 2; }
  else if (ayushAnswers.aharaVihara === "daytime_sleep") { scores.kapha += 2; }
  else if (ayushAnswers.aharaVihara === "night_staying_awake") { scores.vata += 2; }

  const total = scores.vata + scores.pitta + scores.kapha;
  let dominantDosha = "Balanced";
  let confidence = "Low";

  if (total > 0) {
    const maxScore = Math.max(scores.vata, scores.pitta, scores.kapha);
    const dominantList = Object.keys(scores).filter(k => scores[k] === maxScore);
    if (dominantList.length === 1) {
      dominantDosha = `${dominantList[0].charAt(0).toUpperCase() + dominantList[0].slice(1)} Dominant`;
      confidence = maxScore >= 5 ? "High (Clear Pattern)" : "Moderate";
    } else if (dominantList.length === 2) {
      dominantDosha = `${dominantList.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join("-")} Dual`;
      confidence = "Moderate";
    } else {
      dominantDosha = "Tri-Doshic Balanced";
      confidence = "Moderate";
    }
  }

  return {
    assessed: true,
    dominantDosha,
    confidence,
    scores,
    rationale,
    disclaimer: "Preliminary AYUSH Assessment — Patient-reported rule-based estimate. Subject to formal clinical evaluation by an Ayurvedic practitioner.",
    fields: {
      prakriti: ayushAnswers.prakriti || "Not assessed",
      vikriti: ayushAnswers.vikriti || "Not assessed",
      sara: ayushAnswers.sara || "Not assessed",
      aharaShakti: ayushAnswers.aharaShakti || "Not assessed",
      vyayamaShakti: ayushAnswers.vyayamaShakti || "Not assessed",
      aharaVihara: ayushAnswers.aharaVihara || "Not assessed"
    }
  };
}

/**
 * Generates a localized voice prompt when a chief complaint is selected.
 * Supports all 6 CarePath languages: en, hi, bn, mr, te, ta.
 */
export function getLocalizedComplaintVoicePrompt(item, langCode = "en-IN") {
  if (!item) return "Please select your symptoms.";
  const lang = String(langCode).toLowerCase().slice(0, 2);

  switch (lang) {
    case "hi":
      return `चयनित: ${item.labelHi || item.label}। कृपया विवरण चुनें।`;
    case "bn":
      return `নির্বাচিত: ${item.labelBn || item.label}। দয়া করে লক্ষণের বিবরণ দিন।`;
    case "mr":
      return `निवडले: ${item.labelMr || item.label}। कृपया तपशील निवडा.`;
    case "te":
      return `ఎంచుకోబడింది: ${item.labelTe || item.label}। దయచేసి వివరాలను ఎంచుకోండి.`;
    case "ta":
      return `தேர்ந்தெடுக்கப்பட்டது: ${item.labelTa || item.label}। தயவுசெய்து அறிகுறிகளைத் தேர்ந்தெடுக்கவும்.`;
    case "en":
    default:
      return `Selected: ${item.label}. Please provide symptom details.`;
  }
}

/**
 * Generates a localized summary voice prompt for the active chief complaint & severity.
 * Supports all 6 CarePath languages: en, hi, bn, mr, te, ta.
 */
export function getLocalizedSummaryVoicePrompt(selectedComplaint, severity = 5, langCode = "en-IN") {
  const lang = String(langCode).toLowerCase().slice(0, 2);

  if (!selectedComplaint) {
    switch (lang) {
      case "hi":
        return "कृपया अपने लक्षण चुनें या बोलने के लिए माइक्रोफ़ोन दबाएं।";
      case "bn":
        return "দয়া করে আপনার লক্ষণ নির্বাচন করুন অথবা কথা বলতে মাইক্রোফোনে স্পর্শ করুন।";
      case "mr":
        return "कृपया आपली लक्षणे निवडा किंवा बोलण्यासाठी मायक्रोफोन दाबा.";
      case "te":
        return "దయచేసి మీ లక్షణాలను ఎంచుకోండి లేదా మాట్లాడటానికి మైక్రోఫోన్‌ను నొక్కండి.";
      case "ta":
        return "தயவுசெய்து உங்கள் அறிகுறிகளைத் தேர்ந்தெடுக்கவும் அல்லது பேச மைக்ரோஃபோனைத் தட்டவும்.";
      case "en":
      default:
        return "Please select your symptoms or tap the microphone to speak.";
    }
  }

  switch (lang) {
    case "hi":
      return `मुख्य समस्या: ${selectedComplaint.labelHi || selectedComplaint.label}। गंभीरता स्तर: 10 में से ${severity}।`;
    case "bn":
      return `প্রধান সমস্যা: ${selectedComplaint.labelBn || selectedComplaint.label}। তীব্রতার মাত্রা: 10 এর মধ্যে ${severity}।`;
    case "mr":
      return `मुख्य तक्रार: ${selectedComplaint.labelMr || selectedComplaint.label}। तीव्रतेचे प्रमाण: 10 पैकी ${severity}।`;
    case "te":
      return `ప్రధాన సమస్య: ${selectedComplaint.labelTe || selectedComplaint.label}। తీవ్రత రేటింగ్: 10 లో ${severity}।`;
    case "ta":
      return `முக்கிய பிரச்சனை: ${selectedComplaint.labelTa || selectedComplaint.label}। தீவிரத்தன்மை: 10 இல் ${severity}।`;
    case "en":
    default:
      return `Chief complaint: ${selectedComplaint.label}. Severity rating: ${severity} out of 10.`;
  }
}

/**
 * Generates a localized voice prompt for an active SOCRATES question card.
 * Supports all 6 CarePath languages: en, hi, bn, mr, te, ta.
 */
export function getLocalizedQuestionVoicePrompt(currentQ, langCode = "en-IN") {
  if (!currentQ) return "";
  const lang = String(langCode).toLowerCase().slice(0, 2);

  switch (lang) {
    case "hi":
      return currentQ.voicePromptHi || currentQ.labelHi || currentQ.label;
    case "bn":
      return currentQ.voicePromptBn || currentQ.labelBn || currentQ.voicePromptHi || currentQ.label;
    case "mr":
      return currentQ.voicePromptMr || currentQ.labelMr || currentQ.voicePromptHi || currentQ.label;
    case "te":
      return currentQ.voicePromptTe || currentQ.labelTe || currentQ.voicePromptHi || currentQ.label;
    case "ta":
      return currentQ.voicePromptTa || currentQ.labelTa || currentQ.voicePromptHi || currentQ.label;
    case "en":
    default:
      return currentQ.voicePromptEn || currentQ.label;
  }
}


