/**
 * CarePath Classical AYUSH & Ayurvedic Clinical Diagnostics Ontology
 * Grounded in Charaka Samhita, Sushruta Samhita, and Ashtanga Hridaya.
 * Standardized for SIH Healthcare interoperability and classical practitioner consultation.
 */

// 1. Prakriti Assessment (Constitutional Inherent Traits)
export const PRAKRITI_QUESTIONS = [
  {
    id: "body_frame",
    label: "Body Frame & Physical Build (Sharira Rachana)",
    labelHi: "शारीरिक संरचना एवं कद-काठी",
    labelBn: "শারীরিক গঠন ও কাঠামো (শরীর রচনা)",
    labelMr: "शारीरिक रचना आणि बांधा",
    labelTe: "శరీర నిర్మాణం మరియు ఆకృతి",
    labelTa: "உடல் அமைப்பு மற்றும் கட்டமைப்பு",
    options: [
      {
        id: "thin_light",
        label: "Thin, lean, prominent veins and joints; difficulty gaining weight",
        labelHi: "दुबला-पतला, उभरी हुई नसें/हड्डियां, वजन बढ़ना मुश्किल",
        labelBn: "পাতলা ও রোগা, শির বা অস্থি স্পষ্ট, ওজন বৃদ্ধি কঠিন",
        labelMr: "बारीक, हाडकुळा, शिरा आणि सांधे स्पष्ट दिसणारे, वजन न वाढणे",
        labelTe: "సన్నని శరీరం, ఉబ్బిన నరాలు/కీళ్లు, బరువు పెరగడం కష్టం",
        labelTa: "மெலிந்த உடல், எலும்புகள்/நரம்புகள் தெரியும், எடை கூடுவதில் சிரமம்",
        dosha: "vata",
        points: 3
      },
      {
        id: "medium_muscular",
        label: "Medium build, proportionate musculature, moderate weight",
        labelHi: "मध्यम ढांचा, संतुलित मांसपेशियां, मध्यम वजन",
        labelBn: "মাঝারি গড়ন, সুগঠিত পেশী, মাঝারি ওজন",
        labelMr: "मध्यम बांधा, प्रमाणशीर स्नायू, मध्यम वजन",
        labelTe: "మధ్యస్థ శరీరం, చక్కని కండరాలు, మితమైన బరువు",
        labelTa: "நடுத்தர உடல்வாகு, சீரான தசை வளர்ச்சி, நடுத்தர எடை",
        dosha: "pitta",
        points: 3
      },
      {
        id: "broad_heavy",
        label: "Broad chest, solid dense bones, tendency to gain weight easily",
        labelHi: "चौड़ा सीना, भारी मजबूत हड्डियां, वजन तेजी से बढ़ता है",
        labelBn: "চওড়া বুক, ভারী মজবুত হাড়, সহজেই ওজন বাড়ে",
        labelMr: "रुंद छाती, बळकट हाडे, सहज वजन वाढण्याची प्रवृत्ती",
        labelTe: "వెడల్పాటి ఛాతీ, బలమైన ఎముకలు, సులభంగా బరువు పెరిగే శరీరం",
        labelTa: "அகன்ற மார்பு, வலுவான எலும்புகள், எளிதில் எடை கூடும்",
        dosha: "kapha",
        points: 3
      }
    ]
  },
  {
    id: "skin_complexion",
    label: "Skin Texture & Temperature (Twak Pariksha)",
    labelHi: "त्वचा की बनावट और तापमान",
    labelBn: "ত্বকের প্রকৃতি ও তাপমাত্রা (ত্বক পরীক্ষা)",
    labelMr: "त्वचेची रचना आणि तापमान",
    labelTe: "చర్మ స్వభావం మరియు ఉష్ణోగ్రత",
    labelTa: "தோல் அமைப்பு மற்றும் வெப்பநிலை",
    options: [
      {
        id: "dry_rough_cool",
        label: "Dry, rough, thin, cracks easily in cold weather, cool to touch",
        labelHi: "रूखी, खुरदरी, ठंडी, सर्दियों में फटने वाली त्वचा",
        labelBn: "শুষ্ক, খসখসে, পাতলা, ঠান্ডায় ফাটার প্রবণতা",
        labelMr: "कोरडी, खडबडीत, थंड, थंडीत सहज तडकणारी त्वचा",
        labelTe: "పొడి, గరుకు, చల్లని, చలికాలంలో పగిలే చర్మం",
        labelTa: "வறண்ட, சொரசொரப்பான, குளிர்ச்சியான, குளிரில் வெடிக்கும் தோல்",
        dosha: "vata",
        points: 3
      },
      {
        id: "warm_sensitive_freckles",
        label: "Warm, reddish/pinkish undertone, moles/freckles, prone to acne/rashes",
        labelHi: "गर्म, गुलाबी आभा, तिल/मुंहासे या जलन की प्रवृत्ति",
        labelBn: "উষ্ণ, লালচে আভা, তিল/ব্রণ বা জ্বালাভাবের প্রবণতা",
        labelMr: "उबदार, लालसर, तीळ/पुरळ किंवा जळजळीची प्रवृत्ती",
        labelTe: "వెచ్చని, ఎర్రటి రంగు, మచ్చలు లేదా మొటిమలు వచ్చే చర్మం",
        labelTa: "வெதுவெதுப்பான, சிவந்த நிறம், மச்சம்/பருக்கள் வரக்கூடிய தோல்",
        dosha: "pitta",
        points: 3
      },
      {
        id: "thick_oily_smooth",
        label: "Thick, lustrous, smooth, oily/cool, glowing complexion",
        labelHi: "चिकनी, चमकदार, मोटी, तैलीय और कोमल त्वचा",
        labelBn: "মসৃণ, উজ্জ্বল, ভারী, তৈলাক্ত ও কোমল ত্বক",
        labelMr: "मऊ, चमकदार, जाड, तेलकट आणि सतेज त्वचा",
        labelTe: "మందపాటి, మెరిసే, నునుపైన, జిడ్డుగల చర్మం",
        labelTa: "பளபளப்பான, மென்மையான, எண்ணெய் பசை கொண்ட மிருதுவான தோல்",
        dosha: "kapha",
        points: 3
      }
    ]
  },
  {
    id: "hair_nature",
    label: "Hair Characteristics (Kesha Swabhava)",
    labelHi: "बालों की प्रकृति",
    labelBn: "চুলের ধরন ও বৈশিষ্ট্য",
    labelMr: "केसांचे स्वरूप आणि प्रकार",
    labelTe: "జుట్టు స్వభావం మరియు లక్షణాలు",
    labelTa: "கூந்தலின் தன்மை",
    options: [
      {
        id: "dry_brittle_curly",
        label: "Dry, brittle, coarse, split ends, dull or scanty",
        labelHi: "रूखे, बेजान, दोमुंहे, घुंघराले या हल्के बाल",
        labelBn: "শুষ্ক, ভঙ্গুর, কোঁকড়ানো বা পাতলা চুল",
        labelMr: "कोरडे, रुक्ष, फाटे फुटणारे, कुरळे किंवा विरळ केस",
        labelTe: "పొడి, చిట్లిపోయే, గిరజాల లేదా పలుచని జుట్టు",
        labelTa: "வறண்ட, நுனி பிளவுபட்ட, சுருள் அல்லது மெல்லிய கூந்தல்",
        dosha: "vata",
        points: 2
      },
      {
        id: "fine_straight_premature_gray",
        label: "Fine, soft, straight, tendency toward early graying or thinning",
        labelHi: "बारीक, सीधे, समय से पहले सफेद होने या झड़ने की प्रवृत्ति",
        labelBn: "মিহি, সোজা, অকালে পাকার বা ঝরে পড়ার প্রবণতা",
        labelMr: "बारीक, सरळ, अकाली पांढरे होणारे किंवा गळणारे केस",
        labelTe: "సన్నని, నిటారైన, త్వరగా నెరిసిపోయే లేదా రాలే జుట్టు",
        labelTa: "மென்மையான, நேரான, இளநரை அல்லது முடி கொட்டும் தன்மை",
        dosha: "pitta",
        points: 2
      },
      {
        id: "thick_wavy_dark",
        label: "Thick, abundant, oily, wavy, jet-black/dark and lustrous",
        labelHi: "घने, मजबूत, लहरदार, काले और तैलीय बाल",
        labelBn: "ঘন, মজবুত, ঢেউখেলানো, কালো ও উজ্জ্বল চুল",
        labelMr: "दाट, बळकट, लाटांसारखे, काळेभोर आणि चमकदार केस",
        labelTe: "దట్టమైన, బలమైన, ఉంగరాల, నల్లటి మరియు మెరిసే జుట్టు",
        labelTa: "அடர்த்தியான, வலிமையான, அலை அலையான, கருமையான கூந்தல்",
        dosha: "kapha",
        points: 2
      }
    ]
  },
  {
    id: "sleep_pattern",
    label: "Sleep Characteristics (Nidra Swabhava)",
    labelHi: "नींद की प्रकृति",
    labelBn: "ঘুমের প্রকৃতি ও অভ্যাস",
    labelMr: "झोपेचे स्वरूप आणि सवय",
    labelTe: "నిద్ర స్వభావం",
    labelTa: "தூக்கத்தின் தன்மை",
    options: [
      {
        id: "light_interrupted_vivid",
        label: "Light, easily awakened by slight sound, vivid dreams of flying/running",
        labelHi: "हल्की नींद, जरा सी आवाज पर टूटना, उड़ने/दौड़ने के सपने",
        labelBn: "হালকা ঘুম, সামান্য শব্দেই ভেঙে যাওয়া, ওড়া বা দৌড়ানোর স্বপ্ন",
        labelMr: "अतिशय हलकी झोप, आवाजाने लगेच जागी होणे, धावण्याची स्वप्ने",
        labelTe: "తేలికపాటి నిద్ర, చిన్న శబ్దానికే మెలకువ, ఎగిరే లేదా పరిగెత్తే కలలు",
        labelTa: "லேசான தூக்கம், சத்தத்திற்கு உடனே விழிப்பது, பறக்கும்/ஓடும் கனவுகள்",
        dosha: "vata",
        points: 3
      },
      {
        id: "moderate_intense_colorful",
        label: "Moderate (6-7 hrs), warm upon waking, intense or fiery dreams",
        labelHi: "मध्यम नींद (6-7 घंटे), जागने पर गर्मी, रंगीन/रोमांचक सपने",
        labelBn: "পরিমিত ঘুম (৬-৭ ঘণ্টা), জাগলে গরম লাগা, রঙিন ও রোমাঞ্চকর স্বপ্ন",
        labelMr: "मध्यम झोप (६-७ तास), जाग आल्यावर उष्णता, रंगीबेरंगी स्वप्ने",
        labelTe: "మితమైన నిద్ర (6-7 గంటలు), లేవగానే వేడి, రంగురంగుల కలలు",
        labelTa: "மிதமான தூக்கம் (6-7 மணி நேரம்), விழிக்கும்போது உடல் சூடு, தெளிவான கனவுகள்",
        dosha: "pitta",
        points: 3
      },
      {
        id: "deep_heavy_prolonged",
        label: "Deep, undisturbed, heavy, difficult to wake in the morning (8+ hrs)",
        labelHi: "गहरी, भारी नींद, सुबह उठने में भारी आलस्य (8+ घंटे)",
        labelBn: "গভীর ও ভারী ঘুম, সকালে উঠতে অনিচ্ছা ও আলস্য (৮+ ঘণ্টা)",
        labelMr: "गाढ, जड झोप, सकाळी उठताना खूप आळस (८+ तास)",
        labelTe: "గాఢమైన నిద్ర, ఉదయం లేవడానికి తీవ్ర బద్ధకం (8+ గంటలు)",
        labelTa: "ஆழ்ந்த கனத்த தூக்கம், காலையில் எழுவதில் மிகுந்த சோம்பல் (8+ மணி நேரம்)",
        dosha: "kapha",
        points: 3
      }
    ]
  },
  {
    id: "mental_temperament",
    label: "Mental Temperament & Learning Pace (Manasa Prakriti)",
    labelHi: "मानसिक स्वभाव एवं स्मरण क्षमता",
    labelBn: "মানসিক মেজাজ ও শেখার গতি",
    labelMr: "मानसिक स्वभाव आणि आकलन क्षमता",
    labelTe: "మానసిక స్వభావం మరియు జ్ఞాపకశక్తి",
    labelTa: "மனோபாவம் மற்றும் கற்கும் திறன்",
    options: [
      {
        id: "quick_grasp_quick_forget",
        label: "Quick to learn and grasp concepts, but forgets quickly; creative & restless",
        labelHi: "जल्दी सीखने वाले किंतु जल्दी भूलने वाले; कल्पनाशील व चंचल",
        labelBn: "দ্রুত বোঝেন কিন্তু দ্রুত ভুলে যান; কল্পনাপ্রবণ ও চঞ্চল",
        labelMr: "लवकर आकलन पण लवकर विसरणे; कल्पक व चंचल",
        labelTe: "త్వరగా నేర్చుకుంటారు కానీ త్వరగా మర్చిపోతారు; చంచల మనస్సు",
        labelTa: "விரைவில் புரிந்துகொள்ளுதல் ஆனால் எளிதில் மறப்பது; கற்பனை & அமைதியின்மை",
        dosha: "vata",
        points: 3
      },
      {
        id: "sharp_focused_critical",
        label: "Sharp intellect, highly focused, analytical, perfectionist, decisive",
        labelHi: "तीक्ष्ण बुद्धि, एकाग्र, विश्लेषणात्मक, नेतृत्व क्षमता, आलोचनात्मक",
        labelBn: "তীক্ষ্ণ বুদ্ধি, মনোযোগী, বিশ্লেষণী, নেতৃত্ব দিতে দক্ষ",
        labelMr: "कुशाग्र बुद्धिमत्ता, एकाग्र, विश्लेषक, निर्णयक्षम",
        labelTe: "చురుకైన బుద్ధి, ఏకాగ్రత, విశ్లేషణాత్మక శక్తి",
        labelTa: "கூர்மையான புத்தி, ஆழ்ந்த கவனம், பகுப்பாய்வு திறன்",
        dosha: "pitta",
        points: 3
      },
      {
        id: "steady_calm_methodical",
        label: "Calm, steady, learns after multiple iterations but retains permanently",
        labelHi: "शांत, स्थिर, धीमे सीखने वाले लेकिन जीवनभर याद रखने वाले",
        labelBn: "শান্ত, ধীরস্থির, দেরিতে শিখলেও সারাজীবন মনে রাখেন",
        labelMr: "शांत, स्थिर, हळूहळू शिकणारे पण कायम लक्षात ठेवणारे",
        labelTe: "ప్రశాంతం, స్థిరమైన మనస్సు, నెమ్మదిగా నేర్చుకున్నా చిరకాలం గుర్తింపు",
        labelTa: "அமைதியான, நிதானமான, மெதுவாக கற்றாலும் நீண்ட காலம் நினைவில் வைப்பது",
        dosha: "kapha",
        points: 3
      }
    ]
  },
  {
    id: "weather_sensitivity",
    label: "Seasonal & Weather Sensitivity (Ritu Satmya)",
    labelHi: "मौसम एवं ऋतु सहनशीलता",
    labelBn: "আবহাওয়া ও ঋতু সংবেদনশীলতা",
    labelMr: "हवामान आणि ऋतू संवेदनशीलता",
    labelTe: "వాతావరణం మరియు రుతువుల ప్రభావం",
    labelTa: "பருவநிலை மற்றும் வானிலை உணர்திறன்",
    options: [
      {
        id: "intolerant_cold_wind",
        label: "Dislikes cold, dry windy weather; loves warmth and sun",
        labelHi: "ठंड और सूखी हवा बिल्कुल सहन नहीं; गर्मी और धूप पसंद",
        labelBn: "ঠান্ডা ও শুষ্ক বাতাস অপছন্দ; উষ্ণতা ও রোদ পছন্দ",
        labelMr: "थंडी आणि कोरडी हवा सहन होत नाही; उष्णता आणि ऊन आवडते",
        labelTe: "చలి మరియు పొడి గాలులు పడవు; వెచ్చదనం మరియు ఎండ ఇష్టం",
        labelTa: "குளிர் மற்றும் வறண்ட காற்று பிடிக்காது; வெதுவெதுப்பு & வெயில் பிடிக்கும்",
        dosha: "vata",
        points: 2
      },
      {
        id: "intolerant_heat_sun",
        label: "Dislikes direct sun, humidity and heat; craves cool breeze and drinks",
        labelHi: "तेज धूप और गर्मी सहन नहीं; ठंडक और ठंडे पेय पसंद",
        labelBn: "তীব্র রোদ ও গরম সহ্য হয় না; শীতল বাতাস ও ঠান্ডা পানীয় পছন্দ",
        labelMr: "कडक ऊन आणि उष्णता सहन होत नाही; गारवा आणि थंड पेये आवडतात",
        labelTe: "తీవ్రమైన ఎండ మరియు వేడి పడదు; చల్లదనం మరియు చల్లని పానీయాలు ఇష్టం",
        labelTa: "அதிக வெயில் மற்றும் வெப்பம் தாங்காது; குளிர்ச்சியான சூழல் பிடிக்கும்",
        dosha: "pitta",
        points: 2
      },
      {
        id: "intolerant_damp_monsoon",
        label: "Dislikes damp cold, rainy seasons, and sedentary winter days",
        labelHi: "सीलन, उमस और बरसात में सुस्ती; गर्म सूखा मौसम पसंद",
        labelBn: "স্যাঁতসেঁতে ভাব, বৃষ্টি ও বর্ষায় অলসতা; শুষ্ক আবহাওয়া পছন্দ",
        labelMr: "दमटपणा, पावसाळा आणि दमट थंडी आवडत नाही; कोरडे हवामान आवडते",
        labelTe: "తేమ, వర్షకాలం మరియు చలి పడదు; పొడి వాతావరణం ఇష్టం",
        labelTa: "ஈரப்பதம் மற்றும் மழைக்காலம் பிடிக்காது; வறண்ட வானிலை பிடிக்கும்",
        dosha: "kapha",
        points: 2
      }
    ]
  }
];

// 2. Vikriti Assessment (Current Doshic Imbalance Signs & Symptoms)
export const VIKRITI_SYMPTOMS = [
  // Vata Imbalance Signs
  {
    id: "vata_joint_cracking",
    label: "Joint stiffness, cracking sounds (crepitus), or wandering body aches",
    labelHi: "जोड़ों में अकड़न, कट-कट की आवाज या चलता-फिरता दर्द",
    labelBn: "গাঁটে শক্তভাব, মটমট শব্দ বা শরীরে ঘুরে বেড়ানো ব্যথা",
    labelMr: "सांध्यांमध्ये ताठरपणा, कट-कट आवाज किंवा अंगात फिरणारे दुखणे",
    labelTe: "కీళ్ల బిగుతు, శబ్దాలు లేదా శరీరం అంతటా తిరిగే నొప్పులు",
    labelTa: "மூட்டு இறுக்கம், சொடக்கு சத்தம் அல்லது உடல் வலி",
    dosha: "vata",
    severityScore: 2
  },
  {
    id: "vata_constipation_bloating",
    label: "Dry hard stools, irregular bowel movements, gas and abdominal bloating",
    labelHi: "कड़ा सूखा मल, कब्ज, पेट में गैस और अफारा",
    labelBn: "শক্ত মল, কোষ্ঠকাঠিন্য, পেটে গ্যাস ও পেট ফাঁপা",
    labelMr: "कडक कोरडे शौच, बद्धकोष्ठता, गॅस आणि पोट फुगणे",
    labelTe: "పొడి గట్టి మలం, మలబద్ధకం, గ్యాస్ మరియు కడుపు ఉబ్బరం",
    labelTa: "கடினமான மலம், மலச்சிக்கல், வாயு மற்றும் வயிற்று உப்புசம்",
    dosha: "vata",
    severityScore: 2
  },
  {
    id: "vata_anxiety_racing_mind",
    label: "Anxious thoughts, restlessness, racing mind, difficulty falling asleep",
    labelHi: "बेचैनी, घबराहट, दिमाग में लगातार विचार चलना, अनिद्रा",
    labelBn: "উদ্বেগ, অস্থিরতা, মাথায় অতিরিক্ত চিন্তা, অনিদ্রা",
    labelMr: "अस्वस्थता, भीती, डोक्यात सतत विचार चालणे, झोप न येणे",
    labelTe: "ఆందోళన, చంచలత్వం, మనస్సులో నిరంతరం ఆలోచనలు, నిద్రలేమి",
    labelTa: "பதட்டம், அமைதியின்மை, எண்ணங்கள் ஓட்டம், தூக்கமின்மை",
    dosha: "vata",
    severityScore: 3
  },
  {
    id: "vata_extreme_dryness",
    label: "Rough flaky skin, chapped lips, dry mouth, or dry eyes",
    labelHi: "त्वचा पर अत्यधिक सूखापन, होंठ फटना, मुंह या आंखों का सूखना",
    labelBn: "খসখসে শুষ্ক ত্বক, ফাটা ঠোঁট, মুখ বা চোখ শুকিয়ে যাওয়া",
    labelMr: "खवखवणारी कोरडी त्वचा, ओठ फुटणे, तोंड किंवा डोळे सुकणे",
    labelTe: "పొడి చర్మం, పగిలిన పెదవులు, నోరు లేదా కళ్లు పొడిబారడం",
    labelTa: "வறண்ட தோல், உதடு வெடிப்பு, வாய் அல்லது கண்கள் வறட்சி",
    dosha: "vata",
    severityScore: 2
  },

  // Pitta Imbalance Signs
  {
    id: "pitta_hyperacidity",
    label: "Heartburn, acid reflux, burning sensation in chest or throat",
    labelHi: "छाती या गले में जलन, खट्टी डकारें, एसिडिटी",
    labelBn: "বুক বা গলায় জ্বালা, টক ঢেকুর, এসিডিটি",
    labelMr: "छातीत किंवा घशात जळजळ, आंबट ढेकर, पित्त/अ‍ॅसिडिटी",
    labelTe: "ఛాతీ లేదా గొంతులో మంట, పుల్లని తేన్పులు, ఎసిడిటీ",
    labelTa: "நெஞ்செரிச்சல், தொண்டையில் எரிச்சல், புளித்த ஏப்பம், அசிடிட்டி",
    dosha: "pitta",
    severityScore: 3
  },
  {
    id: "pitta_excess_sweating_odor",
    label: "Excessive perspiration, hot flushes, warm palms/soles, strong body odor",
    labelHi: "ज्यादा पसीना, हथेलियों-तलवों में जलन, शरीर में तीव्र गर्मी",
    labelBn: "অতিরিক্ত ঘাম, হাত-পায়ের তালুতে জ্বালা, শরীরে তীব্র গরম",
    labelMr: "अति घाम येणे, तळहात-तळपायांची जळजळ, शरीरात तीव्र उष्णता",
    labelTe: "అధిక చెమట, అరచేతులు/పాదాలలో మంట, శరీరంలో అధిక వేడి",
    labelTa: "அதிக வியர்வை, உள்ளங்கை/பாதங்களில் எரிச்சல், அதிக உடல் சூடு",
    dosha: "pitta",
    severityScore: 2
  },
  {
    id: "pitta_irritability_anger",
    label: "Quick irritability, impatience, intolerance of hunger or delays",
    labelHi: "जल्दी गुस्सा आना, भूख न बर्दाश्त होना, अधीरता",
    labelBn: "সহজে রাগ হওয়া, খিদে সহ্য না হওয়া, অধৈর্যভাব",
    labelMr: "लवकर राग येणे, भूक सहन न होणे, अधीरता",
    labelTe: "త్వరగా కోపం రావడం, ఆకలి తట్టుకోలేకపోవడం, అసహనం",
    labelTa: "விரைவில் கோபம், பசியைத் தாங்க முடியாமை, பொறுமையின்மை",
    dosha: "pitta",
    severityScore: 2
  },
  {
    id: "pitta_skin_rashes_redness",
    label: "Red inflammatory rashes, urticaria, hives, or burning boils",
    labelHi: "त्वचा पर लाल चकत्ते, पित्ती (Urticaria), जलन वाले दाने",
    labelBn: "ত্বকে লাল ফুসকুড়ি, আমবাত (Urticaria), জ্বালাময় ফুসকুড়ি",
    labelMr: "त्वचेवर लाल पुरळ, अंगावर पित्त उठणे, जळजळणारे पुरळ",
    labelTe: "చర్మంపై ఎర్రటి దద్దుర్లు, దురద, మంటతో కూడిన గడ్డలు",
    labelTa: "தோலில் சிவப்பு தடிப்புகள், அரிப்பு, எரியும் கொப்புளங்கள்",
    dosha: "pitta",
    severityScore: 3
  },

  // Kapha Imbalance Signs
  {
    id: "kapha_lethargy_heaviness",
    label: "Heaviness in limbs/head, profound morning lethargy, desire to sleep long",
    labelHi: "शरीर व सिर में भारीपन, सुबह उठने में अत्यधिक सुस्ती, दिनभर सोना",
    labelBn: "হাত-পা ও মাথায় ভারীভাব, সকালে প্রচণ্ড অলসতা, দীর্ঘক্ষণ ঘুমানোর ইচ্ছা",
    labelMr: "हातपाय व डोक्यात जडपणा, सकाळी उठताना सुस्ती, सतत झोपावेसे वाटणे",
    labelTe: "కాళ్లు చేతులు/తల బరువుగా ఉండటం, ఉదయం తీవ్రమైన బద్ధకం, ఎక్కువసేపు నిద్రపోయే అలవాటు",
    labelTa: "உடல் மற்றும் தலையில் பாரம், காலையில் அதிக சோம்பல், அதிக தூக்கம்",
    dosha: "kapha",
    severityScore: 2
  },
  {
    id: "kapha_congestion_mucus",
    label: "Excessive white/clear phlegm, chronic sinus congestion, throat clearing",
    labelHi: "कफ की अधिकता, सीने व गले में बलगम, साइनस की रुकावट",
    labelBn: "অতিরিক্ত শ্লেষ্মা, বুকে ও গলায় কফ, সাইনাসের সমস্যা",
    labelMr: "कफाचे प्रमाण जास्त, छातीत व घशात कफ साचणे, सायनसचा त्रास",
    labelTe: "అధిక కఫం, ఛాతీ మరియు గొంతులో తెమడ, సైనస్ సమస్యలు",
    labelTa: "அதிக சளி, மார்பு மற்றும் தொண்டையில் கபம், சைனஸ் அடைப்பு",
    dosha: "kapha",
    severityScore: 2
  },
  {
    id: "kapha_sluggish_digestion",
    label: "Loss of true hunger, dull prolonged fullness hours after simple meals",
    labelHi: "भूख की कमी, खाना खाने के कई घंटे बाद तक भारीपन",
    labelBn: "ক্ষুধামন্দা, খাবারের পরেও দীর্ঘ সময় পেট ভারী থাকা",
    labelMr: "भूक मंदावणे, साध्या जेवणानंतरही अनेक तास पोट जड राहणे",
    labelTe: "ఆకలి లేకపోవడం, తిన్న తర్వాత చాలా గంటలు కడుపు బరువుగా ఉండటం",
    labelTa: "பசியின்மை, சாப்பிட்ட பிறகும் பல மணி நேரம் வயிறு பாரமாக இருப்பது",
    dosha: "kapha",
    severityScore: 2
  },
  {
    id: "kapha_water_retention",
    label: "Puffiness around eyes, swelling in ankles or fingers upon waking",
    labelHi: "आंखों के नीचे सूजन, पैरों में भारीपन या पानी का भराव",
    labelBn: "চোখের চারপাশে ফোলাভাব, সকালে গোড়ালি বা আঙুলে ফোলা",
    labelMr: "डोळ्यांखाली सूज, सकाळी उठल्यावर घोटा किंवा बोटांवर सूज",
    labelTe: "కళ్ల కింద వాపు, ఉదయం లేవగానే చీలమండలు లేదా వేళ్లలో వాపు",
    labelTa: "கண்களைச் சுற்றி வீக்கம், கணுக்கால் அல்லது விரல்களில் நீர் வீக்கம்",
    dosha: "kapha",
    severityScore: 2
  },

  // Ama (Metabolic Toxins) Signs
  {
    id: "ama_coated_tongue",
    label: "Thick white or yellow coating on tongue in morning (Jihwa Lepa)",
    labelHi: "सुबह जीभ पर सफेद या पीली मोटी परत जमना",
    labelBn: "সকালে জিভে সাদা বা হলুদ রঙের ভারী আস্তরণ",
    labelMr: "सकाळी जिभेवर पांढरा किंवा पिवळा जाड थर जमणे",
    labelTe: "ఉదయం నాలుకపై తెల్లటి లేదా పసుపు రంగు మందపాటి పూత",
    labelTa: "காலையில் நாக்கில் வெள்ளை அல்லது மஞ்சள் நிற தடித்த படிவு",
    dosha: "ama",
    severityScore: 3
  },
  {
    id: "ama_foul_breath_sweat",
    label: "Foul morning breath, sticky foul-smelling stools, heavy bodily stiffness",
    labelHi: "सांस में दुर्गंध, चिपचिपा मल, सुबह उठते ही शरीर में जकड़न",
    labelBn: "মুখে দুর্গন্ধ, আঠালো দুর্গন্ধযুক্ত মল, সকালে শরীরে অতিরিক্ত শক্তভাব",
    labelMr: "तोंडाला दुर्गंधी, चिकट घाण वास येणारे शौच, सकाळी शरीरात जडपणा",
    labelTe: "నోటి దుర్వాసన, జిగట దుర్వాసనతో కూడిన మలం, ఉదయం శరీరంలో బిగుతు",
    labelTa: "வாயில் துர்நாற்றம், பிசுபிசுப்பான துர்நாற்ற மலம், அதிக உடல் இறுக்கம்",
    dosha: "ama",
    severityScore: 3
  }
];

/// 3. Agni Pariksha (Digestive & Metabolic Fire Assessment)
export const AGNI_TYPES = [
  {
    id: "samagni",
    title: "Samagni (Balanced Metabolic Fire)",
    titleHi: "समाग्नि (संतुलित पाचन अग्नि)",
    titleBn: "সমাগ্নি (সুষম বিপাকীয় অগ্নি)",
    titleMr: "समाग्नी (संतुलित पचन अग्नी)",
    titleTe: "సమాగ్ని (సమతుల్య జీర్ణశక్తి)",
    titleTa: "சமாக்னி (சமநிலையான செரிமான தீ)",
    dosha: "balanced",
    desc: "Digests regular food easily on time; bowel movements are regular, formed, and odorless; energetic after meals.",
    descHi: "समय पर अच्छी भूख लगना, समय पर सहज पाचन, भोजन के बाद स्फूर्ति और ऊर्जा।",
    descBn: "সময়ে স্বাভাবিক খাবার সহজে হজম হয়; নিয়মিত মলত্যাগ এবং খাওয়ার পর শরীরে স্ফূর্তি থাকে।",
    descMr: "वेळेवर सहज पचन होते; नियमित पोट साफ होते आणि जेवणानंतर उत्साह वाटतो.",
    descTe: "సమయానికి ఆహారం సులభంగా జీర్ణమవుతుంది; భోజనం తర్వాత శరీరంలో శక్తి మరియు ఉత్సాహం ఉంటుంది.",
    descTa: "உணவு சரியான நேரத்தில் எளிதில் செரிமானமாகும்; உண்ட பின் புத்துணர்ச்சியாக உணர்வீர்கள்."
  },
  {
    id: "vishamagni",
    title: "Vishamagni (Irregular / Erratic Fire — Vata Dominant)",
    titleHi: "विषमाग्नि (अनियमित अग्नि — वात प्रधान)",
    titleBn: "বিষমাগ্নি (অনিয়মিত অগ্নি — বাত প্রধান)",
    titleMr: "विषमाग्नी (अनियमित अग्नी — वात प्रधान)",
    titleTe: "విషమాగ్ని (అనియమిత జీర్ణశక్తి — వాత ప్రధానం)",
    titleTa: "விஷமாக்னி (முறையற்ற செரிமானம் — வாதம்)",
    dosha: "vata",
    desc: "Unpredictable hunger — voracious one day, absent the next; prone to bloating, gas, dry constipation, and variable stools.",
    descHi: "कभी तेज भूख तो कभी बिल्कुल नहीं; पेट फूलना, गैस, कब्ज और अनिश्चित पाचन।",
    descBn: "অনিশ্চিত ক্ষুধা — একদিন খুব বেশি, পরদিন একেবারেই নেই; পেট ফাঁপা, গ্যাস ও কোষ্ঠকাঠিন্যের প্রবণতা।",
    descMr: "कधी खूप भूक तर कधी अजिबात नाही; पोट फुगणे, गॅस, बद्धकोष्ठता आणि अनियमित पचन.",
    descTe: "ఒకరోజు విపరీతమైన ఆకలి, మరోరోజు అసలు ఆకలి లేకపోవడం; కడుపు ఉబ్బరం మరియు మలబద్ధకం.",
    descTa: "ஒரு நாள் அதிக பசி, மறுநாள் பசியின்மை; வாயு, வயிற்று உப்புசம் மற்றும் மலச்சிக்கல்."
  },
  {
    id: "tikshnagni",
    title: "Tikshnagni (Hyper-Intense / Sharp Fire — Pitta Dominant)",
    titleHi: "तीक्ष्णाग्नि (अत्यधिक तीव्र अग्नि — पित्त प्रधान)",
    titleBn: "তীক্ষ্ণাগ্নি (অতিরিক্ত তীব্র অগ্নি — পিত্ত প্রধান)",
    titleMr: "तीक्ष्णाग्नी (अति तीव्र अग्नी — पित्त प्रधान)",
    titleTe: "తీక్ష్ణాగ్ని (అత్యధిక తీక్షణ జీర్ణశక్తి — పిత్త ప్రధానం)",
    titleTa: "தீக்ஷ்ணாக்னி (அதிவேக செரிமானம் — பித்தம்)",
    dosha: "pitta",
    desc: "Intense burning hunger; experiences headaches or shakiness if meals are delayed; loose stools, acid reflux, and hyperacidity.",
    descHi: "तीव्र भूख, समय पर खाना न मिलने पर सिरदर्द या चिड़चिड़ापन, दस्त या एसिडिटी की प्रवृत्ति।",
    descBn: "তীব্র ক্ষুধা, সময়ে না খেলে মাথাধরা বা অস্বস্তি, বুকজ্বালা ও এসিডিটির প্রবণতা।",
    descMr: "अति तीव्र भूक, वेळेवर जेवण न मिळाल्यास डोकेदुखी किंवा चिडचिड, छातीत जळजळ आणि पित्त.",
    descTe: "తీవ్రమైన ఆకలి, సమయానికి తినకపోతే తలనొప్పి, కడుపులో మంట మరియు ఎసిడిటీ.",
    descTa: "அதிக பசி, உணவு தாமதமானால் தலைவலி, நெஞ்செரிச்சல் மற்றும் அசிடிட்டி."
  },
  {
    id: "mandagni",
    title: "Mandagni (Hypo-Functioning / Sluggish Fire — Kapha Dominant)",
    titleHi: "मन्दाग्नि (सुस्त / मंद अग्नि — कफ प्रधान)",
    titleBn: "মন্দাগ্নি (ধীর / দুর্বল অগ্নি — কফ প্রধান)",
    titleMr: "मंदाग्नी (मंद / सुस्त अग्नी — कफ प्रधान)",
    titleTe: "మందాగ్ని (నెమ్మదైన జీర్ణశక్తి — కఫ ప్రధానం)",
    titleTa: "மந்தாக்னி (மந்தமான செரிமானம் — கபம்)",
    dosha: "kapha",
    desc: "Low or absent hunger; food sits heavy in the stomach for 5-8 hours; feeling dull, sleepy, and congested after eating.",
    descHi: "भूख न लगना, खाना खाने के बाद कई घंटों तक पेट में भारीपन, भोजन के बाद नींद व आलस्य।",
    descBn: "ক্ষুধার অভাব, খাওয়ার পর বহুক্ষণ পেট ভারী থাকা, খাবারের পর তন্দ্রাভাব ও আলস্য।",
    descMr: "भूक मंदावणे, साध्या जेवणानंतरही अनेक तास पोट जड राहणे, जेवणानंतर आळस आणि सुस्ती.",
    descTe: "ఆకలి లేకపోవడం, తిన్న తర్వాత చాలా గంటలు కడుపు బరువుగా ఉండటం, బద్ధకం.",
    descTa: "பசியின்மை, சாப்பிட்ட பின் பல மணி நேரம் வயிறு பாரமாக இருப்பது, தூக்கக் கலக்கம்."
  }
];

// 4. Nadi Pariksha Features (Classical Pulse Diagnostics)
export const NADI_FEATURES = [
  {
    id: "sarpa_gati",
    title: "Sarpa Gati (Snake Movement — Vata Nadi)",
    titleHi: "सर्प गति (सांप जैसी चाल — वात नाड़ी)",
    titleBn: "সর্প গতি (সাপের মতো আঁকাবাঁকা চলন — বাত নাড়ী)",
    titleMr: "सर्प गती (सापासारखी चाल — वात नाडी)",
    titleTe: "సర్ప గతి (పాము నడక వంటి నాడి — వాత నాడి)",
    titleTa: "சர்ப்ப கதி (பாம்பு அசைவு — வாத நாடி)",
    dosha: "vata",
    characteristics: "Fast, thin, thread-like, irregular rhythm, best felt at the base of the index finger.",
    characteristicsHi: "तेज, पतली, धागे जैसी, अनियमित ताल, तर्जनी उंगली के नीचे स्पष्ट।",
    characteristicsBn: "দ্রুত, সরু সুতোর মতো, অনিয়মিত ছন্দ, তর্জনী আঙুলের নিচে স্পষ্ট।",
    characteristicsMr: "जलद, बारीक धाग्यासारखी, अनियमित, तर्जनी बोटाखाली जाणवणारी.",
    characteristicsTe: "వేగవంతమైన, సన్నని, క్రమరహిత నాడి, చూపుడు వేలి కింద స్పష్టంగా తెలుస్తుంది.",
    characteristicsTa: "வேகமான, மெல்லிய, ஒழுங்கற்ற அசைவு, ஆள்காட்டி விரலின் கீழ் உணரப்படும்.",
    clinicalCorrelation: "Vata aggravation, neuromuscular tension, anxiety, dehydration, dry joints.",
    clinicalCorrelationHi: "वात प्रकोप, तंत्रिका तनाव, बेचैनी, निर्जलीकरण, जोड़ों का सूखापन।",
    clinicalCorrelationBn: "বাত বৃদ্ধি, স্নায়বিক চাপ, উদ্বেগ, পানিশূন্যতা, অস্থিসন্ধির শুষ্কতা।",
    clinicalCorrelationMr: "वात वाढणे, मज्जासंस्थेचा ताण, अस्वस्थता, सांध्यांचा कोरडेपणा.",
    clinicalCorrelationTe: "వాత ప్రకోపం, నాడీ ఒత్తిడి, ఆందోళన, కీళ్ల పొడిబారడం.",
    clinicalCorrelationTa: "வாத அதிகரிப்பு, நரம்பு பதற்றம், பதட்டம், மூட்டுகளின் வறட்சி."
  },
  {
    id: "manduka_gati",
    title: "Manduka Gati (Frog Movement — Pitta Nadi)",
    titleHi: "मण्डूक गति (मेंढक जैसी उछाल — पित्त नाड़ी)",
    titleBn: "মণ্ডূক গতি (ব্যাঙের মতো লাফানো চলন — পিত্ত নাড়ী)",
    titleMr: "मंडूक गती (बेडकासारखी उडी — पित्त नाडी)",
    titleTe: "మండూక గతి (కప్ప గెంతు వంటి నాడి — పిత్త నాడి)",
    titleTa: "மண்டூக கதி (தவளை பாய்ச்சல் — பித்த நாடி)",
    dosha: "pitta",
    characteristics: "Jumping, bounding, high-amplitude, forceful and warm pulse under the middle finger.",
    characteristicsHi: "उछलती हुई, तीव्र, गर्म व तेज नाड़ी जो मध्यमा उंगली के नीचे महसूस होती है।",
    characteristicsBn: "লাফানো, তীব্র, উষ্ণ ও বলিষ্ঠ স্পন্দন যা মধ্যমা আঙুলের নিচে অনুভূত হয়।",
    characteristicsMr: "उड्या मारणारी, वेगवान आणि उबदार नाडी, मधल्या बोटाखाली जाणवणारी.",
    characteristicsTe: "ఎగిసిపడే, వేగవంతమైన మరియు వెచ్చని నాడి, మధ్య వేలి కింద తెలుస్తుంది.",
    characteristicsTa: "துள்ளும், வேகமான மற்றும் சூடான நாடி, நடுவிரலின் கீழ் உணரப்படும்.",
    clinicalCorrelation: "Pitta excess, systemic inflammation, fever, hypertension, hepatic heat, acidity.",
    clinicalCorrelationHi: "पित्त वृद्धि, आंतरिक सूजन, बुखार, उच्च रक्तचाप, यकृत की गर्मी, एसिडिटी।",
    clinicalCorrelationBn: "পিত্ত বৃদ্ধি, প্রদাহ, জ্বর, উচ্চ রক্তচাপ, লিভারের উত্তাপ, এসিডিটি।",
    clinicalCorrelationMr: "पित्त वाढणे, शरीरात दाह, ताप, उच्च रक्तदाब, अ‍ॅसिडिटी.",
    clinicalCorrelationTe: "పిత్తాధిక్యత, శరీరంలో మంట, జ్వరం, అధిక రక్తపోటు, ఎసిడిటీ.",
    clinicalCorrelationTa: "பித்த அதிகரிப்பு, உடல் வீக்கம், காய்ச்சல், உயர் இரத்த அழுத்தம், அசிடிட்டி."
  },
  {
    id: "hamsa_gati",
    title: "Hamsa / Mayura Gati (Swan / Peacock Movement — Kapha Nadi)",
    titleHi: "हंस / मयूर गति (धीमी राजसी चाल — कफ नाड़ी)",
    titleBn: "হংস / ময়ূর গতি (ধীর গম্ভীর চলন — কফ নাড়ী)",
    titleMr: "हंस / मयूर गती (मंद डौलदार चाल — कफ नाडी)",
    titleTe: "హంస / మయూర గతి (నెమ్మదైన గంభీర నాడి — కఫ నాడి)",
    titleTa: "ஹம்ச / மயூரா கதி (அன்னப்பறவை போன்ற நிதான நாடி — கப நாடி)",
    dosha: "kapha",
    characteristics: "Slow, broad, steady, deep, waves gently like a floating swan under the ring finger.",
    characteristicsHi: "धीमी, चौड़ी, स्थिर, गहरी, अनामिका उंगली के नीचे हंस जैसी तैरती हुई चाल।",
    characteristicsBn: "ধীর, প্রশস্ত, স্থির, গভীর, অনামিকা আঙুলের নিচে ভাসমান রাজহাঁসের মতো কোমল।",
    characteristicsMr: "मंद, रुंद, स्थिर आणि सखोल, अनामिका बोटाखाली जाणवणारी.",
    characteristicsTe: "నెమ్మదైన, స్థిరమైన, లోతైన నాడి, ఉంగరపు వేలి కింద సున్నితంగా తెలుస్తుంది.",
    characteristicsTa: "நிதானமான, அகன்ற, ஆழமான அசைவு, மோதிர விரலின் கீழ் உணரப்படும்.",
    clinicalCorrelation: "Kapha buildup, lymphatic congestion, hypothyroidism, metabolic sluggishness, edema.",
    clinicalCorrelationHi: "कफ संचय, लसीका अवरोध, थायराइड सुस्ती, धीमा चयापचय, शरीर में सूजन।",
    clinicalCorrelationBn: "কফ জমা, লসিকাগ্রন্থির বাধা, থাইরয়েডের মন্থরতা, ধীর বিপাক, শোথ।",
    clinicalCorrelationMr: "कफ साचणे, मंद चयापचय, लसिका ग्रंथी अडथळा, सूज येणे.",
    clinicalCorrelationTe: "కఫం పేరుకుపోవడం, నెమ్మదైన జీవక్రియ, థైరాయిడ్ మందగతి, వాపు.",
    clinicalCorrelationTa: "கப தேக்கம், மெதுவான வளர்சிதை மாற்றம், தைராய்டு மந்தநிலை, வீக்கம்."
  }
];

// 5. Dashavidha Pariksha (Ten-Fold Classical Clinical Examination)
export const DASHAVIDHA_CATEGORIES = [
  {
    id: "sara",
    title: "Dhatu Sara (Tissue Excellence & Integrity)",
    titleHi: "धातु सार (शारीरिक धातुओं की गुणवत्ता)",
    titleBn: "ধাতু সার (শারীরিক কলার গুণমান ও শুদ্ধতা)",
    titleMr: "धातू सार (शारीरिक धातूंची गुणवत्ता)",
    titleTe: "ధాతు సార (శరీర ధాతువుల నాణ్యత)",
    titleTa: "தாது சாரம் (உடல் திசுக்களின் தரம்)",
    options: [
      {
        id: "rasa_sara",
        label: "Rasa Sara — Healthy glowing skin, balanced hydration, clear voice",
        labelHi: "रस सार — स्वस्थ चमकदार त्वचा, संतुलित जलयोजन, मधुर वाणी",
        labelBn: "রস সার — স্বাস্থ্যোজ্জ্বল ত্বক, সুষম আর্দ্রতা, স্পষ্ট কণ্ঠস্বর",
        labelMr: "रस सार — सतेज चमकदार त्वचा, संतुलित आर्द्रता, स्पष्ट आवाज",
        labelTe: "రస సార — ఆరోగ్యకరమైన మెరిసే చర్మం, తగినంత తేమ, స్పష్టమైన గొంతు",
        labelTa: "ரச சாரம் — ஆரோக்கியமான பளபளக்கும் தோல், சமநிலையான நீரேற்றம், தெளிவான குரல்"
      },
      {
        id: "rakta_sara",
        label: "Rakta Sara — Rosy palms/tongue, sharp senses, good thermal tolerance",
        labelHi: "रक्त सार — गुलाबी हथेलियां व जीभ, तीव्र इंद्रियां, अच्छा तापमान संतुलन",
        labelBn: "রক্ত সার — গোলাপি তালু ও জিহ্বা, তীক্ষ্ণ ইন্দ্রিয়, ভালো তাপমাত্রা সহনশীলতা",
        labelMr: "रक्त सार — गुलाबी तळहात व जीभ, तीक्ष्ण ज्ञानेंद्रिये, उत्तम तापमान सहनशीलता",
        labelTe: "రక్త సార — గులాబీ రంగు అరచేతులు/నాలుక, చురుకైన ఇంద్రియాలు",
        labelTa: "ரத்த சாரம் — ரோஜா நிற உள்ளங்கை/நாக்கு, கூர்மையான புலன்கள்"
      },
      {
        id: "mamsa_sara",
        label: "Mamsa Sara — Well-developed muscle tone, strong joints, firmness",
        labelHi: "मांस सार — सुगठित मांसपेशियां, मजबूत जोड़, शारीरिक दृढ़ता",
        labelBn: "মাংস সার — সুগঠিত পেশী, মজবুত সন্ধি, শারীরিক দৃঢ়তা",
        labelMr: "मांस सार — सुदृढ स्नायू, बळकट सांधे, शरीराचा कणखरपणा",
        labelTe: "మాంస సార — సువ్యవస్థిత కండరాలు, బలమైన కీళ్లు, దృఢత్వం",
        labelTa: "மாம்ச சாரம் — நன்கு வளர்ந்த தசை வலிமை, வலுவான மூட்டுகள்"
      },
      {
        id: "asthi_sara",
        label: "Asthi Sara — Strong teeth, large sturdy bones, durable nails",
        labelHi: "अस्थि सार — मजबूत दांत, मजबूत हड्डियां, टिकाऊ नाखून",
        labelBn: "অস্থি সার — শক্ত দাঁত, সুদৃঢ় হাড়, টেকসই নখ",
        labelMr: "अस्थी सार — मजबूत दात, बळकट हाडे, टिकाऊ नखे",
        labelTe: "అస్థి సార — బలమైన దంతాలు, గట్టి ఎముకలు, దృఢమైన గోళ్లు",
        labelTa: "அஸ்தி சாரம் — வலுவான பற்கள், உறுதியான எலும்புகள், நகங்கள்"
      },
      {
        id: "madhyama_sara",
        label: "Madhyama Sara — Average tissue strength across all bodily systems",
        labelHi: "मध्यम सार — सभी शारीरिक प्रणालियों में सामान्य धातु बल",
        labelBn: "মধ্যম সার — শরীরের সমস্ত ব্যবস্থায় স্বাভাবিক মাঝারি শক্তি",
        labelMr: "मध्यम सार — सर्व शारीरिक संस्थांमध्ये सरासरी मध्यम शक्ती",
        labelTe: "మధ్యమ సార — శరీర వ్యవస్థలలో సాధారణ ధాతు బలం",
        labelTa: "மத்தியம சாரம் — உடல் அமைப்புகளில் சராசரி திசு வலிமை"
      },
      {
        id: "avara_sara",
        label: "Avara Sara — Low physical stamina, easily fatigued tissues",
        labelHi: "अवर सार — कम शारीरिक सहनशक्ति, जल्दी थकने वाले ऊतक",
        labelBn: "অবর সার — কম শারীরিক সহনশক্তি, সহজে ক্লান্ত হয়ে পড়া",
        labelMr: "अवर सार — कमी शारीरिक क्षमता, लवकर थकवा येणे",
        labelTe: "అవర సార — తక్కువ శారీరక శక్తి, త్వరగా అలసట చెందడం",
        labelTa: "அவர சாரம் — குறைந்த சகிப்புத்தன்மை, எளிதில் சோர்வடையும் திசுக்கள்"
      }
    ]
  },
  {
    id: "samhanana",
    title: "Samhanana (Body Compactness & Structural Symmetry)",
    titleHi: "संहनन (शारीरिक संहति एवं सुगठन)",
    titleBn: "সংহনন (শারীরিক সংহতি ও সুগঠন)",
    titleMr: "संहनन (शारीरिक रचना व बांधा)",
    titleTe: "సంహనన (శరీర సంహతి మరియు సౌష్టవం)",
    titleTa: "சம்ஹனன (உடல் கட்டுக்கோப்பு மற்றும் சமச்சீர்)",
    options: [
      {
        id: "pravara_samhanana",
        label: "Pravara — Perfectly compact, symmetrical, durable bone-muscle structure",
        labelHi: "प्रवर — अत्यंत सुगठित, संतुलित, मजबूत अस्थि-मांसपेशी ढांचा",
        labelBn: "প্রবর — অত্যন্ত সুগঠিত, সুষম, দীর্ঘস্থায়ী অস্থি-পেশী গঠন",
        labelMr: "प्रवर — अत्यंत सुगठित, संतुलित, बळकट हाडे व स्नायूंचा बांधा",
        labelTe: "ప్రవర — సంపూర్ణంగా పొందికైన, బలమైన ఎముక-కండరాల నిర్మాణం",
        labelTa: "பிரவர — மிகச் சிறந்த கட்டுக்கோப்பான, உறுதியான எலும்பு-தசை அமைப்பு"
      },
      {
        id: "madhyama_samhanana",
        label: "Madhyama — Moderately compact, standard physical proportion",
        labelHi: "मध्यम — सामान्य सुगठन, मानक शारीरिक अनुपात",
        labelBn: "মধ্যম — পরিমিত সুগঠিত, প্রমিত শারীরিক অনুপাত",
        labelMr: "मध्यम — मध्यम बांधा, सामान्य प्रमाणशीर शरीर",
        labelTe: "మధ్యమ — మితమైన అమరిక, సాధారణ శారీరక నిష్పత్తి",
        labelTa: "மத்தியம — மிதமான கட்டுக்கோப்பு, நிலையான உடல் விகிதம்"
      },
      {
        id: "avara_samhanana",
        label: "Avara — Loose joint articulation, lean or disproportionate skeletal frame",
        labelHi: "अवर — ढीले जोड़, दुबला या असंतुलित कंकाल ढांचा",
        labelBn: "অবর — শিথিল সন্ধি, রোগা বা অসম শারীরিক গঠন",
        labelMr: "अवर — सैल सांधे, हाडकुळा किंवा असंतुलित बांधा",
        labelTe: "అవర — వదులైన కీళ్లు, అసమతుల్య శారీరక నిర్మాణం",
        labelTa: "அவர — தளர்வான மூட்டுகள், மெலிந்த அல்லது சீரற்ற உடல் கட்டமைப்பு"
      }
    ]
  },
  {
    id: "satmya",
    title: "Satmya (Adaptability & Wholesomeness)",
    titleHi: "सात्म्य (अनुकूलता एवं सहनशक्ति)",
    titleBn: "সাত্ম্য (অনুকূলতা ও খাদ্যাভ্যাস সহনশীলতা)",
    titleMr: "सात्म्य (अनुकूलता व सहनशीलता)",
    titleTe: "సాత్మ్య (అనుకూలత మరియు ఆహార సహనశీలత)",
    titleTa: "சாத்மிய (பொருந்தும் தன்மை மற்றும் சகிப்புத்தன்மை)",
    options: [
      {
        id: "sarva_rasa_satmya",
        label: "Pravara Satmya — Can digest and thrive on all six tastes (Shad Rasa); resilient to travel",
        labelHi: "प्रवर सात्म्य — सभी छह रसों का सहज पाचन; यात्रा व बदलाव में पूर्ण अनुकूल",
        labelBn: "প্রবর সাত্ম্য — ছয়টি রসে পূর্ণ পরিপাক ক্ষমতা; ভ্রমণ ও পরিবর্তনে সহনশীল",
        labelMr: "प्रवर सात्म्य — सर्व सहा रसांचे सहज पचन; प्रवास व वातावरणात सहज जुळवून घेणे",
        labelTe: "ప్రవర సాత్మ్య — ఆరు రుచులను సులభంగా జీర్ణించుకోగలరు; ప్రయాణాలకు అనుకూలం",
        labelTa: "பிரவர சாத்மிய — அறுசுவைகளையும் எளிதில் செரிக்கும் திறன்; பயணங்களை தாங்கும் தன்மை"
      },
      {
        id: "madhyama_satmya",
        label: "Madhyama Satmya — Tolerates most standard foods; mild disturbance on drastic diet shift",
        labelHi: "मध्यम सात्म्य — अधिकांश सामान्य भोजन सुपाच्य; बड़े बदलाव पर हल्की परेशानी",
        labelBn: "মধ্যম সাত্ম্য — অধিকাংশ সাধারণ খাবার সহনশীল; হঠাৎ খাদ্যাভ্যাস বদলে সামান্য সমস্যা",
        labelMr: "मध्यम सात्म्य — बहुतांश नियमित अन्न मानवते; आहारातील मोठ्या बदलाने किरकोळ त्रास",
        labelTe: "మధ్యమ సాత్మ్య — సాధారణ ఆహారాన్ని తట్టుకోగలరు; మార్పులపై స్వల్ప అసౌకర్యం",
        labelTa: "மத்தியம சாத்மிய — வழக்கமான உணவுகளை ஏற்கும்; திடீர் உணவு மாற்றத்தால் லேசான தொந்தரவு"
      },
      {
        id: "eka_rasa_satmya",
        label: "Avara Satmya — Sensitive digestion; requires strict familiar home food",
        labelHi: "अवर सात्म्य — संवेदनशील पाचन; केवल परिचित घरेलू भोजन ही सुपाच्य",
        labelBn: "অবর সাত্ম্য — সংবেদনশীল পরিপাক; শুধুমাত্র পরিচিত ঘরের খাবারেই স্বস্তি",
        labelMr: "अवर सात्म्य — संवेदनशील पचनसंस्था; केवळ ओळखीचे घरगुती अन्नच पचते",
        labelTe: "అవర సాత్మ్య — సున్నితమైన జీర్ణశక్తి; పరిచయమున్న ఇంటి ఆహారమే అనుకూలం",
        labelTa: "அவர சாத்மிய — உணர்திறன் மிக்க செரிமானம்; தெரிந்த வீட்டு உணவு மட்டுமே பொருந்தும்"
      }
    ]
  },
  {
    id: "sattva",
    title: "Sattva (Mental Resilience & Psychological Strength)",
    titleHi: "सत्त्व (मानसिक बल एवं धैर्य)",
    titleBn: "সত্ত্ব (মানসিক দৃঢ়তা ও সহনশক্তি)",
    titleMr: "सत्त्व (मानसिक बळ व धैर्य)",
    titleTe: "సత్త్వ (మానసిక బలం మరియు మనోధైర్యం)",
    titleTa: "சத்துவ (மன உறுதி மற்றும் உளவியல் பலம்)",
    options: [
      {
        id: "pravara_sattva",
        label: "Pravara Sattva — Highly resilient, unperturbed by stress, patient under illness",
        labelHi: "प्रवर सत्त्व — अत्यधिक धैर्यवान, तनाव में भी शांत, रोग में पूर्ण संयम",
        labelBn: "প্রবর সত্ত্ব — অত্যন্ত মানসিক শক্তি সম্পন্ন, মানসিক চাপে অবিচল, রোগে ধৈর্যশীল",
        labelMr: "प्रवर सत्त्व — अत्यंत संयमी, तणावातही शांत, आजारपणात धीर न सोडणारे",
        labelTe: "ప్రవర సత్త్వ — అధిక మానసిక స్థైర్యం, ఒత్తిడికి చలించని మనస్సు",
        labelTa: "பிரவர சத்துவ — மிகுந்த மன உறுதி, மன அழுத்தத்திலும் அமைதி, நோயில் பொறுமை"
      },
      {
        id: "madhyama_sattva",
        label: "Madhyama Sattva — Copes with support and reassurance; moderate fortitude",
        labelHi: "मध्यम सत्त्व — संबल और सांत्वना से संभलने वाले; सामान्य मानसिक बल",
        labelBn: "মধ্যম সত্ত্ব — অন্যদের আশ্বাস ও সমর্থনে সামলে নেন; পরিমিত মানসিক বল",
        labelMr: "मध्यम सत्त्व — इतरांच्या आधाराने सावरणारे; मध्यम मानसिक धैर्य",
        labelTe: "మధ్యమ సత్త్వ — ఇతరుల మద్దతుతో సర్దుకునేవారు; మితమైన ధైర్యం",
        labelTa: "மத்தியம சத்துவ — மற்றவர்களின் ஆதரவுடன் சமாளிப்பவர்கள்; மிதமான மனோபலம்"
      },
      {
        id: "avara_sattva",
        label: "Avara Sattva — Easily overwhelmed by pain, anxious, requires frequent counseling",
        labelHi: "अवर सत्त्व — दर्द से जल्दी विचलित, अत्यधिक भयभीत, निरंतर ढांढस की आवश्यकता",
        labelBn: "অবর সত্ত্ব — কষ্টে সহজেই ভেঙে পড়েন, অতিরিক্ত উদ্বিগ্ন, নিয়মিত পরামর্শের প্রয়োজন",
        labelMr: "अवर सत्त्व — वेदनेने लगेच घाबरणारे, अति चिंताग्रस्त, वारंवार समुपदेशनाची गरज",
        labelTe: "అవర సత్త్వ — నొప్పికి త్వరగా భయపడేవారు, అధిక ఆందోళన",
        labelTa: "அவர சத்துவ — வலியால் எளிதில் கலங்குபவர்கள், அதிக பதட்டம், வழிகாட்டுதல் தேவை"
      }
    ]
  },
  {
    id: "vyayama_shakti",
    title: "Vyayama Shakti (Physical Exercise & Work Capacity)",
    titleHi: "व्यायाम शक्ति (शारीरिक कार्य क्षमता)",
    titleBn: "ব্যায়াম শক্তি (শারীরিক পরিশ্রম ও সহন ক্ষমতা)",
    titleMr: "व्यायाम शक्ती (शारीरिक व्यायाम व कार्यक्षमता)",
    titleTe: "వ్యాయామ శక్తి (శారీరక శ్రమ మరియు పని సామర్థ్యం)",
    titleTa: "வியாயாம சக்தி (உடற்பயிற்சி மற்றும் வேலை திறன்)",
    options: [
      {
        id: "pravara_vyayama",
        label: "High Endurance — Easily completes 45+ mins of strenuous exercise without excessive breathlessness",
        labelHi: "उच्च सहनशक्ति — बिना अत्यधिक सांस फूले 45+ मिनट कठिन व्यायाम में सक्षम",
        labelBn: "উচ্চ সহনশীলতা — অতিরিক্ত শ্বাসকষ্ট ছাড়া ৪৫+ মিনিট পরিশ্রম করতে সক্ষম",
        labelMr: "उत्तम कार्यक्षमता — धाप न लागता ४५+ मिनिटे कठीण व्यायाम सहज करणे",
        labelTe: "అధిక సామర్థ్యం — అధిక ఆయాసం లేకుండా 45+ నిమిషాలు శ్రమించగలరు",
        labelTa: "அதிக தாங்கும் திறன் — அதிக மூச்சுத்திணறல் இல்லாமல் 45+ நிமிடங்கள் உடற்பயிற்சி"
      },
      {
        id: "madhyama_vyayama",
        label: "Moderate Endurance — Comfortable with 20-30 mins brisk walking or yoga",
        labelHi: "मध्यम सहनशक्ति — 20-30 मिनट तेज चाल या योगाभ्यास सहज संभव",
        labelBn: "পরিমিত সহনশীলতা — ২০-৩০ মিনিট দ্রুত হাঁটা বা যোগব্যায়ামে স্বাচ্ছন্দ্য",
        labelMr: "मध्यम कार्यक्षमता — २०-३० मिनिटे जलद चालणे किंवा योगासने सहज जमणे",
        labelTe: "మధ్యమ సామర్థ్యం — 20-30 నిమిషాలు వేగంగా నడక లేదా యోగా చేయగలరు",
        labelTa: "மிதமான தாங்கும் திறன் — 20-30 நிமிடங்கள் விறுவிறுப்பான நடை அல்லது யோகா"
      },
      {
        id: "avara_vyayama",
        label: "Low Endurance — Experiences fatigue or panting upon climbing 1-2 flights of stairs",
        labelHi: "अवर सहनशक्ति — 1-2 मंजिल सीढ़ी चढ़ने पर ही सांस फूलना व थकान",
        labelBn: "অল্প সহনশীলতা — ১-২ তলা সিঁড়ি উঠলেই ক্লান্তি ও শ্বাসকষ্ট",
        labelMr: "कमी कार्यक्षमता — १-२ मजले जिने चढताच धाप लागणे व थकवा येणे",
        labelTe: "తక్కువ సామర్థ్యం — 1-2 అంతస్తులు మెట్లు ఎక్కగానే ఆయాసం మరియు అలసట",
        labelTa: "குறைந்த தாங்கும் திறன் — 1-2 மாடி படிகள் ஏறினாலே மூச்சு வாங்குதல், சோர்வு"
      }
    ]
  }
];

// 6. Ahara-Vihara Options (Lifestyle & Dietary Triggers)
export const AHARA_VIHARA_QUESTIONS = [
  {
    id: "dietary_timings",
    label: "Meal Timings & Routine (Ahara Kala)",
    labelHi: "भोजन का समय एवं नियम",
    labelBn: "খাবারের সময় ও নিয়ম (আহার কাল)",
    labelMr: "जेवणाची वेळ आणि सवय (आहार काळ)",
    labelTe: "భోజన సమయాలు మరియు నియమాలు",
    labelTa: "உணவு நேரம் மற்றும் வழக்கம்",
    options: [
      {
        id: "fixed_timings",
        label: "Fixed regular timings every day (ideal for Agni)",
        labelHi: "प्रतिदिन निश्चित समय पर भोजन (अग्नि के लिए उत्तम)",
        labelBn: "প্রতিদিন নির্দিষ্ট সময়ে নিয়ম মেনে আহার (অগ্নির জন্য আদর্শ)",
        labelMr: "दररोज ठराविक वेळेवर नियमित जेवण (अग्नीसाठी उत्तम)",
        labelTe: "ప్రతిరోజూ నిర్ణీత సమయానికి భోజనం (జీర్ణక్రియకు ఉత్తమం)",
        labelTa: "ஒவ்வொரு நாளும் குறிப்பிட்ட நேரத்தில் உணவு",
        dosha: "balanced"
      },
      {
        id: "irregular_late_nights",
        label: "Irregular timings, frequent midnight snacks, skipping breakfast",
        labelHi: "अनियमित समय, देर रात भोजन, नाश्ता छोड़ना",
        labelBn: "অনিয়মিত সময়, গভীর রাতে খাওয়া, প্রাতরাশ বাদ দেওয়া",
        labelMr: "अनियमित वेळ, रात्री उशिरा खाणे, नाश्ता वगळणे",
        labelTe: "అనియమిత సమయాలు, అర్థరాత్రి ఆహారం, అల్పాహారం మానేయడం",
        labelTa: "ஒழுங்கற்ற நேரம், நள்ளிரவு உணவு, காலை உணவைத் தவிர்ப்பது",
        dosha: "vata"
      },
      {
        id: "heavy_spicy_fried",
        label: "Frequent deep-fried, chili-heavy, or fermented street food",
        labelHi: "अत्यधिक तला-भुना, तीखा, मिर्च-मसालेदार या खट्टा भोजन",
        labelBn: "অতিরিক্ত ভাজাপোড়া, ঝাল, মশলাদার বা বাইরের খাবার",
        labelMr: "वारंवार तळलेले, अति तिखट, मसालेदार किंवा बाहेरील अन्न",
        labelTe: "తరచుగా వేయించిన, కారంగా ఉండే లేదా వీధి ఆహారం",
        labelTa: "எண்ணெயில் பொரித்த, காரமான அல்லது நொதித்த உணவுகள்",
        dosha: "pitta"
      },
      {
        id: "excess_sweets_dairy",
        label: "Frequent cold milk, ice creams, heavy sweets, and sedentary snacking",
        labelHi: "अधिक मीठा, ठंडे दूध-आइसक्रीम, गरिष्ठ मिठाई और सुस्त खानपान",
        labelBn: "অতিরিক্ত মিষ্টি, ঠান্ডা দুধ, আইসক্রিম ও ভারী খাবার গ্রহণ",
        labelMr: "अति गोड, थंड दूध, आईस्क्रीम, जड मिठाया आणि बसून खाणे",
        labelTe: "అధిక తీపి, చల్లని పాలు, ఐస్‌క్రీమ్‌లు మరియు బరువైన స్వీట్లు",
        labelTa: "அதிக இனிப்பு, குளிர்ந்த பால், ஐஸ்கிரீம் மற்றும் மந்தமான உணவு",
        dosha: "kapha"
      }
    ]
  },
  {
    id: "sleep_habits",
    label: "Sleep Routine & Daytime Rest (Nidra Vihara)",
    labelHi: "सोने की दिनचर्या एवं दिन में शयन",
    labelBn: "ঘুমের রুটিন ও দিনের বিশ্রাম (নিদ্রা বিহার)",
    labelMr: "झोपेची दिनचर्या आणि दुपारची झोप",
    labelTe: "నిద్ర దినచర్య మరియు పగటి విశ్రాంతి",
    labelTa: "தூக்க வழக்கம் மற்றும் பகல் ஓய்வு",
    options: [
      {
        id: "regular_night_sleep",
        label: "Sleeps 10:30 PM to 6:00 AM, no daytime naps",
        labelHi: "रात 10:30 से सुबह 6:00 बजे तक नियमित नींद, दिन में नहीं सोना",
        labelBn: "রাত ১০:৩০ থেকে সকাল ৬:০০ পর্যন্ত নিয়মিত ঘুম, দিনে না ঘুমানো",
        labelMr: "रात्री १०:३० ते सकाळी ६:०० नियमित झोप, दुपारी न झोपणे",
        labelTe: "రాత్రి 10:30 నుండి ఉదయం 6:00 వరకు నిద్ర, పగటి నిద్ర లేదు",
        labelTa: "இரவு 10:30 முதல் காலை 6:00 வரை சீரான தூக்கம், பகல் தூக்கம் இல்லை",
        dosha: "balanced"
      },
      {
        id: "ratrijagarana",
        label: "Late nights awake (Ratrijagarana — increases Vata & Pitta)",
        labelHi: "देर रात तक जागना (रात्रि जागरण — वात व पित्त वर्धक)",
        labelBn: "দেরি করে ঘুমানো (রাত্রি জাগরণ — বাত ও পিত্ত বৃদ্ধিকারক)",
        labelMr: "रात्री उशिरापर्यंत जागे राहणे (रात्रीजागरण — वात व पित्त वाढवणारे)",
        labelTe: "రాత్రి ఆలస్యంగా నిద్రపోవడం (రాత్రిజాగరణ — వాత, పిత్త ప్రకోపం)",
        labelTa: "இரவு கண் விழித்தல் (ராத்ரி ஜாகரணம் — வாதம் & பித்தம் கூடும்)",
        dosha: "vata"
      },
      {
        id: "divasvapna",
        label: "Regular long naps immediately after heavy lunch (Divasvapna — increases Kapha & Ama)",
        labelHi: "दोपहर में भारी भोजन के तुरंत बाद गहरी नींद (दिवास्वप्न — कफ व आम वर्धक)",
        labelBn: "দুপুরের ভারী খাবারের পরপরই লম্বা ঘুম (দিবা স্বপ্ন — কফ ও আম বৃদ্ধিকারক)",
        labelMr: "दुपारी भरपेट जेवणानंतर लगेच झोपणे (दिवास्वप्न — कफ व आम वाढवणारे)",
        labelTe: "మధ్యాహ్నం భోజనం తర్వాత వెంటనే గాఢ నిద్ర (దివాస్వప్న — కఫం, ఆమ పెరుగుదల)",
        labelTa: "மதிய உணவுக்குப் பின் நீண்ட தூக்கம் (திவாஸ்வப்னம் — கபம் & ஆமம் கூடும்)",
        dosha: "kapha"
      }
    ]
  }
];

// 7. Classical Pathya-Apathya Guidance Database
export const PATHYA_APATHYA_RULES = {
  vata: {
    doshaName: "Vata (Vayu)",
    doshaHi: "वात दोष",
    doshaBn: "বাত দোষ",
    doshaMr: "वात दोष",
    doshaTe: "వాత దోషం",
    doshaTa: "வாத தோஷம்",
    pathyaAhara: [
      "Warm, unctuous (Snigdha), freshly cooked soups, khichdi, and porridges",
      "Healthy fats: pure cow's A2 ghee, cold-pressed sesame oil, warm milk with nutmeg",
      "Sweet, sour, and mildly salty tastes (Madhura, Amla, Lavana)",
      "Cooked root vegetables, oats, soaked almonds, dates, and stewed apples with cinnamon"
    ],
    pathyaAharaBn: [
      "উষ্ণ, স্নিগ্ধ, সদ্য রান্না করা স্যুপ, খিচুড়ি এবং জাউ",
      "স্বাস্থ্যকর স্নেহদ্রব্য: খাঁটি দেশি গরুর ঘি, তিলের তেল, জায়ফল মেশানো গরম দুধ",
      "মধুর, অম্ল এবং মৃদু লবণাক্ত রস (স্বাদ)",
      "রান্না করা মূলজাতীয় সবজি, ওটস, ভেজানো বাদাম, খেজুর এবং দারুচিনি দিয়ে সেদ্ধ আপেল"
    ],
    pathyaAharaHi: [
      "गर्म, स्निग्ध, ताजा बना सूप, खिचड़ी और दलिया",
      "स्वास्थ्यवर्धक वसा: शुद्ध देसी गाय का घी, तिल का तेल, जायफल युक्त गुनगुना दूध",
      "मधुर, अम्ल और हल्का नमकीन रस (स्वाद)",
      "पकी हुई जड़ वाली सब्जियां, ओट्स, भीगे बादाम, खजूर और दालचीनी युक्त सेब"
    ],
    pathyaAharaMr: [
      "उष्ण, स्निग्ध, ताजे शिजवलेले सूप, खिचडी आणि मऊ भात",
      "आरोग्यदायी स्निग्ध पदार्थ: शुद्ध देशी गायीचे तूप, तिळाचे तेल, जायफळयुक्त कोमट दूध",
      "मधुर, आम्ल आणि सौम्य खारट चवीचे पदार्थ",
      "शिजवलेल्या कंदमुळांच्या भाज्या, ओट्स, भिजवलेले बदाम, खजूर आणि दालचिनीयुक्त सफरचंद"
    ],
    pathyaAharaTe: [
      "వెచ్చని, స్నిగ్ధమైన, తాజాగా వండిన సూప్‌లు, కిచిడీ మరియు గంజి",
      "ఆరోగ్యకరమైన కొవ్వులు: స్వచ్ఛమైన ఆవు నెయ్యి, నువ్వుల నూనె, జాజికాయ కలిపిన గోరువెచ్చని పాలు",
      "మధుర, ఆమ్ల మరియు స్వల్ప లవణ రుచులు",
      "వండిన దుంప కూరగాయలు, ఓట్స్, నానబెట్టిన బాదం, ఖర్జూరాలు, దాల్చినచెక్కతో ఉడికించిన ఆపిల్స్"
    ],
    pathyaAharaTa: [
      "சூடான, நெய்ப்புணர்ந்த, புதிதாக சமைத்த சூப், கிச்சடி மற்றும் கஞ்சி",
      "ஆரோக்கியமான கொழுப்புகள்: தூய பசு நெய், எள் எண்ணெய், ஜாதிக்காய் கலந்த வெதுவெதுப்பான பால்",
      "இனிப்பு, புளிப்பு மற்றும் லேசான உப்பு சுவைகள்",
      "சமைத்த கிழங்கு காய்கறிகள், ஓட்ஸ், ஊறவைத்த பாதாம், பேரீச்சம்பழம், இலவங்கப்பட்டை ஆப்பிள்"
    ],
    apathyaAhara: [
      "Raw salads, uncooked sprouts, dry crackers, and cold packaged snacks",
      "Excessive dry pulses: rajma, chana, dried peas without ghee/hing tempering",
      "Iced drinks, carbonated sodas, and refrigerated leftovers",
      "Excessively bitter, astringent, and pungent tastes (Tikta, Kashaya, Katu)"
    ],
    apathyaAharaBn: [
      "কাঁচা সালাদ, কাঁচা অঙ্কুরিত ছোলা/মুগ, শুকনো ক্র্যাকার এবং ঠান্ডা প্রক্রিয়াজাত খাবার",
      "অতিরিক্ত শুষ্ক ডাল: ঘি বা হিং ছাড়া রান্না করা রাজমা, ছোলা ও শুকনো মটর",
      "বরফযুক্ত পানীয়, কার্বনেটেড কোল্ড ড্রিঙ্কস এবং ফ্রিজের বাসি খাবার",
      "অতিরিক্ত তিতা, কষা এবং ঝাল স্বাদ (তিক্ত, কষায়, কটু রস)"
    ],
    apathyaAharaHi: [
      "कच्चा सलाद, बिना पके अंकुरित अनाज, सूखे स्नैक्स और ठंडे पैकेटबंद खाद्य पदार्थ",
      "अत्यधिक सूखी दालें: बिना घी/हींग तड़के के राजमा, चना और सूखे मटर",
      "बर्फ वाले पेय, कोल्ड ड्रिंक्स और फ्रिज में रखा बासी खाना",
      "अत्यधिक कड़वे, कसैले और तीखे स्वाद (तिक्त, कषाय, कटु)"
    ],
    apathyaAharaMr: [
      "कच्ची कोशिंबीर, न शिजवलेले मोड आलेले कडधान्य, कोरडे स्नॅक्स आणि थंड पदार्थ",
      "अति कोरडी कडधान्ये: तूप किंवा हिंगाची फोडणी न दिलेले राजमा, चणे आणि वाटाणे",
      "थंडगार पेये, कोल्ड ड्रिंक्स आणि फ्रीजमधील शिळे अन्न",
      "अति कडू, तुरट आणि तिखट चवीचे पदार्थ"
    ],
    apathyaAharaTe: [
      "పచ్చి సలాడ్లు, వండని మొలకలు, పొడి చిరుతిళ్లు మరియు చల్లని ప్యాక్ చేసిన ఆహారాలు",
      "అధిక పొడి పప్పుధాన్యాలు: నెయ్యి/ఇంగువ తాలింపు లేని రాజ్మా, శనగలు, బఠానీలు",
      "చల్లని పానీయాలు, సోడాలు మరియు ఫ్రిజ్లో ఉంచిన నిల్వ ఆహారం",
      "అధిక చేదు, వగరు మరియు కారపు రుచులు"
    ],
    apathyaAharaTa: [
      "பச்சை சாலட், சமைக்காத முளைகட்டிய பயிர்கள், உலர் தின்பண்டங்கள் மற்றும் குளிர்ந்த உணவுகள்",
      "நெய்/பெருங்காயம் சேர்க்காத காய்ந்த பயிர்கள்: ராஜ்மா, கொண்டைக்கடலை, பட்டாணி",
      "குளிர்ந்த பானங்கள், சோடா மற்றும் ஃப்ரிட்ஜில் வைத்த பழைய உணவுகள்",
      "அதிக கசப்பு, துவர்ப்பு மற்றும் கார சுவைகள்"
    ],
    pathyaVihara: [
      "Daily self-abhyanga (warm sesame oil massage) before warm shower",
      "Regular early sleep schedule (before 10:30 PM) to calm nervous system",
      "Gentle grounding yoga (Tadasana, Paschimottanasana) and Anulom Vilom Pranayama",
      "Staying warm, quiet environment, protection from cold drafts"
    ],
    pathyaViharaBn: [
      "প্রতিদিন উষ্ণ জল দিয়ে স্নানের আগে তিলের তেল দিয়ে অভ্যাঙ্গ (মালিশ)",
      "স্নায়ুতন্ত্রকে শান্ত রাখতে নিয়মিত দ্রুত ঘুমানোর অভ্যাস (রাত ১০:৩০ এর আগে)",
      "মৃদু স্থিরতামূলক যোগব্যায়াম (তাড়াসন, পশ্চিমোত্তানাসন) ও অনুলোম-বিলোম প্রাণায়াম",
      "উষ্ণ ও শান্ত পরিবেশে থাকা, ঠান্ডা বাতাস থেকে সুরক্ষিত থাকা"
    ],
    pathyaViharaHi: [
      "गुनगुने पानी से स्नान से पहले प्रतिदिन गुनगुने तिल के तेल से अभ्यंग (मालिश)",
      "तंत्रिका तंत्र को शांत रखने के लिए नियमित रूप से जल्दी सोना (रात 10:30 से पहले)",
      "हल्के स्थिर योगासन (ताड़ासन, पश्चिमोत्तानासन) और अनुलोम-विलोम प्राणायाम",
      "गर्म व शांत वातावरण में रहना, ठंडी हवा के झोंकों से बचाव"
    ],
    pathyaViharaMr: [
      "कोमट पाण्याच्या स्नानापूर्वी दररोज कोमट तिळाच्या तेलाने अंगाला मालिश (अभ्यंग)",
      "मज्जासंस्था शांत ठेवण्यासाठी वेळेवर झोपणे (रात्री १०:३० च्या आधी)",
      "संतुलित योगासने (ताडासन, पश्चिमोत्तानासन) आणि अनुलोम-विलोम प्राणायाम",
      "उबदार व शांत वातावरणात राहणे, थंड हवेपासून संरक्षण करणे"
    ],
    pathyaViharaTe: [
      "గోరువెచ్చని స్నానానికి ముందు రోజూ నువ్వుల నూనెతో అభ్యంగన మర్దన",
      "నాడీ వ్యవస్థను ప్రశాంతపరచడానికి క్రమబద్ధమైన నిద్ర (రాత్రి 10:30 లోపు)",
      "సున్నితమైన యోగాసనాలు (తాడాసనం, పశ్చిమోత్తానాసనం) మరియు అనులోమ-విలోమ ప్రాణాయామం",
      "వెచ్చని, ప్రశాంత వాతావరణంలో ఉండటం, చల్లని గాలుల నుండి రక్షణ"
    ],
    pathyaViharaTa: [
      "வெதுவெதுப்பான குளியலுக்கு முன் தினமும் நல்லெண்ணெய் தேய்த்து குளித்தல் (அப்யங்கம்)",
      "நரம்பு மண்டலத்தை அமைதிப்படுத்த வழக்கமான ஆரம்பகால தூக்கம் (இரவு 10:30 க்குள்)",
      "எளிய யோகாசனங்கள் (தாடாசனம், பஸ்சிமோத்தானாசனம்) மற்றும் அநுலோம விலோம பிராணாயாமம்",
      "வெதுவெதுப்பான, அமைதியான சூழலில் இருத்தல், குளிர்ந்த காற்றிலிருந்து பாதுகாப்பு"
    ],
    apathyaVihara: [
      "Staying awake late at night (Ratrijagarana)",
      "Excessive multitasking, prolonged screen exposure, and loud noisy environments",
      "Skipping meals or fasting for extreme prolonged durations",
      "Exposing head and ears to direct cold AC air or strong winds"
    ],
    apathyaViharaBn: [
      "দেরি রাত পর্যন্ত জেগে থাকা (রাত্রি জাগরণ)",
      "একসাথে বহু কাজ করা, দীর্ঘক্ষণ স্ক্রিনের সামনে থাকা এবং কোলাহলপূর্ণ পরিবেশ",
      "খাবার না খাওয়া বা দীর্ঘ সময় অনাহারে থাকা",
      "মাথা ও কানে সরাসরি ঠান্ডা এসি বা বাতাসের সংস্পর্শ"
    ],
    apathyaViharaHi: [
      "देर रात तक जागना (रात्रि जागरण)",
      "एक साथ कई काम करना, लंबे समय तक स्क्रीन देखना और अत्यधिक शोरगुल",
      "भोजन छोड़ना या लंबे समय तक उपवास रखना",
      "सिर और कानों पर सीधी ठंडी एसी हवा या तेज हवा लगना"
    ],
    apathyaViharaMr: [
      "रात्री उशिरापर्यंत जागे राहणे (रात्रीजागरण)",
      "एकाच वेळी अनेक कामे करणे, जास्त वेळ स्क्रीन पाहणे आणि गोंधळाचे वातावरण",
      "जेवण वगळणे किंवा जास्त काळ उपाशी राहणे",
      "डोके आणि कानांना थेट थंड एसी हवा किंवा जोरदार वारा लागणे"
    ],
    apathyaViharaTe: [
      "రాత్రిపూట ఆలస్యంగా మేల్కొని ఉండటం (రాత్రిజాగరణ)",
      "ఒకేసారి ఎక్కువ పనులు చేయడం, స్క్రీన్ సమయం పెరగడం, రద్దీ వాతావరణం",
      "భోజనం మానేయడం లేదా ఎక్కువ సమయం ఉపవాసం ఉండటం",
      "తల, చెవులకు నేరుగా చల్లని ఏసీ గాలి లేదా బలమైన గాలులు తగలడం"
    ],
    apathyaViharaTa: [
      "இரவு வெகுநேரம் கண் விழித்தல் (ராத்ரி ஜாகரணம்)",
      "ஒரே நேரத்தில் பல வேலைகள் செய்தல், அதிக திரை நேரம் மற்றும் அதிக சத்தம்",
      "உணவைத் தவிர்த்தல் அல்லது நீண்ட நேரம் பட்டினி இருத்தல்",
      "தலை மற்றும் காதுகளில் நேரடியாக குளிர்ந்த ஏசி காற்று படுதல்"
    ],
    herbsSuggested: [
      "Ashwagandha (Withania somnifera) — Restores nervous energy and neuromuscular stamina",
      "Dashamoola — Calms erratic Vata, eases body aches and joint stiffness",
      "Shatavari (Asparagus racemosus) — Nourishing, soothing, and balances tissue dryness",
      "Hingwashtak Churna — Eases gas, bloating, and irregular Vishamagni digestion"
    ],
    herbsSuggestedBn: [
      "অশ্বগন্ধা — স্নায়বিক শক্তি ও পেশীর সহনশীলতা বৃদ্ধি করে",
      "দশমূল — অস্থির বাত শান্ত করে, শরীরের ব্যথা ও সংযোগস্থলের আড়ষ্টতা কমায়",
      "শতমূলী — পুষ্টিকর, স্নিগ্ধ এবং শারীরিক শুষ্কতা দূর করে",
      "হিঙ্গ্বষ্টক চূর্ণ — গ্যাস, পেট ফাঁপা এবং অনিয়মিত বিষমাগ্নি হজমে সহায়ক"
    ],
    herbsSuggestedHi: [
      "अश्वगंधा — स्नायु ऊर्जा और तंत्रिका तंत्र की शक्ति को पुनर्स्थापित करता है",
      "दशमूल — वात को शांत करता है, बदन दर्द और जोड़ों की अकड़न दूर करता है",
      "शतावरी — पोषक, शीतलता प्रदायक और शारीरिक रूखेपन को संतुलित करता है",
      "हिंग्वाष्टक चूर्ण — गैस, पेट फूलना और विषमाग्नि की अनियमित पाचन क्रिया में लाभकारी"
    ],
    herbsSuggestedMr: [
      "अश्वगंधा — मज्जासंस्थेची ताकद आणि शारीरिक ऊर्जा वाढवते",
      "दशमूळ — वातदोष शांत करते, अंगदुखी आणि सांधेदुखी कमी करते",
      "शतावरी — पौष्टिक, स्निग्ध आणि शरीराचा कोरडेपणा दूर करते",
      "हिंग्वाष्टक चूर्ण — गॅस, पोटफुगी आणि अनियमित पचन सुधारते"
    ],
    herbsSuggestedTe: [
      "అశ్వగంధ — నాడీ శక్తి మరియు కండరాల బలాన్ని పునరుద్ధరిస్తుంది",
      "దశమూల — పెరిగిన వాతాన్ని తగ్గిస్తుంది, శరీర నొప్పులు మరియు కీళ్ల బిగుతును తగ్గిస్తుంది",
      "శతావరి — పోషకమైనది, చలువ చేస్తుంది మరియు పొడిబారడాన్ని నివారిస్తుంది",
      "హింగ్వాష్టక చూర్ణం — గ్యాస్, కడుపుబ్బరం మరియు జీర్ణ సమస్యలను తగ్గిస్తుంది"
    ],
    herbsSuggestedTa: [
      "அஸ்வகந்தா — நரம்பு வலிமை மற்றும் தசை சகிப்புத்தன்மையை மீட்டெடுக்கிறது",
      "தசமூலம் — வாதத்தைக் குறைக்கிறது, உடல் வலி மற்றும் மூட்டு இறுக்கத்தைக் குணப்படுத்துகிறது",
      "சதாவரி — ஊட்டமளிக்கும், மென்மையாக்கும் மற்றும் உடல் வறட்சியைப் போக்கும்",
      "ஹிங்வாஷ்டக சூரணம் — வாயு, வயிற்று உப்புசம் மற்றும் செரிமானக் கோளாறுகளைச் சீராக்கும்"
    ]
  },
  pitta: {
    doshaName: "Pitta (Tejas & Agni)",
    doshaHi: "पित्त दोष",
    doshaBn: "পিত্ত দোষ",
    doshaMr: "पित्त दोष",
    doshaTe: "పిత్త దోషం",
    doshaTa: "பித்த தோஷம்",
    pathyaAhara: [
      "Cooling, soothing foods: tender coconut water, sweet lassi, pomegranate juice",
      "Fats: Pure cow's ghee, cooling coconut oil, coriander-infused foods",
      "Sweet, bitter, and astringent tastes (Madhura, Tikta, Kashaya)",
      "Moong dal, basmati rice, bottle gourd (Lauki), cucumber, zucchini, sweet juicy fruits"
    ],
    pathyaAharaBn: [
      "শীতল ও স্নিগ্ধ খাবার: ডাবের জল, মিষ্টি লাচ্ছি, বেদানার রস",
      "স্নেহদ্রব্য: খাঁটি দেশি গরুর ঘি, নারকেল তেল, ধনে মিশ্রিত খাবার",
      "মধুর, তিক্ত এবং কষায় রস (মিষ্টি, তিতা এবং কষা স্বাদ)",
      "মুগ ডাল, বাসমতি চাল, লাউ, শসা, ঝিঙে ও মিষ্টি রসালো ফল"
    ],
    pathyaAharaHi: [
      "शीतल एवं सुपाच्य खाद्य: नारियल पानी, मीठी लस्सी, अनार का रस",
      "वसा: शुद्ध गाय का घी, नारियल तेल, धनिया युक्त आहार",
      "मधुर, तिक्त और कषाय रस (मीठा, कड़वा और कसैला स्वाद)",
      "मूंग दाल, बासमती चावल, लौकी, खीरा, तोरई और मीठे रसीले फल"
    ],
    pathyaAharaMr: [
      "थंड आणि शांत करणारे अन्न: शहाळ्याचे पाणी, गोड लस्सी, डाळिंबाचा रस",
      "स्निग्ध पदार्थ: शुद्ध गायीचे तूप, खोबरेल तेल, धनेयुक्त अन्न",
      "मधुर, कडू आणि तुरट चवीचे अन्न",
      "मूग डाळ, बासमती तांदूळ, दुधी भोपळा, काकडी, घोसाळे आणि गोड फळे"
    ],
    pathyaAharaTe: [
      "చలువ చేసే ఆహారాలు: కొబ్బరి నీళ్లు, తీపి లస్సీ, దానిమ్మ రసం",
      "కొవ్వులు: స్వచ్ఛమైన ఆవు నెయ్యి, కొబ్బరి నూనె, ధనియాలతో కూడిన ఆహారాలు",
      "మధుర, చేదు మరియు వగరు రుచులు",
      "పెసరపప్పు, బాస్మతి బియ్యం, సొరకాయ, కీరదోస, బీరకాయ మరియు తియ్యని పండ్లు"
    ],
    pathyaAharaTa: [
      "குளிர்ச்சியான உணவுகள்: இளநீர், இனிப்பு லஸ்ஸி, மாதுளை சாறு",
      "கொழுப்புகள்: தூய பசு நெய், தேங்காய் எண்ணெய், கொத்தமல்லி கலந்த உணவுகள்",
      "இனிப்பு, கசப்பு மற்றும் துவர்ப்பு சுவைகள்",
      "பாசிப்பருப்பு, பாசுமதி அரிசி, சுரைக்காய், வெள்ளரிக்காய், பீர்க்கங்காய் மற்றும் இனிப்பு பழங்கள்"
    ],
    apathyaAhara: [
      "Excessive green/red chilies, vinegar, mustard, pungent sauces, and pickles",
      "Deep-fried oily snacks, stale fermented foods, alcohol, and excess caffeine",
      "Excessive sour and salty tastes (Amla, Lavana)",
      "Garlic, onions in excess, reheating meals multiple times"
    ],
    apathyaAharaBn: [
      "অতিরিক্ত কাঁচা/শুকনো লঙ্কা, ভিনেগার, সর্ষে, ঝাঁঝালো সস এবং আচার",
      "তেলে ভাজা খাবার, অতিরিক্ত গাঁজানো খাবার, অ্যালকোহল ও অতিরিক্ত ক্যাফেইন",
      "অতিরিক্ত টক ও নোনতা স্বাদ (অম্ল ও লবণ রস)",
      "অতিরিক্ত রসুন ও পেঁয়াজ, একই খাবার বারবার গরম করে খাওয়া"
    ],
    apathyaAharaHi: [
      "अत्यधिक हरी/लाल मिर्च, सिरका, राई/सरसों, तीखे सॉस और अचार",
      "तले-भुने स्नैक्स, खमीरीकृत खाद्य पदार्थ, शराब और अत्यधिक कैफीन",
      "अत्यधिक खट्टा और नमकीन स्वाद (अम्ल और लवण)",
      "अत्यधिक लहसुन, प्याज और बार-बार गर्म किया हुआ भोजन"
    ],
    apathyaAharaMr: [
      "अति तिखट मिरच्या, व्हिनेगर, मोहरी, तिखट सॉस आणि लोणचे",
      "तळलेले तेलकट पदार्थ, आंबवलेले शिळे अन्न, मद्यपान आणि अति चहा/कॉफी",
      "अति आंबट आणि खारट चवीचे पदार्थ",
      "लसूण, कांद्याचा अतिवापर आणि वारंवार गरम केलेले अन्न"
    ],
    apathyaAharaTe: [
      "అధిక పచ్చి/ఎండు మిరపకాయలు, వెనిగర్, ఆవాలు, ఘాటైన సాస్‌లు మరియు ఊరగాయలు",
      "నూనెలో వేయించిన స్నాక్స్, పులియబెట్టిన ఆహారాలు, ఆల్కహాల్ మరియు అధిక కెఫిన్",
      "అధిక పులుపు మరియు ఉప్పు రుచులు",
      "వెల్లుల్లి, ఉల్లిపాయలు అధికంగా వాడటం, ఆహారాన్ని పదే పదే వేడి చేయడం"
    ],
    apathyaAharaTa: [
      "அதிக பச்சை/சிவப்பு மிளகாய், வினிகர், கடுகு, காரமான சாஸ்கள் மற்றும் ஊறுகாய்",
      "எண்ணெயில் பொரித்த உணவுகள், புளித்த உணவுகள், ஆல்கஹால் மற்றும் அதிக காஃபின்",
      "அதிக புளிப்பு மற்றும் உப்பு சுவைகள்",
      "பூண்டு, வெங்காயம் அதிகம் சேர்த்தல், உணவை மீண்டும் மீண்டும் சூடாக்குதல்"
    ],
    pathyaVihara: [
      "Evening walks under moonlight or by water bodies (Sheeta Vihara)",
      "Sheetali & Sheetkari cooling pranayama; calming Shavasana and meditation",
      "Applying sandalwood (Chandana) or rose water to forehead and temples",
      "Cultivating contentment, moderate work pace, and avoiding contentious debates"
    ],
    pathyaViharaBn: [
      "চাঁদের আলোয় বা জলাশয়ের ধারে সান্ধ্যকালীন ভ্রমণ (শীতল বিহার)",
      "শীতলী ও শীতকারী শীতলীকরণ প্রাণায়াম; শান্তিদায়ক শবাসন ও ধ্যান",
      "কপালে চন্দন বা গোলাপ জলের প্রলেপ লাগানো",
      "সন্তোষ বজায় রাখা, মাঝারি গতিতে কাজ করা এবং বিতর্ক পরিহার করা"
    ],
    pathyaViharaHi: [
      "चांदनी में या जलस्रोतों के समीप शाम की सैर (शीत विहार)",
      "शीतली व शीतकारी प्राणायाम; शांत शवासन और ध्यान",
      "माथे और कनपटी पर चंदन या गुलाब जल का लेप",
      "संतोष की भावना, सामान्य कार्य गति और व्यर्थ के वाद-विवाद से बचाव"
    ],
    pathyaViharaMr: [
      "चांदण्यात किंवा पाण्याच्या सान्निध्यात संध्याकाळची फेरी (शीत विहार)",
      "शीतली आणि शीतकारी प्राणायाम; शांत शवासन आणि ध्यान",
      "कपाळावर आणि कानशिलावर चंदन किंवा गुलाबपाणी लावणे",
      "समाधानी वृत्ती, कामाचा मध्यम वेग आणि वादविवाद टाळणे"
    ],
    pathyaViharaTe: [
      "వెన్నెలలో లేదా జలాశయాల దగ్గర సాయంత్రం నడక (శీతల విహారం)",
      "శీతలి మరియు శీత్కారి చలువ ప్రాణాయామం; ప్రశాంత శవాసనం మరియు ధ్యానం",
      "నుదుటిపై చందనం లేదా గులాబీ నీరు రాయడం",
      "సంతృప్తిని అలవర్చుకోవడం, మితమైన పని వేగం మరియు వాదనలను నివారించడం"
    ],
    pathyaViharaTa: [
      "நிலவொளியில் அல்லது நீர்நிலைகளுக்கு அருகில் மாலை நடைபயிற்சி (சீத விஹாரம்)",
      "சீதளி & சீத்காரி பிராணாயாமம்; அமைதியான சவாசனம் மற்றும் தியானம்",
      "நெற்றியில் சந்தனம் அல்லது பன்னீர் பூசுதல்",
      "மனநிறைவு, மிதமான வேலை வேகம் மற்றும் வாக்குவாதங்களைத் தவிர்த்தல்"
    ],
    apathyaVihara: [
      "Direct exposure to mid-day sun (11 AM - 3 PM)",
      "Skipping meals or prolonging hunger when hunger is sharp (aggravates hyperacidity)",
      "Suppression of natural emotions leading to hot temper or anger",
      "Saunas, hot tub soaks, or rigorous exercise in hot humid weather"
    ],
    apathyaViharaBn: [
      "দুপুরের কড়া রোদে সরাসরি বের হওয়া (সকাল ১১টা - বিকেল ৩টা)",
      "তীব্র ক্ষুধার সময় খাবার না খাওয়া (এসিডিটি বা অম্লপিত্ত বৃদ্ধি করে)",
      "স্বাভাবিক আবেগ চেপে রাখা যা রাগ বা মেজাজ খিটখিটে করে",
      "সনা বাথ, গরম জলে স্নান অথবা গরম-আর্দ্র আবহাওয়ায় অতিরিক্ত পরিশ্রম"
    ],
    apathyaViharaHi: [
      "दोपहर की तेज धूप में सीधे जाना (सुबह 11 बजे से दोपहर 3 बजे तक)",
      "तेज भूख लगने पर भोजन न करना (अम्लपित्त/एसिडिटी को बढ़ाता है)",
      "स्वाभाविक भावनाओं को दबाना जिससे गुस्सा या चिड़चिड़ापन बढ़े",
      "सॉना, गर्म पानी से स्नान या गर्म व उमस भरे मौसम में अत्यधिक व्यायाम"
    ],
    apathyaViharaMr: [
      "दुपारच्या कडक उन्हात जाणे (सकाळी ११ ते दुपारी ३)",
      "कडक भूक लागली असताना जेवण न करणे (पित्त वाढते)",
      "भावना दाबून ठेवणे ज्यामुळे राग किंवा चिडचिड वाढते",
      "सॉना, गरम पाण्याच्या टबमध्ये बसणे किंवा उष्ण दमट हवामानात जास्त व्यायाम करणे"
    ],
    apathyaViharaTe: [
      "మధ్యాహ్నపు ఎండలో నేరుగా తిరగడం (ఉదయం 11 - మధ్యాహ్నం 3)",
      "తీవ్రమైన ఆకలి ఉన్నప్పుడు భోజనం మానేయడం (ఎసిడిటీని పెంచుతుంది)",
      "కోపం లేదా చిరాకును అణచివేయడం",
      "సౌనా, వేడి నీటి స్నానాలు లేదా వేడి తేమతో కూడిన వాతావరణంలో కఠినమైన వ్యాయామం"
    ],
    apathyaViharaTa: [
      "நண்பகல் வெயிலில் நேரடியாகச் செல்லுதல் (காலை 11 - மதியம் 3)",
      "கடும் பசியின் போது சாப்பிடாமல் இருத்தல் (அசிடிட்டியை அதிகரிக்கும்)",
      "இயற்கையான உணர்ச்சிகளை அடக்குவதால் ஏற்படும் கோபம் அல்லது எரிச்சல்",
      "சானா, சுடுநீர் குளியல் அல்லது வெப்பமான காலநிலையில் கடுமையான உடற்பயிற்சி"
    ],
    herbsSuggested: [
      "Guduchi / Giloy (Tinospora cordifolia) — Master blood purifier and Pitta pacifier",
      "Amalaki (Phyllanthus emblica) — Exceptional cooling rasayana for hyperacidity",
      "Avipattikar Churna — Classical formulation for heartburn, GERD, and hyperacidity",
      "Brahmi (Bacopa monnieri) — Calms Pitta-induced irritability and stress"
    ],
    herbsSuggestedBn: [
      "গুলঞ্চ / গিলয় — প্রধান রক্ত শোধক ও পিত্ত প্রশমক",
      "আমলকী — অম্লপিত্ত ও বুকজ্বালার জন্য অদ্বিতীয় শীতলকারী রসায়ন",
      "অবিপত্তিকর চূর্ণ — বুকজ্বালা, অম্বল ও গ্যাস্ট্রিকের জন্য শাস্ত্রীয় ঔষধ",
      "ব্রাহ্মী — পিত্তজনিত মানসিক উত্তেজনা, রাগ ও মানসিক চাপ দূর করে"
    ],
    herbsSuggestedHi: [
      "गिलोय / गुडूची — प्रमुख रक्त शोधक और पित्त शामक",
      "आंवला — अम्लपित्त व एसिडिटी के लिए उत्तम शीतल रसायन",
      "अविपत्तिकर चूर्ण — सीने में जलन, जीईआरडी और एसिडिटी की शास्त्रीय औषधि",
      "ब्राह्मी — पित्त जनित चिड़चिड़ापन और तनाव को शांत करता है"
    ],
    herbsSuggestedMr: [
      "गुळवेल — प्रमुख रक्त शुद्ध करणारे आणि पित्तशामक औषध",
      "आवळा — पित्त आणि छातीत जळजळ यासाठी उत्तम थंड रसायन",
      "अविपत्तिकर चूर्ण — ॲसिडिटी, छातीत जळजळ यासाठी शास्त्रीय औषध",
      "ब्राह्मी — पित्तामुळे होणारी चिडचिड आणि मानसिक ताण शांत करते"
    ],
    herbsSuggestedTe: [
      "తిప్పతీగ / గుడుచి — ఉత్తమ రక్త శుద్ధి మరియు పిత్త నివారిణి",
      "ఉసిరి — ఎసిడిటీకి అద్భుతమైన చలువ చేసే రసాయనం",
      "అవిపత్తికర చూర్ణం — గుండెల్లో మంట, ఎసిడిటీకి శాస్త్రీయ ఔషధం",
      "బ్రాహ్మి — పిత్తం వల్ల కలిగే చిరాకు మరియు ఒత్తిడిని తగ్గిస్తుంది"
    ],
    herbsSuggestedTa: [
      "சீந்தில் கொடி (குடூச்சி) — சிறந்த ரத்த சுத்திகரிப்பு மற்றும் பித்த சமநிலைப்படுத்தி",
      "நெல்லிக்காய் — அமிலத்தன்மை மற்றும் நெஞ்செரிச்சலுக்கு சிறந்த குளிர்ச்சி தரும் ரசாயனம்",
      "அவிபத்திகர சூரணம் — நெஞ்செரிச்சல் மற்றும் அசிடிட்டிக்கான பாரம்பரிய மருந்து",
      "பிராமி — பித்தத்தால் ஏற்படும் எரிச்சல் மற்றும் மன அழுத்தத்தை தணிக்கிறது"
    ]
  },
  kapha: {
    doshaName: "Kapha (Prithvi & Jala)",
    doshaHi: "कफ दोष",
    doshaBn: "কফ দোষ",
    doshaMr: "कफ दोष",
    doshaTe: "కఫ దోషం",
    doshaTa: "கப தோஷம்",
    pathyaAhara: [
      "Light, warm, dry, and well-spiced meals; vegetable soups with ginger/black pepper",
      "Grains: Barley (Yava), millets (Bajra/Jowar), quinoa, roasted chickpeas",
      "Pungent, bitter, and astringent tastes (Katu, Tikta, Kashaya)",
      "Honey (aged/purana madhu — natural drying agent), turmeric, fenugreek, steamed greens"
    ],
    pathyaAharaBn: [
      "হালকা, গরম, শুকনো এবং মশলাযুক্ত খাবার; আদা ও গোলমরিচ দেওয়া সবজি স্যুপ",
      "শস্য: যব (বার্লি), বাজরা, জোয়ার, ভাজা ছোলা",
      "ঝাল, তিতা এবং কষা স্বাদ (কটু, তিক্ত, কষায় রস)",
      "পুরাতন মধু (স্বাভাবিক শুষ্কতা আনে), হলুদ, মেথি এবং ভাপানো শাকসবজি"
    ],
    pathyaAharaHi: [
      "हल्का, गर्म, सूखा और मसालेदार भोजन; अदरक व काली मिर्च युक्त सब्जियों का सूप",
      "अनाज: जौ, बाजरा, ज्वार, भुने चने",
      "तीखा, कड़वा और कसैला स्वाद (कटु, तिक्त, कषाय)",
      "पुराना शहद (कफ सुखाने वाला), हल्दी, मेथी और उबली हुई हरी सब्जियां"
    ],
    pathyaAharaMr: [
      "हलके, गरम, कोरडे आणि मसालेदार अन्न; आले व काळी मिरी असलेले सूप",
      "धान्य: जवस, बाजरी, ज्वारी, भाजलेले चणे",
      "तिखट, कडू आणि तुरट चवीचे पदार्थ",
      "जुने मध (कफ कमी करणारे), हळद, मेथी आणि उकडलेल्या भाज्या"
    ],
    pathyaAharaTe: [
      "తేలికపాటి, వెచ్చని, పొడి మరియు మసాలాతో కూడిన భోజనం; అల్లం, మిరియాలతో కూరగాయల సూప్",
      "ధాన్యాలు: బార్లీ, సజ్జలు, జొన్నలు, వేయించిన శనగలు",
      "కారం, చేదు మరియు వగరు రుచులు",
      "పాత తేనె (కఫాన్ని తగ్గిస్తుంది), పసుపు, మెంతులు మరియు ఉడికించిన ఆకుకూరలు"
    ],
    pathyaAharaTa: [
      "லேசான, சூடான, உலர்ந்த மற்றும் மசாலா உணவுகள்; இஞ்சி, மிளகு கலந்த காய்கறி சூப்",
      "தானியங்கள்: பார்லி, கம்பு, சோளம், வறுத்த கொண்டைக்கடலை",
      "காரம், கசப்பு மற்றும் துவர்ப்பு சுவைகள்",
      "பழைய தேன் (இயற்கை வறட்சி தரும்), மஞ்சள், வெந்தயம் மற்றும் வேகவைத்த கீரைகள்"
    ],
    apathyaAhara: [
      "Cold milk, heavy curd/paneer at night, ice creams, milkshakes, and pastries",
      "Heavy oily, deep-fried snacks, excessive bakery products made of refined flour (Maida)",
      "Excessive sweet, sour, and salty tastes (Madhura, Amla, Lavana)",
      "Overeating or eating when previous meal is still not fully digested"
    ],
    apathyaAharaBn: [
      "ঠান্ডা দুধ, রাতে ভারী দই বা পনির খাওয়া, আইসক্রিম, মিল্কশেক ও মিষ্টি পেস্ট্রি",
      "অতিরিক্ত তেলযুক্ত ভাজাভুজি ও ময়দা দিয়ে তৈরি বেকারি পণ্য",
      "অতিরিক্ত মিষ্টি, টক এবং নোনতা খাবার (মধুর, অম্ল ও লবণ রস)",
      "আগের খাবার হজম না হতেই পুনরায় খাওয়া বা অতিভোজন"
    ],
    apathyaAharaHi: [
      "ठंडा दूध, रात में भारी दही/पनीर, आइसक्रीम, मिल्कशेक और पेस्ट्री",
      "भारी तैलीय, तले-भुने स्नैक्स, मैदे से बने बेकरी उत्पाद",
      "अत्यधिक मीठा, खट्टा और नमकीन स्वाद (मधुर, अम्ल और लवण)",
      "अतिभोजन या पिछला भोजन पचने से पहले दोबारा खाना"
    ],
    apathyaAharaMr: [
      "थंड दूध, रात्री दही/पनीर खाणे, आईस्क्रीम, मिल्कशेक आणि गोड पदार्थ",
      "तेलकट, तळलेले स्नॅक्स, मैद्याचे बेकरी पदार्थ",
      "अति गोड, आंबट आणि खारट चवीचे पदार्थ",
      "अति खाणे किंवा आधीचे जेवण पचण्यापूर्वी पुन्हा खाणे"
    ],
    apathyaAharaTe: [
      "చల్లని పాలు, రాత్రిపూట పెరుగు/పనీర్, ఐస్ క్రీములు, మిల్క్‌షేక్‌లు",
      "నూనెలో వేయించిన స్నాక్స్, మైదాతో చేసిన బేకరీ పదార్థాలు",
      "అధిక తీపి, పులుపు మరియు ఉప్పు రుచులు",
      "అతిగా తినడం లేదా మునుపటి భోజనం జీర్ణం కాకముందే తినడం"
    ],
    apathyaAharaTa: [
      "குளிர்ந்த பால், இரவில் தயிர்/பன்னீர், ஐஸ்கிரீம், மில்க்ஷேக்",
      "எண்ணெயில் பொரித்த தின்பண்டங்கள், மைதா பேக்கரி பொருட்கள்",
      "அதிக இனிப்பு, புளிப்பு மற்றும் உப்பு சுவைகள்",
      "அளவுக்கு அதிகமாக உண்ணுதல் அல்லது முந்தைய உணவு செரிமானமாகும் முன் உண்ணுதல்"
    ],
    pathyaVihara: [
      "Early rising before sunrise (Brahma Muhurta ~ 5:30 AM) to break morning lethargy",
      "Dynamic cardiovascular exercise: Surya Namaskara (12+ rounds), brisk uphill walking",
      "Dry powder massage (Udvartana) with chickpea/barley flour and triphala",
      "Bhastrika and Kapalabhati pranayama to clear respiratory and sinus channels"
    ],
    pathyaViharaBn: [
      "সূর্যোদয়ের পূর্বে ভোরে ঘুম থেকে ওঠা (ব্রাহ্ম মুহূর্ত ~ ভোর ৫:৩০) অলসতা দূর করতে",
      "সক্রিয় ব্যায়াম: সূর্য নমস্কার (১২+ বার), দ্রুত হাঁটা",
      "বেসন/যবের গুঁড়ো ও ত্রিফলা দিয়ে শুকনো মর্দন (উদ্বর্তন)",
      "শ্বাসতন্ত্র ও সাইনাস পরিষ্কার রাখতে ভস্ত্রিকা ও কপালভাতি প্রাণায়াম"
    ],
    pathyaViharaHi: [
      "सूर्योदय से पहले जल्दी उठना (ब्रह्म मुहूर्त ~ प्रातः 5:30) सुस्ती दूर करने के लिए",
      "सक्रिय व्यायाम: सूर्य नमस्कार (12+ चक्र), तेज चलना",
      "जौ/चने के आटे और त्रिफला से सूखा उबटन (उद्वर्तन)",
      "श्वसन व साइनस मार्ग साफ करने के लिए भस्त्रिका और कपालभाति प्राणायाम"
    ],
    pathyaViharaMr: [
      "सूर्योदयापूर्वी उठणे (ब्राह्म मुहूर्त ~ पहाटे ५:३०) आळस दूर करण्यासाठी",
      "सक्रिय व्यायाम: सूर्यनमस्कार (१२+ फेऱ्या), जलद चालणे",
      "डाळीचे पीठ आणि त्रिफळा पावडरने कोरडी मालिश (उद्वर्तन)",
      "श्वसननलिका स्वच्छ करण्यासाठी भस्त्रिका आणि कपालभाती प्राणायाम"
    ],
    pathyaViharaTe: [
      "సూర్యోదయానికి ముందే నిద్రలేవడం (బ్రాహ్మీ ముహూర్తం ~ ఉదయం 5:30) బద్ధకాన్ని పోగొట్టడానికి",
      "చురుకైన వ్యాయామం: సూర్య నమస్కారాలు (12+ సార్లు), వేగంగా నడవడం",
      "శనగపిండి/బార్లీ పిండి మరియు త్రిఫలతో పొడి మర్దన (ఉద్వర్తనం)",
      "శ్వాసకోశ మార్గాలను శుభ్రపరచడానికి భస్త్రిక మరియు కపాలభాతి ప్రాణాయామం"
    ],
    pathyaViharaTa: [
      "சூரிய உதயத்திற்கு முன் அதிகாலையில் எழுதல் (பிரம்ம முகூர்த்தம் ~ காலை 5:30)",
      "சூரிய நமஸ்காரம் (12+ சுற்றுகள்), விறுவிறுப்பான நடைபயிற்சி",
      "கடலை மாவு மற்றும் திரிபலா கொண்டு உலர் பொடி மசாஜ் (உத்வர்த்தனம்)",
      "சுவாசப் பாதைகளைச் சீராக்க பஸ்திரிகா மற்றும் கபாலபாதி பிராணாயாமம்"
    ],
    apathyaVihara: [
      "Sleeping during the daytime (Divasvapna — primary trigger for Kapha morbidity)",
      "Sedentary desk lifestyle without regular standing breaks or movement",
      "Eating immediately before bedtime (less than 3 hours before sleep)",
      "Staying in cold, dark, damp, poorly ventilated rooms"
    ],
    apathyaViharaBn: [
      "দিনের বেলা ঘুমানো (দিবা স্বপ্ন — কফ বৃদ্ধির প্রধান কারণ)",
      "বসে থাকার অলস জীবনযাপন ও চলাফেরা না করা",
      "ঘুমানোর ঠিক আগে খাবার খাওয়া (ঘুমানোর কমপক্ষে ৩ ঘণ্টা আগে খাওয়া উচিত)",
      "ঠান্ডা, অন্ধকার ও স্যাঁতসেঁতে ঘরে থাকা"
    ],
    apathyaViharaHi: [
      "दिन के समय सोना (दिवास्वप्न — कफ बढ़ने का मुख्य कारण)",
      "बिना गतिशीलता के लंबे समय तक बैठे रहना",
      "सोने से ठीक पहले भोजन करना (सोने से कम से कम 3 घंटे पहले खाएं)",
      "ठंडे, सीलन भरे और हवा-विहीन कमरों में रहना"
    ],
    apathyaViharaMr: [
      "दिवसा झोपणे (दिवास्वप्न — कफ वाढण्याचे मुख्य कारण)",
      "हालचाल न करता सतत एकाच जागी बसून राहणे",
      "झोपण्यापूर्वी लगेच जेवणे (झोपण्याच्या किमान ३ तास आधी जेवावे)",
      "थंड, दमट आणि कोंदट खोल्यांमध्ये राहणे"
    ],
    apathyaViharaTe: [
      "పగటిపూట నిద్రపోవడం (దివాస్వప్న — కఫం పెరగడానికి ప్రధాన కారణం)",
      "ఎలాంటి కదలిక లేకుండా నిరంతరం కూర్చునే జీవనశైలి",
      "పడుకునే ముందు వెంటనే తినడం (పడుకోవడానికి కనీసం 3 గంటల ముందు తినాలి)",
      "చల్లని, తేమతో కూడిన గదుల్లో ఉండటం"
    ],
    apathyaViharaTa: [
      "பகல் நேரத்தில் தூங்குதல் (திவாஸ்வப்னம் — கபம் அதிகரிக்க முக்கிய காரணம்)",
      "உடலுழைப்பு இல்லாத அமர்ந்த நிலை வாழ்க்கை முறை",
      "தூங்குவதற்கு சற்று முன் சாப்பிடுதல் (தூங்குவதற்கு 3 மணி நேரத்திற்கு முன் சாப்பிட வேண்டும்)",
      "குளிர்ந்த, வெளிச்சமில்லாத, காற்றோட்டமற்ற அறைகளில் தங்குதல்"
    ],
    herbsSuggested: [
      "Trikatu (Shunti + Maricha + Pippali) — Kindles Mandagni, burns Ama, clears mucus",
      "Punarnava (Boerhavia diffusa) — Relieves water retention, puffiness, and swelling",
      "Kanchanar Guggulu — Promotes lymphatic drainage and resolves metabolic sluggishness",
      "Triphala Churna — Cleanses colon, reduces Meda (adiposity), and kindles digestion"
    ],
    herbsSuggestedBn: [
      "ত্রিকটু (শুঁঠ + মরিচ + পিপুল) — মন্দাগ্নি দূর করে, আম পাচন করে এবং শ্লেষ্মা কমায়",
      "পুনর্নবা — শরীরে জল জমা, চোখের কোল ফোলা এবং স্ফীতি কমায়",
      "কাঞ্চনার গুগগুলু — লসিকা নালী পরিষ্কার করে এবং মেটাবলিজম বাড়ায়",
      "ত্রিফলা চূর্ণ — বৃহদন্ত্র পরিষ্কার করে, মেদ কমায় এবং পরিপাক উন্নত করে"
    ],
    herbsSuggestedHi: [
      "त्रिकटु (सोंठ + मिर्च + पिप्पली) — मंदाग्नि को प्रदीप्त करता है, आम जलाता है और कफ साफ करता है",
      "पुनर्नवा — शरीर में पानी जमा होना, सूजन और भारीपन दूर करता है",
      "कांचनार गुग्गुलु — लसीका तंत्र को सक्रिय करता है और मेटाबॉलिक सुस्ती दूर करता है",
      "त्रिफला चूर्ण — आंतों को साफ करता है, चर्बी/मेद घटाता है और पाचन मजबूत करता है"
    ],
    herbsSuggestedMr: [
      "त्रिकटू (सुंठ + मिरी + पिंपळी) — मंदाग्नी वाढवते, आम पचन करते आणि कफ दूर करते",
      "पुनर्नवा — सूज, अंगात पाणी साठणे आणि जडपणा कमी करते",
      "कांचनार गुग्गुळ — चयापचय सुधारते आणि सुस्ती दूर करते",
      "त्रिफळा चूर्ण — पोट साफ करते, मेद कमी करते आणि पचनशक्ती वाढवते"
    ],
    herbsSuggestedTe: [
      "త్రికటు (శొంఠి + మిరియాలు + పిప్పలి) — మందాగ్నిని పెంచుతుంది, ఆమను పోగొడుతుంది",
      "పునర్నవ — వాపులు, శరీరంలో నీరు చేరడాన్ని నివారిస్తుంది",
      "కాంచనార గుగ్గులు — లింఫాటిక్ డ్రైనేజీని పెంచుతుంది మరియు బద్ధకాన్ని పోగొడుతుంది",
      "త్రిఫల చూర్ణం — పెద్దపేగును శుభ్రపరుస్తుంది, కొవ్వును తగ్గిస్తుంది మరియు జీర్ణక్రియను మెరుగుపరుస్తుంది"
    ],
    herbsSuggestedTa: [
      "திரிகடுகம் (சுக்கு + மிளகு + திப்பிலி) — மந்தமான அக்னியைத் தூண்டுகிறது, சளியை நீக்குகிறது",
      "புனர்நவா (மூக்கிரட்டை) — நீர் தேக்கம் மற்றும் வீக்கத்தைக் குறைக்கிறது",
      "காஞ்சனார குக்குலு — வளர்சிதை மாற்ற மந்தநிலையை போக்குகிறது",
      "திரிபலா சூரணம் — குடலைச் சுத்தப்படுத்துகிறது, கொழுப்பைக் குறைத்து செரிமானத்தை அதிகரிக்கிறது"
    ]
  }
};

// 8. Classical Ayurvedic Doctors Roster
export const AYURVEDIC_SPECIALISTS = [
  {
    id: "d4",
    name: "Dr. Rajeshwar Sharma",
    nameHi: "डॉ. राजेश्वर शर्मा",
    nameBn: "ডাঃ রাজেশ্বর শর্মা",
    nameMr: "डॉ. राजेश्वर शर्मा",
    nameTe: "డా. రాజేశ్వర్ శర్మ",
    nameTa: "டாக்டர் ராஜேஷ்வர் சர்மா",
    qualification: "BAMS, MD (Ayurveda) - Panchakarma & Kayachikitsa",
    specialty: "Ayurvedic Medicine & Panchakarma",
    specialtyHi: "आयुर्वेद एवं पंचकर्म विशेषज्ञ",
    specialtyBn: "আয়ুর্বেদ ও পঞ্চকর্ম বিশেষজ্ঞ",
    specialtyMr: "आयुर्वेद आणि पंचकर्म तज्ज्ञ",
    specialtyTe: "ఆయుర్వేద మరియు పంచకర్మ నిపుణులు",
    specialtyTa: "ஆயுர்வேதம் & பஞ்சகர்மா நிபுணர்",
    hospital: "All India Institute of Ayurveda (AIIA) / CarePath AYUSH OPD",
    room: "AYUSH OPD Room 204",
    experience: "18 Years Experience",
    avatar: "🌿",
    availability: "Available Today (10:00 AM - 4:00 PM)",
    availabilityHi: "आज उपलब्ध (प्रातः 10:00 - सायं 4:00)",
    availabilityBn: "আজ উপলব্ধ (সকাল ১০:০০ - বিকাল ৪:০০)",
    availabilityMr: "आज उपलब्ध (सकाळी १०:०० - संध्याकाळी ४:००)",
    availabilityTe: "ఈరోజు అందుబాటులో ఉన్నారు (ఉదయం 10:00 - సాయంత్రం 4:00)",
    availabilityTa: "இன்று கிடைக்கும் (காலை 10:00 - மாலை 4:00)",
    nextSlot: "11:30 AM"
  },
  {
    id: "d5",
    name: "Dr. Sunita Vaidya",
    nameHi: "डॉ. सुनीता वैद्य",
    nameBn: "ডাঃ সুনীতা বৈদ্য",
    nameMr: "डॉ. सुनीता वैद्य",
    nameTe: "డా. సునీతా వైద్య",
    nameTa: "டாக்டர் சுனிதா வைத்யா",
    qualification: "BAMS, Fellow in Nadi Vigyan (BHU)",
    specialty: "Classical Nadi Pariksha & Doshic Balancing",
    specialtyHi: "नाड़ी विज्ञान एवं आहार-विहार विशेषज्ञ",
    specialtyBn: "শাস্ত্রীয় নাড়ী পরীক্ষা ও দোষের ভারসাম্য বিশেষজ্ঞ",
    specialtyMr: "शास्त्रीय नाडी परीक्षा आणि दोष संतुलन तज्ज्ञ",
    specialtyTe: "శాస్త్రీయ నాడీ పరీక్ష మరియు దోష సమతుల్యత నిపుణులు",
    specialtyTa: "பாரம்பரிய நாடி பரிசோதனை & தோஷ சமநிலை நிபுணர்",
    hospital: "Charak Ayurvedic Research Hospital / CarePath AYUSH OPD",
    room: "AYUSH OPD Room 206",
    experience: "14 Years Experience",
    avatar: "🪷",
    availability: "Available Today (09:30 AM - 2:30 PM)",
    availabilityHi: "आज उपलब्ध (प्रातः 9:30 - दोपहर 2:30)",
    availabilityBn: "আজ উপলব্ধ (সকাল ৯:৩০ - দুপুর ২:৩০)",
    availabilityMr: "आज उपलब्ध (सकाळी ९:३० - दुपारी २:३०)",
    availabilityTe: "ఈరోజు అందుబాటులో ఉన్నారు (ఉదయం 9:30 - మధ్యాహ్నం 2:30)",
    availabilityTa: "இன்று கிடைக்கும் (காலை 9:30 - மதியம் 2:30)",
    nextSlot: "12:15 PM"
  }
];

export function getLocalizedRecommendationList(recommendations, fieldName, lang = "en") {
  if (!recommendations) return [];
  const code = (lang || "en").toLowerCase().slice(0, 2);
  const langKey = `${fieldName}${code.charAt(0).toUpperCase() + code.slice(1)}`;
  if (recommendations[langKey] && Array.isArray(recommendations[langKey])) {
    return recommendations[langKey];
  }
  return recommendations[fieldName] || [];
}

export function getLocalizedPrakritiType(type = "", lang = "en") {
  const code = (lang || "en").toLowerCase().slice(0, 2);
  const map = {
    "VATA Dominant": {
      bn: "বাত প্রধান (Vata Dominant)",
      hi: "वात प्रधान (Vata Dominant)",
      mr: "वात प्रधान (Vata Dominant)",
      te: "వాత ప్రధానం (Vata Dominant)",
      ta: "வாத ஆதிக்கம் (Vata Dominant)"
    },
    "PITTA Dominant": {
      bn: "পিত্ত প্রধান (Pitta Dominant)",
      hi: "पित्त प्रधान (Pitta Dominant)",
      mr: "पित्त प्रधान (Pitta Dominant)",
      te: "పిత్త ప్రధానం (Pitta Dominant)",
      ta: "பித்த ஆதிக்கம் (Pitta Dominant)"
    },
    "KAPHA Dominant": {
      bn: "কফ প্রধান (Kapha Dominant)",
      hi: "कफ प्रधान (Kapha Dominant)",
      mr: "कफ प्रधान (Kapha Dominant)",
      te: "కఫ ప్రధానం (Kapha Dominant)",
      ta: "கப ஆதிக்கம் (Kapha Dominant)"
    },
    "VATA-PITTA Dwandwaja": {
      bn: "বাত-পিত্ত দ্বন্দজ (Vata-Pitta Dwandwaja)",
      hi: "वात-पित्त द्वन्द्वज (Vata-Pitta Dwandwaja)",
      mr: "वात-पित्त द्वंदज (Vata-Pitta Dwandwaja)",
      te: "వాత-పిత్త ద్వంద్వజ (Vata-Pitta Dwandwaja)",
      ta: "வாத-பித்த துவந்தவஜ (Vata-Pitta Dwandwaja)"
    },
    "PITTA-KAPHA Dwandwaja": {
      bn: "পিত্ত-কফ দ্বন্দজ (Pitta-Kapha Dwandwaja)",
      hi: "पित्त-कफ द्वन्द्वज (Pitta-Kapha Dwandwaja)",
      mr: "पित्त-कफ द्वंदज (Pitta-Kapha Dwandwaja)",
      te: "పిత్త-కఫ ద్వంద్వజ (Pitta-Kapha Dwandwaja)",
      ta: "பித்த-கப துவந்தவஜ (Pitta-Kapha Dwandwaja)"
    },
    "VATA-KAPHA Dwandwaja": {
      bn: "বাত-কফ দ্বন্দজ (Vata-Kapha Dwandwaja)",
      hi: "वात-कफ द्वन्द्वज (Vata-Kapha Dwandwaja)",
      mr: "वात-कफ द्वंदज (Vata-Kapha Dwandwaja)",
      te: "వాత-కఫ ద్వంద్వజ (Vata-Kapha Dwandwaja)",
      ta: "வாத-கப துவந்தவஜ (Vata-Kapha Dwandwaja)"
    },
    "Sama / Tridoshic": {
      bn: "সম / ত্রিদোষজ (Sama / Tridoshic)",
      hi: "सम / त्रिदोषज (Sama / Tridoshic)",
      mr: "सम / त्रिदोषज (Sama / Tridoshic)",
      te: "సమ / త్రిదోషజ (Sama / Tridoshic)",
      ta: "சம / திரிதோஷ (Sama / Tridoshic)"
    }
  };

  if (map[type] && map[type][code]) {
    return map[type][code];
  }
  return type;
}

export function getLocalizedVikritiType(type = "", lang = "en") {
  const code = (lang || "en").toLowerCase().slice(0, 2);
  const map = {
    "Pitta Vriddhi (Imbalance)": {
      bn: "পিত্ত বৃদ্ধি (অসামঞ্জস্য)",
      hi: "पित्त वृद्धि (असंतुलन)",
      mr: "पित्त वृद्धी (असंतुलन)",
      te: "పిత్త వృద్ధి (అసమతుల్యత)",
      ta: "பித்த விருத்தி (சமநிலையின்மை)"
    },
    "Vata Vriddhi (Imbalance)": {
      bn: "বাত বৃদ্ধি (অসামঞ্জস্য)",
      hi: "वात वृद्धि (असंतुलन)",
      mr: "वात वृद्धी (असंतुलन)",
      te: "వాత వృద్ధి (అసమతుల్యత)",
      ta: "வாத விருத்தி (சமநிலையின்மை)"
    },
    "Kapha Vriddhi (Imbalance)": {
      bn: "কফ বৃদ্ধি (অসামঞ্জস্য)",
      hi: "कफ वृद्धि (असंतुलन)",
      mr: "कफ वृद्धी (असंतुलन)",
      te: "కఫ వృద్ధి (అసమతుల్యత)",
      ta: "கப விருத்தி (சமநிலையின்மை)"
    },
    "Balanced (Sama Dhatu)": {
      bn: "ভারসাম্যপূর্ণ (সম ধাতু)",
      hi: "संतुलित (सम धातु)",
      mr: "संतुलित (सम धातू)",
      te: "సమతుల్యత (సమ ధాతువు)",
      ta: "சமநிலை (சம தாது)"
    }
  };

  if (map[type] && map[type][code]) {
    return map[type][code];
  }
  return type;
}

export function getLocalizedSpecialist(doc, lang = "en") {
  if (!doc) return doc;
  const code = (lang || "en").toLowerCase().slice(0, 2);
  const nameKey = `name${code.charAt(0).toUpperCase() + code.slice(1)}`;
  const specialtyKey = `specialty${code.charAt(0).toUpperCase() + code.slice(1)}`;
  const availabilityKey = `availability${code.charAt(0).toUpperCase() + code.slice(1)}`;
  return {
    ...doc,
    name: doc[nameKey] || doc.name,
    specialty: doc[specialtyKey] || doc.specialty,
    availability: doc[availabilityKey] || doc.availability
  };
}

// 9. Classical Scoring & Profile Generation Engine
export function calculateAyushProfile({
  prakritiAnswers = {},
  vikritiSelected = [],
  selectedAgni = "samagni",
  selectedNadi = "sarpa_gati",
  dashavidhaAnswers = {},
  aharaViharaAnswers = {}
}) {
  const scores = {
    prakriti: { vata: 0, pitta: 0, kapha: 0 },
    vikriti: { vata: 0, pitta: 0, kapha: 0, ama: 0 }
  };

  // Score Prakriti
  Object.values(prakritiAnswers).forEach((choice) => {
    if (choice && choice.dosha && choice.points) {
      scores.prakriti[choice.dosha] += choice.points;
    }
  });

  const totalPrakriti = scores.prakriti.vata + scores.prakriti.pitta + scores.prakriti.kapha || 1;
  const prakritiPercentages = {
    vata: Math.round((scores.prakriti.vata / totalPrakriti) * 100),
    pitta: Math.round((scores.prakriti.pitta / totalPrakriti) * 100),
    kapha: Math.round((scores.prakriti.kapha / totalPrakriti) * 100)
  };

  // Determine Primary and Secondary Prakriti
  const sortedPrakriti = Object.entries(scores.prakriti).sort((a, b) => b[1] - a[1]);
  let prakritiType = "Sama / Tridoshic";
  if (sortedPrakriti[0][1] > sortedPrakriti[1][1] + 2) {
    prakritiType = `${sortedPrakriti[0][0].toUpperCase()} Dominant`;
  } else if (sortedPrakriti[0][1] > 0) {
    prakritiType = `${sortedPrakriti[0][0].toUpperCase()}-${sortedPrakriti[1][0].toUpperCase()} Dwandwaja`;
  }

  // Score Vikriti
  vikritiSelected.forEach((symptomId) => {
    const item = VIKRITI_SYMPTOMS.find((x) => x.id === symptomId);
    if (item) {
      scores.vikriti[item.dosha] += item.severityScore;
    }
  });

  const sortedVikriti = Object.entries(scores.vikriti).filter(([k]) => k !== "ama").sort((a, b) => b[1] - a[1]);
  let dominantVikriti = "Balanced (Sama Dhatu)";
  if (sortedVikriti[0][1] > 0) {
    dominantVikriti = `${sortedVikriti[0][0].charAt(0).toUpperCase() + sortedVikriti[0][0].slice(1)} Vriddhi (Imbalance)`;
  }

  const hasAma = scores.vikriti.ama >= 3;
  const targetDoshaKey = sortedVikriti[0][1] > 0 ? sortedVikriti[0][0] : sortedPrakriti[0][0];
  const recommendations = PATHYA_APATHYA_RULES[targetDoshaKey] || PATHYA_APATHYA_RULES.vata;
  const agniObj = AGNI_TYPES.find((a) => a.id === selectedAgni) || AGNI_TYPES[0];
  const nadiObj = NADI_FEATURES.find((n) => n.id === selectedNadi) || NADI_FEATURES[0];

  return {
    prakriti: {
      type: prakritiType,
      scores: scores.prakriti,
      percentages: prakritiPercentages
    },
    vikriti: {
      dominant: dominantVikriti,
      scores: scores.vikriti,
      hasAma,
      symptomsCount: vikritiSelected.length
    },
    agni: agniObj,
    nadi: nadiObj,
    dashavidha: dashavidhaAnswers,
    recommendations,
    disclaimer: "Classical Ayurvedic Diagnostic Assessment — Patient-reported clinical intake. Final diagnosis, prescription, and Nadi examination subject to confirmation by an authorized BAMS/MD Ayurvedic physician."
  };
}

/**
 * Generates localized voice prompt for a Prakriti question.
 * Supports: en, hi, bn, mr, te, ta.
 */
export function getAyushPrakritiVoicePrompt(question, langCode = "en-IN") {
  if (!question) return "";
  const lang = String(langCode).toLowerCase().slice(0, 2);

  switch (lang) {
    case "hi":
      return `प्रकृति लक्षण: ${question.labelHi || question.titleHi || question.label || question.title}। कृपया अपनी शारीरिक प्रवृत्ति के अनुसार विकल्प चुनें।`;
    case "bn":
      return `প্রকৃতি মূল্যায়ন: ${question.labelBn || question.titleBn || question.label || question.title}। আপনার বিকল্প নির্বাচন করুন।`;
    case "mr":
      return `प्रकृती लक्षण: ${question.labelMr || question.titleMr || question.label || question.title}। आपला पर्याय निवडा.`;
    case "te":
      return `ప్రకృతి లక్షణం: ${question.labelTe || question.titleTe || question.label || question.title}. మీ ఎంపికను ఎంచుకోండి.`;
    case "ta":
      return `பிரகிருதி குணம்: ${question.labelTa || question.titleTa || question.label || question.title}. உங்கள் விருப்பத்தைத் தேர்ந்தெடுக்கவும்.`;
    case "en":
    default:
      return `Constitutional trait: ${question.label || question.title}. Please select the option that best reflects your natural body tendency.`;
  }
}

/**
 * Generates localized voice prompt for Agni & Nadi Pariksha.
 */
export function getAyushAssessmentVoicePrompt(stepIndex = 0, langCode = "en-IN") {
  const lang = String(langCode).toLowerCase().slice(0, 2);

  if (stepIndex === 0) {
    switch (lang) {
      case "hi":
        return "अग्नि परीक्षा: पाचन अग्नि और चयापचय क्षमता का मूल्यांकन। अपनी भूख और पाचन का सही पैटर्न चुनें।";
      case "bn":
        return "অগ্নি পরীক্ষা: আপনার হজম ক্ষমতা ও ক্ষুধার ধরন নির্বাচন করুন।";
      case "mr":
        return "अग्नी परीक्षा: आपली पचनशक्ती आणि भूक यानुसार योग्य पर्याय निवडा.";
      case "te":
        return "అగ్ని పరీక్ష: మీ జీర్ణక్రియ మరియు ఆకలి ఆధారంగా సరైన ఎంపికను ఎంచుకోండి.";
      case "ta":
        return "அக்னி பரிசோதனை: உங்கள் செரிமான திறன் மற்றும் பசியின் அடிப்படையில் தேர்ந்தெடுக்கவும்.";
      case "en":
      default:
        return "Agni Pariksha: Digestive and metabolic fire assessment. Select the pattern that best reflects your appetite and digestion.";
    }
  }

  switch (lang) {
    case "hi":
      return "नाड़ी परीक्षा: शास्त्रीय धमनी नाड़ी गति मूल्यांकन। अपनी प्रमुख नाड़ी गति और लक्षणों का चयन करें।";
    case "bn":
      return "নাড়ী পরীক্ষা: আপনার প্রধান নাড়ী স্পন্দন এবং লক্ষণ নির্বাচন করুন।";
    case "mr":
      return "नाडी परीक्षा: आपली मुख्य नाडी गती निवडा.";
    case "te":
      return "నాడీ పరీక్ష: మీ ప్రధాన నాడీ లక్షణాలను ఎంచుకోండి.";
    case "ta":
      return "நாடி பரிசோதனை: உங்கள் முக்கிய நாடி குணங்களை தேர்ந்தெடுக்கவும்.";
    case "en":
    default:
      return "Nadi Pariksha: Classical arterial pulse diagnostics. Select your predominant pulse character.";
  }
}

/**
 * Generates localized voice prompt for Vikriti symptoms.
 */
export function getAyushVikritiVoicePrompt(symptomsCount = 0, langCode = "en-IN") {
  const lang = String(langCode).toLowerCase().slice(0, 2);

  switch (lang) {
    case "hi":
      return `विकृति मूल्यांकन: वर्तमान दोष असंतुलन और लक्षण चुनें। ${symptomsCount} लक्षण चुने गए हैं।`;
    case "bn":
      return `বিকৃতি মূল্যায়ন: আপনার বর্তমান ভারসাম্যহীনতার লক্ষণ নির্বাচন করুন। ${symptomsCount} টি লক্ষণ নির্বাচিত।`;
    case "mr":
      return `विकृती मूल्यांकन: आपली वर्तमान लक्षणे निवडा. ${symptomsCount} लक्षणे निवडली आहेत.`;
    case "te":
      return `వికృతి మూల్యాంకనం: మీ ప్రస్తుత అసమతుల్యత లక్షణాలను ఎంచుకోండి. ${symptomsCount} లక్షణాలు ఎంచుకోబడ్డాయి.`;
    case "ta":
      return `விகிருதி மதிப்பீடு: உங்கள் தற்போதைய சமநிலையின்மை அறிகுறிகளைத் தேர்ந்தெடுக்கவும். ${symptomsCount} அறிகுறிகள் தேர்ந்தெடுக்கப்பட்டன.`;
    case "en":
    default:
      return `Vikriti assessment: Select your current doshic imbalance signs and active symptoms. ${symptomsCount} symptoms selected.`;
  }
}

/**
 * Generates localized voice prompt for Lifestyle questions.
 */
export function getAyushLifestyleVoicePrompt(question, langCode = "en-IN") {
  if (!question) return "";
  const lang = String(langCode).toLowerCase().slice(0, 2);

  switch (lang) {
    case "hi":
      return `जीवनशैली एवं आहार-विहार: ${question.titleHi || question.labelHi || question.title || question.label}।`;
    case "bn":
      return `জীবনযাত্রা ও অভ্যাস: ${question.titleBn || question.labelBn || question.title || question.label}।`;
    case "mr":
      return `जीवनशैली आणि सवयी: ${question.titleMr || question.labelMr || question.title || question.label}।`;
    case "te":
      return `జీవనశైలి మరియు అలవాట్లు: ${question.titleTe || question.labelTe || question.title || question.label}.`;
    case "ta":
      return `வாழ்க்கை முறை மற்றும் பழக்கவழக்கங்கள்: ${question.titleTa || question.labelTa || question.title || question.label}.`;
    case "en":
    default:
      return `Lifestyle and habits: ${question.title || question.label}.`;
  }
}

/**
 * Generates localized voice prompt for Classical Ayurvedic Diagnostic Report summary.
 */
export function getAyushReportVoicePrompt(profile, langCode = "en-IN") {
  if (!profile) return "";
  const lang = String(langCode).toLowerCase().slice(0, 2);
  const prakritiType = profile.prakriti?.type || "Tridoshic";
  const vikritiType = profile.vikriti?.dominant || "Balanced";

  switch (lang) {
    case "hi":
      return `शास्त्रीय आयुर्वेदिक निदान रिपोर्ट। मुख्य प्रकृति: ${prakritiType}। मुख्य विकृति: ${vikritiType}।`;
    case "bn":
      return `আয়ুর্বেদিক রিপোর্ট। প্রধান প্রকৃতি: ${prakritiType}। প্রধান বিকৃতি: ${vikritiType}।`;
    case "mr":
      return `आयुर्वेदिक अहवाल. मुख्य प्रकृती: ${prakritiType}. मुख्य विकृती: ${vikritiType}.`;
    case "te":
      return `ఆయుర్వేద నివేదిక. ప్రధాన ప్రకృతి: ${prakritiType}. ప్రధాన వికృతి: ${vikritiType}.`;
    case "ta":
      return `ஆயுர்வேத அறிக்கை. முக்கிய பிரகிருதி: ${prakritiType}. முக்கிய விகிருதி: ${vikritiType}.`;
    case "en":
    default:
      return `Classical Ayurvedic Diagnostic Report. Dominant constitution: ${prakritiType}. Dominant Vikriti: ${vikritiType}.`;
  }
}

