// ===== COUNTRY / LANGUAGE / CURRENCY SWITCHER =====
// Self-contained: owns the country+language dropdowns (header + mobile nav),
// the first-visit selection popup, applying translations, converting pricing
// to the selected currency, persisting the choice, and the enterprise
// contact-form popup (which needs the current language for its status text).
(function () {
  'use strict';

  // ---- Countries: languages offered + currency symbol ----
  const COUNTRIES = {
    LK: { name: 'Sri Lanka', flag: '🇱🇰', languages: ['en', 'si', 'ta'], currency: { code: 'LKR', symbol: 'LKR ' } },
    SA: { name: 'Saudi Arabia', flag: '🇸🇦', languages: ['en', 'ar'], currency: { code: 'SAR', symbol: 'SAR ' } },
    IN: { name: 'India', flag: '🇮🇳', languages: ['en', 'ta'], currency: { code: 'INR', symbol: '₹' } },
    EU: { name: 'European Union', flag: '🇪🇺', languages: ['en', 'es'], currency: { code: 'EUR', symbol: '€' } }
  };

  // ---- Package pricing, per country ----
  // Plain constants, in that country's OWN currency - no exchange-rate
  // conversion from a single base currency anymore. [Gold, Platinum,
  // Diamond], matching the 3 pricing cards' DOM order. Update any number
  // directly whenever it changes; nothing else needs to.
  const PACKAGE_PRICES = {
    LK: [49000, 89000, 129000],
    SA: [399, 799, 1499],
    IN: [13999, 24999, 34999],
    EU: [249, 399, 799]
  };

  // Package CONTENT (name + feature list) is the same across every country
  // for now - see the pricing.* translation keys, shared by all of them.
  // When a country needs its own feature set later, this is the variable to
  // fill in: key it the same way as PACKAGE_PRICES (country code -> array of
  // 3 packages), e.g. PACKAGE_FEATURES.SA = [['pricing.f.weeklyShoots', ...], ...],
  // then update the pricing section's rendering to read from it per country.
  // Left empty on purpose until that content actually differs.
  const PACKAGE_FEATURES = {};

  // ---- Footer social links, per country ----
  // Instagram/Facebook currently only exist for LK and SA; every other
  // country falls back to the LK ones. LinkedIn has no page yet - its href
  // stays "#" directly in welcome.html until one is created.
  const SOCIAL_LINKS = {
    LK: { instagram: 'https://www.instagram.com/cambm.lk/', facebook: 'https://web.facebook.com/profile.php?id=61590765272716#' },
    SA: { instagram: 'https://www.instagram.com/cambm.sa', facebook: 'https://web.facebook.com/profile.php?id=61590616180697#' }
  };
  const WHATSAPP_MESSAGE = 'Hi%20Cambridge%20Marketing!%20I%20found%20you%20through%20your%20website%20and%20I%27d%20like%20to%20grow%20my%20business%20with%20you.%20Can%20we%20talk%3F';
  const WHATSAPP_NUMBERS = { LK: '94766490522', default: '966557323125' };

  const LANGUAGE_NAMES = { en: 'English', ar: 'العربية', si: 'සිංහල', ta: 'தமிழ்', es: 'Español' };
  const RTL_LANGUAGES = { ar: true };

  // Cal.com's own booker UI isn't translated into Sinhala or Tamil, so those
  // fall back to English there rather than showing an unsupported code.
  const CAL_LANGUAGE_MAP = { en: 'en', es: 'es', ar: 'ar', si: 'en', ta: 'en' };

  const DEFAULT_COUNTRY = 'LK';
  const DEFAULT_LANGUAGE = 'en';
  const STORAGE_KEY = 'cambm_locale';

  // Keys whose translated value contains inline markup (<em>, <br>) and
  // must be written via innerHTML. Every other key is set via textContent.
  const HTML_KEYS = {
    'hero.title': true, 'ai.title': true, 'diff.title': true, 'comparison.title': true,
    'pricing.title': true, 'testimonials.title': true, 'cta.title': true
  };

  const TRANSLATIONS = { en: {}, ar: {}, si: {}, ta: {}, es: {} };

  TRANSLATIONS.en = {
    'nav.home': 'Home',
    'nav.systems': 'Systems', 'nav.whyCambm': 'Why CAMBM', 'nav.packages': 'Packages', 'nav.bookCall': 'Book a strategy call',
    'nav.about': 'About', 'nav.homeAriaLabel': 'Cambridge Marketing, go to homepage',
    'about.hero.eyebrow': 'About US',
    'about.hero.headlineLine1': 'We build brands.',
    'about.hero.headlineLine2': 'And the systems behind them.',
    'about.hero.sub': 'We bridge the gap between front-end attention and back-end operations. By combining strategic marketing with custom POS, ERP, and web development, we ensure your growth never outpaces your infrastructure.',
    'about.hero.ctaSecondary': 'Explore our story',
    'about.story.title': 'Our Story',
    'about.story.body': 'Cambridge Marketing was founded in 2025 as Cambridge Technology expanded its digital capabilities into a dedicated marketing and growth segment. We were created for businesses that need more than attractive content.',
    'about.tech.title': 'Built From Technology',
    'about.tech.body': 'Cambridge Technology has spent more than 11 years helping businesses succeed through software, mobile applications, cloud infrastructure, cybersecurity and digital solutions. Cambridge Marketing carries that same systems-first mindset into brand growth, connecting creativity, technology and execution into one clear path forward.',
    'about.systems.title': 'One connected system, not scattered tools.',
    'about.systems.sub': 'Cambridge Technology already runs the software behind real businesses. Cambridge Marketing plugs growth into that same system, so the attention you create on the front end and the operations that fulfil it on the back end move as one, instead of separate vendors you have to stitch together yourself.',
    'about.systems.step1Label': 'Attract', 'about.systems.step1Body': 'Brand, content and ads that bring the right people to you.',
    'about.systems.step2Label': 'Convert', 'about.systems.step2Body': 'Websites, landing pages and enquiry flows that turn interest into leads.',
    'about.systems.step3Label': 'Operate', 'about.systems.step3Body': 'POS, ERP and automation that fulfil and manage every order behind the scenes.',
    'about.systems.step4Label': 'Retain', 'about.systems.step4Body': 'Reporting and follow-ups that turn a single sale into repeat revenue.',
    'about.why.title': 'Why businesses choose Cambridge Marketing',
    'about.why.item1Title': 'One team, end to end', 'about.why.item1Body': 'Strategy, creative, websites, automation and reporting under a single partner.',
    'about.why.item2Title': 'Technology-backed marketing', 'about.why.item2Body': 'Built from a company with software, digital systems and infrastructure experience.',
    'about.why.item3Title': 'Strategy before output', 'about.why.item3Body': 'Every post, page, campaign and system supports a clear business objective.',
    'about.why.item4Title': 'Connected operations', 'about.why.item4Body': 'Marketing does not stop at attention; it supports leads, workflows, POS/ERP and customer journeys.',
    'about.why.item5Title': 'Transparent reporting', 'about.why.item5Body': 'Clear monthly insights show what is working, what needs improvement and where budget is going.',
    'about.why.item6Title': 'Global growth mindset', 'about.why.item6Body': 'Designed for businesses expanding across markets, languages and digital channels.',
    'about.process.title': 'How we work',
    'about.process.step1Title': 'Consultation', 'about.process.step1Body': 'We understand business goals, current marketing, systems, audience and growth barriers.',
    'about.process.step2Title': 'Strategy & Team Planning', 'about.process.step2Body': 'We define priorities, channels, creative direction, workflows and the right execution team.',
    'about.process.step3Title': 'Design, Build & Launch', 'about.process.step3Body': 'We create assets, campaigns, websites, automation flows and operational integrations.',
    'about.process.step4Title': 'Reporting & Improvement', 'about.process.step4Body': 'We track performance, report clearly and improve campaigns, content and systems monthly.',
    'about.values.title': 'What we stand for',
    'about.values.item1Title': 'Innovation', 'about.values.item1Body': 'We explore new technologies, creative formats and smarter systems to create stronger outcomes.',
    'about.values.item2Title': 'Reliability', 'about.values.item2Body': 'We build consistent, scalable and sustainable marketing systems clients can depend on.',
    'about.values.item3Title': 'Customer Success', 'about.values.item3Body': 'Client growth, clarity and confidence remain central to every campaign and system.',
    'about.values.item4Title': 'Integrity', 'about.values.item4Body': 'We communicate transparently, report honestly and maintain quality across every deliverable.',
    'about.values.item5Title': 'Collaboration', 'about.values.item5Body': 'We work closely with clients to understand goals, context, operations and market direction.',
    'about.global.title': 'Built local. Designed global.',
    'about.global.body': 'Cambridge Marketing is being built with a global operating mindset. Our journey begins in the Saudi and Middle East market, expands through Sri Lanka and India, and is designed to serve Europe and businesses worldwide. The goal is not to be another local marketing vendor, it is to become a trusted growth systems partner for ambitious companies across regions.',
    'about.global.node1Label': '2014+', 'about.global.node1Detail': 'Technology foundation',
    'about.global.node2Label': '2025', 'about.global.node2Detail': 'Marketing segment founded',
    'about.global.node3Label': 'Now', 'about.global.node3Detail': 'Saudi, Middle East, Sri Lanka, India',
    'about.global.node4Label': 'Next', 'about.global.node4Detail': 'Europe and worldwide',
    'about.cta.headline': 'Ready to grow your brand?',
    'hero.eyebrow': 'Marketing + Technology, Under One Roof',
    'hero.title': '<em>Beyond</em><br>Social Media.',
    'hero.services': 'Our Services',
    'hero.stat1Label': 'Projects Delivered', 'hero.stat2Label': 'Client Satisfaction', 'hero.stat3Label': 'Avg. Turnaround',
    'ai.eyebrow': 'Systems',
    'ai.title': 'Not Just Marketing.<br><em>Complete Growth Engine,</em> for modern businesses.',
    'ai.desc': 'Cambridge Marketing helps brands grow through creative strategy, social media, websites, paid ads, automation, POS, ERP, and performance reporting. Everything is built to work together, so your brand looks professional, attracts better leads, and runs smarter.',
    'ai.feature1Title': 'Brand & Creative Systems', 'ai.feature1Desc': 'Professional visuals, campaigns, content, and brand assets built with a clear strategy.',
    'ai.feature2Title': 'Social Media & Ads', 'ai.feature2Desc': 'Content planning, creative posts, reels, Meta campaigns, and lead-focused advertising.',
    'ai.feature3Title': 'Websites & Landing Pages', 'ai.feature3Desc': 'Modern websites designed for trust, speed, enquiries, and business growth.',
    'ai.feature4Title': 'POS & ERP Development', 'ai.feature4Desc': 'Custom systems for billing, inventory, restaurants, retail, reporting, and operations.',
    'ai.feature5Title': 'Automation & Lead Flow', 'ai.feature5Desc': 'WhatsApp, forms, enquiries, follow-ups, and customer journeys connected properly.',
    'ai.feature6Title': 'Reports & Growth Tracking', 'ai.feature6Desc': 'Monthly insights, campaign performance, content review, and improvement planning.',
    'diff.title': 'Most agencies stop at the post. <em>We don’t.</em>',
    'diff.item1Title': 'One team, end to end', 'diff.item1Desc': 'Brief one partner instead of juggling five. Strategy, creative and engineering under a single roof.',
    'diff.item2Title': 'Marketing meets operations', 'diff.item2Desc': 'Your ads, your website, your POS and ERP, connected, so growth doesn’t break your back office.',
    'diff.item3Title': 'Results you can read', 'diff.item3Desc': 'Clear monthly reporting. You always know what’s working and where your money is going.',
    'comparison.eyebrow': 'Cambridge Marketing vs. Traditional',
    'comparison.title': 'Hiring or traditional outsourcing?<br><em>Neither.</em>',
    'comparison.requirement': 'Requirement', 'comparison.hiringInHouse': 'Hiring In-House',
    'comparison.traditionalOutsourcing': 'Traditional Outsourcing', 'comparison.cambm': 'Cambridge Marketing',
    'comparison.strategy': 'Strategy', 'comparison.strategyInHouse': 'Expensive senior talent',
    'comparison.strategyOutsourcing': 'Limited brand ownership', 'comparison.strategyCambm': 'Dedicated growth strategist',
    'comparison.creative': 'Creative', 'comparison.creativeInHouse': 'Needs full creative team',
    'comparison.creativeOutsourcing': 'Output-based only', 'comparison.creativeCambm': 'Planned monthly creative direction',
    'comparison.management': 'Management', 'comparison.managementInHouse': 'You manage the team',
    'comparison.managementOutsourcing': 'You manage the agency', 'comparison.managementCambm': 'We manage the full workflow',
    'comparison.website': 'Website', 'comparison.websiteInHouse': 'Separate cost',
    'comparison.websiteOutsourcing': 'Separate vendor', 'comparison.websiteCambm': 'Custom website + monthly management',
    'comparison.posSoftware': 'POS Software', 'comparison.posSoftwareInHouse': 'Separate system needed',
    'comparison.posSoftwareOutsourcing': 'Not usually included', 'comparison.posSoftwareCambm': 'Custom POS Software + management',
    'comparison.erp': 'ERP', 'comparison.erpInHouse': 'Not practical for most brands',
    'comparison.erpOutsourcing': 'Not included', 'comparison.erpCambm': 'Custom ERP + POS + Website',
    'comparison.scalability': 'Scalability', 'comparison.scalabilityInHouse': 'Slow and costly',
    'comparison.scalabilityOutsourcing': 'Limited flexibility', 'comparison.scalabilityCambm': 'Built to scale with your business',
    'comparison.accountability': 'Accountability', 'comparison.accountabilityInHouse': 'Internal pressure',
    'comparison.accountabilityOutsourcing': 'Vendor dependency', 'comparison.accountabilityCambm': 'One strategic partner',
    'pricing.eyebrow': 'Pricing', 'pricing.title': 'Strategic plans designed for <em>GROWTH.</em>',
    'pricing.desc': 'Straightforward monthly packages. Upgrade anytime as your business grows.',
    'pricing.perMo': '/mo', 'pricing.recommended': 'Recommended', 'pricing.selectPlan': 'Select plan',
    'pricing.gold': 'Signature', 'pricing.platinum': 'Prestige', 'pricing.diamond': 'Elite',
    'pricing.term.minimum3Month': 'Minimum 3-month plan', 'pricing.term.annual': 'Annual plan',
    'pricing.tcApplies': 'T&C applies',
    'pricing.f.dedicatedCreativePlanner': 'Dedicated creative planner',
    'pricing.f.completeSocialMgmt': 'Complete social media management',
    'pricing.f.monthlyContentPlanning': 'Monthly content planning',
    'pricing.f.premiumBrandCreatives': 'Premium brand creatives',
    'pricing.f.customWebsite': 'Custom Website',
    'pricing.f.monthlyWebsiteMgmt': 'Monthly website management',
    'pricing.f.analyticsReport': 'Monthly analytics report', 'pricing.f.premiumSocialMgmt': 'Premium social media management',
    'pricing.f.dedicatedContentStrategist': 'Dedicated content strategist',
    'pricing.f.monthlyCampaignPlanning': 'Monthly campaign planning',
    'pricing.f.completeCreativeDirection': 'Complete creative direction',
    'pricing.f.customPosWebsite': 'Custom POS Software + Website',
    'pricing.f.monthlyPosWebsiteMgmt': 'Monthly POS Software & website management',
    'pricing.f.seniorContentStrategist': 'Senior content strategist',
    'pricing.f.fullPremiumSocial': 'Full premium social media management',
    'pricing.f.completeBrandCampaignMgmt': 'Complete brand & campaign management',
    'pricing.f.customErpPosWebsite': 'Custom ERP + POS Software + Website',
    'pricing.f.monthlyErpPosWebsiteMgmt': 'Monthly ERP, POS Software & website management',
    'pricing.f.advancedGrowthReport': 'Advanced monthly growth report',
    'pricing.enterpriseTitle': 'Enterprise', 'pricing.enterpriseDesc': 'Custom scope, a dedicated team, and full IT/ERP integration for larger operations.',
    'pricing.contactUs': 'Contact us',
    'testimonials.eyebrow': 'Don’t just take it from us', 'testimonials.title': 'Creative wins, <em>told by our customers</em>',
    'testimonials.quote1': '“Our socials finally look the part, and the leads are actually coming through. Cambridge handles the shoots, the ads and the reporting, so we can focus on the food.”', 'testimonials.role1': 'Restaurant',
    'testimonials.quote2': '“They built our website and POS and run our campaigns, all from one team. Everything just connects, and we finally have one partner instead of five.”', 'testimonials.role2': 'Fine Jewelry',
    'testimonials.quote3': '“The monthly reporting is clear and honest. We always know what’s working and where the budget is going. Sales are up and so is our brand.”', 'testimonials.role3': 'Footwear',
    'cta.title': 'Ready to grow your business,<br><em>the right way?</em>',
    'cta.desc': 'One team for your marketing, your brand, and the technology that runs your business. Get in touch and let’s talk about where you want to go.',
    'footer.rights': 'All rights reserved.',
    'locale.popupTitle': 'Choose your country & language', 'locale.popupDesc': 'We’ll tailor pricing and language to your region.',
    'locale.countryLabel': 'Country', 'locale.languageLabel': 'Language', 'locale.confirm': 'Continue',
    'locale.changeNote': 'You can change this anytime from the menu.',
    'contact.title': 'Contact Enterprise Sales', 'contact.desc': 'Tell us about your business and we’ll get back to you shortly.',
    'contact.nameLabel': 'Full name', 'contact.emailLabel': 'Email', 'contact.companyLabel': 'Company',
    'contact.phoneLabel': 'Phone (optional)', 'contact.messageLabel': 'Message',
    'contact.send': 'Send message', 'contact.sending': 'Sending...', 'contact.success': 'Thanks! We’ll be in touch soon.',
    'contact.error': 'Something went wrong. Please try again or email us directly.',
    'popup.planDesc': 'Tell us a bit about your business and we’ll follow up with next steps.', 'popup.planLabel': 'Plan'
  };

  TRANSLATIONS.es = {
    'nav.home': 'Inicio',
    'nav.systems': 'Sistemas', 'nav.whyCambm': 'Por qué CAMBM', 'nav.packages': 'Paquetes', 'nav.bookCall': 'Reservar una llamada',
    'nav.about': 'Nosotros', 'nav.homeAriaLabel': 'Cambridge Marketing, ir a la página de inicio',
    'about.hero.eyebrow': 'About US',
    'about.hero.headlineLine1': 'Construimos marcas.',
    'about.hero.headlineLine2': 'Y los sistemas que las respaldan.',
    'about.hero.sub': 'Cerramos la brecha entre la atención del cliente y las operaciones internas. Al combinar marketing estratégico con desarrollo web, ERP y POS personalizados, nos aseguramos de que tu crecimiento nunca supere tu infraestructura.',
    'about.hero.ctaSecondary': 'Explora nuestra historia',
    'about.story.title': 'Nuestra historia',
    'about.story.body': 'Cambridge Marketing se fundó en 2025, cuando Cambridge Technology amplió sus capacidades digitales hacia un segmento dedicado de marketing y crecimiento. Fuimos creados para empresas que necesitan más que contenido atractivo.',
    'about.tech.title': 'Construido desde la tecnología',
    'about.tech.body': 'Cambridge Technology ha dedicado más de 11 años a ayudar a las empresas a tener éxito mediante software, aplicaciones móviles, infraestructura en la nube, ciberseguridad y soluciones digitales. Cambridge Marketing lleva esa misma mentalidad centrada en sistemas al crecimiento de marca, conectando creatividad, tecnología y ejecución en un camino claro.',
    'about.systems.title': 'Un sistema conectado, no herramientas dispersas.',
    'about.systems.sub': 'Cambridge Technology ya gestiona el software que hay detrás de negocios reales. Cambridge Marketing conecta el crecimiento a ese mismo sistema, para que la atención que generas al inicio y las operaciones que la hacen realidad al final funcionen como una sola cosa, en lugar de proveedores separados que tú mismo tienes que unir.',
    'about.systems.step1Label': 'Atraer', 'about.systems.step1Body': 'Marca, contenido y anuncios que atraen a las personas adecuadas.',
    'about.systems.step2Label': 'Convertir', 'about.systems.step2Body': 'Sitios web, landing pages y flujos de consulta que convierten el interés en clientes potenciales.',
    'about.systems.step3Label': 'Operar', 'about.systems.step3Body': 'POS, ERP y automatización que cumplen y gestionan cada pedido entre bastidores.',
    'about.systems.step4Label': 'Retener', 'about.systems.step4Body': 'Informes y seguimientos que convierten una sola venta en ingresos recurrentes.',
    'about.why.title': 'Por qué las empresas eligen Cambridge Marketing',
    'about.why.item1Title': 'Un solo equipo, de principio a fin', 'about.why.item1Body': 'Estrategia, creatividad, sitios web, automatización e informes con un único socio.',
    'about.why.item2Title': 'Marketing respaldado por la tecnología', 'about.why.item2Body': 'Construido desde una empresa con experiencia en software, sistemas digitales e infraestructura.',
    'about.why.item3Title': 'Estrategia antes que producción', 'about.why.item3Body': 'Cada publicación, página, campaña y sistema respalda un objetivo de negocio claro.',
    'about.why.item4Title': 'Operaciones conectadas', 'about.why.item4Body': 'El marketing no se detiene en la atención; respalda clientes potenciales, flujos de trabajo, POS/ERP y recorridos de clientes.',
    'about.why.item5Title': 'Informes transparentes', 'about.why.item5Body': 'Información mensual clara que muestra qué funciona, qué mejorar y a dónde va el presupuesto.',
    'about.why.item6Title': 'Mentalidad de crecimiento global', 'about.why.item6Body': 'Diseñado para empresas que se expanden entre mercados, idiomas y canales digitales.',
    'about.process.title': 'Cómo trabajamos',
    'about.process.step1Title': 'Consulta', 'about.process.step1Body': 'Entendemos los objetivos del negocio, el marketing actual, los sistemas, la audiencia y las barreras de crecimiento.',
    'about.process.step2Title': 'Estrategia y planificación del equipo', 'about.process.step2Body': 'Definimos prioridades, canales, dirección creativa, flujos de trabajo y el equipo de ejecución adecuado.',
    'about.process.step3Title': 'Diseño, construcción y lanzamiento', 'about.process.step3Body': 'Creamos activos, campañas, sitios web, flujos de automatización e integraciones operativas.',
    'about.process.step4Title': 'Informes y mejora', 'about.process.step4Body': 'Medimos el rendimiento, informamos con claridad y mejoramos campañas, contenido y sistemas cada mes.',
    'about.values.title': 'Lo que defendemos',
    'about.values.item1Title': 'Innovación', 'about.values.item1Body': 'Exploramos nuevas tecnologías, formatos creativos y sistemas más inteligentes para lograr mejores resultados.',
    'about.values.item2Title': 'Fiabilidad', 'about.values.item2Body': 'Construimos sistemas de marketing consistentes, escalables y sostenibles en los que los clientes pueden confiar.',
    'about.values.item3Title': 'Éxito del cliente', 'about.values.item3Body': 'El crecimiento, la claridad y la confianza del cliente son el centro de cada campaña y sistema.',
    'about.values.item4Title': 'Integridad', 'about.values.item4Body': 'Comunicamos con transparencia, informamos con honestidad y mantenemos la calidad en cada entrega.',
    'about.values.item5Title': 'Colaboración', 'about.values.item5Body': 'Trabajamos de cerca con los clientes para entender objetivos, contexto, operaciones y dirección del mercado.',
    'about.global.title': 'Construido local. Diseñado global.',
    'about.global.body': 'Cambridge Marketing se construye con una mentalidad operativa global. Nuestro camino comienza en el mercado de Arabia Saudita y Medio Oriente, se expande por Sri Lanka e India, y está diseñado para servir a Europa y a empresas de todo el mundo. El objetivo no es ser otro proveedor de marketing local, sino convertirse en un socio de confianza en sistemas de crecimiento para empresas ambiciosas de distintas regiones.',
    'about.global.node1Label': '2014+', 'about.global.node1Detail': 'Base tecnológica',
    'about.global.node2Label': '2025', 'about.global.node2Detail': 'Segmento de marketing fundado',
    'about.global.node3Label': 'Ahora', 'about.global.node3Detail': 'Arabia Saudita, Medio Oriente, Sri Lanka, India',
    'about.global.node4Label': 'Próximo', 'about.global.node4Detail': 'Europa y todo el mundo',
    'about.cta.headline': '¿Listo para hacer crecer tu marca?',
    'hero.eyebrow': 'Marketing + Tecnología, bajo un mismo techo',
    'hero.title': '<em>Más allá de</em><br>las redes sociales.',
    'hero.services': 'Nuestros servicios',
    'hero.stat1Label': 'Proyectos entregados', 'hero.stat2Label': 'Satisfacción del cliente', 'hero.stat3Label': 'Tiempo de entrega promedio',
    'ai.eyebrow': 'Sistemas',
    'ai.title': 'No solo marketing.<br><em>Un motor de crecimiento completo,</em> para empresas modernas.',
    'ai.desc': 'Cambridge Marketing ayuda a las marcas a crecer mediante estrategia creativa, redes sociales, sitios web, anuncios pagados, automatización, POS, ERP e informes de rendimiento. Todo está diseñado para funcionar en conjunto, para que tu marca se vea profesional, atraiga mejores clientes potenciales y funcione de forma más inteligente.',
    'ai.feature1Title': 'Sistemas de marca y creatividad', 'ai.feature1Desc': 'Visuales profesionales, campañas, contenido y activos de marca construidos con una estrategia clara.',
    'ai.feature2Title': 'Redes sociales y anuncios', 'ai.feature2Desc': 'Planificación de contenido, publicaciones creativas, reels, campañas de Meta y publicidad enfocada en clientes potenciales.',
    'ai.feature3Title': 'Sitios web y landing pages', 'ai.feature3Desc': 'Sitios web modernos diseñados para generar confianza, velocidad, consultas y crecimiento del negocio.',
    'ai.feature4Title': 'Desarrollo de POS y ERP', 'ai.feature4Desc': 'Sistemas personalizados para facturación, inventario, restaurantes, retail, informes y operaciones.',
    'ai.feature5Title': 'Automatización y flujo de clientes potenciales', 'ai.feature5Desc': 'WhatsApp, formularios, consultas, seguimientos y recorridos de clientes correctamente conectados.',
    'ai.feature6Title': 'Informes y seguimiento del crecimiento', 'ai.feature6Desc': 'Información mensual, rendimiento de campañas, revisión de contenido y planificación de mejoras.',
    'diff.title': 'La mayoría de las agencias se detienen en la publicación. <em>Nosotros no.</em>',
    'diff.item1Title': 'Un solo equipo, de principio a fin', 'diff.item1Desc': 'Coordina con un solo socio en lugar de con cinco. Estrategia, creatividad e ingeniería bajo un mismo techo.',
    'diff.item2Title': 'El marketing se une a las operaciones', 'diff.item2Desc': 'Tus anuncios, tu sitio web, tu POS y ERP, todo conectado, para que el crecimiento no rompa tu operación interna.',
    'diff.item3Title': 'Resultados que puedes leer', 'diff.item3Desc': 'Informes mensuales claros. Siempre sabes qué está funcionando y a dónde va tu dinero.',
    'comparison.eyebrow': 'Cambridge Marketing vs. lo tradicional',
    'comparison.title': '¿Contratar internamente o subcontratar de forma tradicional?<br><em>Ninguna de las dos.</em>',
    'comparison.requirement': 'Requisito', 'comparison.hiringInHouse': 'Contratación interna',
    'comparison.traditionalOutsourcing': 'Subcontratación tradicional', 'comparison.cambm': 'Cambridge Marketing',
    'comparison.strategy': 'Estrategia', 'comparison.strategyInHouse': 'Talento senior costoso',
    'comparison.strategyOutsourcing': 'Propiedad limitada de la marca', 'comparison.strategyCambm': 'Estratega de crecimiento dedicado',
    'comparison.creative': 'Creatividad', 'comparison.creativeInHouse': 'Necesita un equipo creativo completo',
    'comparison.creativeOutsourcing': 'Solo basado en entregables', 'comparison.creativeCambm': 'Dirección creativa mensual planificada',
    'comparison.management': 'Gestión', 'comparison.managementInHouse': 'Tú gestionas el equipo',
    'comparison.managementOutsourcing': 'Tú gestionas la agencia', 'comparison.managementCambm': 'Nosotros gestionamos todo el flujo de trabajo',
    'comparison.website': 'Sitio web', 'comparison.websiteInHouse': 'Costo aparte',
    'comparison.websiteOutsourcing': 'Proveedor aparte', 'comparison.websiteCambm': 'Sitio web personalizado + gestión mensual',
    'comparison.posSoftware': 'Software POS', 'comparison.posSoftwareInHouse': 'Requiere sistema aparte',
    'comparison.posSoftwareOutsourcing': 'No suele estar incluido', 'comparison.posSoftwareCambm': 'Software POS personalizado + gestión',
    'comparison.erp': 'ERP', 'comparison.erpInHouse': 'No es práctico para la mayoría de las marcas',
    'comparison.erpOutsourcing': 'No incluido', 'comparison.erpCambm': 'ERP + POS + sitio web personalizados',
    'comparison.scalability': 'Escalabilidad', 'comparison.scalabilityInHouse': 'Lento y costoso',
    'comparison.scalabilityOutsourcing': 'Flexibilidad limitada', 'comparison.scalabilityCambm': 'Diseñado para escalar con tu negocio',
    'comparison.accountability': 'Responsabilidad', 'comparison.accountabilityInHouse': 'Presión interna',
    'comparison.accountabilityOutsourcing': 'Dependencia del proveedor', 'comparison.accountabilityCambm': 'Un socio estratégico',
    'pricing.eyebrow': 'Precios', 'pricing.title': 'Planes estratégicos diseñados para el <em>CRECIMIENTO.</em>',
    'pricing.desc': 'Paquetes mensuales sencillos. Mejora en cualquier momento a medida que tu negocio crece.',
    'pricing.perMo': '/mes', 'pricing.recommended': 'Recomendado', 'pricing.selectPlan': 'Elegir plan',
    'pricing.gold': 'Insignia', 'pricing.platinum': 'Prestigio', 'pricing.diamond': 'Élite',
    'pricing.term.minimum3Month': 'Plan mínimo de 3 meses', 'pricing.term.annual': 'Plan anual',
    'pricing.tcApplies': 'Aplican términos y condiciones',
    'pricing.f.dedicatedCreativePlanner': 'Planificador creativo dedicado',
    'pricing.f.completeSocialMgmt': 'Gestión completa de redes sociales',
    'pricing.f.monthlyContentPlanning': 'Planificación mensual de contenido',
    'pricing.f.premiumBrandCreatives': 'Piezas creativas premium de marca',
    'pricing.f.customWebsite': 'Sitio web personalizado',
    'pricing.f.monthlyWebsiteMgmt': 'Gestión mensual del sitio web',
    'pricing.f.analyticsReport': 'Informe mensual de analítica', 'pricing.f.premiumSocialMgmt': 'Gestión premium de redes sociales',
    'pricing.f.dedicatedContentStrategist': 'Estratega de contenido dedicado',
    'pricing.f.monthlyCampaignPlanning': 'Planificación mensual de campañas',
    'pricing.f.completeCreativeDirection': 'Dirección creativa completa',
    'pricing.f.customPosWebsite': 'Software de POS personalizado + sitio web',
    'pricing.f.monthlyPosWebsiteMgmt': 'Gestión mensual del software POS y el sitio web',
    'pricing.f.seniorContentStrategist': 'Estratega de contenido senior',
    'pricing.f.fullPremiumSocial': 'Gestión premium completa de redes sociales',
    'pricing.f.completeBrandCampaignMgmt': 'Gestión completa de marca y campañas',
    'pricing.f.customErpPosWebsite': 'Software ERP + POS personalizado + sitio web',
    'pricing.f.monthlyErpPosWebsiteMgmt': 'Gestión mensual de ERP, software POS y sitio web',
    'pricing.f.advancedGrowthReport': 'Informe de crecimiento mensual avanzado',
    'pricing.enterpriseTitle': 'Empresarial', 'pricing.enterpriseDesc': 'Alcance personalizado, un equipo dedicado e integración completa de TI/ERP para operaciones más grandes.',
    'pricing.contactUs': 'Contáctanos',
    'testimonials.eyebrow': 'No solo confíes en nuestra palabra', 'testimonials.title': 'Éxitos creativos, <em>contados por nuestros clientes</em>',
    'testimonials.quote1': '“Nuestras redes sociales por fin se ven a la altura, y los clientes potenciales realmente están llegando. Cambridge se encarga de las sesiones, los anuncios y los informes, para que podamos concentrarnos en la comida.”', 'testimonials.role1': 'Restaurante',
    'testimonials.quote2': '“Construyeron nuestro sitio web y POS y gestionan nuestras campañas, todo desde un solo equipo. Todo está conectado, y por fin tenemos un solo socio en lugar de cinco.”', 'testimonials.role2': 'Joyería fina',
    'testimonials.quote3': '“Los informes mensuales son claros y honestos. Siempre sabemos qué está funcionando y a dónde va el presupuesto. Las ventas han aumentado, y también nuestra marca.”', 'testimonials.role3': 'Calzado',
    'cta.title': '¿Listo para hacer crecer tu negocio,<br><em>de la forma correcta?</em>',
    'cta.desc': 'Un solo equipo para tu marketing, tu marca y la tecnología que impulsa tu negocio. Ponte en contacto y hablemos de a dónde quieres llegar.',
    'footer.rights': 'Todos los derechos reservados.',
    'locale.popupTitle': 'Elige tu país e idioma', 'locale.popupDesc': 'Personalizaremos el precio y el idioma según tu región.',
    'locale.countryLabel': 'País', 'locale.languageLabel': 'Idioma', 'locale.confirm': 'Continuar',
    'locale.changeNote': 'Puedes cambiar esto en cualquier momento desde el menú.',
    'contact.title': 'Contactar a Ventas Empresariales', 'contact.desc': 'Cuéntanos sobre tu negocio y nos pondremos en contacto pronto.',
    'contact.nameLabel': 'Nombre completo', 'contact.emailLabel': 'Correo electrónico', 'contact.companyLabel': 'Empresa',
    'contact.phoneLabel': 'Teléfono (opcional)', 'contact.messageLabel': 'Mensaje',
    'contact.send': 'Enviar mensaje', 'contact.sending': 'Enviando...', 'contact.success': '¡Gracias! Nos pondremos en contacto pronto.',
    'contact.error': 'Algo salió mal. Inténtalo de nuevo o escríbenos directamente.',
    'popup.planDesc': 'Cuéntanos sobre tu negocio y te contactaremos con los próximos pasos.', 'popup.planLabel': 'Plan'
  };

  TRANSLATIONS.ar = {
    'nav.home': 'الرئيسية',
    'nav.systems': 'الأنظمة', 'nav.whyCambm': 'لماذا كامبريدج', 'nav.packages': 'الباقات', 'nav.bookCall': 'احجز مكالمة استراتيجية',
    'nav.about': 'من نحن', 'nav.homeAriaLabel': 'Cambridge Marketing, الانتقال إلى الصفحة الرئيسية',
    'about.hero.eyebrow': 'About US',
    'about.hero.headlineLine1': 'نحن نبني العلامات التجارية.',
    'about.hero.headlineLine2': 'والأنظمة التي تقف خلفها.',
    'about.hero.sub': 'نحن نسد الفجوة بين جذب الانتباه والعمليات الداخلية. من خلال الجمع بين التسويق الاستراتيجي وتطوير مواقع الويب وأنظمة نقاط البيع وتخطيط موارد المؤسسات المخصصة، نضمن ألا يتجاوز نموك قدرة بنيتك التحتية.',
    'about.hero.ctaSecondary': 'استكشف قصتنا',
    'about.story.title': 'قصتنا',
    'about.story.body': 'تأسست Cambridge Marketing في عام 2025 عندما وسّعت Cambridge Technology قدراتها الرقمية لتصبح قطاعًا مخصصًا للتسويق والنمو. أُنشئنا من أجل الشركات التي تحتاج إلى أكثر من مجرد محتوى جذّاب.',
    'about.tech.title': 'مبني على التقنية',
    'about.tech.body': 'أمضت Cambridge Technology أكثر من 11 عامًا في مساعدة الشركات على النجاح عبر البرمجيات وتطبيقات الهاتف والبنية السحابية والأمن السيبراني والحلول الرقمية. وتحمل Cambridge Marketing العقلية نفسها القائمة على الأنظمة إلى نمو العلامة التجارية, رابطةً الإبداع والتقنية والتنفيذ في مسار واحد واضح.',
    'about.systems.title': 'نظام واحد متصل، لا أدوات متفرقة.',
    'about.systems.sub': 'تدير Cambridge Technology بالفعل البرمجيات التي تقف خلف أعمال حقيقية. وتوصل Cambridge Marketing النمو بهذا النظام نفسه، بحيث يتحرك الاهتمام الذي تصنعه في الواجهة والعمليات التي تنفّذه في الخلفية ككيان واحد، بدلاً من موردين منفصلين عليك أنت جمعهم معاً.',
    'about.systems.step1Label': 'الجذب', 'about.systems.step1Body': 'علامة تجارية ومحتوى وإعلانات تجذب الأشخاص المناسبين إليك.',
    'about.systems.step2Label': 'التحويل', 'about.systems.step2Body': 'مواقع إلكترونية وصفحات هبوط ومسارات استفسار تحوّل الاهتمام إلى عملاء محتملين.',
    'about.systems.step3Label': 'التشغيل', 'about.systems.step3Body': 'أنظمة POS و ERP وأتمتة تنفّذ كل طلب وتديره خلف الكواليس.',
    'about.systems.step4Label': 'الاحتفاظ', 'about.systems.step4Body': 'تقارير ومتابعات تحوّل عملية بيع واحدة إلى إيرادات متكررة.',
    'about.why.title': 'لماذا تختار الشركات Cambridge Marketing',
    'about.why.item1Title': 'فريق واحد من البداية إلى النهاية', 'about.why.item1Body': 'الاستراتيجية والإبداع والمواقع والأتمتة والتقارير مع شريك واحد.',
    'about.why.item2Title': 'تسويق مدعوم بالتقنية', 'about.why.item2Body': 'مبني من شركة تملك خبرة في البرمجيات والأنظمة الرقمية والبنية التحتية.',
    'about.why.item3Title': 'الاستراتيجية قبل التنفيذ', 'about.why.item3Body': 'كل منشور وصفحة وحملة ونظام يدعم هدفًا تجاريًا واضحًا.',
    'about.why.item4Title': 'عمليات مترابطة', 'about.why.item4Body': 'لا يتوقف التسويق عند جذب الانتباه؛ بل يدعم العملاء المحتملين وسير العمل وأنظمة POS/ERP ورحلات العملاء.',
    'about.why.item5Title': 'تقارير شفافة', 'about.why.item5Body': 'رؤى شهرية واضحة تُظهر ما ينجح وما يحتاج إلى تحسين وأين تُصرف الميزانية.',
    'about.why.item6Title': 'عقلية نمو عالمية', 'about.why.item6Body': 'مصمم للشركات التي تتوسع عبر الأسواق واللغات والقنوات الرقمية.',
    'about.process.title': 'كيف نعمل',
    'about.process.step1Title': 'الاستشارة', 'about.process.step1Body': 'نفهم أهداف العمل والتسويق الحالي والأنظمة والجمهور وعوائق النمو.',
    'about.process.step2Title': 'الاستراتيجية وتخطيط الفريق', 'about.process.step2Body': 'نحدد الأولويات والقنوات والتوجيه الإبداعي وسير العمل وفريق التنفيذ المناسب.',
    'about.process.step3Title': 'التصميم والبناء والإطلاق', 'about.process.step3Body': 'ننشئ الأصول والحملات والمواقع وتدفقات الأتمتة والتكاملات التشغيلية.',
    'about.process.step4Title': 'التقارير والتحسين', 'about.process.step4Body': 'نتتبع الأداء ونقدّم تقارير واضحة ونحسّن الحملات والمحتوى والأنظمة شهريًا.',
    'about.values.title': 'ما نؤمن به',
    'about.values.item1Title': 'الابتكار', 'about.values.item1Body': 'نستكشف تقنيات جديدة وصيغًا إبداعية وأنظمة أذكى لتحقيق نتائج أقوى.',
    'about.values.item2Title': 'الموثوقية', 'about.values.item2Body': 'نبني أنظمة تسويق متسقة وقابلة للتوسع ومستدامة يمكن للعملاء الاعتماد عليها.',
    'about.values.item3Title': 'نجاح العميل', 'about.values.item3Body': 'يبقى نمو العميل ووضوحه وثقته في صميم كل حملة ونظام.',
    'about.values.item4Title': 'النزاهة', 'about.values.item4Body': 'نتواصل بشفافية ونقدّم تقارير صادقة ونحافظ على الجودة في كل ما نقدمه.',
    'about.values.item5Title': 'التعاون', 'about.values.item5Body': 'نعمل عن قرب مع العملاء لفهم الأهداف والسياق والعمليات واتجاه السوق.',
    'about.global.title': 'مبني محليًا. مصمم عالميًا.',
    'about.global.body': 'تُبنى Cambridge Marketing بعقلية تشغيل عالمية. تبدأ رحلتنا في سوق السعودية والشرق الأوسط، وتتوسع عبر سريلانكا والهند، وهي مصممة لخدمة أوروبا والشركات حول العالم. الهدف ليس أن نكون مجرد مورّد تسويق محلي آخر, بل أن نصبح شريك أنظمة نمو موثوقًا للشركات الطموحة عبر المناطق.',
    'about.global.node1Label': '2014+', 'about.global.node1Detail': 'أساس تقني',
    'about.global.node2Label': '2025', 'about.global.node2Detail': 'تأسيس قطاع التسويق',
    'about.global.node3Label': 'الآن', 'about.global.node3Detail': 'السعودية، الشرق الأوسط، سريلانكا، الهند',
    'about.global.node4Label': 'التالي', 'about.global.node4Detail': 'أوروبا والعالم',
    'about.cta.headline': 'مستعد لتنمية علامتك التجارية؟',
    'hero.eyebrow': 'التسويق + التقنية، تحت سقف واحد',
    'hero.title': '<em>ما بعد</em><br>وسائل التواصل الاجتماعي.',
    'hero.services': 'خدماتنا',
    'hero.stat1Label': 'مشروعًا تم تنفيذه', 'hero.stat2Label': 'رضا العملاء', 'hero.stat3Label': 'متوسط وقت التنفيذ',
    'ai.eyebrow': 'الأنظمة',
    'ai.title': 'التسويق ليس كل شيء.<br><em>محرك نمو متكامل،</em> للأعمال الحديثة.',
    'ai.desc': 'تساعد كامبريدج للتسويق العلامات التجارية على النمو من خلال الاستراتيجية الإبداعية، ووسائل التواصل الاجتماعي، والمواقع الإلكترونية، والإعلانات المدفوعة، والأتمتة، ونقاط البيع، وتخطيط موارد المؤسسات، وتقارير الأداء. كل ذلك مصمم للعمل معًا، ليبدو مظهر علامتك التجارية احترافيًا، ويجذب عملاء محتملين أفضل، ويعمل بذكاء أكبر.',
    'ai.feature1Title': 'أنظمة العلامة التجارية والإبداع', 'ai.feature1Desc': 'تصاميم احترافية، وحملات، ومحتوى، وأصول للعلامة التجارية مبنية على استراتيجية واضحة.',
    'ai.feature2Title': 'وسائل التواصل الاجتماعي والإعلانات', 'ai.feature2Desc': 'تخطيط المحتوى، والمنشورات الإبداعية، والريلز، وحملات ميتا، والإعلانات الموجهة لجذب العملاء المحتملين.',
    'ai.feature3Title': 'المواقع الإلكترونية وصفحات الهبوط', 'ai.feature3Desc': 'مواقع إلكترونية حديثة مصممة لبناء الثقة، والسرعة، والاستفسارات، ونمو الأعمال.',
    'ai.feature4Title': 'تطوير أنظمة نقاط البيع وتخطيط الموارد', 'ai.feature4Desc': 'أنظمة مخصصة للفوترة، والمخزون، والمطاعم، والتجزئة، والتقارير، والعمليات.',
    'ai.feature5Title': 'الأتمتة وتدفق العملاء المحتملين', 'ai.feature5Desc': 'واتساب، والنماذج، والاستفسارات، والمتابعات، ورحلات العملاء مرتبطة بشكل صحيح.',
    'ai.feature6Title': 'التقارير وتتبع النمو', 'ai.feature6Desc': 'رؤى شهرية، وأداء الحملات، ومراجعة المحتوى، وخطط التحسين.',
    'diff.title': 'معظم الوكالات تتوقف عند المنشور. <em>نحن لا نفعل.</em>',
    'diff.item1Title': 'فريق واحد، من البداية للنهاية', 'diff.item1Desc': 'تواصل مع شريك واحد بدلًا من التنسيق مع خمسة. الاستراتيجية والإبداع والهندسة تحت سقف واحد.',
    'diff.item2Title': 'التسويق يلتقي بالعمليات', 'diff.item2Desc': 'إعلاناتك، موقعك، نقاط البيع وتخطيط الموارد لديك، كلها مترابطة، حتى لا يعطّل النمو عملياتك الداخلية.',
    'diff.item3Title': 'نتائج يمكنك قراءتها', 'diff.item3Desc': 'تقارير شهرية واضحة. تعرف دائمًا ما الذي ينجح وأين تذهب أموالك.',
    'comparison.eyebrow': 'كامبريدج للتسويق مقابل الطريقة التقليدية',
    'comparison.title': 'التوظيف الداخلي أم الاستعانة بمصادر خارجية تقليدية؟<br><em>لا هذا ولا ذاك.</em>',
    'comparison.requirement': 'المتطلب', 'comparison.hiringInHouse': 'التوظيف الداخلي',
    'comparison.traditionalOutsourcing': 'الاستعانة بمصادر خارجية تقليدية', 'comparison.cambm': 'كامبريدج للتسويق',
    'comparison.strategy': 'الاستراتيجية', 'comparison.strategyInHouse': 'مواهب كبيرة مكلفة',
    'comparison.strategyOutsourcing': 'ملكية محدودة للعلامة التجارية', 'comparison.strategyCambm': 'استراتيجي نمو مخصص',
    'comparison.creative': 'الإبداع', 'comparison.creativeInHouse': 'يتطلب فريقًا إبداعيًا كاملاً',
    'comparison.creativeOutsourcing': 'مبني على المخرجات فقط', 'comparison.creativeCambm': 'توجيه إبداعي شهري مخطط له',
    'comparison.management': 'الإدارة', 'comparison.managementInHouse': 'أنت تدير الفريق',
    'comparison.managementOutsourcing': 'أنت تدير الوكالة', 'comparison.managementCambm': 'نحن ندير سير العمل بالكامل',
    'comparison.website': 'الموقع الإلكتروني', 'comparison.websiteInHouse': 'تكلفة منفصلة',
    'comparison.websiteOutsourcing': 'مزود منفصل', 'comparison.websiteCambm': 'موقع إلكتروني مخصص + إدارة شهرية',
    'comparison.posSoftware': 'نظام نقاط البيع', 'comparison.posSoftwareInHouse': 'يحتاج نظامًا منفصلاً',
    'comparison.posSoftwareOutsourcing': 'غير مشمول عادةً', 'comparison.posSoftwareCambm': 'نظام نقاط بيع مخصص + إدارة',
    'comparison.erp': 'تخطيط موارد المؤسسات', 'comparison.erpInHouse': 'غير عملي لمعظم العلامات التجارية',
    'comparison.erpOutsourcing': 'غير مشمول', 'comparison.erpCambm': 'نظام تخطيط موارد + نقاط بيع + موقع إلكتروني مخصص',
    'comparison.scalability': 'قابلية التوسع', 'comparison.scalabilityInHouse': 'بطيء ومكلف',
    'comparison.scalabilityOutsourcing': 'مرونة محدودة', 'comparison.scalabilityCambm': 'مصمم للتوسع مع نمو أعمالك',
    'comparison.accountability': 'المساءلة', 'comparison.accountabilityInHouse': 'ضغط داخلي',
    'comparison.accountabilityOutsourcing': 'اعتماد على المزود', 'comparison.accountabilityCambm': 'شريك استراتيجي واحد',
    'pricing.eyebrow': 'الأسعار', 'pricing.title': 'خطط استراتيجية مصممة من أجل <em>النمو.</em>',
    'pricing.desc': 'باقات شهرية واضحة. قم بالترقية في أي وقت مع نمو عملك.',
    'pricing.perMo': '/شهريًا', 'pricing.recommended': 'الأكثر طلبًا', 'pricing.selectPlan': 'اختر الباقة',
    'pricing.gold': 'المتميزة', 'pricing.platinum': 'المرموقة', 'pricing.diamond': 'النخبة',
    'pricing.term.minimum3Month': 'الحد الأدنى 3 أشهر', 'pricing.term.annual': 'خطة سنوية',
    'pricing.tcApplies': 'تطبق الشروط والأحكام',
    'pricing.f.dedicatedCreativePlanner': 'مخطط إبداعي مخصص',
    'pricing.f.completeSocialMgmt': 'إدارة كاملة لوسائل التواصل الاجتماعي',
    'pricing.f.monthlyContentPlanning': 'تخطيط شهري للمحتوى',
    'pricing.f.premiumBrandCreatives': 'تصاميم إبداعية مميزة للعلامة التجارية',
    'pricing.f.customWebsite': 'موقع إلكتروني مخصص',
    'pricing.f.monthlyWebsiteMgmt': 'إدارة شهرية للموقع الإلكتروني',
    'pricing.f.analyticsReport': 'تقرير تحليلات شهري', 'pricing.f.premiumSocialMgmt': 'إدارة متقدمة لوسائل التواصل الاجتماعي',
    'pricing.f.dedicatedContentStrategist': 'استراتيجي محتوى مخصص',
    'pricing.f.monthlyCampaignPlanning': 'تخطيط شهري للحملات',
    'pricing.f.completeCreativeDirection': 'توجيه إبداعي كامل',
    'pricing.f.customPosWebsite': 'نظام نقاط بيع مخصص + موقع إلكتروني',
    'pricing.f.monthlyPosWebsiteMgmt': 'إدارة شهرية لنظام نقاط البيع والموقع الإلكتروني',
    'pricing.f.seniorContentStrategist': 'استراتيجي محتوى أول',
    'pricing.f.fullPremiumSocial': 'إدارة كاملة ومتقدمة لوسائل التواصل الاجتماعي',
    'pricing.f.completeBrandCampaignMgmt': 'إدارة كاملة للعلامة التجارية والحملات',
    'pricing.f.customErpPosWebsite': 'نظام تخطيط موارد + نقاط بيع مخصص + موقع إلكتروني',
    'pricing.f.monthlyErpPosWebsiteMgmt': 'إدارة شهرية لتخطيط الموارد ونظام نقاط البيع والموقع الإلكتروني',
    'pricing.f.advancedGrowthReport': 'تقرير نمو شهري متقدم',
    'pricing.enterpriseTitle': 'المؤسسات الكبرى', 'pricing.enterpriseDesc': 'نطاق مخصص، فريق مخصص، ودمج كامل لأنظمة تقنية المعلومات وتخطيط الموارد للعمليات الكبيرة.',
    'pricing.contactUs': 'تواصل معنا',
    'testimonials.eyebrow': 'لا تكتفِ بكلامنا فقط', 'testimonials.title': 'انتصارات إبداعية، <em>يرويها عملاؤنا</em>',
    'testimonials.quote1': 'أصبحت حساباتنا على وسائل التواصل تبدو احترافية أخيرًا، والعملاء المحتملون يصلون فعليًا. كامبريدج تتولى التصوير والإعلانات والتقارير، لنتمكن نحن من التركيز على الطعام.', 'testimonials.role1': 'مطعم',
    'testimonials.quote2': 'قاموا ببناء موقعنا الإلكتروني ونظام نقاط البيع وإدارة حملاتنا، كل ذلك من فريق واحد. كل شيء مترابط، وأخيرًا أصبح لدينا شريك واحد بدلًا من خمسة.', 'testimonials.role2': 'مجوهرات فاخرة',
    'testimonials.quote3': 'التقارير الشهرية واضحة وصادقة. نعرف دائمًا ما الذي ينجح وأين تذهب الميزانية. المبيعات في ازدياد وكذلك علامتنا التجارية.', 'testimonials.role3': 'أحذية',
    'cta.title': 'مستعد لتنمية أعمالك،<br><em>بالطريقة الصحيحة؟</em>',
    'cta.desc': 'فريق واحد لتسويقك، وعلامتك التجارية، والتقنية التي تدير أعمالك. تواصل معنا ولنتحدث عن الوجهة التي تريدها.',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'locale.popupTitle': 'اختر دولتك ولغتك', 'locale.popupDesc': 'سنخصص لك الأسعار واللغة بناءً على منطقتك.',
    'locale.countryLabel': 'الدولة', 'locale.languageLabel': 'اللغة', 'locale.confirm': 'متابعة',
    'locale.changeNote': 'يمكنك تغيير هذا لاحقًا من القائمة.',
    'contact.title': 'تواصل مع فريق المؤسسات', 'contact.desc': 'أخبرنا عن عملك وسنتواصل معك قريبًا.',
    'contact.nameLabel': 'الاسم الكامل', 'contact.emailLabel': 'البريد الإلكتروني', 'contact.companyLabel': 'الشركة',
    'contact.phoneLabel': 'الهاتف (اختياري)', 'contact.messageLabel': 'الرسالة',
    'contact.send': 'إرسال الرسالة', 'contact.sending': 'جارٍ الإرسال...', 'contact.success': 'شكرًا لك! سنتواصل معك قريبًا.',
    'contact.error': 'حدث خطأ ما. حاول مرة أخرى أو راسلنا مباشرة.',
    'popup.planDesc': 'أخبرنا قليلاً عن عملك وسنتابع معك الخطوات التالية.', 'popup.planLabel': 'الباقة'
  };

  TRANSLATIONS.si = {
    'nav.home': 'මුල් පිටුව',
    'nav.systems': 'පද්ධති', 'nav.whyCambm': 'මන්ද කැම්බ්‍රිජ්', 'nav.packages': 'පැකේජ', 'nav.bookCall': 'උපායමාර්ග ඇමතුමක් වෙන් කරන්න',
    'nav.about': 'අප ගැන', 'nav.homeAriaLabel': 'Cambridge Marketing, මුල් පිටුවට යන්න',
    'about.hero.eyebrow': 'About US',
    'about.hero.headlineLine1': 'අපි වෙළඳ නාම ගොඩනඟමු.',
    'about.hero.headlineLine2': 'සහ ඒවා පිටුපස ඇති පද්ධති.',
    'about.hero.sub': 'අපි පාරිභෝගික අවධානය සහ පසුබිම් මෙහෙයුම් අතර පරතරය පියවමු. උපායමාර්ගික අලෙවිකරණය සමඟ අභිරුචි POS, ERP සහ වෙබ් සංවර්ධනය ඒකාබද්ධ කිරීමෙන්, ඔබේ වර්ධනය කිසිදා ඔබේ යටිතල පහසුකම් අභිබවා නොයන බව අපි සහතික කරමු.',
    'about.hero.ctaSecondary': 'අපගේ කතාව ගවේෂණය කරන්න',
    'about.story.title': 'අපගේ කතාව',
    'about.story.body': 'Cambridge Technology සිය ඩිජිටල් හැකියාවන් කැපවූ අලෙවිකරණ හා වර්ධන අංශයක් දක්වා පුළුල් කරද්දී 2025 දී Cambridge Marketing ආරම්භ විය. ආකර්ෂණීය අන්තර්ගතයට වඩා යමක් අවශ්‍ය ව්‍යාපාර සඳහා අපි නිර්මාණය වූයෙමු.',
    'about.tech.title': 'තාක්ෂණයෙන් ගොඩනඟන ලදී',
    'about.tech.body': 'Cambridge Technology මෘදුකාංග, ජංගම යෙදුම්, cloud යටිතල පහසුකම්, සයිබර් ආරක්ෂාව සහ ඩිජිටල් විසඳුම් හරහා ව්‍යාපාර සාර්ථක කිරීමට වසර 11කට වැඩි කාලයක් වැය කර ඇත. Cambridge Marketing එම පද්ධති-මූලික චින්තනයම වෙළඳ නාම වර්ධනයට ගෙන එයි, නිර්මාණශීලීත්වය, තාක්ෂණය සහ ක්‍රියාත්මක කිරීම එක් පැහැදිලි මාර්ගයකට සම්බන්ධ කරමින්.',
    'about.systems.title': 'සම්බන්ධිත එක් පද්ධතියක්, විසිරුණු මෙවලම් නොවේ.',
    'about.systems.sub': 'Cambridge Technology දැනටමත් සැබෑ ව්‍යාපාරවල පිටුපස පවතින මෘදුකාංග ක්‍රියාත්මක කරයි. Cambridge Marketing එම පද්ධතියටම වර්ධනය සම්බන්ධ කරයි, එමඟින් ඉදිරිපස ඔබ නිර්මාණය කරන අවධානය සහ පසුපස එය ඉටු කරන මෙහෙයුම් වෙන් වෙන් සැපයුම්කරුවන් ලෙස නොව එකක් ලෙස ක්‍රියා කරයි.',
    'about.systems.step1Label': 'ආකර්ෂණය', 'about.systems.step1Body': 'නිවැරදි පුද්ගලයන් ඔබ වෙත ගෙන එන වෙළඳ නාම, අන්තර්ගත සහ දැන්වීම්.',
    'about.systems.step2Label': 'පරිවර්තනය', 'about.systems.step2Body': 'උනන්දුව නායකත්වයන් බවට පත් කරන වෙබ් අඩවි, ලෑන්ඩින් පිටු සහ විමසුම් ප්‍රවාහ.',
    'about.systems.step3Label': 'මෙහෙයුම', 'about.systems.step3Body': 'සෑම ඇණවුමක්ම පිටුපසින් ඉටු කර කළමනාකරණය කරන POS, ERP සහ ස්වයංක්‍රීයකරණය.',
    'about.systems.step4Label': 'රඳවා ගැනීම', 'about.systems.step4Body': 'තනි විකිණීමක් නැවත නැවත ආදායමක් බවට පත් කරන වාර්තා සහ පසු විපරම්.',
    'about.why.title': 'ව්‍යාපාර Cambridge Marketing තෝරා ගන්නේ ඇයි',
    'about.why.item1Title': 'එක් කණ්ඩායමක්, ආරම්භයේ සිට අවසානය දක්වා', 'about.why.item1Body': 'උපායමාර්ග, නිර්මාණ, වෙබ් අඩවි, ස්වයංක්‍රීයකරණය සහ වාර්තාකරණය එක් හවුල්කරුවෙකු යටතේ.',
    'about.why.item2Title': 'තාක්ෂණයෙන් සහාය දුන් අලෙවිකරණය', 'about.why.item2Body': 'මෘදුකාංග, ඩිජිටල් පද්ධති සහ යටිතල පහසුකම් පිළිබඳ අත්දැකීම් ඇති සමාගමකින් ගොඩනඟන ලදී.',
    'about.why.item3Title': 'ප්‍රතිදානයට පෙර උපායමාර්ගය', 'about.why.item3Body': 'සෑම පළ කිරීමක්ම, පිටුවක්ම, ව්‍යාපාර ප්‍රචාරණයක්ම සහ පද්ධතියක්ම පැහැදිලි ව්‍යාපාරික අරමුණක් සඳහා සහාය වේ.',
    'about.why.item4Title': 'සම්බන්ධිත මෙහෙයුම්', 'about.why.item4Body': 'අලෙවිකරණය අවධානය ලබා ගැනීමෙන් නතර නොවේ; එය අවස්ථා, කාර්ය ප්‍රවාහ, POS/ERP සහ පාරිභෝගික ගමන් සඳහා සහාය වේ.',
    'about.why.item5Title': 'විනිවිද පෙනෙන වාර්තා', 'about.why.item5Body': 'ක්‍රියාත්මක වන දේ, දියුණු කළ යුතු දේ සහ අයවැය යන්නේ කොහේද යන්න පැහැදිලි මාසික තීක්ෂණ බුද්ධිය පෙන්වයි.',
    'about.why.item6Title': 'ගෝලීය වර්ධන චින්තනය', 'about.why.item6Body': 'වෙළඳපොළ, භාෂා සහ ඩිජිටල් නාලිකා හරහා පුළුල් වන ව්‍යාපාර සඳහා නිර්මාණය කර ඇත.',
    'about.process.title': 'අපි වැඩ කරන ආකාරය',
    'about.process.step1Title': 'උපදේශනය', 'about.process.step1Body': 'ව්‍යාපාර අරමුණු, වර්තමාන අලෙවිකරණය, පද්ධති, ප්‍රේක්ෂකයන් සහ වර්ධන බාධක අපි තේරුම් ගනිමු.',
    'about.process.step2Title': 'උපායමාර්ග සහ කණ්ඩායම් සැලසුම්', 'about.process.step2Body': 'ප්‍රමුඛතා, නාලිකා, නිර්මාණාත්මක මගපෙන්වීම, කාර්ය ප්‍රවාහ සහ නිවැරදි ක්‍රියාත්මක කණ්ඩායම අපි නිර්වචනය කරමු.',
    'about.process.step3Title': 'නිර්මාණය, ගොඩනැගීම සහ දියත් කිරීම', 'about.process.step3Body': 'අපි සම්පත්, ව්‍යාපාර ප්‍රචාරණ, වෙබ් අඩවි, ස්වයංක්‍රීය ප්‍රවාහ සහ මෙහෙයුම් ඒකාබද්ධ කිරීම් නිර්මාණය කරමු.',
    'about.process.step4Title': 'වාර්තාකරණය සහ දියුණුව', 'about.process.step4Body': 'අපි කාර්යසාධනය නිරීක්ෂණය කර, පැහැදිලිව වාර්තා කර, ව්‍යාපාර ප්‍රචාරණ, අන්තර්ගත සහ පද්ධති මාසිකව දියුණු කරමු.',
    'about.values.title': 'අප වෙනුවෙන් පෙනී සිටින දේ',
    'about.values.item1Title': 'නවෝත්පාදනය', 'about.values.item1Body': 'ප්‍රබල ප්‍රතිඵල නිර්මාණය කිරීමට නව තාක්ෂණ, නිර්මාණාත්මක ආකෘති සහ දක්ෂ පද්ධති අපි ගවේෂණය කරමු.',
    'about.values.item2Title': 'විශ්වසනීයත්වය', 'about.values.item2Body': 'ගනුදෙනුකරුවන්ට විශ්වාස කළ හැකි ස්ථාවර, පුළුල් කළ හැකි සහ තිරසාර අලෙවිකරණ පද්ධති අපි ගොඩනඟමු.',
    'about.values.item3Title': 'පාරිභෝගික සාර්ථකත්වය', 'about.values.item3Body': 'ගනුදෙනුකරුවන්ගේ වර්ධනය, පැහැදිලිකම සහ විශ්වාසය සෑම ව්‍යාපාර ප්‍රචාරණයකම හා පද්ධතියකම කේන්ද්‍රීය වේ.',
    'about.values.item4Title': 'අඛණ්ඩතාව', 'about.values.item4Body': 'අපි විනිවිද පෙනෙන ලෙස සන්නිවේදනය කර, අවංකව වාර්තා කර, සෑම ප්‍රතිදානයකම ගුණාත්මකභාවය පවත්වා ගනිමු.',
    'about.values.item5Title': 'සහයෝගීතාව', 'about.values.item5Body': 'අරමුණු, සන්දර්භය, මෙහෙයුම් සහ වෙළඳපොළ දිශානතිය තේරුම් ගැනීමට අපි ගනුදෙනුකරුවන් සමඟ සමීපව වැඩ කරමු.',
    'about.global.title': 'දේශීයව ගොඩනඟන ලදී. ගෝලීයව නිර්මාණය කර ඇත.',
    'about.global.body': 'Cambridge Marketing ගෝලීය මෙහෙයුම් චින්තනයකින් ගොඩනැගෙමින් පවතී. අපගේ ගමන සෞදි සහ මැද පෙරදිග වෙළඳපොළින් ආරම්භ වී, ශ්‍රී ලංකාව සහ ඉන්දියාව හරහා පුළුල් වී, යුරෝපය සහ ලොව පුරා ව්‍යාපාරවලට සේවය කිරීමට නිර්මාණය කර ඇත. ඉලක්කය තවත් දේශීය අලෙවිකරණ සැපයුම්කරුවෙකු වීම නොවේ, විවිධ කලාප හරහා අභිලාෂකාමී සමාගම් සඳහා විශ්වාසනීය වර්ධන පද්ධති හවුල්කරුවෙකු බවට පත්වීමයි.',
    'about.global.node1Label': '2014+', 'about.global.node1Detail': 'තාක්ෂණික පදනම',
    'about.global.node2Label': '2025', 'about.global.node2Detail': 'අලෙවිකරණ අංශය ආරම්භ විය',
    'about.global.node3Label': 'දැන්', 'about.global.node3Detail': 'සෞදි, මැද පෙරදිග, ශ්‍රී ලංකාව, ඉන්දියාව',
    'about.global.node4Label': 'ඊළඟට', 'about.global.node4Detail': 'යුරෝපය සහ ලොව පුරා',
    'about.cta.headline': 'ඔබේ වෙළඳ නාමය වර්ධනය කිරීමට සූදානම්ද?',
    'hero.eyebrow': 'අලෙවිකරණය සහ තාක්ෂණය, එකම වහලක් යටතේ',
    'hero.title': '<em>සමාජ මාධ්‍යවලින්</em><br>ඔබ්බට.',
    'hero.services': 'අපගේ සේවාවන්',
    'hero.stat1Label': 'නිම කළ ව්‍යාපෘති', 'hero.stat2Label': 'පාරිභෝගික තෘප්තිය', 'hero.stat3Label': 'සාමාන්‍ය නිම කිරීමේ කාලය',
    'ai.eyebrow': 'පද්ධති',
    'ai.title': 'හුදෙක් අලෙවිකරණයක් නොවේ.<br><em>සම්පූර්ණ වර්ධන එන්ජිමක්,</em> නවීන ව්‍යාපාර සඳහා.',
    'ai.desc': 'නිර්මාණාත්මක උපාය මාර්ග, සමාජ මාධ්‍ය, වෙබ් අඩවි, ගෙවන ලද දැන්වීම්, ස්වයංක්‍රීයකරණය, POS, ERP සහ කාර්යසාධන වාර්තා තුළින් කැම්බ්‍රිජ් ඔබේ වෙළඳ නාමය වර්ධනය කිරීමට උපකාර කරයි. සියල්ල එකට ක්‍රියා කරන පරිදි නිර්මාණය කර ඇති අතර, ඔබේ වෙළඳ නාමය වෘත්තීයමය ලෙස පෙනී, වඩා හොඳ අවස්ථා ආකර්ෂණය කර, වඩාත් දක්ෂ ලෙස ක්‍රියාත්මක වේ.',
    'ai.feature1Title': 'වෙළඳ නාම හා නිර්මාණාත්මක පද්ධති', 'ai.feature1Desc': 'පැහැදිලි උපාය මාර්ගයක් මත ගොඩනගන ලද වෘත්තීය දෘශ්‍යකරණ, ව්‍යාපාර ප්‍රචාරණ, අන්තර්ගතය සහ වෙළඳ නාම සම්පත්.',
    'ai.feature2Title': 'සමාජ මාධ්‍ය සහ දැන්වීම්', 'ai.feature2Desc': 'අන්තර්ගත සැලසුම්කරණය, නිර්මාණාත්මක පළ කිරීම්, reels, Meta ප්‍රචාරණ සහ අවස්ථා-යොමු වූ දැන්වීම්.',
    'ai.feature3Title': 'වෙබ් අඩවි සහ ලෑන්ඩින් පිටු', 'ai.feature3Desc': 'විශ්වාසය, වේගය, විමසීම් සහ ව්‍යාපාර වර්ධනය සඳහා නිර්මාණය කළ නවීන වෙබ් අඩවි.',
    'ai.feature4Title': 'POS සහ ERP සංවර්ධනය', 'ai.feature4Desc': 'බිල්පත් කිරීම, තොග, අවන්හල්, සිල්ලර වෙළඳාම, වාර්තාකරණය සහ මෙහෙයුම් සඳහා අභිරුචි පද්ධති.',
    'ai.feature5Title': 'ස්වයංක්‍රීයකරණය සහ අවස්ථා ප්‍රවාහය', 'ai.feature5Desc': 'WhatsApp, පෝරම, විමසීම්, පසු විපරම් සහ පාරිභෝගික ගමන් නිසි ලෙස සම්බන්ධ කර ඇත.',
    'ai.feature6Title': 'වාර්තා සහ වර්ධන නිරීක්ෂණය', 'ai.feature6Desc': 'මාසික තීක්ෂණ බුද්ධිය, ප්‍රචාරණ කාර්යසාධනය, අන්තර්ගත සමාලෝචනය සහ දියුණු කිරීමේ සැලසුම්.',
    'diff.title': 'බොහෝ ඒජන්සි පළ කිරීමේදී නවතී. <em>අපි එහෙම නෑ.</em>',
    'diff.item1Title': 'එක් කණ්ඩායමක්, ආරම්භයේ සිට අවසානය දක්වා', 'diff.item1Desc': 'පස් දෙනෙකු සමඟ කටයුතු කරනු වෙනුවට එක් හවුල්කරුවෙකු සමඟ පමණක් සාකච්ඡා කරන්න. උපාය මාර්ග, නිර්මාණශීලීත්වය සහ ඉංජිනේරු විද්‍යාව එක් වහලක් යටතේ.',
    'diff.item2Title': 'අලෙවිකරණය මෙහෙයුම් හමුවේ', 'diff.item2Desc': 'ඔබේ දැන්වීම්, වෙබ් අඩවිය, POS සහ ERP සම්බන්ධ කර ඇති අතර, වර්ධනය ඔබේ පසුබිම් කාර්යාල කඩාකප්පල් නොකරයි.',
    'diff.item3Title': 'ඔබට කියවිය හැකි ප්‍රතිඵල', 'diff.item3Desc': 'පැහැදිලි මාසික වාර්තාකරණය. ක්‍රියාත්මක වන්නේ කුමක්ද සහ ඔබේ මුදල් යන්නේ කොහේද යන්න ඔබ සැමවිටම දනී.',
    'comparison.eyebrow': 'කැම්බ්‍රිජ් එදිරිව සාම්ප්‍රදායික ක්‍රමය',
    'comparison.title': 'බඳවා ගැනීමද, සාම්ප්‍රදායික බාහිර සේවාද?<br><em>දෙකම නොවේ.</em>',
    'comparison.requirement': 'අවශ්‍යතාව', 'comparison.hiringInHouse': 'අභ්‍යන්තර බඳවා ගැනීම',
    'comparison.traditionalOutsourcing': 'සාම්ප්‍රදායික බාහිර සේවා', 'comparison.cambm': 'කැම්බ්‍රිජ් මාර්කටින්',
    'comparison.strategy': 'උපායමාර්ගය', 'comparison.strategyInHouse': 'මිල අධික ජ්‍යෙෂ්ඨ දක්ෂතා',
    'comparison.strategyOutsourcing': 'සීමිත වෙළඳ නාම හිමිකාරිත්වය', 'comparison.strategyCambm': 'කැපවූ වර්ධන උපායමාර්ගඥයෙක්',
    'comparison.creative': 'නිර්මාණශීලීත්වය', 'comparison.creativeInHouse': 'සම්පූර්ණ නිර්මාණාත්මක කණ්ඩායමක් අවශ්‍යයි',
    'comparison.creativeOutsourcing': 'ප්‍රතිදානය මත පමණක් පදනම්ව', 'comparison.creativeCambm': 'සැලසුම් කළ මාසික නිර්මාණාත්මක මගපෙන්වීම',
    'comparison.management': 'කළමනාකරණය', 'comparison.managementInHouse': 'ඔබ කණ්ඩායම කළමනාකරණය කරයි',
    'comparison.managementOutsourcing': 'ඔබ ඒජන්සිය කළමනාකරණය කරයි', 'comparison.managementCambm': 'අපි සම්පූර්ණ කාර්ය ප්‍රවාහය කළමනාකරණය කරමු',
    'comparison.website': 'වෙබ් අඩවිය', 'comparison.websiteInHouse': 'වෙනම වියදමක්',
    'comparison.websiteOutsourcing': 'වෙනම සැපයුම්කරුවෙක්', 'comparison.websiteCambm': 'අභිරුචි වෙබ් අඩවියක් + මාසික කළමනාකරණය',
    'comparison.posSoftware': 'POS මෘදුකාංගය', 'comparison.posSoftwareInHouse': 'වෙනම පද්ධතියක් අවශ්‍යයි',
    'comparison.posSoftwareOutsourcing': 'සාමාන්‍යයෙන් ඇතුළත් නොවේ', 'comparison.posSoftwareCambm': 'අභිරුචි POS මෘදුකාංගය + කළමනාකරණය',
    'comparison.erp': 'ERP', 'comparison.erpInHouse': 'බොහෝ වෙළඳ නාම සඳහා ප්‍රායෝගික නොවේ',
    'comparison.erpOutsourcing': 'ඇතුළත් නොවේ', 'comparison.erpCambm': 'අභිරුචි ERP + POS + වෙබ් අඩවිය',
    'comparison.scalability': 'පුළුල් කළ හැකි බව', 'comparison.scalabilityInHouse': 'මන්දගාමී සහ මිල අධිකයි',
    'comparison.scalabilityOutsourcing': 'සීමිත නම්‍යශීලීත්වය', 'comparison.scalabilityCambm': 'ඔබේ ව්‍යාපාරය සමඟ පුළුල් වීමට නිර්මාණය කර ඇත',
    'comparison.accountability': 'වගවීම', 'comparison.accountabilityInHouse': 'අභ්‍යන්තර පීඩනය',
    'comparison.accountabilityOutsourcing': 'සැපයුම්කරු මත යැපීම', 'comparison.accountabilityCambm': 'එක් උපායමාර්ගික හවුල්කරුවෙක්',
    'pricing.eyebrow': 'මිල ගණන්', 'pricing.title': '<em>වර්ධනය</em> සඳහා නිර්මාණය කරන ලද උපායමාර්ගික සැලසුම්.',
    'pricing.desc': 'සරල මාසික පැකේජ. ඔබේ ව්‍යාපාරය වර්ධනය වන විට ඕනෑම වේලාවක උත්ශ්‍රේණි කරන්න.',
    'pricing.perMo': '/මාසයකට', 'pricing.recommended': 'නිර්දේශිතයි', 'pricing.selectPlan': 'සැලැස්ම තෝරන්න',
    'pricing.gold': 'සුවිශේෂී', 'pricing.platinum': 'කීර්තිමත්', 'pricing.diamond': 'ප්‍රභූ',
    'pricing.term.minimum3Month': 'අවම වශයෙන් මාස 3ක සැලැස්මක්', 'pricing.term.annual': 'වාර්ෂික සැලැස්මක්',
    'pricing.tcApplies': 'නියම සහ කොන්දේසි අදාළ වේ',
    'pricing.f.dedicatedCreativePlanner': 'කැපවූ නිර්මාණාත්මක සැලසුම්කරුවෙක්',
    'pricing.f.completeSocialMgmt': 'සම්පූර්ණ සමාජ මාධ්‍ය කළමනාකරණය',
    'pricing.f.monthlyContentPlanning': 'මාසික අන්තර්ගත සැලසුම්කරණය',
    'pricing.f.premiumBrandCreatives': 'වාරික වෙළඳ නාම නිර්මාණ',
    'pricing.f.customWebsite': 'අභිරුචි වෙබ් අඩවියක්',
    'pricing.f.monthlyWebsiteMgmt': 'මාසික වෙබ් අඩවි කළමනාකරණය',
    'pricing.f.analyticsReport': 'මාසික විශ්ලේෂණ වාර්තාව', 'pricing.f.premiumSocialMgmt': 'වාරික සමාජ මාධ්‍ය කළමනාකරණය',
    'pricing.f.dedicatedContentStrategist': 'කැපවූ අන්තර්ගත උපායමාර්ගඥයෙක්',
    'pricing.f.monthlyCampaignPlanning': 'මාසික ප්‍රචාරණ සැලසුම්කරණය',
    'pricing.f.completeCreativeDirection': 'සම්පූර්ණ නිර්මාණාත්මක මගපෙන්වීම',
    'pricing.f.customPosWebsite': 'අභිරුචි POS පද්ධතිය + වෙබ් අඩවිය',
    'pricing.f.monthlyPosWebsiteMgmt': 'මාසික POS පද්ධතිය සහ වෙබ් අඩවි කළමනාකරණය',
    'pricing.f.seniorContentStrategist': 'ජ්‍යෙෂ්ඨ අන්තර්ගත උපායමාර්ගඥයෙක්',
    'pricing.f.fullPremiumSocial': 'සම්පූර්ණ වාරික සමාජ මාධ්‍ය කළමනාකරණය',
    'pricing.f.completeBrandCampaignMgmt': 'සම්පූර්ණ වෙළඳ නාම හා ප්‍රචාරණ කළමනාකරණය',
    'pricing.f.customErpPosWebsite': 'අභිරුචි ERP + POS පද්ධතිය + වෙබ් අඩවිය',
    'pricing.f.monthlyErpPosWebsiteMgmt': 'මාසික ERP, POS පද්ධතිය සහ වෙබ් අඩවි කළමනාකරණය',
    'pricing.f.advancedGrowthReport': 'දියුණු මාසික වර්ධන වාර්තාව',
    'pricing.enterpriseTitle': 'එන්ටර්ප්‍රයිස්', 'pricing.enterpriseDesc': 'විශාල මෙහෙයුම් සඳහා අභිරුචි විෂය පථයක්, කැපවූ කණ්ඩායමක් සහ සම්පූර්ණ IT/ERP ඒකාබද්ධතාවයක්.',
    'pricing.contactUs': 'අප අමතන්න',
    'testimonials.eyebrow': 'අපෙන් පමණක් අහන්න එපා', 'testimonials.title': 'නිර්මාණාත්මක ජයග්‍රහණ, <em>අපගේ පාරිභෝගිකයන් විසින්ම කියන ලද</em>',
    'testimonials.quote1': 'අපගේ සමාජ මාධ්‍ය අවසානයේ නිසි ලෙස පෙනේ, සහ අවස්ථා ඇත්තටම එනවා. කැම්බ්‍රිජ් රූගත කිරීම්, දැන්වීම් සහ වාර්තාකරණය භාරගන්නා නිසා, අපට ආහාරය කෙරෙහි අවධානය යොමු කළ හැකියි.', 'testimonials.role1': 'අවන්හල',
    'testimonials.quote2': 'ඔවුන් අපගේ වෙබ් අඩවිය සහ POS පද්ධතිය ගොඩනඟා, එක් කණ්ඩායමකින්ම අපගේ ප්‍රචාරණ මෙහෙයවනවා. සියල්ල සම්බන්ධයි, අවසානයේ අපට පස් දෙනෙකුට වඩා එක් හවුල්කරුවෙක් ඉන්නවා.', 'testimonials.role2': 'ස්වර්ණාභරණ',
    'testimonials.quote3': 'මාසික වාර්තාකරණය පැහැදිලියි සහ අවංකයි. ක්‍රියාත්මක වන්නේ කුමක්ද සහ අයවැය යන්නේ කොහේද යන්න අපි සැමවිටම දනිමු. විකුණුම් වැඩිවෙලා, අපගේ වෙළඳ නාමයත් එහෙමයි.', 'testimonials.role3': 'පාවහන්',
    'cta.title': 'ඔබේ ව්‍යාපාරය,<br><em>නිවැරදි ආකාරයෙන් වර්ධනය කිරීමට සූදානම්ද?</em>',
    'cta.desc': 'ඔබේ අලෙවිකරණය, වෙළඳ නාමය සහ ඔබේ ව්‍යාපාරය මෙහෙයවන තාක්ෂණය සඳහා එක් කණ්ඩායමක්. සම්බන්ධ වී ඔබ යාමට කැමති තැන ගැන කතා කරමු.',
    'footer.rights': 'සියලුම හිමිකම් ඇවිරිණි.',
    'locale.popupTitle': 'ඔබේ රට සහ භාෂාව තෝරන්න', 'locale.popupDesc': 'ඔබේ කලාපයට අනුව මිල ගණන් සහ භාෂාව අපි සකසන්නෙමු.',
    'locale.countryLabel': 'රට', 'locale.languageLabel': 'භාෂාව', 'locale.confirm': 'ඉදිරියට යන්න',
    'locale.changeNote': 'ඔබට මෙය ඕනෑම වේලාවක මෙනුවෙන් වෙනස් කළ හැක.',
    'contact.title': 'එන්ටර්ප්‍රයිස් විකුණුම් අමතන්න', 'contact.desc': 'ඔබේ ව්‍යාපාරය ගැන අපට කියන්න, අපි ඉක්මනින් ඔබ හා සම්බන්ධ වෙමු.',
    'contact.nameLabel': 'සම්පූර්ණ නම', 'contact.emailLabel': 'විද්‍යුත් තැපෑල', 'contact.companyLabel': 'සමාගම',
    'contact.phoneLabel': 'දුරකථනය (විකල්ප)', 'contact.messageLabel': 'පණිවිඩය',
    'contact.send': 'පණිවිඩය යවන්න', 'contact.sending': 'යවමින්...', 'contact.success': 'ස්තූතියි! අපි ඉක්මනින් සම්බන්ධ වෙමු.',
    'contact.error': 'යමක් වැරදුණි. නැවත උත්සාහ කරන්න හෝ අප වෙත සෘජුවම විද්‍යුත් තැපෑල එවන්න.',
    'popup.planDesc': 'ඔබේ ව්‍යාපාරය ගැන අපට ටිකක් කියන්න, ඊළඟ පියවර සමඟ අපි සම්බන්ධ වෙමු.', 'popup.planLabel': 'සැලැස්ම'
  };

  TRANSLATIONS.ta = {
    'nav.home': 'முகப்பு',
    'nav.systems': 'அமைப்புகள்', 'nav.whyCambm': 'ஏன் கேம்ப்ரிட்ஜ்', 'nav.packages': 'தொகுப்புகள்', 'nav.bookCall': 'மூலோபாய அழைப்பை பதிவு செய்யவும்',
    'nav.about': 'எங்களைப் பற்றி', 'nav.homeAriaLabel': 'Cambridge Marketing, முகப்புப் பக்கத்திற்குச் செல்லவும்',
    'about.hero.eyebrow': 'About US',
    'about.hero.headlineLine1': 'நாங்கள் பிராண்டுகளை உருவாக்குகிறோம்.',
    'about.hero.headlineLine2': 'மேலும் அவற்றின் பின்னணியில் உள்ள அமைப்புகளையும்.',
    'about.hero.sub': 'வாடிக்கையாளர் கவனத்திற்கும் பின்னணி செயல்பாடுகளுக்கும் இடையிலான இடைவெளியை நாங்கள் குறைக்கிறோம். மூலோபாய சந்தைப்படுத்தலுடன் தனிப்பயன் POS, ERP மற்றும் இணையதள மேம்பாட்டை இணைப்பதன் மூலம், உங்கள் வளர்ச்சி ஒருபோதும் உங்கள் உள்கட்டமைப்பை மீறாது என்பதை உறுதிசெய்கிறோம்.',
    'about.hero.ctaSecondary': 'எங்கள் கதையை ஆராயுங்கள்',
    'about.story.title': 'எங்கள் கதை',
    'about.story.body': 'Cambridge Technology தனது டிஜிட்டல் திறன்களை ஒரு பிரத்யேக சந்தைப்படுத்தல் மற்றும் வளர்ச்சிப் பிரிவாக விரிவுபடுத்தியபோது 2025 இல் Cambridge Marketing நிறுவப்பட்டது. கவர்ச்சிகரமான உள்ளடக்கத்தை விட அதிகம் தேவைப்படும் வணிகங்களுக்காக நாங்கள் உருவாக்கப்பட்டோம்.',
    'about.tech.title': 'தொழில்நுட்பத்திலிருந்து கட்டமைக்கப்பட்டது',
    'about.tech.body': 'Cambridge Technology மென்பொருள், மொபைல் பயன்பாடுகள், cloud உள்கட்டமைப்பு, சைபர் பாதுகாப்பு மற்றும் டிஜிட்டல் தீர்வுகள் மூலம் வணிகங்கள் வெற்றிபெற உதவ 11 ஆண்டுகளுக்கும் மேலாக செலவிட்டுள்ளது. Cambridge Marketing அதே அமைப்பு-முதன்மை சிந்தனையை பிராண்ட் வளர்ச்சிக்குக் கொண்டுவருகிறது, படைப்பாற்றல், தொழில்நுட்பம் மற்றும் செயல்படுத்தலை ஒரு தெளிவான பாதையாக இணைக்கிறது.',
    'about.systems.title': 'இணைந்த ஒரே அமைப்பு, சிதறிய கருவிகள் அல்ல.',
    'about.systems.sub': 'Cambridge Technology ஏற்கனவே உண்மையான வணிகங்களுக்குப் பின்னால் உள்ள மென்பொருளை இயக்குகிறது. Cambridge Marketing அதே அமைப்புடன் வளர்ச்சியை இணைக்கிறது, இதனால் முன்பக்கத்தில் நீங்கள் உருவாக்கும் கவனமும், பின்பக்கத்தில் அதை நிறைவேற்றும் செயல்பாடுகளும் தனித்தனி விற்பனையாளர்களாக அல்லாமல் ஒன்றாக இயங்குகின்றன.',
    'about.systems.step1Label': 'ஈர்ப்பு', 'about.systems.step1Body': 'சரியான நபர்களை உங்களிடம் கொண்டு வரும் பிராண்ட், உள்ளடக்கம் மற்றும் விளம்பரங்கள்.',
    'about.systems.step2Label': 'மாற்றம்', 'about.systems.step2Body': 'ஆர்வத்தை வாய்ப்புகளாக மாற்றும் இணையதளங்கள், லேண்டிங் பக்கங்கள் மற்றும் விசாரணை ஓட்டங்கள்.',
    'about.systems.step3Label': 'செயல்பாடு', 'about.systems.step3Body': 'ஒவ்வொரு ஆர்டரையும் திரைமறைவில் நிறைவேற்றி நிர்வகிக்கும் POS, ERP மற்றும் தானியங்கல்.',
    'about.systems.step4Label': 'தக்கவைப்பு', 'about.systems.step4Body': 'ஒரு விற்பனையை மீண்டும் வருமானமாக மாற்றும் அறிக்கைகள் மற்றும் தொடர் தொடர்புகள்.',
    'about.why.title': 'வணிகங்கள் Cambridge Marketing ஐ ஏன் தேர்வு செய்கின்றன',
    'about.why.item1Title': 'ஒரே அணி, தொடக்கம் முதல் முடிவு வரை', 'about.why.item1Body': 'உத்தி, படைப்பாற்றல், இணையதளங்கள், தானியங்கல் மற்றும் அறிக்கையிடல் ஒரே கூட்டாளரின் கீழ்.',
    'about.why.item2Title': 'தொழில்நுட்பத்தால் ஆதரிக்கப்படும் சந்தைப்படுத்தல்', 'about.why.item2Body': 'மென்பொருள், டிஜிட்டல் அமைப்புகள் மற்றும் உள்கட்டமைப்பு அனுபவம் கொண்ட நிறுவனத்திலிருந்து கட்டமைக்கப்பட்டது.',
    'about.why.item3Title': 'வெளியீட்டிற்கு முன் உத்தி', 'about.why.item3Body': 'ஒவ்வொரு இடுகை, பக்கம், பிரச்சாரம் மற்றும் அமைப்பும் தெளிவான வணிக நோக்கத்தை ஆதரிக்கிறது.',
    'about.why.item4Title': 'இணைக்கப்பட்ட செயல்பாடுகள்', 'about.why.item4Body': 'சந்தைப்படுத்தல் கவனத்தில் நிற்பதில்லை; அது வாய்ப்புகள், பணிப்பாய்வுகள், POS/ERP மற்றும் வாடிக்கையாளர் பயணங்களை ஆதரிக்கிறது.',
    'about.why.item5Title': 'வெளிப்படையான அறிக்கையிடல்', 'about.why.item5Body': 'எது வேலை செய்கிறது, எது மேம்பட வேண்டும், பட்ஜெட் எங்கு செல்கிறது என்பதை தெளிவான மாதாந்திர நுண்ணறிவு காட்டுகிறது.',
    'about.why.item6Title': 'உலகளாவிய வளர்ச்சி சிந்தனை', 'about.why.item6Body': 'சந்தைகள், மொழிகள் மற்றும் டிஜிட்டல் சேனல்கள் முழுவதும் விரிவடையும் வணிகங்களுக்காக வடிவமைக்கப்பட்டது.',
    'about.process.title': 'நாங்கள் எவ்வாறு செயல்படுகிறோம்',
    'about.process.step1Title': 'ஆலோசனை', 'about.process.step1Body': 'வணிக இலக்குகள், தற்போதைய சந்தைப்படுத்தல், அமைப்புகள், பார்வையாளர்கள் மற்றும் வளர்ச்சி தடைகளை நாங்கள் புரிந்துகொள்கிறோம்.',
    'about.process.step2Title': 'உத்தி மற்றும் அணி திட்டமிடல்', 'about.process.step2Body': 'முன்னுரிமைகள், சேனல்கள், ஆக்கபூர்வமான வழிநடத்தல், பணிப்பாய்வுகள் மற்றும் சரியான செயல்படுத்தும் அணியை நாங்கள் வரையறுக்கிறோம்.',
    'about.process.step3Title': 'வடிவமைப்பு, கட்டமைப்பு மற்றும் தொடக்கம்', 'about.process.step3Body': 'நாங்கள் சொத்துக்கள், பிரச்சாரங்கள், இணையதளங்கள், தானியங்கு ஓட்டங்கள் மற்றும் செயல்பாட்டு ஒருங்கிணைப்புகளை உருவாக்குகிறோம்.',
    'about.process.step4Title': 'அறிக்கையிடல் மற்றும் மேம்பாடு', 'about.process.step4Body': 'நாங்கள் செயல்திறனைக் கண்காணித்து, தெளிவாக அறிக்கை செய்து, பிரச்சாரங்கள், உள்ளடக்கம் மற்றும் அமைப்புகளை மாதந்தோறும் மேம்படுத்துகிறோம்.',
    'about.values.title': 'நாங்கள் எதற்காக நிற்கிறோம்',
    'about.values.item1Title': 'புதுமை', 'about.values.item1Body': 'வலுவான விளைவுகளை உருவாக்க புதிய தொழில்நுட்பங்கள், ஆக்கபூர்வமான வடிவங்கள் மற்றும் புத்திசாலித்தனமான அமைப்புகளை நாங்கள் ஆராய்கிறோம்.',
    'about.values.item2Title': 'நம்பகத்தன்மை', 'about.values.item2Body': 'வாடிக்கையாளர்கள் நம்பக்கூடிய நிலையான, விரிவாக்கக்கூடிய மற்றும் நிலையான சந்தைப்படுத்தல் அமைப்புகளை நாங்கள் கட்டமைக்கிறோம்.',
    'about.values.item3Title': 'வாடிக்கையாளர் வெற்றி', 'about.values.item3Body': 'வாடிக்கையாளர் வளர்ச்சி, தெளிவு மற்றும் நம்பிக்கை ஒவ்வொரு பிரச்சாரம் மற்றும் அமைப்பின் மையமாக இருக்கிறது.',
    'about.values.item4Title': 'நேர்மை', 'about.values.item4Body': 'நாங்கள் வெளிப்படையாக தொடர்பு கொண்டு, நேர்மையாக அறிக்கை செய்து, ஒவ்வொரு வழங்கலிலும் தரத்தை பராமரிக்கிறோம்.',
    'about.values.item5Title': 'ஒத்துழைப்பு', 'about.values.item5Body': 'இலக்குகள், சூழல், செயல்பாடுகள் மற்றும் சந்தை திசையைப் புரிந்துகொள்ள வாடிக்கையாளர்களுடன் நெருக்கமாக வேலை செய்கிறோம்.',
    'about.global.title': 'உள்ளூரில் கட்டப்பட்டது. உலகளவில் வடிவமைக்கப்பட்டது.',
    'about.global.body': 'Cambridge Marketing உலகளாவிய செயல்பாட்டு சிந்தனையுடன் கட்டமைக்கப்படுகிறது. எங்கள் பயணம் சவூதி மற்றும் மத்திய கிழக்கு சந்தையில் தொடங்கி, இலங்கை மற்றும் இந்தியா வழியாக விரிவடைந்து, ஐரோப்பா மற்றும் உலகெங்கிலும் உள்ள வணிகங்களுக்கு சேவை செய்ய வடிவமைக்கப்பட்டுள்ளது. இலக்கு மற்றொரு உள்ளூர் சந்தைப்படுத்தல் விற்பனையாளராக இருப்பதல்ல, பல்வேறு பகுதிகளில் உள்ள லட்சிய நிறுவனங்களுக்கு நம்பகமான வளர்ச்சி அமைப்புகள் கூட்டாளராக மாறுவதே.',
    'about.global.node1Label': '2014+', 'about.global.node1Detail': 'தொழில்நுட்ப அடித்தளம்',
    'about.global.node2Label': '2025', 'about.global.node2Detail': 'சந்தைப்படுத்தல் பிரிவு நிறுவப்பட்டது',
    'about.global.node3Label': 'இப்போது', 'about.global.node3Detail': 'சவூதி, மத்திய கிழக்கு, இலங்கை, இந்தியா',
    'about.global.node4Label': 'அடுத்து', 'about.global.node4Detail': 'ஐரோப்பா மற்றும் உலகம் முழுவதும்',
    'about.cta.headline': 'உங்கள் பிராண்டை வளர்க்க தயாரா?',
    'hero.eyebrow': 'சந்தைப்படுத்தல் மற்றும் தொழில்நுட்பம், ஒரே கூரையின் கீழ்',
    'hero.title': '<em>சமூக ஊடகங்களுக்கு</em><br>அப்பால்.',
    'hero.services': 'எங்கள் சேவைகள்',
    'hero.stat1Label': 'நிறைவு செய்யப்பட்ட திட்டங்கள்', 'hero.stat2Label': 'வாடிக்கையாளர் திருப்தி', 'hero.stat3Label': 'சராசரி நேர எடுப்பு',
    'ai.eyebrow': 'அமைப்புகள்',
    'ai.title': 'வெறும் சந்தைப்படுத்தல் மட்டுமல்ல.<br><em>முழுமையான வளர்ச்சி இயந்திரம்,</em> நவீன வணிகங்களுக்காக.',
    'ai.desc': 'ஆக்கபூர்வமான உத்தி, சமூக ஊடகம், இணையதளங்கள், பணம் செலுத்திய விளம்பரங்கள், தானியங்குமயமாக்கல், POS, ERP மற்றும் செயல்திறன் அறிக்கைகள் மூலம் கேம்ப்ரிட்ஜ் மார்க்கெட்டிங் நிறுவனங்களை வளர உதவுகிறது. அனைத்தும் ஒன்றாக செயல்பட வடிவமைக்கப்பட்டுள்ளது, இதனால் உங்கள் பிராண்டு தொழில்முறையாகத் தெரிகிறது, சிறந்த வாய்ப்புகளை ஈர்க்கிறது, மேலும் புத்திசாலித்தனமாக இயங்குகிறது.',
    'ai.feature1Title': 'பிராண்டு மற்றும் படைப்பாற்றல் அமைப்புகள்', 'ai.feature1Desc': 'தெளிவான உத்தியுடன் கட்டமைக்கப்பட்ட தொழில்முறை காட்சிகள், பிரச்சாரங்கள், உள்ளடக்கம் மற்றும் பிராண்டு சொத்துக்கள்.',
    'ai.feature2Title': 'சமூக ஊடகம் மற்றும் விளம்பரங்கள்', 'ai.feature2Desc': 'உள்ளடக்க திட்டமிடல், ஆக்கபூர்வமான இடுகைகள், reels, Meta பிரச்சாரங்கள் மற்றும் வாய்ப்பு மையப்படுத்தப்பட்ட விளம்பரம்.',
    'ai.feature3Title': 'இணையதளங்கள் மற்றும் லேண்டிங் பக்கங்கள்', 'ai.feature3Desc': 'நம்பிக்கை, வேகம், விசாரணைகள் மற்றும் வணிக வளர்ச்சிக்காக வடிவமைக்கப்பட்ட நவீன இணையதளங்கள்.',
    'ai.feature4Title': 'POS மற்றும் ERP மேம்பாடு', 'ai.feature4Desc': 'பில்லிங், இருப்பு, உணவகங்கள், சில்லறை விற்பனை, அறிக்கையிடல் மற்றும் செயல்பாடுகளுக்கான தனிப்பயன் அமைப்புகள்.',
    'ai.feature5Title': 'தானியங்குமயமாக்கல் மற்றும் வாய்ப்பு ஓட்டம்', 'ai.feature5Desc': 'WhatsApp, படிவங்கள், விசாரணைகள், பின்தொடர்தல்கள் மற்றும் வாடிக்கையாளர் பயணங்கள் சரியாக இணைக்கப்பட்டுள்ளன.',
    'ai.feature6Title': 'அறிக்கைகள் மற்றும் வளர்ச்சி கண்காணிப்பு', 'ai.feature6Desc': 'மாதாந்திர நுண்ணறிவு, பிரச்சார செயல்திறன், உள்ளடக்க மதிப்பாய்வு மற்றும் மேம்பாட்டு திட்டமிடல்.',
    'diff.title': 'பெரும்பாலான ஏஜென்சிகள் பதிவிடலோடு நிறுத்திவிடுகின்றன. <em>நாங்கள் இல்லை.</em>',
    'diff.item1Title': 'ஒரே குழு, ஆரம்பம் முதல் முடிவு வரை', 'diff.item1Desc': 'ஐந்து பேருடன் சமாளிப்பதற்குப் பதிலாக ஒரே கூட்டாளருடன் பேசுங்கள். உத்தி, படைப்பாற்றல் மற்றும் பொறியியல் ஒரே கூரையின் கீழ்.',
    'diff.item2Title': 'சந்தைப்படுத்தல் செயல்பாடுகளுடன் சந்திக்கிறது', 'diff.item2Desc': 'உங்கள் விளம்பரங்கள், இணையதளம், POS மற்றும் ERP இணைக்கப்பட்டுள்ளன, இதனால் வளர்ச்சி உங்கள் பின்னணி அலுவலகத்தை சீர்குலைக்காது.',
    'diff.item3Title': 'நீங்கள் படிக்கக்கூடிய முடிவுகள்', 'diff.item3Desc': 'தெளிவான மாதாந்திர அறிக்கையிடல். எது வேலை செய்கிறது, உங்கள் பணம் எங்கு செல்கிறது என்பதை நீங்கள் எப்போதும் அறிவீர்கள்.',
    'comparison.eyebrow': 'கேம்ப்ரிட்ஜ் மார்க்கெட்டிங் எதிராக பாரம்பரிய முறை',
    'comparison.title': 'வேலைக்கு அமர்த்துவதா, பாரம்பரிய அவுட்சோர்சிங்கா?<br><em>இரண்டுமே இல்லை.</em>',
    'comparison.requirement': 'தேவை', 'comparison.hiringInHouse': 'உள்நிறுவன ஆட்சேர்ப்பு',
    'comparison.traditionalOutsourcing': 'பாரம்பரிய அவுட்சோர்சிங்', 'comparison.cambm': 'கேம்ப்ரிட்ஜ் மார்க்கெட்டிங்',
    'comparison.strategy': 'மூலோபாயம்', 'comparison.strategyInHouse': 'விலையுயர்ந்த மூத்த திறமை',
    'comparison.strategyOutsourcing': 'வரையறுக்கப்பட்ட பிராண்டு உரிமை', 'comparison.strategyCambm': 'அர்ப்பணிப்புள்ள வளர்ச்சி மூலோபாயாளர்',
    'comparison.creative': 'படைப்பாற்றல்', 'comparison.creativeInHouse': 'முழு படைப்பாற்றல் குழு தேவை',
    'comparison.creativeOutsourcing': 'வெளியீடு அடிப்படையிலானது மட்டும்', 'comparison.creativeCambm': 'திட்டமிடப்பட்ட மாதாந்திர படைப்பாற்றல் இயக்கம்',
    'comparison.management': 'மேலாண்மை', 'comparison.managementInHouse': 'நீங்கள் குழுவை நிர்வகிக்கிறீர்கள்',
    'comparison.managementOutsourcing': 'நீங்கள் ஏஜென்சியை நிர்வகிக்கிறீர்கள்', 'comparison.managementCambm': 'நாங்கள் முழு பணிப்பாய்வையும் நிர்வகிக்கிறோம்',
    'comparison.website': 'இணையதளம்', 'comparison.websiteInHouse': 'தனி செலவு',
    'comparison.websiteOutsourcing': 'தனி விற்பனையாளர்', 'comparison.websiteCambm': 'தனிப்பயன் இணையதளம் + மாதாந்திர மேலாண்மை',
    'comparison.posSoftware': 'POS மென்பொருள்', 'comparison.posSoftwareInHouse': 'தனி அமைப்பு தேவை',
    'comparison.posSoftwareOutsourcing': 'பொதுவாக சேர்க்கப்படவில்லை', 'comparison.posSoftwareCambm': 'தனிப்பயன் POS மென்பொருள் + மேலாண்மை',
    'comparison.erp': 'ERP', 'comparison.erpInHouse': 'பெரும்பாலான பிராண்டுகளுக்கு நடைமுறையில் இல்லை',
    'comparison.erpOutsourcing': 'சேர்க்கப்படவில்லை', 'comparison.erpCambm': 'தனிப்பயன் ERP + POS + இணையதளம்',
    'comparison.scalability': 'விரிவாக்கும் திறன்', 'comparison.scalabilityInHouse': 'மெதுவாகவும் விலை உயர்ந்ததாகவும்',
    'comparison.scalabilityOutsourcing': 'வரையறுக்கப்பட்ட நெகிழ்வுத்தன்மை', 'comparison.scalabilityCambm': 'உங்கள் வணிகத்துடன் விரிவாக்க வடிவமைக்கப்பட்டது',
    'comparison.accountability': 'பொறுப்புக்கூறல்', 'comparison.accountabilityInHouse': 'உள் அழுத்தம்',
    'comparison.accountabilityOutsourcing': 'விற்பனையாளர் சார்பு', 'comparison.accountabilityCambm': 'ஒரே மூலோபாய கூட்டாளர்',
    'pricing.eyebrow': 'விலை நிர்ணயம்', 'pricing.title': '<em>வளர்ச்சிக்காக</em> வடிவமைக்கப்பட்ட வியூகத் திட்டங்கள்.',
    'pricing.desc': 'எளிமையான மாதாந்திர தொகுப்புகள். உங்கள் வணிகம் வளரும்போது எப்போது வேண்டுமானாலும் மேம்படுத்தவும்.',
    'pricing.perMo': '/மாதம்', 'pricing.recommended': 'பரிந்துரைக்கப்படுகிறது', 'pricing.selectPlan': 'திட்டத்தை தேர்ந்தெடு',
    'pricing.gold': 'தனிச்சிறப்பு', 'pricing.platinum': 'பிரதிஷ்டை', 'pricing.diamond': 'உயரடுக்கு',
    'pricing.term.minimum3Month': 'குறைந்தபட்சம் 3 மாத திட்டம்', 'pricing.term.annual': 'வருடாந்திர திட்டம்',
    'pricing.tcApplies': 'விதிமுறைகள் மற்றும் நிபந்தனைகள் பொருந்தும்',
    'pricing.f.dedicatedCreativePlanner': 'அர்ப்பணிப்புள்ள படைப்பாற்றல் திட்டமிடுநர்',
    'pricing.f.completeSocialMgmt': 'முழுமையான சமூக ஊடக மேலாண்மை',
    'pricing.f.monthlyContentPlanning': 'மாதாந்திர உள்ளடக்க திட்டமிடல்',
    'pricing.f.premiumBrandCreatives': 'பிரீமியம் பிராண்டு படைப்புகள்',
    'pricing.f.customWebsite': 'தனிப்பயன் இணையதளம்',
    'pricing.f.monthlyWebsiteMgmt': 'மாதாந்திர இணையதள மேலாண்மை',
    'pricing.f.analyticsReport': 'மாதாந்திர பகுப்பாய்வு அறிக்கை', 'pricing.f.premiumSocialMgmt': 'பிரீமியம் சமூக ஊடக மேலாண்மை',
    'pricing.f.dedicatedContentStrategist': 'அர்ப்பணிப்புள்ள உள்ளடக்க மூலோபாயாளர்',
    'pricing.f.monthlyCampaignPlanning': 'மாதாந்திர பிரச்சார திட்டமிடல்',
    'pricing.f.completeCreativeDirection': 'முழுமையான படைப்பாற்றல் இயக்கம்',
    'pricing.f.customPosWebsite': 'தனிப்பயன் POS மென்பொருள் + இணையதளம்',
    'pricing.f.monthlyPosWebsiteMgmt': 'மாதாந்திர POS மென்பொருள் மற்றும் இணையதள மேலாண்மை',
    'pricing.f.seniorContentStrategist': 'மூத்த உள்ளடக்க மூலோபாயாளர்',
    'pricing.f.fullPremiumSocial': 'முழுமையான பிரீமியம் சமூக ஊடக மேலாண்மை',
    'pricing.f.completeBrandCampaignMgmt': 'முழுமையான பிராண்டு மற்றும் பிரச்சார மேலாண்மை',
    'pricing.f.customErpPosWebsite': 'தனிப்பயன் ERP + POS மென்பொருள் + இணையதளம்',
    'pricing.f.monthlyErpPosWebsiteMgmt': 'மாதாந்திர ERP, POS மென்பொருள் மற்றும் இணையதள மேலாண்மை',
    'pricing.f.advancedGrowthReport': 'மேம்பட்ட மாதாந்திர வளர்ச்சி அறிக்கை',
    'pricing.enterpriseTitle': 'நிறுவனம்', 'pricing.enterpriseDesc': 'பெரிய செயல்பாடுகளுக்கான தனிப்பயன் நோக்கம், அர்ப்பணிப்புள்ள குழு, மற்றும் முழுமையான IT/ERP ஒருங்கிணைப்பு.',
    'pricing.contactUs': 'எங்களை தொடர்பு கொள்ளுங்கள்',
    'testimonials.eyebrow': 'எங்கள் வார்த்தையை மட்டும் நம்ப வேண்டாம்', 'testimonials.title': 'ஆக்கபூர்வமான வெற்றிகள், <em>எங்கள் வாடிக்கையாளர்களே கூறியது</em>',
    'testimonials.quote1': 'எங்கள் சமூக ஊடகங்கள் இறுதியாக சரியாக தெரிகின்றன, வாய்ப்புகளும் உண்மையில் வருகின்றன. கேம்ப்ரிட்ஜ் படப்பிடிப்புகள், விளம்பரங்கள் மற்றும் அறிக்கையிடலை கையாள்கிறது, எனவே நாங்கள் உணவில் கவனம் செலுத்தலாம்.', 'testimonials.role1': 'உணவகம்',
    'testimonials.quote2': 'அவர்கள் எங்கள் இணையதளத்தையும் POS ஐயும் உருவாக்கி, எங்கள் பிரச்சாரங்களை ஒரே குழுவிலிருந்து நடத்துகிறார்கள். எல்லாம் இணைக்கப்பட்டுள்ளது, இறுதியாக ஐந்துக்கு பதிலாக ஒரே கூட்டாளர் எங்களுக்கு உள்ளது.', 'testimonials.role2': 'நகை',
    'testimonials.quote3': 'மாதாந்திர அறிக்கையிடல் தெளிவாகவும் நேர்மையாகவும் உள்ளது. எது வேலை செய்கிறது, பட்ஜெட் எங்கு செல்கிறது என்பதை நாங்கள் எப்போதும் அறிவோம். விற்பனை அதிகரித்துள்ளது, எங்கள் பிராண்டும் அப்படியே.', 'testimonials.role3': 'காலணிகள்',
    'cta.title': 'உங்கள் வணிகத்தை,<br><em>சரியான முறையில் வளர்க்க தயாரா?</em>',
    'cta.desc': 'உங்கள் சந்தைப்படுத்தல், உங்கள் பிராண்டு, மற்றும் உங்கள் வணிகத்தை இயக்கும் தொழில்நுட்பத்திற்கான ஒரே குழு. தொடர்பு கொள்ளுங்கள், நீங்கள் செல்ல விரும்பும் இடத்தைப் பற்றி பேசுவோம்.',
    'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    'locale.popupTitle': 'உங்கள் நாடு மற்றும் மொழியை தேர்ந்தெடுக்கவும்', 'locale.popupDesc': 'உங்கள் பிராந்தியத்திற்கு ஏற்ப விலை மற்றும் மொழியை நாங்கள் தனிப்பயனாக்குவோம்.',
    'locale.countryLabel': 'நாடு', 'locale.languageLabel': 'மொழி', 'locale.confirm': 'தொடரவும்',
    'locale.changeNote': 'இதை எப்போது வேண்டுமானாலும் மெனுவிலிருந்து மாற்றலாம்.',
    'contact.title': 'நிறுவன விற்பனையை தொடர்பு கொள்ளுங்கள்', 'contact.desc': 'உங்கள் வணிகத்தைப் பற்றி எங்களிடம் கூறுங்கள், விரைவில் தொடர்பு கொள்வோம்.',
    'contact.nameLabel': 'முழு பெயர்', 'contact.emailLabel': 'மின்னஞ்சல்', 'contact.companyLabel': 'நிறுவனம்',
    'contact.phoneLabel': 'தொலைபேசி (விருப்பத்தேர்வு)', 'contact.messageLabel': 'செய்தி',
    'contact.send': 'செய்தியை அனுப்பு', 'contact.sending': 'அனுப்பப்படுகிறது...', 'contact.success': 'நன்றி! நாங்கள் விரைவில் தொடர்பு கொள்வோம்.',
    'contact.error': 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும் அல்லது நேரடியாக எங்களுக்கு மின்னஞ்சல் அனுப்பவும்.',
    'popup.planDesc': 'உங்கள் வணிகத்தைப் பற்றி எங்களிடம் கூறுங்கள், அடுத்த படிகளுடன் தொடர்பு கொள்வோம்.', 'popup.planLabel': 'திட்டம்'
  };

  Object.assign(TRANSLATIONS.en, {
    'packages.eyebrow': 'Our Packages',
    'packages.title': 'Choose what your business needs',
    'packages.summary': 'BUILD the infrastructure. GROW the business. CREATE what the audience sees.',
    'packages.tabsAriaLabel': 'Package categories',
    'packages.tab.build': 'BUILD', 'packages.tab.grow': 'GROW', 'packages.tab.create': 'CREATE',
    'packages.tier.starter': 'Starter', 'packages.tier.prestige': 'Prestige', 'packages.tier.elite': 'Elite',
    'packages.recommended': 'Most Recommended', 'packages.bestFor': 'Best for:', 'packages.select': 'Select', 'packages.enquireNow': 'Enquire Now',
    'packages.build.title': 'BUILD',
    'packages.build.subtitle': 'Websites, Software & Business Systems',
    'packages.build.tagline': 'Technology built around your business.',
    'packages.build.starter.name': 'Digital Foundation',
    'packages.build.starter.tagline': 'Get your business online professionally.',
    'packages.build.starter.f1': 'Custom Business Website',
    'packages.build.starter.f2': 'Custom Domain Included',
    'packages.build.starter.f3': 'Hosting Included',
    'packages.build.starter.f4': 'Mobile Responsive Design',
    'packages.build.starter.f5': 'Essential Website Integrations',
    'packages.build.starter.f6': 'Basic SEO Setup',
    'packages.build.starter.f7': 'Website Maintenance',
    'packages.build.starter.best': 'Businesses that need a professional digital presence.',
    'packages.build.prestige.name': 'Business Systems',
    'packages.build.prestige.tagline': 'Connect your website with your operations.',
    'packages.build.prestige.f1': 'Everything in Starter',
    'packages.build.prestige.f2': 'Custom POS Software',
    'packages.build.prestige.f3': 'POS + Website Integration',
    'packages.build.prestige.f4': 'Custom Domain & Hosting Included',
    'packages.build.prestige.f5': 'Business System Integrations',
    'packages.build.prestige.f6': 'Monthly System Management',
    'packages.build.prestige.f7': 'Analytics & Reporting',
    'packages.build.prestige.f8': 'Priority Technical Support',
    'packages.build.prestige.best': 'Growing businesses that need their website and POS working together.',
    'packages.build.elite.name': 'Complete Ecosystem',
    'packages.build.elite.tagline': 'Connect your entire business digitally.',
    'packages.build.elite.f1': 'Everything in Prestige',
    'packages.build.elite.f2': 'Custom ERP Software',
    'packages.build.elite.f3': 'ERP + POS + Website Integration',
    'packages.build.elite.f4': 'Custom Domain & Hosting Included',
    'packages.build.elite.f5': 'Custom Business Workflows',
    'packages.build.elite.f6': 'Advanced System Integrations',
    'packages.build.elite.f7': 'Complete System Management',
    'packages.build.elite.f8': 'Dedicated Technical Support',
    'packages.build.elite.best': 'Established businesses that need a fully connected digital infrastructure.',
    'packages.build.ai.eyebrow': 'AI & Automation',
    'packages.build.ai.title': 'Automate. Integrate. Scale.',
    'packages.build.ai.desc': 'Available as custom solutions based on business requirements.',
    'packages.build.ai.f1Title': 'AI Agents', 'packages.build.ai.f1Body': 'Intelligent agents for business workflows',
    'packages.build.ai.f2Title': 'AI Chatbots', 'packages.build.ai.f2Body': 'Website, WhatsApp and customer support assistants',
    'packages.build.ai.f3Title': 'Sales Automation', 'packages.build.ai.f3Body': 'Lead capture, qualification and follow-ups',
    'packages.build.ai.f4Title': 'Customer Support Automation', 'packages.build.ai.f4Body': 'Automated assistance and support workflows',
    'packages.build.ai.f5Title': 'Marketing Automation', 'packages.build.ai.f5Body': 'CRM, messaging and lead nurturing',
    'packages.build.ai.f6Title': 'Workflow Automation', 'packages.build.ai.f6Body': 'Automate repetitive business processes',
    'packages.build.ai.f7Title': 'CRM & ERP Automation', 'packages.build.ai.f7Body': 'Connect data and internal operations',
    'packages.build.ai.f8Title': 'Custom AI Solutions', 'packages.build.ai.f8Body': 'Purpose-built AI systems for specific requirements',
    'packages.grow.title': 'GROW',
    'packages.grow.subtitle': 'Social Media, Strategy & Performance',
    'packages.grow.tagline': 'Turn attention into measurable growth.',
    'packages.grow.starter.name': 'Social Foundation',
    'packages.grow.starter.tagline': 'Build a consistent digital presence.',
    'packages.grow.starter.f1': 'Social Media Management',
    'packages.grow.starter.f2': 'Monthly Content Planning',
    'packages.grow.starter.f3': 'Social Media Optimization',
    'packages.grow.starter.f4': 'Monthly Growth Plan',
    'packages.grow.starter.f5': 'Basic Brand Direction',
    'packages.grow.starter.f6': 'Monthly Performance Report',
    'packages.grow.starter.note': 'No content creation or campaign planning in Starter.',
    'packages.grow.starter.best': 'Businesses that need their social media professionally planned and managed.',
    'packages.grow.prestige.name': 'Growth Engine',
    'packages.grow.prestige.tagline': 'Turn your presence into growth.',
    'packages.grow.prestige.f1': 'Everything in Starter',
    'packages.grow.prestige.f2': 'Dedicated Content Strategist',
    'packages.grow.prestige.f3': 'Content Creation',
    'packages.grow.prestige.f4': 'Premium Social Media Management',
    'packages.grow.prestige.f5': 'Strategic Content Planning',
    'packages.grow.prestige.f6': 'Creative Direction',
    'packages.grow.prestige.f7': 'Monthly Campaign Planning',
    'packages.grow.prestige.f8': 'Performance Marketing Management',
    'packages.grow.prestige.f9': 'Audience & Competitor Analysis',
    'packages.grow.prestige.f10': 'Detailed Growth Reporting',
    'packages.grow.prestige.best': 'Businesses ready to actively grow their brand, audience and customer acquisition.',
    'packages.grow.elite.name': 'Growth Department',
    'packages.grow.elite.tagline': 'Complete marketing management for ambitious brands.',
    'packages.grow.elite.f1': 'Everything in Prestige',
    'packages.grow.elite.f2': 'Senior Marketing Strategist',
    'packages.grow.elite.f3': 'Complete Brand Management',
    'packages.grow.elite.f4': 'Advanced Campaign Strategy',
    'packages.grow.elite.f5': 'Multi-Channel Performance Marketing',
    'packages.grow.elite.f6': 'Advanced Creative Direction',
    'packages.grow.elite.f7': 'Campaign & Launch Planning',
    'packages.grow.elite.f8': 'Funnel & Conversion Strategy',
    'packages.grow.elite.f9': 'Continuous Campaign Optimization',
    'packages.grow.elite.f10': 'Advanced Performance Reporting',
    'packages.grow.elite.best': 'Brands that need strategy, campaigns and performance managed as one complete growth operation.',
    'packages.create.title': 'CREATE',
    'packages.create.subtitle': 'Your On-Demand Creative Pod',
    'packages.create.tagline': 'Professional creative support without building an in-house team.',
    'packages.create.starter.name': 'Essential Creative',
    'packages.create.starter.tagline': 'Consistent creative support for your brand.',
    'packages.create.starter.f1': 'Up to 12 Creatives / Month',
    'packages.create.starter.f2': 'Social Media Creatives',
    'packages.create.starter.f3': 'Promotional Designs',
    'packages.create.starter.f4': 'Basic Ad Creatives',
    'packages.create.starter.f5': 'Brand-Aligned Designs',
    'packages.create.starter.f6': 'Standard Turnaround',
    'packages.create.starter.f7': 'Monthly Creative Planning',
    'packages.create.starter.best': 'Businesses with consistent, essential design requirements.',
    'packages.create.prestige.name': 'Creative Pro',
    'packages.create.prestige.tagline': 'More creative power. More flexibility.',
    'packages.create.prestige.f1': 'Up to 24 Creative Requests / Month*',
    'packages.create.prestige.f2': 'Social Media Creatives',
    'packages.create.prestige.f3': 'Performance Ad Creatives',
    'packages.create.prestige.f4': 'Carousels & Campaign Creatives',
    'packages.create.prestige.f5': 'Motion Graphics',
    'packages.create.prestige.f6': 'Short-Form Video Editing',
    'packages.create.prestige.f7': 'Dedicated Creative Direction',
    'packages.create.prestige.f8': 'Priority Turnaround',
    'packages.create.prestige.best': 'Growing brands with frequent creative, content and advertising requirements.',
    'packages.create.elite.name': 'Unlimited Creative',
    'packages.create.elite.tagline': 'Your creative department, on demand.',
    'packages.create.elite.f1': 'Unlimited Creative Requests*',
    'packages.create.elite.f2': 'Social Media & Campaign Creatives',
    'packages.create.elite.f3': 'Advanced Motion Graphics',
    'packages.create.elite.f4': 'Premium Video Editing',
    'packages.create.elite.f5': 'Performance Ad Creatives',
    'packages.create.elite.f6': 'Campaign Visual Systems',
    'packages.create.elite.f7': 'Brand & Web Creatives',
    'packages.create.elite.f8': 'Dedicated Creative Lead',
    'packages.create.elite.f9': 'Priority Production',
    'packages.create.elite.f10': 'Advanced Creative Direction',
    'packages.create.elite.best': 'Brands requiring continuous, high-volume creative production.',
    'packages.terms': '*Terms & Conditions Apply',
    'packages.create.ai.eyebrow': 'AI Creative Studio',
    'packages.create.ai.title': 'Beyond Traditional Content',
    'packages.create.ai.desc': 'Premium AI-powered creative production available separately or alongside your CREATE package.',
    'packages.create.ai.f1Title': 'AI UGC Content', 'packages.create.ai.f1Body': 'AI-powered UGC-style advertising',
    'packages.create.ai.f2Title': 'AI Product Photography', 'packages.create.ai.f2Body': 'Premium product visuals without traditional shoots',
    'packages.create.ai.f3Title': 'AI Cinematic Videos', 'packages.create.ai.f3Body': 'High-end cinematic concepts and storytelling',
    'packages.create.ai.f4Title': 'AI Product Videos', 'packages.create.ai.f4Body': 'AI-powered commercials and promotional content',
    'packages.create.ai.f5Title': 'AI Models & Avatars', 'packages.create.ai.f5Body': 'Virtual talent for branded campaigns',
    'packages.create.ai.f6Title': 'AI Image Generation', 'packages.create.ai.f6Body': 'Custom campaign imagery and environments',
    'packages.create.ai.f7Title': 'AI Video Generation', 'packages.create.ai.f7Body': 'Generated scenes, visuals and branded sequences',
    'packages.create.ai.f8Title': 'AI Creative Campaigns', 'packages.create.ai.f8Body': 'Complete AI-first campaign concepts'
  });

  Object.assign(TRANSLATIONS.es, {
    'packages.eyebrow': 'Nuestros paquetes',
    'packages.title': 'Elige lo que necesita tu negocio',
    'packages.summary': 'CONSTRUYE la infraestructura. HAZ CRECER el negocio. CREA lo que ve la audiencia.',
    'packages.tabsAriaLabel': 'Categorías de paquetes',
    'packages.tab.build': 'CONSTRUIR', 'packages.tab.grow': 'CRECER', 'packages.tab.create': 'CREAR',
    'packages.tier.starter': 'Inicial', 'packages.tier.prestige': 'Prestigio', 'packages.tier.elite': 'Élite',
    'packages.recommended': 'Más recomendado', 'packages.bestFor': 'Ideal para:', 'packages.select': 'Seleccionar', 'packages.enquireNow': 'Consultar ahora',
    'packages.build.title': 'CONSTRUIR',
    'packages.build.subtitle': 'Sitios web, software y sistemas empresariales',
    'packages.build.tagline': 'Tecnología construida alrededor de tu negocio.',
    'packages.build.starter.name': 'Base digital',
    'packages.build.starter.tagline': 'Lleva tu negocio a internet de forma profesional.',
    'packages.build.starter.f1': 'Sitio web empresarial personalizado',
    'packages.build.starter.f2': 'Dominio personalizado incluido',
    'packages.build.starter.f3': 'Alojamiento incluido',
    'packages.build.starter.f4': 'Diseño adaptable a móviles',
    'packages.build.starter.f5': 'Integraciones web esenciales',
    'packages.build.starter.f6': 'Configuración SEO básica',
    'packages.build.starter.f7': 'Mantenimiento del sitio web',
    'packages.build.starter.best': 'Negocios que necesitan una presencia digital profesional.',
    'packages.build.prestige.name': 'Sistemas empresariales',
    'packages.build.prestige.tagline': 'Conecta tu sitio web con tus operaciones.',
    'packages.build.prestige.f1': 'Todo lo incluido en Inicial',
    'packages.build.prestige.f2': 'Software POS personalizado',
    'packages.build.prestige.f3': 'Integración de POS y sitio web',
    'packages.build.prestige.f4': 'Dominio y alojamiento personalizados incluidos',
    'packages.build.prestige.f5': 'Integraciones de sistemas empresariales',
    'packages.build.prestige.f6': 'Gestión mensual del sistema',
    'packages.build.prestige.f7': 'Analítica e informes',
    'packages.build.prestige.f8': 'Soporte técnico prioritario',
    'packages.build.prestige.best': 'Negocios en crecimiento que necesitan que su sitio web y POS trabajen juntos.',
    'packages.build.elite.name': 'Ecosistema completo',
    'packages.build.elite.tagline': 'Conecta digitalmente todo tu negocio.',
    'packages.build.elite.f1': 'Todo lo incluido en Prestigio',
    'packages.build.elite.f2': 'Software ERP personalizado',
    'packages.build.elite.f3': 'Integración de ERP, POS y sitio web',
    'packages.build.elite.f4': 'Dominio y alojamiento personalizados incluidos',
    'packages.build.elite.f5': 'Flujos de trabajo empresariales personalizados',
    'packages.build.elite.f6': 'Integraciones avanzadas de sistemas',
    'packages.build.elite.f7': 'Gestión completa del sistema',
    'packages.build.elite.f8': 'Soporte técnico dedicado',
    'packages.build.elite.best': 'Empresas consolidadas que necesitan una infraestructura digital totalmente conectada.',
    'packages.build.ai.eyebrow': 'IA y automatización',
    'packages.build.ai.title': 'Automatiza. Integra. Escala.',
    'packages.build.ai.desc': 'Disponible como soluciones personalizadas según las necesidades del negocio.',
    'packages.build.ai.f1Title': 'Agentes de IA', 'packages.build.ai.f1Body': 'Agentes inteligentes para flujos de trabajo empresariales',
    'packages.build.ai.f2Title': 'Chatbots de IA', 'packages.build.ai.f2Body': 'Asistentes para sitios web, WhatsApp y atención al cliente',
    'packages.build.ai.f3Title': 'Automatización de ventas', 'packages.build.ai.f3Body': 'Captación, calificación y seguimiento de clientes potenciales',
    'packages.build.ai.f4Title': 'Automatización de atención al cliente', 'packages.build.ai.f4Body': 'Asistencia automatizada y flujos de soporte',
    'packages.build.ai.f5Title': 'Automatización de marketing', 'packages.build.ai.f5Body': 'CRM, mensajería y nutrición de clientes potenciales',
    'packages.build.ai.f6Title': 'Automatización de flujos', 'packages.build.ai.f6Body': 'Automatiza procesos empresariales repetitivos',
    'packages.build.ai.f7Title': 'Automatización de CRM y ERP', 'packages.build.ai.f7Body': 'Conecta datos y operaciones internas',
    'packages.build.ai.f8Title': 'Soluciones de IA personalizadas', 'packages.build.ai.f8Body': 'Sistemas de IA creados para necesidades específicas',
    'packages.grow.title': 'CRECER',
    'packages.grow.subtitle': 'Redes sociales, estrategia y rendimiento',
    'packages.grow.tagline': 'Convierte la atención en crecimiento medible.',
    'packages.grow.starter.name': 'Base social',
    'packages.grow.starter.tagline': 'Construye una presencia digital constante.',
    'packages.grow.starter.f1': 'Gestión de redes sociales',
    'packages.grow.starter.f2': 'Planificación mensual de contenido',
    'packages.grow.starter.f3': 'Optimización de redes sociales',
    'packages.grow.starter.f4': 'Plan mensual de crecimiento',
    'packages.grow.starter.f5': 'Dirección básica de marca',
    'packages.grow.starter.f6': 'Informe mensual de rendimiento',
    'packages.grow.starter.note': 'El paquete Inicial no incluye creación de contenido ni planificación de campañas.',
    'packages.grow.starter.best': 'Negocios que necesitan que sus redes sociales se planifiquen y gestionen profesionalmente.',
    'packages.grow.prestige.name': 'Motor de crecimiento',
    'packages.grow.prestige.tagline': 'Convierte tu presencia en crecimiento.',
    'packages.grow.prestige.f1': 'Todo lo incluido en Inicial',
    'packages.grow.prestige.f2': 'Estratega de contenido dedicado',
    'packages.grow.prestige.f3': 'Creación de contenido',
    'packages.grow.prestige.f4': 'Gestión premium de redes sociales',
    'packages.grow.prestige.f5': 'Planificación estratégica de contenido',
    'packages.grow.prestige.f6': 'Dirección creativa',
    'packages.grow.prestige.f7': 'Planificación mensual de campañas',
    'packages.grow.prestige.f8': 'Gestión de marketing de rendimiento',
    'packages.grow.prestige.f9': 'Análisis de audiencia y competencia',
    'packages.grow.prestige.f10': 'Informes detallados de crecimiento',
    'packages.grow.prestige.best': 'Negocios preparados para hacer crecer activamente su marca, audiencia y captación de clientes.',
    'packages.grow.elite.name': 'Departamento de crecimiento',
    'packages.grow.elite.tagline': 'Gestión integral de marketing para marcas ambiciosas.',
    'packages.grow.elite.f1': 'Todo lo incluido en Prestigio',
    'packages.grow.elite.f2': 'Estratega de marketing sénior',
    'packages.grow.elite.f3': 'Gestión completa de marca',
    'packages.grow.elite.f4': 'Estrategia avanzada de campañas',
    'packages.grow.elite.f5': 'Marketing de rendimiento multicanal',
    'packages.grow.elite.f6': 'Dirección creativa avanzada',
    'packages.grow.elite.f7': 'Planificación de campañas y lanzamientos',
    'packages.grow.elite.f8': 'Estrategia de embudos y conversión',
    'packages.grow.elite.f9': 'Optimización continua de campañas',
    'packages.grow.elite.f10': 'Informes avanzados de rendimiento',
    'packages.grow.elite.best': 'Marcas que necesitan gestionar estrategia, campañas y rendimiento como una sola operación de crecimiento.',
    'packages.create.title': 'CREAR',
    'packages.create.subtitle': 'Tu equipo creativo bajo demanda',
    'packages.create.tagline': 'Apoyo creativo profesional sin crear un equipo interno.',
    'packages.create.starter.name': 'Creatividad esencial',
    'packages.create.starter.tagline': 'Apoyo creativo constante para tu marca.',
    'packages.create.starter.f1': 'Hasta 12 piezas creativas al mes',
    'packages.create.starter.f2': 'Creatividades para redes sociales',
    'packages.create.starter.f3': 'Diseños promocionales',
    'packages.create.starter.f4': 'Creatividades publicitarias básicas',
    'packages.create.starter.f5': 'Diseños alineados con la marca',
    'packages.create.starter.f6': 'Plazo de entrega estándar',
    'packages.create.starter.f7': 'Planificación creativa mensual',
    'packages.create.starter.best': 'Negocios con necesidades de diseño esenciales y constantes.',
    'packages.create.prestige.name': 'Creativo Pro',
    'packages.create.prestige.tagline': 'Más potencia creativa. Más flexibilidad.',
    'packages.create.prestige.f1': 'Hasta 24 solicitudes creativas al mes*',
    'packages.create.prestige.f2': 'Creatividades para redes sociales',
    'packages.create.prestige.f3': 'Creatividades publicitarias de rendimiento',
    'packages.create.prestige.f4': 'Carruseles y creatividades de campaña',
    'packages.create.prestige.f5': 'Gráficos en movimiento',
    'packages.create.prestige.f6': 'Edición de vídeo de formato corto',
    'packages.create.prestige.f7': 'Dirección creativa dedicada',
    'packages.create.prestige.f8': 'Entrega prioritaria',
    'packages.create.prestige.best': 'Marcas en crecimiento con necesidades frecuentes de creatividad, contenido y publicidad.',
    'packages.create.elite.name': 'Creatividad ilimitada',
    'packages.create.elite.tagline': 'Tu departamento creativo, bajo demanda.',
    'packages.create.elite.f1': 'Solicitudes creativas ilimitadas*',
    'packages.create.elite.f2': 'Creatividades para redes y campañas',
    'packages.create.elite.f3': 'Gráficos en movimiento avanzados',
    'packages.create.elite.f4': 'Edición de vídeo premium',
    'packages.create.elite.f5': 'Creatividades publicitarias de rendimiento',
    'packages.create.elite.f6': 'Sistemas visuales de campaña',
    'packages.create.elite.f7': 'Creatividades de marca y web',
    'packages.create.elite.f8': 'Líder creativo dedicado',
    'packages.create.elite.f9': 'Producción prioritaria',
    'packages.create.elite.f10': 'Dirección creativa avanzada',
    'packages.create.elite.best': 'Marcas que requieren producción creativa continua y de gran volumen.',
    'packages.terms': '*Aplican términos y condiciones',
    'packages.create.ai.eyebrow': 'Estudio creativo de IA',
    'packages.create.ai.title': 'Más allá del contenido tradicional',
    'packages.create.ai.desc': 'Producción creativa premium con IA, disponible por separado o junto con tu paquete CREAR.',
    'packages.create.ai.f1Title': 'Contenido UGC con IA', 'packages.create.ai.f1Body': 'Publicidad estilo UGC impulsada por IA',
    'packages.create.ai.f2Title': 'Fotografía de producto con IA', 'packages.create.ai.f2Body': 'Imágenes premium de producto sin sesiones tradicionales',
    'packages.create.ai.f3Title': 'Vídeos cinematográficos con IA', 'packages.create.ai.f3Body': 'Conceptos cinematográficos y narrativas de alta gama',
    'packages.create.ai.f4Title': 'Vídeos de producto con IA', 'packages.create.ai.f4Body': 'Anuncios y contenido promocional impulsados por IA',
    'packages.create.ai.f5Title': 'Modelos y avatares de IA', 'packages.create.ai.f5Body': 'Talento virtual para campañas de marca',
    'packages.create.ai.f6Title': 'Generación de imágenes con IA', 'packages.create.ai.f6Body': 'Imágenes y entornos personalizados para campañas',
    'packages.create.ai.f7Title': 'Generación de vídeo con IA', 'packages.create.ai.f7Body': 'Escenas, imágenes y secuencias de marca generadas',
    'packages.create.ai.f8Title': 'Campañas creativas con IA', 'packages.create.ai.f8Body': 'Conceptos completos de campaña centrados en IA'
  });

  Object.assign(TRANSLATIONS.ar, {
    'packages.eyebrow': 'باقاتنا',
    'packages.title': 'اختر ما يحتاجه عملك',
    'packages.summary': 'ابنِ البنية التحتية. نمِّ أعمالك. ابتكر ما يراه جمهورك.',
    'packages.tabsAriaLabel': 'فئات الباقات',
    'packages.tab.build': 'البناء', 'packages.tab.grow': 'النمو', 'packages.tab.create': 'الإبداع',
    'packages.tier.starter': 'البداية', 'packages.tier.prestige': 'بريستيج', 'packages.tier.elite': 'إيليت',
    'packages.recommended': 'الأكثر توصية', 'packages.bestFor': 'الأنسب لـ:', 'packages.select': 'اختر', 'packages.enquireNow': 'استفسر الآن',
    'packages.build.title': 'البناء',
    'packages.build.subtitle': 'المواقع والبرمجيات وأنظمة الأعمال',
    'packages.build.tagline': 'تقنية مصممة حول احتياجات عملك.',
    'packages.build.starter.name': 'الأساس الرقمي',
    'packages.build.starter.tagline': 'أطلق حضور عملك على الإنترنت باحترافية.',
    'packages.build.starter.f1': 'موقع أعمال مخصص',
    'packages.build.starter.f2': 'نطاق مخصص مشمول',
    'packages.build.starter.f3': 'استضافة مشمولة',
    'packages.build.starter.f4': 'تصميم متجاوب مع الجوال',
    'packages.build.starter.f5': 'تكاملات أساسية للموقع',
    'packages.build.starter.f6': 'إعداد أساسي لمحركات البحث',
    'packages.build.starter.f7': 'صيانة الموقع',
    'packages.build.starter.best': 'الأعمال التي تحتاج إلى حضور رقمي احترافي.',
    'packages.build.prestige.name': 'أنظمة الأعمال',
    'packages.build.prestige.tagline': 'اربط موقعك بعملياتك التشغيلية.',
    'packages.build.prestige.f1': 'كل ما تتضمنه باقة البداية',
    'packages.build.prestige.f2': 'نظام نقاط بيع مخصص',
    'packages.build.prestige.f3': 'تكامل نظام نقاط البيع مع الموقع',
    'packages.build.prestige.f4': 'نطاق واستضافة مخصصان مشمولان',
    'packages.build.prestige.f5': 'تكاملات أنظمة الأعمال',
    'packages.build.prestige.f6': 'إدارة شهرية للنظام',
    'packages.build.prestige.f7': 'التحليلات والتقارير',
    'packages.build.prestige.f8': 'دعم تقني ذو أولوية',
    'packages.build.prestige.best': 'الأعمال النامية التي تحتاج إلى عمل الموقع ونظام نقاط البيع معًا.',
    'packages.build.elite.name': 'المنظومة المتكاملة',
    'packages.build.elite.tagline': 'اربط أعمالك بالكامل رقميًا.',
    'packages.build.elite.f1': 'كل ما تتضمنه باقة بريستيج',
    'packages.build.elite.f2': 'نظام ERP مخصص',
    'packages.build.elite.f3': 'تكامل ERP ونقاط البيع والموقع',
    'packages.build.elite.f4': 'نطاق واستضافة مخصصان مشمولان',
    'packages.build.elite.f5': 'مسارات عمل مخصصة للأعمال',
    'packages.build.elite.f6': 'تكاملات متقدمة للأنظمة',
    'packages.build.elite.f7': 'إدارة كاملة للنظام',
    'packages.build.elite.f8': 'دعم تقني مخصص',
    'packages.build.elite.best': 'الأعمال الراسخة التي تحتاج إلى بنية رقمية مترابطة بالكامل.',
    'packages.build.ai.eyebrow': 'الذكاء الاصطناعي والأتمتة',
    'packages.build.ai.title': 'أتمت. ادمج. توسّع.',
    'packages.build.ai.desc': 'حلول مخصصة متاحة وفق متطلبات العمل.',
    'packages.build.ai.f1Title': 'وكلاء الذكاء الاصطناعي', 'packages.build.ai.f1Body': 'وكلاء أذكياء لمسارات عمل الشركات',
    'packages.build.ai.f2Title': 'روبوتات المحادثة الذكية', 'packages.build.ai.f2Body': 'مساعدون للمواقع وواتساب وخدمة العملاء',
    'packages.build.ai.f3Title': 'أتمتة المبيعات', 'packages.build.ai.f3Body': 'جمع العملاء المحتملين وتأهيلهم ومتابعتهم',
    'packages.build.ai.f4Title': 'أتمتة دعم العملاء', 'packages.build.ai.f4Body': 'مساعدة آلية ومسارات عمل للدعم',
    'packages.build.ai.f5Title': 'أتمتة التسويق', 'packages.build.ai.f5Body': 'إدارة علاقات العملاء والرسائل ورعاية العملاء المحتملين',
    'packages.build.ai.f6Title': 'أتمتة سير العمل', 'packages.build.ai.f6Body': 'أتمتة عمليات الأعمال المتكررة',
    'packages.build.ai.f7Title': 'أتمتة CRM وERP', 'packages.build.ai.f7Body': 'ربط البيانات والعمليات الداخلية',
    'packages.build.ai.f8Title': 'حلول ذكاء اصطناعي مخصصة', 'packages.build.ai.f8Body': 'أنظمة ذكاء اصطناعي مصممة لمتطلبات محددة',
    'packages.grow.title': 'النمو',
    'packages.grow.subtitle': 'وسائل التواصل والاستراتيجية والأداء',
    'packages.grow.tagline': 'حوّل الانتباه إلى نمو قابل للقياس.',
    'packages.grow.starter.name': 'الأساس الاجتماعي',
    'packages.grow.starter.tagline': 'ابنِ حضورًا رقميًا متسقًا.',
    'packages.grow.starter.f1': 'إدارة وسائل التواصل الاجتماعي',
    'packages.grow.starter.f2': 'تخطيط المحتوى الشهري',
    'packages.grow.starter.f3': 'تحسين وسائل التواصل الاجتماعي',
    'packages.grow.starter.f4': 'خطة نمو شهرية',
    'packages.grow.starter.f5': 'توجيه أساسي للعلامة التجارية',
    'packages.grow.starter.f6': 'تقرير أداء شهري',
    'packages.grow.starter.note': 'لا تشمل باقة البداية إنشاء المحتوى أو تخطيط الحملات.',
    'packages.grow.starter.best': 'الأعمال التي تحتاج إلى تخطيط وإدارة احترافية لوسائل التواصل.',
    'packages.grow.prestige.name': 'محرك النمو',
    'packages.grow.prestige.tagline': 'حوّل حضورك إلى نمو.',
    'packages.grow.prestige.f1': 'كل ما تتضمنه باقة البداية',
    'packages.grow.prestige.f2': 'استراتيجي محتوى مخصص',
    'packages.grow.prestige.f3': 'إنشاء المحتوى',
    'packages.grow.prestige.f4': 'إدارة متقدمة لوسائل التواصل',
    'packages.grow.prestige.f5': 'تخطيط استراتيجي للمحتوى',
    'packages.grow.prestige.f6': 'توجيه إبداعي',
    'packages.grow.prestige.f7': 'تخطيط شهري للحملات',
    'packages.grow.prestige.f8': 'إدارة تسويق الأداء',
    'packages.grow.prestige.f9': 'تحليل الجمهور والمنافسين',
    'packages.grow.prestige.f10': 'تقارير نمو تفصيلية',
    'packages.grow.prestige.best': 'الأعمال المستعدة لتنمية علامتها وجمهورها واكتساب العملاء بفاعلية.',
    'packages.grow.elite.name': 'قسم النمو',
    'packages.grow.elite.tagline': 'إدارة تسويقية كاملة للعلامات الطموحة.',
    'packages.grow.elite.f1': 'كل ما تتضمنه باقة بريستيج',
    'packages.grow.elite.f2': 'استراتيجي تسويق أول',
    'packages.grow.elite.f3': 'إدارة كاملة للعلامة التجارية',
    'packages.grow.elite.f4': 'استراتيجية حملات متقدمة',
    'packages.grow.elite.f5': 'تسويق أداء متعدد القنوات',
    'packages.grow.elite.f6': 'توجيه إبداعي متقدم',
    'packages.grow.elite.f7': 'تخطيط الحملات والإطلاقات',
    'packages.grow.elite.f8': 'استراتيجية مسار التحويل',
    'packages.grow.elite.f9': 'تحسين مستمر للحملات',
    'packages.grow.elite.f10': 'تقارير أداء متقدمة',
    'packages.grow.elite.best': 'العلامات التي تحتاج إلى إدارة الاستراتيجية والحملات والأداء كعملية نمو واحدة متكاملة.',
    'packages.create.title': 'الإبداع',
    'packages.create.subtitle': 'فريقك الإبداعي عند الطلب',
    'packages.create.tagline': 'دعم إبداعي احترافي دون الحاجة إلى بناء فريق داخلي.',
    'packages.create.starter.name': 'الإبداع الأساسي',
    'packages.create.starter.tagline': 'دعم إبداعي مستمر لعلامتك.',
    'packages.create.starter.f1': 'حتى 12 تصميمًا إبداعيًا شهريًا',
    'packages.create.starter.f2': 'تصاميم لوسائل التواصل',
    'packages.create.starter.f3': 'تصاميم ترويجية',
    'packages.create.starter.f4': 'تصاميم إعلانية أساسية',
    'packages.create.starter.f5': 'تصاميم متوافقة مع العلامة',
    'packages.create.starter.f6': 'مدة تنفيذ قياسية',
    'packages.create.starter.f7': 'تخطيط إبداعي شهري',
    'packages.create.starter.best': 'الأعمال ذات الاحتياجات التصميمية الأساسية والمستمرة.',
    'packages.create.prestige.name': 'الإبداع الاحترافي',
    'packages.create.prestige.tagline': 'قوة إبداعية أكبر. مرونة أكبر.',
    'packages.create.prestige.f1': 'حتى 24 طلبًا إبداعيًا شهريًا*',
    'packages.create.prestige.f2': 'تصاميم لوسائل التواصل',
    'packages.create.prestige.f3': 'تصاميم إعلانية للأداء',
    'packages.create.prestige.f4': 'منشورات دوارة وتصاميم حملات',
    'packages.create.prestige.f5': 'رسوم متحركة',
    'packages.create.prestige.f6': 'تحرير فيديو قصير',
    'packages.create.prestige.f7': 'توجيه إبداعي مخصص',
    'packages.create.prestige.f8': 'تنفيذ ذو أولوية',
    'packages.create.prestige.best': 'العلامات النامية ذات الاحتياجات المتكررة للتصميم والمحتوى والإعلان.',
    'packages.create.elite.name': 'إبداع بلا حدود',
    'packages.create.elite.tagline': 'قسمك الإبداعي عند الطلب.',
    'packages.create.elite.f1': 'طلبات إبداعية غير محدودة*',
    'packages.create.elite.f2': 'تصاميم التواصل والحملات',
    'packages.create.elite.f3': 'رسوم متحركة متقدمة',
    'packages.create.elite.f4': 'تحرير فيديو متميز',
    'packages.create.elite.f5': 'تصاميم إعلانية للأداء',
    'packages.create.elite.f6': 'أنظمة بصرية للحملات',
    'packages.create.elite.f7': 'تصاميم العلامة والمواقع',
    'packages.create.elite.f8': 'قائد إبداعي مخصص',
    'packages.create.elite.f9': 'إنتاج ذو أولوية',
    'packages.create.elite.f10': 'توجيه إبداعي متقدم',
    'packages.create.elite.best': 'العلامات التي تحتاج إلى إنتاج إبداعي مستمر وكثيف.',
    'packages.terms': '*تطبق الشروط والأحكام',
    'packages.create.ai.eyebrow': 'استوديو الإبداع بالذكاء الاصطناعي',
    'packages.create.ai.title': 'ما وراء المحتوى التقليدي',
    'packages.create.ai.desc': 'إنتاج إبداعي متميز بالذكاء الاصطناعي، متاح منفصلًا أو مع باقة الإبداع.',
    'packages.create.ai.f1Title': 'محتوى UGC بالذكاء الاصطناعي', 'packages.create.ai.f1Body': 'إعلانات بأسلوب المحتوى الذي ينشئه المستخدم مدعومة بالذكاء الاصطناعي',
    'packages.create.ai.f2Title': 'تصوير المنتجات بالذكاء الاصطناعي', 'packages.create.ai.f2Body': 'صور منتجات متميزة دون جلسات تصوير تقليدية',
    'packages.create.ai.f3Title': 'فيديوهات سينمائية بالذكاء الاصطناعي', 'packages.create.ai.f3Body': 'مفاهيم سينمائية وسرد قصصي عالي الجودة',
    'packages.create.ai.f4Title': 'فيديوهات المنتجات بالذكاء الاصطناعي', 'packages.create.ai.f4Body': 'إعلانات ومحتوى ترويجي مدعوم بالذكاء الاصطناعي',
    'packages.create.ai.f5Title': 'نماذج وشخصيات افتراضية', 'packages.create.ai.f5Body': 'مواهب افتراضية للحملات التجارية',
    'packages.create.ai.f6Title': 'توليد الصور بالذكاء الاصطناعي', 'packages.create.ai.f6Body': 'صور وبيئات مخصصة للحملات',
    'packages.create.ai.f7Title': 'توليد الفيديو بالذكاء الاصطناعي', 'packages.create.ai.f7Body': 'مشاهد ومرئيات وتسلسلات تجارية مولدة',
    'packages.create.ai.f8Title': 'حملات إبداعية بالذكاء الاصطناعي', 'packages.create.ai.f8Body': 'مفاهيم حملات متكاملة قائمة على الذكاء الاصطناعي'
  });

  Object.assign(TRANSLATIONS.si, {
    'packages.eyebrow': 'අපගේ පැකේජ',
    'packages.title': 'ඔබේ ව්‍යාපාරයට අවශ්‍ය දේ තෝරන්න',
    'packages.summary': 'යටිතල පහසුකම් ගොඩනඟන්න. ව්‍යාපාරය වර්ධනය කරන්න. ප්‍රේක්ෂකයා දකින දේ නිර්මාණය කරන්න.',
    'packages.tabsAriaLabel': 'පැකේජ කාණ්ඩ',
    'packages.tab.build': 'ගොඩනඟන්න', 'packages.tab.grow': 'වර්ධනය', 'packages.tab.create': 'නිර්මාණය',
    'packages.tier.starter': 'ආරම්භක', 'packages.tier.prestige': 'ප්‍රෙස්ටීජ්', 'packages.tier.elite': 'එලීට්',
    'packages.recommended': 'වැඩිම නිර්දේශිත', 'packages.bestFor': 'වඩාත් සුදුසු:', 'packages.select': 'තෝරන්න', 'packages.enquireNow': 'දැන් විමසන්න',
    'packages.build.title': 'ගොඩනඟන්න',
    'packages.build.subtitle': 'වෙබ් අඩවි, මෘදුකාංග සහ ව්‍යාපාර පද්ධති',
    'packages.build.tagline': 'ඔබේ ව්‍යාපාරය වටා ගොඩනැගුණු තාක්ෂණය.',
    'packages.build.starter.name': 'ඩිජිටල් පදනම',
    'packages.build.starter.tagline': 'ඔබේ ව්‍යාපාරය වෘත්තීයමය ලෙස අන්තර්ජාලයට ගෙන එන්න.',
    'packages.build.starter.f1': 'අභිරුචි ව්‍යාපාරික වෙබ් අඩවිය',
    'packages.build.starter.f2': 'අභිරුචි ඩොමේනය ඇතුළත්',
    'packages.build.starter.f3': 'හොස්ටිං ඇතුළත්',
    'packages.build.starter.f4': 'ජංගම උපාංගවලට ගැළපෙන නිර්මාණය',
    'packages.build.starter.f5': 'අත්‍යවශ්‍ය වෙබ් අඩවි ඒකාබද්ධතා',
    'packages.build.starter.f6': 'මූලික SEO සැකසුම',
    'packages.build.starter.f7': 'වෙබ් අඩවි නඩත්තුව',
    'packages.build.starter.best': 'වෘත්තීයමය ඩිජිටල් පැවැත්මක් අවශ්‍ය ව්‍යාපාර සඳහා.',
    'packages.build.prestige.name': 'ව්‍යාපාර පද්ධති',
    'packages.build.prestige.tagline': 'ඔබේ වෙබ් අඩවිය මෙහෙයුම් සමඟ සම්බන්ධ කරන්න.',
    'packages.build.prestige.f1': 'ආරම්භක පැකේජයේ සියල්ල',
    'packages.build.prestige.f2': 'අභිරුචි POS මෘදුකාංගය',
    'packages.build.prestige.f3': 'POS සහ වෙබ් අඩවි ඒකාබද්ධතාව',
    'packages.build.prestige.f4': 'අභිරුචි ඩොමේනය සහ හොස්ටිං ඇතුළත්',
    'packages.build.prestige.f5': 'ව්‍යාපාර පද්ධති ඒකාබද්ධතා',
    'packages.build.prestige.f6': 'මාසික පද්ධති කළමනාකරණය',
    'packages.build.prestige.f7': 'විශ්ලේෂණ සහ වාර්තාකරණය',
    'packages.build.prestige.f8': 'ප්‍රමුඛතා තාක්ෂණික සහාය',
    'packages.build.prestige.best': 'වෙබ් අඩවිය සහ POS එකට ක්‍රියා කළ යුතු වර්ධනය වන ව්‍යාපාර සඳහා.',
    'packages.build.elite.name': 'සම්පූර්ණ පරිසර පද්ධතිය',
    'packages.build.elite.tagline': 'ඔබේ මුළු ව්‍යාපාරයම ඩිජිටල් ලෙස සම්බන්ධ කරන්න.',
    'packages.build.elite.f1': 'ප්‍රෙස්ටීජ් පැකේජයේ සියල්ල',
    'packages.build.elite.f2': 'අභිරුචි ERP මෘදුකාංගය',
    'packages.build.elite.f3': 'ERP, POS සහ වෙබ් අඩවි ඒකාබද්ධතාව',
    'packages.build.elite.f4': 'අභිරුචි ඩොමේනය සහ හොස්ටිං ඇතුළත්',
    'packages.build.elite.f5': 'අභිරුචි ව්‍යාපාරික වැඩ ප්‍රවාහ',
    'packages.build.elite.f6': 'උසස් පද්ධති ඒකාබද්ධතා',
    'packages.build.elite.f7': 'සම්පූර්ණ පද්ධති කළමනාකරණය',
    'packages.build.elite.f8': 'කැපවූ තාක්ෂණික සහාය',
    'packages.build.elite.best': 'සම්පූර්ණයෙන් සම්බන්ධ වූ ඩිජිටල් යටිතල පහසුකමක් අවශ්‍ය ස්ථාපිත ව්‍යාපාර සඳහා.',
    'packages.build.ai.eyebrow': 'AI සහ ස්වයංක්‍රීයකරණය',
    'packages.build.ai.title': 'ස්වයංක්‍රීය කරන්න. ඒකාබද්ධ කරන්න. පුළුල් කරන්න.',
    'packages.build.ai.desc': 'ව්‍යාපාර අවශ්‍යතා අනුව අභිරුචි විසඳුම් ලෙස ලබා ගත හැක.',
    'packages.build.ai.f1Title': 'AI නියෝජිතයන්', 'packages.build.ai.f1Body': 'ව්‍යාපාරික වැඩ ප්‍රවාහ සඳහා බුද්ධිමත් නියෝජිතයන්',
    'packages.build.ai.f2Title': 'AI චැට්බොට්', 'packages.build.ai.f2Body': 'වෙබ් අඩවි, WhatsApp සහ පාරිභෝගික සහාය සහායකයන්',
    'packages.build.ai.f3Title': 'විකුණුම් ස්වයංක්‍රීයකරණය', 'packages.build.ai.f3Body': 'ලීඩ් එකතු කිරීම, සුදුසුකම් තීරණය සහ පසු විපරම්',
    'packages.build.ai.f4Title': 'පාරිභෝගික සහාය ස්වයංක්‍රීයකරණය', 'packages.build.ai.f4Body': 'ස්වයංක්‍රීය සහාය සහ උපකාරක වැඩ ප්‍රවාහ',
    'packages.build.ai.f5Title': 'අලෙවිකරණ ස්වයංක්‍රීයකරණය', 'packages.build.ai.f5Body': 'CRM, පණිවිඩ සහ ලීඩ් පෝෂණය',
    'packages.build.ai.f6Title': 'වැඩ ප්‍රවාහ ස්වයංක්‍රීයකරණය', 'packages.build.ai.f6Body': 'නැවත නැවත සිදුවන ව්‍යාපාර ක්‍රියාවලි ස්වයංක්‍රීය කිරීම',
    'packages.build.ai.f7Title': 'CRM සහ ERP ස්වයංක්‍රීයකරණය', 'packages.build.ai.f7Body': 'දත්ත සහ අභ්‍යන්තර මෙහෙයුම් සම්බන්ධ කිරීම',
    'packages.build.ai.f8Title': 'අභිරුචි AI විසඳුම්', 'packages.build.ai.f8Body': 'විශේෂ අවශ්‍යතා සඳහා නිර්මාණය කළ AI පද්ධති',
    'packages.grow.title': 'වර්ධනය',
    'packages.grow.subtitle': 'සමාජ මාධ්‍ය, උපායමාර්ග සහ කාර්යසාධනය',
    'packages.grow.tagline': 'අවධානය මැනිය හැකි වර්ධනයක් බවට පත් කරන්න.',
    'packages.grow.starter.name': 'සමාජ පදනම',
    'packages.grow.starter.tagline': 'ස්ථාවර ඩිජිටල් පැවැත්මක් ගොඩනඟන්න.',
    'packages.grow.starter.f1': 'සමාජ මාධ්‍ය කළමනාකරණය',
    'packages.grow.starter.f2': 'මාසික අන්තර්ගත සැලසුම්කරණය',
    'packages.grow.starter.f3': 'සමාජ මාධ්‍ය ප්‍රශස්තකරණය',
    'packages.grow.starter.f4': 'මාසික වර්ධන සැලැස්ම',
    'packages.grow.starter.f5': 'මූලික සන්නාම මගපෙන්වීම',
    'packages.grow.starter.f6': 'මාසික කාර්යසාධන වාර්තාව',
    'packages.grow.starter.note': 'ආරම්භක පැකේජයට අන්තර්ගත නිර්මාණය හෝ ප්‍රචාරණ සැලසුම්කරණය ඇතුළත් නොවේ.',
    'packages.grow.starter.best': 'සමාජ මාධ්‍ය වෘත්තීයමය ලෙස සැලසුම් කර කළමනාකරණය අවශ්‍ය ව්‍යාපාර සඳහා.',
    'packages.grow.prestige.name': 'වර්ධන එන්ජිම',
    'packages.grow.prestige.tagline': 'ඔබේ පැවැත්ම වර්ධනයක් බවට පත් කරන්න.',
    'packages.grow.prestige.f1': 'ආරම්භක පැකේජයේ සියල්ල',
    'packages.grow.prestige.f2': 'කැපවූ අන්තර්ගත උපායමාර්ගඥයෙක්',
    'packages.grow.prestige.f3': 'අන්තර්ගත නිර්මාණය',
    'packages.grow.prestige.f4': 'ප්‍රීමියම් සමාජ මාධ්‍ය කළමනාකරණය',
    'packages.grow.prestige.f5': 'උපායමාර්ගික අන්තර්ගත සැලසුම්කරණය',
    'packages.grow.prestige.f6': 'නිර්මාණාත්මක මගපෙන්වීම',
    'packages.grow.prestige.f7': 'මාසික ප්‍රචාරණ සැලසුම්කරණය',
    'packages.grow.prestige.f8': 'කාර්යසාධන අලෙවිකරණ කළමනාකරණය',
    'packages.grow.prestige.f9': 'ප්‍රේක්ෂක සහ තරඟකරු විශ්ලේෂණය',
    'packages.grow.prestige.f10': 'විස්තරාත්මක වර්ධන වාර්තා',
    'packages.grow.prestige.best': 'සන්නාමය, ප්‍රේක්ෂකයා සහ පාරිභෝගික අත්පත් කර ගැනීම ක්‍රියාශීලීව වර්ධනය කිරීමට සූදානම් ව්‍යාපාර සඳහා.',
    'packages.grow.elite.name': 'වර්ධන දෙපාර්තමේන්තුව',
    'packages.grow.elite.tagline': 'අභිලාෂී සන්නාම සඳහා සම්පූර්ණ අලෙවිකරණ කළමනාකරණය.',
    'packages.grow.elite.f1': 'ප්‍රෙස්ටීජ් පැකේජයේ සියල්ල',
    'packages.grow.elite.f2': 'ජ්‍යෙෂ්ඨ අලෙවිකරණ උපායමාර්ගඥයෙක්',
    'packages.grow.elite.f3': 'සම්පූර්ණ සන්නාම කළමනාකරණය',
    'packages.grow.elite.f4': 'උසස් ප්‍රචාරණ උපායමාර්ග',
    'packages.grow.elite.f5': 'බහු නාලිකා කාර්යසාධන අලෙවිකරණය',
    'packages.grow.elite.f6': 'උසස් නිර්මාණාත්මක මගපෙන්වීම',
    'packages.grow.elite.f7': 'ප්‍රචාරණ සහ දියත් කිරීමේ සැලසුම්',
    'packages.grow.elite.f8': 'ෆනල් සහ පරිවර්තන උපායමාර්ග',
    'packages.grow.elite.f9': 'අඛණ්ඩ ප්‍රචාරණ ප්‍රශස්තකරණය',
    'packages.grow.elite.f10': 'උසස් කාර්යසාධන වාර්තා',
    'packages.grow.elite.best': 'උපායමාර්ග, ප්‍රචාරණ සහ කාර්යසාධනය එක් සම්පූර්ණ වර්ධන මෙහෙයුමක් ලෙස කළමනාකරණය අවශ්‍ය සන්නාම සඳහා.',
    'packages.create.title': 'නිර්මාණය',
    'packages.create.subtitle': 'ඔබේ ඉල්ලුමට සූදානම් නිර්මාණ කණ්ඩායම',
    'packages.create.tagline': 'අභ්‍යන්තර කණ්ඩායමක් ගොඩනැගීමෙන් තොරව වෘත්තීය නිර්මාණාත්මක සහාය.',
    'packages.create.starter.name': 'අත්‍යවශ්‍ය නිර්මාණ',
    'packages.create.starter.tagline': 'ඔබේ සන්නාමයට ස්ථාවර නිර්මාණාත්මක සහාය.',
    'packages.create.starter.f1': 'මාසයකට නිර්මාණ 12 දක්වා',
    'packages.create.starter.f2': 'සමාජ මාධ්‍ය නිර්මාණ',
    'packages.create.starter.f3': 'ප්‍රවර්ධන සැලසුම්',
    'packages.create.starter.f4': 'මූලික දැන්වීම් නිර්මාණ',
    'packages.create.starter.f5': 'සන්නාමයට ගැළපෙන සැලසුම්',
    'packages.create.starter.f6': 'සාමාන්‍ය නිමැවුම් කාලය',
    'packages.create.starter.f7': 'මාසික නිර්මාණ සැලසුම්කරණය',
    'packages.create.starter.best': 'ස්ථාවර සහ අත්‍යවශ්‍ය සැලසුම් අවශ්‍යතා ඇති ව්‍යාපාර සඳහා.',
    'packages.create.prestige.name': 'ක්‍රියේටිව් ප්‍රෝ',
    'packages.create.prestige.tagline': 'වැඩි නිර්මාණ බලයක්. වැඩි නම්‍යශීලීත්වයක්.',
    'packages.create.prestige.f1': 'මාසයකට නිර්මාණ ඉල්ලීම් 24 දක්වා*',
    'packages.create.prestige.f2': 'සමාජ මාධ්‍ය නිර්මාණ',
    'packages.create.prestige.f3': 'කාර්යසාධන දැන්වීම් නිර්මාණ',
    'packages.create.prestige.f4': 'කැරොසල් සහ ප්‍රචාරණ නිර්මාණ',
    'packages.create.prestige.f5': 'චලන ග්‍රැෆික්ස්',
    'packages.create.prestige.f6': 'කෙටි වීඩියෝ සංස්කරණය',
    'packages.create.prestige.f7': 'කැපවූ නිර්මාණාත්මක මගපෙන්වීම',
    'packages.create.prestige.f8': 'ප්‍රමුඛතා නිමැවුම',
    'packages.create.prestige.best': 'නිතර නිර්මාණ, අන්තර්ගත සහ දැන්වීම් අවශ්‍යතා ඇති වර්ධනය වන සන්නාම සඳහා.',
    'packages.create.elite.name': 'අසීමිත නිර්මාණ',
    'packages.create.elite.tagline': 'ඔබේ නිර්මාණ දෙපාර්තමේන්තුව, ඉල්ලුමට අනුව.',
    'packages.create.elite.f1': 'අසීමිත නිර්මාණ ඉල්ලීම්*',
    'packages.create.elite.f2': 'සමාජ මාධ්‍ය සහ ප්‍රචාරණ නිර්මාණ',
    'packages.create.elite.f3': 'උසස් චලන ග්‍රැෆික්ස්',
    'packages.create.elite.f4': 'ප්‍රීමියම් වීඩියෝ සංස්කරණය',
    'packages.create.elite.f5': 'කාර්යසාධන දැන්වීම් නිර්මාණ',
    'packages.create.elite.f6': 'ප්‍රචාරණ දෘශ්‍ය පද්ධති',
    'packages.create.elite.f7': 'සන්නාම සහ වෙබ් නිර්මාණ',
    'packages.create.elite.f8': 'කැපවූ නිර්මාණ නායකයෙක්',
    'packages.create.elite.f9': 'ප්‍රමුඛතා නිෂ්පාදනය',
    'packages.create.elite.f10': 'උසස් නිර්මාණාත්මක මගපෙන්වීම',
    'packages.create.elite.best': 'අඛණ්ඩ, ඉහළ පරිමාණ නිර්මාණ නිෂ්පාදනය අවශ්‍ය සන්නාම සඳහා.',
    'packages.terms': '*නියම සහ කොන්දේසි අදාළ වේ',
    'packages.create.ai.eyebrow': 'AI නිර්මාණ ස්ටුඩියෝව',
    'packages.create.ai.title': 'සාම්ප්‍රදායික අන්තර්ගතයෙන් ඔබ්බට',
    'packages.create.ai.desc': 'CREATE පැකේජය සමඟ හෝ වෙනම ලබා ගත හැකි ප්‍රීමියම් AI නිර්මාණ නිෂ්පාදනය.',
    'packages.create.ai.f1Title': 'AI UGC අන්තර්ගතය', 'packages.create.ai.f1Body': 'AI මඟින් බලගැන්වූ UGC ආකාරයේ දැන්වීම්',
    'packages.create.ai.f2Title': 'AI නිෂ්පාදන ඡායාරූපකරණය', 'packages.create.ai.f2Body': 'සාම්ප්‍රදායික රූගත කිරීම් නොමැතිව ප්‍රීමියම් නිෂ්පාදන දෘශ්‍ය',
    'packages.create.ai.f3Title': 'AI සිනමාත්මක වීඩියෝ', 'packages.create.ai.f3Body': 'උසස් සිනමාත්මක සංකල්ප සහ කතාකරණය',
    'packages.create.ai.f4Title': 'AI නිෂ්පාදන වීඩියෝ', 'packages.create.ai.f4Body': 'AI මඟින් බලගැන්වූ වෙළඳ දැන්වීම් සහ ප්‍රවර්ධන අන්තර්ගතය',
    'packages.create.ai.f5Title': 'AI නිරූපිකයන් සහ අවතාර්', 'packages.create.ai.f5Body': 'සන්නාම ප්‍රචාරණ සඳහා අතථ්‍ය දක්ෂතා',
    'packages.create.ai.f6Title': 'AI රූප ජනනය', 'packages.create.ai.f6Body': 'අභිරුචි ප්‍රචාරණ රූප සහ පරිසර',
    'packages.create.ai.f7Title': 'AI වීඩියෝ ජනනය', 'packages.create.ai.f7Body': 'ජනනය කළ දර්ශන, දෘශ්‍ය සහ සන්නාම අනුක්‍රම',
    'packages.create.ai.f8Title': 'AI නිර්මාණාත්මක ප්‍රචාරණ', 'packages.create.ai.f8Body': 'සම්පූර්ණ AI-මූලික ප්‍රචාරණ සංකල්ප'
  });

  Object.assign(TRANSLATIONS.ta, {
    'packages.eyebrow': 'எங்கள் தொகுப்புகள்',
    'packages.title': 'உங்கள் வணிகத்திற்குத் தேவையானதைத் தேர்ந்தெடுக்கவும்',
    'packages.summary': 'கட்டமைப்பை உருவாக்குங்கள். வணிகத்தை வளருங்கள். பார்வையாளர்கள் காண்பதை உருவாக்குங்கள்.',
    'packages.tabsAriaLabel': 'தொகுப்பு வகைகள்',
    'packages.tab.build': 'உருவாக்கு', 'packages.tab.grow': 'வளர்ச்சி', 'packages.tab.create': 'படைப்பு',
    'packages.tier.starter': 'தொடக்கம்', 'packages.tier.prestige': 'பிரெஸ்டீஜ்', 'packages.tier.elite': 'எலைட்',
    'packages.recommended': 'மிகவும் பரிந்துரைக்கப்படுகிறது', 'packages.bestFor': 'சிறந்தது:', 'packages.select': 'தேர்ந்தெடு', 'packages.enquireNow': 'இப்போது விசாரிக்கவும்',
    'packages.build.title': 'உருவாக்கு',
    'packages.build.subtitle': 'இணையதளங்கள், மென்பொருள் மற்றும் வணிக அமைப்புகள்',
    'packages.build.tagline': 'உங்கள் வணிகத்தைச் சுற்றி உருவாக்கப்பட்ட தொழில்நுட்பம்.',
    'packages.build.starter.name': 'டிஜிட்டல் அடித்தளம்',
    'packages.build.starter.tagline': 'உங்கள் வணிகத்தை தொழில்முறையாக இணையத்தில் கொண்டு வாருங்கள்.',
    'packages.build.starter.f1': 'தனிப்பயன் வணிக இணையதளம்',
    'packages.build.starter.f2': 'தனிப்பயன் டொமைன் சேர்க்கப்பட்டுள்ளது',
    'packages.build.starter.f3': 'ஹோஸ்டிங் சேர்க்கப்பட்டுள்ளது',
    'packages.build.starter.f4': 'மொபைலுக்கு ஏற்ற வடிவமைப்பு',
    'packages.build.starter.f5': 'அத்தியாவசிய இணையதள ஒருங்கிணைப்புகள்',
    'packages.build.starter.f6': 'அடிப்படை SEO அமைப்பு',
    'packages.build.starter.f7': 'இணையதள பராமரிப்பு',
    'packages.build.starter.best': 'தொழில்முறை டிஜிட்டல் இருப்பு தேவைப்படும் வணிகங்களுக்கு.',
    'packages.build.prestige.name': 'வணிக அமைப்புகள்',
    'packages.build.prestige.tagline': 'உங்கள் இணையதளத்தை செயல்பாடுகளுடன் இணைக்கவும்.',
    'packages.build.prestige.f1': 'தொடக்க தொகுப்பில் உள்ள அனைத்தும்',
    'packages.build.prestige.f2': 'தனிப்பயன் POS மென்பொருள்',
    'packages.build.prestige.f3': 'POS மற்றும் இணையதள ஒருங்கிணைப்பு',
    'packages.build.prestige.f4': 'தனிப்பயன் டொமைன் மற்றும் ஹோஸ்டிங் சேர்க்கப்பட்டுள்ளது',
    'packages.build.prestige.f5': 'வணிக அமைப்பு ஒருங்கிணைப்புகள்',
    'packages.build.prestige.f6': 'மாதாந்திர அமைப்பு மேலாண்மை',
    'packages.build.prestige.f7': 'பகுப்பாய்வு மற்றும் அறிக்கைகள்',
    'packages.build.prestige.f8': 'முன்னுரிமை தொழில்நுட்ப ஆதரவு',
    'packages.build.prestige.best': 'இணையதளமும் POS அமைப்பும் ஒன்றாகச் செயல்பட வேண்டிய வளர்ந்து வரும் வணிகங்களுக்கு.',
    'packages.build.elite.name': 'முழுமையான சூழல் அமைப்பு',
    'packages.build.elite.tagline': 'உங்கள் முழு வணிகத்தையும் டிஜிட்டலாக இணைக்கவும்.',
    'packages.build.elite.f1': 'பிரெஸ்டீஜ் தொகுப்பில் உள்ள அனைத்தும்',
    'packages.build.elite.f2': 'தனிப்பயன் ERP மென்பொருள்',
    'packages.build.elite.f3': 'ERP, POS மற்றும் இணையதள ஒருங்கிணைப்பு',
    'packages.build.elite.f4': 'தனிப்பயன் டொமைன் மற்றும் ஹோஸ்டிங் சேர்க்கப்பட்டுள்ளது',
    'packages.build.elite.f5': 'தனிப்பயன் வணிக பணிப்பாய்வுகள்',
    'packages.build.elite.f6': 'மேம்பட்ட அமைப்பு ஒருங்கிணைப்புகள்',
    'packages.build.elite.f7': 'முழுமையான அமைப்பு மேலாண்மை',
    'packages.build.elite.f8': 'அர்ப்பணிக்கப்பட்ட தொழில்நுட்ப ஆதரவு',
    'packages.build.elite.best': 'முழுமையாக இணைக்கப்பட்ட டிஜிட்டல் கட்டமைப்பு தேவைப்படும் நிலையான வணிகங்களுக்கு.',
    'packages.build.ai.eyebrow': 'AI மற்றும் தானியக்கம்',
    'packages.build.ai.title': 'தானியக்கமாக்குங்கள். ஒருங்கிணையுங்கள். விரிவாக்குங்கள்.',
    'packages.build.ai.desc': 'வணிகத் தேவைகளுக்கு ஏற்ப தனிப்பயன் தீர்வுகளாக கிடைக்கும்.',
    'packages.build.ai.f1Title': 'AI முகவர்கள்', 'packages.build.ai.f1Body': 'வணிக பணிப்பாய்வுகளுக்கான அறிவார்ந்த முகவர்கள்',
    'packages.build.ai.f2Title': 'AI சாட்பாட்கள்', 'packages.build.ai.f2Body': 'இணையதளம், WhatsApp மற்றும் வாடிக்கையாளர் ஆதரவு உதவியாளர்கள்',
    'packages.build.ai.f3Title': 'விற்பனை தானியக்கம்', 'packages.build.ai.f3Body': 'வாய்ப்புகளைப் பெறுதல், தகுதிப்படுத்துதல் மற்றும் பின்தொடர்தல்',
    'packages.build.ai.f4Title': 'வாடிக்கையாளர் ஆதரவு தானியக்கம்', 'packages.build.ai.f4Body': 'தானியக்க உதவி மற்றும் ஆதரவு பணிப்பாய்வுகள்',
    'packages.build.ai.f5Title': 'சந்தைப்படுத்தல் தானியக்கம்', 'packages.build.ai.f5Body': 'CRM, செய்தியிடல் மற்றும் வாய்ப்பு வளர்ப்பு',
    'packages.build.ai.f6Title': 'பணிப்பாய்வு தானியக்கம்', 'packages.build.ai.f6Body': 'மீண்டும் மீண்டும் நடக்கும் வணிக செயல்முறைகளை தானியக்கமாக்குதல்',
    'packages.build.ai.f7Title': 'CRM மற்றும் ERP தானியக்கம்', 'packages.build.ai.f7Body': 'தரவு மற்றும் உள் செயல்பாடுகளை இணைத்தல்',
    'packages.build.ai.f8Title': 'தனிப்பயன் AI தீர்வுகள்', 'packages.build.ai.f8Body': 'குறிப்பிட்ட தேவைகளுக்காக உருவாக்கப்பட்ட AI அமைப்புகள்',
    'packages.grow.title': 'வளர்ச்சி',
    'packages.grow.subtitle': 'சமூக ஊடகம், உத்தி மற்றும் செயல்திறன்',
    'packages.grow.tagline': 'கவனத்தை அளவிடக்கூடிய வளர்ச்சியாக மாற்றுங்கள்.',
    'packages.grow.starter.name': 'சமூக அடித்தளம்',
    'packages.grow.starter.tagline': 'தொடர்ச்சியான டிஜிட்டல் இருப்பை உருவாக்குங்கள்.',
    'packages.grow.starter.f1': 'சமூக ஊடக மேலாண்மை',
    'packages.grow.starter.f2': 'மாதாந்திர உள்ளடக்க திட்டமிடல்',
    'packages.grow.starter.f3': 'சமூக ஊடக மேம்படுத்தல்',
    'packages.grow.starter.f4': 'மாதாந்திர வளர்ச்சி திட்டம்',
    'packages.grow.starter.f5': 'அடிப்படை பிராண்ட் வழிகாட்டுதல்',
    'packages.grow.starter.f6': 'மாதாந்திர செயல்திறன் அறிக்கை',
    'packages.grow.starter.note': 'தொடக்க தொகுப்பில் உள்ளடக்க உருவாக்கம் அல்லது பிரச்சார திட்டமிடல் இல்லை.',
    'packages.grow.starter.best': 'சமூக ஊடகங்களை தொழில்முறையாக திட்டமிட்டு நிர்வகிக்க வேண்டிய வணிகங்களுக்கு.',
    'packages.grow.prestige.name': 'வளர்ச்சி இயந்திரம்',
    'packages.grow.prestige.tagline': 'உங்கள் இருப்பை வளர்ச்சியாக மாற்றுங்கள்.',
    'packages.grow.prestige.f1': 'தொடக்க தொகுப்பில் உள்ள அனைத்தும்',
    'packages.grow.prestige.f2': 'அர்ப்பணிக்கப்பட்ட உள்ளடக்க உத்தியாளர்',
    'packages.grow.prestige.f3': 'உள்ளடக்க உருவாக்கம்',
    'packages.grow.prestige.f4': 'பிரீமியம் சமூக ஊடக மேலாண்மை',
    'packages.grow.prestige.f5': 'மூலோபாய உள்ளடக்க திட்டமிடல்',
    'packages.grow.prestige.f6': 'படைப்பாற்றல் வழிகாட்டுதல்',
    'packages.grow.prestige.f7': 'மாதாந்திர பிரச்சார திட்டமிடல்',
    'packages.grow.prestige.f8': 'செயல்திறன் சந்தைப்படுத்தல் மேலாண்மை',
    'packages.grow.prestige.f9': 'பார்வையாளர் மற்றும் போட்டியாளர் பகுப்பாய்வு',
    'packages.grow.prestige.f10': 'விரிவான வளர்ச்சி அறிக்கைகள்',
    'packages.grow.prestige.best': 'பிராண்ட், பார்வையாளர்கள் மற்றும் வாடிக்கையாளர் சேர்ப்பை செயலில் வளர்க்கத் தயாரான வணிகங்களுக்கு.',
    'packages.grow.elite.name': 'வளர்ச்சி துறை',
    'packages.grow.elite.tagline': 'லட்சியமுள்ள பிராண்டுகளுக்கான முழுமையான சந்தைப்படுத்தல் மேலாண்மை.',
    'packages.grow.elite.f1': 'பிரெஸ்டீஜ் தொகுப்பில் உள்ள அனைத்தும்',
    'packages.grow.elite.f2': 'மூத்த சந்தைப்படுத்தல் உத்தியாளர்',
    'packages.grow.elite.f3': 'முழுமையான பிராண்ட் மேலாண்மை',
    'packages.grow.elite.f4': 'மேம்பட்ட பிரச்சார உத்தி',
    'packages.grow.elite.f5': 'பல சேனல் செயல்திறன் சந்தைப்படுத்தல்',
    'packages.grow.elite.f6': 'மேம்பட்ட படைப்பாற்றல் வழிகாட்டுதல்',
    'packages.grow.elite.f7': 'பிரச்சாரம் மற்றும் அறிமுக திட்டமிடல்',
    'packages.grow.elite.f8': 'விற்பனைப் பாதை மற்றும் மாற்று உத்தி',
    'packages.grow.elite.f9': 'தொடர்ச்சியான பிரச்சார மேம்படுத்தல்',
    'packages.grow.elite.f10': 'மேம்பட்ட செயல்திறன் அறிக்கைகள்',
    'packages.grow.elite.best': 'உத்தி, பிரச்சாரங்கள் மற்றும் செயல்திறனை ஒரே வளர்ச்சி செயல்பாடாக நிர்வகிக்க வேண்டிய பிராண்டுகளுக்கு.',
    'packages.create.title': 'படைப்பு',
    'packages.create.subtitle': 'தேவைக்கேற்ப உங்கள் படைப்பாற்றல் குழு',
    'packages.create.tagline': 'உள் குழுவை உருவாக்காமல் தொழில்முறை படைப்பாற்றல் ஆதரவு.',
    'packages.create.starter.name': 'அத்தியாவசிய படைப்பு',
    'packages.create.starter.tagline': 'உங்கள் பிராண்டுக்கான தொடர்ச்சியான படைப்பாற்றல் ஆதரவு.',
    'packages.create.starter.f1': 'மாதத்திற்கு 12 படைப்புகள் வரை',
    'packages.create.starter.f2': 'சமூக ஊடக படைப்புகள்',
    'packages.create.starter.f3': 'விளம்பர வடிவமைப்புகள்',
    'packages.create.starter.f4': 'அடிப்படை விளம்பர படைப்புகள்',
    'packages.create.starter.f5': 'பிராண்டுடன் ஒத்த வடிவமைப்புகள்',
    'packages.create.starter.f6': 'நிலையான நிறைவு நேரம்',
    'packages.create.starter.f7': 'மாதாந்திர படைப்பாற்றல் திட்டமிடல்',
    'packages.create.starter.best': 'தொடர்ச்சியான அத்தியாவசிய வடிவமைப்பு தேவைகள் கொண்ட வணிகங்களுக்கு.',
    'packages.create.prestige.name': 'கிரியேட்டிவ் ப்ரோ',
    'packages.create.prestige.tagline': 'அதிக படைப்பாற்றல் திறன். அதிக நெகிழ்வுத்தன்மை.',
    'packages.create.prestige.f1': 'மாதத்திற்கு 24 படைப்பாற்றல் கோரிக்கைகள் வரை*',
    'packages.create.prestige.f2': 'சமூக ஊடக படைப்புகள்',
    'packages.create.prestige.f3': 'செயல்திறன் விளம்பர படைப்புகள்',
    'packages.create.prestige.f4': 'காருசல்கள் மற்றும் பிரச்சார படைப்புகள்',
    'packages.create.prestige.f5': 'மோஷன் கிராபிக்ஸ்',
    'packages.create.prestige.f6': 'குறுவடிவ வீடியோ எடிட்டிங்',
    'packages.create.prestige.f7': 'அர்ப்பணிக்கப்பட்ட படைப்பாற்றல் வழிகாட்டுதல்',
    'packages.create.prestige.f8': 'முன்னுரிமை நிறைவு',
    'packages.create.prestige.best': 'அடிக்கடி படைப்பாற்றல், உள்ளடக்கம் மற்றும் விளம்பரத் தேவைகள் கொண்ட வளர்ந்து வரும் பிராண்டுகளுக்கு.',
    'packages.create.elite.name': 'வரம்பற்ற படைப்பு',
    'packages.create.elite.tagline': 'தேவைக்கேற்ப உங்கள் படைப்பாற்றல் துறை.',
    'packages.create.elite.f1': 'வரம்பற்ற படைப்பாற்றல் கோரிக்கைகள்*',
    'packages.create.elite.f2': 'சமூக ஊடக மற்றும் பிரச்சார படைப்புகள்',
    'packages.create.elite.f3': 'மேம்பட்ட மோஷன் கிராபிக்ஸ்',
    'packages.create.elite.f4': 'பிரீமியம் வீடியோ எடிட்டிங்',
    'packages.create.elite.f5': 'செயல்திறன் விளம்பர படைப்புகள்',
    'packages.create.elite.f6': 'பிரச்சார காட்சி அமைப்புகள்',
    'packages.create.elite.f7': 'பிராண்ட் மற்றும் இணைய படைப்புகள்',
    'packages.create.elite.f8': 'அர்ப்பணிக்கப்பட்ட படைப்பாற்றல் தலைவர்',
    'packages.create.elite.f9': 'முன்னுரிமை தயாரிப்பு',
    'packages.create.elite.f10': 'மேம்பட்ட படைப்பாற்றல் வழிகாட்டுதல்',
    'packages.create.elite.best': 'தொடர்ச்சியான அதிக அளவு படைப்பாற்றல் தயாரிப்பு தேவைப்படும் பிராண்டுகளுக்கு.',
    'packages.terms': '*விதிமுறைகள் மற்றும் நிபந்தனைகள் பொருந்தும்',
    'packages.create.ai.eyebrow': 'AI படைப்பாற்றல் ஸ்டுடியோ',
    'packages.create.ai.title': 'பாரம்பரிய உள்ளடக்கத்திற்கு அப்பால்',
    'packages.create.ai.desc': 'CREATE தொகுப்புடன் அல்லது தனியாக கிடைக்கும் பிரீமியம் AI படைப்பாற்றல் தயாரிப்பு.',
    'packages.create.ai.f1Title': 'AI UGC உள்ளடக்கம்', 'packages.create.ai.f1Body': 'AI மூலம் இயங்கும் UGC பாணி விளம்பரம்',
    'packages.create.ai.f2Title': 'AI தயாரிப்பு புகைப்படம்', 'packages.create.ai.f2Body': 'பாரம்பரிய படப்பிடிப்புகள் இல்லாத பிரீமியம் தயாரிப்பு காட்சிகள்',
    'packages.create.ai.f3Title': 'AI சினிமா வீடியோக்கள்', 'packages.create.ai.f3Body': 'உயர்தர சினிமா கருத்துக்கள் மற்றும் கதைசொல்லல்',
    'packages.create.ai.f4Title': 'AI தயாரிப்பு வீடியோக்கள்', 'packages.create.ai.f4Body': 'AI மூலம் இயங்கும் விளம்பரங்கள் மற்றும் ஊக்குவிப்பு உள்ளடக்கம்',
    'packages.create.ai.f5Title': 'AI மாடல்கள் மற்றும் அவதார்கள்', 'packages.create.ai.f5Body': 'பிராண்ட் பிரச்சாரங்களுக்கான மெய்நிகர் திறமைகள்',
    'packages.create.ai.f6Title': 'AI பட உருவாக்கம்', 'packages.create.ai.f6Body': 'தனிப்பயன் பிரச்சாரப் படங்கள் மற்றும் சூழல்கள்',
    'packages.create.ai.f7Title': 'AI வீடியோ உருவாக்கம்', 'packages.create.ai.f7Body': 'உருவாக்கப்பட்ட காட்சிகள், படங்கள் மற்றும் பிராண்ட் தொடர்கள்',
    'packages.create.ai.f8Title': 'AI படைப்பாற்றல் பிரச்சாரங்கள்', 'packages.create.ai.f8Body': 'முழுமையான AI முதன்மை பிரச்சார கருத்துக்கள்'
  });

  // Exposed for debugging/testing only - nothing else in the codebase reads these.
  window.CAMBM_COUNTRIES = COUNTRIES;
  window.CAMBM_TRANSLATIONS = TRANSLATIONS;

  let currentCountry = DEFAULT_COUNTRY;
  let currentLanguage = DEFAULT_LANGUAGE;

  function t(key, lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANGUAGE];
    if (dict && dict[key] != null) return dict[key];
    return TRANSLATIONS[DEFAULT_LANGUAGE][key] || '';
  }

  function getSavedLocale() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && COUNTRIES[parsed.country] && COUNTRIES[parsed.country].languages.indexOf(parsed.language) !== -1) {
        return parsed;
      }
    } catch (e) { /* ignore malformed/blocked storage, fall back to first-visit popup */ }
    return null;
  }

  function saveLocale(country, language) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ country: country, language: language })); } catch (e) { /* storage may be unavailable (private mode etc.) - locale just won't persist */ }
  }

  function applyTranslations(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES[lang] ? 'rtl' : 'ltr';
    const nodes = document.querySelectorAll('[data-i18n]');
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i];
      const key = el.getAttribute('data-i18n');
      const value = t(key, lang);
      if (HTML_KEYS[key]) el.innerHTML = value;
      else el.textContent = value;
    }
    // Attribute translations: data-i18n-attr="aria-label:nav.homeAriaLabel"
    // (comma-separate multiple "attr:key" pairs). Used where the visible
    // content is an image/icon rather than translatable text - e.g. the logo.
    const attrNodes = document.querySelectorAll('[data-i18n-attr]');
    for (let i = 0; i < attrNodes.length; i++) {
      const el = attrNodes[i];
      const pairs = el.getAttribute('data-i18n-attr').split(',');
      for (let j = 0; j < pairs.length; j++) {
        const bits = pairs[j].split(':');
        if (bits.length === 2) el.setAttribute(bits[0].trim(), t(bits[1].trim(), lang));
      }
    }
  }

  function formatPrice(countryCode, packageIndex) {
    const amount = PACKAGE_PRICES[countryCode][packageIndex];
    return COUNTRIES[countryCode].currency.symbol + amount.toLocaleString('en-US');
  }

  function applyCurrency(countryCode) {
    const nodes = document.querySelectorAll('[data-price-index]');
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i];
      const index = parseInt(el.getAttribute('data-price-index'), 10);
      el.textContent = formatPrice(countryCode, index);
    }
  }

  function applySocialLinks(countryCode) {
    const links = SOCIAL_LINKS[countryCode] || SOCIAL_LINKS[DEFAULT_COUNTRY];
    const whatsapp = document.getElementById('footerSocialWhatsApp');
    const instagram = document.getElementById('footerSocialInstagram');
    const facebook = document.getElementById('footerSocialFacebook');
    const whatsappNumber = WHATSAPP_NUMBERS[countryCode] || WHATSAPP_NUMBERS.default;
    if (whatsapp) whatsapp.href = 'https://wa.me/' + whatsappNumber + '?text=' + WHATSAPP_MESSAGE;
    if (instagram) instagram.href = links.instagram;
    if (facebook) facebook.href = links.facebook;
  }

  // Cal.com's embed forwards data-cal-config keys straight through as query
  // params on the actual booking iframe, so re-writing this attribute on
  // every "Book a strategy call" trigger is how its calendar picks up the
  // language the visitor has selected on the site.
  function applyCalConfig(language) {
    const calLang = CAL_LANGUAGE_MAP[language] || 'en';
    document.querySelectorAll('.js-open-cal').forEach(function (btn) {
      const config = { layout: 'month_view', language: calLang, locale: calLang };
      if (btn.closest('#packages')) {
        config['Select-a-package'] = btn.getAttribute('data-package-category') || 'Not yet decided';
        config['Select-a-plan'] = btn.getAttribute('data-package-plan') || 'Not yet decided';
      }
      btn.setAttribute('data-cal-config', JSON.stringify(config));
    });
  }

  // ---- Populate the <select> elements ----
  // `compact` (nav-bar picker only, not the first-visit popup) shows
  // "LK/LKR" style code pairs instead of "🇱🇰 Sri Lanka" - the popup keeps
  // full flag+name since that's the one place a first-time visitor actually
  // needs to recognize their country/region, not just a quick glance.
  function populateCountrySelect(selectEl, selectedCountry, compact) {
    let html = '';
    for (const code in COUNTRIES) {
      const label = compact
        ? code + '/' + COUNTRIES[code].currency.code
        : COUNTRIES[code].flag + ' ' + COUNTRIES[code].name;
      html += '<option value="' + code + '">' + label + '</option>';
    }
    selectEl.innerHTML = html;
    selectEl.value = selectedCountry;
  }

  function populateLanguageSelect(selectEl, countryCode, selectedLanguage) {
    const langs = COUNTRIES[countryCode].languages;
    let html = '';
    for (let i = 0; i < langs.length; i++) {
      html += '<option value="' + langs[i] + '">' + LANGUAGE_NAMES[langs[i]] + '</option>';
    }
    selectEl.innerHTML = html;
    selectEl.value = langs.indexOf(selectedLanguage) !== -1 ? selectedLanguage : langs[0];
  }

  function init() {
    const countrySelects = document.querySelectorAll('.locale-country-select');
    const languageSelects = document.querySelectorAll('.locale-language-select');

    function syncSelects(country, language) {
      countrySelects.forEach(function (sel) { populateCountrySelect(sel, country, true); });
      languageSelects.forEach(function (sel) { populateLanguageSelect(sel, country, language); });
    }

    function setLocale(country, language, persist) {
      currentCountry = country;
      currentLanguage = language;
      syncSelects(country, language);
      applyTranslations(language);
      applyCurrency(country);
      applySocialLinks(country);
      applyCalConfig(language);
      if (persist) saveLocale(country, language);
    }

    countrySelects.forEach(function (sel) {
      sel.addEventListener('change', function () {
        const country = sel.value;
        const langs = COUNTRIES[country].languages;
        const lang = langs.indexOf(currentLanguage) !== -1 ? currentLanguage : langs[0];
        setLocale(country, lang, true);
      });
    });
    languageSelects.forEach(function (sel) {
      sel.addEventListener('change', function () {
        setLocale(currentCountry, sel.value, true);
      });
    });

    // ---- First-visit locale popup (mandatory until a choice is saved) ----
    const popupBackdrop = document.getElementById('localePopupBackdrop');
    const popupCountrySelect = document.getElementById('localePopupCountry');
    const popupLanguageSelect = document.getElementById('localePopupLanguage');
    const popupConfirm = document.getElementById('localePopupConfirm');

    if (popupCountrySelect && popupLanguageSelect) {
      populateCountrySelect(popupCountrySelect, DEFAULT_COUNTRY);
      populateLanguageSelect(popupLanguageSelect, DEFAULT_COUNTRY, DEFAULT_LANGUAGE);

      popupCountrySelect.addEventListener('change', function () {
        populateLanguageSelect(popupLanguageSelect, popupCountrySelect.value, popupLanguageSelect.value);
        applyTranslations(popupLanguageSelect.value); // live-preview the popup's own text in the chosen language
      });
      popupLanguageSelect.addEventListener('change', function () {
        applyTranslations(popupLanguageSelect.value);
      });
    }

    if (popupConfirm) {
      popupConfirm.addEventListener('click', function () {
        setLocale(popupCountrySelect.value, popupLanguageSelect.value, true);
        popupBackdrop.classList.remove('open');
        document.body.style.overflow = '';
      });
    }

    const saved = getSavedLocale();
    if (saved) {
      setLocale(saved.country, saved.language, false);
    } else {
      setLocale(DEFAULT_COUNTRY, DEFAULT_LANGUAGE, false);
      if (popupBackdrop) {
        popupBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    // ---- Custom dropdown UI over the nav-bar <select>s ----
    // The native OS option list looks dated; replace each nav-picker select
    // with a styled custom dropdown that matches the site. The native
    // <select> stays in the DOM as the source of truth - visually hidden, but
    // still read/written and change-fired by all the locale logic above, so
    // this is a purely presentational layer that changes nothing about how
    // the picker actually works. A MutationObserver rebuilds the custom
    // list+label whenever that logic repopulates the select (e.g. the set of
    // languages changes when the country changes), so the two never drift.
    // Runs AFTER the initial setLocale above so the options already exist on
    // first render (no flash of an empty dropdown).
    function closeAllLocaleSelects() {
      document.querySelectorAll('.c-select.open').forEach(function (w) {
        if (w._close) w._close();
      });
    }
    document.addEventListener('click', closeAllLocaleSelects);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllLocaleSelects();
    });

    function enhanceLocaleSelect(select) {
      const wrap = document.createElement('div');
      wrap.className = 'c-select';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'c-select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      const labelEl = document.createElement('span');
      labelEl.className = 'c-select-label';
      trigger.appendChild(labelEl);
      trigger.insertAdjacentHTML('beforeend',
        '<svg class="c-select-arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">' +
        '<path d="M2 3.5L5 6.5L8 3.5" fill="none" stroke="currentColor" stroke-width="1.4" ' +
        'stroke-linecap="round" stroke-linejoin="round"/></svg>');

      const menu = document.createElement('ul');
      menu.className = 'c-select-menu';
      menu.setAttribute('role', 'listbox');

      // Native select stays as the value store, but out of the tab order and
      // hidden - the custom button is the real, focusable control now.
      select.setAttribute('tabindex', '-1');
      select.setAttribute('aria-hidden', 'true');
      select.parentNode.insertBefore(wrap, select);
      wrap.appendChild(select);
      wrap.appendChild(trigger);
      wrap.appendChild(menu);

      function close() {
        wrap.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
      function open() {
        closeAllLocaleSelects();
        wrap.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
      wrap._close = close;

      function render() {
        const current = select.options[select.selectedIndex];
        labelEl.textContent = current ? current.textContent : '';
        menu.textContent = '';
        Array.prototype.forEach.call(select.options, function (opt) {
          const li = document.createElement('li');
          li.className = 'c-select-option' + (opt.selected ? ' is-selected' : '');
          li.setAttribute('role', 'option');
          li.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
          li.textContent = opt.textContent;
          li.addEventListener('click', function (e) {
            e.stopPropagation();
            if (select.value !== opt.value) {
              select.value = opt.value;
              // Fire the native change so the existing locale logic runs.
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
            close();
          });
          menu.appendChild(li);
        });
      }

      trigger.addEventListener('click', function (e) {
        e.stopPropagation(); // don't let the document handler immediately re-close
        if (wrap.classList.contains('open')) close(); else open();
      });

      // Rebuild the custom UI whenever the locale logic resets this select's
      // options (childList mutation from the innerHTML repopulate).
      new MutationObserver(render).observe(select, { childList: true });
      render();
    }

    countrySelects.forEach(enhanceLocaleSelect);
    languageSelects.forEach(enhanceLocaleSelect);

    // ---- Enterprise contact-form popup ----
    const contactPopupBackdrop = document.getElementById('contactPopupBackdrop');
    const contactPopupClose = document.getElementById('contactPopupClose');
    const contactForm = document.getElementById('contactForm');
    const contactStatus = document.getElementById('contactFormStatus');

    function openContactPopup() {
      if (contactPopupBackdrop) { contactPopupBackdrop.classList.add('open'); document.body.style.overflow = 'hidden'; }
      // Clear any success/error message left over from a previous submission -
      // otherwise "Thanks! We'll be in touch soon." stays on screen forever,
      // since it's only ever cleared at the START of the next submit.
      if (contactStatus) { contactStatus.textContent = ''; contactStatus.className = 'contact-form-status'; }
    }
    function closeContactPopup() {
      if (contactPopupBackdrop) { contactPopupBackdrop.classList.remove('open'); document.body.style.overflow = ''; }
    }
    document.querySelectorAll('.js-open-contact-popup').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); openContactPopup(); });
    });
    if (contactPopupClose) contactPopupClose.addEventListener('click', closeContactPopup);
    if (contactPopupBackdrop) {
      contactPopupBackdrop.addEventListener('click', function (e) {
        if (e.target === contactPopupBackdrop) closeContactPopup();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && contactPopupBackdrop && contactPopupBackdrop.classList.contains('open')) closeContactPopup();
    });

    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('.contact-form-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = t('contact.sending', currentLanguage);
        if (contactStatus) { contactStatus.textContent = ''; contactStatus.className = 'contact-form-status'; }
        fetch('https://formspree.io/f/mjgqjpzn', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(contactForm)
        }).then(function (response) {
          if (response.ok) {
            if (contactStatus) { contactStatus.textContent = t('contact.success', currentLanguage); contactStatus.classList.add('success'); }
            contactForm.reset();
          } else {
            if (contactStatus) { contactStatus.textContent = t('contact.error', currentLanguage); contactStatus.classList.add('error'); }
          }
        }).catch(function () {
          if (contactStatus) { contactStatus.textContent = t('contact.error', currentLanguage); contactStatus.classList.add('error'); }
        }).finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = t('contact.send', currentLanguage);
        });
      });
    }

    // ---- Plan-selection popup ----
    // One shared modal, reused for each pricing card's "Select plan" button -
    // only the Formspree endpoint and the price/term shown differ, per
    // FORM_TYPES below. ("Book a strategy call" used to open this too, but
    // now opens the Cal.com booking widget instead - see js-open-cal below.)
    const FORM_TYPES = {
      signature: { endpoint: 'https://formspree.io/f/xkolyaok', planIndex: 0, planNameKey: 'pricing.gold', termKey: 'pricing.term.minimum3Month', subject: 'Signature Plan Selection' },
      prestige: { endpoint: 'https://formspree.io/f/xnjkwyje', planIndex: 1, planNameKey: 'pricing.platinum', termKey: 'pricing.term.annual', subject: 'Prestige Plan Selection' },
      elite: { endpoint: 'https://formspree.io/f/xaqgvzen', planIndex: 2, planNameKey: 'pricing.diamond', termKey: 'pricing.term.annual', subject: 'Elite Plan Selection' }
    };

    const actionPopupBackdrop = document.getElementById('actionPopupBackdrop');
    const actionPopupClose = document.getElementById('actionPopupClose');
    const actionPopupTitle = document.getElementById('actionPopupTitle');
    const actionPopupDesc = document.getElementById('actionPopupDesc');
    const actionPopupPlan = document.getElementById('actionPopupPlan');
    const actionPopupForm = document.getElementById('actionPopupForm');
    const actionPopupStatus = document.getElementById('actionPopupStatus');
    const actionPopupPlanField = document.getElementById('actionPopupPlanField');
    const actionPopupSubjectField = document.getElementById('actionPopupSubjectField');
    let activeFormType = null;

    function openActionPopup(formType) {
      const cfg = FORM_TYPES[formType];
      if (!cfg || !actionPopupBackdrop) return;
      activeFormType = formType;
      const planName = t(cfg.planNameKey, currentLanguage);
      const price = formatPrice(currentCountry, cfg.planIndex) + t('pricing.perMo', currentLanguage);
      const term = t(cfg.termKey, currentLanguage);
      const planText = t('popup.planLabel', currentLanguage) + ': ' + planName + ' — ' + price + ' — ' + term;
      actionPopupTitle.textContent = t('pricing.selectPlan', currentLanguage) + ': ' + planName;
      actionPopupDesc.textContent = t('popup.planDesc', currentLanguage);
      actionPopupPlan.textContent = planText;
      actionPopupPlan.style.display = '';
      actionPopupPlanField.value = planText;
      actionPopupSubjectField.value = cfg.subject + ' (' + planName + ') - Cambridge Marketing';
      // Clear any success/error message left over from a previous submission -
      // this modal is reused across 4 different forms, so without this the
      // last one's "Thanks!" message would show up on every later open.
      if (actionPopupStatus) { actionPopupStatus.textContent = ''; actionPopupStatus.className = 'contact-form-status'; }
      actionPopupBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeActionPopup() {
      if (actionPopupBackdrop) { actionPopupBackdrop.classList.remove('open'); document.body.style.overflow = ''; }
    }

    document.querySelectorAll('.js-open-action-popup').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openActionPopup(btn.getAttribute('data-form-type'));
      });
    });
    if (actionPopupClose) actionPopupClose.addEventListener('click', closeActionPopup);
    if (actionPopupBackdrop) {
      actionPopupBackdrop.addEventListener('click', function (e) {
        if (e.target === actionPopupBackdrop) closeActionPopup();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && actionPopupBackdrop && actionPopupBackdrop.classList.contains('open')) closeActionPopup();
    });

    if (actionPopupForm) {
      actionPopupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const cfg = FORM_TYPES[activeFormType];
        if (!cfg) return;
        const submitBtn = actionPopupForm.querySelector('.contact-form-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = t('contact.sending', currentLanguage);
        if (actionPopupStatus) { actionPopupStatus.textContent = ''; actionPopupStatus.className = 'contact-form-status'; }
        fetch(cfg.endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(actionPopupForm)
        }).then(function (response) {
          if (response.ok) {
            if (actionPopupStatus) { actionPopupStatus.textContent = t('contact.success', currentLanguage); actionPopupStatus.classList.add('success'); }
            actionPopupForm.reset();
          } else {
            if (actionPopupStatus) { actionPopupStatus.textContent = t('contact.error', currentLanguage); actionPopupStatus.classList.add('error'); }
          }
        }).catch(function () {
          if (actionPopupStatus) { actionPopupStatus.textContent = t('contact.error', currentLanguage); actionPopupStatus.classList.add('error'); }
        }).finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = t('contact.send', currentLanguage);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
