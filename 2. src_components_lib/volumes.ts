export interface Volume {
  id: number;
  title: string;
  description: string;
  pages: string;
  coverImage: string;
  category: "career" | "guidance";
  subcategories?: string;
}

export const volumes: Volume[] = [
  {
    id: 1,
    title: "General Information plus Art",
    description: "Explore careers in Linguistic, Musical & Performing, and Visual arts — from fine art to graphic design, animation, photography, and creative industries. Includes general information, how to help your child prepare for a career, and AI vs IT insights.",
    pages: "Pgs 1 – 144",
    coverImage: "/images/covers/volume-01.jpg",
    category: "career",
    subcategories: "Linguistic, Musical & Performing, Visual",
  },
  {
    id: 2,
    title: "Business",
    description: "Discover business careers including finance, accounting, management, marketing, entrepreneurship, human resources, insurance, and more.",
    pages: "Pgs 145 – 240",
    coverImage: "/images/covers/volume-02.jpg",
    category: "career",
  },
  {
    id: 3,
    title: "Civil",
    description: "Military and civil service career opportunities including SANDF (SA Air Force, SA Army, SA Military Health Service, SA Navy), SAPS, Metropolitan Police, and general government roles.",
    pages: "Pgs 241 – 292",
    coverImage: "/images/covers/volume-03.jpg",
    category: "career",
    subcategories: "General, SANDF, SAPS",
  },
  {
    id: 4,
    title: "Clerical",
    description: "Administrative, secretarial, office management, data capturing, and clerical career paths and qualifications.",
    pages: "Pgs 293 – 320",
    coverImage: "/images/covers/volume-04.jpg",
    category: "career",
  },
  {
    id: 5,
    title: "Computers",
    description: "IT, software development, cybersecurity, data science, AI, machine learning, robotics, and technology careers in an evolving digital landscape.",
    pages: "Pgs 321 – 428",
    coverImage: "/images/covers/volume-05.jpg",
    category: "career",
  },
  {
    id: 6,
    title: "Medical",
    description: "Healthcare careers covering both Ancillary and Mainstream medicine — nursing, medical sciences, pharmaceutical, allied health, radiology, and specialist physician roles.",
    pages: "Pgs 429 – 534",
    coverImage: "/images/covers/volume-06.jpg",
    category: "career",
    subcategories: "Ancillary, Mainstream",
  },
  {
    id: 7,
    title: "Practical",
    description: "Hands-on trades, vocational careers, skills development, social services in practical fields, and careers in manufacturing.",
    pages: "Pgs 535 – 692",
    coverImage: "/images/covers/volume-07.jpg",
    category: "career",
    subcategories: "Skills, Social, Manufacturing",
  },
  {
    id: 8,
    title: "Science",
    description: "Natural sciences and research careers — Animal, Chemical, Earth, Engineering, Medical, Physical, Plant, and Research sciences.",
    pages: "Pgs 693 – 908",
    coverImage: "/images/covers/volume-08.jpg",
    category: "career",
    subcategories: "Animal, Chemical, Earth, Engineering, Medical, Physical, Plant, Research",
  },
  {
    id: 9,
    title: "Social",
    description: "Social work, community development, assistance, teaching, law, education, and human services careers.",
    pages: "Pgs 909 – 982",
    coverImage: "/images/covers/volume-09.jpg",
    category: "career",
    subcategories: "Assistance, Community, Teaching",
  },
  {
    id: 10,
    title: "Unconventional",
    description: "Unique and emerging career paths that break the mould — from forensic specialists to adventure tourism, drone pilots, ethical hackers, and more.",
    pages: "Pgs 983 – 1,078",
    coverImage: "/images/covers/volume-10.jpg",
    category: "career",
  },
  {
    id: 11,
    title: "Places to Study",
    description: "Comprehensive directory of Universities, Universities of Technology, TVET/FET Colleges, Agricultural Colleges, Private Higher Education Institutions, Registered Nursing Institutions, SETA Learnerships, and more.",
    pages: "Pgs 1,079 – 1,408",
    coverImage: "",
    category: "guidance",
  },
  {
    id: 12,
    title: "Entry Requirements & Career Info",
    description: "Professional Bodies, General Organisations, Sport Organisations, Educational Abbreviations, Support & Counselling Organisations, Volunteer Organisations, and the comprehensive Index to Careers.",
    pages: "Pgs 1,409 – 1,522",
    coverImage: "",
    category: "guidance",
  },
  {
    id: 13,
    title: "Bursaries & Financial Aid",
    description: "Over 10,200 Bursaries and other forms of financial aid offered by more than 1,400 organisations and individuals, including NSFAS, corporate bursaries, and scholarship opportunities.",
    pages: "Pgs 1,523+",
    coverImage: "",
    category: "guidance",
  },
];
