import React, { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowDown } from "@phosphor-icons/react/dist/csr/ArrowDown";
import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { Copy } from "@phosphor-icons/react/dist/csr/Copy";
import { List } from "@phosphor-icons/react/dist/csr/List";
import { Minus } from "@phosphor-icons/react/dist/csr/Minus";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { X } from "@phosphor-icons/react/dist/csr/X";
import "@fontsource-variable/dm-sans";
import { services, projects } from "./content";
import { buildBrief, validateEnquiry } from "./enquiry";
import { getContactConfig, sendEnquiry } from "./contact-api";
import { useInputModality } from "./motion";
import "./styles.css";
import "./motion.css";

const contactEmail =
  import.meta.env.VITE_CONTACT_EMAIL || "info.epsilondev@gmail.com";
const contactConfig = getContactConfig(import.meta.env);
const contactEndpoint = contactConfig.endpoint;

function Brand({ large = false }) {
  return (
    <a
      href="#top"
      className={`brand${large ? " brand-large" : ""}`}
      aria-label="Epsilon Labs home"
    >
      <span className="brand-symbol" aria-hidden="true" />
      <span>
        epsilon <span className="brand-labs">labs</span>
      </span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  useEffect(() => {
    function escape(event) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  return (
    <header className="site-header">
      <nav className="container navigation" aria-label="Main navigation">
        <Brand />
        <button
          ref={trigger}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="navigation-links"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={23} /> : <List size={23} />}
        </button>
        <div
          id="navigation-links"
          className={`navigation-links ${open ? "menu-open" : ""}`}
        >
          <a href="#about" onClick={() => setOpen(false)}>
            The lab
          </a>
          <a href="#capabilities" onClick={() => setOpen(false)}>
            Services
          </a>
          <a href="#work" onClick={() => setOpen(false)}>
            Portfolio
          </a>
          <a
            href="#contact"
            className="button nav-contact"
            onClick={() => setOpen(false)}
          >
            Contact us <ArrowUpRight size={16} />
          </a>
        </div>
      </nav>
    </header>
  );
}

function Services() {
  const [expanded, setExpanded] = useState("data");
  return (
    <section
      className="section container services-section"
      id="capabilities"
      aria-labelledby="services-title"
    >
      <div className="section-heading">
        <p className="section-label">Services</p>
        <h2 id="services-title">
          The right starting point.
          <br />
          The whole way through.
        </h2>
        <p>
          From connecting your data to building the tools your team uses. We
          work with what you have and build what you need.
        </p>
      </div>
      <div className="services-list">
        {services.map((service) => {
          const isOpen = expanded === service.id;
          return (
            <article
              className={`service ${isOpen ? "service-open" : ""}`}
              key={service.id}
            >
              <h3>
                <button
                  aria-expanded={isOpen}
                  aria-controls={`service-${service.id}`}
                  id={`service-trigger-${service.id}`}
                  onClick={() => setExpanded(isOpen ? null : service.id)}
                >
                  <span>{service.title}</span>
                  <span className="service-summary">{service.summary}</span>
                  <span className="service-toggle">
                    {isOpen ? <Minus size={21} /> : <Plus size={21} />}
                  </span>
                </button>
              </h3>
              <div
                id={`service-${service.id}`}
                role="region"
                aria-labelledby={`service-trigger-${service.id}`}
                hidden={!isOpen}
                className="service-content"
              >
                <p>{service.description}</p>
                <div>
                  <p className="small-label">What we deliver</p>
                  <ul>
                    {service.deliverables.map((item) => (
                      <li key={item}>
                        <Check size={15} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className="inline-link">
                    Contact us <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Portfolio() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const visibleProjects = projects.filter(
    (project) => filter === "All" || project.category === filter,
  );
  return (
    <section
      className="portfolio-section"
      id="work"
      aria-labelledby="portfolio-title"
    >
      <div className="container">
        <div className="section-heading">
          <p className="section-label">Portfolio</p>
          <h2 id="portfolio-title">A look at what’s possible.</h2>
          <p>
            Illustrative project briefs for the systems we can build. These
            examples are not client engagements.
          </p>
        </div>
        <div className="portfolio-toolbar">
          <div
            className="filter-list"
            role="group"
            aria-label="Filter portfolio"
          >
            {["All", "Knowledge", "Automation", "Decision tools"].map(
              (item) => (
                <button
                  key={item}
                  aria-pressed={filter === item}
                  onClick={() => {
                    setFilter(item);
                    setSelected(null);
                  }}
                >
                  {item}
                </button>
              ),
            )}
          </div>
          <span className="result-count" role="status">
            {visibleProjects.length}{" "}
            {visibleProjects.length === 1 ? "example" : "examples"}
          </span>
        </div>
        <div className="project-list">
          {visibleProjects.map((project) => {
            const isOpen = selected === project.id;
            return (
              <article className="project" key={project.id}>
                <div className="project-intro">
                  <span className="project-category">{project.category}</span>
                  <div className="project-overview">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                  <button
                    className="project-button"
                    aria-expanded={isOpen}
                    aria-controls={`project-${project.id}`}
                    onClick={() => setSelected(isOpen ? null : project.id)}
                    aria-label={`${isOpen ? "Close" : "Explore"} ${project.title}`}
                  >
                    {isOpen ? <Minus size={23} /> : <ArrowUpRight size={23} />}
                  </button>
                </div>
                <div
                  hidden={!isOpen}
                  id={`project-${project.id}`}
                  className="project-details"
                >
                  <div>
                    <h4>The starting point</h4>
                    <p>{project.problem}</p>
                  </div>
                  <div>
                    <h4>The proposed system</h4>
                    <p>{project.solution}</p>
                  </div>
                  <div>
                    <h4>How we would evaluate it</h4>
                    <p>{project.measurement}</p>
                  </div>
                  <p className="project-disclaimer">
                    Illustrative brief. No client results are claimed.
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const controller = useRef(null);
  const form = useRef(null);
  const submissionId = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);
  function update(event) {
    const { name, value } = event.target;
    submissionId.current = null;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    if (state !== "sending") {
      setState("idle");
      setNotice("");
      setCopied(false);
    }
  }
  async function submit(event) {
    event.preventDefault();
    if (state === "sending") return;
    const nextErrors = validateEnquiry(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      form.current.elements[Object.keys(nextErrors)[0]]?.focus();
      return;
    }
    if (!contactEndpoint) {
      setState("draft");
      setNotice(
        "Your email draft is ready. Open it in your email app, review it, and send it to us.",
      );
      return;
    }
    setState("sending");
    setNotice("Sending your enquiry…");
    submissionId.current ||= crypto.randomUUID();
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 15000);
    try {
      await sendEnquiry(
        contactConfig,
        values,
        submissionId.current,
        controller.current.signal,
      );
      setState("sent");
      setNotice(
        "Your enquiry has been received. Thank you for telling us about your project.",
      );
    } catch (error) {
      setState("error");
      setNotice(
        error.status === 429
          ? "Too many enquiries right now. Please try again in an hour or open an email draft below."
          : "We couldn’t confirm your enquiry was received. Your details are still here. Try again or open an email draft below.",
      );
    } finally {
      clearTimeout(timeout);
    }
  }
  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(buildBrief(values));
      setCopied(true);
    } catch {
      setNotice(
        "Copy is unavailable in this browser. You can select and copy the draft below.",
      );
    }
  }
  const fields = [
    {
      name: "name",
      label: "Your name",
      placeholder: "Full name",
      autoComplete: "name",
      required: true,
      maxLength: 100,
    },
    {
      name: "email",
      label: "Work email",
      placeholder: "you@company.com",
      autoComplete: "email",
      type: "email",
      required: true,
      maxLength: 254,
    },
    {
      name: "company",
      label: "Company",
      placeholder: "Company name",
      autoComplete: "organization",
      maxLength: 150,
    },
  ];
  const emailHref = `mailto:${contactEmail}?subject=${encodeURIComponent(`Project enquiry from ${values.company || values.name}`)}&body=${encodeURIComponent(buildBrief(values))}`;
  return (
    <form
      ref={form}
      className="contact-form"
      noValidate
      onSubmit={submit}
      aria-label="Project enquiry"
      aria-busy={state === "sending"}
    >
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={update}
          disabled={state === "sending"}
        />
      </div>
      <div className="form-grid">
        {fields.map(({ label, ...field }) => (
          <div className="field" key={field.name}>
            <label htmlFor={field.name}>
              {label}
              {!field.required && <span> (optional)</span>}
            </label>
            <input
              {...field}
              id={field.name}
              type={field.type || "text"}
              value={values[field.name]}
              onChange={update}
              disabled={state === "sending"}
              aria-invalid={!!errors[field.name]}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            />
            {errors[field.name] && (
              <p className="field-error" id={`${field.name}-error`}>
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
        <div className="field">
          <label htmlFor="service">
            I’m interested in <span>(optional)</span>
          </label>
          <select
            id="service"
            name="service"
            value={values.service}
            onChange={update}
            disabled={state === "sending"}
          >
            <option value="">Help me find a starting point</option>
            {services.map((service) => (
              <option key={service.id}>{service.title}</option>
            ))}
          </select>
        </div>
        <div className="field field-full">
          <label htmlFor="message">What would you like to work on?</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Tell us about your business, the data you have, and the work you’d like to make easier."
            value={values.message}
            onChange={update}
            disabled={state === "sending"}
            required
            maxLength={4000}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : "message-hint"}
          />
          {errors.message ? (
            <p id="message-error" className="field-error">
              {errors.message}
            </p>
          ) : (
            <p id="message-hint" className="field-hint">
              A few sentences are enough to start.
            </p>
          )}
        </div>
      </div>
      <div className="form-bottom">
        <p>
          {contactEndpoint
            ? "Your details are used to respond to your enquiry."
            : "We’ll prepare an email draft for you to review and send."}
        </p>
        <button
          className="button"
          type="submit"
          disabled={state === "sending" || state === "sent"}
        >
          {state === "sending"
            ? "Sending…"
            : state === "sent"
              ? "Enquiry sent"
              : contactEndpoint
                ? "Send enquiry"
                : "Prepare enquiry"}
          {state === "sent" ? <Check size={17} /> : <ArrowUpRight size={17} />}
        </button>
      </div>
      <div
        aria-live="polite"
        aria-atomic="true"
        className={
          notice ? `form-notice ${state === "error" ? "notice-error" : ""}` : ""
        }
      >
        {notice}
      </div>
      {(state === "draft" || state === "error") && (
        <div className="draft-panel">
          <div className="draft-actions">
            <a className="button" href={emailHref}>
              Open email draft <ArrowUpRight size={16} />
            </a>
            <button className="copy-button" type="button" onClick={copyBrief}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy enquiry"}
            </button>
          </div>
          <details>
            <summary>View your draft</summary>
            <p className="draft-recipient">To: {contactEmail}</p>
            <pre>{buildBrief(values)}</pre>
          </details>
        </div>
      )}
    </form>
  );
}

function App() {
  useInputModality();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top" />
      <Header />
      <main id="main">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-intro">
            <p>An independent AI & data lab</p>
            <span>Built around your business.</span>
          </div>
          <h1 id="hero-title">
            Your data.
            <br />
            Put to work.
          </h1>
          <div className="hero-bottom">
            <a className="hero-portfolio" href="#work">
              <span className="round-arrow">
                <ArrowDown size={23} />
              </span>
              Explore the portfolio
            </a>
            <div className="hero-description">
              <p>
                We help growing companies connect their data, build useful AI,
                and make everyday work easier.
              </p>
              <a href="#contact" className="button">
                Contact us <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </section>
        <section
          className="about-section container"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-aside">
            <span className="section-label">The lab</span>
            <span className="about-mark" aria-hidden="true">
              ε
            </span>
          </div>
          <div className="about-copy">
            <h2 id="about-title">
              You already have the data.
              <br />
              Let’s make it useful.
            </h2>
            <p>
              Your knowledge lives in documents, spreadsheets, and the tools
              your team uses every day. We bring it together and build AI
              systems that can work with it.
            </p>
            <p>
              For small and midsize companies, that means a practical place to
              start, a team that understands the work, and something useful at
              the end.
            </p>
            <div className="about-principles">
              <span>Built on your data</span>
              <span>Connected to your tools</span>
              <span>Owned by your team</span>
            </div>
          </div>
        </section>
        <Services />
        <Portfolio />
        <section
          className="section container approach-section"
          id="approach"
          aria-labelledby="approach-title"
        >
          <div className="section-heading">
            <p className="section-label">Working together</p>
            <h2 id="approach-title">Start small. Build with purpose.</h2>
          </div>
          <ol className="process-list">
            <li>
              <span className="process-step">01</span>
              <h3>Understand the work</h3>
              <p>
                We map your workflow, review your data, and choose one problem
                worth solving.
              </p>
              <span className="process-output">A clear scope</span>
            </li>
            <li>
              <span className="process-step">02</span>
              <h3>Build something useful</h3>
              <p>
                We test a focused prototype with your team and agree on what
                success looks like.
              </p>
              <span className="process-output">A working pilot</span>
            </li>
            <li>
              <span className="process-step">03</span>
              <h3>Make it part of the day</h3>
              <p>
                We connect the system, document it, and help your team take
                ownership.
              </p>
              <span className="process-output">A system you can run</span>
            </li>
          </ol>
        </section>
        <section
          className="contact-section"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="container contact-layout">
            <div className="contact-copy">
              <p className="section-label">Contact us</p>
              <h2 id="contact-title">
                Let’s find your
                <br />
                starting point.
              </h2>
              <p>
                A question, an idea, or a process that takes too much time. Tell
                us what’s on your mind.
              </p>
              <div className="contact-direct">
                <span>Email us directly</span>
                <a className="contact-email" href={`mailto:${contactEmail}`}>
                  {contactEmail} <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <footer className="container footer">
        <div className="footer-top">
          <Brand large />
          <p>
            Useful intelligence.
            <br />
            Built for your business.
          </p>
          <div>
            <a
              href="https://github.com/epsilonlabsorg"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <ArrowUpRight size={14} />
            </a>
            <a href="#contact">
              Contact us <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Epsilon Labs</span>
          <span>Independent thinking. Practical systems.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
