// The words of the home page, in each of its languages (see i18n.ts). Names, links and the email
// address are the same in every language and live in profile.ts.
import type { Locale } from "./i18n.ts";

interface Entry {
  title: string;
  text: string;
}

export interface HomeCopy {
  title: string;
  description: string;
  imageAlt: string;
  role: string;
  location: string;
  /** The intro, then its end, which the vermillion stroke underlines. */
  lead: [string, string];
  /** The link to the page in the other language, written in that language. */
  switchLabel: string;
  /** The tulip of the logo: its button's label, and the note a click shows. */
  tulip: { label: string; note: string };
  sections: { work: string; about: string; projects: string };
  services: Entry[];
  /** "Want to work together? Write to", the email address, "or", the LinkedIn link. */
  contact: [string, string, string];
  /** A paragraph about me, not a CV: LinkedIn has the details. */
  about: string;
  source: string;
}

export const COPY: Record<Locale, HomeCopy> = {
  en: {
    title: "Bram van Osta, freelance developer and product engineer",
    description:
      "Freelance full-stack developer and product engineer in south-west France: product scoping, web, mobile and desktop apps, APIs and MCP servers, AI adoption for teams, technical audits and part-time CTO roles.",
    imageAlt: "Bram van Osta, freelance developer and product engineer in south-west France",
    role: "Freelance developer and product engineer",
    location: "South-west France",
    lead: [
      "From the first idea to production, I work out what to build, then build it: web and mobile apps, APIs, desktop tools, MCP servers. I also",
      "help teams put AI to work.",
    ],
    switchLabel: "Version française",
    tulip: {
      label: "Why a tulip?",
      note: "Why a tulip? Born in the Netherlands, raised in France, and a windmill was harder to draw.",
    },
    sections: { work: "Work", about: "About", projects: "Projects" },
    services: [
      {
        title: "Product scoping and design",
        text: "Turning an idea into a plan: understanding the need with you and your users, scoping a first version worth shipping, designing the flows and the architecture, then keeping the product on course as it grows.",
      },
      {
        title: "Product development",
        text: "Web, mobile and desktop apps, APIs and MCP servers, from the first version to production. The stack follows the project, not the other way around: TypeScript, Python, Go, PHP, Rust, React, React Native, native iOS and Android, and whatever else the job calls for.",
      },
      {
        title: "AI, put to work",
        text: "Taking AI from scattered experiments to everyday practice, in the tech team and beyond: choosing the tools, connecting them to your own systems with agents and MCP servers, setting the rules, and training the people who use them.",
      },
      {
        title: "Technical audits",
        text: "A clear picture of where your product stands, before a fundraise, a takeover or a rewrite: code, architecture, infrastructure, security and delivery reviewed, even on an old and thinly documented codebase. Findings ranked by impact, and a plan your team can act on.",
      },
      {
        title: "Tech lead and part-time CTO",
        text: "In your team for the long run or a few days a week: setting the technical direction, reviewing code and architecture, hiring and mentoring developers, keeping delivery on track, or holding the CTO seat through a transition.",
      },
    ],
    contact: ["Want to work together? Write to", "or", "message me on LinkedIn"],
    about:
      "I've been building software for more than ten years, from agency work to CTO seats in startups. What I enjoy most is the stretch between an idea and something people actually use: working out what matters, cutting the rest, and shipping it. I like simple products, readable code and teams that talk to each other, and I'd rather ask a naive question early than build the wrong thing. These days, a good part of the job is finding where AI truly helps, and where it doesn't.",
    source: "Source",
  },
  fr: {
    title: "Bram van Osta, développeur freelance et product engineer",
    description:
      "Développeur full-stack freelance et product engineer dans le Sud-Ouest : cadrage produit, applications web, mobiles et desktop, API et serveurs MCP, adoption de l’IA en entreprise, audits techniques et CTO à temps partiel.",
    imageAlt: "Bram van Osta, développeur freelance et product engineer dans le Sud-Ouest",
    role: "Développeur freelance et product engineer",
    location: "Sud-Ouest, France",
    lead: [
      "De la première idée à la production, je définis ce qu’il faut construire, puis je le construis : applications web et mobiles, API, outils desktop, serveurs MCP. J’aide aussi",
      "les équipes à tirer le meilleur de l’IA.",
    ],
    switchLabel: "English version",
    tulip: {
      label: "Pourquoi une tulipe\u202f?",
      note: "Pourquoi une tulipe\u202f? Né aux Pays-Bas, grandi en France, et un moulin, c’était plus dur à dessiner.",
    },
    sections: { work: "Services", about: "À propos", projects: "Projets" },
    services: [
      {
        title: "Cadrage et conception produit",
        text: "Transformer une idée en plan : comprendre le besoin avec vous et vos utilisateurs, cadrer une première version qui vaut la peine d’être livrée, concevoir les parcours et l’architecture, puis garder le cap à mesure que le produit grandit.",
      },
      {
        title: "Développement produit",
        text: "Applications web, mobiles et desktop, API et serveurs MCP, de la première version à la production. La stack suit le projet, pas l’inverse : TypeScript, Python, Go, PHP, Rust, React, React Native, iOS et Android en natif, et tout ce que le projet demande.",
      },
      {
        title: "L’IA, au quotidien",
        text: "Faire passer l’IA d’expériences éparpillées à une pratique de tous les jours, dans l’équipe tech comme ailleurs : choisir les outils, les brancher sur vos propres systèmes avec des agents et des serveurs MCP, poser les règles, et former celles et ceux qui s’en servent.",
      },
      {
        title: "Audits techniques",
        text: "Une vision claire de l’état de votre produit, avant une levée de fonds, une reprise ou une refonte : code, architecture, infrastructure, sécurité et livraison passés en revue, même sur une base de code ancienne et peu documentée. Des constats classés par impact, et un plan que votre équipe peut suivre.",
      },
      {
        title: "Tech lead et CTO à temps partiel",
        text: "Dans votre équipe sur la durée ou quelques jours par semaine : fixer la direction technique, relire le code et l’architecture, recruter et faire grandir les développeurs, tenir le rythme des livraisons, ou assurer le rôle de CTO le temps d’une transition.",
      },
    ],
    contact: ["Envie de travailler ensemble ? Écrivez-moi à", "ou", "contactez-moi sur LinkedIn"],
    about:
      "Je construis des logiciels depuis plus de dix ans, de l’agence aux postes de CTO en startup. Ce que je préfère, c’est le chemin entre une idée et quelque chose que les gens utilisent vraiment : comprendre ce qui compte, couper le reste, et livrer. J’aime les produits simples, le code lisible et les équipes qui se parlent, et je préfère poser une question naïve tôt que construire la mauvaise chose. Aujourd’hui, une bonne partie du métier consiste à trouver où l’IA aide vraiment, et où elle ne sert à rien.",
    source: "Code source",
  },
};
