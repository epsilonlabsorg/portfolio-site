export function validateEnquiry(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (values.message.trim().length < 10)
    errors.message = "Please tell us a little more (at least 10 characters).";
  return errors;
}

export function buildBrief(values) {
  return `Name: ${values.name.trim()}\nEmail: ${values.email.trim()}\nCompany: ${values.company.trim() || "Not provided"}\nInterested in: ${values.service || "Help finding a starting point"}\n\n${values.message.trim()}`;
}
