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
  // stays "#" directly in index.html until one is created.
  const SOCIAL_LINKS = {
    LK: { instagram: 'https://www.instagram.com/cambm.lk/', facebook: 'https://web.facebook.com/profile.php?id=61590765272716#' },
    SA: { instagram: 'https://www.instagram.com/cambm.sa', facebook: 'https://web.facebook.com/profile.php?id=61590616180697#' }
  };

  const LANGUAGE_NAMES = { en: 'English', ar: 'العربية', si: 'සිංහල', ta: 'தமிழ்', es: 'Español' };
  const RTL_LANGUAGES = { ar: true };

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
    'nav.systems': 'Systems', 'nav.whyCambm': 'Why CAMBM', 'nav.pricing': 'Pricing', 'nav.bookCall': 'Book a strategy call',
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
    'popup.bookingTitle': 'Book a strategy call', 'popup.bookingDesc': 'Tell us a bit about your business and we’ll set up a time to talk.',
    'popup.planDesc': 'Tell us a bit about your business and we’ll follow up with next steps.', 'popup.planLabel': 'Plan'
  };

  TRANSLATIONS.es = {
    'nav.systems': 'Sistemas', 'nav.whyCambm': 'Por qué CAMBM', 'nav.pricing': 'Precios', 'nav.bookCall': 'Reservar una llamada',
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
    'popup.bookingTitle': 'Reservar una llamada estratégica', 'popup.bookingDesc': 'Cuéntanos sobre tu negocio y coordinaremos un horario para hablar.',
    'popup.planDesc': 'Cuéntanos sobre tu negocio y te contactaremos con los próximos pasos.', 'popup.planLabel': 'Plan'
  };

  TRANSLATIONS.ar = {
    'nav.systems': 'الأنظمة', 'nav.whyCambm': 'لماذا كامبريدج', 'nav.pricing': 'الأسعار', 'nav.bookCall': 'احجز مكالمة استراتيجية',
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
    'popup.bookingTitle': 'احجز مكالمة استراتيجية', 'popup.bookingDesc': 'أخبرنا قليلاً عن عملك وسنحدد موعدًا للتحدث.',
    'popup.planDesc': 'أخبرنا قليلاً عن عملك وسنتابع معك الخطوات التالية.', 'popup.planLabel': 'الباقة'
  };

  TRANSLATIONS.si = {
    'nav.systems': 'පද්ධති', 'nav.whyCambm': 'මන්ද කැම්බ්‍රිජ්', 'nav.pricing': 'මිල ගණන්', 'nav.bookCall': 'උපායමාර්ග ඇමතුමක් වෙන් කරන්න',
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
    'popup.bookingTitle': 'උපායමාර්ග ඇමතුමක් වෙන් කරන්න', 'popup.bookingDesc': 'ඔබේ ව්‍යාපාරය ගැන අපට ටිකක් කියන්න, කතා කිරීමට වේලාවක් සකසන්නෙමු.',
    'popup.planDesc': 'ඔබේ ව්‍යාපාරය ගැන අපට ටිකක් කියන්න, ඊළඟ පියවර සමඟ අපි සම්බන්ධ වෙමු.', 'popup.planLabel': 'සැලැස්ම'
  };

  TRANSLATIONS.ta = {
    'nav.systems': 'அமைப்புகள்', 'nav.whyCambm': 'ஏன் கேம்ப்ரிட்ஜ்', 'nav.pricing': 'விலை நிர்ணயம்', 'nav.bookCall': 'மூலோபாய அழைப்பை பதிவு செய்யவும்',
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
    'popup.bookingTitle': 'மூலோபாய அழைப்பை பதிவு செய்யவும்', 'popup.bookingDesc': 'உங்கள் வணிகத்தைப் பற்றி எங்களிடம் கூறுங்கள், பேச ஒரு நேரத்தை ஏற்பாடு செய்வோம்.',
    'popup.planDesc': 'உங்கள் வணிகத்தைப் பற்றி எங்களிடம் கூறுங்கள், அடுத்த படிகளுடன் தொடர்பு கொள்வோம்.', 'popup.planLabel': 'திட்டம்'
  };

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
    const instagram = document.getElementById('footerSocialInstagram');
    const facebook = document.getElementById('footerSocialFacebook');
    if (instagram) instagram.href = links.instagram;
    if (facebook) facebook.href = links.facebook;
  }

  // ---- Populate the <select> elements ----
  function populateCountrySelect(selectEl, selectedCountry) {
    let html = '';
    for (const code in COUNTRIES) {
      html += '<option value="' + code + '">' + COUNTRIES[code].flag + ' ' + COUNTRIES[code].name + '</option>';
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
      countrySelects.forEach(function (sel) { populateCountrySelect(sel, country); });
      languageSelects.forEach(function (sel) { populateLanguageSelect(sel, country, language); });
    }

    function setLocale(country, language, persist) {
      currentCountry = country;
      currentLanguage = language;
      syncSelects(country, language);
      applyTranslations(language);
      applyCurrency(country);
      applySocialLinks(country);
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

    // ---- Enterprise contact-form popup ----
    const contactPopupBackdrop = document.getElementById('contactPopupBackdrop');
    const contactPopupClose = document.getElementById('contactPopupClose');
    const contactForm = document.getElementById('contactForm');
    const contactStatus = document.getElementById('contactFormStatus');

    function openContactPopup() {
      if (contactPopupBackdrop) { contactPopupBackdrop.classList.add('open'); document.body.style.overflow = 'hidden'; }
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

    // ---- Booking / plan-selection popup ----
    // One shared modal, reused for the "Book a strategy call" buttons and each
    // pricing card's "Select plan" button - only the Formspree endpoint, title
    // and (for plans) the price/term shown differ, per FORM_TYPES below.
    const FORM_TYPES = {
      booking: { endpoint: 'https://formspree.io/f/xojorzen', titleKey: 'popup.bookingTitle', descKey: 'popup.bookingDesc', subject: 'Strategy Call Booking' },
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
      if (cfg.planIndex != null) {
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
      } else {
        actionPopupTitle.textContent = t(cfg.titleKey, currentLanguage);
        actionPopupDesc.textContent = t(cfg.descKey, currentLanguage);
        actionPopupPlan.style.display = 'none';
        actionPopupPlanField.value = '';
        actionPopupSubjectField.value = cfg.subject + ' - Cambridge Marketing';
      }
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
