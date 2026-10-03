import accessStudioVideo from "../videos/WhatsApp Video 2026-09-23 at 1.34.49 AM.mp4";
import customerOperationsVideo from "../videos/WhatsApp Video 2026-09-25 at 2.21.53 AM.mp4";
import olistVideo from "../videos/brag.mp4";

export const services = [
  {
    id: "data",
    title: "Data foundations",
    summary: "Bring the right information together.",
    description:
      "Make your business data accessible, consistent, and ready to use. We connect the sources that matter and put clear rules around how information flows.",
    deliverables: [
      "Source integrations and data pipelines",
      "Data quality checks and clear definitions",
      "Access controls and documentation",
    ],
  },
  {
    id: "knowledge",
    title: "AI assistants",
    summary: "Put your company’s knowledge within reach.",
    description:
      "Give your team an assistant grounded in your own documents and business context. Answers link back to sources, with permissions that reflect who should see what.",
    deliverables: [
      "Search across your internal knowledge",
      "Answers with source references",
      "Evaluation with your real questions",
    ],
  },
  {
    id: "automation",
    title: "Workflow automation",
    summary: "Give repetitive work a better process.",
    description:
      "Connect the steps between an incoming request and a completed task. We build clear approval points, exception handling, and a record of what happened.",
    deliverables: [
      "Integrations with your existing tools",
      "Document processing and task routing",
      "Human review for important decisions",
    ],
  },
  {
    id: "software",
    title: "Custom AI software",
    summary: "Build the tool your business needs.",
    description:
      "Turn a specific business need into software your people can use. We design the experience, build the system, and help your team operate it.",
    deliverables: [
      "Internal tools and customer applications",
      "Models selected for your use case",
      "Testing, deployment, and handover",
    ],
  },
];

// Portfolio projects with video walkthroughs.
export const projects = [
  {
    id: "access-studio",
    category: "Automation",
    title: "Access Studio",
    description: "A clearer path to care, from a conversation to a confirmed appointment.",
    problem: "Booking a visit involves choosing a service, verifying identity, and getting the right help when a request needs a person.",
    solution: "A shared patient and staff experience with a voice assistant, appointment confirmation, and a human handoff queue.",
    highlights: "The walkthrough shows patient access, a spoken booking request, demo identity verification, and the staff workspace.",
    disclosure: "Portfolio prototype with fictional patient data and simulated verification. No live clinical service is shown.",
    video: accessStudioVideo,
    poster: "/projects/access-studio.webp",
    duration: "0:37",
  },
  {
    id: "customer-operations",
    category: "Automation",
    title: "Customer Operations Command Center",
    description: "Turn a support incident into an investigation your team can inspect.",
    problem: "When a customer workflow breaks after a deployment, support teams need to understand what changed and prepare a useful engineering handoff.",
    solution: "A command center brings together cases, telemetry, an investigation trace, and an AI support assistant to examine the evidence.",
    highlights: "Follow a deployment investigation through its checks, a probable client-version regression, and the recommended engineering handoff.",
    disclosure: "Product demonstration using synthetic customer data. The diagnosis shown belongs to the demo scenario.",
    video: customerOperationsVideo,
    poster: "/projects/customer-operations.webp",
    duration: "0:21",
  },
  {
    id: "olist-intelligence",
    category: "Decision tools",
    title: "Olist Intelligence",
    description: "Explore sales, delivery, and customer feedback with answers grounded in the data.",
    problem: "Business questions span order records, delivery performance, and customer reviews. An answer needs clear metric definitions and an honest account of what the data can support.",
    solution: "An analytics experience combines governed metrics, review search, role-aware views, and an AI assistant that identifies questions the dataset cannot answer.",
    highlights: "The demo explores delivered item value, customer review search, seller-scoped records, and a question about profit that the available data cannot support.",
    disclosure: "Portfolio demonstration using Olist data. Figures shown describe the selected demo records, not client results.",
    video: olistVideo,
    poster: "/projects/olist-intelligence.webp",
    duration: "0:50",
  },
];
