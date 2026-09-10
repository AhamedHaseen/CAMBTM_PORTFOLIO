import React, { useState, useEffect, useMemo, useCallback } from "react";
import "../css/services-redesign.css";

const I18N_SERVICES = {
  en: {
    eyebrow: "Our Services",
    title: "Choose what your business needs",
    tabs: { build: "BUILD", create: "CREATE", grow: "GROW" },
    discussBtn: "Discuss",
    build: {
      title: "Build",
      desc: "Digital infrastructure, software and business systems engineered around the way your company actually operates.",
      micro: "From customer-facing platforms to internal operations, integrations and automation.",
      services: [
        { num: "01", name: "Website Development", desc: "Corporate, portfolio, e-commerce and custom websites." },
        { num: "02", name: "POS Systems", desc: "Sales, billing, inventory and multi-branch operations." },
        { num: "03", name: "ERP Systems", desc: "Connected workflows for finance, HR, stock and operations." },
        { num: "04", name: "Custom Software & App Development", desc: "Tailored web, mobile and internal business platforms." },
        { num: "05", name: "Workflow Automation", desc: "Automate repetitive tasks, approvals and operational handoffs." },
        { num: "06", name: "AI Integration", desc: "AI agents, assistants and AI-powered business processes." },
        { num: "07", name: "CRM Solutions", desc: "Lead, pipeline, customer and sales workflow systems." },
        { num: "08", name: "Maintenance & Technical Support", desc: "Monitoring, updates, fixes, performance and ongoing support." },
        { num: "09", name: "SaaS Product Development", desc: "Design and engineering for subscription-based software products." },
        { num: "10", name: "Cybersecurity", desc: "Security reviews, hardening, access controls and protection." },
        { num: "11", name: "Data Migration", desc: "Structured migration across platforms, systems and databases." },
        { num: "12", name: "Data Analysis", desc: "Reporting, dashboards and decision-ready business insights." },
        { num: "13", name: "API Integration", desc: "Connect payments, platforms, third-party tools and internal systems." },
      ],
      hosting: {
        eyebrow: "Hosting & Infrastructure",
        title: "Hosting that scales with the system.",
        desc: "Annual hosting plans are available for standard business requirements, with customised hosting solutions for higher traffic, storage, security, email or infrastructure needs.",
        plans: ["Starter Hosting", "Marketing Hosting", "Elite Hosting", "Enterprise Hosting"],
        note: "Custom infrastructure can be scoped around your technical requirements.",
      },
    },
    create: {
      title: "Create",
      desc: "Creative production for brands that need a consistent visual identity and high-quality content across campaigns and channels.",
      micro: "Engage a single production service or build a recurring creative workflow.",
      services: [
        { num: "01", name: "Branding", desc: "Identity systems, brand guidelines and rollout assets." },
        { num: "02", name: "Video Production", desc: "End-to-end shoots for campaigns, brands and social media." },
        { num: "03", name: "Video Editing", desc: "Reels, advertisements, corporate and social-first edits." },
        { num: "04", name: "Photography", desc: "Product, food, people, spaces and campaign photography." },
        { num: "05", name: "Motion Graphics", desc: "Animated brand visuals, explainers and performance creatives." },
        { num: "06", name: "Graphic Design", desc: "Social media, campaign and promotional creative production." },
        { num: "07", name: "AI Creative Studio", desc: "AI-led imagery, video, UGC-style and campaign production." },
        { num: "08", name: "Presenter-Led Content", desc: "On-camera content for education, promotion and brand storytelling." },
      ],
    },
    grow: {
      title: "Grow",
      desc: "Performance, search and lifecycle marketing designed to increase visibility, demand, qualified leads and measurable business growth.",
      micro: "Strategy, execution, optimisation and reporting can be scoped by channel or as one growth programme.",
      services: [
        { num: "01", name: "Social Media Management", desc: "Planning, publishing, community management and reporting." },
        { num: "02", name: "SEO", desc: "Technical, on-page and content-led search optimisation." },
        { num: "03", name: "Lead Generation", desc: "Campaigns and funnels built to acquire qualified prospects." },
        { num: "04", name: "Email & WhatsApp Marketing", desc: "Lifecycle, campaign, nurture and broadcast communication." },
        { num: "05", name: "Paid Advertising", desc: "Meta, TikTok and Google campaign management." },
        { num: "06", name: "E-Commerce Marketing", desc: "Acquisition, conversion and retention for online stores." },
        { num: "07", name: "Google Business Profile Management", desc: "Profile optimisation, content, reviews and local visibility." },
      ],
    },
    combos: {
      eyebrow: "Combo Packages",
      title: "Connected services. One clear engagement.",
      desc: "For businesses that need several capabilities working together, our combo packages combine content, marketing and technology into a single managed engagement.",
      note: "No public pricing displayed. Package scope can be adapted after a short requirements discussion.",
      discussBtn: "Discuss Package",
      cards: [
        {
          id: "video",
          title: "Videography Combo",
          desc: "For brands that need recurring content, social execution and a consistent monthly video pipeline.",
          items: [
            "12 Static Creatives",
            "Social Media Management for Meta & TikTok",
            "Basic Campaign Management",
            "1 Video Shoot",
            "Monthly Reporting",
          ],
          engagement: "MONTHLY ENGAGEMENT",
        },
        {
          id: "web",
          featured: true,
          title: "Website Combo",
          desc: "For businesses that need ongoing marketing supported by a professionally built and maintained website.",
          items: [
            "12 Static Creatives",
            "Social Media Management for Meta & TikTok",
            "Basic Campaign Management",
            "Custom Website Included",
            "Hosting Included",
            "Monthly Maintenance & Technical Support",
            "Monthly Reporting",
          ],
          engagement: "6-MONTH ENGAGEMENT",
        },
        {
          id: "pos",
          title: "POS Combo",
          desc: "For retail, restaurant and service businesses that need marketing and an operational POS system together.",
          items: [
            "12 Static Creatives",
            "Social Media Management for Meta & TikTok",
            "Basic Campaign Management",
            "Custom POS Included",
            "Hosting Included",
            "Monthly Maintenance & Technical Support",
            "Monthly Reporting",
          ],
          engagement: "ANNUAL ENGAGEMENT",
        },
      ],
    },
  },
  es: {
    eyebrow: "Nuestros Servicios",
    title: "Elige lo que tu empresa necesita",
    tabs: { build: "CONSTRUIR", create: "CREAR", grow: "CRECER" },
    discussBtn: "Conversar",
    build: {
      title: "Construir",
      desc: "Infraestructura digital, software y sistemas empresariales diseñados en torno a la forma real en que opera tu empresa.",
      micro: "Desde plataformas para clientes hasta operaciones internas, integraciones y automatización.",
      services: [
        { num: "01", name: "Desarrollo de Sitios Web", desc: "Sitios corporativos, portafolios, e-commerce y personalizados." },
        { num: "02", name: "Sistemas POS", desc: "Ventas, facturación, inventario y operaciones multisucursal." },
        { num: "03", name: "Sistemas ERP", desc: "Flujos conectados para finanzas, RRHH, stock y operaciones." },
        { num: "04", name: "Software a Medida y Apps", desc: "Plataformas web, móviles y empresariales adaptadas." },
        { num: "05", name: "Automatización de Procesos", desc: "Automatiza tareas repetitivas, aprobaciones y traspasos operativos." },
        { num: "06", name: "Integración de IA", desc: "Agentes de IA, asistentes y procesos de negocio inteligentes." },
        { num: "07", name: "Soluciones CRM", desc: "Sistemas de prospectos, embudos de ventas y atención a clientes." },
        { num: "08", name: "Mantenimiento y Soporte Técnico", desc: "Monitoreo, actualizaciones, correcciones, rendimiento y soporte continuo." },
        { num: "09", name: "Desarrollo de Productos SaaS", desc: "Diseño e ingeniería para plataformas de software por suscripción." },
        { num: "10", name: "Ciberseguridad", desc: "Auditorías de seguridad, protección, control de accesos y blindaje." },
        { num: "11", name: "Migración de Datos", desc: "Migración estructurada entre plataformas, sistemas y bases de datos." },
        { num: "12", name: "Análisis de Datos", desc: "Reportes, paneles de control y métricas para la toma de decisiones." },
        { num: "13", name: "Integración de APIs", desc: "Conexión de pasarelas de pago, herramientas externas y sistemas internos." },
      ],
      hosting: {
        eyebrow: "Alojamiento e Infraestructura",
        title: "Alojamiento que escala con el sistema.",
        desc: "Planes anuales para requerimientos estándar, con soluciones personalizadas para mayor tráfico, almacenamiento, seguridad o infraestructura.",
        plans: ["Hosting Starter", "Hosting Marketing", "Hosting Elite", "Hosting Enterprise"],
        note: "Se puede diseñar infraestructura personalizada según tus requerimientos técnicos.",
      },
    },
    create: {
      title: "Crear",
      desc: "Producción creativa para marcas que necesitan una identidad visual coherente y contenido de alta calidad en campañas y canales.",
      micro: "Contrata un servicio de producción individual o crea un flujo creativo recurrente.",
      services: [
        { num: "01", name: "Branding", desc: "Sistemas de identidad, manuales de marca y recursos de despliegue." },
        { num: "02", name: "Producción de Video", desc: "Rodajes integrales para campañas, marcas y redes sociales." },
        { num: "03", name: "Edición de Video", desc: "Reels, anuncios publicitarios, videos corporativos y contenido social." },
        { num: "04", name: "Fotografía Profesional", desc: "Fotografía de producto, gastronomía, personas, espacios y campañas." },
        { num: "05", name: "Motion Graphics", desc: "Identidades visuales animadas, videos explicativos y creativos de alto impacto." },
        { num: "06", name: "Diseño Gráfico", desc: "Diseño para redes sociales, campañas publicitarias y material promocional." },
        { num: "07", name: "Estudio Creativo con IA", desc: "Imágenes, videos, contenido estilo UGC y campañas generadas con IA." },
        { num: "08", name: "Contenido con Presentador", desc: "Contenido en cámara para educación, promoción y storytelling de marca." },
      ],
    },
    grow: {
      title: "Crecer",
      desc: "Marketing de rendimiento, búsqueda y ciclo de vida diseñado para aumentar la visibilidad, la demanda, los prospectos cualificados y el crecimiento medible.",
      micro: "La estrategia, ejecución, optimización y reportes se pueden definir por canal o como un programa integral.",
      services: [
        { num: "01", name: "Gestión de Redes Sociales", desc: "Planificación, publicación, gestión de comunidad e informes mensuales." },
        { num: "02", name: "SEO", desc: "Optimización técnica, en página y de contenidos para motores de búsqueda." },
        { num: "03", name: "Generación de Clientes Potenciales", desc: "Campañas y embudos creados para captar prospectos cualificados." },
        { num: "04", name: "Marketing por Email y WhatsApp", desc: "Ciclo de vida, campañas, nutrición de prospectos y comunicación masiva." },
        { num: "05", name: "Publicidad Digital Pagada", desc: "Gestión experta de campañas en Meta Ads, TikTok Ads y Google Ads." },
        { num: "06", name: "Marketing para Comercio Electrónico", desc: "Captación, conversión y retención para tiendas online." },
        { num: "07", name: "Gestión de Google Business Profile", desc: "Optimización del perfil de negocio, publicaciones, reseñas y visibilidad local." },
      ],
    },
    combos: {
      eyebrow: "Paquetes Combinados",
      title: "Servicios conectados. Una sola contratación clara.",
      desc: "Para empresas que necesitan varias capacidades trabajando juntas, nuestros paquetes combinan contenido, marketing y tecnología en una sola gestión.",
      note: "Sin precios públicos. El alcance del paquete se adapta tras una breve conversación sobre tus requerimientos.",
      discussBtn: "Consultar Paquete",
      cards: [
        {
          id: "video",
          title: "Combo de Videografía",
          desc: "Para marcas que necesitan contenido recurrente, gestión social y una producción mensual constante de video.",
          items: [
            "12 Diseños Estáticos",
            "Gestión de Redes para Meta y TikTok",
            "Gestión Básica de Campañas",
            "1 Sesión de Rodaje de Video",
            "Reportes Mensuales",
          ],
          engagement: "COMPROMISO MENSUAL",
        },
        {
          id: "web",
          featured: true,
          title: "Combo de Sitio Web",
          desc: "Para empresas que necesitan marketing continuo respaldado por un sitio web profesional y mantenido.",
          items: [
            "12 Diseños Estáticos",
            "Gestión de Redes para Meta y TikTok",
            "Gestión Básica de Campañas",
            "Sitio Web Personalizado Incluido",
            "Alojamiento Web Incluido",
            "Mantenimiento Mensual y Soporte Técnico",
            "Reportes Mensuales",
          ],
          engagement: "COMPROMISO DE 6 MESES",
        },
        {
          id: "pos",
          title: "Combo de POS",
          desc: "Para comercios minoristas, restaurantes y servicios que necesitan marketing y un sistema POS operativo juntos.",
          items: [
            "12 Diseños Estáticos",
            "Gestión de Redes para Meta y TikTok",
            "Gestión Básica de Campañas",
            "Sistema POS Personalizado Incluido",
            "Alojamiento Web Incluido",
            "Mantenimiento Mensual y Soporte Técnico",
            "Reportes Mensuales",
          ],
          engagement: "COMPROMISO ANUAL",
        },
      ],
    },
  },
  ar: {
    eyebrow: "خدماتنا",
    title: "اختر ما يحتاجه عملك التجاري",
    tabs: { build: "بناء", create: "ابتكار", grow: "نمو" },
    discussBtn: "ناقش معنا",
    build: {
      title: "بناء",
      desc: "بنية تحتية رقمية وبرمجيات وأنظمة أعمال مصممة وفقاً لطريقة عمل شركتك الفعلية.",
      micro: "من المنصات الموجهة للعملاء إلى العمليات الداخلية والتكامل والأتمتة.",
      services: [
        { num: "01", name: "تطوير المواقع الإلكترونية", desc: "مواقع الشركات، المعارض، المتاجر الإلكترونية والمواقع المخصصة." },
        { num: "02", name: "أنظمة نقاط البيع (POS)", desc: "المبيعات، الفوترة، إدارة المخزون وعمليات الفروع المتعددة." },
        { num: "03", name: "أنظمة تخطيط الموارد (ERP)", desc: "سير عمل مترابط للمالية، الموارد البشرية، المخزون والعمليات." },
        { num: "04", name: "تطوير البرمجيات والتطبيقات المخصصة", desc: "منصات ويب وجوال ومنصات أعمال داخلية مخصصة." },
        { num: "05", name: "أتمتة سير العمل", desc: "أتمتة المهام المتكررة والموافقات والعمليات التشغيلية." },
        { num: "06", name: "تكامل الذكاء الاصطناعي", desc: "وكلاء ومساعدين ذكاء اصطناعي وعمليات أعمال مدعومة به." },
        { num: "07", name: "حلول إدارة علاقات العملاء (CRM)", desc: "أنظمة تتبع العملاء المحتملين والصفقات ومسارات المبيعات." },
        { num: "08", name: "الصيانة والدعم الفني", desc: "المراقبة والتحديثات والإصلاحات وتحسين الأداء والدعم المستمر." },
        { num: "09", name: "تطوير منتجات SaaS", desc: "تصميم وهندسة البرمجيات القائمة على نموذج الاشتراكات." },
        { num: "10", name: "الأمن السيبراني", desc: "فحص الأمان والتحصين والتحكم في الوصول والحماية الرقمية." },
        { num: "11", name: "ترحيل البيانات", desc: "ترحيل منظم عبر المنصات والأنظمة وقواعد البيانات." },
        { num: "12", name: "تحليل البيانات", desc: "لوحات التحكم والتقارير ورؤى الأعمال الداعمة للقرارات." },
        { num: "13", name: "تكامل واجهات البرمجة (API)", desc: "ربط بوابات الدفع والمنصات والأدوات الخارجية بالأنظمة الداخلية." },
      ],
      hosting: {
        eyebrow: "الاستضافة والبنية التحتية",
        title: "استضافة تتوسع مع نمو النظام.",
        desc: "خطط استضافة سنوية للمتطلبات القياسية مع حلول مخصصة لحركة المرور العالية والتخزين والأمان والبريد الإلكتروني.",
        plans: ["استضافة المبتدئين", "استضافة التسويق", "استضافة النخبة", "استضافة الشركات"],
        note: "يمكن تخصيص البنية التحتية بالكامل لتناسب متطلباتك الفنية.",
      },
    },
    create: {
      title: "ابتكار",
      desc: "إنتاج إبداعي للعلامات التجارية التي تحتاج إلى هوية بصرية متناسقة ومحتوى عالي الجودة عبر مختلف القنوات.",
      micro: "تعاقد مع خدمة إنتاج فردية أو قم ببناء سير عمل إبداعي مستمر.",
      services: [
        { num: "01", name: "هوية العلامة التجارية", desc: "أنظمة الهوية، أدلة العلامة التجارية والأصول البصرية." },
        { num: "02", name: "إنتاج الفيديو", desc: "تصوير احترافي متكامل للحملات والشركات ومنصات التواصل." },
        { num: "03", name: "مونتاج الفيديو", desc: "ريلز، إعلانات، مقاطع ترويجية ومونتاج متخصص لشبكات التواصل." },
        { num: "04", name: "التصوير الفوتوغرافي", desc: "تصوير المنتجات، المأكولات، الأفراد، المنشآت والحملات." },
        { num: "05", name: "الموشن جرافيك", desc: "رسوم متحركة وفيديوهات توضيحية وتصميمات إعلانية تفاعلية." },
        { num: "06", name: "التصميم الجرافيكي", desc: "تصاميم احترافية لوسائل التواصل والحملات والمواد الترويجية." },
        { num: "07", name: "استوديو الذكاء الاصطناعي الإبداعي", desc: "صور وفيديوهات وإنتاج حملات تسويقية متقدمة بالذكاء الاصطناعي." },
        { num: "08", name: "محتوى يقدمه مذيعون", desc: "محتوى أمام الكاميرا للتعليم والترويج وسرد قصص العلامة التجارية." },
      ],
    },
    grow: {
      title: "نمو",
      desc: "التسويق عبر الأداء والبحث ومسار العملاء لزيادة الظهور والطلب وجلب عملاء محتملين مؤهلين وتحقيق نمو ملموس.",
      micro: "يمكن تحديد نطاق الاستراتيجية والتنفيذ والتحسين حسب القناة أو كبرنامج نمو شامل.",
      services: [
        { num: "01", name: "إدارة وسائل التواصل الاجتماعي", desc: "التخطيط والنشر وإدارة المجتمع وإعداد التقارير الشهرية." },
        { num: "02", name: "تحسين محركات البحث (SEO)", desc: "تحسين تقني ومحتوى مهيأ لمحركات البحث للظهور في النتائج الأولى." },
        { num: "03", name: "جلب العملاء المحتملين", desc: "حملات ومسارات تحويل مخصصة لاكتساب عملاء مؤهلين للشراء." },
        { num: "04", name: "التسويق عبر الإيميل وواتساب", desc: "حملات دورية وتواصل مؤتمت ومباشر لزيادة المبيعات." },
        { num: "05", name: "الإعلانات الرقمية المدفوعة", desc: "إدارة الحملات الممولة باحترافية على Meta و TikTok و Google." },
        { num: "06", name: "تسويق المتاجر الإلكترونية", desc: "اكتساب العملاء وزيادة معدل التحويل والاحتفاظ بالمشترين." },
        { num: "07", name: "إدارة الملف التجاري في Google", desc: "تحسين الملف والمراجعات والظهور المحلي للوصول لعملاء منطقتك." },
      ],
    },
    combos: {
      eyebrow: "باقات مدمجة",
      title: "خدمات مترابطة. تعاقد واضح ومحدد.",
      desc: "للشركات التي تحتاج قدرات متعددة تعمل معاً بتناغم، تجمع باقاتنا بين المحتوى والتسويق والتكنولوجيا في إدارة واحدة متكاملة.",
      note: "لا تظهر أسعار معلنة. يتم تحديد نطاق الباقة بعد جلسة مناقشة سريعة لمتطلبات عملك.",
      discussBtn: "مناقشة الباقة",
      cards: [
        {
          id: "video",
          title: "باقة تصوير الفيديو",
          desc: "للعلامات التجارية التي تحتاج محتوى مستمراً وإدارة لمنصات التواصل وإنتاج فيديو شهري متواصل.",
          items: [
            "12 تصميماً إبداعياً ثابتاً",
            "إدارة وسائل التواصل لـ Meta و TikTok",
            "إدارة الحملات الأساسية",
            "جلسة تصوير فيديو كاملة",
            "تقارير أداء شهرية",
          ],
          engagement: "تعاقد شهري",
        },
        {
          id: "web",
          featured: true,
          title: "باقة الموقع الإلكتروني",
          desc: "للشركات التي تحتاج تسويقاً مستمراً مدعوماً بموقع إلكتروني احترافي يخضع للصيانة الدورية.",
          items: [
            "12 تصميماً إبداعياً ثابتاً",
            "إدارة وسائل التواصل لـ Meta و TikTok",
            "إدارة الحملات الأساسية",
            "موقع إلكتروني مخصص مشمول",
            "استضافة سريعة مشمولة",
            "صيانة ودعم فني شهري",
            "تقارير أداء شهرية",
          ],
          engagement: "تعاقد لمدة 6 أشهر",
        },
        {
          id: "pos",
          title: "باقة نظام نقاط البيع (POS)",
          desc: "لمحلات التجزئة والمطاعم ومقدمي الخدمات الذين يحتاجون التسويق ونظام نقاط بيع متطور معاً.",
          items: [
            "12 تصميماً إبداعياً ثابتاً",
            "إدارة وسائل التواصل لـ Meta و TikTok",
            "إدارة الحملات الأساسية",
            "نظام POS مخصص مشمول",
            "استضافة سحابية مشمولة",
            "صيانة ودعم فني شهري",
            "تقارير أداء شهرية",
          ],
          engagement: "تعاقد سنوي",
        },
      ],
    },
  },
  si: {
    eyebrow: "අපගේ සේවාවන්",
    title: "ඔබේ ව්‍යාපාරයට අවශ්‍ය දේ තෝරන්න",
    tabs: { build: "ගොඩනැගීම", create: "නිර්මාණය", grow: "වර්ධනය" },
    discussBtn: "සාකච්ඡා කරන්න",
    build: {
      title: "ගොඩනැගීම",
      desc: "ඔබේ සමාගම සැබවින්ම ක්‍රියාත්මක වන ආකාරය අනුව සකස් කරන ලද ඩිජිටල් යටිතල පහසුකම්, මෘදුකාංග සහ ව්‍යාපාරික පද්ධති.",
      micro: "පාරිභෝගික වේදිකාවල සිට අභ්‍යන්තර මෙහෙයුම්, ඒකාබද්ධ කිරීම් සහ ස්වයංක්‍රීයකරණය දක්වා.",
      services: [
        { num: "01", name: "වෙබ් අඩවි සංවර්ධනය", desc: "සංගත, පෝට්ෆෝලියෝ, ඊ-වාණිජ්‍යය සහ අභිරුචි වෙබ් අඩවි." },
        { num: "02", name: "POS පද්ධති", desc: "විකුණුම්, බිල්පත්, තොග සහ බහු ශාඛා මෙහෙයුම්." },
        { num: "03", name: "ERP පද්ධති", desc: "මූල්‍ය, මානව සම්පත්, තොග සහ මෙහෙයුම් සඳහා සම්බන්ධිත කාර්ය ප්‍රවාහ." },
        { num: "04", name: "අභිරුචි මෘදුකාංග සහ යෙදුම්", desc: "අභිරුචිකරණය කළ වෙබ්, ජංගම සහ අභ්‍යන්තර ව්‍යාපාරික වේදිකා." },
        { num: "05", name: "කාර්ය ප්‍රවාහ ස්වයංක්‍රීයකරණය", desc: "පුනරාවර්තන කාර්යයන්, අනුමැතීන් සහ මෙහෙයුම් ස්වයංක්‍රීය කිරීම." },
        { num: "06", name: "AI ඒකාබද්ධ කිරීම", desc: "AI සහායකයින් සහ AI බලගැන්වූ ව්‍යාපාරික ක්‍රියාවලීන්." },
        { num: "07", name: "CRM විසඳුම්", desc: "ගනුදෙනුකරුවන්, විකුණුම් සහ කාර්ය ප්‍රවාහ පද්ධති." },
        { num: "08", name: "නඩත්තුව සහ තාක්ෂණික සහාය", desc: "නිරීක්ෂණය, යාවත්කාලීන කිරීම්, නිවැරදි කිරීම් සහ අඛණ්ඩ සහාය." },
        { num: "09", name: "SaaS නිෂ්පාදන සංවර්ධනය", desc: "දායකත්ව පදනම් කරගත් මෘදුකාංග නිෂ්පාදන සැලසුම් කිරීම." },
        { num: "10", name: "සයිබර් ආරක්ෂාව", desc: "ආරක්ෂක සමාලෝචන, ප්‍රවේශ පාලනයන් සහ ආරක්ෂාව." },
        { num: "11", name: "දත්ත සංක්‍රමණය", desc: "වේදිකා, පද්ධති සහ දත්ත සමුදායන් හරහා ව්‍යුහගත සංක්‍රමණය." },
        { num: "12", name: "දත්ත විශ්ලේෂණය", desc: "වාර්තාකරණය, උපකරණ පුවරු සහ තීරණ ගැනීමට සූදානම් අවබෝධය." },
        { num: "13", name: "API ඒකාබද්ධ කිරීම", desc: "ගෙවීම්, වේදිකා, තෙවන පාර්ශවීය මෙවලම් සහ අභ්‍යන්තර පද්ධති සම්බන්ධ කිරීම." },
      ],
      hosting: {
        eyebrow: "හොස්ටිං සහ යටිතල පහසුකම්",
        title: "පද්ධතිය සමඟ පරිමාණය වන හොස්ටිං.",
        desc: "සම්මත ව්‍යාපාරික අවශ්‍යතා සඳහා වාර්ෂික හොස්ටිං සැලසුම් ලබා ගත හැකි අතර, වැඩි තදබදය, ගබඩා කිරීම, ආරක්ෂාව සඳහා අභිරුචි විසඳුම් ඇත.",
        plans: ["Starter Hosting", "Marketing Hosting", "Elite Hosting", "Enterprise Hosting"],
        note: "ඔබගේ තාක්ෂණික අවශ්‍යතා අනුව අභිරුචි යටිතල පහසුකම් සකස් කළ හැක.",
      },
    },
    create: {
      title: "නිර්මාණය",
      desc: "සියලුම ප්‍රචාරණ සහ නාලිකා හරහා ස්ථාවර දෘශ්‍ය අනන්‍යතාවයක් සහ උසස් තත්ත්වයේ අන්තර්ගතයන් අවශ්‍ය සන්නාම සඳහා නිර්මාණාත්මක නිෂ්පාදනය.",
      micro: "තනි නිෂ්පාදන සේවාවක් ලබා ගන්න හෝ පුනරාවර්තන නිර්මාණාත්මක කාර්ය ප්‍රවාහයක් ගොඩනගන්න.",
      services: [
        { num: "01", name: "සන්නාමකරණය", desc: "අනන්‍යතා පද්ධති, සන්නාම මාර්ගෝපදේශ සහ වත්කම්." },
        { num: "02", name: "වීඩියෝ නිෂ්පාදනය", desc: "ප්‍රචාරණ, සන්නාම සහ සමාජ මාධ්‍ය සඳහා සම්පූර්ණ රූගත කිරීම්." },
        { num: "03", name: "වීඩියෝ සංස්කරණය", desc: "Reels, වෙළඳ දැන්වීම්, ආයතනික සහ සමාජ මාධ්‍ය සංස්කරණ." },
        { num: "04", name: "ඡායාරූපකරණය", desc: "නිෂ්පාදන, ආහාර, පුද්ගලයින්, ස්ථාන සහ ප්‍රචාරණ ඡායාරූපකරණය." },
        { num: "05", name: "චලන ග්‍රැෆික්ස්", desc: "සජීවිකරණ සන්නාම දර්ශන සහ විස්තරාත්මක වීඩියෝ." },
        { num: "06", name: "ග්‍රැෆික් නිර්මාණය", desc: "සමාජ මාධ්‍ය, ප්‍රචාරණ සහ ප්‍රවර්ධන නිර්මාණ." },
        { num: "07", name: "AI නිර්මාණාත්මක චිත්‍රාගාරය", desc: "AI මඟින් මෙහෙයවනු ලබන රූප, වීඩියෝ සහ ප්‍රචාරණ නිෂ්පාදනය." },
        { num: "08", name: "ඉදිරිපත් කරන්නන් සහිත අන්තර්ගතය", desc: "අධ්‍යාපනය, ප්‍රවර්ධනය සහ සන්නාම කතන්දර සඳහා කැමරා අන්තර්ගතය." },
      ],
    },
    grow: {
      title: "වර්ධනය",
      desc: "දෘශ්‍යතාව, ඉල්ලුම, සුදුසුකම් ලත් ගනුදෙනුකරුවන් සහ මැනිය හැකි ව්‍යාපාරික වර්ධනය වැඩි කිරීම සඳහා නිර්මාණය කර ඇති කාර්යසාධනය, සෙවුම් සහ ජීවන චක්‍ර අලෙවිකරණය.",
      micro: "උපාය මාර්ගය, ක්‍රියාත්මක කිරීම, ප්‍රශස්තකරණය සහ වාර්තාකරණය නාලිකාව අනුව හෝ එක් වර්ධන වැඩසටහනක් ලෙස සැලසුම් කළ හැක.",
      services: [
        { num: "01", name: "සමාජ මාධ්‍ය කළමනාකරණය", desc: "සැලසුම් කිරීම, ප්‍රකාශනය කිරීම, ප්‍රජා කළමනාකරණය සහ වාර්තාකරණය." },
        { num: "02", name: "SEO (සෙවුම් යන්ත්‍ර ප්‍රශස්තකරණය)", desc: "තාක්ෂණික, පිටුවේ සහ අන්තර්ගත සෙවුම් ප්‍රශස්තකරණය." },
        { num: "03", name: "ගනුදෙනුකරුවන් ආකර්ෂණය කර ගැනීම", desc: "සුදුසුකම් ලත් ගනුදෙනුකරුවන් ලබා ගැනීම සඳහා ප්‍රචාරණ." },
        { num: "04", name: "ඊමේල් සහ WhatsApp අලෙවිකරණය", desc: "ජීවන චක්‍රය, ප්‍රචාරණ සහ සන්නිවේදනය." },
        { num: "05", name: "ගෙවීම් සහිත වෙළඳ දැන්වීම්", desc: "Meta, TikTok සහ Google ප්‍රචාරණ කළමනාකරණය." },
        { num: "06", name: "ඊ-වාණිජ්‍ය අලෙවිකරණය", desc: "ඔන්ලයින් වෙළඳසැල් සඳහා පාරිභෝගික ආකර්ෂණය සහ රඳවා ගැනීම." },
        { num: "07", name: "Google Business Profile කළමනාකරණය", desc: "පැතිකඩ ප්‍රශස්තකරණය, අන්තර්ගතය, සමාලෝචන සහ දේශීය දෘශ්‍යතාව." },
      ],
    },
    combos: {
      eyebrow: "සංයුක්ත පැකේජ",
      title: "සම්බන්ධිත සේවාවන්. එක් පැහැදිලි ගිවිසුමක්.",
      desc: "එකට ක්‍රියා කරන හැකියාවන් කිහිපයක් අවශ්‍ය ව්‍යාපාර සඳහා, අපගේ සංයුක්ත පැකේජ අන්තර්ගතය, අලෙවිකරණය සහ තාක්ෂණය එක් කළමනාකරණයකට ඒකාබද්ධ කරයි.",
      note: "පොදු මිල ගණන් ප්‍රදර්ශනය නොකෙරේ. කෙටි අවශ්‍යතා සාකච්ඡාවකින් පසු පැකේජයේ විෂය පථය වෙනස් කළ හැක.",
      discussBtn: "පැකේජය ගැන සාකච්ඡා කරන්න",
      cards: [
        {
          id: "video",
          title: "වීඩියෝග්‍රැෆි පැකේජය",
          desc: "පුනරාවර්තන අන්තර්ගතයන්, සමාජ මාධ්‍ය මෙහෙයුම් සහ ස්ථාවර මාසික වීඩියෝ නිෂ්පාදනයක් අවශ්‍ය සන්නාම සඳහා.",
          items: [
            "ස්ථිතික නිර්මාණ 12ක්",
            "Meta සහ TikTok සඳහා සමාජ මාධ්‍ය කළමනාකරණය",
            "මූලික ප්‍රචාරණ කළමනාකරණය",
            "වීඩියෝ රූගත කිරීම් 1ක්",
            "මාසික වාර්තාකරණය",
          ],
          engagement: "මාසික ගිවිසුම",
        },
        {
          id: "web",
          featured: true,
          title: "වෙබ් අඩවි පැකේජය",
          desc: "වෘත්තීයමය වශයෙන් ගොඩනඟන ලද සහ නඩත්තු කරන ලද වෙබ් අඩවියක් මඟින් අඛණ්ඩ අලෙවිකරණයක් අවශ්‍ය ව්‍යාපාර සඳහා.",
          items: [
            "ස්ථිතික නිර්මාණ 12ක්",
            "Meta සහ TikTok සඳහා සමාජ මාධ්‍ය කළමනාකරණය",
            "මූලික ප්‍රචාරණ කළමනාකරණය",
            "අභිරුචි වෙබ් අඩවිය ඇතුළත් වේ",
            "හොස්ටිං ඇතුළත් වේ",
            "මාසික නඩත්තුව සහ තාක්ෂණික සහාය",
            "මාසික වාර්තාකරණය",
          ],
          engagement: "මාස 6ක ගිවිසුම",
        },
        {
          id: "pos",
          title: "POS පද්ධති පැකේජය",
          desc: "අලෙවිකරණය සහ ක්‍රියාකාරී POS පද්ධතියක් එකට අවශ්‍ය සිල්ලර, ආපනශාලා සහ සේවා ව්‍යාපාර සඳහා.",
          items: [
            "ස්ථිතික නිර්මාණ 12ක්",
            "Meta සහ TikTok සඳහා සමාජ මාධ්‍ය කළමනාකරණය",
            "මූලික ප්‍රචාරණ කළමනාකරණය",
            "අභිරුචි POS පද්ධතිය ඇතුළත් වේ",
            "හොස්ටිං ඇතුළත් වේ",
            "මාසික නඩත්තුව සහ තාක්ෂණික සහාය",
            "මාසික වාර්තාකරණය",
          ],
          engagement: "වාර්ෂික ගිවිසුම",
        },
      ],
    },
  },
  ta: {
    eyebrow: "எங்கள் சேவைகள்",
    title: "உங்கள் வணிகத்திற்கு தேவையானதை தேர்வு செய்யவும்",
    tabs: { build: "உருவாக்குதல்", create: "படைத்தல்", grow: "வளர்த்தல்" },
    discussBtn: "கலந்துரையாட",
    build: {
      title: "உருவாக்குதல்",
      desc: "உங்கள் நிறுவனம் உண்மையில் செயல்படும் விதத்தை அடிப்படையாகக் கொண்டு வடிவமைக்கப்பட்ட டிஜிட்டல் உள்கட்டமைப்பு, மென்பொருள் மற்றும் வணிக அமைப்புகள்.",
      micro: "வாடிக்கையாளர் தளங்கள் முதல் உள் செயல்பாடுகள், ஒருங்கிணைப்புகள் மற்றும் ஆட்டோமேஷன் வரை.",
      services: [
        { num: "01", name: "வலைத்தள உருவாக்கம்", desc: "நிறுவன, போர்ட்ஃபோலியோ, மின்-வணிகம் மற்றும் தனிப்பயன் வலைத்தளங்கள்." },
        { num: "02", name: "POS அமைப்புகள்", desc: "விற்பனை, பில்லிங், சரக்கு மற்றும் பல கிளை செயல்பாடுகள்." },
        { num: "03", name: "ERP அமைப்புகள்", desc: "நிதி, மனிதவளம், இருப்பு மற்றும் செயல்பாடுகளுக்கான பணிப்பாய்வுகள்." },
        { num: "04", name: "தனிப்பயன் மென்பொருள் & ஆப்ஸ்", desc: "தனிப்பயனாக்கப்பட்ட வலை, மொபைல் மற்றும் உள் வணிக தளங்கள்." },
        { num: "05", name: "பணிப்பாய்வு ஆட்டோமேஷன்", desc: "மீண்டும் மீண்டும் நிகழும் பணிகள் மற்றும் ஒப்புதல்களை தானியங்குபடுத்துதல்." },
        { num: "06", name: "AI ஒருங்கிணைப்பு", desc: "AI முகவர்கள், உதவியாளர்கள் மற்றும் AI-இயங்கும் வணிக செயல்முறைகள்." },
        { num: "07", name: "CRM தீர்வுகள்", desc: "லீட்கள், பைப்லைன், வாடிக்கையாளர் மற்றும் விற்பனை பணிப்பாய்வு அமைப்புகள்." },
        { num: "08", name: "பராமரிப்பு & தொழில்நுட்ப ஆதரவு", desc: "கண்காணிப்பு, புதுப்பிப்புகள், திருத்தங்கள் மற்றும் தொடர்ச்சியான ஆதரவு." },
        { num: "09", name: "SaaS தயாரிப்பு உருவாக்கம்", desc: "சந்தா அடிப்படையிலான மென்பொருள் தயாரிப்புகளுக்கான வடிவமைப்பு." },
        { num: "10", name: "சைபர் பாதுகாப்பு", desc: "பாதுகாப்பு மதிப்பாய்வுகள், அணுகல் கட்டுப்பாடுகள் மற்றும் பாதுகாப்பு." },
        { num: "11", name: "தரவு இடம்பெயர்வு", desc: "தளங்கள், அமைப்புகள் மற்றும் தரவுத்தளங்கள் முழுவதும் முறையான இடம்பெயர்வு." },
        { num: "12", name: "தரவு பகுப்பாய்வு", desc: "அறிக்கைகள், டாஷ்போர்டுகள் மற்றும் முடிவெடுக்கும் வணிக நுண்ணறிவுகள்." },
        { num: "13", name: "API ஒருங்கிணைப்பு", desc: "கொடுப்பனவுகள், தளங்கள், மூன்றாம் தரப்பு கருவிகள் மற்றும் அமைப்புகளை இணைத்தல்." },
      ],
      hosting: {
        eyebrow: "ஹோஸ்டிங் & உள்கட்டமைப்பு",
        title: "அமைப்போடு விரிவடையும் ஹோஸ்டிங்.",
        desc: "நிலையான வணிகத் தேவைகளுக்கு வருடாந்திர ஹோஸ்டிங் திட்டங்கள் கிடைக்கின்றன, அதிக ட்ராஃபிக், சேமிப்பு, பாதுகாப்புக்கான தனிப்பயன் தீர்வுகள் உள்ளன.",
        plans: ["Starter Hosting", "Marketing Hosting", "Elite Hosting", "Enterprise Hosting"],
        note: "உங்கள் தொழில்நுட்பத் தேவைகளுக்கு ஏற்ப தனிப்பயன் உள்கட்டமைப்பை உருவாக்கலாம்.",
      },
    },
    create: {
      title: "படைத்தல்",
      desc: "பிரச்சாரங்கள் மற்றும் சேனல்கள் முழுவதும் நிலையான காட்சி அடையாளம் மற்றும் உயர்தர உள்ளடக்கம் தேவைப்படும் பிராண்டுகளுக்கான ஆக்கப்பூர்வ தயாரிப்பு.",
      micro: "ஒற்றை தயாரிப்பு சேவையைப் பெறுங்கள் அல்லது தொடர்ச்சியான ஆக்கப்பூர்வ பணிப்பாய்வை உருவாக்குங்கள்.",
      services: [
        { num: "01", name: "பிராண்டிங்", desc: "அடையாள அமைப்புகள், பிராண்ட் வழிகாட்டுதல்கள் மற்றும் சொத்துக்கள்." },
        { num: "02", name: "வீடியோ தயாரிப்பு", desc: "பிரச்சாரங்கள், பிராண்டுகள் மற்றும் சமூக ஊடகங்களுக்கான முழுமையான படப்பிடிப்புகள்." },
        { num: "03", name: "வீடியோ எடிட்டிங்", desc: "ரீல்ஸ், விளம்பரங்கள் மற்றும் சமூக ஊடக பதிவுகள்." },
        { num: "04", name: "புகைப்படக்கலை", desc: "தயாரிப்பு, உணவு, மனிதர்கள், இடங்கள் மற்றும் பிரச்சார புகைப்படம் எடுத்தல்." },
        { num: "05", name: "மோஷன் கிராபிக்ஸ்", desc: "அனிமேஷன் செய்யப்பட்ட பிராண்ட் காட்சிகள் மற்றும் விளக்கப்படங்கள்." },
        { num: "06", name: "கிராஃபிக் வடிவமைப்பு", desc: "சமூக ஊடகங்கள், பிரச்சாரங்கள் மற்றும் விளம்பர வடிவமைப்பு." },
        { num: "07", name: "AI ஆக்கப்பூர்வ ஸ்டுடியோ", desc: "AI வழிகாட்டப்பட்ட படங்கள், வீடியோக்கள் மற்றும் பிரச்சார தயாரிப்பு." },
        { num: "08", name: "வழங்குநர் தலைமையிலான உள்ளடக்கம்", desc: "கல்வி, விளம்பரம் மற்றும் பிராண்ட் கதைகளுக்கான வீடியோ உள்ளடக்கம்." },
      ],
    },
    grow: {
      title: "வளர்த்தல்",
      desc: "பார்வை, தேவை, தகுதியான வாடிக்கையாளர்கள் மற்றும் அளவிடக்கூடிய வணிக வளர்ச்சியை அதிகரிக்க வடிவமைக்கப்பட்ட செயல்திறன், தேடல் மற்றும் வாழ்க்கைச் சுழற்சி சந்தைப்படுத்தல்.",
      micro: "வியூகம், செயல்படுத்தல், மேம்படுத்துதல் மற்றும் அறிக்கையிடல் ஆகியவற்றை சேனல் வாரியாக அல்லது ஒற்றை வளர்ச்சி திட்டமாக திட்டமிடலாம்.",
      services: [
        { num: "01", name: "சமூக ஊடக மேலாண்மை", desc: "திட்டமிடல், வெளியீடு, சமூக மேலாண்மை மற்றும் அறிக்கையிடல்." },
        { num: "02", name: "SEO", desc: "தொழில்நுட்ப மற்றும் உள்ளடக்க தேடல் உகப்பாக்கம்." },
        { num: "03", name: "லீட் ஜெனரேஷன்", desc: "தகுதியான வாடிக்கையாளர்களைப் பெறுவதற்கான பிரச்சாரங்கள்." },
        { num: "04", name: "மின்னஞ்சல் & வாட்ஸ்அப் சந்தைப்படுத்தல்", desc: "வாழ்க்கைச் சுழற்சி மற்றும் நேரடி பிரச்சார தொடர்புகள்." },
        { num: "05", name: "கட்டண விளம்பரம்", desc: "Meta, TikTok மற்றும் Google பிரச்சார மேலாண்மை." },
        { num: "06", name: "மின்-வணிக சந்தைப்படுத்தல்", desc: "ஆன்லைன் ஸ்டோர்களுக்கான வாடிக்கையாளர் கையகப்படுத்தல் மற்றும் தக்கவைப்பு." },
        { num: "07", name: "Google Business Profile மேலாண்மை", desc: "சுயவிவர உகப்பாக்கம், உள்ளடக்கம், மதிப்புரைகள் மற்றும் உள்ளூர் பார்வை." },
      ],
    },
    combos: {
      eyebrow: "கூட்டு தொகுப்புகள்",
      title: "இணைக்கப்பட்ட சேவைகள். ஒரு தெளிவான ஒப்பந்தம்.",
      desc: "பல திறன்கள் ஒன்றாகச் செயல்பட வேண்டிய வணிகங்களுக்கு, எங்கள் கூட்டு தொகுப்புகள் உள்ளடக்கம், சந்தைப்படுத்தல் மற்றும் தொழில்நுட்பத்தை ஒற்றை நிர்வாகத்தில் இணைக்கின்றன.",
      note: "பொதுவான விலைகள் காட்டப்படவில்லை. குறுகிய தேவைகள் குறித்த கலந்துரையாடலுக்குப் பிறகு தொகுப்பின் அளவை மாற்றியமைக்கலாம்.",
      discussBtn: "தொகுப்பை பற்றி பேசுக",
      cards: [
        {
          id: "video",
          title: "வீடியோகிராபி காம்போ",
          desc: "தொடர்ச்சியான உள்ளடக்கம், சமூக ஊடக செயல்பாடுகள் மற்றும் நிலையான மாதாந்திர வீடியோ தயாரிப்பு தேவைப்படும் பிராண்டுகளுக்கு.",
          items: [
            "12 நிலையான கிரியேட்டிவ்கள்",
            "Meta & TikTok க்கான சமூக ஊடக மேலாண்மை",
            "அடிப்படை பிரச்சார மேலாண்மை",
            "1 வீடியோ படப்பிடிப்பு",
            "மாதாந்திர அறிக்கை",
          ],
          engagement: "மாதாந்திர ஒப்பந்தம்",
        },
        {
          id: "web",
          featured: true,
          title: "இணையதள காம்போ",
          desc: "தொழில்முறை ரீதியாக உருவாக்கப்பட்ட மற்றும் பராமரிக்கப்படும் வலைத்தளத்தின் மூலம் தொடர்ச்சியான சந்தைப்படுத்தல் தேவைப்படும் வணிகங்களுக்கு.",
          items: [
            "12 நிலையான கிரியேட்டிவ்கள்",
            "Meta & TikTok க்கான சமூக ஊடக மேலாண்மை",
            "அடிப்படை பிரச்சார மேலாண்மை",
            "தனிப்பயன் வலைத்தளம் சேர்க்கப்பட்டுள்ளது",
            "ஹோஸ்டிங் சேர்க்கப்பட்டுள்ளது",
            "மாதாந்திர பராமரிப்பு & தொழில்நுட்ப ஆதரவு",
            "மாதாந்திர அறிக்கை",
          ],
          engagement: "6 மாத ஒப்பந்தம்",
        },
        {
          id: "pos",
          title: "POS காம்போ",
          desc: "சந்தைப்படுத்தல் மற்றும் செயல்பாட்டு POS அமைப்பை ஒன்றாக விரும்பும் சில்லறை, உணவகம் மற்றும் சேவை வணிகங்களுக்கு.",
          items: [
            "12 நிலையான கிரியேட்டிவ்கள்",
            "Meta & TikTok க்கான சமூக ஊடக மேலாண்மை",
            "அடிப்படை பிரச்சார மேலாண்மை",
            "தனிப்பயன் POS சேர்க்கப்பட்டுள்ளது",
            "ஹோஸ்டிங் சேர்க்கப்பட்டுள்ளது",
            "மாதாந்திர பராமரிப்பு & தொழில்நுட்ப ஆதரவு",
            "மாதாந்திர அறிக்கை",
          ],
          engagement: "வருடாந்திர ஒப்பந்தம்",
        },
      ],
    },
  },
};

const getSavedLang = () => {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("cambm_locale");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.language && I18N_SERVICES[parsed.language]) {
        return parsed.language;
      }
    }
  } catch (e) {}
  const htmlLang = document.documentElement.lang;
  if (htmlLang && I18N_SERVICES[htmlLang]) return htmlLang;
  return "en";
};

const openCalModal = (packageName = "", e = null) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  if (typeof window !== "undefined") {
    // 1. Check if Cal API is initialized on window
    if (typeof window.Cal === "function") {
      try {
        const lang = getSavedLang();
        const calLocale = ["en", "es", "ar"].includes(lang) ? lang : "en";
        const config = {
          layout: "month_view",
          language: calLocale,
          locale: calLocale,
        };
        if (packageName) {
          config["notes"] = `Inquiry regarding: ${packageName}`;
        }
        window.Cal("openModal", {
          calLink: "cambridge.marketing",
          config: config,
        });
        return;
      } catch (err) {
        console.warn("Cal openModal API error:", err);
      }
    }

    // 2. Trigger header Cal button if present in DOM
    const headerCalBtn = document.querySelector(".header .js-open-cal");
    if (headerCalBtn) {
      headerCalBtn.click();
      return;
    }

    // 3. Fallback direct booking link in new tab
    window.open("https://cal.com/cambridge.marketing", "_blank", "noopener,noreferrer");
  }
};

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState("build");
  const [currentLang, setCurrentLang] = useState(getSavedLang);
  const [dynamicServices, setDynamicServices] = useState(null);

  // Sync language with global i18n switcher
  useEffect(() => {
    const handleLocaleChange = (e) => {
      const newLang = e?.detail?.language || getSavedLang();
      if (I18N_SERVICES[newLang]) {
        setCurrentLang(newLang);
      }
    };

    document.addEventListener("cambm:localechange", handleLocaleChange);
    window.addEventListener("storage", handleLocaleChange);

    // Initial check from document element in case changed prior
    const currentDocLang = document.documentElement.lang;
    if (currentDocLang && I18N_SERVICES[currentDocLang] && currentDocLang !== currentLang) {
      setCurrentLang(currentDocLang);
    }

    return () => {
      document.removeEventListener("cambm:localechange", handleLocaleChange);
      window.removeEventListener("storage", handleLocaleChange);
    };
  }, [currentLang]);

  // Dynamic backend services population
  const populateServices = useCallback((list) => {
    if (!Array.isArray(list) || list.length === 0) return;
    const grouped = { build: [], create: [], grow: [] };
    const activeServices = list.filter((s) => s.status !== "inactive" && s.is_active !== false);

    ["build", "create", "grow"].forEach((cat) => {
      const catItems = activeServices
        .filter((s) => (s.category || "").toLowerCase() === cat)
        .sort(
          (a, b) =>
            Number(a.display_order || a.sort_order || 0) -
            Number(b.display_order || b.sort_order || 0)
        );

      if (catItems.length > 0) {
        grouped[cat] = catItems.map((item, idx) => ({
          id: item.id || `srv_${idx}`,
          num: String(idx + 1).padStart(2, "0"),
          name: item.name,
          desc: item.description,
        }));
      }
    });

    setDynamicServices(grouped);
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("cambm_services");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          populateServices(parsed);
        }
      }
    } catch (e) {}

    fetch("/api/services")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = data?.services || data?.data;
        if (data && data.success && Array.isArray(list) && list.length > 0) {
          populateServices(list);
          try {
            localStorage.setItem("cambm_services", JSON.stringify(list));
          } catch (e) {}
        }
      })
      .catch(() => {});

    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem("cambm_services");
        if (saved) {
          const parsed = JSON.parse(saved);
          populateServices(parsed);
        }
      } catch (e) {}
    };

    window.addEventListener("cambm_services_updated", handleUpdate);
    return () => {
      window.removeEventListener("cambm_services_updated", handleUpdate);
    };
  }, [populateServices]);

  const activeLocaleData = useMemo(() => {
    return I18N_SERVICES[currentLang] || I18N_SERVICES.en;
  }, [currentLang]);

  const currentTab = useMemo(() => {
    const baseTab = activeLocaleData[activeTab] || I18N_SERVICES.en[activeTab];
    if (dynamicServices && dynamicServices[activeTab] && dynamicServices[activeTab].length > 0) {
      return {
        ...baseTab,
        services: dynamicServices[activeTab],
      };
    }
    return baseTab;
  }, [activeLocaleData, activeTab, dynamicServices]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cambm:observe-reveal"));
    }
  }, [activeTab, currentLang]);

  return (
    <section className="packages srv-section" id="packages" style={{ scrollMarginTop: "90px" }}>
      {/* Section Header */}
      <div className="section-inner packages-heading">
        <p className="section-eyebrow" data-i18n="packages.eyebrow">
          {activeLocaleData.eyebrow}
        </p>
        <h2 className="section-title" data-i18n="packages.title">
          {activeLocaleData.title}
        </h2>
      </div>

      {/* Segmented Switcher */}
      <div className="segmented-wrap">
        <div className="segmented" role="tablist" aria-label="Service categories">
          <div
            className="segmented-glider"
            style={{
              transform: `translateX(${
                activeTab === "build" ? "0%" : activeTab === "create" ? "100%" : "200%"
              })`,
            }}
          />
          <button
            type="button"
            className={`tab ${activeTab === "build" ? "active" : ""}`}
            data-tab="build"
            data-i18n="packages.tab.build"
            onClick={() => setActiveTab("build")}
          >
            {activeLocaleData.tabs.build}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === "create" ? "active" : ""}`}
            data-tab="create"
            data-i18n="packages.tab.create"
            onClick={() => setActiveTab("create")}
          >
            {activeLocaleData.tabs.create}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === "grow" ? "active" : ""}`}
            data-tab="grow"
            data-i18n="packages.tab.grow"
            onClick={() => setActiveTab("grow")}
          >
            {activeLocaleData.tabs.grow}
          </button>
        </div>
      </div>

      {/* Dynamic Service Panel */}
      <div className="page" style={{ maxWidth: "1360px", margin: "0 auto", padding: "0 24px" }}>
        <div className="service-shell" key={activeTab}>
          <div className="service-main">
            <aside className="service-intro" key={`intro-${activeTab}`}>
              <h2>{currentTab.title}</h2>
              <p>{currentTab.desc}</p>
              <div style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="srv-intro-cta js-open-cal"
                  data-cal-link="cambridge.marketing"
                  data-cal-namespace="strategy-call"
                  onClick={(e) => openCalModal(`${currentTab.title} Services`, e)}
                >
                  {activeLocaleData.discussBtn} <span>→</span>
                </button>
              </div>
              <div className="micro">{currentTab.micro}</div>
            </aside>
            <div className="service-list" key={`list-${activeTab}-${currentLang}`}>
              {currentTab.services.map((item) => (
                <div
                  key={item.id || item.num}
                  className="service-row"
                  onClick={(e) => openCalModal(`${item.name} (${currentTab.title})`, e)}
                  style={{ cursor: "pointer" }}
                  title={`Discuss ${item.name}`}
                >
                  <div className="num">{item.num}</div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hosting section for BUILD tab */}
          {currentTab.hosting && (
            <div className="hosting">
              <div>
                <p className="eyebrow" style={{ marginBottom: "10px" }}>
                  {currentTab.hosting.eyebrow}
                </p>
                <h3>{currentTab.hosting.title}</h3>
                <p>{currentTab.hosting.desc}</p>
              </div>
              <div className="hosting-plans">
                {currentTab.hosting.plans.map((plan) => (
                  <div
                    key={plan}
                    className="host-pill"
                    onClick={(e) => openCalModal(plan, e)}
                    style={{ cursor: "pointer" }}
                    title={`Discuss ${plan}`}
                  >
                    {plan}
                  </div>
                ))}
                <div className="host-note">{currentTab.hosting.note}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Combo Packages Section ── */}
        <section className="combos" aria-labelledby="combo-title">
          <div className="combos-heading" style={{ textAlign: "center", marginBottom: "38px" }}>
            <p className="section-eyebrow eyebrow" style={{ margin: "0 auto 12px", textAlign: "center" }} data-i18n="packages.combos.eyebrow">
              {activeLocaleData.combos.eyebrow}
            </p>
            <h2 id="combo-title" style={{ textAlign: "center", margin: "0 auto" }} data-i18n="packages.combos.title">
              {activeLocaleData.combos.title}
            </h2>
            <p
              className="lede"
              style={{
                fontSize: "16px",
                maxWidth: "720px",
                margin: "16px auto 0",
                textAlign: "center",
              }}
              data-i18n="packages.combos.desc"
            >
              {activeLocaleData.combos.desc}
            </p>
            <p
              className="right-note"
              style={{
                fontSize: "13px",
                maxWidth: "600px",
                margin: "12px auto 0",
                textAlign: "center",
              }}
              data-i18n="packages.combos.note"
            >
              {activeLocaleData.combos.note}
            </p>
          </div>

          <div className="combo-grid">
            {activeLocaleData.combos.cards.map((card) => (
              <article
                key={card.id}
                className="combo-card"
              >
                <h3>{card.title}</h3>
                <p className="best">{card.desc}</p>
                <ul className="combo-items">
                  {card.items.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
                <div className="combo-footer">
                  <span className="engagement">{card.engagement}</span>
                  <button
                    type="button"
                    className="srv-combo-cta js-open-cal"
                    data-cal-link="cambridge.marketing"
                    data-cal-namespace="strategy-call"
                    onClick={(e) => openCalModal(card.title, e)}
                  >
                    {activeLocaleData.combos.discussBtn}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
