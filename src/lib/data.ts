// ============================================================
// CONTENU DU SITE
// ------------------------------------------------------------
// Cette première itération mélange une structure complète avec
// du contenu provisoire. Chaque entrée marquée isDisplay: false est
// un exemple à remplacer. Envoie-moi tes vraies infos (intitulés,
// dates, descriptions, liens) et je les intègre directement ici.
// ============================================================

import { StatusType } from "@/components/StatusTag";
import type { ComparisonImage } from "@/components/MultiImageComparison";

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
    title: "Hearth of the Hearth nebula",
    period: "",
    description:
      "Project about the acquisition of the Hearth nebula (IC 1805) in the constellation of Cassiopeia. The resulting image is a mosaïc of 4 panels having a resolution of 40M pixels approximately. ",
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
    isDisplay: false,
  },
  {
    title: "Ton vrai projet astro",
    period: "202X",
    description:
      "Emplacement prêt pour un vrai projet ou une vraie observation — remplace ce texte par ton contenu.",
    statusTag: StatusType.Completed,
    tags: ["À compléter"],
    isDisplay: false,
  },
];

export const equipment: { name: string; note: string }[] = [
  { name: "Telescope", note: "Skywatcher - Newton 200/1000 f5" },
  { name: "Mount", note: "IOptron - Cem60-ec" },
  { name: "Imager", note: "QHYCCD - QHY294C" },
  { name: "Filters", note: "Optolong - L-extreme / L-pro" },
];

export const astroComparisonImages: ComparisonImage[] = [
  {
    src: "/imgs/M51_raw_rgb.jpg",
    alt: "Raw RGB image",
    label: "Raw RGB image",
    textPosition: "bottom",
  },
  {
    src: "/imgs/M51_stacked_rgb.jpg",
    alt: "Stacked RGB image",
    label: "Stacked RGB image",
    textPosition: "bottom",
  },
  {
    src: "/imgs/M51_final_lrgb.jpg",
    alt: "Final LRGB image ",
    label: "Final LRGB image ",
    textPosition: "bottom",
  },
];

export const astroTexts = {
  acquisition: {
    title: "Handmade acquisition",
    description:
      "All data are acquired through my own equipment and carefully assembled observational systems. This is one of the most important and foundational aspects of the hobby, as the primary challenge is to acquire the best possible observational data to keep the subsequent processing and post-processing steps as straightforward and efficient as possible.",
    maintenance:
      "Ensuring that the equipment is well-maintained, properly calibrated, and in optimal condition is essential to obtain the highest quality data possible. This comprehensive maintenance routine includes regular and thorough cleaning of all optical surfaces, precise checking and adjustment of the telescope's collimation to ensure perfect alignment, and ensuring that the mount is not only properly aligned but also well-balanced to minimize vibration and tracking errors.",
  },
  processing: {
    title: "Finest processing",
    description:
      "The processing step is where art and science converge in a meaningful way. I employ a sophisticated combination of specialized software tools and advanced techniques to bring out the finest details and characteristics in the acquired data, while simultaneously preserving the natural beauty and authenticity of the astronomical objects being observed. The overarching goal is not to simply paint a canvas using extravagant colors, artificial enhancements, and dramatic effects that would erase or misrepresent the original observational data, but rather to thoughtfully reveal the hidden details, intricate structures, and faint features that are genuinely present in the raw data. The aim is always to maintain a natural and scientifically accurate appearance that honors the true nature of what was observed.",
  },
  dataStorytelling: {
    title: "Data storytelling",
    description1:
      "Beyond the purely artistic aspect of astrophotography, exploiting each observation to its fullest potential is also a powerful way to deepen our understanding about the observed celestial object and the broader universe in general. To accomplish this meaningful analysis, I engage in careful and systematic processing and data cleaning on the pictures before conducting detailed analysis and extracting scientifically valuable information.",
    description2: 
      "With clean, well-processed data in hand, it becomes possible to develop a more comprehensive understanding and knowledge about what was observed, uncovering patterns, physical properties, and relationships that might otherwise remain hidden. This analytical approach transforms raw observations into meaningful insights.",
  },
    
  collaboration: {
    title: "Working through collaboration",
    description:
      "While astrophotography is certainly a hobby that can be deeply enjoyed in solitude and personal pursuit, it is equally and importantly a fantastic way to meaningfully connect with other passionate enthusiasts and learn from their diverse experiences and unique perspectives. By actively sharing my observations, findings, and results with others and actively collaborating on projects and analysis with fellow observers, I can gain valuable new insights and continuously improve my technical and artistic skills. Collaboration also frequently leads to unexpected new discoveries, shared learning experiences, and a progressively deeper and more nuanced understanding of the universe and our place within it. The community aspect enriches not only my own work but also contributes to collective knowledge.",
  },
};

export type GalleryImage = {
  src: string;
  alt: string;
  title: string;
  caption?: string;
  /** Dimensions réelles du fichier : elles servent uniquement à réserver le ratio (pas de layout shift). */
  width: number;
  height: number;
};

export const astroGallery: GalleryImage[] = [
  {
    src: "/imgs/M51_final_lrgb.jpg",
    alt: "Messier 51, the Whirlpool galaxy",
    title: "M51 — Whirlpool Galaxy",
    caption: "LRGB • Newton 200/1000",
    width: 2048,
    height: 1506,
  },
  {
    src: "/imgs/pk 080-06.1.jpg",
    alt: "pk 080-06.1 protoplanetary nebula",
    title: "pk 080-06.1 - Protoplanetary Nebula",
    caption: "L • protoplanetary nebula",
    width: 300,
    height: 300,
  },
  {
    src: "/imgs/OU4.jpg",
    alt: "Outers 4 Squid Nebula",
    title: "OU4 — Squid Nebula",
    caption: "HOO • Newton 200/1000",
    width: 1024,
    height: 681,
  },
  {
    src: "/imgs/Vdb4.jpg",
    alt: "Vdb4",
    title: "Vdb4",
    caption: "RGB • Newton 200/1000",
    width: 1024,
    height: 681,
  },
  {
    src: "/imgs/LBN 331.jpg",
    alt: "LBN 331",
    title: "LBN 331",
    caption: "HaRGB • Newton 200/1000",
    width: 1024,
    height: 681,
  },
  // Ajoute ici 2 à 7 images supplémentaires (mélange de formats portrait / paysage / carré
  // pour que le masonry soit visible).
];
