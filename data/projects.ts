type Icon = {
  name: string;
  set: "fa6" | "ci";
};

type Project = {
  name: string;
  imageUrl: string;
  githubUrl: string;
  webUrl?: string;
  icons: Icon[];
};

const projects: Project[] = [
  {
    name: "seed",
    imageUrl: "https://placehold.co/600x600/png",
    githubUrl: "https://github.com/leighmforrest/seed",
    icons: [
      { name: "FaPython", set: "fa6" },
      { name: "FaReact", set: "fa6" },
    ],
  },
  {
    name: "seed 2",
    imageUrl: "https://placehold.co/600x600/png",
    githubUrl: "https://github.com/leighmforrest/seed",
    icons: [
      { name: "FaPython", set: "fa6" },
      { name: "FaReact", set: "fa6" },
    ],
  },
  {
    name: "seed 3",
    imageUrl: "https://placehold.co/600x600/png",
    githubUrl: "https://github.com/leighmforrest/seed",
    icons: [
      { name: "FaPython", set: "fa6" },
      { name: "FaReact", set: "fa6" },
    ],
  },
  {
    name: "seed 4",
    imageUrl: "https://placehold.co/600x600/png",
    githubUrl: "https://github.com/leighmforrest/seed",
    icons: [
      { name: "FaPython", set: "fa6" },
      { name: "FaReact", set: "fa6" },
    ],
  },
];

export default projects;
