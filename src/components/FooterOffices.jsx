import React, { useState, useEffect } from 'react';

const DEFAULT_OFFICES = [
  {
    id: 2,
    country_code: 'SA',
    location_name: 'Cambridge Marketing - Saudi Arabia',
    phone: '+966 50 123 4567',
    address: 'City Centre, Mishrifah, Jeddah, Saudi Arabia',
    email: 'marketing@cambt.com',
    status: 'active'
  },
  {
    id: 1,
    country_code: 'LK',
    location_name: 'Cambridge Marketing - Sri Lanka',
    phone: '+94 76 649 0522',
    address: '328/3 Temple Road, Kaduwela Road, Battaramulla, Colombo, Sri Lanka 10120',
    email: 'marketing@cambt.com',
    status: 'active'
  }
];

function OfficeFlag({ code }) {
  const normalized = (code || '').toUpperCase().trim();

  if (normalized === 'LK' || normalized === 'SRI LANKA') {
    return (
      <img
        src="/images/flags/sri-lanka.svg"
        alt="Sri Lanka Flag"
        width="44"
        height="26"
        style={{
          borderRadius: '5px',
          display: 'block',
          objectFit: 'cover',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)'
        }}
        loading="lazy"
      />
    );
  }

  if (normalized === 'SA' || normalized === 'SAUDI ARABIA') {
    return (
      <img
        src="/images/flags/saudi-arabia.svg"
        alt="Saudi Arabia Flag"
        width="44"
        height="28"
        style={{
          borderRadius: '5px',
          display: 'block',
          objectFit: 'cover',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)'
        }}
        loading="lazy"
      />
    );
  }

  return <span>{code || 'LK'}</span>;
}

export default function FooterOffices() {
  const [offices, setOffices] = useState(() => {
    try {
      const cached = localStorage.getItem('cambm_contacts') || localStorage.getItem('cambm_admin_contacts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_OFFICES;
  });

  const loadOffices = () => {
    const endpoints = ['/api/contacts', 'http://127.0.0.1:5000/api/contacts'];
    const tryFetch = async () => {
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data && data.success && Array.isArray(data.contacts) && data.contacts.length > 0) {
              setOffices(data.contacts);
              try {
                localStorage.setItem('cambm_contacts', JSON.stringify(data.contacts));
                localStorage.setItem('cambm_admin_contacts', JSON.stringify(data.contacts));
              } catch {}
              return;
            }
          }
        } catch {}
      }
    };
    tryFetch();
  };

  useEffect(() => {
    loadOffices();

    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('cambm_contacts') || localStorage.getItem('cambm_admin_contacts');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setOffices(parsed);
        }
      } catch {}
      loadOffices();
    };

    window.addEventListener('cambm_contacts_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('cambm_contacts_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const activeList = offices.filter(o => o.status !== 'inactive');
  const visibleOffices = activeList.length > 0 ? activeList : DEFAULT_OFFICES;

  return (
    <section
      className="footer-offices"
      aria-label="Our offices"
      data-i18n-attr="aria-label:footer.office.label"
    >
      {visibleOffices.map((office) => (
        <article key={office.id || office.location_name} className="footer-office">
          <span className="footer-office-code" aria-hidden="true">
            <OfficeFlag code={office.country_code} />
          </span>
          <h3>
            {office.location_name}
          </h3>
          <dl className="footer-office-details">
            <div>
              <dt data-i18n="footer.office.phone">Contact number</dt>
              <dd>
                <a href={`tel:${(office.phone || '').replace(/[^+\d]/g, '')}`}>{office.phone}</a>
              </dd>
            </div>
            <div>
              <dt data-i18n="footer.office.address">Address</dt>
              <dd>
                <address>
                  {office.address}
                </address>
              </dd>
            </div>
            <div>
              <dt data-i18n="footer.office.email">Email</dt>
              <dd>
                <a href={`mailto:${office.email || 'marketing@cambt.com'}`}>
                  {office.email || 'marketing@cambt.com'}
                </a>
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </section>
  );
}
