import youtubeImage from "../images/projects/youtube.jpeg";
import seedImage from "../images/projects/seed.jpeg";
import helloDrfxImage from "../images/projects/hello-drfx.jpeg";

type Icon = {
  name: string;
  set: "fa6" | "ci" | "bs";
};

type Project = {
  name: string;
  imageUrl: ImageMetadata;
  altText: string;
  githubUrl: string;
  webUrl?: string;
  icons: Icon[];
};

const projects: Project[] = [
  {
    name: "hello-drfx",
    imageUrl: helloDrfxImage,
    altText: "Race Street Pier photo by Leigh Michael Forrest",
    githubUrl: "https://github.com/leighmforrest/hello-drfx",
    webUrl: "https://hello.gripweedconsulting.com/",
    icons: [
      { name: "FaPython", set: "fa6" },
      { name: "FaReact", set: "fa6" },
      { name: "BsTypescript", set: "bs" },
    ],
  },
  {
    name: "seed",
    imageUrl: seedImage,
    altText: "Penn Treaty Park photo by Leigh Michael Forrest",
    githubUrl: "https://github.com/leighmforrest/seed",
    webUrl: "https://gripweed-seed.netlify.app/",
    icons: [
      { name: "FaReact", set: "fa6" },
      { name: "BsTypescript", set: "bs" },
    ],
  },
  {
    name: "YouTube",
    imageUrl: youtubeImage,
    altText: "Delaware and Colombia Lampost photo by Leigh Michael Forrest",
    githubUrl: "https://github.com/leighmforrest/youtube",
    icons: [{ name: "FaPython", set: "fa6" }],
  },
];

export default projects;
