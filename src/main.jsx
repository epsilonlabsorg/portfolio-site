import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Brain,
  ChartLineUp,
  Database,
  List,
  Moon,
  Sun,
  X,
} from "@phosphor-icons/react";
import "./styles.css";

const capabilities = [
  {
    icon: Database,
    title: "Data foundations",
    copy: "Connect scattered systems, clean critical data, and create a reliable base for AI.",
    tone: "blue",
  },
  {
    icon: Brain,
    title: "AI workflows",
    copy: "Build assistants and automations around the work your team already does every day.",
    tone: "graphite",
  },
  {
    icon: ChartLineUp,
    title: "Decision systems",
    copy: "Turn live business signals into useful forecasts, alerts, and next-best actions.",
    tone: "light",
  },
];

const engagements = [
  {
    sector: "Operations",
    title: "An operations copilot that knows the business",
    copy: "Bring SOPs, inventory, orders, and support history into one grounded assistant for faster daily decisions.",
    items: ["Knowledge retrieval", "Workflow automation", "Human approval"],
  },
  {
    sector: "Revenue",
    title: "A clearer view of every customer opportunity",
    copy: "Connect CRM, conversations, and product data to surface risk, intent, and the next useful action.",
    items: ["Customer intelligence", "Lead prioritization", "Account summaries"],
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("epsilon-theme");
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const nextTheme = savedTheme || preferredTheme;
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.14 }
    );

    const elements = document.querySelectorAll("[data-reveal]");
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("epsilon-theme", nextTheme);
  };

  return (
    <div className="site-shell">
      <header className="nav-wrap">
        <nav className="nav container" aria-label="Primary navigation">
          <a className="brand" href="#top" onClick={closeMenu} aria-label="Epsilon Labs home">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span>Epsilon Labs</span>
          </a>
          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
          <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
            <a href="#capabilities" onClick={closeMenu}>Capabilities</a>
            <a href="#work" onClick={closeMenu}>What we build</a>
            <a href="#approach" onClick={closeMenu}>Approach</a>
            <button className="theme-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
              {theme === "dark" ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
            </button>
            <a className="button button-small" href="#contact" onClick={closeMenu}>
              Start a project <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow hero-enter">AI systems for growing companies</p>
            <h1 className="hero-enter delay-1">Connected data. Useful AI.</h1>
            <p className="hero-lede hero-enter delay-2">
              We connect your business data to practical AI systems that automate decisions, reporting, and everyday work.
            </p>
            <div className="hero-actions hero-enter delay-3">
              <a className="button" href="#contact">Start a project <ArrowRight size={18} weight="bold" /></a>
              <a className="text-link" href="#capabilities">See capabilities <span aria-hidden="true">↘</span></a>
            </div>
          </div>
          <figure className="hero-visual hero-enter delay-2">
            <img src="/hero-ai-lab.webp" alt="Abstract streams of data converging into a precise intelligence system" />
            <figcaption>
              <span>Data, connected</span>
              <span>AI, made useful</span>
            </figcaption>
          </figure>
        </section>

        <section className="signal-strip" aria-label="Our focus">
          <div className="container signal-grid">
            <p>Strategy that reaches production.</p>
            <p>Systems your team can trust.</p>
            <p>Value measured in real work.</p>
          </div>
        </section>

        <section className="section container" id="capabilities">
          <div className="section-heading" data-reveal>
            <h2>From raw data to a reliable AI capability.</h2>
            <p>We handle the connective work between your systems, your people, and the models that make new workflows possible.</p>
          </div>
          <div className="capability-grid">
            {capabilities.map(({ icon: Icon, title, copy, tone }, index) => (
              <article className={`capability capability-${tone}`} data-reveal key={title} style={{ "--delay": `${index * 80}ms` }}>
                <Icon size={30} weight="duotone" aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="work-section" id="work">
          <div className="container">
            <div className="work-intro" data-reveal>
              <p className="eyebrow">What we can build</p>
              <h2>AI that fits how your company actually works.</h2>
            </div>
            <div className="work-feature" data-reveal>
              <div className="work-image">
                <img src="/operations-flow.webp" alt="Abstract business records moving from disorder into an organized cobalt workflow" loading="lazy" />
              </div>
              <div className="work-copy">
                <span className="work-type">Connected intelligence</span>
                <h3>One useful layer across the tools you already use.</h3>
                <p>We design around your existing stack, so your team gets answers and actions without another system to babysit.</p>
              </div>
            </div>
            <div className="engagements">
              {engagements.map((engagement, index) => (
                <article className="engagement" data-reveal key={engagement.sector} style={{ "--delay": `${index * 100}ms` }}>
                  <span>{engagement.sector}</span>
                  <h3>{engagement.title}</h3>
                  <p>{engagement.copy}</p>
                  <div className="engagement-tags" aria-label={`${engagement.sector} capabilities`}>
                    {engagement.items.map((item) => <small key={item}>{item}</small>)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section approach container" id="approach">
          <div className="approach-intro" data-reveal>
            <h2>Small starts.<br />Serious outcomes.</h2>
            <p>We begin with one valuable workflow, prove it with your real data, then expand what works.</p>
          </div>
          <div className="approach-flow" data-reveal>
            <article>
              <span>Find the leverage</span>
              <p>Map the decisions, bottlenecks, and data behind your most expensive repeated work.</p>
            </article>
            <article>
              <span>Build the proof</span>
              <p>Create a focused system your team can test quickly, with security and oversight designed in.</p>
            </article>
            <article>
              <span>Scale what works</span>
              <p>Integrate the proven workflow, measure the change, and extend it across the business.</p>
            </article>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="container contact-inner" data-reveal>
            <div>
              <p className="eyebrow">Your first AI system</p>
              <h2>Bring us the workflow that should work better.</h2>
            </div>
            <a className="button button-light" href="mailto:hello@epsilonlabs.org?subject=AI%20project%20with%20Epsilon%20Labs">
              Start a project <ArrowRight size={19} weight="bold" />
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <a className="brand" href="#top" aria-label="Back to top">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span>Epsilon Labs</span>
          </a>
          <p>Practical AI systems for growing businesses.</p>
          <div className="footer-links">
            <a href="mailto:hello@epsilonlabs.org">Email</a>
            <a href="https://github.com/epsilonlabsorg" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
