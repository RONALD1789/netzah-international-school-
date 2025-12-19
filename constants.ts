
export const CLASSES = [
  "Sweet Pea",
  "Sunbeams",
  "Spectrum",
  "Shammah"
];

export const HOUSES = [
  { name: "Faith", color: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50" },
  { name: "Hope", color: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50" },
  { name: "Love", color: "bg-rose-600", text: "text-rose-600", light: "bg-rose-50" },
  { name: "Victory", color: "bg-indigo-600", text: "text-indigo-600", light: "bg-indigo-50" }
];

export const CLASS_LABELS: Record<string, string> = {
  "Sweet Pea": "Sweet Pea (Baby Class)",
  "Sunbeams": "Sunbeams (Pre-K)",
  "Spectrum": "Spectrum (Kindergarten)",
  "Shammah": "Shammah (Primary Level)"
};

export const NEXT_LEVEL: Record<string, string | null> = {
  "Sweet Pea": "Sunbeams",
  "Sunbeams": "Spectrum",
  "Spectrum": "Shammah",
  "Shammah": null
};

export const CLASS_SKILL_DATA: Record<string, any[]> = {
  "Sweet Pea": [
    {
      id: "language",
      name: "LANGUAGE AND LISTENING SKILLS",
      icon: "📖",
      color: "bg-[#F59E0B]",
      skills: [
        "I enjoy listening, and can pay attention to stories, poems, rhymes and songs, with enthusiasm",
        "I respond to my name when called, by turning my head towards the person speaking to me",
        "I can understand and follow simple commands given to me for example 'clap'",
        "I can mimic sounds spoken to me and say simple words",
        "I can indicate what I want by pointing with index finger or by vocalizing"
      ]
    },
    {
      id: "eating",
      name: "EATING AND SLEEPING PATTERNS",
      icon: "🍼",
      color: "bg-[#2DD4BF]",
      skills: [
        "I am learning to eat different food types",
        "I can hold and drink from a cup",
        "When I am put down to rest I can fall asleep on my own"
      ]
    },
    {
      id: "music",
      name: "MUSIC SKILLS",
      icon: "🎵",
      color: "bg-[#FACC15]",
      skills: [
        "I enjoy listening to music and react to loud, soft, slow and happy music",
        "I enjoy moving (dancing) to the rhythm of music",
        "I can mimic the sounds of a song to myself when playing or lying down to sleep"
      ]
    },
    {
      id: "environment",
      name: "ENVIRONMENT/ NATURE SKILLS",
      icon: "🌍",
      color: "bg-[#10B981]",
      skills: [
        "I am learning to identify and enjoy nature objects like plants, flowers and sand",
        "I enjoy playing with nature objects e.g. watering plants, planting / sowing seeds",
        "I enjoy playing in water, and swimming"
      ]
    },
    {
      id: "social",
      name: "SOCIAL / EMOTIONAL SKILLS",
      icon: "👫",
      color: "bg-[#EF4444]",
      skills: [
        "I can play on my own for short periods of time",
        "I can participate in activities with others as I develop small muscle control",
        "I can hold crayons and make marks with crayons",
        "I am learning to share toys with others",
        "I can identify human feelings from people's faces (sad, happy)",
        "I can imitate activities such as mopping the floor, brushing teeth"
      ]
    },
    {
      id: "physical",
      name: "PHYSICAL DEVELOPMENT",
      icon: "🏃",
      color: "bg-[#FB923C]",
      skills: [
        "I can point to at least one body part",
        "I can maintain balance while seated and while crawling / walking",
        "I can move my head and follow other people's movements around a room",
        "I am exploring ways to move from one place to another by crawling, climbing stairs",
        "I am learning that a potty is for toilet use"
      ]
    },
    {
      id: "spiritual",
      name: "SPIRITUAL DEVELOPMENT SKILLS",
      icon: "✝️",
      color: "bg-[#22D3EE]",
      skills: [
        "I am learning to be still for a few minutes when it is time to pray",
        "I am learning that God loves me and that I am special"
      ]
    }
  ],
  "Sunbeams": [
    {
      id: "listening_reading",
      name: "LISTENING AND READING SKILLS",
      icon: "📚",
      color: "bg-[#F59E0B]",
      skills: [
        "I can identify objects and talk about them",
        "I can arrange objects in order by color, size and shape",
        "I can say my first and last name",
        "I know how old I am",
        "I can identify letter sounds and numbers correctly",
        "I can follow two-three step directions to perform a task",
        "I can attend to the person speaking to me",
        "I can listen to stories, poems, rhymes and songs with enthusiasm",
        "I can follow up a story from beginning to end",
        "I can answer questions about a story after it has been read to me"
      ]
    },
    {
      id: "speaking",
      name: "LANGUAGE AND LITERACY (SPEAKING) SKILLS",
      icon: "🗣️",
      color: "bg-[#2DD4BF]",
      skills: [
        "I can express ideas and feelings about my experience of an activity",
        "I can identify and also read out some letter sounds with their actions",
        "I can read simple words out loud",
        "I enjoy language and can say rhymes, make up stories and poems",
        "I can participate in group discussions with my friends",
        "I can tell a story and make up original stories from picture objects",
        "I can hold a book the right way up"
      ]
    },
    {
      id: "art",
      name: "ART AND CRAFT SKILLS",
      icon: "🎨",
      color: "bg-[#A855F7]",
      skills: [
        "I can choose art materials and activities independently",
        "I can make objects out of play dough",
        "I can draw and paint using art materials",
        "I can manipulate, combine and transform a variety of different materials to make an object",
        "I can draw representations from personal experience"
      ]
    },
    {
      id: "physical",
      name: "PHYSICAL DEVELOPMENT SKILLS",
      icon: "🏃",
      color: "bg-[#FB923C]",
      skills: [
        "I can maintain balance while moving",
        "I can use the body as a base of support and move it to explore an activity",
        "I can point to body parts and name them",
        "I know I am growing because I am at school",
        "I can explore ways to move from one place to another by navigating my physical environment",
        "I can move at various speed levels, directions and rhythms",
        "I can model and imitate adult roles",
        "I can play out feelings and emotions",
        "I have learnt good hygiene habits",
        "I can tell when I want to use the toilet",
        "I have learnt not to talk while eating",
        "I am learning to dress myself"
      ]
    }
  ],
  "Spectrum": [
    {
      id: "listening_reading",
      name: "LISTENING AND READING SKILLS",
      icon: "📖",
      color: "bg-[#F59E0B]",
      skills: [
        "I can identify the letter sounds learnt, and the alphabet.",
        "I can read three-letter words and simple sentences and instructions.",
        "I can listen to stories, songs and poems with interest and answer follow up questions.",
        "I can retell a story using a sequence of events (beginning, middle, end)",
        "I can follow direction of print in a story from left to right.",
        "I can read short sentences with the help of sight words learnt.",
        "I can select favorite books to read",
        "I can identify my name, read it, and write it correctly in full"
      ]
    },
    {
      id: "speaking",
      name: "LANGUAGE AND LITERACY (SPEAKING) SKILLS",
      icon: "🗣️",
      color: "bg-[#2DD4BF]",
      skills: [
        "I can express myself with learnt vocabulary.",
        "I can say letter sounds learnt, and the alphabet.",
        "I can say rhymes, songs, and stories with a group and individually.",
        "I can say all the sight words learnt so far.",
        "I can say short sentences with good pronunciation.",
        "I can listen and respond to teacher's authority and also ask appropriate, follow-up questions."
      ]
    },
    {
      id: "writing",
      name: "WRITING SKILLS",
      icon: "✍️",
      color: "bg-[#3B82F6]",
      skills: [
        "I can handle pencils, colors, paint brushes, scissors firmly.",
        "I can write my name with ease.",
        "I can write numbers, letter sounds, capital, and small letters with ease.",
        "I can draw and name pictures.",
        "I can color in drawn pictures with ease.",
        "I can write short, complete sentences."
      ]
    },
    {
      id: "social",
      name: "SOCIAL / EMOTIONAL SKILLS",
      icon: "👫",
      color: "bg-[#EF4444]",
      skills: [
        "I am able to express my emotions appropriately, with confidence.",
        "I am able to say the magic words in the right situation.",
        "I am aware of what others are feeling in given situations.",
        "I can share and play cooperatively with my friends.",
        "I can ask questions and listen to the teacher.",
        "I can take responsibility for others and my property.",
        "I can work independently in small and large groups."
      ]
    },
    {
      id: "math",
      name: "MATH SKILLS",
      icon: "🔢",
      color: "bg-[#10B981]",
      skills: [
        "I can count numbers from 0-100.",
        "I can point out a corresponding number and write it.",
        "I can draw and count objects for numbers given to me.",
        "I can add numbers or objects.",
        "I can solve simple word equations.",
        "I can recognize shapes and various object sizes (big, small, long, short)"
      ]
    }
  ],
  "Shammah": [
    {
      id: "literacy_advanced",
      name: "ADVANCED LITERACY & COMPREHENSION",
      icon: "✍️",
      color: "bg-indigo-600",
      skills: [
        "I can read grade-appropriate texts with fluency and expression.",
        "I can identify the main idea and supporting details in a story.",
        "I can use correct punctuation (full stops, commas, question marks).",
        "I can write creative stories with a clear beginning, middle, and end.",
        "I can use descriptive adjectives to enhance my writing."
      ]
    },
    {
      id: "mathematics_primary",
      name: "PRIMARY MATHEMATICS",
      icon: "📐",
      color: "bg-emerald-600",
      skills: [
        "I can perform addition and subtraction of two-digit numbers.",
        "I am learning basic multiplication tables (2, 5, 10).",
        "I can tell time to the hour and half-hour on an analog clock.",
        "I can identify and describe properties of 2D and 3D shapes.",
        "I can solve multi-step word problems involving real-life scenarios."
      ]
    }
  ]
};

// Added missing FEE_STRUCTURE and END_OF_TERM_LETTER to fix import errors in App and Dashboards
export const FEE_STRUCTURE = [
  { particular: "Tuition Fees", k: "850,000", g13: "950,000", g46: "1,050,000" },
  { particular: "Admission Fee (New Students)", k: "200,000", g13: "200,000", g46: "200,000" },
  { particular: "Development Fee (Annual)", k: "150,000", g13: "150,000", g46: "150,000" },
  { particular: "Lunch & Snacks", k: "250,000", g13: "250,000", g46: "250,000" },
  { particular: "Uniforms (Full Set)", k: "220,000", g13: "250,000", g46: "280,000" },
  { particular: "Stationery & ACE Manuals", k: "120,000", g13: "180,000", g46: "200,000" }
];

export const END_OF_TERM_LETTER = `
Dear Parents and Guardians,

As we conclude another successful term at Netzah International School, we want to express our gratitude for your continued partnership. 

Our theme this term has been "Nurturing for Victory," and we have seen significant growth in every learner. Please find the terminal reports and next term's fee structure in your portal.

We look forward to seeing everyone back next term.

Best regards,
School Administration
`;
