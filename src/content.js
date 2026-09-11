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

// Illustrative briefs, not delivered projects. Replace with verified client work.
export const projects = [
  {
    id: "knowledge",
    category: "Knowledge",
    title: "A company knowledge assistant",
    description:
      "Find the answer across documents, policies, and internal knowledge.",
    problem:
      "A growing team spends time searching scattered documents and asking the same questions.",
    solution:
      "A permission-aware assistant retrieves relevant documents and includes source references with each answer.",
    measurement:
      "Test answer quality, source accuracy, and time to find information against a set of real team questions.",
  },
  {
    id: "documents",
    category: "Automation",
    title: "Documents into decisions",
    description:
      "Turn incoming documents into structured records and review tasks.",
    problem:
      "Staff manually read documents, copy fields between tools, and chase missing information.",
    solution:
      "Extract agreed fields, flag uncertain values for review, and route approved records to existing systems.",
    measurement:
      "Compare extraction accuracy, review effort, and processing time with the current manual workflow.",
  },
  {
    id: "operations",
    category: "Decision tools",
    title: "An operations briefing",
    description: "Bring the changes that matter into one useful daily summary.",
    problem:
      "Managers compile updates from several systems before they can understand what needs attention.",
    solution:
      "Combine approved operational data into a briefing with source links, exceptions, and clearly defined metrics.",
    measurement:
      "Evaluate completeness, freshness, and the time needed to prepare and act on the daily briefing.",
  },
  {
    id: "requests",
    category: "Automation",
    title: "A better enquiry workflow",
    description: "Organize new requests and get them to the right person.",
    problem:
      "Enquiries arrive in shared inboxes and need manual classification, assignment, and follow-up.",
    solution:
      "Classify requests, suggest responses using approved knowledge, and create tasks for a human to review.",
    measurement:
      "Track routing accuracy, response preparation time, and the rate of requests that need correction.",
  },
];
