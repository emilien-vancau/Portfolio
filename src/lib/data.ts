// ============================================================
// CONTENU DU SITE
// ------------------------------------------------------------
// Cette première itération mélange une structure complète avec
// du contenu provisoire. Chaque entrée marquée isDisplay: false est
// un exemple à remplacer. Envoie-moi tes vraies infos (intitulés,
// dates, descriptions, liens) et je les intègre directement ici.
// ============================================================

import { StatusType } from "@/components/StatusTag";

export const identity = {
  firstName: "Emilien",
  lastName: "Vancauwenberghe",
  proTitle: "AI engineer | ML engineer | Software developer",
  proTagline:
    "Transforming data into intelligent solutions. AI & Machine Learning Engineer focused on building reliable, scalable, and impactful AI systems.",
  astroTagline:
    "Passionate about exploring the wonders of the universe. I enjoy capturing the beauty of deep sky objects and sharing my observations with fellow enthusiasts.",
  location: "Belgique",
  email: "emilien.vancau@gmail.com",
};

export const skills: { category: string; items: string[] }[] = [
  {
    category: "Programming Languages",
    items: ["Python", "C#", "C++", "C", "Java", "TypeScript", "JavaScript"],
  },
  {
    category: "Frameworks & Technologies",
    items: ["PyTorch", "Angular", "ASP.NET", "Spring", "Arduino", "Next.js", "React", "Android"],
  },
  {
    category: "Tools ",
    items: ["OpenCV", "Scikit-learn", "Git", "Docker", "MySQL", "MsSQL", "Tailwind CSS"],
  },
  {
    category: "Others",
    items: ["Pixinsight", "Photoshop", "Fusion360", "Word", "Figma"],
  },
];

export const workExperiences: {
  role: string;
  place: string;
  period: string;
  description: string;
  isDisplay: boolean;
}[] = [
  {
    role: "Intern AI Engineer",
    place: "Exail Robotics Belgium",
    period: "09/2026 — 11/2026",
    description:
      "Research and development of AI models for Mine Counter Measures applications, focusing on data analysis and processing pipelines as well as model training and evaluation.",
    isDisplay: true,
  },
  {
    role: "Student Job Administrative help",
    place: "ChWapi",
    period: "07/2022 — 08/2022",
    description:
      "Administrative support at the visits management, including data entry, contacting patients and registering their visits.",
    isDisplay: true,
  },
  {
    role: "Intern Web Developer",
    place: "Technord",
    period: "01/2021 — 05/2021",
    description:
      "Contributed to the development of an internal platform to manage production orders between the company and its clients.",
    isDisplay: true,
  }
];

export const education: {
  degree: string;
  specialization: string;
  institution: string;
  period: string;
  isDisplay: boolean;
}[] = [
  {
    degree: "Master degree in Computer Science",
    specialization: "Artificial Intelligence and Data analytics",
    institution: "University of Mons",
    period: "2022 — 2026",
    isDisplay: true,
  },
  {
    degree: "Bachelor degree in Information Technology and Systems",
    specialization: "Software development",
    institution: "Haute école Louvain en Hainaut",
    period: "2018 — 2021",
    isDisplay: true,
  }

]

export const proProjects: {
  title: string;
  period: string;
  description: string;
  statusTag: StatusType;
  tags: string[];
  href?: string;
  isDisplay: boolean;
}[] = [
  {
    title: "Galaxies classifier",
    period: "",
    description:
      "Development of AI models for galaxies classification task using professional (DESI survey) and amateur astronomers real world data.",
    tags: ["Python", "PyTorch", "Pandas", "Scikit-learn", "AstroNN", "Astropy", "Pixinsight"],
    statusTag: StatusType.Active,
    isDisplay: true,
  },
  {
    title: "Weather Station",
    period: "",
    description:
      "Fully equipped Arduino-based weather station with anemometer, temperature sensor, photoresistor, barometer, rain sensor, wind vane, and hygrometer.",
    tags: ["Arduino"],
    statusTag: StatusType.InReview,
    isDisplay: true,
  },
  {
    title: "Energo-Sphere",
    period: "",
    description:
      "Web application for managing household energy portfolios. The application allows users to monitor their energy consumption and enables suppliers to manage customers and their contracts.",
    tags: ["Java","Angular", "Spring", "MySQL"],
    statusTag: StatusType.Completed,
    isDisplay: true,
  },
  {
    title: "Isolation Forest",
    period: "",
    description:
      "From scratch implementation of the IForest algorithm for anomaly detection in datasets.",
    tags: ["Python", "SciKit-Learn", "Pandas"],
    statusTag: StatusType.Completed,
    isDisplay: true,
  },
  {
    title: "Connected Oil Diffuser",
    period: "",
    description:
      "Prototyping of an essential oil diffuser for the company DoTerra, connected to the internet with the option to choose which oil to diffuse. The device can be controlled via a smartphone app.",
    tags: ["Arduino", "Android"],
    statusTag: StatusType.Completed,
    isDisplay: true,
  }
];

export const astroProjects: {
  title: string;
  period: string;
  description: string;
  statusTag: StatusType;
  tags: string[];
  href?: string;
  isDisplay: boolean;
}[] = [
  {
    title: "Galaxies classifier",
    period: "",
    description:
      "Acquisition and processing of amateur astronomers' images of galaxies, to create a dataset for training AI models for the galaxies classification project.",
    tags: ["Deep Learning", "Dataset", "Galaxies", "Deep Sky", "Pixinsight"],
    statusTag: StatusType.Active,
    isDisplay: true,
  },
  {
    title: "Construction d'un Dobson 200mm",
    period: "2023",
    description:
      "Exemple provisoire : fabrication maison d'un télescope Dobson, du miroir à la structure en bois.",
    statusTag: StatusType.Completed,
    tags: ["Bricolage", "Optique"],
    isDisplay: false,
  },
  {
    title: "Suivi de la comète C/2023",
    period: "2023",
    description:
      "Exemple provisoire : série d'observations et de croquis réalisés sur plusieurs semaines pour suivre le passage d'une comète.",
    statusTag: StatusType.Completed,
    tags: ["Observation", "Carnet de terrain"],
    isDisplay: true,
  },
  {
    title: "Ton vrai projet astro",
    period: "202X",
    description:
      "Emplacement prêt pour un vrai projet ou une vraie observation — remplace ce texte par ton contenu.",
    statusTag: StatusType.Completed,
    tags: ["À compléter"],
    isDisplay: true,
  },
];

export const equipment: { name: string; note: string }[] = [
  { name: "Telescope", note: "Skywatcher - Newton 200/1000 f5" },
  { name: "Mount", note: "IOptron - Cem60-ec" },
  { name: "Imager", note: "QHYCCD - QHY294C" },
  { name: "Filters", note: "Optolong - L-extreme / L-pro" },
];
