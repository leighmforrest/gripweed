type Icon = {
  name: string;
  set: "fa6" | "ci" | "bs";
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
    webUrl: "https://gripweed-seed.netlify.app/",
    icons: [
      { name: "FaReact", set: "fa6" },
      { name: "BsTypescript", set: "bs" },
    ],
  },
  {
    name: "YouTube",
    imageUrl: "https://placehold.co/600x600/png",
    githubUrl: "https://github.com/leighmforrest/youtube",
    icons: [
      { name: "FaPython", set: "fa6" },
    ],
  },
];

export default projects;
