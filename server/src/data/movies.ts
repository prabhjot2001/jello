export interface Movie {
  id: string;
  title: string;
  aliases?: string[];
  emojis: string;
  clues: [string, string, string];
  line?: { text: string; answers: string[] };
  /** optional: file inside client/public/frames/ (use an opaque name like "f01.jpg") */
  frame?: string;
  /** optional: file inside client/public/clips/ (use an opaque name like "c01.mp3") */
  audio?: string;
  year?: number;
  tmdbId?: number;
}

export const MOVIES: Movie[] = [
  {
    id: "3-idiots",
    title: "3 Idiots",
    aliases: ["three idiots"],
    emojis: "👨‍🎓👨‍🎓👨‍🎓🏫🎓",
    clues: [
      "Three engineering students become best friends.",
      "A strict college director is nicknamed after a virus.",
      "A famous catchphrase says everything will be fine.",
    ],
    line: { text: '"Aal izz ____!"', answers: ["well"] },
  },
  {
    id: "dangal",
    title: "Dangal",
    emojis: "🤼🥇👨‍👧‍👧🇮🇳",
    clues: [
      "A true story about a family from Haryana.",
      "A father trains his daughters to be wrestlers.",
      "One daughter wins gold at the Commonwealth Games.",
    ],
  },
  {
    id: "sholay",
    title: "Sholay",
    emojis: "🔥🐎🔫🏜️👬",
    clues: [
      "Two small-time crooks are hired by a retired police officer.",
      "The story is set in a village called Ramgarh.",
      "The villain is a bandit named Gabbar Singh.",
    ],
    line: { text: '"Kitne ____ the?"', answers: ["aadmi", "admi"] },
  },
  {
    id: "ddlj",
    title: "Dilwale Dulhania Le Jayenge",
    aliases: ["ddlj"],
    emojis: "🚂🧳🌼💑🇬🇧",
    clues: [
      "Two young Indians meet on a trip across Europe.",
      "Her strict father has already arranged her marriage.",
      "The ending has a moving train and an outstretched hand.",
    ],
  },
  {
    id: "lagaan",
    title: "Lagaan",
    emojis: "🏏🌾☀️👑🇬🇧",
    clues: [
      "A drought-hit village in colonial India.",
      "The villagers must win a cricket match to avoid paying tax.",
      "It was nominated for the Oscar for Best Foreign Language Film.",
    ],
  },
  {
    id: "k3g",
    title: "Kabhi Khushi Kabhie Gham",
    aliases: ["k3g", "kabhi khushi kabhi gham"],
    emojis: "👨‍👩‍👦🏰😢🎶🪔",
    clues: [
      "A wealthy family is torn apart when a son marries against his father's wishes.",
      "The title means 'sometimes happy, sometimes sad'.",
      "A huge ensemble cast including Amitabh Bachchan, Shah Rukh Khan and Kajol.",
    ],
  },
  {
    id: "znmd",
    title: "Zindagi Na Milegi Dobara",
    aliases: ["znmd"],
    emojis: "🚗🇪🇸🤿🪂🍅",
    clues: [
      "Three friends go on a bachelor trip together.",
      "The road trip crosses Spain, with scuba diving and skydiving.",
      "It features the La Tomatina tomato festival.",
    ],
  },
  {
    id: "gully-boy",
    title: "Gully Boy",
    emojis: "🎤🎧🏙️🔥",
    clues: [
      "A young man from a Mumbai slum dreams of becoming a rapper.",
      "Inspired by real street rappers Naezy and Divine.",
      "It was India's official Oscar entry for 2020.",
    ],
  },
  {
    id: "pk",
    title: "PK",
    emojis: "👽📻🛸🙏",
    clues: [
      "An alien lands in India and loses something important.",
      "He keeps asking innocent questions about religion and rituals.",
      "His stolen device is the key to going home.",
    ],
  },
  {
    id: "dhoom",
    title: "Dhoom",
    emojis: "🏍️💨🚔💰",
    clues: [
      "A gang of thieves escapes on superbikes.",
      "A police officer teams up with a bike mechanic to chase them.",
      "It started a long-running action franchise.",
    ],
  },
  {
    id: "kkhh",
    title: "Kuch Kuch Hota Hai",
    aliases: ["kkhh"],
    emojis: "🏀🏕️👧💘",
    clues: [
      "Best friends in college slowly drift apart.",
      "Years later, a little girl tries to reunite her father with his old friend.",
      "A summer camp and a basketball court play big roles.",
    ],
    line: { text: '"Pyaar ____ hai."', answers: ["dosti"] },
  },
  {
    id: "chak-de",
    title: "Chak De! India",
    aliases: ["chak de india"],
    emojis: "🏑🇮🇳🏆💪",
    clues: [
      "A disgraced sportsman returns as a coach.",
      "He trains a women's national team.",
      "The sport is hockey and the climax is a world cup final.",
    ],
    line: {
      text: '"Sattar ____ hain tumhare paas."',
      answers: ["minute", "minutes"],
    },
  },
  {
    id: "jab-we-met",
    title: "Jab We Met",
    emojis: "🚂🌸💬🧳",
    clues: [
      "A heartbroken businessman meets a very chatty girl on a train.",
      "He ends up following her on a journey to Punjab.",
      "Large parts are set in Punjab and Himachal Pradesh.",
    ],
    line: {
      text: '"Main apni ____ hoon."',
      answers: ["favourite", "favorite"],
    },
  },
  {
    id: "queen",
    title: "Queen",
    emojis: "👑✈️🇫🇷🇳🇱",
    clues: [
      "A woman's wedding is called off at the last minute.",
      "She decides to go on her honeymoon alone.",
      "Her trip takes her to Paris and Amsterdam.",
    ],
  },
  {
    id: "bajrangi",
    title: "Bajrangi Bhaijaan",
    aliases: ["bajrangi bhaijan"],
    emojis: "🙏🐒👧🇵🇰🇮🇳",
    clues: [
      "A devout man helps a lost little girl.",
      "The girl cannot speak and is from Pakistan.",
      "He crosses the border without a visa to take her home.",
    ],
  },
  {
    id: "andhadhun",
    title: "Andhadhun",
    emojis: "🎹🕶️🐇🚗",
    clues: [
      "A pianist pretends to be blind.",
      "He witnesses something he was never supposed to see.",
      "A dark comedy thriller with a famously ambiguous ending.",
    ],
  },
  {
    id: "tzp",
    title: "Taare Zameen Par",
    aliases: ["tare zameen par"],
    emojis: "⭐🎨👦📚",
    clues: [
      "A young boy struggles at school and is misunderstood.",
      "An art teacher discovers he has dyslexia.",
      "The title means 'stars on the ground'.",
    ],
  },
  {
    id: "swades",
    title: "Swades",
    emojis: "🛰️🇮🇳⚡🌾",
    clues: [
      "A NASA scientist returns to India to find his old nanny.",
      "He stays in a village without steady electricity.",
      "He builds a small hydroelectric project for the villagers.",
    ],
  },
  {
    id: "munna-bhai",
    title: "Munna Bhai M.B.B.S.",
    aliases: ["munna bhai mbbs"],
    emojis: "🏥💊🤗👨‍⚕️",
    clues: [
      "A gangster pretends to be a doctor and joins medical college.",
      "His loyal sidekick is called Circuit.",
      "He heals patients with a famous magical hug.",
    ],
  },
  
];


export const MORE_MOVIES: Movie[] = [
  // 01
  {
    id: "12th-fail",
    title: "12th Fail",
    emojis: "📚🎓🚂💪",
    clues: [
      "A young man from Chambal struggles to build a better future.",
      "He moves to Delhi to prepare for the civil services examination.",
      "His journey is inspired by IPS officer Manoj Kumar Sharma.",
    ],
    year: 2023,
  },
  // 02
  {
    id: "laapataa-ladies",
    title: "Laapataa Ladies",
    aliases: ["lost ladies"],
    emojis: "🚂👰👰🔍",
    clues: [
      "Two newly married women get separated during a train journey.",
      "One woman reaches the wrong village after a veil-related mix-up.",
      "A gentle comedy about identity, independence and rural India.",
    ],
    year: 2024,
  },
  // 03
  {
    id: "stree",
    title: "Stree",
    emojis: "👻🏘️🧵🌙",
    clues: [
      "A small town is terrorised by a mysterious female spirit.",
      "Men are warned to stay indoors during a particular festival.",
      "The town's slogan asks the spirit to leave the men alone.",
    ],
    year: 2018,
  },
  // 04
  {
    id: "stree-2",
    title: "Stree 2",
    emojis: "👻🗿🏘️🕯️",
    clues: [
      "A familiar small town faces another supernatural threat.",
      "This time, a headless entity targets women.",
      "The gang returns to Chanderi to confront Sarkata.",
    ],
    year: 2024,
  },
  // 05
  {
    id: "tumbbad",
    title: "Tumbbad",
    emojis: "🌧️🏚️💰👹",
    clues: [
      "A family becomes obsessed with a hidden supernatural treasure.",
      "A mysterious deity is associated with endless greed.",
      "The central legend revolves around Hastar and a cursed womb.",
    ],
    year: 2018,
  },
  // 06
  {
    id: "drishyam",
    title: "Drishyam",
    emojis: "📺👨‍👩‍👧‍👧🔍🧩",
    clues: [
      "A cable-TV operator will do anything to protect his family.",
      "A police investigation follows the disappearance of a young man.",
      "The protagonist builds an alibi using films and carefully planned dates.",
    ],
    year: 2015,
  },
  // 07
  {
    id: "drishyam-2",
    title: "Drishyam 2",
    emojis: "🎥⚖️🧩🚔",
    clues: [
      "A family tries to move on years after a disappearance.",
      "A buried secret resurfaces through a renewed investigation.",
      "The protagonist's cinema project plays a crucial role in the mystery.",
    ],
    year: 2022,
  },
  // 08
  {
    id: "kahaani",
    title: "Kahaani",
    emojis: "🤰🚇🔍🏙️",
    clues: [
      "A pregnant woman travels to Kolkata searching for her husband.",
      "Nobody seems to know the missing man she describes.",
      "Vidya Balan leads this thriller with a major final twist.",
    ],
    year: 2012,
  },
  // 09
  {
    id: "badla",
    title: "Badla",
    emojis: "🏨🪟🕵️‍♀️⚖️",
    clues: [
      "A successful businesswoman is accused of murder.",
      "A lawyer questions her about a locked-room mystery.",
      "Amitabh Bachchan and Taapsee Pannu star in this thriller.",
    ],
    year: 2019,
  },
  // 10
  {
    id: "talaash",
    title: "Talaash",
    emojis: "🚔🌃🌊👻",
    clues: [
      "A police officer investigates a celebrity's mysterious death.",
      "His own grief affects the investigation.",
      "The story stars Aamir Khan, Rani Mukerji and Kareena Kapoor Khan.",
    ],
    year: 2012,
  },
  // 11
  {
    id: "special-26",
    title: "Special 26",
    emojis: "🕵️‍♂️💼💰🚨",
    clues: [
      "A gang poses as government officials to conduct fake raids.",
      "Their targets include wealthy businessmen and corrupt officials.",
      "The plot is inspired by a famous 1987 jewellery heist.",
    ],
    year: 2013,
  },
  // 12
  {
    id: "baby",
    title: "Baby",
    emojis: "🕶️🎯✈️💣",
    clues: [
      "A covert Indian counterterrorism unit handles dangerous missions.",
      "A team races across international locations to stop an attack.",
      "Akshay Kumar plays an intelligence operative named Ajay Singh Rajput.",
    ],
    year: 2015,
  },
  // 13
  {
    id: "pink",
    title: "Pink",
    emojis: "⚖️👩🚕🏙️",
    clues: [
      "Three young women become involved in a criminal case.",
      "A retired lawyer takes up their defence.",
      "The courtroom drama challenges assumptions about consent.",
    ],
    year: 2016,
  },
  // 14
  {
    id: "article-15",
    title: "Article 15",
    emojis: "🚔📜🌾⚖️",
    clues: [
      "A police officer investigates the disappearance of village girls.",
      "The investigation exposes deep-rooted caste discrimination.",
      "Ayushmann Khurrana plays IPS officer Ayan Ranjan.",
    ],
    year: 2019,
  },
  // 15
  {
    id: "talvar",
    title: "Talvar",
    emojis: "🔍🏠📰⚖️",
    clues: [
      "A double-murder investigation produces conflicting theories.",
      "The case involves a teenage girl and a household employee.",
      "The film dramatises the Noida double-murder case.",
    ],
    year: 2015,
  },
  // 16
  {
    id: "a-wednesday",
    title: "A Wednesday!",
    emojis: "📞💣🚔🏙️",
    clues: [
      "An ordinary-looking man makes alarming calls to the police.",
      "He claims to have planted bombs around a major city.",
      "Naseeruddin Shah and Anupam Kher star in this thriller.",
    ],
    year: 2008,
  },
  // 17
  {
    id: "black-friday",
    title: "Black Friday",
    emojis: "🚔📰🏙️💥",
    clues: [
      "A crime drama reconstructs a devastating series of bomb blasts.",
      "Investigators trace a conspiracy involving Mumbai.",
      "Anurag Kashyap directed this film about the 1993 blasts.",
    ],
    year: 2004,
  },
  // 18
  {
    id: "haider",
    title: "Haider",
    emojis: "❄️💀🎭🏔️",
    clues: [
      "A young man returns to a conflict-ridden Kashmir.",
      "His father has disappeared, and his mother has a complicated relationship.",
      "This modern adaptation draws on Shakespeare's Hamlet.",
    ],
    year: 2014,
  },
  // 19
  {
    id: "omkara",
    title: "Omkara",
    emojis: "🔫🧣💔🎭",
    clues: [
      "A political enforcer begins to doubt the loyalty of his closest aide.",
      "Jealousy destroys a relationship built on trust.",
      "Vishal Bhardwaj adapted Shakespeare's Othello into rural India.",
    ],
    year: 2006,
  },
  // 20
  {
    id: "maqbool",
    title: "Maqbool",
    emojis: "👑🔪🌑🎭",
    clues: [
      "A powerful underworld don rules his criminal empire.",
      "His trusted lieutenant falls for the don's mistress.",
      "This crime drama reimagines Shakespeare's Macbeth.",
    ],
    year: 2003,
  },
  // 21
  {
    id: "gangs-of-wasseypur",
    title: "Gangs of Wasseypur",
    aliases: ["gows", "gangs of wasseypur part 1"],
    emojis: "🔫⛏️🔥👨‍👦",
    clues: [
      "Rival families fight over coal, power and revenge.",
      "The saga spans several decades in eastern India.",
      "Anurag Kashyap directed this crime epic featuring Sardar Khan.",
    ],
    year: 2012,
  },
  // 22
  {
    id: "dev-d",
    title: "Dev.D",
    emojis: "🍷💔🚕🌃",
    clues: [
      "A modern, self-destructive lover struggles with heartbreak.",
      "Three troubled characters follow different paths through life.",
      "Anurag Kashyap gives a contemporary twist to Devdas.",
    ],
    year: 2009,
  },
  // 23
  {
    id: "udaan",
    title: "Udaan",
    emojis: "🏭📝🛤️🕊️",
    clues: [
      "A teenager returns home after being expelled from boarding school.",
      "His strict father wants him to join a factory.",
      "The young man dreams of becoming a writer.",
    ],
    year: 2010,
  },
  // 24
  {
    id: "masaan",
    title: "Masaan",
    emojis: "🌊🔥💔🪔",
    clues: [
      "Two lives unfold against the backdrop of Varanasi.",
      "A young woman faces social judgement after a personal tragedy.",
      "The film features the song 'Tu Kisi Rail Si'.",
    ],
    year: 2015,
  },
  // 25
  {
    id: "the-lunchbox",
    title: "The Lunchbox",
    aliases: ["lunchbox"],
    emojis: "🍱💌🚂❤️",
    clues: [
      "A wrongly delivered lunch begins an unexpected friendship.",
      "Two lonely people communicate through handwritten notes.",
      "Irrfan Khan and Nimrat Kaur star in this Mumbai-set drama.",
    ],
    year: 2013,
  },
  // 26
  {
    id: "piku",
    title: "Piku",
    emojis: "🚗👨‍👧🍲🛣️",
    clues: [
      "An independent architect has a complicated relationship with her father.",
      "A road trip connects Delhi and Kolkata.",
      "Amitabh Bachchan plays a father obsessed with his digestion.",
    ],
    year: 2015,
  },
  // 27
  {
    id: "vicky-donor",
    title: "Vicky Donor",
    emojis: "🧬👶🏥😂",
    clues: [
      "A young man takes an unusual part-time job at a fertility clinic.",
      "His sperm donation becomes a source of both comedy and conflict.",
      "Ayushmann Khurrana made his lead-acting debut in this film.",
    ],
    year: 2012,
  },
  // 28
  {
    id: "bareilly-ki-barfi",
    title: "Bareilly Ki Barfi",
    emojis: "📖💌🍬❤️",
    clues: [
      "A small-town woman searches for the writer of a book she loves.",
      "Two men become entangled in a romantic deception.",
      "The cast includes Kriti Sanon, Ayushmann Khurrana and Rajkummar Rao.",
    ],
    year: 2017,
  },
  // 29
  {
    id: "badhaai-ho",
    title: "Badhaai Ho",
    emojis: "👨‍👩‍👦👶😂🏠",
    clues: [
      "A middle-aged couple unexpectedly announces a pregnancy.",
      "Their adult children struggle with the news and social embarrassment.",
      "Ayushmann Khurrana plays Nakul Kaushik.",
    ],
    year: 2018,
  },
  // 30
  {
    id: "shubh-mangal-saavdhan",
    title: "Shubh Mangal Saavdhan",
    emojis: "💍❤️😂🩺",
    clues: [
      "A couple discovers an intimate problem before their wedding.",
      "They try to navigate family pressure and awkward conversations.",
      "Ayushmann Khurrana and Bhumi Pednekar star in this romantic comedy.",
    ],
    year: 2017,
  },
  // 31
  {
    id: "dum-laga-ke-haisha",
    title: "Dum Laga Ke Haisha",
    emojis: "💍🏃📼❤️",
    clues: [
      "A reluctant husband struggles to accept his confident wife.",
      "A local competition forces the couple to work together.",
      "The story is set in 1990s Haridwar.",
    ],
    year: 2015,
  },
  // 32
  {
    id: "hasee-toh-phasee",
    title: "Hasee Toh Phasee",
    emojis: "🧪💊💍💘",
    clues: [
      "A man develops feelings for his fiancée's eccentric sister.",
      "The heroine is a brilliant but unconventional scientist.",
      "Parineeti Chopra and Sidharth Malhotra star together.",
    ],
    year: 2014,
  },
  // 33
  {
    id: "band-baaja-baaraat",
    title: "Band Baaja Baaraat",
    emojis: "💍🎉💃💼",
    clues: [
      "Two young entrepreneurs start a wedding-planning business.",
      "They make a rule against getting romantically involved with clients or each other.",
      "Ranveer Singh made his film debut in this romantic comedy.",
    ],
    year: 2010,
  },
  // 34
  {
    id: "ladies-vs-ricky-bahl",
    title: "Ladies vs Ricky Bahl",
    emojis: "🎩💸💃🕵️",
    clues: [
      "A charming conman deceives women for money.",
      "Three women team up to teach him a lesson.",
      "Ranveer Singh plays the smooth-talking title character.",
    ],
    year: 2011,
  },
  // 35
  {
    id: "ishaqzaade",
    title: "Ishaqzaade",
    emojis: "❤️🔫🏇🔥",
    clues: [
      "Two young people from rival political families fall in love.",
      "Their relationship becomes entangled with violence and family honour.",
      "Arjun Kapoor and Parineeti Chopra play the central couple.",
    ],
    year: 2012,
  },
  // 36
  {
    id: "2-states",
    title: "2 States",
    aliases: ["two states"],
    emojis: "💑📚🇮🇳💍",
    clues: [
      "Two students fall in love while studying at a prestigious institute.",
      "Their families come from different Indian cultural backgrounds.",
      "The story is based on a novel by Chetan Bhagat.",
    ],
    year: 2014,
  },
  // 37
  {
    id: "humpty-sharma",
    title: "Humpty Sharma Ki Dulhania",
    emojis: "💍🚗❤️🎶",
    clues: [
      "A young woman travels to Delhi to shop for her arranged wedding.",
      "A carefree young man tries to win her heart.",
      "Varun Dhawan and Alia Bhatt lead this romance.",
    ],
    year: 2014,
  },
  // 38
  {
    id: "badrinath-ki-dulhania",
    title: "Badrinath Ki Dulhania",
    emojis: "✈️💍❤️🕺",
    clues: [
      "A small-town businessman falls for an ambitious woman.",
      "She dreams of financial independence and a career of her own.",
      "Varun Dhawan and Alia Bhatt reunite in this sequel.",
    ],
    year: 2017,
  },
  // 39
  {
    id: "rocky-aur-rani",
    title: "Rocky Aur Rani Kii Prem Kahaani",
    aliases: ["rocky aur rani"],
    emojis: "💃🕺🏠💞",
    clues: [
      "A lively Punjabi man falls for an educated Bengali journalist.",
      "The couple lives with each other's families before marriage.",
      "Karan Johar directed this family romance starring Ranveer Singh and Alia Bhatt.",
    ],
    year: 2023,
  },
  // 40
  {
    id: "ae-dil-hai-mushkil",
    title: "Ae Dil Hai Mushkil",
    emojis: "🎤💔✈️🌹",
    clues: [
      "A singer develops feelings for a woman who sees him as a friend.",
      "Unrequited love shapes several relationships.",
      "The title track became one of the film's most recognisable songs.",
    ],
    year: 2016,
  },
  // 41
  {
    id: "tamasha",
    title: "Tamasha",
    emojis: "🎭🧳❤️🌴",
    clues: [
      "Two strangers meet while travelling abroad and hide their real identities.",
      "Years later, their reunion challenges a man's conventional life.",
      "Ranbir Kapoor and Deepika Padukone star in this Imtiaz Ali film.",
    ],
    year: 2015,
  },
  // 42
  {
    id: "rockstar",
    title: "Rockstar",
    emojis: "🎸🎤💔🎶",
    clues: [
      "A college student wants heartbreak to fuel his music.",
      "His rise to fame comes with emotional turmoil.",
      "Ranbir Kapoor plays musician Jordan.",
    ],
    year: 2011,
  },
  // 43
  {
    id: "barfi",
    title: "Barfi!",
    emojis: "🎩🤟❤️🚂",
    clues: [
      "A cheerful young man who cannot hear or speak charms people around him.",
      "His relationships involve a woman with autism and an old love.",
      "Ranbir Kapoor, Priyanka Chopra and Ileana D'Cruz star in the film.",
    ],
    year: 2012,
  },
  // 44
  {
    id: "ludo",
    title: "Ludo",
    emojis: "🎲🔫🚕❤️",
    clues: [
      "Several seemingly unrelated lives collide through crime and coincidence.",
      "A gangster named Sattu becomes entangled in multiple stories.",
      "The film's title refers to a board game.",
    ],
    year: 2020,
  },
  // 45
  {
    id: "jagga-jasoos",
    title: "Jagga Jasoos",
    emojis: "🔍🎩🎶🌍",
    clues: [
      "A young detective has a stutter and often communicates through songs.",
      "He searches for his missing father alongside a journalist.",
      "Ranbir Kapoor and Katrina Kaif star in this musical adventure.",
    ],
    year: 2017,
  },
  // 46
  {
    id: "anjaana-anjaani",
    title: "Anjaana Anjaani",
    emojis: "🌉🚗❤️🎆",
    clues: [
      "Two strangers meet when both are struggling with life.",
      "They make a pact to fulfil a list of experiences together.",
      "Ranbir Kapoor and Priyanka Chopra star in this romance.",
    ],
    year: 2010,
  },
  // 47
  {
    id: "wake-up-sid",
    title: "Wake Up Sid",
    emojis: "📷🌆☕🌱",
    clues: [
      "A carefree college student must learn to become independent.",
      "A writer helps him discover responsibility and purpose.",
      "Ranbir Kapoor plays Sid Mehra in this coming-of-age film.",
    ],
    year: 2009,
  },
  // 48
  {
    id: "dil-chahta-hai",
    title: "Dil Chahta Hai",
    emojis: "👬🚗🌊🎸",
    clues: [
      "Three close friends face adulthood and changing relationships.",
      "A trip to Goa becomes an important memory.",
      "Farhan Akhtar made his directorial debut with this film.",
    ],
    year: 2001,
  },
  // 49
  {
    id: "lakshya",
    title: "Lakshya",
    emojis: "🎖️🏔️🪖🇮🇳",
    clues: [
      "An aimless young man struggles to find direction in life.",
      "He joins the Indian Army and transforms into a soldier.",
      "The climax is set during the Kargil War.",
    ],
    year: 2004,
  },
  // 50
  {
    id: "rang-de-basanti",
    title: "Rang De Basanti",
    emojis: "🎥🇮🇳🔥🕊️",
    clues: [
      "A British filmmaker casts Indian students in a historical film.",
      "The students begin drawing parallels between history and modern corruption.",
      "The ensemble includes Aamir Khan, Siddharth and R. Madhavan.",
    ],
    year: 2006,
  },
  // 51
  {
    id: "yuva",
    title: "Yuva",
    emojis: "🚦🎓🗳️🏙️",
    clues: [
      "Three young men from different backgrounds cross paths.",
      "Student politics and political corruption shape their lives.",
      "Mani Ratnam directed this multi-character drama.",
    ],
    year: 2004,
  },
  // 52
  {
    id: "guru",
    title: "Guru",
    emojis: "🏭💼📈💍",
    clues: [
      "A small-town man arrives in Bombay with ambitious business dreams.",
      "He builds a powerful industrial empire despite controversy.",
      "Abhishek Bachchan plays Gurukant Desai.",
    ],
    year: 2007,
  },
  // 53
  {
    id: "bombay",
    title: "Bombay",
    emojis: "🏙️❤️🕊️🔥",
    clues: [
      "An interfaith couple builds a family in a major Indian city.",
      "Their family is caught amid communal violence.",
      "Mani Ratnam directed this film with music by A. R. Rahman.",
    ],
    year: 1995,
  },
  // 54
  {
    id: "roja",
    title: "Roja",
    emojis: "🌹🏔️🇮🇳🔍",
    clues: [
      "A newly married woman searches desperately for her kidnapped husband.",
      "The husband is an intelligence specialist.",
      "This Tamil film became famous across India for its soundtrack.",
    ],
    year: 1992,
  },
  // 55
  {
    id: "dil-se",
    title: "Dil Se..",
    emojis: "📻🚂❤️💣",
    clues: [
      "A radio journalist falls for a mysterious woman he meets while travelling.",
      "Their romance unfolds against a backdrop of political conflict.",
      "The film features the song 'Chaiyya Chaiyya'.",
    ],
    year: 1998,
  },
  // 56
  {
    id: "fanaa",
    title: "Fanaa",
    emojis: "❄️❤️🕶️💥",
    clues: [
      "A visually impaired woman falls for a charming tour guide.",
      "A reunion years later reveals a dangerous secret.",
      "Aamir Khan and Kajol star in this romantic thriller.",
    ],
    year: 2006,
  },
  // 57
  {
    id: "hum-tum",
    title: "Hum Tum",
    emojis: "✈️🎨❤️☔",
    clues: [
      "Two people repeatedly cross paths over several years.",
      "A cartoonist and a woman with very different views on love clash.",
      "Saif Ali Khan and Rani Mukerji star in this romantic comedy.",
    ],
    year: 2004,
  },
  // 58
  {
    id: "salaam-namaste",
    title: "Salaam Namaste",
    emojis: "🇦🇺🏠❤️👶",
    clues: [
      "Two Indians begin a live-in relationship in Melbourne.",
      "Their relationship faces an unexpected pregnancy.",
      "Saif Ali Khan and Preity Zinta lead this modern romance.",
    ],
    year: 2005,
  },
  // 59
  {
    id: "kal-ho-naa-ho",
    title: "Kal Ho Naa Ho",
    emojis: "❤️🏙️🎹😭",
    clues: [
      "A cheerful newcomer changes the lives of a troubled family.",
      "A young woman falls in love with a man hiding a serious secret.",
      "The story features Naina, Aman and Rohit in New York.",
    ],
    year: 2003,
  },
  // 60
  {
    id: "veer-zaara",
    title: "Veer-Zaara",
    emojis: "✈️🇮🇳🇵🇰❤️",
    clues: [
      "An Indian Air Force officer falls in love with a Pakistani woman.",
      "Their romance spans decades and a long imprisonment.",
      "Yash Chopra directed this cross-border love story.",
    ],
    year: 2004,
  },
  // 61
  {
    id: "mohabbatein",
    title: "Mohabbatein",
    emojis: "🎻🏫❤️🌹",
    clues: [
      "A strict headmaster forbids romance at his prestigious school.",
      "A music teacher encourages three students to follow their hearts.",
      "Amitabh Bachchan and Shah Rukh Khan face off over tradition and love.",
    ],
    year: 2000,
  },
  // 62
  {
    id: "rab-ne-bana-di-jodi",
    title: "Rab Ne Bana Di Jodi",
    aliases: ["rab ne bana di jodi", "rnBDJ"],
    emojis: "👓💃💍❤️",
    clues: [
      "A quiet office worker transforms himself to impress his wife.",
      "His wife joins a dance competition with a new partner.",
      "Shah Rukh Khan plays both Surinder Sahni and his alter ego Raj.",
    ],
    year: 2008,
  },
  // 63
  {
    id: "my-name-is-khan",
    title: "My Name Is Khan",
    emojis: "✈️🇺🇸❤️🕊️",
    clues: [
      "A man travels across America to deliver a message to the president.",
      "He is autistic and faces prejudice after a major terrorist attack.",
      "Shah Rukh Khan and Kajol star in this drama.",
    ],
    year: 2010,
  },
  // 64
  {
    id: "raees",
    title: "Raees",
    emojis: "🕶️🥃🚔💰",
    clues: [
      "A bootlegger builds a powerful criminal business in Gujarat.",
      "A determined police officer tries to bring him down.",
      "Shah Rukh Khan plays the title character, known for his sharp glasses.",
    ],
    year: 2017,
  },
  // 65
  {
    id: "don",
    title: "Don",
    emojis: "🕶️💼🔫🌆",
    clues: [
      "An ordinary man is recruited to impersonate a dangerous criminal.",
      "The plan involves infiltrating an international drug syndicate.",
      "Shah Rukh Khan plays a notorious gangster in this remake.",
    ],
    year: 2006,
  },
  // 66
  {
    id: "don-2",
    title: "Don 2",
    emojis: "🏦🕶️💎🚔",
    clues: [
      "A criminal mastermind plans a high-security bank heist in Europe.",
      "He assembles a team while evading law enforcement.",
      "The action moves to Berlin, where a vault becomes the target.",
    ],
    year: 2011,
  },
  // 67
  {
    id: "war",
    title: "War",
    emojis: "🕶️✈️💥🏍️",
    clues: [
      "An elite soldier is assigned to hunt down his former mentor.",
      "The chase spans multiple countries and spectacular action sequences.",
      "Hrithik Roshan and Tiger Shroff play opposing agents.",
    ],
    year: 2019,
  },
  // 68
  {
    id: "pathaan",
    title: "Pathaan",
    emojis: "🕶️🌍✈️💣",
    clues: [
      "An Indian spy returns to stop a dangerous international threat.",
      "A former agent leads a private terrorist organisation.",
      "Shah Rukh Khan plays a RAW operative in the YRF Spy Universe.",
    ],
    year: 2023,
  },
  // 69
  {
    id: "jawan",
    title: "Jawan",
    emojis: "🎭🚇🕶️🔥",
    clues: [
      "A masked vigilante carries out a series of high-profile operations.",
      "His missions target corruption and public injustice.",
      "Shah Rukh Khan appears in dual roles directed by Atlee.",
    ],
    year: 2023,
  },
  // 70
  {
    id: "gadar",
    title: "Gadar: Ek Prem Katha",
    aliases: ["gadar"],
    emojis: "🚂🇮🇳🇵🇰❤️",
    clues: [
      "A Sikh truck driver falls in love with a Muslim woman during Partition.",
      "He travels across the border to bring her back.",
      "Sunny Deol plays Tara Singh, famous for an iconic hand-pump scene.",
    ],
    year: 2001,
  },
  // 71
  {
    id: "gadar-2",
    title: "Gadar 2",
    emojis: "🚂🪖🇮🇳🇵🇰",
    clues: [
      "A father crosses the border to rescue his captured son.",
      "The story continues the Singh family's journey during a period of conflict.",
      "Sunny Deol returns as Tara Singh.",
    ],
    year: 2023,
  },
  // 72
  {
    id: "border",
    title: "Border",
    emojis: "🪖🏜️🇮🇳💥",
    clues: [
      "A group of Indian soldiers defend an isolated desert post.",
      "Their unit faces a much larger opposing force.",
      "The film depicts the Battle of Longewala during the 1971 war.",
    ],
    year: 1997,
  },
  // 73
  {
    id: "loc-kargil",
    title: "LOC: Kargil",
    emojis: "🏔️🪖🇮🇳🎖️",
    clues: [
      "Multiple military units fight to reclaim strategic mountain positions.",
      "The story follows soldiers during the 1999 Kargil conflict.",
      "J. P. Dutta directed this large-scale war drama.",
    ],
    year: 2003,
  },
  // 74
  {
    id: "uri",
    title: "Uri: The Surgical Strike",
    emojis: "🪖🌙🎯🇮🇳",
    clues: [
      "An Indian military operation follows an attack on an army base.",
      "Special forces conduct a cross-border mission.",
      "The film popularised the line about how the enemy's response would be handled.",
    ],
    year: 2019,
  },
  // 75
  {
    id: "shershaah",
    title: "Shershaah",
    emojis: "🏔️🪖❤️🇮🇳",
    clues: [
      "A young officer dreams of serving in the Indian Army.",
      "His love story unfolds alongside his military career.",
      "Sidharth Malhotra portrays Captain Vikram Batra.",
    ],
    year: 2021,
  },
  // 76
  {
    id: "bhaag-milkha-bhaag",
    title: "Bhaag Milkha Bhaag",
    emojis: "🏃🥇🇮🇳🏟️",
    clues: [
      "A runner overcomes a traumatic childhood and personal hardship.",
      "His career takes him to international athletics competitions.",
      "Farhan Akhtar portrays the athlete known as the Flying Sikh.",
    ],
    year: 2013,
  },
  // 77
  {
    id: "mary-kom",
    title: "Mary Kom",
    emojis: "🥊🏆👩🇮🇳",
    clues: [
      "A woman fights social expectations to pursue professional boxing.",
      "She balances family life with a demanding sporting career.",
      "Priyanka Chopra portrays the celebrated Indian boxer.",
    ],
    year: 2014,
  },
  // 78
  {
    id: "sultan",
    title: "Sultan",
    emojis: "🤼🥇❤️🏟️",
    clues: [
      "A wrestler rises from a small town to national fame.",
      "Personal tragedy and pride threaten his career.",
      "Salman Khan plays the title character opposite Anushka Sharma.",
    ],
    year: 2016,
  },
  // 79
  {
    id: "jolly-llb",
    title: "Jolly LLB",
    emojis: "⚖️📁😂🏛️",
    clues: [
      "An ambitious but struggling lawyer takes on a powerful case.",
      "The trial involves a hit-and-run incident and influential people.",
      "Arshad Warsi plays a lawyer nicknamed Jolly.",
    ],
    year: 2013,
  },
  // 80
  {
    id: "jolly-llb-2",
    title: "Jolly LLB 2",
    emojis: "⚖️🚔📜😂",
    clues: [
      "A small-time lawyer becomes involved in a case concerning a fake encounter.",
      "His courtroom battle challenges police conduct.",
      "Akshay Kumar plays Jagdishwar Mishra, known as Jolly.",
    ],
    year: 2017,
  },
  // 81
  {
    id: "omg",
    title: "OMG: Oh My God!",
    aliases: ["oh my god"],
    emojis: "🙏⚖️🛕😂",
    clues: [
      "A shopkeeper sues religious institutions after a disaster destroys his store.",
      "A mysterious man helps him challenge superstition and exploitation.",
      "Paresh Rawal and Akshay Kumar star in this social satire.",
    ],
    year: 2012,
  },
  // 82
  {
    id: "omg-2",
    title: "OMG 2",
    emojis: "🏫⚖️🙏📚",
    clues: [
      "A father takes legal action after his son faces humiliation at school.",
      "The story tackles sex education and social taboos.",
      "Pankaj Tripathi and Akshay Kumar star in this sequel.",
    ],
    year: 2023,
  },
  // 83
  {
    id: "fukrey",
    title: "Fukrey",
    emojis: "💸🎓🐓😂",
    clues: [
      "Four friends dream of getting rich through an unusual scheme.",
      "A bizarre prediction helps them plan a lottery-related scam.",
      "The gang includes Hunny, Choocha, Lali and Zafar.",
    ],
    year: 2013,
  },
  // 84
  {
    id: "fukrey-returns",
    title: "Fukrey Returns",
    emojis: "💰🐓👬😂",
    clues: [
      "A group of friends finds itself in trouble after a strange dream.",
      "A powerful local politician seeks revenge.",
      "The sequel brings back the lovable Choocha and his friends.",
    ],
    year: 2017,
  },
  // 85
  {
    id: "delhi-belly",
    title: "Delhi Belly",
    emojis: "🚽🏙️💎😂",
    clues: [
      "Three roommates accidentally become involved in a criminal mess.",
      "A package mix-up puts them in danger.",
      "The dark comedy features the song 'Bhaag D.K. Bose'.",
    ],
    year: 2011,
  },
  // 86
  {
    id: "khosla-ka-ghosla",
    title: "Khosla Ka Ghosla",
    emojis: "🏠📄😂👨‍👦",
    clues: [
      "A middle-class family discovers its plot of land has been grabbed.",
      "The family devises a clever plan to reclaim its property.",
      "Anupam Kher plays the worried father Kamal Kishore Khosla.",
    ],
    year: 2006,
  },
  // 87
  {
    id: "oye-lucky",
    title: "Oye Lucky! Lucky Oye!",
    emojis: "🕵️‍♂️🏠💰😂",
    clues: [
      "A charismatic young man becomes famous for stealing from the wealthy.",
      "His crimes expose class differences and social hypocrisy.",
      "Abhay Deol plays a thief inspired by a real-life criminal.",
    ],
    year: 2008,
  },
  // 88
  {
    id: "phas-gaye-re-obama",
    title: "Phas Gaye Re Obama",
    emojis: "💵🏚️😂🔫",
    clues: [
      "A financially ruined NRI returns to India to sell ancestral property.",
      "Kidnappers target him, expecting a huge ransom.",
      "The recession provides the central joke of this crime comedy.",
    ],
    year: 2010,
  },
  // 89
  {
    id: "jaane-bhi-do-yaaro",
    title: "Jaane Bhi Do Yaaro",
    emojis: "📷🏗️💀😂",
    clues: [
      "Two photographers uncover corruption in the construction industry.",
      "A corpse becomes the centre of a series of absurd events.",
      "This cult satire includes a legendary Mahabharata stage sequence.",
    ],
    year: 1983,
  },
  // 90
  {
    id: "chashme-buddoor",
    title: "Chashme Buddoor",
    emojis: "👓📚❤️😂",
    clues: [
      "Three college roommates compete for the attention of a young woman.",
      "Two boastful friends try to impress her but fail.",
      "The original 1981 comedy stars Farooq Shaikh and Deepti Naval.",
    ],
    year: 1981,
  },
  // 91
  {
    id: "angoor",
    title: "Angoor",
    emojis: "🍇👬😂🎭",
    clues: [
      "Two sets of identical twins cause endless confusion.",
      "Mistaken identities turn an ordinary day into chaos.",
      "Sanjeev Kumar and Deven Verma play the double roles.",
    ],
    year: 1982,
  },
  // 92
  {
    id: "gol-maal",
    title: "Gol Maal",
    emojis: "👨‍💼👓🏏😂",
    clues: [
      "A young man invents a twin brother to impress his conservative boss.",
      "A fake moustache becomes central to the deception.",
      "Hrishikesh Mukherjee directed this classic comedy starring Amol Palekar.",
    ],
    year: 1979,
  },
  // 93
  {
    id: "hera-pheri",
    title: "Hera Pheri",
    emojis: "📞💰👬😂",
    clues: [
      "Three financially struggling men receive a mysterious phone call.",
      "A kidnapping ransom scheme goes terribly wrong.",
      "The trio consists of Baburao, Raju and Shyam.",
    ],
    year: 2000,
  },
  // 94
  {
    id: "phir-hera-pheri",
    title: "Phir Hera Pheri",
    emojis: "💸🏦😂📞",
    clues: [
      "Three friends become rich and immediately make disastrous investments.",
      "A loan shark and a series of misunderstandings follow.",
      "The story continues the adventures of Raju, Shyam and Baburao.",
    ],
    year: 2006,
  },
  // 95
  {
    id: "bhool-bhulaiyaa",
    title: "Bhool Bhulaiyaa",
    emojis: "🏰👻🔔💃",
    clues: [
      "A family moves into an old mansion with a mysterious locked room.",
      "Strange events lead everyone to suspect a supernatural presence.",
      "Akshay Kumar plays a psychiatrist investigating the case.",
    ],
    year: 2007,
  },
  // 96
  {
    id: "bhool-bhulaiyaa-2",
    title: "Bhool Bhulaiyaa 2",
    emojis: "🏚️👻🗝️💃",
    clues: [
      "A carefree young man encounters a woman connected to a haunted mansion.",
      "An allegedly trapped spirit becomes central to the mystery.",
      "Kartik Aaryan plays Ruhaan, also known as Rooh Baba.",
    ],
    year: 2022,
  },
  // 97
  {
    id: "welcome",
    title: "Welcome",
    emojis: "💍🔫🏰😂",
    clues: [
      "A respectable man falls in love with a woman from a gangster family.",
      "Her relatives try to hide their criminal background.",
      "Uday Shetty and Majnu Bhai are two unforgettable characters.",
    ],
    year: 2007,
  },
  // 98
  {
    id: "dhamaal",
    title: "Dhamaal",
    emojis: "🚗💰🗺️😂",
    clues: [
      "Four friends discover a dying man's secret about hidden treasure.",
      "They race across the country to reach the prize first.",
      "The ensemble comedy includes Riteish Deshmukh, Arshad Warsi and Javed Jaffrey.",
    ],
    year: 2007,
  },
  // 99
  {
    id: "lage-raho-munna-bhai",
    title: "Lage Raho Munna Bhai",
    emojis: "🤗🕊️📻❤️",
    clues: [
      "A gangster begins seeing the spirit of a famous Indian leader.",
      "He uses non-violence to help people solve everyday problems.",
      "Munna Bhai and Circuit return, this time inspired by Mahatma Gandhi.",
    ],
    year: 2006,
  },
  // 100
  {
    id: "rocket-singh",
    title: "Rocket Singh: Salesman of the Year",
    aliases: ["rocket singh"],
    emojis: "💼📦🚀📈",
    clues: [
      "A young graduate struggles to fit into a cutthroat sales company.",
      "He secretly builds an ethical business within his workplace.",
      "Ranbir Kapoor plays Harpreet Singh Bedi.",
    ],
    year: 2009,
  },
];


export const MORE_MOVIES_2017_2024: Movie[] = [
  // ==================== 2017 ====================
  {
    id: "toilet-ek-prem-katha",
    title: "Toilet: Ek Prem Katha",
    emojis: "🚽🏡💍🧹",
    clues: [
      "A newly married woman leaves her husband over a basic household problem.",
      "Her husband campaigns to build a toilet in their village.",
      "Akshay Kumar and Bhumi Pednekar star in this social comedy.",
    ],
    year: 2017,
  },
  {
    id: "secret-superstar",
    title: "Secret Superstar",
    emojis: "🎤🎸👩‍🎤🔒",
    clues: [
      "A teenage girl dreams of becoming a singer despite family restrictions.",
      "She uploads anonymous singing videos while hiding her identity.",
      "Zaira Wasim plays Insia, with Aamir Khan as Shakti Kumar.",
    ],
    year: 2017,
  },
  {
    id: "hindi-medium",
    title: "Hindi Medium",
    emojis: "🏫📚👨‍👩‍👧🇬🇧",
    clues: [
      "Parents try to secure admission for their daughter into an elite school.",
      "A wealthy couple pretends to belong to a poorer neighbourhood.",
      "Irrfan Khan and Saba Qamar star in this education satire.",
    ],
    year: 2017,
  },
  {
    id: "newton",
    title: "Newton",
    emojis: "🗳️🌳🗳️🪖",
    clues: [
      "An election officer insists on conducting a fair vote in a conflict zone.",
      "His polling station is in a remote forest region.",
      "Rajkummar Rao plays an idealistic government clerk.",
    ],
    year: 2017,
  },
  {
    id: "tumhari-sulu",
    title: "Tumhari Sulu",
    emojis: "🎙️📻🌙👩",
    clues: [
      "A homemaker unexpectedly becomes a late-night radio host.",
      "Her cheerful personality helps her connect with callers.",
      "Vidya Balan plays Sulochana, affectionately called Sulu.",
    ],
    year: 2017,
  },
  {
    id: "lipstick-under-my-burkha",
    title: "Lipstick Under My Burkha",
    emojis: "💄🧕🔑🚪",
    clues: [
      "Four women secretly pursue desires that society discourages.",
      "Their stories explore freedom, sexuality and independence.",
      "The title combines a cosmetic item with a traditional garment.",
    ],
    year: 2017,
  },
  {
    id: "trapped",
    title: "Trapped",
    emojis: "🏢🔒🥫🪟",
    clues: [
      "A man becomes locked inside an empty high-rise apartment.",
      "He has little food, water or means of communication.",
      "Rajkummar Rao leads this survival thriller.",
    ],
    year: 2017,
  },
  {
    id: "a-death-in-the-gunj",
    title: "A Death in the Gunj",
    emojis: "🏡🌲🧥🔪",
    clues: [
      "A family holiday in a small town grows increasingly unsettling.",
      "A shy young man feels isolated among relatives and friends.",
      "Konkona Sen Sharma directed this psychological drama.",
    ],
    year: 2017,
  },
  {
    id: "kaabil",
    title: "Kaabil",
    emojis: "👨‍🦯❤️🥊⚖️",
    clues: [
      "A visually impaired couple builds a loving life together.",
      "A devastating crime leads the husband to plan revenge.",
      "Hrithik Roshan and Yami Gautam play the central couple.",
    ],
    year: 2017,
  },
  {
    id: "naam-shabana",
    title: "Naam Shabana",
    emojis: "🕵️‍♀️🎯🥋🗂️",
    clues: [
      "A young woman is recruited into an intelligence operation.",
      "She trains to become a highly capable undercover agent.",
      "Taapsee Pannu plays Shabana Khan in this action spin-off.",
    ],
    year: 2017,
  },
  {
    id: "tiger-zinda-hai",
    title: "Tiger Zinda Hai",
    emojis: "🐅🕶️🏥💥",
    clues: [
      "An Indian agent and a Pakistani agent cooperate on a rescue mission.",
      "They must save nurses held hostage by a terrorist group.",
      "Salman Khan and Katrina Kaif return as Tiger and Zoya.",
    ],
    year: 2017,
  },
  {
    id: "judwaa-2",
    title: "Judwaa 2",
    emojis: "👬✌️💃😂",
    clues: [
      "Separated twin brothers grow up with very different personalities.",
      "Their involuntary reflexes create chaotic situations.",
      "Varun Dhawan plays both brothers in this comedy sequel.",
    ],
    year: 2017,
  },
  {
    id: "golmaal-again",
    title: "Golmaal Again",
    emojis: "👻🏚️🚗😂",
    clues: [
      "A group of childhood friends returns to an orphanage.",
      "Their reunion involves a girl who can communicate with spirits.",
      "Ajay Devgn leads the fourth instalment of a comedy franchise.",
    ],
    year: 2017,
  },
  {
    id: "mom",
    title: "Mom",
    emojis: "👩‍👧⚖️🕵️‍♀️🌑",
    clues: [
      "A mother seeks justice after the legal system fails her daughter.",
      "She secretly takes matters into her own hands.",
      "Sridevi stars as a determined mother in this revenge thriller.",
    ],
    year: 2017,
  },
  {
    id: "haraamkhor",
    title: "Haraamkhor",
    emojis: "🏫📚🤐🌾",
    clues: [
      "A teacher develops an inappropriate relationship with a student.",
      "A rural school becomes the setting for a troubling drama.",
      "Nawazuddin Siddiqui and Shweta Tripathi star in this film.",
    ],
    year: 2017,
  },
  {
    id: "qarib-qarib-singlle",
    title: "Qarib Qarib Singlle",
    emojis: "📱🚆❤️🧳",
    clues: [
      "Two middle-aged singles meet through a dating service.",
      "A trip to revisit an old romance changes their relationship.",
      "Irrfan Khan and Parvathy Thiruvothu star together.",
    ],
    year: 2017,
  },
  {
    id: "chef-2017",
    title: "Chef",
    emojis: "👨‍🍳🍔🚚👦",
    clues: [
      "A professional cook reconnects with his son through food.",
      "He launches a travelling restaurant after leaving his job.",
      "Saif Ali Khan stars in this Hindi adaptation of a food-themed film.",
    ],
    year: 2017,
  },
  {
    id: "mubarakan",
    title: "Mubarakan",
    emojis: "👬💍🎩😂",
    clues: [
      "Identical twins need help navigating their complicated love lives.",
      "Their uncle gets involved in a chain of wedding misunderstandings.",
      "Arjun Kapoor plays the twins, with Anil Kapoor as their uncle.",
    ],
    year: 2017,
  },
  {
    id: "begum-jaan",
    title: "Begum Jaan",
    emojis: "🏚️👭🇮🇳🇵🇰",
    clues: [
      "A brothel's residents refuse to abandon their home.",
      "The Partition boundary threatens to divide their property.",
      "Vidya Balan plays the formidable madam of the house.",
    ],
    year: 2017,
  },
  {
    id: "rukh",
    title: "Rukh",
    emojis: "🚗🌧️👨‍👦🔍",
    clues: [
      "A teenager returns home after his father's sudden death.",
      "He begins to suspect the circumstances were not straightforward.",
      "Manoj Bajpayee stars in this family mystery.",
    ],
    year: 2017,
  },
  {
    id: "mukti-bhawan",
    title: "Mukti Bhawan",
    emojis: "🛕👴🚉👨‍👦",
    clues: [
      "An elderly man believes his time has come to leave this world.",
      "His son accompanies him to a guesthouse in a holy city.",
      "The story explores family duty and mortality in Varanasi.",
    ],
    year: 2017,
  },
  {
    id: "poorna",
    title: "Poorna",
    emojis: "🏔️🧗‍♀️🎒🏆",
    clues: [
      "A young tribal girl discovers a talent for mountaineering.",
      "She trains against tremendous social and physical obstacles.",
      "The film tells the story of a teenager who climbed Everest.",
    ],
    year: 2017,
  },
  {
    id: "ranchi-diaries",
    title: "Ranchi Diaries",
    emojis: "🏙️💰🎭🔫",
    clues: [
      "A group of small-town dreamers plans a risky crime.",
      "Their ambitions become tangled with local power struggles.",
      "The film centres on a young woman hoping for fame.",
    ],
    year: 2017,
  },
  {
    id: "phillauri",
    title: "Phillauri",
    emojis: "🌳👻💍🎶",
    clues: [
      "A man discovers that an unusual wedding ritual has unexpected consequences.",
      "A friendly spirit becomes attached to the groom.",
      "Anushka Sharma plays a ghost connected to a centuries-old love story.",
    ],
    year: 2017,
  },
  {
    id: "mona-darling",
    title: "Mona Darling",
    emojis: "📱💻💀🔔",
    clues: [
      "Students at a college become victims of a mysterious online presence.",
      "A social-media account appears linked to unexplained deaths.",
      "This thriller mixes campus life with digital horror.",
    ],
    year: 2017,
  },

  // ==================== 2018 ====================
  {
    id: "andhadhun-2018-placeholder",
    title: "Sui Dhaaga",
    emojis: "🧵🪡👕🏆",
    clues: [
      "A couple tries to build a small business using traditional skills.",
      "Their work centres on sewing and handmade clothing.",
      "Varun Dhawan and Anushka Sharma play Mauji and Mamta.",
    ],
    year: 2018,
  },
  {
    id: "badhaai-ho-2018-placeholder",
    title: "Raazi",
    emojis: "🕵️‍♀️🇮🇳🇵🇰💍",
    clues: [
      "A young Indian woman marries into a Pakistani military family.",
      "Her new life hides a dangerous intelligence assignment.",
      "Alia Bhatt plays undercover agent Sehmat.",
    ],
    year: 2018,
  },
  {
    id: "sanju",
    title: "Sanju",
    emojis: "🎬🚬📸📰",
    clues: [
      "A biographical drama follows a controversial Bollywood star.",
      "His life includes fame, addiction, legal troubles and friendship.",
      "Ranbir Kapoor portrays Sanjay Dutt.",
    ],
    year: 2018,
  },
  {
    id: "padmaavat",
    title: "Padmaavat",
    emojis: "👑🏰⚔️🪞",
    clues: [
      "A medieval ruler becomes obsessed with a legendary queen.",
      "A siege and a battle shape the fate of a kingdom.",
      "Deepika Padukone, Shahid Kapoor and Ranveer Singh star.",
    ],
    year: 2018,
  },
  {
    id: "raazi-2018",
    title: "Parmanu: The Story of Pokhran",
    emojis: "☢️🏜️🪖🇮🇳",
    clues: [
      "A secret scientific mission must evade international surveillance.",
      "Scientists and military personnel work in the desert.",
      "The film dramatises India's 1998 nuclear tests.",
    ],
    year: 2018,
  },
  {
    id: "gold-2018",
    title: "Gold",
    emojis: "🏑🥇🇮🇳🇬🇧",
    clues: [
      "A sports manager dreams of winning Olympic gold for independent India.",
      "He assembles a hockey team after Partition.",
      "Akshay Kumar plays Tapan Das in this period sports drama.",
    ],
    year: 2018,
  },
  {
    id: "stree-2018-placeholder",
    title: "Pataakha",
    emojis: "👭🌾💥🔥",
    clues: [
      "Two feuding sisters constantly fight in a rural setting.",
      "Their rivalry continues even when life takes them in new directions.",
      "Vishal Bhardwaj directed this dark comedy about sibling rivalry.",
    ],
    year: 2018,
  },
  {
    id: "mulk",
    title: "Mulk",
    emojis: "⚖️🏠📰🇮🇳",
    clues: [
      "A family fights to clear its name after a relative's crime.",
      "A courtroom case examines prejudice and national identity.",
      "Rishi Kapoor and Taapsee Pannu star in this legal drama.",
    ],
    year: 2018,
  },
  {
    id: "manmarziyaan",
    title: "Manmarziyaan",
    emojis: "💍🎸💔🚲",
    clues: [
      "A woman is torn between a passionate lover and a dependable match.",
      "Her indecision creates a complicated love triangle.",
      "Abhishek Bachchan, Taapsee Pannu and Vicky Kaushal star.",
    ],
    year: 2018,
  },
  {
    id: "karwaan",
    title: "Karwaan",
    emojis: "🚐🧳🌴👨‍👦",
    clues: [
      "Two men embark on a road trip after a mix-up involving bodies.",
      "A young woman unexpectedly joins their journey.",
      "Irrfan Khan, Dulquer Salmaan and Mithila Palkar star.",
    ],
    year: 2018,
  },
  {
    id: "october",
    title: "October",
    emojis: "🌧️🌼🏥💙",
    clues: [
      "A hotel intern visits a colleague who is in a coma.",
      "His unusual devotion changes his life and priorities.",
      "Varun Dhawan stars in this quiet Shoojit Sircar drama.",
    ],
    year: 2018,
  },
  {
    id: "blackmail",
    title: "Blackmail",
    emojis: "📸💵📞😂",
    clues: [
      "A husband discovers his wife's affair and makes an unusual decision.",
      "A blackmail scheme spirals out of control.",
      "Irrfan Khan leads this dark comedy.",
    ],
    year: 2018,
  },
  {
    id: "karwaan-2018",
    title: "Bhavesh Joshi Superhero",
    emojis: "🦸‍♂️🎭📹🏙️",
    clues: [
      "A young man turns into a masked vigilante after personal tragedy.",
      "He exposes corruption using video evidence.",
      "Harshvardhan Kapoor stars in this unconventional superhero film.",
    ],
    year: 2018,
  },
  {
    id: "manto",
    title: "Manto",
    emojis: "✍️📚🖋️🇵🇰",
    clues: [
      "A writer faces censorship over his controversial short stories.",
      "His work reflects the violence and contradictions of Partition.",
      "Nawazuddin Siddiqui portrays Urdu writer Saadat Hasan Manto.",
    ],
    year: 2018,
  },
  {
    id: "soorma",
    title: "Soorma",
    emojis: "🏑🦽💪🇮🇳",
    clues: [
      "A hockey player must rebuild his career after a devastating injury.",
      "His determination brings him back to the national team.",
      "Diljit Dosanjh portrays hockey player Sandeep Singh.",
    ],
    year: 2018,
  },
  {
    id: "102-not-out",
    title: "102 Not Out",
    emojis: "👴🎂👨‍👦😂",
    clues: [
      "A very old father wants his grumpy son to change his outlook.",
      "He sets a series of unusual challenges for his son.",
      "Amitabh Bachchan and Rishi Kapoor play the father and son.",
    ],
    year: 2018,
  },
  {
    id: "stree-2018",
    title: "Laila Majnu",
    emojis: "🏔️❤️📜💔",
    clues: [
      "Two young lovers face family opposition in Kashmir.",
      "Their separation pushes one lover toward emotional collapse.",
      "This modern retelling draws on a famous tragic romance.",
    ],
    year: 2018,
  },
  {
    id: "namaste-england",
    title: "Namaste England",
    emojis: "✈️🇬🇧💍❤️",
    clues: [
      "A couple's relationship is tested by one partner's dream of moving abroad.",
      "Their journey leads from India to England.",
      "Arjun Kapoor and Parineeti Chopra star together.",
    ],
    year: 2018,
  },
  {
    id: "mitron",
    title: "Mitron",
    emojis: "👬🍳💼❤️",
    clues: [
      "A young man avoids conventional career expectations.",
      "A cooking business brings new possibilities into his life.",
      "Jackky Bhagnani stars in this Gujarati-flavoured romantic comedy.",
    ],
    year: 2018,
  },
  {
    id: "happy-phirr-bhag-jayegi",
    title: "Happy Phirr Bhag Jayegi",
    emojis: "🏃‍♀️💍🇨🇳😂",
    clues: [
      "A case of mistaken identity causes chaos during an international trip.",
      "A runaway bride's name creates confusion for strangers.",
      "The sequel moves part of its comedy to China.",
    ],
    year: 2018,
  },
  {
    id: "bhaiaji-superhit",
    title: "Bhaiaji Superhit",
    emojis: "🎬🔫🎭😂",
    clues: [
      "A small-town gangster dreams of becoming a Bollywood star.",
      "He hires people to help make a film about himself.",
      "Sunny Deol plays the aspiring screen hero.",
    ],
    year: 2018,
  },
  {
    id: "fryday",
    title: "FryDay",
    emojis: "🚰🏠😂🎭",
    clues: [
      "A water purifier salesman visits a customer's home.",
      "An unexpected guest turns the visit into a comedy of errors.",
      "Govinda stars in this farcical comedy.",
    ],
    year: 2018,
  },
  {
    id: "pihu",
    title: "Pihu",
    emojis: "👧🏠☎️⚠️",
    clues: [
      "A toddler is left alone inside an apartment.",
      "Ordinary household objects become dangerous obstacles.",
      "The thriller follows a two-year-old girl almost entirely at home.",
    ],
    year: 2018,
  },
  {
    id: "tiger-zinda-2018",
    title: "Namaste England",
    emojis: "🧳💑🇬🇧✈️",
    clues: [
      "A couple's dream of a life abroad leads to a complicated journey.",
      "Their relationship faces distance and difficult choices.",
      "Parineeti Chopra and Arjun Kapoor headline the film.",
    ],
    year: 2018,
  },
  {
    id: "the-dark-side-of-life",
    title: "The Dark Side of Life: Mumbai City",
    emojis: "🌃🎨🏙️😔",
    clues: [
      "Several people in Mumbai struggle with despair and isolation.",
      "Their stories intersect around mental health and survival.",
      "The film features a cityscape full of lonely lives.",
    ],
    year: 2018,
  },

  // ==================== 2019 ====================
  {
    id: "uri-2019",
    title: "Kesari",
    emojis: "🟠⚔️🏰🪖",
    clues: [
      "A small force of Sikh soldiers faces an enormous invading army.",
      "The battle takes place at a frontier fort in 1897.",
      "Akshay Kumar portrays Havildar Ishar Singh.",
    ],
    year: 2019,
  },
  {
    id: "super-30",
    title: "Super 30",
    emojis: "📐📚🏫🏆",
    clues: [
      "A mathematics teacher coaches underprivileged students for a difficult exam.",
      "He builds a free residential programme despite major obstacles.",
      "Hrithik Roshan portrays educator Anand Kumar.",
    ],
    year: 2019,
  },
  {
    id: "mission-mangal",
    title: "Mission Mangal",
    emojis: "🚀🪐🛰️🇮🇳",
    clues: [
      "A team of scientists attempts an ambitious interplanetary mission.",
      "They work with limited resources and a tight deadline.",
      "The film is inspired by India's Mars Orbiter Mission.",
    ],
    year: 2019,
  },
  {
    id: "badla-2019",
    title: "Bala",
    emojis: "🪞🧑‍🦲😂💇",
    clues: [
      "A young man struggles with premature hair loss.",
      "His insecurity affects his romantic relationships.",
      "Ayushmann Khurrana stars in this comedy about appearance and self-worth.",
    ],
    year: 2019,
  },
  {
    id: "article-15-2019",
    title: "Dream Girl",
    emojis: "☎️🎭💋😂",
    clues: [
      "A talented man takes a job using a female voice.",
      "Callers become emotionally attached to his telephone persona.",
      "Ayushmann Khurrana plays Karam, who works at a friendship call centre.",
    ],
    year: 2019,
  },
  {
    id: "chhichhore",
    title: "Chhichhore",
    emojis: "🎓🏏🏆👬",
    clues: [
      "A father recalls his college hostel days to encourage his son.",
      "A group of friends were once labelled failures by their peers.",
      "Sushant Singh Rajput leads this campus comedy-drama.",
    ],
    year: 2019,
  },
  {
    id: "gully-boy-2019",
    title: "The Sky Is Pink",
    emojis: "👨‍👩‍👧‍👦🏥💗✈️",
    clues: [
      "A family tells its story through the perspective of their daughter.",
      "Their lives are shaped by a rare medical condition.",
      "Priyanka Chopra and Farhan Akhtar play the parents.",
    ],
    year: 2019,
  },
  {
    id: "marjaavaan",
    title: "Marjaavaan",
    emojis: "❤️🔫🌹🩸",
    clues: [
      "A street fighter falls in love with a woman who cannot speak.",
      "A powerful gangster's son becomes their enemy.",
      "Sidharth Malhotra and Riteish Deshmukh face off in this action romance.",
    ],
    year: 2019,
  },
  {
    id: "batla-house",
    title: "Batla House",
    emojis: "🚔🏢🔫📰",
    clues: [
      "A police officer faces public scrutiny after a controversial encounter.",
      "The investigation threatens his career and personal life.",
      "John Abraham plays an officer involved in a Delhi encounter case.",
    ],
    year: 2019,
  },
  {
    id: "mardaani-2",
    title: "Mardaani 2",
    emojis: "👮‍♀️🔍🚨🧤",
    clues: [
      "A police officer hunts a violent young serial offender.",
      "The investigation becomes a battle of intelligence and nerve.",
      "Rani Mukerji returns as Shivani Shivaji Roy.",
    ],
    year: 2019,
  },
  {
    id: "war-2019",
    title: "Good Newwz",
    emojis: "👶🧬🏥😂",
    clues: [
      "Two couples seek help having children through fertility treatment.",
      "A medical mix-up creates a very unusual pregnancy situation.",
      "Akshay Kumar, Kareena Kapoor Khan, Diljit Dosanjh and Kiara Advani star.",
    ],
    year: 2019,
  },
  {
    id: "judgementall-hai-kya",
    title: "Judgementall Hai Kya",
    emojis: "🧠🎭🔪🕵️",
    clues: [
      "A woman with a vivid imagination becomes involved in a murder mystery.",
      "She suspects her neighbour while struggling to separate reality from fantasy.",
      "Kangana Ranaut and Rajkummar Rao star in this psychological thriller.",
    ],
    year: 2019,
  },
  {
    id: "sonchiriya",
    title: "Sonchiriya",
    emojis: "🏜️🔫🐎🌾",
    clues: [
      "A gang of rebels lives in the ravines of central India.",
      "Their violent world is challenged by a child needing protection.",
      "Sushant Singh Rajput and Manoj Bajpayee star in this dacoit drama.",
    ],
    year: 2019,
  },
  {
    id: "photograph",
    title: "Photograph",
    emojis: "📸🏙️💌🌆",
    clues: [
      "A street photographer persuades a stranger to pose as his fiancée.",
      "Their unlikely connection grows through small conversations.",
      "Nawazuddin Siddiqui and Sanya Malhotra star in this gentle drama.",
    ],
    year: 2019,
  },
  {
    id: "ek-ladki-ko-dekha",
    title: "Ek Ladki Ko Dekha Toh Aisa Laga",
    emojis: "🌈❤️👨‍👩‍👧🎭",
    clues: [
      "A young woman struggles to tell her conservative family the truth.",
      "A playwright helps her confront social expectations.",
      "Sonam Kapoor and Anil Kapoor play daughter and father.",
    ],
    year: 2019,
  },
  {
    id: "kabir-singh",
    title: "Kabir Singh",
    emojis: "🩺💔🏍️🍺",
    clues: [
      "A brilliant medical student spirals after losing the woman he loves.",
      "His anger and self-destructive behaviour damage his future.",
      "Shahid Kapoor plays the title character in this romantic drama.",
    ],
    year: 2019,
  },
  {
    id: "panipat",
    title: "Panipat",
    emojis: "🐎⚔️🏰🛡️",
    clues: [
      "A Maratha army prepares for a major eighteenth-century battle.",
      "A general leads a campaign against Ahmad Shah Abdali.",
      "Ashutosh Gowariker directed this historical war epic.",
    ],
    year: 2019,
  },
  {
    id: "dabangg-3",
    title: "Dabangg 3",
    emojis: "👮‍♂️🕶️🥊🚔",
    clues: [
      "A fearless police officer faces a criminal tied to his past.",
      "The story reveals how he became the person he is.",
      "Salman Khan returns as Chulbul Pandey.",
    ],
    year: 2019,
  },
  {
    id: "street-dancer-3d",
    title: "Street Dancer 3D",
    emojis: "🕺💃🏆🎵",
    clues: [
      "Rival dance crews compete in an international dance championship.",
      "Their rivalry gradually gives way to a larger cause.",
      "Varun Dhawan and Shraddha Kapoor headline this dance film.",
    ],
    year: 2019,
  },
  {
    id: "student-of-the-year-2",
    title: "Student of the Year 2",
    emojis: "🎓🏆💃🏫",
    clues: [
      "A student enters an elite college and competes for recognition.",
      "Friendship and romance complicate the race for a prestigious title.",
      "Tiger Shroff stars alongside Tara Sutaria and Ananya Panday.",
    ],
    year: 2019,
  },
  {
    id: "pati-patni-aur-woh-2019",
    title: "Pati Patni Aur Woh",
    emojis: "💍📱🤥😂",
    clues: [
      "A married man starts an affair and tries to conceal it.",
      "His lies create an increasingly tangled situation.",
      "Kartik Aaryan stars in this modern remake of a classic comedy.",
    ],
    year: 2019,
  },
  {
    id: "made-in-china",
    title: "Made in China",
    emojis: "🧪💼🇨🇳💰",
    clues: [
      "A struggling Gujarati businessman travels abroad seeking inspiration.",
      "He returns with an unusual product idea.",
      "Rajkummar Rao plays an entrepreneur hoping to succeed in business.",
    ],
    year: 2019,
  },
  {
    id: "dabangg-2019",
    title: "Prassthanam",
    emojis: "🗳️🏛️🔫👨‍👦",
    clues: [
      "A powerful politician must choose who will inherit his influence.",
      "Family loyalty collides with ambition and violence.",
      "Sanjay Dutt stars in this political crime drama.",
    ],
    year: 2019,
  },
  {
    id: "blank-2019",
    title: "Blank",
    emojis: "💣🧠🚔⏱️",
    clues: [
      "A man wakes up with no memory and a bomb attached to him.",
      "Police must determine whether he is a victim or a threat.",
      "Sunny Deol and Karan Kapadia star in this thriller.",
    ],
    year: 2019,
  },
  {
    id: "india-most-wanted",
    title: "India's Most Wanted",
    emojis: "🕵️‍♂️📍🚆🚨",
    clues: [
      "A small intelligence team hunts a suspected terrorist without public recognition.",
      "They travel across several cities while trying to avoid detection.",
      "Arjun Kapoor plays an intelligence officer in this thriller.",
    ],
    year: 2019,
  },

  // ==================== 2020 ====================
  {
    id: "tanhaji",
    title: "Tanhaji: The Unsung Warrior",
    emojis: "🛡️⚔️🏰🦁",
    clues: [
      "A Maratha commander leads an assault on a strategically important fort.",
      "The battle pits him against Udaybhan Rathore.",
      "Ajay Devgn plays Tanhaji Malusare.",
    ],
    year: 2020,
  },
  {
    id: "chhapaak",
    title: "Chhapaak",
    emojis: "💧🔥🧑‍⚖️🌸",
    clues: [
      "A woman rebuilds her life after an acid attack.",
      "Her journey includes a legal battle and advocacy work.",
      "Deepika Padukone portrays a character inspired by Laxmi Agarwal.",
    ],
    year: 2020,
  },
  {
    id: "panga",
    title: "Panga",
    emojis: "🏐🏆👩‍👦💪",
    clues: [
      "A former athlete considers returning to professional competition.",
      "Her family supports her effort to restart her sporting career.",
      "Kangana Ranaut plays a former kabaddi champion.",
    ],
    year: 2020,
  },
  {
    id: "shubh-mangal-zyada-saavdhan",
    title: "Shubh Mangal Zyada Saavdhan",
    emojis: "🏳️‍🌈💑🚂👨‍👨‍👦",
    clues: [
      "A same-sex couple tries to gain acceptance from a conservative family.",
      "A train journey brings their relationship into the open.",
      "Ayushmann Khurrana and Jitendra Kumar play the couple.",
    ],
    year: 2020,
  },
  {
    id: "thappad",
    title: "Thappad",
    emojis: "✋💍🏠⚖️",
    clues: [
      "A woman reconsiders her marriage after one public act of violence.",
      "Her family and society struggle to understand her decision.",
      "Taapsee Pannu plays Amrita, who refuses to dismiss the incident.",
    ],
    year: 2020,
  },
  {
    id: "angrezi-medium",
    title: "Angrezi Medium",
    emojis: "🎓✈️👨‍👧🇬🇧",
    clues: [
      "A father goes to extraordinary lengths to support his daughter's education.",
      "Her dream of studying abroad creates emotional and financial challenges.",
      "Irrfan Khan plays a sweet-shop owner from Udaipur.",
    ],
    year: 2020,
  },
  {
    id: "gunjan-saxena",
    title: "Gunjan Saxena: The Kargil Girl",
    emojis: "✈️👩‍✈️🪖🏔️",
    clues: [
      "A young woman fights gender bias to become a military aviator.",
      "She flies missions during the Kargil conflict.",
      "Janhvi Kapoor portrays Indian Air Force officer Gunjan Saxena.",
    ],
    year: 2020,
  },
  {
    id: "dil-bechara",
    title: "Dil Bechara",
    emojis: "🎸🏥🌻❤️",
    clues: [
      "Two young people with serious illnesses fall in love.",
      "They try to make meaningful memories despite uncertain futures.",
      "Sushant Singh Rajput and Sanjana Sanghi star in this romance.",
    ],
    year: 2020,
  },
  {
    id: "lootcase",
    title: "Lootcase",
    emojis: "🧳💵🚕😂",
    clues: [
      "A middle-class man discovers a suitcase full of cash.",
      "Several dangerous people are looking for the missing money.",
      "Kunal Kemmu plays a family man tempted by sudden wealth.",
    ],
    year: 2020,
  },
  {
    id: "ludo-2020",
    title: "Chhalaang",
    emojis: "🏫🏃‍♂️🏆😂",
    clues: [
      "A reluctant physical-education teacher faces a rival coach.",
      "School sports become a way to prove his worth.",
      "Rajkummar Rao and Nushrratt Bharuccha star in this comedy.",
    ],
    year: 2020,
  },
  {
    id: "serious-men",
    title: "Serious Men",
    emojis: "🔭👨‍👦📚🎭",
    clues: [
      "A father wants his son to be recognised as a child prodigy.",
      "His ambition leads him into an elaborate deception.",
      "Nawazuddin Siddiqui plays a man navigating class and opportunity.",
    ],
    year: 2020,
  },
  {
    id: "gunjan-2020",
    title: "Dolly Kitty Aur Woh Chamakte Sitare",
    emojis: "👭🌃💄📱",
    clues: [
      "Two cousins living in the city seek freedom from restrictive lives.",
      "Their private choices reveal hidden desires and vulnerabilities.",
      "Konkona Sen Sharma and Bhumi Pednekar star.",
    ],
    year: 2020,
  },
  {
    id: "khuda-haafiz",
    title: "Khuda Haafiz",
    emojis: "✈️🔍❤️🌍",
    clues: [
      "A man travels abroad to find his missing wife.",
      "His search leads him into a dangerous criminal network.",
      "Vidyut Jammwal stars in this action thriller.",
    ],
    year: 2020,
  },
  {
    id: "raat-akeli-hai",
    title: "Raat Akeli Hai",
    emojis: "🏚️🔍🕯️🔪",
    clues: [
      "A police officer investigates a wealthy man's murder on his wedding night.",
      "The family members all seem to be hiding something.",
      "Nawazuddin Siddiqui plays inspector Jatil Yadav.",
    ],
    year: 2020,
  },
  {
    id: "bulbbul",
    title: "Bulbbul",
    emojis: "🌕🦶🩸🌳",
    clues: [
      "A young bride grows into a mysterious woman in a Bengal mansion.",
      "A supernatural figure is blamed for a series of deaths.",
      "The film blends folklore, horror and a story of abuse.",
    ],
    year: 2020,
  },
  {
    id: "bhoot-part-one",
    title: "Bhoot: Part One - The Haunted Ship",
    emojis: "🚢🌊👻🔦",
    clues: [
      "A salvage officer boards an abandoned ship washed ashore.",
      "Strange supernatural events begin to unfold.",
      "Vicky Kaushal stars in this maritime horror film.",
    ],
    year: 2020,
  },
  {
    id: "durgamati",
    title: "Durgamati",
    emojis: "🏚️👻🗝️🕯️",
    clues: [
      "An imprisoned woman becomes part of a political investigation.",
      "A supposedly haunted mansion hides unsettling secrets.",
      "Bhumi Pednekar leads this supernatural thriller.",
    ],
    year: 2020,
  },
  {
    id: "suraj-pe-mangal-bhari",
    title: "Suraj Pe Mangal Bhari",
    emojis: "📸💍🕵️😂",
    clues: [
      "A wedding detective investigates prospective grooms.",
      "One man's search for a bride becomes a comic battle of wits.",
      "Diljit Dosanjh and Manoj Bajpayee star together.",
    ],
    year: 2020,
  },
  {
    id: "bahut-hua-samman",
    title: "Bahut Hua Sammaan",
    emojis: "🏦💰🎓😂",
    clues: [
      "Two engineering students plan an audacious bank robbery.",
      "Their scheme involves an eccentric professor and a mysterious mission.",
      "The comedy stars Sanjay Mishra and Raghav Juyal.",
    ],
    year: 2020,
  },
  {
    id: "ginny-weds-sunny",
    title: "Ginny Weds Sunny",
    emojis: "💍🍳❤️🎶",
    clues: [
      "A young man tries to win over a woman who rejects him.",
      "Their families get involved in arranging a possible marriage.",
      "Vikrant Massey and Yami Gautam star in this romantic comedy.",
    ],
    year: 2020,
  },
  {
    id: "darbaan",
    title: "Darbaan",
    emojis: "👨‍👦🏡📖💔",
    clues: [
      "A devoted caretaker becomes emotionally attached to a child.",
      "A later misunderstanding separates the two.",
      "This drama explores loyalty, class and family bonds.",
    ],
    year: 2020,
  },
  {
    id: "indoo-ki-jawani",
    title: "Indoo Ki Jawani",
    emojis: "📱💃💘😂",
    clues: [
      "A young woman experiments with online dating.",
      "A dating-app encounter leads to unexpected trouble.",
      "Kiara Advani plays the title character.",
    ],
    year: 2020,
  },
  {
    id: "torbaaz",
    title: "Torbaaz",
    emojis: "🏏👦🏕️🕊️",
    clues: [
      "A former army doctor coaches refugee children in a sport.",
      "The children live in a camp marked by trauma and conflict.",
      "Sanjay Dutt stars as the coach trying to give them hope.",
    ],
    year: 2020,
  },
  {
    id: "eeb-allay-oo",
    title: "Eeb Allay Ooo!",
    emojis: "🐒🏙️🧹🎭",
    clues: [
      "A migrant worker takes an unusual job in the capital.",
      "He is tasked with keeping monkeys away from government buildings.",
      "This acclaimed satire explores labour, class and urban life.",
    ],
    year: 2020,
  },
  {
    id: "choked",
    title: "Choked: Paisa Bolta Hai",
    emojis: "🏦💵🚰🏠",
    clues: [
      "A bank cashier discovers bundles of cash hidden in her kitchen drain.",
      "A currency crackdown changes her financial situation overnight.",
      "Anurag Kashyap directed this domestic crime drama.",
    ],
    year: 2020,
  },

  // ==================== 2021 ====================
  {
    id: "sooryavanshi",
    title: "Sooryavanshi",
    emojis: "🚔🚁💣🕶️",
    clues: [
      "An anti-terrorism officer races to prevent attacks across Mumbai.",
      "He receives help from two famous police officers.",
      "Akshay Kumar leads this entry in a shared police-action universe.",
    ],
    year: 2021,
  },
  {
    id: "sandeep-aur-pinky-faraar",
    title: "Sandeep Aur Pinky Faraar",
    emojis: "🚗🏜️🏃‍♀️🚔",
    clues: [
      "A corporate professional and a suspended policeman flee together.",
      "Their relationship is shaped by distrust and survival.",
      "Arjun Kapoor and Parineeti Chopra star in this dark thriller.",
    ],
    year: 2021,
  },
  {
    id: "sardar-udham",
    title: "Sardar Udham",
    emojis: "📜🔫🇮🇳🇬🇧",
    clues: [
      "A revolutionary spends years pursuing justice for a massacre.",
      "His mission takes him from India to Britain.",
      "Vicky Kaushal portrays freedom fighter Udham Singh.",
    ],
    year: 2021,
  },
  {
    id: "shershaah-2021",
    title: "Haseen Dillruba",
    emojis: "💍🔪📚🌹",
    clues: [
      "A woman becomes the prime suspect after her husband's death.",
      "A detective uncovers secrets involving obsession and a crime novel.",
      "Taapsee Pannu and Vikrant Massey star in this mystery.",
    ],
    year: 2021,
  },
  {
    id: "mimi",
    title: "Mimi",
    emojis: "🤰👶💵❤️",
    clues: [
      "A dancer agrees to become a surrogate mother for a foreign couple.",
      "An unexpected change forces her to raise the child herself.",
      "Kriti Sanon stars in this comedy-drama.",
    ],
    year: 2021,
  },
  {
    id: "ramprasad-ki-tehrvi",
    title: "Ramprasad Ki Tehrvi",
    emojis: "🏠🪔👨‍👩‍👧‍👦",
    clues: [
      "A family gathers at their ancestral home after a patriarch's death.",
      "Old arguments and unspoken resentments emerge over several days.",
      "The film features an ensemble cast led by Supriya Pathak.",
    ],
    year: 2021,
  },
  {
    id: "pagglait",
    title: "Pagglait",
    emojis: "🪔🧾👰💰",
    clues: [
      "A young widow behaves unexpectedly after her husband's death.",
      "Family expectations clash with her search for independence.",
      "Sanya Malhotra plays Sandhya in this dark comedy-drama.",
    ],
    year: 2021,
  },
  {
    id: "saina",
    title: "Saina",
    emojis: "🏸🥇👟🇮🇳",
    clues: [
      "A young athlete rises through the ranks of international badminton.",
      "Her career requires intense training and personal sacrifice.",
      "Parineeti Chopra portrays Olympic medallist Saina Nehwal.",
    ],
    year: 2021,
  },
  {
    id: "bell-bottom",
    title: "Bell Bottom",
    emojis: "✈️🕵️‍♂️💣🕶️",
    clues: [
      "An Indian intelligence agent is tasked with rescuing hijacked passengers.",
      "The mission takes place during the early 1980s.",
      "Akshay Kumar plays a covert operative with a code name.",
    ],
    year: 2021,
  },
  {
    id: "chehre",
    title: "Chehre",
    emojis: "🏚️⚖️🎭❄️",
    clues: [
      "A traveller gets stranded at an isolated house during a storm.",
      "Its elderly residents stage an unsettling mock trial.",
      "Amitabh Bachchan and Emraan Hashmi star in this mystery.",
    ],
    year: 2021,
  },
  {
    id: "rashmi-rocket",
    title: "Rashmi Rocket",
    emojis: "🏃‍♀️🏟️⚖️🧬",
    clues: [
      "A gifted runner faces a controversial gender-verification test.",
      "Her athletic career turns into a fight for dignity and rights.",
      "Taapsee Pannu plays a sprinter from Gujarat.",
    ],
    year: 2021,
  },
  {
    id: "bob-biswas",
    title: "Bob Biswas",
    emojis: "🎩📋🔫🧠",
    clues: [
      "A mild-mannered man struggles with a forgotten identity.",
      "His past connects him to a profession involving contract killings.",
      "Abhishek Bachchan plays a character introduced in another crime film.",
    ],
    year: 2021,
  },
  {
    id: "antim",
    title: "Antim: The Final Truth",
    emojis: "👮‍♂️🚜🔫🥊",
    clues: [
      "A police officer confronts a gangster rising through the criminal world.",
      "Their conflict escalates through violent encounters.",
      "Salman Khan and Aayush Sharma star in this action drama.",
    ],
    year: 2021,
  },
  {
    id: "bunty-aur-babli-2",
    title: "Bunty Aur Babli 2",
    emojis: "🎭💸🕵️‍♀️😂",
    clues: [
      "A new pair of con artists imitate a notorious criminal duo.",
      "The original tricksters return to deal with the impostors.",
      "Saif Ali Khan and Rani Mukerji reprise the older characters.",
    ],
    year: 2021,
  },
  {
    id: "hum-do-hamare-do",
    title: "Hum Do Hamare Do",
    emojis: "👨‍👩‍👧‍👦🏡💍😂",
    clues: [
      "A young man recruits pretend parents to impress his partner.",
      "His plan becomes complicated when family relationships grow real.",
      "Rajkummar Rao and Kriti Sanon star in this family comedy.",
    ],
    year: 2021,
  },
  {
    id: "dhamaka",
    title: "Dhamaka",
    emojis: "🎙️📺💣⏱️",
    clues: [
      "A news anchor receives a threatening call during a live broadcast.",
      "The crisis becomes both a public emergency and a career opportunity.",
      "Kartik Aaryan plays a television journalist in this thriller.",
    ],
    year: 2021,
  },
  {
    id: "sardar-ka-grandson",
    title: "Sardar Ka Grandson",
    emojis: "👵🏠🚚🇵🇰",
    clues: [
      "A grandson tries to fulfil his grandmother's final wish.",
      "He attempts to bring a family home across an international border.",
      "Arjun Kapoor and Neena Gupta star in this family drama.",
    ],
    year: 2021,
  },
  {
    id: "14-phere",
    title: "14 Phere",
    emojis: "💍👨‍👩‍👧‍👦🎭😂",
    clues: [
      "A couple from different communities wants to marry.",
      "They invent elaborate family stories to win approval.",
      "Vikrant Massey and Kriti Kharbanda star in this wedding comedy.",
    ],
    year: 2021,
  },
  {
    id: "kya-meri-sonam-gupta",
    title: "Kya Meri Sonam Gupta Bewafa Hai?",
    emojis: "💌💔📝😂",
    clues: [
      "A rejected lover's heartbreak becomes a public joke.",
      "A note accusing someone of betrayal spreads widely.",
      "The title refers to a viral phrase found on currency notes.",
    ],
    year: 2021,
  },
  {
    id: "saina-2021",
    title: "Silence... Can You Hear It?",
    emojis: "🔍🏡🚔🤫",
    clues: [
      "A police officer investigates the murder of a young woman.",
      "The suspects belong to a wealthy and influential circle.",
      "Manoj Bajpayee plays the investigating officer.",
    ],
    year: 2021,
  },
  {
    id: "the-big-bull",
    title: "The Big Bull",
    emojis: "📈💹💵📰",
    clues: [
      "A financial operator rises by exploiting loopholes in the banking system.",
      "His ambitions draw the attention of journalists and investigators.",
      "Abhishek Bachchan plays a character inspired by a famous stockbroker.",
    ],
    year: 2021,
  },
  {
    id: "saina-2021-2",
    title: "Tuesdays and Fridays",
    emojis: "📅💑📱❤️",
    clues: [
      "Two young people agree to date only on selected days of the week.",
      "Their arrangement is designed to avoid serious commitment.",
      "Anmol Thakeria Dhillon and Jhataleka Malhotra star.",
    ],
    year: 2021,
  },
  {
    id: "sardar-udham-2021-2",
    title: "Ajeeb Daastaans",
    emojis: "💔🏠🪞🎭",
    clues: [
      "Four separate stories explore secrets and unequal relationships.",
      "The characters face desire, prejudice and emotional betrayal.",
      "This anthology features several well-known Hindi actors.",
    ],
    year: 2021,
  },
  {
    id: "saina-2021-3",
    title: "Collar Bomb",
    emojis: "💣👮‍♂️🏫⏱️",
    clues: [
      "A police officer is forced into a deadly hostage situation.",
      "A bomb and a series of demands turn a school into a trap.",
      "Jimmy Sheirgill stars in this suspense thriller.",
    ],
    year: 2021,
  },
  {
    id: "saina-2021-4",
    title: "Helmet",
    emojis: "🪖📦💸😂",
    clues: [
      "Three men accidentally acquire a large quantity of an embarrassing product.",
      "They try to sell it while confronting social taboos.",
      "Aparshakti Khurana stars in this comedy about condom access.",
    ],
    year: 2021,
  },

  // ==================== 2022 ====================
  {
    id: "gangubai-kathiawadi",
    title: "Gangubai Kathiawadi",
    emojis: "👑🌹🏙️⚖️",
    clues: [
      "A young woman rises to power in Mumbai's red-light district.",
      "She fights for the rights and dignity of women in her community.",
      "Alia Bhatt plays the title character in a Sanjay Leela Bhansali film.",
    ],
    year: 2022,
  },
  {
    id: "brahmastra",
    title: "Brahmāstra: Part One – Shiva",
    emojis: "🔥🔱✨🧿",
    clues: [
      "A young man discovers a mysterious connection to supernatural fire.",
      "Ancient astras are sought by a secret organisation.",
      "Ranbir Kapoor and Alia Bhatt star in this fantasy adventure.",
    ],
    year: 2022,
  },
  {
    id: "bhool-bhulaiyaa-3-2022",
    title: "Raksha Bandhan",
    emojis: "🧵👫💍🏠",
    clues: [
      "A brother struggles to arrange marriages for his sisters.",
      "He faces financial pressure and social expectations.",
      "Akshay Kumar stars in this family drama centred on sibling bonds.",
    ],
    year: 2022,
  },
  {
    id: "jhund",
    title: "Jhund",
    emojis: "⚽👦🏚️🏆",
    clues: [
      "A retired sports teacher forms a football team from slum children.",
      "The players gain confidence and opportunities through the sport.",
      "Amitabh Bachchan stars in this film inspired by Vijay Barse.",
    ],
    year: 2022,
  },
  {
    id: "jersey-2022",
    title: "Jersey",
    emojis: "🏏👨‍👦🏆❤️",
    clues: [
      "A former cricketer attempts a comeback in his thirties.",
      "His son becomes a major motivation for returning to the sport.",
      "Shahid Kapoor stars in this Hindi remake of a Telugu film.",
    ],
    year: 2022,
  },
  {
    id: "an-action-hero",
    title: "An Action Hero",
    emojis: "🎬🏃‍♂️🔫📸",
    clues: [
      "A famous actor becomes entangled in a real-life criminal chase.",
      "His public image becomes a weapon against him.",
      "Ayushmann Khurrana plays a celebrity named Maanav Khuranna.",
    ],
    year: 2022,
  },
  {
    id: "bhediya",
    title: "Bhediya",
    emojis: "🐺🌕🌲🦷",
    clues: [
      "A man is bitten by a mysterious creature in a forest.",
      "He begins transforming under the full moon.",
      "Varun Dhawan and Kriti Sanon star in this supernatural comedy.",
    ],
    year: 2022,
  },
  {
    id: "freddy",
    title: "Freddy",
    emojis: "🦷🩺💍🌑",
    clues: [
      "A shy dentist becomes obsessed with a woman who is already married.",
      "Romance turns into a dangerous psychological game.",
      "Kartik Aaryan plays the socially awkward title character.",
    ],
    year: 2022,
  },
  {
    id: "monica-o-my-darling",
    title: "Monica, O My Darling",
    emojis: "🤖🔪💼🕺",
    clues: [
      "A robotics executive becomes involved in a murder conspiracy.",
      "Blackmail and betrayal spread through a company.",
      "Rajkummar Rao and Huma Qureshi star in this neo-noir crime comedy.",
    ],
    year: 2022,
  },
  {
    id: "darlings",
    title: "Darlings",
    emojis: "🏠🍾⚖️💜",
    clues: [
      "A woman and her mother devise a plan against an abusive husband.",
      "Their attempt at revenge creates a series of darkly comic events.",
      "Alia Bhatt and Shefali Shah star together.",
    ],
    year: 2022,
  },
  {
    id: "doctor-g",
    title: "Doctor G",
    emojis: "🩺👨‍⚕️🏥📚",
    clues: [
      "A male medical student reluctantly specialises in a field dominated by women.",
      "His training challenges his assumptions about gender and medicine.",
      "Ayushmann Khurrana plays a struggling gynaecology student.",
    ],
    year: 2022,
  },
  {
    id: "phone-bhoot",
    title: "Phone Bhoot",
    emojis: "📱👻☎️😂",
    clues: [
      "Two friends start a business offering a service to restless spirits.",
      "A ghost helps them navigate a supernatural problem.",
      "Katrina Kaif, Ishaan Khatter and Siddhant Chaturvedi star.",
    ],
    year: 2022,
  },
  {
    id: "thank-god",
    title: "Thank God",
    emojis: "⚖️😇🎲❤️",
    clues: [
      "A man finds himself in a strange afterlife courtroom.",
      "His life is judged through a series of moral tests.",
      "Ajay Devgn plays a supernatural judge named Chitragupta.",
    ],
    year: 2022,
  },
  {
    id: "vikram-vedha",
    title: "Vikram Vedha",
    emojis: "👮‍♂️🔫♟️🌑",
    clues: [
      "A police officer hunts a notorious gangster who keeps surrendering.",
      "Each encounter challenges the officer's sense of right and wrong.",
      "Hrithik Roshan and Saif Ali Khan star in this crime thriller.",
    ],
    year: 2022,
  },
  {
    id: "ram-setu",
    title: "Ram Setu",
    emojis: "🛕🌊🗺️🏝️",
    clues: [
      "An archaeologist investigates whether an ancient bridge is real.",
      "His expedition faces political and supernatural complications.",
      "Akshay Kumar stars in this adventure linked to the Ramayana.",
    ],
    year: 2022,
  },
  {
    id: "raksha-bandhan-2022",
    title: "Cuttputlli",
    emojis: "🧸🔍🩸🏫",
    clues: [
      "A rookie police officer investigates a series of teenage murders.",
      "The crimes appear to be linked to a disturbing pattern.",
      "Akshay Kumar stars in this Hindi remake of a crime thriller.",
    ],
    year: 2022,
  },
  {
    id: "hit-first-case",
    title: "HIT: The First Case",
    emojis: "🚔🔍🚗🧩",
    clues: [
      "A troubled police officer investigates a missing woman's case.",
      "His own trauma interferes with the investigation.",
      "Rajkummar Rao stars in this Hindi remake of a Telugu thriller.",
    ],
    year: 2022,
  },
  {
    id: "forensic",
    title: "Forensic",
    emojis: "🧤🔬🔍🩸",
    clues: [
      "A forensic expert assists police with a string of child murders.",
      "Evidence at the crime scenes reveals an unsettling pattern.",
      "Vikrant Massey and Radhika Apte lead this mystery.",
    ],
    year: 2022,
  },
  {
    id: "dhaakad",
    title: "Dhaakad",
    emojis: "🕶️🎯🔥🕵️‍♀️",
    clues: [
      "A highly trained agent is assigned to eliminate an international criminal.",
      "Her operation uncovers a trafficking network.",
      "Kangana Ranaut plays special agent Agni.",
    ],
    year: 2022,
  },
  {
    id: "nikamma",
    title: "Nikamma",
    emojis: "🛵👊🏠😂",
    clues: [
      "A lazy young man is forced to grow up when a relative needs help.",
      "A family conflict becomes an action-comedy adventure.",
      "Abhimanyu Dassani stars alongside Shirley Setia.",
    ],
    year: 2022,
  },
  {
    id: "khuda-haafiz-2",
    title: "Khuda Haafiz Chapter II: Agni Pariksha",
    emojis: "👨‍👩‍👧🔍🔥🚔",
    clues: [
      "A couple's adopted daughter disappears under tragic circumstances.",
      "The father launches a desperate search for her.",
      "Vidyut Jammwal returns as Sameer in this action sequel.",
    ],
    year: 2022,
  },
  {
    id: "maja-ma",
    title: "Maja Ma",
    emojis: "💃🏳️‍🌈👨‍👩‍👧‍👦🎉",
    clues: [
      "A respected mother faces a revelation that challenges her family.",
      "A wedding celebration becomes a turning point for everyone.",
      "Madhuri Dixit stars in this family comedy-drama.",
    ],
    year: 2022,
  },
  {
    id: "double-xl",
    title: "Double XL",
    emojis: "👗👭✈️🎤",
    clues: [
      "Two women challenge body-image expectations while pursuing dreams.",
      "Their journey connects India with London.",
      "Sonakshi Sinha and Huma Qureshi star in this comedy-drama.",
    ],
    year: 2022,
  },
  {
    id: "taaza-khabar",
    title: "Govinda Naam Mera",
    emojis: "💃🏠🔪😂",
    clues: [
      "A struggling choreographer becomes entangled in a murder mystery.",
      "His marriage and romantic life complicate the investigation.",
      "Vicky Kaushal stars in this dark comedy.",
    ],
    year: 2022,
  },
  {
    id: "blurr",
    title: "Blurr",
    emojis: "👁️🌲🔍🌫️",
    clues: [
      "A woman investigates the suspicious death of her twin sister.",
      "Her own eyesight begins to deteriorate.",
      "Taapsee Pannu stars in this psychological thriller.",
    ],
    year: 2022,
  },

  // ==================== 2023 ====================
  {
    id: "animal-2023",
    title: "Animal",
    emojis: "🐺🩸👨‍👦🔫",
    clues: [
      "A volatile man becomes obsessed with protecting his powerful father.",
      "Family conflict fuels increasingly brutal violence.",
      "Ranbir Kapoor and Anil Kapoor play son and father.",
    ],
    year: 2023,
  },
  {
    id: "sam-bahadur",
    title: "Sam Bahadur",
    emojis: "🎖️🪖🇮🇳🗺️",
    clues: [
      "A biographical war drama follows a decorated Indian army officer.",
      "His career spans major conflicts and military leadership.",
      "Vicky Kaushal portrays Field Marshal Sam Manekshaw.",
    ],
    year: 2023,
  },
  {
    id: "the-vaccine-war",
    title: "The Vaccine War",
    emojis: "🧪🦠💉🔬",
    clues: [
      "Scientists work to develop a vaccine during a global health crisis.",
      "Their work faces political, scientific and public-pressure challenges.",
      "Vivek Agnihotri directed this science-focused drama.",
    ],
    year: 2023,
  },
  {
    id: "mission-raniganj",
    title: "Mission Raniganj",
    emojis: "⛏️🚧🪖🕳️",
    clues: [
      "A mining engineer leads an operation to rescue trapped workers.",
      "The team races against time beneath the earth.",
      "Akshay Kumar portrays engineer Jaswant Singh Gill.",
    ],
    year: 2023,
  },
  {
    id: "gumraah",
    title: "Gumraah",
    emojis: "🕵️‍♂️👥🔪🔍",
    clues: [
      "A murder investigation encounters two suspects who look identical.",
      "Police must untangle contradictory evidence.",
      "Aditya Roy Kapur plays dual roles in this crime thriller.",
    ],
    year: 2023,
  },
  {
    id: "ib71",
    title: "IB 71",
    emojis: "🕵️‍♂️✈️🇮🇳📡",
    clues: [
      "An intelligence officer devises a secret operation before a war.",
      "The plan involves manipulating enemy airspace and communications.",
      "Vidyut Jammwal plays an Indian intelligence agent.",
    ],
    year: 2023,
  },
  {
    id: "the-kerala-story",
    title: "The Kerala Story",
    emojis: "🧳👩📱⚠️",
    clues: [
      "Several young women become caught in a controversial recruitment story.",
      "The plot follows their experiences away from home.",
      "Adah Sharma plays the central character in this political drama.",
    ],
    year: 2023,
  },
  {
    id: "zara-hatke-zara-bachke",
    title: "Zara Hatke Zara Bachke",
    emojis: "💍🏠📄😂",
    clues: [
      "A married couple seeks a separate home from their extended family.",
      "Their attempt to qualify for housing creates a fake-divorce scheme.",
      "Vicky Kaushal and Sara Ali Khan star in this comedy.",
    ],
    year: 2023,
  },
  {
    id: "rocky-rani-2023",
    title: "Mrs Chatterjee vs Norway",
    emojis: "👩‍👧‍👦⚖️🇳🇴✈️",
    clues: [
      "An Indian mother fights to regain custody of her children abroad.",
      "A legal battle tests her determination against a foreign system.",
      "Rani Mukerji stars in this drama inspired by real events.",
    ],
    year: 2023,
  },
  {
    id: "bawaal",
    title: "Bawaal",
    emojis: "✈️🇪🇺💑📚",
    clues: [
      "A couple travels through European cities while confronting problems in their marriage.",
      "Historical locations force them to reconsider their relationship.",
      "Varun Dhawan and Janhvi Kapoor star together.",
    ],
    year: 2023,
  },
  {
    id: "dream-girl-2",
    title: "Dream Girl 2",
    emojis: "🎭💄☎️😂",
    clues: [
      "A young man disguises himself as a woman to earn money.",
      "The deception spirals into a series of romantic misunderstandings.",
      "Ayushmann Khurrana returns as Karam, also known as Pooja.",
    ],
    year: 2023,
  },
  {
    id: "fukrey-3",
    title: "Fukrey 3",
    emojis: "🐓💸🗳️😂",
    clues: [
      "A group of friends becomes involved in a local election.",
      "A familiar strange talent causes another round of chaos.",
      "The comedy returns to the world of Hunny and Choocha.",
    ],
    year: 2023,
  },
  {
    id: "satyaprem-ki-katha",
    title: "Satyaprem Ki Katha",
    emojis: "💍❤️🎶⚖️",
    clues: [
      "A man falls in love with a woman carrying a painful secret.",
      "Their relationship forces difficult conversations about consent and justice.",
      "Kartik Aaryan and Kiara Advani star together.",
    ],
    year: 2023,
  },
  {
    id: "rocky-rani-2023-2",
    title: "Tarla",
    emojis: "👩‍🍳🥘📖🏆",
    clues: [
      "A homemaker discovers a talent for teaching people to cook.",
      "Her recipes help transform her into a celebrated culinary figure.",
      "Huma Qureshi portrays chef and author Tarla Dalal.",
    ],
    year: 2023,
  },
  {
    id: "afwaah",
    title: "Afwaah",
    emojis: "📱📰🏃‍♀️⚠️",
    clues: [
      "A false rumour spreads rapidly and puts two people in danger.",
      "Social-media misinformation drives the escalating conflict.",
      "Nawazuddin Siddiqui and Bhumi Pednekar star in this thriller.",
    ],
    year: 2023,
  },
  {
    id: "sirf-ek-bandaa-kaafi-hai",
    title: "Sirf Ek Bandaa Kaafi Hai",
    emojis: "⚖️📂🙏🏛️",
    clues: [
      "A lawyer takes on a powerful religious figure accused of abuse.",
      "The case demands years of persistence and courtroom battles.",
      "Manoj Bajpayee plays advocate P. C. Solanki.",
    ],
    year: 2023,
  },
  {
    id: "bhola",
    title: "Bholaa",
    emojis: "🚛🚔⛓️🔥",
    clues: [
      "An ex-prisoner tries to reunite with his daughter.",
      "A dangerous night forces him to protect police officers and civilians.",
      "Ajay Devgn directs and stars in this action thriller.",
    ],
    year: 2023,
  },
  {
    id: "kisi-ka-bhai-kisi-ki-jaan",
    title: "Kisi Ka Bhai Kisi Ki Jaan",
    emojis: "👨‍👦‍👦💍🥊❤️",
    clues: [
      "A protective older brother refuses to marry before his younger brothers do.",
      "A romance brings him into conflict with a violent rival.",
      "Salman Khan leads this family-action film.",
    ],
    year: 2023,
  },
  {
    id: "mission-majnu",
    title: "Mission Majnu",
    emojis: "🕵️‍♂️🇵🇰📡💣",
    clues: [
      "An Indian undercover agent operates in a neighbouring country.",
      "His mission involves uncovering a secret nuclear programme.",
      "Sidharth Malhotra stars as a spy in this period thriller.",
    ],
    year: 2023,
  },
  {
    id: "chandramukhi-2",
    title: "Chandramukhi 2",
    emojis: "🏰👻💃🪞",
    clues: [
      "A family encounters a supernatural presence in an old mansion.",
      "A dancer's spirit is connected to a centuries-old rivalry.",
      "Kangana Ranaut and Raghava Lawrence star in this horror sequel.",
    ],
    year: 2023,
  },
  {
    id: "blind-2023",
    title: "Blind",
    emojis: "👩‍🦯🚔🌃🔦",
    clues: [
      "A visually impaired former police officer witnesses a suspicious event.",
      "She becomes trapped in a dangerous pursuit.",
      "Sonam Kapoor leads this Hindi remake of a Korean thriller.",
    ],
    year: 2023,
  },
  {
    id: "neeyat",
    title: "Neeyat",
    emojis: "🏝️🔍🍷🩸",
    clues: [
      "A detective investigates a mysterious death at a billionaire's retreat.",
      "Every guest appears to have a motive.",
      "Vidya Balan plays detective Mira Rao.",
    ],
    year: 2023,
  },
  {
    id: "kathal",
    title: "Kathal",
    emojis: "🍈👮‍♀️🌳😂",
    clues: [
      "A police officer investigates the disappearance of two prized fruits.",
      "The case reveals strange priorities among local authorities.",
      "Sanya Malhotra stars in this satirical comedy.",
    ],
    year: 2023,
  },
  {
    id: "jogira-sara-ra-ra",
    title: "Jogira Sara Ra Ra",
    emojis: "💍🎩😂❤️",
    clues: [
      "A matchmaker who prides himself on clever plans faces a difficult client.",
      "A wedding arrangement spirals out of control.",
      "Nawazuddin Siddiqui and Neha Sharma star in this comedy.",
    ],
    year: 2023,
  },
  {
    id: "blind-2023-2",
    title: "I Love You",
    emojis: "🏢📱❤️🔪",
    clues: [
      "A woman finds herself trapped in a dangerous workplace situation.",
      "An unexpected visitor turns a romantic setting into a thriller.",
      "Rakul Preet Singh stars in this suspense film.",
    ],
    year: 2023,
  },

  // ==================== 2024 ====================
  {
    id: "bhool-bhulaiyaa-3-2024",
    title: "Bhool Bhulaiyaa 3",
    emojis: "🏰👻👑🕯️",
    clues: [
      "A fake ghostbuster encounters a haunting involving two mysterious spirits.",
      "A royal palace hides secrets tied to its past.",
      "Kartik Aaryan returns as Rooh Baba.",
    ],
    year: 2024,
  },
  {
    id: "singham-again",
    title: "Singham Again",
    emojis: "🚔🦁🚁🔥",
    clues: [
      "A fearless police officer leads a rescue mission for a kidnapped loved one.",
      "Several officers from a shared action universe join the operation.",
      "Ajay Devgn returns as Bajirao Singham.",
    ],
    year: 2024,
  },
  {
    id: "fighter",
    title: "Fighter",
    emojis: "✈️🛩️🪖🇮🇳",
    clues: [
      "Elite air force pilots prepare for dangerous combat missions.",
      "Their squadron faces a major cross-border threat.",
      "Hrithik Roshan and Deepika Padukone star in this aerial action film.",
    ],
    year: 2024,
  },
  {
    id: "shaitaan",
    title: "Shaitaan",
    emojis: "🏠🍋👁️🕯️",
    clues: [
      "A family vacation turns terrifying when a stranger enters their home.",
      "Their daughter falls under the influence of a sinister visitor.",
      "Ajay Devgn, R. Madhavan and Jyothika star in this supernatural thriller.",
    ],
    year: 2024,
  },
  {
    id: "crew",
    title: "Crew",
    emojis: "✈️👩‍✈️💰🧳",
    clues: [
      "Three flight attendants face financial troubles at their airline.",
      "A discovery aboard a flight pulls them into a smuggling scheme.",
      "Tabu, Kareena Kapoor Khan and Kriti Sanon star together.",
    ],
    year: 2024,
  },
  {
    id: "munjya",
    title: "Munjya",
    emojis: "🌳👹💍🌕",
    clues: [
      "A young man encounters a supernatural creature rooted in local folklore.",
      "The spirit has an unusual obsession with marriage.",
      "The story blends Marathi folklore with horror comedy.",
    ],
    year: 2024,
  },
  {
    id: "teri-baaton-mein-aisa-uljha-jiya",
    title: "Teri Baaton Mein Aisa Uljha Jiya",
    aliases: ["tbmauj"],
    emojis: "🤖❤️💃🧑‍💻",
    clues: [
      "A robotics engineer falls for a woman who seems almost too perfect.",
      "Their relationship hides an extraordinary technological secret.",
      "Shahid Kapoor and Kriti Sanon star in this sci-fi romance.",
    ],
    year: 2024,
  },
  {
    id: "article-370-2024",
    title: "Article 370",
    emojis: "🕵️‍♀️📜🏔️🇮🇳",
    clues: [
      "An intelligence officer works during a major political operation.",
      "The story is set around a historic constitutional change.",
      "Yami Gautam stars in this political action thriller.",
    ],
    year: 2024,
  },
  {
    id: "maidaan",
    title: "Maidaan",
    emojis: "⚽🏟️🇮🇳🥅",
    clues: [
      "A football coach dreams of building a world-class Indian team.",
      "His players prepare for international competition in the 1950s and 1960s.",
      "Ajay Devgn portrays coach Syed Abdul Rahim.",
    ],
    year: 2024,
  },
  {
    id: "srikanth",
    title: "Srikanth",
    emojis: "👨‍🦯📈🏭🏆",
    clues: [
      "A visually impaired student pursues education and entrepreneurship.",
      "He overcomes barriers to build a successful manufacturing company.",
      "Rajkummar Rao portrays entrepreneur Srikanth Bolla.",
    ],
    year: 2024,
  },
  {
    id: "chandu-champion",
    title: "Chandu Champion",
    emojis: "🏊‍♂️🥇🥊🏅",
    clues: [
      "An athlete survives war and injury before pursuing a sporting dream.",
      "He trains across several disciplines and refuses to give up.",
      "Kartik Aaryan portrays Paralympic champion Murlikant Petkar.",
    ],
    year: 2024,
  },
  {
    id: "kill",
    title: "Kill",
    emojis: "🚆🔪💥🩸",
    clues: [
      "A commando boards a train filled with armed bandits.",
      "A rescue mission becomes a brutal fight through the carriages.",
      "Lakshya and Raghav Juyal star in this action thriller.",
    ],
    year: 2024,
  },
  {
    id: "bad-newz",
    title: "Bad Newz",
    emojis: "👶🧬💑😂",
    clues: [
      "A woman discovers an unusual pregnancy-related medical situation.",
      "Two men may both be biological fathers of her child.",
      "Vicky Kaushal, Triptii Dimri and Ammy Virk star in this comedy.",
    ],
    year: 2024,
  },
  {
    id: "vicky-vidya-ka-woh-wala-video",
    title: "Vicky Vidya Ka Woh Wala Video",
    emojis: "📼💍📺😂",
    clues: [
      "A newly married couple loses a private recording.",
      "Their search becomes a comic scramble through a small town.",
      "Rajkummar Rao and Triptii Dimri star in this comedy.",
    ],
    year: 2024,
  },
  {
    id: "do-patti",
    title: "Do Patti",
    emojis: "👭🏔️🔍⚖️",
    clues: [
      "A police officer investigates a case involving identical twins.",
      "Their complicated relationship hides secrets and possible violence.",
      "Kriti Sanon plays dual roles opposite Kajol.",
    ],
    year: 2024,
  },
  {
    id: "phir-aayi-hasseen-dillruba",
    title: "Phir Aayi Hasseen Dillruba",
    emojis: "💔🩸🚔📚",
    clues: [
      "A couple attempts to escape their troubled past in a new city.",
      "A fresh murder investigation threatens their plans.",
      "Taapsee Pannu and Vikrant Massey return in this sequel.",
    ],
    year: 2024,
  },
  {
    id: "savi",
    title: "Savi",
    emojis: "🔐🏃‍♀️🚔💍",
    clues: [
      "A woman attempts an elaborate prison escape to save her husband.",
      "She must outsmart security and work against the clock.",
      "Divya Khosla stars in this thriller inspired by a classic prison-break story.",
    ],
    year: 2024,
  },
  {
    id: "crakk",
    title: "Crakk",
    emojis: "🏙️🏃‍♂️💥🏆",
    clues: [
      "An underground athlete enters an extreme survival competition.",
      "Dangerous physical challenges push contestants to their limits.",
      "Vidyut Jammwal stars in this action sports thriller.",
    ],
    year: 2024,
  },
  {
    id: "yodha",
    title: "Yodha",
    emojis: "✈️🪖🛫🚨",
    clues: [
      "A soldier fights to stop a hijacking aboard an aircraft.",
      "He must save passengers while facing suspicion himself.",
      "Sidharth Malhotra stars as an elite commando.",
    ],
    year: 2024,
  },
  {
    id: "merry-christmas",
    title: "Merry Christmas",
    emojis: "🎄🍷🔍🌃",
    clues: [
      "Two strangers meet on Christmas Eve in a city at night.",
      "A seemingly romantic evening turns into a murder mystery.",
      "Vijay Sethupathi and Katrina Kaif star in this thriller.",
    ],
    year: 2024,
  },
  {
    id: "madgaon-express",
    title: "Madgaon Express",
    emojis: "🚆🌴🍃😂",
    clues: [
      "Three childhood friends finally take the trip they always dreamed of.",
      "Their holiday goes wrong after an unexpected discovery.",
      "Kunal Kemmu made his directorial debut with this comedy.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-placeholder",
    title: "Khel Khel Mein",
    emojis: "📱🍽️💍😂",
    clues: [
      "Friends at a dinner party agree to reveal messages and phone calls.",
      "Their secrets create a cascade of embarrassing revelations.",
      "Akshay Kumar leads this ensemble comedy about digital privacy.",
    ],
    year: 2024,
  },
  {
    id: "sarfira",
    title: "Sarfira",
    emojis: "✈️💸🏦🏆",
    clues: [
      "An ambitious man dreams of making air travel affordable for ordinary people.",
      "He battles investors and industry barriers to launch an airline.",
      "Akshay Kumar stars in this Hindi remake of a Tamil film.",
    ],
    year: 2024,
  },
  {
    id: "aavesham-hindi",
    title: "Aavesham",
    aliases: ["aavesham"],
    emojis: "🥊🕶️🎓🍻",
    clues: [
      "Three college students seek help from a flamboyant local gangster.",
      "Their plan to deal with bullies grows increasingly chaotic.",
      "Fahadh Faasil plays the larger-than-life gangster Ranga.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-2",
    title: "The Buckingham Murders",
    emojis: "🕵️‍♀️🏚️🧒🌧️",
    clues: [
      "A grieving detective investigates the disappearance of a child.",
      "The case unfolds in an English town within a close-knit community.",
      "Kareena Kapoor Khan stars as detective Jasmeet Bhamra.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-3",
    title: "Berlin",
    emojis: "🤟🕵️‍♂️🏢🔐",
    clues: [
      "A deaf man is suspected of being a foreign spy.",
      "An interpreter becomes involved in a tense interrogation.",
      "Aparshakti Khurana and Ishwak Singh star in this espionage thriller.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-4",
    title: "Amar Singh Chamkila",
    emojis: "🎤🎶🪕🌾",
    clues: [
      "A Punjabi singer rises to fame with bold, controversial songs.",
      "His career is cut short by an assassination.",
      "Diljit Dosanjh portrays the legendary musician in an Imtiaz Ali film.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-5",
    title: "Murder Mubarak",
    emojis: "🏰🍸🔍🔪",
    clues: [
      "A murder occurs at an exclusive club filled with wealthy suspects.",
      "A detective uncovers secrets beneath the polished appearances.",
      "Pankaj Tripathi leads this ensemble murder mystery.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-6",
    title: "Blackout",
    emojis: "🚗🌃💰🚨",
    clues: [
      "A journalist encounters a bizarre chain of events during one night.",
      "A car accident draws him into a dangerous situation involving cash.",
      "Vikrant Massey stars in this dark comedy thriller.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-7",
    title: "Phullwanti",
    emojis: "💃🎭👑🥁",
    clues: [
      "A talented dancer challenges a proud scholar in a historical setting.",
      "Their clash involves art, honour and public performance.",
      "Prajakta Mali stars in this Marathi period drama.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-8",
    title: "Auron Mein Kahan Dum Tha",
    emojis: "❤️⏳🚔🎹",
    clues: [
      "A long-separated couple reunites after years apart.",
      "A violent event has shaped their lives and their time apart.",
      "Ajay Devgn and Tabu star in this romantic drama.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-9",
    title: "Vedaa",
    emojis: "🥊👩‍🎓⚖️🔥",
    clues: [
      "A young woman fights caste oppression and seeks justice.",
      "A former soldier helps her train and stand up to powerful enemies.",
      "John Abraham and Sharvari star in this action drama.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-10",
    title: "Jigra",
    emojis: "👩‍👦‍👦⛓️🏢💥",
    clues: [
      "A determined woman plans to rescue her brother from imprisonment abroad.",
      "Her plan requires extraordinary courage and sacrifice.",
      "Alia Bhatt stars in this action thriller.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-11",
    title: "CTRL",
    emojis: "💻📱🎥🔒",
    clues: [
      "A young influencer uses an AI assistant to manage her digital life.",
      "A breakup prompts her to erase her former partner from her online world.",
      "Ananya Panday stars in this technology-themed thriller.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-12",
    title: "Fateh",
    emojis: "🕶️💻🔐🥊",
    clues: [
      "A former operative is drawn into a cybercrime investigation.",
      "He confronts a dangerous network exploiting vulnerable people.",
      "Sonu Sood stars in this action thriller.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-13",
    title: "Accident or Conspiracy: Godhra",
    emojis: "🚆🔥🔍⚖️",
    clues: [
      "A historical drama revisits a major train fire and its aftermath.",
      "The story examines competing claims about the incident.",
      "Its title names the Gujarat town at the centre of the events.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-14",
    title: "Kakuda",
    emojis: "🏘️👻🕰️🚪",
    clues: [
      "A village follows a strange ritual involving a specific door and time.",
      "Breaking the rule brings a supernatural curse.",
      "Riteish Deshmukh, Sonakshi Sinha and Saqib Saleem star.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-15",
    title: "Wild Wild Punjab",
    emojis: "🚗💔🍻🏞️",
    clues: [
      "Four friends embark on a road trip after a painful breakup.",
      "Their attempts to help one friend move on go hilariously wrong.",
      "Varun Sharma and Sunny Singh star in this buddy comedy.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-16",
    title: "Do Aur Do Pyaar",
    emojis: "💑☕💔🏙️",
    clues: [
      "A married couple considers whether their relationship can be repaired.",
      "Both partners have complicated feelings outside the marriage.",
      "Vidya Balan and Pratik Gandhi star in this romantic comedy-drama.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-17",
    title: "Phir Aayi Hasseen Dillruba",
    emojis: "📖🩸🚔❤️",
    clues: [
      "A couple tries to escape the consequences of an earlier crime.",
      "A new investigation threatens to expose their lies.",
      "Taapsee Pannu returns as Rani Kashyap.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-18",
    title: "Srikanth",
    emojis: "👨‍🦯📈🏭🎓",
    clues: [
      "A visually impaired student battles barriers to higher education.",
      "He later builds a business despite scepticism from others.",
      "Rajkummar Rao plays industrialist Srikanth Bolla.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-19",
    title: "Kahan Shuru Kahan Khatam",
    emojis: "💍🚗🎶❤️",
    clues: [
      "A wedding runaway meets a man who changes her plans.",
      "Their unexpected journey leads to romance and self-discovery.",
      "Dhvani Bhanushali stars in her acting debut.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-20",
    title: "Ruslaan",
    emojis: "🎸🔫🕵️‍♂️🔥",
    clues: [
      "A man raised in a complicated family seeks to prove himself.",
      "His musical ambitions clash with a dangerous world of espionage.",
      "Aayush Sharma stars in this action drama.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-21",
    title: "Main Atal Hoon",
    emojis: "📜🇮🇳🎙️🏛️",
    clues: [
      "A biographical drama follows a poet who became a national leader.",
      "His political journey spans several decades.",
      "Pankaj Tripathi portrays former prime minister Atal Bihari Vajpayee.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-22",
    title: "Accident or Conspiracy: Godhra",
    emojis: "🚆🔥⚖️📰",
    clues: [
      "The story revisits a controversial historical event involving a train.",
      "Investigations and political arguments shape the narrative.",
      "The film's title names a town in Gujarat.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-23",
    title: "Khel Khel Mein",
    emojis: "📱🍽️💍🤫",
    clues: [
      "Friends agree to share their phone messages during a dinner.",
      "Private secrets rapidly disrupt their relationships.",
      "Akshay Kumar leads this ensemble comedy.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-24",
    title: "Azaad",
    emojis: "🐎🏇🌾🇮🇳",
    clues: [
      "A young stable boy develops a bond with a spirited horse.",
      "His journey unfolds against the backdrop of colonial India.",
      "The film features Ajay Devgn and introduces Aaman Devgan.",
    ],
    year: 2024,
  },
  {
    id: "laapataa-2024-25",
    title: "Emergency",
    emojis: "🏛️📜🇮🇳🎙️",
    clues: [
      "A political biographical drama depicts a defining period in Indian history.",
      "The central leader imposes a nationwide state of emergency.",
      "Kangana Ranaut portrays former prime minister Indira Gandhi.",
    ],
    year: 2024,
  },
];

// Combine your original 19 movies with these 100 new movies.
// export const ALL_MOVIES: Movie[] = [...MOVIES, ...MORE_MOVIES, ...MORE_MOVIES_2017_2024];

const seenIds = new Set<string>();
const seenTitles = new Set<string>();

export const ALL_MOVIES: Movie[] = [...MOVIES, ...MORE_MOVIES, ...MORE_MOVIES_2017_2024].filter((m) => {
  const title = m.title.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (seenIds.has(m.id) || seenTitles.has(title)) {
    console.warn(`[movies] duplicate skipped: ${m.id} (${m.title})`);
    return false;
  }
  seenIds.add(m.id);
  seenTitles.add(title);
  return true;
});

console.log(`[movies] ${ALL_MOVIES.length} movies loaded`);