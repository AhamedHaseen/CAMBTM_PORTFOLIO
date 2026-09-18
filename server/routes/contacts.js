import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';
import { recordAudit } from '../middleware/audit.js';
import { sendCustomScopeInquiryEmail } from '../utils/mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/contacts.json');

const router = express.Router();

const INITIAL_CONTACTS = [
  {
    id: 1,
    location_name: 'Cambridge Marketing - Sri Lanka',
    phone: '+94 76 649 0522',
    address: '328/3 Temple Road, Kaduwela Road, Battaramulla, Colombo, Sri Lanka 10120',
    email: 'marketing@cambt.com',
    country_code: 'LK',
    is_primary: true,
    display_order: 1,
    status: 'active',
    social_links: {
      whatsapp: 'https://wa.me/94766490522?text=Hi%20Cambridge%20Marketing!%20I%20found%20you%20through%20your%20website%20and%20I%27d%20like%20to%20grow%20my%20business%20with%20you.%20Can%20we%20talk%3F',
      instagram: 'https://www.instagram.com/cambm.lk/',
      facebook: 'https://web.facebook.com/profile.php?id=61590765272716',
      linkedin: 'https://www.linkedin.com/company/cambridgemarketing/'
    }
  },
  {
    id: 2,
    location_name: 'Cambridge Marketing - Saudi Arabia',
    phone: '+966 50 123 4567',
    address: 'City Centre, Mishrifah, Jeddah, Saudi Arabia',
    email: 'marketing@cambt.com',
    country_code: 'SA',
    is_primary: false,
    display_order: 2,
    status: 'active',
    social_links: {
      whatsapp: 'https://wa.me/966501234567?text=Hi%20Cambridge%20Marketing!',
      instagram: 'https://www.instagram.com/cambm.lk/',
      facebook: 'https://web.facebook.com/profile.php?id=61590765272716',
      linkedin: 'https://www.linkedin.com/company/cambridgemarketing/'
    }
  }
];

function loadContactsFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading contacts.json:', err.message);
  }
  return [...INITIAL_CONTACTS];
}

function saveContactsToFile(list) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing contacts.json:', err.message);
  }
}

let inMemoryContacts = loadContactsFromFile();

// ── GET /api/contacts ──
router.get('/', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';

    if (supabase) {
      let query = supabase.from('contacts').select('*').order('display_order', { ascending: true });
      if (!showAll) {
        query = query.eq('status', 'active');
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return res.json({ success: true, contacts: data });
      }
    }

    const filtered = showAll ? inMemoryContacts : inMemoryContacts.filter(c => c.status === 'active');
    filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    return res.json({ success: true, contacts: filtered });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return res.json({ success: true, contacts: inMemoryContacts });
  }
});

// ── POST /api/contacts (Create new office location) ──
router.post('/', async (req, res) => {
  try {
    const {
      location_name,
      phone,
      address,
      email = 'marketing@cambt.com',
      country_code = 'LK',
      is_primary = false,
      display_order = inMemoryContacts.length + 1,
      status = 'active',
      social_links = {}
    } = req.body;

    if (!location_name || !location_name.trim()) {
      return res.status(400).json({ success: false, error: 'Location name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, error: 'Physical address is required' });
    }

    const newId = Date.now();
    const newContact = {
      id: newId,
      location_name: location_name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      email: (email || 'marketing@cambt.com').trim(),
      country_code: (country_code || 'LK').trim().toUpperCase(),
      is_primary: Boolean(is_primary),
      display_order: Number(display_order) || (inMemoryContacts.length + 1),
      status: status || 'active',
      social_links: social_links || {}
    };

    if (newContact.is_primary) {
      inMemoryContacts.forEach(c => { c.is_primary = false; });
    }

    if (supabase) {
      try {
        if (newContact.is_primary) {
          await supabase.from('contacts').update({ is_primary: false }).neq('id', -1);
        }
        const { data, error } = await supabase.from('contacts').insert([newContact]).select().single();
        if (!error && data) {
          inMemoryContacts.push(data);
          recordAudit(req, 'CREATE_CONTACT', `Created contact: ${location_name}`).catch(() => {});
          return res.status(201).json({ success: true, contact: data });
        }
      } catch {}
    }

    inMemoryContacts.push(newContact);
    saveContactsToFile(inMemoryContacts);
    recordAudit(req, 'CREATE_CONTACT', `Created contact: ${location_name}`).catch(() => {});
    return res.status(201).json({ success: true, contact: newContact });
  } catch (err) {
    console.error('Error creating contact:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to create contact' });
  }
});

// ── PUT /api/contacts/:id (Update contact location) ──
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id) || req.params.id;
    const updates = { ...req.body };
    delete updates.id;

    if (updates.is_primary) {
      inMemoryContacts.forEach(c => { c.is_primary = false; });
      if (supabase) {
        try {
          await supabase.from('contacts').update({ is_primary: false }).neq('id', id);
        } catch {}
      }
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.from('contacts').update(updates).eq('id', id).select().single();
        if (!error && data) {
          const idx = inMemoryContacts.findIndex(c => c.id == id);
          if (idx !== -1) inMemoryContacts[idx] = data;
          saveContactsToFile(inMemoryContacts);
          recordAudit(req, 'UPDATE_CONTACT', `Updated contact: ${id}`).catch(() => {});
          return res.json({ success: true, contact: data });
        }
      } catch {}
    }

    const idx = inMemoryContacts.findIndex(c => c.id == id);
    if (idx !== -1) {
      inMemoryContacts[idx] = { ...inMemoryContacts[idx], ...updates };
      saveContactsToFile(inMemoryContacts);
      recordAudit(req, 'UPDATE_CONTACT', `Updated contact: ${id}`).catch(() => {});
      return res.json({ success: true, contact: inMemoryContacts[idx] });
    }

    return res.status(404).json({ success: false, error: 'Contact location not found' });
  } catch (err) {
    console.error('Error updating contact:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update contact' });
  }
});

// ── DELETE /api/contacts/:id (Delete contact location) ──
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id) || req.params.id;

    if (supabase) {
      try {
        await supabase.from('contacts').delete().eq('id', id);
      } catch {}
    }

    inMemoryContacts = inMemoryContacts.filter(c => c.id != id);
    saveContactsToFile(inMemoryContacts);
    recordAudit(req, 'DELETE_CONTACT', `Deleted contact: ${id}`).catch(() => {});
    return res.json({ success: true, message: 'Contact location deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete contact' });
  }
});

// ── POST /api/contacts/custom-scope (Receive pricing custom plan form & email notification) ──
router.post('/custom-scope', async (req, res) => {
  try {
    const { name, email, phone, company, notes, services } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'A valid email address with domain is required (e.g. name@company.com)' });
    }

    const sanitizedPhone = phone ? String(phone).replace(/[^0-9+\s\-()]/g, '').slice(0, 18).trim() : '';

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Dispatch email notification via SMTP / nodemailer
    const emailResult = await sendCustomScopeInquiryEmail({
      name: name.trim(),
      email: email.trim(),
      phone: sanitizedPhone,
      company: company ? company.trim() : '',
      notes: notes ? notes.trim() : '',
      services: Array.isArray(services) ? services : [],
      ip,
      userAgent
    });

    recordAudit(req, 'CUSTOM_SCOPE_INQUIRY', `Inquiry from ${name} (${email}) for ${(services || []).length} services`).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Your custom package scope has been submitted and sent to our team!',
      emailResult
    });
  } catch (err) {
    console.error('Error handling custom scope submission:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to submit custom scope inquiry'
    });
  }
});

export default router;
