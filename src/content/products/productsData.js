/**
 * Canonical product records for Cambridge Marketing (CAMBM).
 * 9 published products with complete verified operational metadata.
 */

const OPERATIONS_SERVICES = [
  {
    title: "POS and ERP Systems",
    slug: "pos-and-erp-systems",
    relationship:
      "Configuration, data migration, rollout and support are delivered through this service.",
  },
  {
    title: "Software Development",
    slug: "software-development",
    relationship:
      "Fitting the system to how the business actually works is delivered through this service.",
  },
];

export const allProductRecords = [
  {
    slug: "hostel-management",
    name: "Hostel and room management system",
    shortName: "Hostel",
    positioning: "Rooms, tenants, invoices and complaints for a hostel or small hotel.",
    lead: "An operator's system for a building let by the room. Invoicing, expenses, utilities, complaints and lease dates are held against the same records, so the front desk, the accounts and the maintenance log are one system rather than three that have to be reconciled.",
    category: "Property operations",
    published: true,
    depth: "full",
    evidence: "capture",
    screenKind: "interface",
    solves: [
      {
        title: "Occupancy you can read at a glance",
        body: "Rooms, tenants and lease dates on one record, so who is in, who is leaving and what is free stops being a question someone has to go and answer.",
      },
      {
        title: "Invoicing that leaves the building",
        body: "Invoices generated against the tenancy and sent by email or SMS, rather than written out and chased by hand.",
      },
      {
        title: "Complaints with evidence attached",
        body: "Photos and video attached to the complaint itself, so maintenance sees the problem instead of a description of it.",
      },
    ],
    modules: [
      { name: "Rooms, floors and rates", body: "The building as the system understands it." },
      { name: "Tenant records and online booking", body: "Who is in, and who is arriving." },
      { name: "Invoicing by email or SMS", body: "Billing that reaches the tenant." },
      { name: "Utility billing per room", body: "Consumption charged where it was used." },
      { name: "Complaints with photo and video", body: "Evidence attached to the report." },
      { name: "Lease documentation and wait lists", body: "Occupancy, renewals and the queue." },
      { name: "Staff roles and per-role access", body: "Who can see and change what." },
      { name: "Expenses and yearly accounts", body: "The building's costs against its income." },
      { name: "Separate admin, staff and tenant logins", body: null },
    ],
    replaces: [
      "A spreadsheet per building",
      "An invoice book kept separately from the tenancy",
      "Complaints living in a messaging app",
      "Lease renewal dates in one person's calendar",
    ],
    adapts: [
      "Rent charged nightly, monthly, or both at once",
      "Utilities split per room, per meter, or included in the rent",
      "Which of the three logins a client actually wants to hand out",
      "Invoice layout, currency, and the tax it has to show",
    ],
    suits:
      "A landlord or operator running one or more buildings let by the room, where invoicing and occupancy are currently kept in spreadsheets.",
    industries: ["Property", "Hospitality"],
    integrations: [],
    demoUrl: null,
    documentationUrl: null,
    relatedServices: OPERATIONS_SERVICES,
  },
  {
    slug: "school-management",
    name: "School management system",
    shortName: "School",
    positioning: "Students, staff, attendance, exams and fees, with an app for parents.",
    lead: "A school's administration on one system, from enrolment through to the fee receipt. Attendance, timetables, marks and announcements read from the same records, and parents see their own child's part of it on a phone rather than waiting for a letter home.",
    category: "Education management",
    published: true,
    depth: "full",
    evidence: "capture",
    screenKind: "interface",
    solves: [
      {
        title: "One record per student",
        body: "Attendance, marks, fees and announcements held against the same student, so nothing has to be reconciled between an office system and a teacher's own list.",
      },
      {
        title: "Fees collected where they are recorded",
        body: "Compulsory and optional fees, instalments, and what has actually been paid, against the student rather than in a separate ledger.",
      },
      {
        title: "Parents who do not have to ask",
        body: "A parent opens the app and sees their child's timetable, attendance, assignments and notices, which removes a large share of the phone calls a school office takes.",
      },
    ],
    modules: [
      { name: "Students", body: "Enrolment singly or in bulk, with the full record." },
      { name: "Teachers and staff", body: "People, roles and what each may reach." },
      { name: "Attendance", body: "Daily marking, by class and by session." },
      { name: "Timetables", body: "Generated against periods, subjects and teachers." },
      { name: "Exams and marks", body: "Assessment through to the grade book." },
      { name: "Fees", body: "Compulsory, optional, instalments and what is outstanding." },
      { name: "Assignments and lessons", body: "Set, submitted and marked." },
      { name: "Announcements", body: "Notices to a class, a year, or the school." },
      { name: "Academics and session years", body: "Classes, sections, subjects and the year." },
      { name: "Holidays and staff leave", body: null },
      { name: "Expenses", body: null },
      { name: "School gallery", body: null },
      { name: "Parent and student app", body: "The same records, on a phone." },
    ],
    replaces: [
      "A register marked on paper and typed up later",
      "Fee receipts written in a book",
      "Marks kept in a spreadsheet per teacher",
      "Notices sent home in a bag",
    ],
    adapts: [
      "Terms, semesters, or a single session year",
      "The grading scale the school actually uses",
      "Which fees are compulsory and how instalments fall",
      "How much a parent is allowed to see",
    ],
    suits:
      "A school or college running enrolment, attendance and fees across separate books and spreadsheets, where parents currently have to telephone the office to ask anything.",
    industries: ["Education"],
    integrations: [],
    demoUrl: null,
    documentationUrl: null,
    relatedServices: [
      OPERATIONS_SERVICES[1],
      {
        title: "Mobile App Development",
        slug: "mobile-app-development",
        relationship: "The parent and student app is delivered through this service.",
      },
    ],
  },
  {
    slug: "cambcard",
    name: "CAMBCARD (vCard)",
    shortName: "CAMBCARD",
    positioning: "A custom digital business card a contact can save, call or scan in one tap.",
    lead: "A vCard that lives at a link and a QR code instead of in a wallet, built to the client's own identity rather than picked off a shelf. Contact details, services, appointments and enquiries sit on one page a prospect can act on immediately, and the details can be corrected after the card has been handed out.",
    category: "Digital identity",
    published: true,
    depth: "full",
    evidence: "capture",
    screenKind: "theme",
    solves: [
      {
        title: "A card that cannot go out of date",
        body: "The link stays the same when a number, a title or a company does not, so a card handed out last year still resolves to the right details.",
      },
      {
        title: "Contact details that can be acted on",
        body: "Tap to call, tap to message, tap to save. A prospect reaches the person from the card rather than copying a number off it.",
      },
      {
        title: "Enquiries that arrive attributed",
        body: "An enquiry form and appointment booking on the card itself, so an approach arrives knowing whose card it came from.",
      },
    ],
    modules: [
      { name: "Card themes", body: "A design per trade, then fitted to the client's identity." },
      { name: "QR code", body: "Scanned from a printed card, a screen or a window." },
      { name: "Tap to call and message", body: "Phone, WhatsApp and email from the card." },
      { name: "Social links", body: "The accounts the business actually uses." },
      { name: "Services and products", body: "What is on offer, on the card itself." },
      { name: "Appointments", body: "A booking taken from the card." },
      { name: "Enquiry form", body: "Captured against the card it came from." },
      { name: "Gallery and testimonials", body: null },
      { name: "Analytics", body: "Which cards get opened, and what gets tapped." },
      { name: "Custom domain and branding", body: "The client's own name on the link." },
      { name: "Password protection", body: null },
      { name: "Custom fonts, CSS and scripts", body: null },
    ],
    replaces: [
      "A printed card that is wrong the moment someone changes role",
      "Contact details retyped from a photograph of a card",
      "A separate landing page built per salesperson",
      "Enquiries arriving with no idea who handed out the card",
    ],
    adapts: [
      "One card, or one per person across a whole team",
      "The client's own domain rather than a shared link",
      "Which sections a trade needs, and which are noise",
      "Branding taken from the client's identity rather than a template's",
    ],
    suits:
      "A team that hands out cards and wants to know what happens next, or a business whose details change often enough that printing is a recurring cost.",
    industries: ["Professional services", "Retail"],
    integrations: [],
    demoUrl: null,
    documentationUrl: null,
    relatedServices: [
      {
        title: "Website Development",
        slug: "website-development",
        relationship: "The public card and its domain are delivered through this service.",
      },
      {
        title: "UI/UX and Creative",
        slug: "ui-ux-and-creative",
        relationship:
          "Fitting a template to a client's identity is delivered through this service.",
      },
    ],
  },
  {
    slug: "property-management",
    name: "Property and tenant management system",
    shortName: "Property",
    positioning: "Portfolios, units, tenants and rent collection for a managing agent.",
    lead: "Administration and oversight of real estate on behalf of the owner: listing units, placing tenants, collecting rent and keeping the compliance record. Built for the agent holding several properties rather than for a single landlord.",
    category: "Property operations",
    published: true,
    depth: "full",
    evidence: "capture",
    screenKind: "interface",
    solves: [
      {
        title: "A portfolio read from one place",
        body: "Owned and leased properties held side by side, so a position across the whole book does not have to be assembled building by building.",
      },
      {
        title: "Tenants against units, not against folders",
        body: "The tenancy, the unit and the invoice are the same record, so rent owed is a fact the system holds rather than a calculation someone repeats.",
      },
      {
        title: "Maintenance that is assigned, not remembered",
        body: "Maintainers attached to the job and the property, so a repair has an owner and a history.",
      },
    ],
    modules: [
      { name: "Property and unit records", body: "The book, and what is inside each building." },
      { name: "Owned and leased side by side", body: "Two tenures, one view." },
      { name: "Tenant placement and records", body: "Who holds which unit, and since when." },
      { name: "Rent invoicing", body: "Billing raised against the tenancy." },
      { name: "Maintenance and maintainers", body: "Jobs with someone attached to them." },
      { name: "Staff management and roles", body: "Who in the agency can do what." },
    ],
    replaces: [
      "A folder per building",
      "Rent tracked in a spreadsheet and chased by memory",
      "Maintenance requests arriving by phone and going nowhere",
      "Owner reporting rebuilt by hand each month",
    ],
    adapts: [
      "Residential, commercial, or a book holding both",
      "Whether the agent collects rent or the owner does",
      "The fee model, and who it is charged to",
      "What an owner is allowed to see of their own property",
    ],
    suits:
      "A managing agent or owner with a portfolio, who needs one place for units, tenants and rent rather than a folder per building.",
    industries: ["Property"],
    integrations: [],
    demoUrl: null,
    documentationUrl: null,
    relatedServices: OPERATIONS_SERVICES,
  },
  {
    slug: "gym-management",
    name: "Gym and fitness centre system",
    shortName: "Gym",
    positioning: "Members, trainers, classes, attendance and subscription billing.",
    lead: "The administrative and operational side of a fitness centre: who is a member, which plan they are on, which class they are booked into, whether they attended and whether they have paid.",
    category: "Membership operations",
    published: true,
    depth: "full",
    evidence: "capture",
    screenKind: "interface",
    solves: [
      {
        title: "Renewals that do not depend on noticing",
        body: "Membership plans with their dates and payments on the member's own record, so a lapsed subscription is visible rather than discovered.",
      },
      {
        title: "Classes with a real roll",
        body: "Scheduling and attendance against the class, so a trainer knows who is coming and the centre knows what is actually used.",
      },
      {
        title: "Income against cost",
        body: "Invoicing and expenses in the same system, so a month can be read without exporting anything.",
      },
    ],
    modules: [
      { name: "Trainer and trainee records", body: "Members and the people who train them." },
      { name: "Membership plans", body: "What was bought, and when it runs out." },
      { name: "Class scheduling", body: "The timetable, and who is on it." },
      { name: "Workouts and health updates", body: "Programmes recorded against the member." },
      { name: "Attendance", body: "Who came, and to what." },
      { name: "Invoicing, finance and expenses", body: "Income and cost in one ledger." },
      { name: "Staff roles and permissions", body: null },
    ],
    replaces: [
      "Membership dates in a spreadsheet",
      "A paper sign-in sheet at the door",
      "Class lists kept by each trainer",
      "Renewals chased only when someone remembers",
    ],
    adapts: [
      "Monthly, annual, or session-based membership",
      "Whether classes are booked, dropped into, or both",
      "What a trainer may see of a member's record",
      "Which health fields the centre is willing to hold",
    ],
    suits:
      "A gym or studio taking recurring membership payments, where attendance and renewals are currently tracked on paper.",
    industries: ["Fitness"],
    integrations: [],
    demoUrl: null,
    documentationUrl: null,
    relatedServices: OPERATIONS_SERVICES,
  },
  {
    slug: "parking-management",
    name: "Vehicle parking management system",
    shortName: "Parking",
    positioning: "Zones, slots, rates, registered vehicles and parking revenue.",
    lead: "Managing a parking facility as capacity rather than as a car park: how many slots exist, how many are free right now, what each zone charges, which vehicles are registered and what the site earned.",
    category: "Facility operations",
    published: true,
    depth: "full",
    evidence: "capture",
    screenKind: "interface",
    solves: [
      {
        title: "Capacity as a live number",
        body: "Slots, zones and floors with an available count, so occupancy is read off the system rather than estimated from a barrier.",
      },
      {
        title: "Rates that vary by where and when",
        body: "Pricing set per zone rather than per site, so a covered bay and an overflow field do not have to cost the same.",
      },
      {
        title: "Revenue attributable to a zone",
        body: "Income reported against the part of the site that earned it.",
      },
    ],
    modules: [
      { name: "Zones, floors and slots", body: "The site as capacity." },
      { name: "Live available-slot count", body: "What is free, now." },
      { name: "Parking rates per zone", body: "Pricing that varies across the site." },
      { name: "Registered vehicles", body: "Tags and permits held against a vehicle." },
      { name: "Parked-vehicle and logged history", body: "What was where, and when." },
      { name: "Roles and permissions", body: null },
      { name: "Income reporting", body: "Revenue by zone and by period." },
    ],
    replaces: [
      "A barrier that counts but does not report",
      "Permit lists kept at the gate",
      "Rates written on a board",
      "Takings reconciled from a cash box",
    ],
    adapts: [
      "Hourly, daily, monthly permits, or a mix",
      "Whether staff, tenants and visitors are charged differently",
      "How vehicles are identified at the entrance",
      "Which zones a given operator can act on",
    ],
    suits:
      "A mall, hospital, campus or commercial building operating its own parking and charging for it.",
    industries: ["Facilities"],
    integrations: [],
    demoUrl: null,
    documentationUrl: null,
    relatedServices: OPERATIONS_SERVICES,
  },
  {
    slug: "customer-relationship-management",
    name: "Client, project and invoicing system",
    shortName: "Client",
    positioning: "Clients, leads, projects, tasks and invoicing in one record set.",
    lead: "The commercial side of a services business in one system. A lead becomes a client, a client becomes a project, a project becomes tasks and time, and time becomes an invoice, without the record being retyped at any step.",
    category: "Commercial operations",
    published: true,
    depth: "lean",
    evidence: "capture",
    screenKind: "interface",
    solves: [],
    modules: [
      { name: "Client records in one place", body: null },
      { name: "Leads and opportunities", body: null },
      { name: "Projects, milestones and templates", body: "A new job started from a known shape." },
      { name: "Tasks, cloned to speed repeat work", body: null },
      { name: "Time tracking across the team", body: null },
      { name: "Invoicing against the project", body: "Billing raised from the work recorded." },
    ],
    replaces: [],
    adapts: [],
    suits:
      "An agency, consultancy or contractor billing by project, currently running a CRM, a task board and an invoicing tool that do not talk to each other.",
    industries: ["Professional services"],
    integrations: [],
    demoUrl: null,
    documentationUrl: null,
    relatedServices: [
      OPERATIONS_SERVICES[1],
      {
        title: "Business Automation",
        slug: "business-automation",
        relationship:
          "Connecting it to the tools a business already runs is delivered through this service.",
      },
    ],
  },
  {
    slug: "travel-booking",
    name: "Travel and tourism booking system",
    shortName: "Travel",
    positioning:
      "Tours, spaces and availability, with the public site built from the same records.",
    lead: "A booking platform where the operator configures the product and the customer-facing site follows. Tours and spaces carry their own pricing, person types, extras, discounts and opening hours, and the page layout, menus and theme are built in the same admin rather than by a developer.",
    category: "Booking and reservations",
    published: true,
    depth: "lean",
    evidence: "capture",
    screenKind: "interface",
    solves: [],
    modules: [
      { name: "Tour and space listings", body: null },
      { name: "Pricing, sale pricing and person types", body: null },
      { name: "Extras, and discounts by party size", body: null },
      { name: "Open hours and availability rules", body: null },
      { name: "Search, including map search", body: null },
      { name: "Menu, page and template builders", body: "The public site, edited without code." },
      { name: "Role-based access control", body: null },
      { name: "Media management", body: null },
    ],
    replaces: [],
    adapts: [],
    suits:
      "A tour operator or accommodation host who wants to control availability and pricing directly, and to change the public site without a developer.",
    industries: ["Travel"],
    integrations: [],
    demoUrl: null,
    documentationUrl: null,
    relatedServices: [
      {
        title: "Website Development",
        slug: "website-development",
        relationship: "The public booking site is delivered through this service.",
      },
      OPERATIONS_SERVICES[1],
    ],
  },
  {
    slug: "learning-management",
    name: "Online learning management system",
    shortName: "Learning",
    positioning: "Courses, assignments, discussion and certification, sold from the same site.",
    lead: "A teaching platform for an institution or an individual instructor: courses are built, sold and delivered in one place, with assignments, discussion and certificates attached to the enrolment rather than handled beside it.",
    category: "Education",
    published: true,
    depth: "lean",
    evidence: "illustration",
    screenKind: "interface",
    solves: [],
    modules: [
      { name: "Course building and catalogue", body: null },
      { name: "Course detail pages", body: null },
      { name: "Wishlist and checkout", body: null },
      { name: "Progress tracking", body: null },
      { name: "Assignments and submission", body: null },
      { name: "Course discussion threads", body: null },
      { name: "Live classes and recordings", body: null },
      { name: "Certificates", body: null },
      { name: "Noticeboard and resources", body: null },
    ],
    replaces: [],
    adapts: [],
    suits:
      "A training provider, university department or individual instructor selling courses directly, rather than through a marketplace that takes a cut.",
    industries: ["Education"],
    integrations: [],
    demoUrl: null,
    documentationUrl: null,
    relatedServices: [
      {
        title: "Website Development",
        slug: "website-development",
        relationship: "The public course site is delivered through this service.",
      },
      OPERATIONS_SERVICES[1],
    ],
  },
];

export const products = allProductRecords.filter((p) => p.published);

export function productIndustries() {
  return [...new Set(products.flatMap((p) => p.industries))].sort();
}

export function findProduct(slug) {
  return products.find((p) => p.slug === slug);
}
