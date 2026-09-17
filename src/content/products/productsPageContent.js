/**
 * All copy for the Products index and the shared labels on every product detail page.
 */

export const productsIndexContent = {
  breadcrumb: { home: "Home", current: "Products" },
  hero: {
    label: "Our systems",
    title: "Systems that fit the business",
    emphasis: "fit",
    lead: "Working systems Cambridge Marketing builds, deploys and fits to how a business actually trades. Open any one of them and every screen you see is a capture of it running.",
    primaryAction: { href: "/#services", label: "Book a strategy call" },
    secondaryAction: { href: "#catalogue", label: "Explore systems" },
  },
  adaptation: {
    label: "How we are different",
    headingParts: [
      { text: "We fit the " },
      { text: "system to the business", tone: "accent" },
      { text: ", not the " },
      { text: "business to the system", tone: "counter" },
    ],
    body: "Most software asks a business to work the way it was built. That is fine until the fit is wrong, and then it is a daily tax paid by the people at the counter. A till written for a restaurant, put into a shop that sells by weight, is the clearest version of it.",
    genericTitle: "A system built for someone else",
    genericNote: "A restaurant till, running a grocery shop.",
    fittedTitle: "A system built for you",
    fittedNote: "The same job, fitted to how the shop actually trades.",
    unusedLabel: "fields the counter staff skip, every day",
    generic: [
      { field: "Table number", verdict: "unused" },
      { field: "Covers per sitting", verdict: "unused" },
      { field: "Kitchen ticket", verdict: "unused" },
      { field: "Split the bill", verdict: "unused" },
      { field: "Stock counted by portion", verdict: "forced" },
      { field: "Price per item", verdict: "kept" },
    ],
    fitted: [
      { field: "Aisle and shelf", verdict: "kept" },
      { field: "Basket size", verdict: "kept" },
      { field: "Weighed goods", verdict: "kept" },
      { field: "Price by weight", verdict: "kept" },
    ],
  },
  customisation: {
    label: "How they are delivered",
    headingParts: [
      { text: "Every system is " },
      { text: "fitted", tone: "accent" },
      { text: " before it is handed over" },
    ],
    body: "None of these arrives as it is shown here. Each is configured against a real operation, carries the client's own branding rather than ours, and keeps only the parts of the system that business actually uses.",
    points: [
      "Configured against how the business already works, not the other way round",
      "Delivered under the client's own name and identity",
      "Modules the business does not need are taken out rather than hidden",
      "Extended where the operation needs something the system does not do yet",
    ],
  },
  index: {
    label: "Live Reference Systems",
    heading: "Example Systems Built for Real Operations",
    description: "Every system we engineer is fully customized, re-engineered, and tailored to your exact business needs.",
    allLabel: "All",
    filterLabel: "Filter systems by industry",
    singularLabel: "system",
    pluralLabel: "systems",
    inLabel: "in",
    screensLabel: "screens",
  },
  contact: {
    heading: "See it against your own operation.",
    body: "Tell us how the business trades today and we will show the system working against that, rather than against a demo dataset.",
    action: { href: "/#services", label: "Book a strategy call" },
  },
  detail: {
    breadcrumbHome: "Home",
    breadcrumbIndex: "Products",
    demoLabel: "View demo",
    requestDemoLabel: "Book a strategy call",
    documentationLabel: "Documentation",
    sections: {
      solves: {
        label: "What it solves",
        heading: "The operational problem",
      },
      interface: {
        label: "Interface",
        heading: "The system in use",
        captureNote: "Screens are captures of the working system.",
        themeLabel: "Themes",
        themeHeading: "What your contact opens",
        themeNote:
          "Each card is built to the client's own identity. These are the themes it starts from.",
        illustrationNote:
          "This system was published with drawn views of its interface rather than photographs of it running, so that is what is shown below.",
      },
      modules: {
        label: "Modules and features",
        heading: "What it handles",
        body: "This is the system's own catalogue. It is deliberately not repeated on the service pages that implement it.",
      },
      replaces: {
        label: "What it replaces",
        heading: "What this takes off the desk",
      },
      adapts: {
        label: "Where we fit it",
        heading: "What gets changed for you",
        body: "None of these is handed over as it is shown above. These are the parts most often fitted to a particular business.",
      },
      suits: {
        label: "Who it suits",
        heading: "The business this is for",
      },
      industriesLabel: "Industries supported",
      integrationsLabel: "Integrations",
      services: {
        label: "Implementation and support",
        heading: "How this system is delivered",
        body: "The work around the system is a service engagement. Each one is described in full on our services section.",
      },
    },
    contact: {
      heading: "See it against your own numbers.",
      body: "Tell us how the business trades today and we will show the system working against that, rather than against a demo dataset.",
      action: { href: "/#services", label: "Book a strategy call" },
    },
  },
};
