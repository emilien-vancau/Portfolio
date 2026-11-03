// ============================================================
// Website content data file
// ============================================================

import { StatusType } from "@/components/StatusTag";
import type { ComparisonImage } from "@/components/MultiImageComparison";

export const identity = {
  firstName: "Emilien",
  lastName: "Vancauwenberghe",
  proTitle: "Engineer | AI, Machine Learning, Data & Software",
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
  description: string[];
  toolsTechnologies: string[];
  isDisplay: boolean;
}[] = [
  {
    role: "Intern AI Engineer",
    place: "Exail Robotics Belgium",
    period: "09/2025 — 11/2025",
    description: [
      "Built multi-view AI models for mine countermeasures, trained on real sonar data.",
      "Built an ETL pipeline from SQL views to Pandas and grouped snippets into objects with KNN.",
      "Designed geometric and photometric augmentation with georeferenced metadata updates.",
      "Adapted MVCNN and ConvLSTM to binary classification with missing-view masking.",
      "Analysed training and validation loss curves to improve model performance.",
    ],
    toolsTechnologies: ["Python", "SQL", "Pandas", "PyTorch", "OpenCV", "KNN", "MVCNN", "ConvLSTM"],
    isDisplay: true,
  },
  {
    role: "Student Job Administrative help",
    place: "ChWapi",
    period: "07/2022 — 08/2022",
    description: [
      "Administrative support at the visits management, including data entry, contacting patients and registering their visits.",
    ],
    toolsTechnologies: [],
    isDisplay: true,
  },
  {
    role: "Intern Web Developer",
    place: "Technord MES/IT",
    period: "01/2021 — 05/2021",
    description: [
      "Built an Angular SPA for production orders: planned lists, sortable tables, details.",
      "Developed an ASP.NET Core Web API consuming the ERP web service, with NTLM auth.",
      "Wrote unit tests for MsSQL stored procedures in Visual Studio 2019.",
      "Researched Camunda BPM for BPMN workflow orchestration.",
    ],
    toolsTechnologies: ["Angular", "ASP.NET Core", "C#", "ERP Web Service", "NTLM", "MsSQL", "Visual Studio", "Camunda BPM", "BPMN"],
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
    tags: ["Arduino", "C++", "Embedded", "Electronics"],
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
      "A from-scratch implementation of the Isolation Forest algorithm, which flags anomalies by how quickly random trees isolate each observation. The project benchmarks it against LOF, OCSVM, and scikit-learns iForest on 11 datasets, measuring AUC and runtime, and studies the effects of hyperparameters and masking/swamping.",
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
  },
   {
    title: "Fairness in Active Learning",
    period: "",
    description:
      "Master's thesis combining active learning with algorithmic fairness. Active learning's instance selection can amplify demographic bias, so the work tests pre-processing, post-processing, and FAL mitigation methods on four sensitive datasets with three model families.",
    tags: ["Python", "Scikit-learn", "Pandas", "AIF360"],
    statusTag: StatusType.Completed,
    isDisplay: true,
  },
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
    tags: ["Astrophotography", "Nebula", "Composition", "Deep Sky", "Pixinsight"],
    statusTag: StatusType.Active,
    isDisplay: true,
  },
  {
    title: "Composition of a lightweight travel setup",
    period: "",
    description:
      "Currently working on a lightweight travel setup for astrophotography, which will allow me to capture high-quality images of deep sky objects while traveling. The setup is designed to be portable and easy to use, without compromising on image quality.",
    tags: ["Gear", "Travel", "Widefield", "Deep Sky", "Solar"],
    statusTag: StatusType.Active,
    isDisplay: true,
  },
  
];

export const equipment: { name: string; note: string }[] = [
  { name: "Telescope", note: "Skywatcher - Newton 200/1000 f5" },
  { name: "Mount", note: "IOptron - Cem60-ec" },
  { name: "Imager", note: "QHYCCD - QHY294C" },
  { name: "Filters", note: "Optolong - L-extreme / L-pro" },
  { name: "Corrector", note:"TS-Optics - Coma corrector Maxfield 0.95X" },
];

export const astroComparisonImages: ComparisonImage[] = [
  {
    src: "/imgs/M51_raw_rgb.jpg",
    alt: "Raw RGB image",
    label: "Raw RGB",
    textPosition: "bottom",
  },
  {
    src: "/imgs/M51_stacked_rgb.jpg",
    alt: "Stacked RGB image",
    label: "Stacked RGB",
    textPosition: "bottom",
  },
  {
    src: "/imgs/M51_final_lrgb.jpg",
    alt: "Final LRGB image ",
    label: "Final LRGB",
    textPosition: "bottom",
  },
];

export const astroTexts = {
  acquisition: {
    title: "Handmade acquisition",
    punchline: "Every photon, caught by my own hands.",
    description:
      "Every image starts with gear I assembled and tuned myself. The better the data at the telescope, the easier everything after it.",
    maintenance:
      "Clean optics, precise collimation, a balanced mount: there is no shortcut to quality data.",
  },
  processing: {
    title: "Finest processing",
    punchline: "Reveal. Never invent.",
    description:
      "The processing step is where art and science converge in a meaningful way. I employ a sophisticated combination of specialized software tools and advanced techniques to bring out the finest details and characteristics in the acquired data, while simultaneously preserving the natural beauty and authenticity of the astronomical objects being observed. The overarching goal is not to simply paint a canvas using extravagant colors, artificial enhancements, and dramatic effects that would erase or misrepresent the original observational data, but rather to thoughtfully reveal the hidden details, intricate structures, and faint features that are genuinely present in the raw data. The aim is always to maintain a natural and scientifically accurate appearance that honors the true nature of what was observed.",
  },
  dataStorytelling: {
    title: "Data storytelling",
    punchline: "A picture is also a dataset.",
    description1:
      "Beyond the purely artistic aspect of astrophotography, exploiting each observation to its fullest potential is also a powerful way to deepen our understanding about the observed celestial object and the broader universe in general. I engage in careful processing and data cleaning on the pictures before conducting detailed analysis and extracting scientifically valuable information.",
    description2:
      "Clean data reveals patterns, physical properties and hidden relationships, and turns raw observations into insights. Once the data are ready, we can perform analyses such as:",
    analysisOperations: [
      { name: "Astrometry", description: "which identifies known objects in the image." },
      { name: "Photometry", description: "which measures the brightness of objects." },
      { name: "Spectroscopy", description: "which reveals the chemical composition of objects." },
      { name: "And much more", description: "" },
    ],
  },
  collaboration: {
  title: "Working through collaboration",
  quote: "Science is a collaborative enterprise, spanning the generations.",
  author: "Carl Sagan",
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
    src: "/imgs/pk_080-06-1.jpg",
    alt: "pk 080-06.1 protoplanetary nebula",
    title: "pk 080-06.1 - Protoplanetary Nebula",
    caption: "L • Newton 200/1000",
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
    src: "/imgs/LBN_331.jpg",
    alt: "LBN 331",
    title: "LBN 331",
    caption: "HaRGB • Newton 200/1000",
    width: 1024,
    height: 681,
  },
  {
    src: "/imgs/LDN_673.jpg",
    alt: "LDN 673",
    title: "LDN 673",
    caption: "L • Newton 200/1000",
    width: 1024,
    height: 681,
  }
];
