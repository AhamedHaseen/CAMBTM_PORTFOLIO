import React, { useState, useEffect } from 'react';

const DEFAULT_SOCIAL_LINKS = {
  whatsapp: 'https://wa.me/94766490522?text=Hi%20Cambridge%20Marketing!%20I%20found%20you%20through%20your%20website%20and%20I%27d%20like%20to%20grow%20my%20business%20with%20you.%20Can%20we%20talk%3F',
  instagram: 'https://www.instagram.com/cambm.lk/',
  facebook: 'https://web.facebook.com/profile.php?id=61590765272716',
  linkedin: 'https://www.linkedin.com/company/cambridgemarketing/'
};

/**
 * Reads contacts from localStorage and returns the social_links
 * from the primary (or first active) office.
 */
function getPrimarySocialLinks() {
  try {
    const raw = localStorage.getItem('cambm_contacts') || localStorage.getItem('cambm_admin_contacts');
    if (raw) {
      const contacts = JSON.parse(raw);
      if (Array.isArray(contacts) && contacts.length > 0) {
        const primary = contacts.find(c => c.is_primary && c.status !== 'inactive');
        const active = contacts.find(c => c.status !== 'inactive');
        const chosen = primary || active;
        if (chosen?.social_links) {
          return {
            whatsapp: chosen.social_links.whatsapp || DEFAULT_SOCIAL_LINKS.whatsapp,
            instagram: chosen.social_links.instagram || DEFAULT_SOCIAL_LINKS.instagram,
            facebook: chosen.social_links.facebook || DEFAULT_SOCIAL_LINKS.facebook,
            linkedin: chosen.social_links.linkedin || DEFAULT_SOCIAL_LINKS.linkedin
          };
        }
      }
    }
  } catch {}
  return { ...DEFAULT_SOCIAL_LINKS };
}

/**
 * Returns the primary contact info (phone + social_links) from localStorage.
 * Used by floating buttons.
 */
export function getPrimaryContactInfo() {
  try {
    const raw = localStorage.getItem('cambm_contacts') || localStorage.getItem('cambm_admin_contacts');
    if (raw) {
      const contacts = JSON.parse(raw);
      if (Array.isArray(contacts) && contacts.length > 0) {
        const primary = contacts.find(c => c.is_primary && c.status !== 'inactive');
        const active = contacts.find(c => c.status !== 'inactive');
        const chosen = primary || active;
        if (chosen) {
          return {
            phone: chosen.phone || '+94 76 649 0522',
            whatsapp: chosen.social_links?.whatsapp || DEFAULT_SOCIAL_LINKS.whatsapp,
          };
        }
      }
    }
  } catch {}
  return {
    phone: '+94 76 649 0522',
    whatsapp: DEFAULT_SOCIAL_LINKS.whatsapp
  };
}

/**
 * React hook that returns dynamic social links from the primary office.
 * Automatically refreshes when admin updates contacts.
 */
export function useSocialLinks() {
  const [links, setLinks] = useState(getPrimarySocialLinks);

  useEffect(() => {
    const handleUpdate = () => {
      setLinks(getPrimarySocialLinks());
    };
    window.addEventListener('cambm_contacts_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cambm_contacts_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return links;
}

/**
 * <FooterSocials /> — renders WhatsApp, Instagram, Facebook, LinkedIn
 * icons with dynamic hrefs from the primary office's social_links.
 */
export default function FooterSocials() {
  const links = useSocialLinks();

  return (
    <div className="footer-socials">
      {links.whatsapp && (
        <a
          href={links.whatsapp}
          id="footerSocialWhatsApp"
          className="footer-social"
          aria-label="WhatsApp"
          target="_blank"
          rel="noopener"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}

      {links.instagram && (
        <a
          href={links.instagram}
          id="footerSocialInstagram"
          className="footer-social"
          aria-label="Instagram"
          target="_blank"
          rel="noopener"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>
      )}

      {links.facebook && (
        <a
          href={links.facebook}
          id="footerSocialFacebook"
          className="footer-social"
          aria-label="Facebook"
          target="_blank"
          rel="noopener"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
          </svg>
        </a>
      )}

      {links.linkedin && (
        <a
          href={links.linkedin}
          className="footer-social"
          aria-label="LinkedIn"
          target="_blank"
          rel="noopener"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      )}
    </div>
  );
}
