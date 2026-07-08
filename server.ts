import express from "express";
import pg from "pg";
import path from "path";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";
import { config as loadEnv } from "dotenv";

// Load environment variables from .env file (local dev)
loadEnv();

const { Pool } = pg;
const PORT = 3000;

// Lazy initialized database pool
let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (pool) return pool;

  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  console.log(`[Database] Initializing connection pool using target URL...`);
  pool = new Pool({
    connectionString: dbUrl,
    max: process.env.VERCEL ? 1 : 10, // Limit to 1 connection per serverless function to prevent Supabase connection exhaustion
    idleTimeoutMillis: 10000, // Close idle connections after 10 seconds
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
  });

  return pool;
}

// --- LOCAL JSON DATABASE FALLBACK SYSTEM ---
const LOCAL_DB_PATH = path.join(process.cwd(), 'invitations_local_db.json');
let localDB: Record<string, any> = {};

// Load local DB if present
if (fs.existsSync(LOCAL_DB_PATH)) {
  try {
    localDB = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
    console.log("[Database Fallback] Loaded local JSON file-based database.");
  } catch (e) {
    console.warn("[Database Fallback] Failed to read local DB, running with empty cache.");
  }
}

const DEFAULT_SEED_ASSETS = [
  // Florals
  { id: 'f1', name: 'Gold Eucalyptus', category: 'florals', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M50 95V10" stroke="#8C7A5B" stroke-width="2.5"/><path d="M50 80C30 75 25 62 25 50C25 38 35 38 50 50" fill="#D4AF37" fill-opacity="0.15"/><path d="M50 80C70 75 75 62 75 50C75 38 65 38 50 50" fill="#D4AF37" fill-opacity="0.15"/><path d="M50 50C32 45 28 35 28 25C28 15 38 15 50 25" fill="#D4AF37" fill-opacity="0.2"/><path d="M50 50C68 45 72 35 72 25C72 15 62 15 50 25" fill="#D4AF37" fill-opacity="0.2"/><path d="M50 25C40 20 35 14 35 8C35 2 45 2 50 8" fill="#D4AF37" fill-opacity="0.25"/><path d="M50 25C60 20 65 14 65 8C65 2 55 2 50 8" fill="#D4AF37" fill-opacity="0.25"/></svg>`) },
  { id: 'f2', name: 'Laurel Wreath', category: 'florals', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M50 85C30 85 15 70 15 50C15 30 30 15 50 15" stroke-dasharray="2 2" stroke-width="1"/><path d="M50 85C70 85 85 70 85 50C85 30 70 15 50 15" stroke-dasharray="2 2" stroke-width="1"/><path d="M22 75C21 73 18 70 15 72C12 74 13 77 15 79C17 81 20 78 22 75Z" fill="#D4AF37"/><path d="M15 62C15 60 11 58 9 60C7 62 8 65 10 67C12 69 15 65 15 62Z" fill="#D4AF37"/><path d="M14 48C15 46 11 43 10 45C9 47 10 50 12 52C14 54 14 50 14 48Z" fill="#D4AF37"/><path d="M18 34C19 32 16 29 14 31C12 33 12 36 14 38C16 40 17 36 18 34Z" fill="#D4AF37"/><path d="M26 22C28 21 25 17 23 18C21 19 20 22 21 24C22 26 25 24 26 22Z" fill="#D4AF37"/><path d="M37 15C39 15 38 10 35 10C32 10 31 13 32 15C33 17 35 16 37 15Z" fill="#D4AF37"/><path d="M78 75C79 73 82 70 85 72C88 74 87 77 85 79C83 81 80 78 78 75Z" fill="#D4AF37"/><path d="M85 62C85 60 89 58 91 60C93 62 92 65 90 67C88 69 85 65 85 62Z" fill="#D4AF37"/><path d="M86 48C85 46 89 43 90 45C91 47 90 50 88 52C86 54 86 50 86 48Z" fill="#D4AF37"/><path d="M82 34C81 32 84 29 86 31C88 33 88 36 86 38C84 40 83 36 82 34Z" fill="#D4AF37"/><path d="M74 22C72 21 75 17 77 18C79 19 80 22 79 24C78 26 75 24 74 22Z" fill="#D4AF37"/><path d="M63 15C61 15 62 10 65 10C68 10 69 13 68 15C67 17 65 16 63 15Z" fill="#D4AF37"/></svg>`) },
  { id: 'f3', name: 'Earthy Fern', category: 'florals', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#8C7A5B" stroke-width="1.8" stroke-linecap="round"><path d="M20 90Q45 75 75 25" stroke-width="2.5"/><path d="M32 78Q20 72 17 74M32 78Q17 83 15 81" /><path d="M40 70Q28 62 25 64M40 70Q25 74 23 72" /><path d="M48 61Q36 52 33 54M48 61Q33 64 31 62" /><path d="M56 51Q44 42 41 44M56 51Q44 54 42 52" /><path d="M64 40Q54 31 51 33M64 40Q51 43 49 41" /><path d="M71 31Q63 23 60 25M71 31Q60 33 58 31" /><path d="M32 78Q42 74 45 76M32 78Q45 81 47 79" /><path d="M40 70Q51 64 54 66M40 70Q54 71 56 69" /><path d="M48 61Q60 54 63 56M48 61Q63 62 65 60" /><path d="M56 51Q67 43 70 45M56 51Q70 51 72 49" /><path d="M64 40Q74 32 77 34M64 40Q77 40 79 38" /></svg>`) },
  { id: 'f4', name: 'Rose Bud', category: 'florals', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="1.8" stroke-linecap="round"><path d="M50 95V55" stroke="#8C7A5B" stroke-width="2"/><path d="M50 75Q33 70 41 62" stroke="#8C7A5B"/><path d="M50 65Q67 60 59 52" stroke="#8C7A5B"/><path d="M50 55C38 55 32 45 32 35C32 25 42 15 50 15C58 15 68 25 68 35C68 45 62 55 50 55Z" fill="#D4AF37" fill-opacity="0.1"/><path d="M50 22C45 25 42 30 43 35C44 40 47 44 50 48C53 44 56 40 57 35C58 30 55 25 50 22Z" fill="#D4AF37" fill-opacity="0.2"/><path d="M50 15C48 20 41 25 41 32C41 40 50 45 50 45"/><path d="M50 15C52 20 59 25 59 32C59 40 50 45 50 45"/><path d="M38 30C43 28 50 32 50 35"/></svg>`) },
  { id: 'f5', name: 'Monstera Leaf', category: 'florals', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#D4AF37" fill-opacity="0.15" stroke="#D4AF37" stroke-width="1.8" stroke-linecap="round"><path d="M50 95V10" stroke-width="2.5"/><path d="M50 15C22 15 18 40 18 60C18 75 32 85 50 85C68 85 82 75 82 60C82 40 78 15 50 15Z" /><path d="M18 45Q36 48 42 46" stroke-width="2"/><path d="M16 58Q33 60 40 58" stroke-width="2"/><path d="M19 70Q34 71 41 68" stroke-width="2"/><path d="M82 45Q64 48 58 46" stroke-width="2"/><path d="M84 58Q67 60 60 58" stroke-width="2"/><path d="M81 70Q66 71 59 68" stroke-width="2"/></svg>`) },
  { id: 'f6', name: 'Water Lily', category: 'florals', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="1.8"><path d="M50 85C18 85 8 65 8 50C8 35 28 35 50 50C72 35 92 35 92 50C92 65 82 85 50 85Z" fill="#D4AF37" fill-opacity="0.05"/><path d="M50 80C40 70 32 55 40 40C43 35 50 30 50 30C50 30 57 35 60 40C68 55 60 70 50 80Z" fill="#D4AF37" fill-opacity="0.2"/><path d="M50 80C28 75 18 60 26 45C30 40 38 38 40 40" stroke-linecap="round"/><path d="M50 80C72 75 82 60 74 45C70 40 62 38 60 40" stroke-linecap="round"/><path d="M50 30C48 18 52 12 52 12C52 12 56 18 54 30" stroke-linecap="round"/><path d="M40 40C36 28 41 21 43 21C45 21 46 28 44 38" stroke-linecap="round"/><path d="M60 40C64 28 59 21 57 21C55 21 54 28 56 38" stroke-linecap="round"/></svg>`) },
  { id: 'f7', name: 'Pink Sakura', category: 'florals', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#E07A5F" stroke-width="1.8"><path d="M50 50 C40 35 30 35 35 50 C30 65 40 65 50 50 C60 65 70 65 65 50 C70 35 60 35 50 50 Z" fill="#F4F1DE" fill-opacity="0.3"/><circle cx="50" cy="50" r="5" fill="#E07A5F"/><path d="M50 45V30M50 55V70M45 50H30M55 50H70" stroke="#E07A5F" stroke-width="1" stroke-linecap="round"/><circle cx="50" cy="28" r="1.5" fill="#E07A5F"/><circle cx="50" cy="72" r="1.5" fill="#E07A5F"/><circle cx="28" cy="50" r="1.5" fill="#E07A5F"/><circle cx="72" cy="50" r="1.5" fill="#E07A5F"/></svg>`) },
  { id: 'f8', name: 'Olive Branch', category: 'florals', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#708238" stroke-width="1.8" stroke-linecap="round"><path d="M15 85Q45 65 85 25" stroke-width="2.5"/><path d="M35 70Q20 58 18 64C16 70 30 72 35 70Z" fill="#708238" fill-opacity="0.2"/><path d="M48 58Q33 46 31 52C29 58 43 60 48 58Z" fill="#708238" fill-opacity="0.2"/><path d="M62 44Q47 32 45 38C43 44 57 46 62 44Z" fill="#708238" fill-opacity="0.2"/><path d="M42 62Q57 50 59 56C61 62 47 64 42 62Z" fill="#708238" fill-opacity="0.2"/><path d="M55 50Q70 38 72 44C74 50 60 52 55 50Z" fill="#708238" fill-opacity="0.2"/><path d="M68 38Q83 26 85 32C87 38 73 40 68 38Z" fill="#708238" fill-opacity="0.2"/></svg>`) },

  // Luxury
  { id: 'l1', name: 'Hex Frame', category: 'luxury', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="1.8"><polygon points="50,10 85,30 85,70 50,90 15,70 15,30"/><polygon points="50,15 80,32 80,68 50,85 20,68 20,32" stroke-width="1" stroke-dasharray="2 2"/><circle cx="50" cy="10" r="2.5" fill="#D4AF37"/><circle cx="85" cy="30" r="2.5" fill="#D4AF37"/><circle cx="85" cy="70" r="2.5" fill="#D4AF37"/><circle cx="50" cy="90" r="2.5" fill="#D4AF37"/><circle cx="15" cy="70" r="2.5" fill="#D4AF37"/><circle cx="15" cy="30" r="2.5" fill="#D4AF37"/></svg>`) },
  { id: 'l2', name: 'Gold Crown', category: 'luxury', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="1.8"><path d="M15 75L22 40L40 55L50 25L60 55L78 40L85 75H15Z" fill="#D4AF37" fill-opacity="0.1"/><circle cx="50" cy="22" r="3.5" fill="#D4AF37"/><circle cx="22" cy="37" r="2.5" fill="#D4AF37"/><circle cx="78" cy="37" r="2.5" fill="#D4AF37"/><rect x="20" y="75" width="60" height="6" rx="2" fill="#D4AF37" fill-opacity="0.3"/><circle cx="30" cy="78" r="1.5" fill="#D4AF37"/><circle cx="40" cy="78" r="1.5" fill="#D4AF37"/><circle cx="50" cy="78" r="1.5" fill="#D4AF37"/><circle cx="60" cy="78" r="1.5" fill="#D4AF37"/><circle cx="70" cy="78" r="1.5" fill="#D4AF37"/></svg>`) },
  { id: 'l3', name: 'Star Sparkle', category: 'luxury', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#D4AF37" stroke="none"><path d="M50 12C50 32 32 50 12 50C32 50 50 68 50 88C50 68 68 50 88 50C68 50 50 32 50 12Z"/><path d="M82 18C82 25 75 32 68 32C75 32 82 39 82 46C82 39 89 32 96 32C89 32 82 25 82 18Z" opacity="0.8"/><path d="M22 68C22 73 17 78 12 78C17 78 22 83 22 88C22 83 27 78 32 78C27 78 22 73 22 68Z" opacity="0.6"/></svg>`) },
  { id: 'l4', name: 'Halo Frame', category: 'luxury', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="1.8"><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="37" stroke-width="0.8" stroke-dasharray="3 3"/><path d="M50 3C47 7 47 11 50 11C53 11 53 7 50 3Z" fill="#D4AF37"/><path d="M50 89C47 93 47 97 50 97C53 97 53 93 50 89Z" fill="#D4AF37"/><path d="M3 50C7 47 11 47 11 50C11 53 7 53 3 50Z" fill="#D4AF37"/><path d="M89 50C93 47 97 47 97 50C97 53 93 53 89 50Z" fill="#D4AF37"/></svg>`) },
  { id: 'l5', name: 'Gold Arch', category: 'luxury', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="1.8"><path d="M20 90V40C20 23.4 33.4 10 50 10C66.6 10 80 23.4 80 40V90H20Z" fill="#D4AF37" fill-opacity="0.05"/><path d="M24 90V40C24 25.6 35.6 14 50 14C64.4 14 76 25.6 76 40V90" stroke-width="0.8" stroke-dasharray="2 2"/><path d="M50 10C50 16 46 18 50 20C54 18 50 16 50 10Z" fill="#D4AF37"/></svg>`) },
  { id: 'l6', name: 'Corner Accent', category: 'luxury', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round"><path d="M10 90V15C10 12.2 12.2 10 15 10H90" /><path d="M18 80V18H80" stroke-width="0.8" stroke-dasharray="1 2"/><path d="M10 10Q25 25 35 15Q45 5 30 5Q15 5 10 10Z" fill="#D4AF37" fill-opacity="0.2"/><path d="M10 30C15 35 25 30 25 20" stroke-width="1.2"/><path d="M30 10C35 15 30 25 20 25" stroke-width="1.2"/></svg>`) },
  { id: 'as1', name: 'Royal Mandala', category: 'luxury', url: '/assets/decorations/gold-mandala.svg' },
  { id: 'as2', name: 'Javanese Gunungan', category: 'luxury', url: '/assets/decorations/javanese-ornament.svg' },
  { id: 'as3', name: 'Vintage Line Divider', category: 'luxury', url: '/assets/decorations/vintage-divider.svg' },

  // Wedding
  { id: 'w1', name: 'Wedding Rings', category: 'wedding', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2"><ellipse cx="38" cy="56" rx="20" ry="15" transform="rotate(-15 38 56)" stroke-width="3.5"/><polygon points="26,35 30,39 26,43 22,39" fill="#D4AF37"/><polygon points="26,31 28,35 26,39 24,35" fill="#D4AF37" opacity="0.8"/><ellipse cx="62" cy="56" rx="20" ry="15" transform="rotate(15 62 56)" stroke-width="2.5"/></svg>`) },
  { id: 'w2', name: 'Champagne Flute', category: 'wedding', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M42 62L42 85M32 85H52" stroke-width="1.5"/><path d="M42 62C44 50 36 25 36 25H48C48 25 44 50 42 62Z" fill="#D4AF37" fill-opacity="0.1"/><path d="M58 62L58 85M48 85H68" stroke-width="1.5"/><path d="M58 62C56 50 64 25 64 25H52C52 25 56 50 58 62Z" fill="#D4AF37" fill-opacity="0.1"/><circle cx="50" cy="18" r="2.5" fill="#D4AF37"/><circle cx="46" cy="12" r="1.5" fill="#D4AF37"/><circle cx="54" cy="10" r="2" fill="#D4AF37"/><circle cx="43" cy="22" r="1" fill="#D4AF37"/><circle cx="57" cy="22" r="1.5" fill="#D4AF37"/></svg>`) },
  { id: 'w3', name: 'Wedding Cake', category: 'wedding', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2"><path d="M15 85H85" stroke-width="3" stroke-linecap="round"/><path d="M22 85V60H78V85Z" fill="#D4AF37" fill-opacity="0.05"/><path d="M22 68C22 68 36 71 50 68C64 65 78 68 78 68" stroke-width="1"/><path d="M32 60V40H68V60Z" fill="#D4AF37" fill-opacity="0.1"/><path d="M32 48C32 48 41 51 50 48C59 45 68 48 68 48" stroke-width="1"/><path d="M42 40V24H58V40Z" fill="#D4AF37" fill-opacity="0.15"/><path d="M50 24V14" stroke-width="1.5"/><path d="M50 14C48 10 44 10 44 13C44 16 50 19 50 19C50 19 56 16 56 13C56 10 52 10 50 14Z" fill="#D4AF37"/></svg>`) },
  { id: 'w4', name: 'Love Letter', category: 'wedding', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2"><rect x="15" y="25" width="70" height="50" rx="6" fill="#D4AF37" fill-opacity="0.05"/><path d="M15 28L50 52L85 28" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 57C48 53 44 53 44 56C44 59 50 63 50 63C50 63 56 59 56 56C56 53 52 53 50 57Z" fill="#D4AF37" stroke="none"/></svg>`) },
  { id: 'w5', name: 'Love Birds', category: 'wedding', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round"><path d="M25 40C28 32 36 28 42 32C45 34 44 38 42 41C38 45 30 48 24 45C22 44 23 41 25 40Z" fill="#D4AF37" fill-opacity="0.1"/><path d="M34 31C38 20 45 15 45 15C45 15 42 25 36 31"/><path d="M24 45C16 52 10 55 10 55C10 55 18 50 24 45Z"/><path d="M65 55C68 47 76 43 82 47C85 49 84 53 82 56C78 60 70 63 64 60C62 59 63 56 65 55Z" fill="#D4AF37" fill-opacity="0.1"/><path d="M74 46C78 35 85 30 85 30C85 30 82 40 76 46"/><path d="M64 60C56 67 50 70 50 70C50 70 58 65 64 60Z"/><path d="M45 42Q50 42 55 45" stroke="#8C7A5B" stroke-width="1.2"/><circle cx="49" cy="41" r="1.5" fill="#8C7A5B"/><circle cx="53" cy="43" r="1.5" fill="#8C7A5B"/></svg>`) },
  { id: 'w6', name: 'Gift Box', category: 'wedding', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2"><rect x="25" y="42" width="50" height="43" rx="4" fill="#D4AF37" fill-opacity="0.05"/><rect x="20" y="32" width="60" height="10" rx="2" fill="#D4AF37" fill-opacity="0.1"/><rect x="46" y="32" width="8" height="53" fill="#D4AF37" stroke="none"/><path d="M50 32C40 25 42 16 50 22C58 16 60 25 50 32Z" fill="#D4AF37" fill-opacity="0.2"/><path d="M50 63C48 60 45 60 45 62C45 64 50 67 50 67C50 67 55 64 55 62C55 60 52 60 50 63Z" fill="#D4AF37" stroke="none"/></svg>`) },
  { id: 'w7', name: 'Calendar Date', category: 'wedding', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2"><rect x="20" y="25" width="60" height="55" rx="6" fill="#D4AF37" fill-opacity="0.05"/><path d="M20 40H80" stroke-width="1.5"/><path d="M35 18V28M65 18V28" stroke-width="2.5" stroke-linecap="round"/><circle cx="35" cy="52" r="2" fill="#D4AF37"/><circle cx="50" cy="52" r="2" fill="#D4AF37"/><circle cx="65" cy="52" r="2" fill="#D4AF37"/><circle cx="35" cy="65" r="2" fill="#D4AF37"/><path d="M50 65C49 62 46 62 46 64C46 66 50 69 50 69C50 69 54 66 54 64C54 62 51 62 50 65Z" fill="#D4AF37" stroke="none"/><circle cx="65" cy="65" r="2" fill="#D4AF37"/></svg>`) },
  { id: 'w8', name: 'Location Pin', category: 'wedding', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2"><path d="M50 85C50 85 80 58 80 38C80 20 66.6 8 50 8C33.4 8 20 20 20 38C20 58 50 85 50 85Z" fill="#D4AF37" fill-opacity="0.1" stroke-linejoin="round"/><circle cx="50" cy="35" r="10" fill="#D4AF37" fill-opacity="0.2"/><circle cx="50" cy="35" r="3" fill="#D4AF37"/></svg>`) },
  { id: 'w9', name: 'Love Balloon', category: 'wedding', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2"><path d="M50 15 C30 15 25 35 50 55 C75 35 70 15 50 15 Z" fill="#D4AF37" fill-opacity="0.1"/><path d="M50 55 C48 60 52 65 50 75" stroke-linecap="round"/><path d="M48 55 L52 55 L50 58 Z" fill="#D4AF37"/></svg>`) },
  { id: 'w10', name: 'Heart Envelope', category: 'wedding', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2"><rect x="15" y="25" width="70" height="50" rx="4" fill="#D4AF37" fill-opacity="0.08"/><path d="M15 25 L50 52 L85 25"/><path d="M42 45 Q50 37 58 45" stroke-linecap="round"/><path d="M50 48 C48 45 44 45 44 48 C44 51 50 54 50 54 C50 54 56 51 56 48 C56 45 52 45 50 48 Z" fill="#D4AF37"/></svg>`) },
  { id: 'w11', name: 'Wedding Bell Ring', category: 'wedding', url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="2"><path d="M42 20 C42 16 58 16 58 20 C58 24 42 24 42 20 Z" fill="#D4AF37"/><path d="M30 65 L70 65 C68 50 68 35 50 35 C32 35 32 50 30 65 Z" fill="#D4AF37" fill-opacity="0.1"/><circle cx="50" cy="72" r="6" fill="#D4AF37"/><path d="M25 65 C25 68 75 68 75 65" stroke-linecap="round"/></svg>`) },
  { id: 'as4', name: 'Gold Wreath', category: 'wedding', url: '/assets/decorations/floral-wreath.svg' },
  { id: 'as5', name: 'Wedding Bells Duo', category: 'wedding', url: '/assets/decorations/wedding-bells.svg' }
];

// Seed local fallback collections if they don't exist
if (!localDB['music_library'] || !Array.isArray(localDB['music_library']) || localDB['music_library'].length === 0 || !localDB['assets_library'] || !Array.isArray(localDB['assets_library']) || localDB['assets_library'].length < 30 || !localDB['platform_features_config']) {
  if (!localDB['music_library'] || !Array.isArray(localDB['music_library']) || localDB['music_library'].length === 0) {
    localDB['music_library'] = [
      { id: 'r1', name: 'A Thousand Years', artist: 'Piano Cover', url: '/sample.mp3', category: 'romantic', duration: '4:45', premium: false },
      { id: 'r2', name: 'Perfect Wedding', artist: 'Acoustic Guitar', url: '/sample2.mp3', category: 'romantic', duration: '3:28', premium: false },
      { id: 'r3', name: 'Canon in D', artist: 'String Quartet', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', category: 'romantic', duration: '5:12', premium: false }
    ];
  }
  if (!localDB['assets_library'] || !Array.isArray(localDB['assets_library']) || localDB['assets_library'].length < 30) {
    localDB['assets_library'] = DEFAULT_SEED_ASSETS.map(a => ({ ...a, premium: false }));
  }
  if (!localDB['platform_features_config']) {
    localDB['platform_features_config'] = [
      { feature_id: 'fade-sections', feature_type: 'effect', name: 'Page Scroll: Fade', is_premium: false },
      { feature_id: 'slide-sections', feature_type: 'effect', name: 'Page Scroll: Slide', is_premium: false },
      { feature_id: 'parallax-bg', feature_type: 'effect', name: 'Page Scroll: Parallax', is_premium: false },
      { feature_id: 'sakura', feature_type: 'effect', name: 'Particle: Sakura', is_premium: false },
      { feature_id: 'rose-petals', feature_type: 'effect', name: 'Particle: Rose Petals', is_premium: false },
      { feature_id: 'autumn-leaves', feature_type: 'effect', name: 'Particle: Autumn Leaves', is_premium: false },
      { feature_id: 'botanical-leaves', feature_type: 'effect', name: 'Particle: Botanical Leaves', is_premium: false },
      { feature_id: 'gold-dust', feature_type: 'effect', name: 'Particle: Gold Dust', is_premium: false },
      { feature_id: 'glittering-stars', feature_type: 'effect', name: 'Particle: Glittering Stars', is_premium: false },
      { feature_id: 'love-balloons', feature_type: 'effect', name: 'Particle: Love Balloons', is_premium: false },
      { feature_id: 'snow', feature_type: 'effect', name: 'Particle: Snow', is_premium: false },
      { feature_id: 'rain', feature_type: 'effect', name: 'Particle: Rain', is_premium: false },
      { feature_id: 'bubbles', feature_type: 'effect', name: 'Particle: Bubbles', is_premium: false },
      { feature_id: 'countdown', feature_type: 'widget', name: 'Widget: Countdown Timer', is_premium: false },
      { feature_id: 'rsvp', feature_type: 'widget', name: 'Widget: RSVP Form', is_premium: false },
      { feature_id: 'gift', feature_type: 'widget', name: 'Widget: Digital Gift & Envelope', is_premium: false },
      { feature_id: 'location', feature_type: 'widget', name: 'Widget: Google Maps Pin', is_premium: false },
      { feature_id: 'gallery', feature_type: 'widget', name: 'Widget: Photo Gallery Slider', is_premium: false },
      { feature_id: 'music', feature_type: 'widget', name: 'Widget: Canvas Audio Player', is_premium: false }
    ];
  }
  saveLocalDB();
}

function saveLocalDB() {
  try {
    const tempPath = LOCAL_DB_PATH + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(localDB, null, 2), 'utf-8');
    fs.renameSync(tempPath, LOCAL_DB_PATH);
  } catch (e) {
    console.error("[Database Fallback] Failed to save local DB:", e);
  }
}

let useLocalFallback = false;

function isPremiumActive(premium: boolean, premiumUntil: string | Date | null): boolean {
  if (!premium) return false;
  if (!premiumUntil) return true; // If premium is true and premiumUntil is not set, it is a lifetime/permanent premium
  return new Date(premiumUntil) > new Date();
}

// Safe query runner wrapper with automatic fallback
async function dbQuery(text: string, params: any[] = []): Promise<{ rows: any[] }> {
  if (useLocalFallback && !process.env.VERCEL) {
    return runLocalQuery(text, params);
  }

  try {
    const dbPool = getPool();
    // On Vercel, allow longer execution time to handle cold-start wakeup
    const queryPromise = dbPool.query(text, params);
    const timeoutDuration = process.env.VERCEL ? 15000 : 5000;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Query connection timeout")), timeoutDuration)
    );
    const result = await Promise.race([queryPromise, timeoutPromise]) as { rows: any[] };
    return result;
  } catch (err: any) {
    console.error("[Database] Query error:", err.message || err);
    if (!process.env.VERCEL) {
      console.log("[Database] Falling back to local JSON db");
      useLocalFallback = true;
      return runLocalQuery(text, params);
    }
    throw err;
  }
}

function runLocalQuery(text: string, params: any[] = []): { rows: any[] } {
  console.log(`[Local DB Fallback] Query: ${text.substring(0, 80)}...`);

  // SELECT templates list
  if (text.includes("SELECT") && text.includes("is_template = TRUE")) {
    const items = Object.values(localDB)
      .filter((p: any) => p && typeof p === 'object' && !Array.isArray(p) && p.is_template === true && p.type !== 'profile' && p.id !== 'music_library' && p.id !== 'assets_library')
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return { rows: items };
  }

  // 1. SELECT by ID (legacy or details)
  if (text.includes("SELECT") && text.includes("WHERE id = $1") && !text.includes("profiles")) {
    const id = params[0];
    const item = localDB[id];
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const prof = localDB[`profile_${item.user_id}`];
      return { rows: [{ ...item, paid: prof ? isPremiumActive(prof.premium, prof.premium_until) : false }] };
    }
    return { rows: item ? [item] : [] };
  }

  // 2. SELECT by SLUG
  if (text.includes("SELECT") && text.includes("WHERE slug = $1")) {
    const slug = params[0];
    const item = Object.values(localDB).find((p: any) => p.slug === slug);
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const prof = localDB[`profile_${item.user_id}`];
      return { rows: [{ ...item, paid: prof ? isPremiumActive(prof.premium, prof.premium_until) : false }] };
    }
    return { rows: item ? [item] : [] };
  }

  // 3. SELECT LIST by USER_ID
  if (text.includes("SELECT") && text.includes("WHERE user_id = $1")) {
    const userId = params[0];
    const prof = localDB[`profile_${userId}`];
    const isPremium = prof ? isPremiumActive(prof.premium, prof.premium_until) : false;
    const items = Object.values(localDB)
      .filter((p: any) => p && typeof p === 'object' && !Array.isArray(p) && p.user_id === userId && p.type !== 'profile' && p.id !== 'music_library' && p.id !== 'assets_library' && !p.is_template)
      .map((p: any) => {
        const wishes = localDB['rsvp_wishes'] || [];
        const rsvpCount = wishes.filter((w: any) => w.invitation_id === p.id).length;
        return {
          ...p,
          paid: isPremium,
          rsvp_count: rsvpCount
        };
      })
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return { rows: items };
  }

  // 4. INSERT/UPDATE (Upsert)
  if (text.includes("INSERT INTO invitations")) {
    if (params.length === 4) {
      const [title, background, settings, pages] = params;
      localDB['default'] = {
        id: 'default',
        title,
        background: typeof background === 'string' ? JSON.parse(background) : background,
        settings: typeof settings === 'string' ? JSON.parse(settings) : settings,
        pages: typeof pages === 'string' ? JSON.parse(pages) : pages,
        user_id: 'mock-usr-admin',
        slug: 'default-invitation',
        paid: false,
        updated_at: new Date().toISOString()
      };
    } else {
      const [id, title, background, settings, pages, user_id, slug, paid, is_template, thumbnail] = params;
      localDB[id] = {
        id,
        title,
        background: typeof background === 'string' ? JSON.parse(background) : background,
        settings: typeof settings === 'string' ? JSON.parse(settings) : settings,
        pages: typeof pages === 'string' ? JSON.parse(pages) : pages,
        user_id,
        slug,
        paid: !!paid,
        is_template: !!is_template,
        thumbnail,
        updated_at: new Date().toISOString()
      };
    }
    saveLocalDB();
    return { rows: [] };
  }

  // 5. UPDATE paid
  if (text.includes("UPDATE invitations SET paid = TRUE")) {
    const id = params[0];
    if (localDB[id]) {
      localDB[id].paid = true;
      saveLocalDB();
    }
    return { rows: [] };
  }

  // 6. DELETE
  if (text.includes("DELETE FROM invitations")) {
    const id = params[0];
    delete localDB[id];
    saveLocalDB();
    return { rows: [] };
  }

  // 7. SELECT ALL music
  if (text.includes("SELECT") && text.includes("music_library")) {
    const list = localDB['music_library'] || [];
    return { rows: list };
  }
  // 8. INSERT music
  if (text.includes("INSERT INTO music_library")) {
    const [id, name, artist, url, category, duration, premium] = params;
    if (!localDB['music_library']) localDB['music_library'] = [];
    localDB['music_library'] = localDB['music_library'].filter((m: any) => m.id !== id);
    localDB['music_library'].push({ id, name, artist, url, category, duration, premium: premium === undefined ? false : !!premium });
    saveLocalDB();
    return { rows: [] };
  }
  // 9. DELETE music
  if (text.includes("DELETE FROM music_library")) {
    const id = params[0];
    if (localDB['music_library']) {
      localDB['music_library'] = localDB['music_library'].filter((m: any) => m.id !== id);
      saveLocalDB();
    }
    return { rows: [] };
  }

  // 10. SELECT ALL assets
  if (text.includes("SELECT") && text.includes("assets_library")) {
    const list = localDB['assets_library'] || [];
    return { rows: list };
  }
  // 11. INSERT asset
  if (text.includes("INSERT INTO assets_library")) {
    const [id, name, url, category, premium] = params;
    if (!localDB['assets_library']) localDB['assets_library'] = [];
    localDB['assets_library'] = localDB['assets_library'].filter((a: any) => a.id !== id);
    localDB['assets_library'].push({ id, name, url, category, premium: premium === undefined ? false : !!premium });
    saveLocalDB();
    return { rows: [] };
  }
  // 11b. UPDATE asset premium
  if (text.includes("UPDATE assets_library SET premium")) {
    const [premium, id] = params;
    if (localDB['assets_library']) {
      localDB['assets_library'] = localDB['assets_library'].map((a: any) =>
        a.id === id ? { ...a, premium: !!premium } : a
      );
      saveLocalDB();
    }
    return { rows: [] };
  }
  // 11c. UPDATE music premium
  if (text.includes("UPDATE music_library SET premium")) {
    const [premium, id] = params;
    if (localDB['music_library']) {
      localDB['music_library'] = localDB['music_library'].map((m: any) =>
        m.id === id ? { ...m, premium: !!premium } : m
      );
      saveLocalDB();
    }
    return { rows: [] };
  }
  // 11d. SELECT ALL platform features config
  if (text.includes("SELECT") && text.includes("platform_features_config")) {
    const list = localDB['platform_features_config'] || [];
    return { rows: list };
  }
  // 11e. UPDATE platform features config
  if (text.includes("UPDATE platform_features_config")) {
    const [is_premium, feature_id] = params;
    if (localDB['platform_features_config']) {
      localDB['platform_features_config'] = localDB['platform_features_config'].map((f: any) =>
        f.feature_id === feature_id ? { ...f, is_premium: !!is_premium } : f
      );
      saveLocalDB();
    }
    return { rows: [] };
  }
  // 12. DELETE asset
  if (text.includes("DELETE FROM assets_library")) {
    const id = params[0];
    if (localDB['assets_library']) {
      localDB['assets_library'] = localDB['assets_library'].filter((a: any) => a.id !== id);
      saveLocalDB();
    }
    return { rows: [] };
  }

  // 13. SELECT rsvp_wishes
  if (text.includes("SELECT") && text.includes("rsvp_wishes")) {
    const invitationId = params[0];
    const wishes = (localDB['rsvp_wishes'] || [])
      .filter((w: any) => w.invitation_id === invitationId)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { rows: wishes };
  }

  // 14. INSERT rsvp_wishes
  if (text.includes("INSERT INTO rsvp_wishes")) {
    const [id, invitation_id, name, attending, guests, message] = params;
    if (!localDB['rsvp_wishes']) localDB['rsvp_wishes'] = [];
    localDB['rsvp_wishes'].push({
      id,
      invitation_id,
      name,
      attending,
      guests: parseInt(guests) || 1,
      message,
      created_at: new Date().toISOString()
    });
    saveLocalDB();
    return { rows: [] };
  }

  // 15. SELECT profile by id
  if (text.includes("SELECT") && text.includes("FROM profiles WHERE id = $1")) {
    const id = params[0];
    const profile = localDB[`profile_${id}`];
    if (profile) {
      return { rows: [{ ...profile, premium: isPremiumActive(profile.premium, profile.premium_until) }] };
    }
    return { rows: [] };
  }

  // 16. SELECT profile by username
  if (text.includes("SELECT") && text.includes("FROM profiles WHERE username = $1")) {
    const username = params[0];
    const profile = Object.values(localDB).find((p: any) => p.type === 'profile' && p.username === username);
    if (profile) {
      return { rows: [{ ...profile, premium: isPremiumActive(profile.premium, profile.premium_until) }] };
    }
    return { rows: [] };
  }

  // 17. INSERT/UPDATE profile
  if (text.includes("INSERT INTO profiles")) {
    const [id, email, full_name, username] = params;
    const existing = localDB[`profile_${id}`];
    localDB[`profile_${id}`] = {
      type: 'profile',
      id,
      email,
      full_name,
      username,
      premium: existing ? !!existing.premium : false,
      premium_until: existing ? existing.premium_until : null,
      created_at: existing ? existing.created_at : new Date().toISOString()
    };
    saveLocalDB();
    return { rows: [] };
  }

  // 18. SELECT ALL profiles
  if (text.includes("SELECT * FROM profiles") || (text.includes("SELECT") && text.includes("FROM profiles"))) {
    const list = Object.values(localDB)
      .filter((item: any) => item.type === 'profile')
      .map((p: any) => ({ ...p, premium: isPremiumActive(p.premium, p.premium_until) }));
    return { rows: list };
  }

  // 19. SELECT COALESCE(SUM(views)) - Local fallback
  if (text.includes("SELECT COALESCE(SUM(views)")) {
    const userId = params[0];
    const userProjects = Object.values(localDB).filter((p: any) => p && p.user_id === userId && p.type !== 'profile' && p.id !== 'music_library' && p.id !== 'assets_library');
    const sum = userProjects.reduce((s: number, p: any) => s + (p.views || 0), 0);
    return { rows: [{ count: sum }] };
  }

  // 20. SELECT COUNT(*) FROM rsvp_wishes - Local fallback
  if (text.includes("SELECT COUNT(*) as count FROM rsvp_wishes")) {
    const userId = params[0];
    const userProjects = Object.values(localDB).filter((p: any) => p && p.user_id === userId && p.type !== 'profile' && p.id !== 'music_library' && p.id !== 'assets_library');
    const projectIds = userProjects.map((p: any) => p.id);
    const wishes = (localDB['rsvp_wishes'] || []).filter((w: any) => projectIds.includes(w.invitation_id));
    return { rows: [{ count: wishes.length }] };
  }

  // 21. SELECT COALESCE(SUM(guests)) - Local fallback
  if (text.includes("SELECT COALESCE(SUM(guests)") && text.includes("w.attending = 'yes'")) {
    const userId = params[0];
    const userProjects = Object.values(localDB).filter((p: any) => p && p.user_id === userId && p.type !== 'profile' && p.id !== 'music_library' && p.id !== 'assets_library');
    const projectIds = userProjects.map((p: any) => p.id);
    const wishes = (localDB['rsvp_wishes'] || []).filter((w: any) => projectIds.includes(w.invitation_id) && w.attending === 'yes');
    const sum = wishes.reduce((s: number, w: any) => s + (w.guests || 1), 0);
    return { rows: [{ count: sum }] };
  }

  // 22. UNION ALL activity feed - Local fallback
  if (text.includes("UNION ALL") || text.includes("rsvp' as type")) {
    const userId = params[0];
    const userProjects = Object.values(localDB).filter((p: any) => p && p.user_id === userId && p.type !== 'profile' && p.id !== 'music_library' && p.id !== 'assets_library');
    const projectIds = userProjects.map((p: any) => p.id);
    
    const rsvpWishes = (localDB['rsvp_wishes'] || [])
      .filter((w: any) => projectIds.includes(w.invitation_id))
      .map((w: any) => {
        const proj = localDB[w.invitation_id];
        return {
          type: 'rsvp',
          name: w.name,
          attending: w.attending,
          created_at: w.created_at,
          invitation_title: proj ? proj.title : 'Undangan'
        };
      });

    const updates = userProjects.map((p: any) => ({
      type: 'update',
      name: null,
      attending: null,
      created_at: p.updated_at,
      invitation_title: p.title
    }));

    const combined = [...rsvpWishes, ...updates]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
      
    return { rows: combined };
  }

  return { rows: [] };
}

// Function to safely run initial migrations / table check
async function initializeDatabase() {
  console.log("[Database] Checking schema existence...");
  try {
    const dbPool = getPool();
    // Test connection health first with a timeout to prevent TCP hanging
    const connectionTest = dbPool.query("SELECT 1");
    const timeoutDuration = process.env.VERCEL ? 15000 : 3000;
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database connection timeout")), timeoutDuration)
    );
    await Promise.race([connectionTest, timeout]);
    
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id VARCHAR(50) PRIMARY KEY,
        title TEXT NOT NULL,
        background JSONB NOT NULL,
        settings JSONB NOT NULL,
        pages JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[Database] 'invitations' table is verified and ready.");

    // Create rsvp_wishes table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS rsvp_wishes (
        id VARCHAR(50) PRIMARY KEY,
        invitation_id VARCHAR(100) NOT NULL,
        name TEXT NOT NULL,
        attending VARCHAR(20) NOT NULL,
        guests INTEGER DEFAULT 1,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await dbPool.query(`
      CREATE INDEX IF NOT EXISTS idx_rsvp_wishes_invitation_id ON rsvp_wishes(invitation_id);
    `);
    console.log("[Database] 'rsvp_wishes' table is verified and ready.");
    
    // Create music_library table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS music_library (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        artist TEXT NOT NULL,
        url TEXT NOT NULL,
        category TEXT NOT NULL,
        duration TEXT NOT NULL
      );
    `);
    
    // Create assets_library table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS assets_library (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        category TEXT NOT NULL
      );
    `);

    // Create profiles table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(100) PRIMARY KEY,
        email TEXT NOT NULL,
        full_name TEXT NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Create guests table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS guests (
        id VARCHAR(50) PRIMARY KEY,
        invitation_id VARCHAR(50) NOT NULL,
        name TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await dbPool.query(`
      CREATE INDEX IF NOT EXISTS idx_guests_invitation_id ON guests(invitation_id);
    `);
    console.log("[Database] 'guests' table is verified and ready.");

    // Create bug_reports table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS bug_reports (
        id VARCHAR(50) PRIMARY KEY,
        user_email TEXT,
        user_id VARCHAR(100),
        description TEXT NOT NULL,
        page_url TEXT,
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[Database] 'bug_reports' table is verified and ready.");
    
    // Schema migrations for multi-user and paid-sharing
    try {
      await dbPool.query("ALTER TABLE invitations ADD COLUMN IF NOT EXISTS user_id VARCHAR(100) DEFAULT 'mock-usr-admin';");
      await dbPool.query("ALTER TABLE invitations ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;");
      await dbPool.query("ALTER TABLE invitations ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT FALSE;");
      await dbPool.query("ALTER TABLE invitations ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;");
      await dbPool.query("ALTER TABLE invitations ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;");
      await dbPool.query("ALTER TABLE invitations ADD COLUMN IF NOT EXISTS thumbnail TEXT;");
      await dbPool.query("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT FALSE;");
      await dbPool.query("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP;");
      await dbPool.query("ALTER TABLE assets_library ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT FALSE;");
      await dbPool.query("ALTER TABLE music_library ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT FALSE;");
      
      // Create platform_features_config table
      await dbPool.query(`
        CREATE TABLE IF NOT EXISTS platform_features_config (
          feature_id VARCHAR(100) PRIMARY KEY,
          feature_type VARCHAR(50) NOT NULL,
          name TEXT NOT NULL,
          is_premium BOOLEAN DEFAULT FALSE
        );
      `);

      console.log("[Database] Schema check and migrations completed.");
    } catch (migErr: any) {
      console.log("[Database] Column migrations note:", migErr.message || migErr);
    }

    // Seed tables if empty
    try {
      const musicCount = await dbPool.query("SELECT COUNT(*) FROM music_library");
      if (parseInt(musicCount.rows[0].count) === 0) {
        console.log("[Database] Seeding default music library...");
        await dbPool.query(`
          INSERT INTO music_library (id, name, artist, url, category, duration, premium) VALUES
          ('r1', 'A Thousand Years', 'Piano Cover', '/sample.mp3', 'romantic', '4:45', FALSE),
          ('r2', 'Perfect Wedding', 'Acoustic Guitar', '/sample2.mp3', 'romantic', '3:28', FALSE),
          ('r3', 'Canon in D', 'String Quartet', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'romantic', '5:12', FALSE)
        `);
      }
      
      const assetsCount = await dbPool.query("SELECT COUNT(*) FROM assets_library");
      if (parseInt(assetsCount.rows[0].count) < 10) {
        console.log("[Database] Seeding default assets library (27 items) in Postgres...");
        for (const asset of DEFAULT_SEED_ASSETS) {
          await dbPool.query(`
            INSERT INTO assets_library (id, name, url, category, premium) 
            VALUES ($1, $2, $3, $4, FALSE) 
            ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, name = EXCLUDED.name
          `, [asset.id, asset.name, asset.url, asset.category]);
        }
      }

      const featuresCount = await dbPool.query("SELECT COUNT(*) FROM platform_features_config");
      if (parseInt(featuresCount.rows[0].count) === 0) {
        console.log("[Database] Seeding default platform features config...");
        await dbPool.query(`
          INSERT INTO platform_features_config (feature_id, feature_type, name, is_premium) VALUES
          ('fade-sections', 'effect', 'Page Scroll: Fade', FALSE),
          ('slide-sections', 'effect', 'Page Scroll: Slide', FALSE),
          ('parallax-bg', 'effect', 'Page Scroll: Parallax', FALSE),
          ('sakura', 'effect', 'Particle: Sakura', FALSE),
          ('rose-petals', 'effect', 'Particle: Rose Petals', FALSE),
          ('autumn-leaves', 'effect', 'Particle: Autumn Leaves', FALSE),
          ('botanical-leaves', 'effect', 'Particle: Botanical Leaves', FALSE),
          ('gold-dust', 'effect', 'Particle: Gold Dust', FALSE),
          ('glittering-stars', 'effect', 'Particle: Glittering Stars', FALSE),
          ('love-balloons', 'effect', 'Particle: Love Balloons', FALSE),
          ('snow', 'effect', 'Particle: Snow', FALSE),
          ('rain', 'effect', 'Particle: Rain', FALSE),
          ('bubbles', 'effect', 'Particle: Bubbles', FALSE),
          ('countdown', 'widget', 'Widget: Countdown Timer', FALSE),
          ('rsvp', 'widget', 'Widget: RSVP Form', FALSE),
          ('gift', 'widget', 'Widget: Digital Gift & Envelope', FALSE),
          ('location', 'widget', 'Widget: Google Maps Pin', FALSE),
          ('gallery', 'widget', 'Widget: Photo Gallery Slider', FALSE),
          ('music', 'widget', 'Widget: Canvas Audio Player', FALSE)
        `);
      }
    } catch (seedErr: any) {
      console.warn("[Database] Seeding note:", seedErr.message || seedErr);
    }
  } catch (error: any) {
    console.warn("[Database] Error during initial db connection, falling back to local JSON db:", error.message || error);
    useLocalFallback = true;
  }
}

export const app = express();

async function startServer() {
  let vite: any = null;

  // Security Headers Middleware (Best Practices for SEO and Trust)
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  initializeDatabase();

  // --- API Routes ---
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/db-debug", async (req, res) => {
    try {
      const dbUrl = process.env.DATABASE_URL || "not-set";
      const maskedUrl = dbUrl.replace(/:([^@]+)@/, ":***@");
      const result = await dbQuery("SELECT COUNT(*) as count FROM invitations");
      const resultTemplates = await dbQuery("SELECT COUNT(*) as count FROM invitations WHERE is_template = TRUE");
      const allItems = await dbQuery("SELECT id, title, is_template FROM invitations LIMIT 10");
      res.json({
        success: true,
        databaseUrl: maskedUrl,
        vercel: !!process.env.VERCEL,
        useLocalFallback,
        totalInvitations: result.rows[0]?.count || 0,
        totalTemplates: resultTemplates.rows[0]?.count || 0,
        items: allItems.rows
      });
    } catch (err: any) {
      const dbUrl = process.env.DATABASE_URL || "not-set";
      const maskedUrl = dbUrl.replace(/:([^@]+)@/, ":***@");
      res.status(500).json({
        success: false,
        error: err.message,
        databaseUrl: maskedUrl,
        stack: err.stack
      });
    }
  });

  // Get saved invitation (legacy fallback)
  app.get("/api/invitation", async (req, res) => {
    try {
      const result = await dbQuery(
        "SELECT title, background, settings, pages FROM invitations WHERE id = $1",
        ["default"]
      );

      if (result.rows.length > 0) {
        return res.json({
          success: true,
          data: {
            title: result.rows[0].title,
            background: result.rows[0].background,
            settings: result.rows[0].settings,
            pages: result.rows[0].pages,
          },
        });
      }

      return res.json({ success: true, data: null });
    } catch (error: any) {
      console.error("[API] Error fetching invitation:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch invitation from database",
      });
    }
  });

  // Save / Update invitation (legacy fallback)
  app.post("/api/invitation", async (req, res) => {
    const { title, background, settings, pages } = req.body;

    if (!title || !background || !settings || !pages) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (title, background, settings, or pages)",
      });
    }

    try {
      await dbQuery(
        `INSERT INTO invitations (id, title, background, settings, pages, updated_at)
         VALUES ('default', $1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           background = EXCLUDED.background,
           settings = EXCLUDED.settings,
           pages = EXCLUDED.pages,
           updated_at = CURRENT_TIMESTAMP`,
        [title, JSON.stringify(background), JSON.stringify(settings), JSON.stringify(pages)]
      );

      return res.json({ success: true, message: "Invitation saved successfully" });
    } catch (error: any) {
      console.error("[API] Error saving invitation:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to save invitation to database",
      });
    }
  });

  // --- Multi-User REST Endpoints ---

  // 0. List dynamic templates
  app.get("/api/templates", async (req, res) => {
    try {
      const result = await dbQuery("SELECT id, title, slug, background, settings, pages, is_template, thumbnail, updated_at FROM invitations WHERE is_template = TRUE ORDER BY updated_at DESC");
      return res.json({ success: true, data: result.rows });
    } catch (error: any) {
      console.error("[API] Error loading templates:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 1. List user designs
  app.get("/api/invitations", async (req, res) => {
    const userId = req.query.userId || 'mock-usr-admin';
    try {
      const profRes = await dbQuery("SELECT premium, premium_until FROM profiles WHERE id = $1", [userId]);
      const isPremium = profRes.rows.length > 0 ? isPremiumActive(profRes.rows[0].premium, profRes.rows[0].premium_until) : false;

      const result = await dbQuery(
        "SELECT id, title, slug, paid, views, thumbnail, updated_at FROM invitations WHERE user_id = $1 AND (is_template = FALSE OR is_template IS NULL) ORDER BY updated_at DESC",
        [userId]
      );
      
      const mapped = result.rows.map((row: any) => ({
        ...row,
        paid: isPremium
      }));

      return res.json({ success: true, data: mapped });
    } catch (error: any) {
      console.error("[API] Error listing invitations:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 2. Fetch specific invitation details
  app.get("/api/invitations/:id", async (req, res) => {
    try {
      const result = await dbQuery(
        "SELECT id, title, background, settings, pages, user_id, slug, paid, views FROM invitations WHERE id = $1",
        [req.params.id]
      );
      if (result.rows.length > 0) {
        const item = result.rows[0];
        const profRes = await dbQuery("SELECT premium, premium_until FROM profiles WHERE id = $1", [item.user_id]);
        const isPremium = profRes.rows.length > 0 ? isPremiumActive(profRes.rows[0].premium, profRes.rows[0].premium_until) : false;
        return res.json({ success: true, data: { ...item, paid: isPremium } });
      }
      return res.status(404).json({ success: false, error: "Invitation not found" });
    } catch (error: any) {
      console.error("[API] Error fetching invitation:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 3. Fetch public invitation by slug
  app.get("/api/invitations/slug/:slug", async (req, res) => {
    try {
      const result = await dbQuery(
        "SELECT id, title, background, settings, pages, user_id, slug, paid, views FROM invitations WHERE slug = $1",
        [req.params.slug]
      );
      if (result.rows.length > 0) {
        const item = result.rows[0];
        const profRes = await dbQuery("SELECT premium, premium_until FROM profiles WHERE id = $1", [item.user_id]);
        const isPremium = profRes.rows.length > 0 ? isPremiumActive(profRes.rows[0].premium, profRes.rows[0].premium_until) : false;
        return res.json({ success: true, data: { ...item, paid: isPremium } });
      }
      return res.status(404).json({ success: false, error: "Invitation not found by slug" });
    } catch (error: any) {
      console.error("[API] Error fetching public invitation:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 3.b Increment views for an invitation
  app.post("/api/invitations/:id/view", async (req, res) => {
    try {
      if (useLocalFallback) {
        if (localDB[req.params.id]) {
          localDB[req.params.id].views = (localDB[req.params.id].views || 0) + 1;
          saveLocalDB();
        }
      } else {
        await dbQuery("UPDATE invitations SET views = COALESCE(views, 0) + 1 WHERE id = $1 OR slug = $1", [req.params.id]);
      }
      return res.json({ success: true });
    } catch (error: any) {
      console.error("[API] Error updating views:", error);
      return res.status(500).json({ success: false });
    }
  });

  // 4. Save / Update invitation (Upsert)
  app.post("/api/invitations", async (req, res) => {
    const { id, title, background, settings, pages, userId, slug, paid, isTemplate, thumbnail } = req.body;
    
    if (!id || !title || !background || !settings || !pages) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (id, title, background, settings, or pages)",
      });
    }

    try {
      const resolvedUserId = userId || 'mock-usr-admin';
      const resolvedSlug = slug || `invitation-${id}`;
      const resolvedPaid = paid || false;
      const resolvedIsTemplate = isTemplate || false;

      // 1. Detect if the project is new before upserting
      let isNewProject = false;
      if (useLocalFallback) {
        isNewProject = !localDB[id];
      } else {
        const checkRes = await dbQuery("SELECT 1 FROM invitations WHERE id = $1", [id]);
        isNewProject = checkRes.rows.length === 0;
      }

      // 2. Perform the Upsert
      await dbQuery(
        `INSERT INTO invitations (id, title, background, settings, pages, user_id, slug, paid, is_template, thumbnail, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           background = EXCLUDED.background,
           settings = EXCLUDED.settings,
           pages = EXCLUDED.pages,
           user_id = EXCLUDED.user_id,
           slug = EXCLUDED.slug,
           paid = EXCLUDED.paid,
           is_template = EXCLUDED.is_template,
           thumbnail = EXCLUDED.thumbnail,
           updated_at = CURRENT_TIMESTAMP`,
        [
          id,
          title,
          JSON.stringify(background),
          JSON.stringify(settings),
          JSON.stringify(pages),
          resolvedUserId,
          resolvedSlug,
          resolvedPaid,
          resolvedIsTemplate,
          thumbnail || null
        ]
      );
      if (resolvedIsTemplate) {
        const checkFeature = await dbQuery("SELECT 1 FROM platform_features_config WHERE feature_id = $1", [id]);
        if (checkFeature.rows.length === 0) {
          if (useLocalFallback) {
            const list = localDB['platform_features_config'] || [];
            list.push({
              feature_id: id,
              feature_type: 'template',
              name: title,
              is_premium: false
            });
            localDB['platform_features_config'] = list;
            saveLocalDB();
          } else {
            await dbQuery(
              "INSERT INTO platform_features_config (feature_id, feature_type, name, is_premium) VALUES ($1, 'template', $2, FALSE)",
              [id, title]
            );
          }
        }
      }

      return res.json({ success: true, message: "Invitation saved successfully" });
    } catch (error: any) {
      console.error("[API] Error saving invitation:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update custom cover thumbnail
  app.put("/api/invitations/:id/thumbnail", async (req, res) => {
    const { thumbnail } = req.body;
    if (!thumbnail) {
      return res.status(400).json({ success: false, error: "Missing thumbnail base64 data" });
    }
    try {
      if (useLocalFallback) {
        if (localDB[req.params.id]) {
          localDB[req.params.id].thumbnail = thumbnail;
          saveLocalDB();
        }
      } else {
        await dbQuery("UPDATE invitations SET thumbnail = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [thumbnail, req.params.id]);
      }
      return res.json({ success: true, message: "Cover thumbnail updated successfully" });
    } catch (error: any) {
      console.error("[API] Error updating thumbnail:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 5. Mock Payment checkout activation
  app.post("/api/invitations/pay/:id", async (req, res) => {
    try {
      const invRes = await dbQuery("SELECT user_id FROM invitations WHERE id = $1 OR slug = $1", [req.params.id]);
      if (invRes.rows.length > 0) {
        const creatorId = invRes.rows[0].user_id;
        const premiumUntilDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        if (useLocalFallback) {
          const key = `profile_${creatorId}`;
          if (!localDB[key]) {
            localDB[key] = {
              type: 'profile',
              id: creatorId,
              email: creatorId.includes('@') ? creatorId : 'email@example.com',
              full_name: 'Kreator',
              username: 'kreator_' + Math.random().toString(36).substring(2, 6),
              created_at: new Date().toISOString()
            };
          }
          localDB[key].premium = true;
          localDB[key].premium_until = premiumUntilDate;
          saveLocalDB();
        } else {
          const checkProfile = await dbQuery("SELECT 1 FROM profiles WHERE id = $1", [creatorId]);
          if (checkProfile.rows.length === 0) {
            await dbQuery(
              "INSERT INTO profiles (id, email, full_name, username, premium, premium_until, created_at) VALUES ($1, $2, $3, $4, TRUE, CURRENT_TIMESTAMP + INTERVAL '1 month', CURRENT_TIMESTAMP)",
              [
                creatorId,
                creatorId.includes('@') ? creatorId : 'email@example.com',
                'Kreator',
                'kreator_' + Math.random().toString(36).substring(2, 6)
              ]
            );
          } else {
            await dbQuery("UPDATE profiles SET premium = TRUE, premium_until = CURRENT_TIMESTAMP + INTERVAL '1 month' WHERE id = $1", [creatorId]);
          }
        }
      }
      return res.json({ success: true, message: "Payment processed successfully" });
    } catch (error: any) {
      console.error("[API] Payment error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 5.b Upgrade user profile to premium directly
  app.post("/api/profiles/pay/:userId", async (req, res) => {
    try {
      const premiumUntilDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      if (useLocalFallback) {
        const key = `profile_${req.params.userId}`;
        if (!localDB[key]) {
          localDB[key] = {
            type: 'profile',
            id: req.params.userId,
            email: req.params.userId.includes('@') ? req.params.userId : 'email@example.com',
            full_name: 'Kreator',
            username: 'kreator_' + Math.random().toString(36).substring(2, 6),
            created_at: new Date().toISOString()
          };
        }
        localDB[key].premium = true;
        localDB[key].premium_until = premiumUntilDate;
        saveLocalDB();
      } else {
        const checkProfile = await dbQuery("SELECT 1 FROM profiles WHERE id = $1", [req.params.userId]);
        if (checkProfile.rows.length === 0) {
          await dbQuery(
            "INSERT INTO profiles (id, email, full_name, username, premium, premium_until, created_at) VALUES ($1, $2, $3, $4, TRUE, CURRENT_TIMESTAMP + INTERVAL '1 month', CURRENT_TIMESTAMP)",
            [
              req.params.userId,
              req.params.userId.includes('@') ? req.params.userId : 'email@example.com',
              'Kreator',
              'kreator_' + Math.random().toString(36).substring(2, 6)
            ]
          );
        } else {
          await dbQuery("UPDATE profiles SET premium = TRUE, premium_until = CURRENT_TIMESTAMP + INTERVAL '1 month' WHERE id = $1", [req.params.userId]);
        }
      }
      return res.json({ success: true, message: "Profile upgraded to premium successfully" });
    } catch (error: any) {
      console.error("[API] Profile payment error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 5.5 Get dashboard insights metrics
  app.get("/api/dashboard/insights", async (req, res) => {
    const userId = req.query.userId || 'mock-usr-admin';
    try {
      const totalViewsRes = await dbQuery("SELECT COALESCE(SUM(views), 0) as count FROM invitations WHERE user_id = $1", [userId]);
      const totalRsvpsRes = await dbQuery("SELECT COUNT(*) as count FROM rsvp_wishes w JOIN invitations i ON w.invitation_id = i.id WHERE i.user_id = $1", [userId]);
      const attendingRes = await dbQuery("SELECT COALESCE(SUM(guests), 0) as count FROM rsvp_wishes w JOIN invitations i ON w.invitation_id = i.id WHERE i.user_id = $1 AND w.attending = 'yes'", [userId]);
      
      return res.json({
        success: true,
        data: {
          totalViews: parseInt(totalViewsRes.rows[0]?.count || 0),
          totalRsvps: parseInt(totalRsvpsRes.rows[0]?.count || 0),
          attendingGuests: parseInt(attendingRes.rows[0]?.count || 0)
        }
      });
    } catch (error: any) {
      console.error("[API] Error fetching dashboard insights:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 5.6 Get dashboard activity log UNION feed
  app.get("/api/dashboard/activities", async (req, res) => {
    const userId = req.query.userId || 'mock-usr-admin';
    try {
      const query = `
        SELECT 'rsvp' as type, w.name, w.attending, w.created_at, i.title as invitation_title 
        FROM rsvp_wishes w 
        JOIN invitations i ON w.invitation_id = i.id 
        WHERE i.user_id = $1 
        UNION ALL
        SELECT 'update' as type, NULL as name, NULL as attending, i.updated_at as created_at, i.title as invitation_title 
        FROM invitations i 
        WHERE i.user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 10
      `;
      const result = await dbQuery(query, [userId]);
      return res.json({ success: true, data: result.rows });
    } catch (error: any) {
      console.error("[API] Error fetching dashboard activities:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 6. Delete design project
  app.delete("/api/invitations/:id", async (req, res) => {
    try {
      await dbQuery("DELETE FROM invitations WHERE id = $1", [req.params.id]);
      return res.json({ success: true, message: "Invitation deleted successfully" });
    } catch (error: any) {
      console.error("[API] Delete error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- Profiles Endpoints ---

  // IMPORTANT: More specific route must come BEFORE catch-all /:userId
  // Get profile by username (checking for availability)
  app.get("/api/profiles/username/:username", async (req, res) => {
    try {
      const result = await dbQuery("SELECT id FROM profiles WHERE username = $1", [req.params.username.toLowerCase().trim()]);
      if (result.rows.length > 0) {
        return res.json({ success: true, taken: true });
      }
      return res.json({ success: true, taken: false });
    } catch (error: any) {
      console.error("[API] Error checking username:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get user profile by ID
  app.get("/api/profiles/:userId", async (req, res) => {
    try {
      const result = await dbQuery("SELECT id, email, full_name, username, premium, premium_until, created_at FROM profiles WHERE id = $1", [req.params.userId]);
      if (result.rows.length > 0) {
        const profile = result.rows[0];
        const isPremium = isPremiumActive(profile.premium, profile.premium_until);
        return res.json({ success: true, data: { ...profile, premium: isPremium } });
      }
      return res.json({ success: true, data: null });
    } catch (error: any) {
      console.error("[API] Error getting profile:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Save/Update user profile
  app.post("/api/profiles", async (req, res) => {
    const { id, email, fullName, username } = req.body;
    if (!id || !email || !fullName || !username) {
      return res.status(400).json({ success: false, error: "Missing required fields (id, email, fullName, username)" });
    }

    try {
      const cleanUsername = username.toLowerCase().trim();
      
      // Check if username is already taken by another user
      const checkRes = await dbQuery("SELECT id FROM profiles WHERE username = $1 AND id != $2", [cleanUsername, id]);
      if (checkRes.rows.length > 0) {
        return res.status(400).json({ success: false, error: "Username sudah digunakan." });
      }

      await dbQuery(
        `INSERT INTO profiles (id, email, full_name, username, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           username = EXCLUDED.username`,
        [id, email.trim(), fullName.trim(), cleanUsername]
      );
      
      return res.json({ success: true, message: "Profile saved successfully" });
    } catch (error: any) {
      console.error("[API] Error saving profile:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin Login Endpoint
  app.post("/api/admin/login", (req, res) => {
    try {
      const { username, password } = req.body;
      const adminSecret = process.env.ADMIN_SECRET_KEY || 'super-secure-admin-pwd';
      
      if (username === 'admin' && password === adminSecret) {
        return res.json({ success: true, token: adminSecret });
      } else {
        return res.status(401).json({ success: false, error: 'Kredensial admin salah. Silakan coba lagi.' });
      }
    } catch (error: any) {
      console.error("[API] Admin login error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin Authentication Middleware
  app.use("/api/admin", (req, res, next) => {
    const authHeader = req.headers.authorization;
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'super-secure-admin-pwd';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token format' });
    }
    
    const token = authHeader.substring(7);
    if (token !== adminSecret) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
    
    next();
  });

  // List all profiles (Admin only)
  app.get("/api/admin/profiles", async (req, res) => {
    try {
      if (!useLocalFallback) {
        try {
          const checkAuthTable = await dbQuery(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'auth' AND table_name = 'users'
            );
          `);
          if (checkAuthTable.rows[0]?.exists) {
            // Clean up public profiles that do not exist in Supabase auth.users
            await dbQuery("DELETE FROM public.profiles WHERE id::text NOT IN (SELECT id::text FROM auth.users) AND id != 'admin'");
          }
        } catch (e) {
          console.warn("[API] Supabase auth cleanup skip (local mock db or auth table not accessible):", e);
        }
      }

      const result = await dbQuery("SELECT id, email, full_name, username, premium, premium_until, created_at FROM profiles ORDER BY created_at DESC");
      const mapped = result.rows.map((row: any) => ({
        ...row,
        premium: isPremiumActive(row.premium, row.premium_until)
      }));
      return res.json({ success: true, data: mapped });
    } catch (error: any) {
      console.error("[API] Error listing admin profiles:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 6.b Get RSVP wishes/guestbook scoped by invitationId
  app.get("/api/invitations/:invitationId/wishes", async (req, res) => {
    try {
      const { invitationId } = req.params;
      const result = await dbQuery(
        "SELECT id, invitation_id, name, attending, guests, message, created_at FROM rsvp_wishes WHERE invitation_id = $1 ORDER BY created_at DESC",
        [invitationId]
      );
      return res.json({ success: true, data: result.rows });
    } catch (error: any) {
      console.error("[API] Error fetching RSVP wishes:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 6.c Add new RSVP wish/guestbook entry for specific invitationId
  app.post("/api/invitations/:invitationId/wishes", async (req, res) => {
    try {
      const { invitationId } = req.params;
      const { name, attending, guests, message } = req.body;
      
      if (!name) {
        return res.status(400).json({ success: false, error: "Name is required" });
      }

      const id = 'wish-' + Math.random().toString(36).substring(2, 9);
      await dbQuery(
        "INSERT INTO rsvp_wishes (id, invitation_id, name, attending, guests, message) VALUES ($1, $2, $3, $4, $5, $6)",
        [id, invitationId, name, attending || 'hadir', guests || 1, message || '']
      );

      return res.json({ 
        success: true, 
        data: { 
          id, 
          invitation_id: invitationId, 
          name, 
          attending: attending || 'hadir', 
          guests: guests || 1, 
          message: message || '',
          created_at: new Date().toISOString()
        } 
      });
    } catch (error: any) {
      console.error("[API] Error adding RSVP wish:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- Guests API Routes for User-scoped Invitations ---
  app.get("/api/invitations/:invitationId/guests", async (req, res) => {
    try {
      const { invitationId } = req.params;
      
      // Resolve real UUID and Slug to support both database formats
      let realId = invitationId;
      let invitationSlug = invitationId;
      if (pool) {
        const res = await dbQuery("SELECT id, slug FROM invitations WHERE id = $1 OR slug = $1", [invitationId]);
        if (res.rows.length > 0) {
          realId = res.rows[0].id;
          invitationSlug = res.rows[0].slug;
        }
      } else {
        const found = localDB[invitationId] || Object.values(localDB).find((p: any) => p && p.slug === invitationId && p.type !== 'profile');
        if (found) {
          realId = found.id;
          invitationSlug = found.slug;
        }
      }

      // If pool is active and database is online, fetch from PostgreSQL database
      if (pool && !useLocalFallback) {
        const result = await dbQuery(
          "SELECT id, name, status, created_at, updated_at FROM guests WHERE invitation_id = $1 OR invitation_id = $2 OR invitation_id = $3 ORDER BY created_at DESC",
          [invitationId, realId, invitationSlug]
        );
        return res.json({ success: true, data: result.rows });
      }

      // Local db fallback
      if (!localDB['guests']) localDB['guests'] = [];
      const matchIds = [invitationId, realId, invitationSlug].filter(Boolean);
      const guests = localDB['guests'].filter((g: any) => matchIds.includes(g.invitation_id));
      // Sort desc by created_at
      guests.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return res.json({ success: true, data: guests });
    } catch (error: any) {
      console.error("[API] Error fetching guests list:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/invitations/:invitationId/guests/bulk", async (req, res) => {
    try {
      const { invitationId } = req.params;
      const { guests } = req.body; // array of { name: string }

      if (!Array.isArray(guests)) {
        return res.status(400).json({ success: false, error: "Guests array is required" });
      }

      // Resolve real UUID and Slug
      let realId = invitationId;
      if (pool) {
        const res = await dbQuery("SELECT id FROM invitations WHERE id = $1 OR slug = $1", [invitationId]);
        if (res.rows.length > 0) {
          realId = res.rows[0].id;
        }
      } else {
        const found = localDB[invitationId] || Object.values(localDB).find((p: any) => p && p.slug === invitationId && p.type !== 'profile');
        if (found) {
          realId = found.id;
        }
      }

      const addedGuests: any[] = [];
      
      for (const guestItem of guests) {
        if (!guestItem.name || !guestItem.name.trim()) continue;
        const id = 'guest-' + Math.random().toString(36).substring(2, 9);
        const name = guestItem.name.trim();
        const nowStr = new Date().toISOString();

        if (pool && !useLocalFallback) {
          await dbQuery(
            "INSERT INTO guests (id, invitation_id, name, status) VALUES ($1, $2, $3, 'pending')",
            [id, realId, name]
          );
        } else {
          if (!localDB['guests']) localDB['guests'] = [];
          localDB['guests'].push({
            id,
            invitation_id: realId,
            name,
            status: 'pending',
            created_at: nowStr,
            updated_at: nowStr
          });
        }

        addedGuests.push({
          id,
          invitation_id: realId,
          name,
          status: 'pending',
          created_at: nowStr,
          updated_at: nowStr
        });
      }

      if (!pool) {
        saveLocalDB();
      }

      return res.json({ success: true, data: addedGuests });
    } catch (error: any) {
      console.error("[API] Error saving bulk guests:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/invitations/:invitationId/guests/:guestId/status", async (req, res) => {
    try {
      const { invitationId, guestId } = req.params;
      const { status } = req.body; // 'pending', 'sent', 'read'

      if (!status) {
        return res.status(400).json({ success: false, error: "Status is required" });
      }

      // Resolve real UUID and Slug
      let realId = invitationId;
      let invitationSlug = invitationId;
      if (pool) {
        const res = await dbQuery("SELECT id, slug FROM invitations WHERE id = $1 OR slug = $1", [invitationId]);
        if (res.rows.length > 0) {
          realId = res.rows[0].id;
          invitationSlug = res.rows[0].slug;
        }
      } else {
        const found = localDB[invitationId] || Object.values(localDB).find((p: any) => p && p.slug === invitationId && p.type !== 'profile');
        if (found) {
          realId = found.id;
          invitationSlug = found.slug;
        }
      }

      if (pool && !useLocalFallback) {
        await dbQuery(
          "UPDATE guests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND (invitation_id = $3 OR invitation_id = $4 OR invitation_id = $5)",
          [status, guestId, invitationId, realId, invitationSlug]
        );
      } else {
        if (!localDB['guests']) localDB['guests'] = [];
        const matchIds = [invitationId, realId, invitationSlug].filter(Boolean);
        const found = localDB['guests'].find((g: any) => g.id === guestId && matchIds.includes(g.invitation_id));
        if (found) {
          found.status = status;
          found.updated_at = new Date().toISOString();
          saveLocalDB();
        }
      }

      return res.json({ success: true, message: "Guest status updated" });
    } catch (error: any) {
      console.error("[API] Error updating guest status:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete("/api/invitations/:invitationId/guests/:guestId", async (req, res) => {
    try {
      const { invitationId, guestId } = req.params;

      // Resolve real UUID and Slug
      let realId = invitationId;
      let invitationSlug = invitationId;
      if (pool) {
        const res = await dbQuery("SELECT id, slug FROM invitations WHERE id = $1 OR slug = $1", [invitationId]);
        if (res.rows.length > 0) {
          realId = res.rows[0].id;
          invitationSlug = res.rows[0].slug;
        }
      } else {
        const found = localDB[invitationId] || Object.values(localDB).find((p: any) => p && p.slug === invitationId && p.type !== 'profile');
        if (found) {
          realId = found.id;
          invitationSlug = found.slug;
        }
      }

      if (pool && !useLocalFallback) {
        await dbQuery(
          "DELETE FROM guests WHERE id = $1 AND (invitation_id = $2 OR invitation_id = $3 OR invitation_id = $4)",
          [guestId, invitationId, realId, invitationSlug]
        );
      } else {
        if (!localDB['guests']) localDB['guests'] = [];
        const matchIds = [invitationId, realId, invitationSlug].filter(Boolean);
        localDB['guests'] = localDB['guests'].filter((g: any) => !(g.id === guestId && matchIds.includes(g.invitation_id)));
        saveLocalDB();
      }

      return res.json({ success: true, message: "Guest deleted" });
    } catch (error: any) {
      console.error("[API] Error deleting guest:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete("/api/invitations/:invitationId/guests", async (req, res) => {
    try {
      const { invitationId } = req.params;

      // Resolve real UUID and Slug
      let realId = invitationId;
      let invitationSlug = invitationId;
      if (pool) {
        const res = await dbQuery("SELECT id, slug FROM invitations WHERE id = $1 OR slug = $1", [invitationId]);
        if (res.rows.length > 0) {
          realId = res.rows[0].id;
          invitationSlug = res.rows[0].slug;
        }
      } else {
        const found = localDB[invitationId] || Object.values(localDB).find((p: any) => p && p.slug === invitationId && p.type !== 'profile');
        if (found) {
          realId = found.id;
          invitationSlug = found.slug;
        }
      }

      if (pool && !useLocalFallback) {
        await dbQuery(
          "DELETE FROM guests WHERE invitation_id = $1 OR invitation_id = $2 OR invitation_id = $3",
          [invitationId, realId, invitationSlug]
        );
      } else {
        if (!localDB['guests']) localDB['guests'] = [];
        const matchIds = [invitationId, realId, invitationSlug].filter(Boolean);
        localDB['guests'] = localDB['guests'].filter((g: any) => !matchIds.includes(g.invitation_id));
        saveLocalDB();
      }

      return res.json({ success: true, message: "All guests deleted" });
    } catch (error: any) {
      console.error("[API] Error clearing guests:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- Bug Reports API Routes ---
  app.post("/api/bug-reports", async (req, res) => {
    try {
      const { user_email, description, page_url, user_id } = req.body;
      if (!description) {
        return res.status(400).json({ success: false, error: "Description is required" });
      }
      const id = 'bug-' + Math.random().toString(36).substring(2, 9);
      const now = new Date().toISOString();

      if (pool) {
        await dbQuery(
          "INSERT INTO bug_reports (id, user_email, user_id, description, page_url) VALUES ($1, $2, $3, $4, $5)",
          [id, user_email || 'anonymous', user_id || null, description, page_url || null]
        );
      } else {
        localDB['bug_reports'].push({
          id,
          user_email: user_email || 'anonymous',
          user_id: user_id || null,
          description,
          page_url: page_url || null,
          status: 'open',
          created_at: now
        });
        saveLocalDB();
      }

      return res.json({ success: true, message: "Bug report submitted successfully" });
    } catch (err: any) {
      console.error("[API] Error reporting bug:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/admin/bug-reports", async (req, res) => {
    try {
      if (pool) {
        const result = await dbQuery(
          "SELECT id, user_email, user_id, description, page_url, status, created_at FROM bug_reports ORDER BY created_at DESC"
        );
        return res.json({ success: true, data: result.rows });
      }

      if (!localDB['bug_reports']) localDB['bug_reports'] = [];
      const list = [...localDB['bug_reports']];
      list.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return res.json({ success: true, data: list });
    } catch (err: any) {
      console.error("[API] Error fetching bug reports:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put("/api/admin/bug-reports/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'open', 'resolved'

      if (!status) {
        return res.status(400).json({ success: false, error: "Status is required" });
      }

      if (pool) {
        await dbQuery(
          "UPDATE bug_reports SET status = $1 WHERE id = $2",
          [status, id]
        );
      } else {
        if (!localDB['bug_reports']) localDB['bug_reports'] = [];
        const bug = localDB['bug_reports'].find((b: any) => b.id === id);
        if (bug) {
          bug.status = status;
          saveLocalDB();
        }
      }

      return res.json({ success: true, message: "Bug report status updated" });
    } catch (err: any) {
      console.error("[API] Error updating bug report status:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Admin API Endpoints ---
  app.get("/api/admin/stats", async (req, res) => {
    try {
      let totalProjects = 0;
      let premiumUsers = 0;
      let totalUsers = 0;

      if (useLocalFallback) {
        const items = Object.entries(localDB)
          .filter(([key, val]) => key !== 'music_library' && key !== 'assets_library' && val && typeof val === 'object' && !Array.isArray(val) && val.type !== 'profile' && !(val as any).is_template)
          .map(([, val]) => val as any);
        totalProjects = items.length;
        
        const userProfiles = Object.values(localDB)
          .filter((val: any) => val && val.type === 'profile')
          .map((p: any) => ({ ...p, premium: isPremiumActive(p.premium, p.premium_until) }));
        totalUsers = userProfiles.length;
        premiumUsers = userProfiles.filter((p: any) => p.premium === true).length;
      } else {
        const projRes = await dbQuery("SELECT COUNT(*) as count FROM invitations WHERE (is_template = FALSE OR is_template IS NULL)");
        totalProjects = parseInt(projRes.rows[0]?.count || 0);
        
        const userRes = await dbQuery("SELECT COUNT(*) as count, SUM(CASE WHEN premium = true AND (premium_until IS NULL OR premium_until > CURRENT_TIMESTAMP) THEN 1 ELSE 0 END) as premium_count FROM profiles");
        totalUsers = parseInt(userRes.rows[0]?.count || 0);
        premiumUsers = parseInt(userRes.rows[0]?.premium_count || 0);
      }

      const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : "0.0";
      const totalRevenue = premiumUsers * 25000;

      return res.json({
        success: true,
        stats: {
          totalProjects,
          paidProjects: premiumUsers,
          totalUsers: Math.max(1, totalUsers),
          totalRevenue,
          conversionRate
        }
      });
    } catch (error: any) {
      console.error("[API] Admin stats error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/admin/invitations", async (req, res) => {
    try {
      let invitations: any[] = [];
      if (useLocalFallback) {
        // Only include invitation records, exclude music_library, assets_library, profiles, and templates
        invitations = Object.entries(localDB)
          .filter(([key, val]) => 
            key !== 'music_library' && 
            key !== 'assets_library' && 
            key !== 'platform_features_config' &&
            !key.startsWith('profile_') && 
            val && 
            typeof val === 'object' && 
            !Array.isArray(val) &&
            val.title &&
            !(val as any).is_template
          )
          .map(([, p]: [string, any]) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            paid: p.paid === true,
            user_id: p.user_id || 'mock-usr-admin',
            updated_at: p.updated_at || new Date().toISOString()
          }));
      } else {
        const result = await dbQuery("SELECT id, title, slug, paid, views, user_id, updated_at FROM invitations WHERE (is_template = FALSE OR is_template IS NULL) ORDER BY updated_at DESC");
        invitations = result.rows;
      }
      return res.json({ success: true, data: invitations });
    } catch (error: any) {
      console.error("[API] Admin invitations error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/admin/invitations/:id/paid", async (req, res) => {
    try {
      const { paid } = req.body;
      if (useLocalFallback) {
        if (localDB[req.params.id]) {
          localDB[req.params.id].paid = paid;
          saveLocalDB();
        }
      } else {
        await dbQuery("UPDATE invitations SET paid = $1 WHERE id = $2", [paid, req.params.id]);
      }
      return res.json({ success: true, message: "Payment status updated" });
    } catch (error: any) {
      console.error("[API] Admin toggle paid error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete("/api/admin/invitations/:id", async (req, res) => {
    try {
      if (useLocalFallback) {
        delete localDB[req.params.id];
        saveLocalDB();
      } else {
        await dbQuery("DELETE FROM invitations WHERE id = $1", [req.params.id]);
      }
      return res.json({ success: true, message: "Project deleted by admin" });
    } catch (error: any) {
      console.error("[API] Admin delete error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/admin/profiles/:id/premium", async (req, res) => {
    try {
      const { premium } = req.body;
      if (useLocalFallback) {
        const key = `profile_${req.params.id}`;
        if (localDB[key]) {
          localDB[key].premium = premium;
          localDB[key].premium_until = premium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
          saveLocalDB();
        }
      } else {
        if (premium) {
          await dbQuery("UPDATE profiles SET premium = TRUE, premium_until = CURRENT_TIMESTAMP + INTERVAL '1 month' WHERE id = $1", [req.params.id]);
        } else {
          await dbQuery("UPDATE profiles SET premium = FALSE, premium_until = NULL WHERE id = $1", [req.params.id]);
        }
      }
      return res.json({ success: true, message: "Profile premium status updated" });
    } catch (error: any) {
      console.error("[API] Admin toggle premium error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete user profile (Admin only)
  app.delete("/api/admin/profiles/:id", async (req, res) => {
    try {
      if (useLocalFallback) {
        delete localDB[`profile_${req.params.id}`];
        // Also delete associated invitations
        Object.keys(localDB).forEach(key => {
          if (localDB[key] && localDB[key].user_id === req.params.id) {
            delete localDB[key];
          }
        });
        saveLocalDB();
      } else {
        // Delete associated invitations first
        await dbQuery("DELETE FROM invitations WHERE user_id = $1", [req.params.id]);
        // Delete profile
        await dbQuery("DELETE FROM profiles WHERE id = $1", [req.params.id]);
      }
      return res.json({ success: true, message: "User profile and invitations deleted successfully" });
    } catch (error: any) {
      console.error("[API] Error deleting user profile:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- Music API Routes ---
  app.get("/api/music", async (req, res) => {
    try {
      const result = await dbQuery("SELECT id, name, artist, url, category, duration, premium FROM music_library");
      return res.json({ success: true, data: result.rows });
    } catch (error: any) {
      console.error("[API] Get music error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/music", async (req, res) => {
    try {
      const { name, artist, url, category, duration, premium } = req.body;
      if (!name || !url || !category || !duration) {
        return res.status(400).json({ success: false, error: "Missing fields" });
      }
      const isPremium = premium === true || premium === "true";
      const id = 'music-' + Math.random().toString(36).substring(2, 9);
      await dbQuery(
        "INSERT INTO music_library (id, name, artist, url, category, duration, premium) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [id, name, artist || "Unknown", url, category, duration, isPremium]
      );
      return res.json({ success: true, data: { id, name, artist, url, category, duration, premium: isPremium } });
    } catch (error: any) {
      console.error("[API] Add music error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete("/api/music/:id", async (req, res) => {
    try {
      await dbQuery("DELETE FROM music_library WHERE id = $1", [req.params.id]);
      return res.json({ success: true, message: "Music track deleted" });
    } catch (error: any) {
      console.error("[API] Delete music error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Configure memory storage for multer uploads
  const uploadStorage = multer.memoryStorage();
  const upload = multer({
    storage: uploadStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB file limit
  });

  // --- User Upload Image Optimization API (Sharp & WebP) ---
  app.post("/api/upload", upload.single("image"), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
      }

      // Generate unique name
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = `uploaded-${uniqueSuffix}.webp`;
      
      const customAssetsDir = path.join(process.cwd(), "public", "custom-assets");
      
      // Ensure custom assets folder exists
      if (!fs.existsSync(customAssetsDir)) {
        fs.mkdirSync(customAssetsDir, { recursive: true });
      }

      const destPath = path.join(customAssetsDir, filename);

      // Compress and convert to WebP using sharp
      await sharp(req.file.buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // limit dimensions for faster loading and Core Web Vitals
        .webp({ quality: 80 }) // convert to webp at 80% quality
        .toFile(destPath);

      const fileUrl = `/custom-assets/${filename}`;
      return res.json({ success: true, url: fileUrl });
    } catch (error: any) {
      console.error("[API] Image upload & optimization error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- Assets API Routes ---
  app.get("/api/assets", async (req, res) => {
    try {
      const result = await dbQuery("SELECT id, name, url, category, premium FROM assets_library");
      return res.json({ success: true, data: result.rows });
    } catch (error: any) {
      console.error("[API] Get assets error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const { name, url, category, premium } = req.body;
      if (!name || !url || !category) {
        return res.status(400).json({ success: false, error: "Missing fields" });
      }
      const isPremium = premium === true || premium === "true";
      const id = 'asset-' + Math.random().toString(36).substring(2, 9);
      await dbQuery(
        "INSERT INTO assets_library (id, name, url, category, premium) VALUES ($1, $2, $3, $4, $5)",
        [id, name, url, category, isPremium]
      );
      return res.json({ success: true, data: { id, name, url, category, premium: isPremium } });
    } catch (error: any) {
      console.error("[API] Add asset error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      await dbQuery("DELETE FROM assets_library WHERE id = $1", [req.params.id]);
      return res.json({ success: true, message: "Asset deleted" });
    } catch (error: any) {
      console.error("[API] Delete asset error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/admin/assets/:id/premium", async (req, res) => {
    try {
      const { premium } = req.body;
      const isPremium = premium === true || premium === "true";
      await dbQuery("UPDATE assets_library SET premium = $1 WHERE id = $2", [isPremium, req.params.id]);
      return res.json({ success: true, message: "Asset premium status updated" });
    } catch (error: any) {
      console.error("[API] Update asset premium status error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/admin/music/:id/premium", async (req, res) => {
    try {
      const { premium } = req.body;
      const isPremium = premium === true || premium === "true";
      await dbQuery("UPDATE music_library SET premium = $1 WHERE id = $2", [isPremium, req.params.id]);
      return res.json({ success: true, message: "Music premium status updated" });
    } catch (error: any) {
      console.error("[API] Update music premium status error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- Platform Features Config API Routes ---
  app.get("/api/features-config", async (req, res) => {
    try {
      const result = await dbQuery("SELECT feature_id, feature_type, name, is_premium FROM platform_features_config");
      return res.json({ success: true, data: result.rows });
    } catch (error: any) {
      console.error("[API] Get features config error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/admin/features-config/:id", async (req, res) => {
    try {
      const { is_premium } = req.body;
      const isPremium = is_premium === true || is_premium === "true";
      await dbQuery("UPDATE platform_features_config SET is_premium = $1 WHERE feature_id = $2", [isPremium, req.params.id]);
      return res.json({ success: true, message: "Feature config updated" });
    } catch (error: any) {
      console.error("[API] Update feature config error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- Pre-rendered SEO Templates Catalog page ---
  app.get(["/templates", "/katalog"], async (req, res, next) => {
    try {
      const title = "Katalog Template Undangan Pernikahan Digital Elegan - invitationbuilder.net";
      const description = "Pilih dari puluhan template undangan digital pernikahan premium terbaik di Indonesia. Lengkap dengan RSVP otomatis, galeri musik, dan integrasi maps.";
      const canonicalUrl = "https://invitationbuilder.net/templates";
      const imageUrl = "https://invitationbuilder.net/logo.png";

      // Carousel / ItemList Schema markup for search engines
      const carouselSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Katalog Desain Undangan Pernikahan invitationbuilder.net",
        "url": canonicalUrl,
        "description": description,
        "numberOfItems": 4,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Template Tema Bunga Merah",
            "url": `${canonicalUrl}?template=tpl-gwhxtyp`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Template Blue Sea",
            "url": `${canonicalUrl}?template=tpl-tm794im`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Template Art Mewah",
            "url": `${canonicalUrl}?template=tpl-8dihztj`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "Template Pernikahan Baru",
            "url": `${canonicalUrl}?template=tpl-imx40dk`
          }
        ]
      };

      let htmlPath = path.join(process.cwd(), "index.html");
      if (process.env.NODE_ENV === "production") {
        htmlPath = path.join(process.cwd(), "dist", "index.html");
      }
      if (!fs.existsSync(htmlPath)) {
        htmlPath = path.join(process.cwd(), "index.html");
      }

      let htmlContent = fs.readFileSync(htmlPath, "utf-8");

      if (process.env.NODE_ENV !== "production" && vite) {
        htmlContent = await vite.transformIndexHtml(req.originalUrl, htmlContent);
      }

      htmlContent = htmlContent
        .replace("<!-- DYNAMIC_CANONICAL -->", `<link rel="canonical" href="${canonicalUrl}" />`)
        .replace("<!-- DYNAMIC_SEO_TITLE -->", `<title>${title}</title>`)
        .replace(
          "<!-- DYNAMIC_SEO_META -->",
          `<meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />`
        )
        .replace("<!-- DYNAMIC_JSON_LD -->", `<script type="application/ld+json">${JSON.stringify(carouselSchema)}</script>`);

      return res.status(200).set({ "Content-Type": "text/html" }).end(htmlContent);
    } catch (err: any) {
      console.error("[SEO Templates] Error rendering templates catalog page:", err);
      next();
    }
  });

  // --- Pre-rendered SEO Blog Articles portal ---
  app.get("/blog", async (req, res, next) => {
    try {
      const title = "Blog Hub Panduan Perencanaan & Undangan Pernikahan - invitationbuilder.net";
      const description = "Temukan tips terkini seputar menyusun rundown pernikahan modern, susunan kata-kata undangan pernikahan, dan kiat membuat undangan digital premium.";
      const canonicalUrl = "https://invitationbuilder.net/blog";
      const imageUrl = "https://invitationbuilder.net/logo.png";

      let htmlPath = path.join(process.cwd(), "index.html");
      if (process.env.NODE_ENV === "production") {
        htmlPath = path.join(process.cwd(), "dist", "index.html");
      }
      if (!fs.existsSync(htmlPath)) {
        htmlPath = path.join(process.cwd(), "index.html");
      }

      let htmlContent = fs.readFileSync(htmlPath, "utf-8");

      if (process.env.NODE_ENV !== "production" && vite) {
        htmlContent = await vite.transformIndexHtml(req.originalUrl, htmlContent);
      }

      htmlContent = htmlContent
        .replace("<!-- DYNAMIC_CANONICAL -->", `<link rel="canonical" href="${canonicalUrl}" />`)
        .replace("<!-- DYNAMIC_SEO_TITLE -->", `<title>${title}</title>`)
        .replace(
          "<!-- DYNAMIC_SEO_META -->",
          `<meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />`
        )
        .replace("<!-- DYNAMIC_JSON_LD -->", "");

      return res.status(200).set({ "Content-Type": "text/html" }).end(htmlContent);
    } catch (err: any) {
      console.error("[SEO Blog Hub] Error rendering blog page:", err);
      next();
    }
  });

  app.get("/blog/:slug", async (req, res, next) => {
    try {
      const slug = req.params.slug;
      
      // Local articles registry matching client definitions
      const articles: Record<string, { title: string; desc: string; category: string; date: string; faqs: { q: string; a: string }[] }> = {
        "tips-membuat-undangan-digital-elegan": {
          title: "7 Tips Membuat Undangan Digital Pernikahan yang Elegan & Menarik",
          desc: "Panduan praktis memilih warna tema, ornamen pendukung, font tipografi, dan durasi musik latar agar undangan digital Anda terlihat sangat premium.",
          category: "Tips & Panduan",
          date: "2026-07-03",
          faqs: [
            { q: "Apakah undangan digital bisa dibagikan lewat WhatsApp?", a: "Ya, undangan digital invitationbuilder.net dikirimkan berupa link web unik yang sangat mudah dibagikan melalui chat WhatsApp, Telegram, LINE, atau email." },
            { q: "Bagaimana cara menambahkan lagu di undangan?", a: "Di platform kami, Anda dapat dengan mudah mengupload file lagu favorit Anda atau memilih musik romantis yang sudah kami sediakan di dalam perpustakaan musik." }
          ]
        },
        "rundown-acara-pernikahan-modern": {
          title: "Contoh Susunan Acara Pernikahan (Rundown) Modern yang Rapi & Terstruktur",
          desc: "Temukan struktur rundown pernikahan nasional dari akad nikah/pemberkatan, sesi pemotretan, hingga resepsi makan malam yang teratur.",
          category: "Perencanaan",
          date: "2026-06-28",
          faqs: [
            { q: "Berapa lama durasi ideal resepsi pernikahan?", a: "Rata-rata resepsi pernikahan di Indonesia berlangsung selama 2 hingga 3 jam, yang mencakup prosesi masuk, doa, bersalaman, makan malam, dan sesi foto bersama." },
            { q: "Apakah susunan acara perlu ditampilkan di undangan digital?", a: "Ya, menampilkan agenda acara sangat dianjurkan agar tamu undangan tahu waktu yang tepat untuk datang, terutama jika ada pembagian sesi kedatangan." }
          ]
        },
        "contoh-kata-kata-undangan-pernikahan-digital": {
          title: "25 Contoh Kata-Kata Undangan Pernikahan Digital yang Sopan & Menarik",
          desc: "Kumpulan inspirasi kata-kata (wording) untuk undangan pernikahan online digital, mulai dari islami, kristen, kasual, hingga bahasa Inggris yang sopan.",
          category: "Inspirasi",
          date: "2026-07-08",
          faqs: [
            { q: "Bagaimana cara mempersonalisasi nama tamu di undangan digital?", a: "Di InviteStudio, Anda cukup menambahkan parameter nama tamu di ujung link URL undangan Anda (misalnya ?to=Nama+Tamu). Sistem akan otomatis memunculkan nama tamu tersebut secara dinamis di halaman cover." },
            { q: "Apakah format teks undangan digital berbeda dengan undangan cetak?", a: "Teks undangan digital biasanya lebih fleksibel karena ditunjang fitur multimedia. Namun, susunan inti seperti nama mempelai, detail waktu, dan peta lokasi tetap harus diletakkan secara runut." }
          ]
        },
        "panduan-memilih-lagu-pernikahan-romantis": {
          title: "15 Rekomendasi Lagu Pernikahan Romantis untuk Musik Latar Undangan Digital",
          desc: "Daftar rekomendasi lagu pernikahan romantis terpopuler (instrumental, pop, klasik) sebagai musik latar (backsound) undangan pernikahan digital Anda.",
          category: "Inspirasi",
          date: "2026-07-06",
          faqs: [
            { q: "Apakah musik latar bisa mati sendiri?", a: "Tamu undangan dapat mematikan atau menyalakan kembali musik latar kapan saja dengan mengeklik tombol ikon speaker floating (Volume) yang tersedia di pojok layar." },
            { q: "Lagu apa yang paling populer digunakan sebagai backsound undangan digital?", a: "Lagu instrumental piano seperti 'Canon in D' dan lagu pop akustik lambat adalah tipe lagu paling favorit karena memiliki tempo lambat yang sangat menenangkan." }
          ]
        },
        "tren-desain-undangan-digital-pernikahan-2026": {
          title: "Tren Desain Undangan Pernikahan Digital Terpopuler Tahun 2026",
          desc: "Ulasan mendalam mengenai tren warna, ornamen batik modern, efek paralaks, dan fitur interaktif undangan online yang hits tahun ini.",
          category: "Tren & Inspirasi",
          date: "2026-07-08",
          faqs: [
            { q: "Apa warna tema terpopuler untuk undangan digital tahun 2026?", a: "Emerald Green, Terracotta Warm, dan Royal Navy Blue & Gold adalah palet terfavorit saat ini." },
            { q: "Apakah bisa menggabungkan unsur adat ke undangan modern?", a: "Tentu saja, InviteStudio menyediakan perpaduan ornamen tradisional seperti gunungan, ukiran emas Bali, dan batik heritage yang dikemas secara modern." }
          ]
        },
        "cara-menyebarkan-link-undangan-digital-lewat-whatsapp": {
          title: "Cara Menyebarkan Link Undangan Digital via WhatsApp yang Sopan & Benar",
          desc: "Tips dan panduan etika membagikan tautan undangan pernikahan online kepada kerabat, keluarga dekat, teman kantor, beserta template pesan sopan.",
          category: "Tips & Panduan",
          date: "2026-07-08",
          faqs: [
            { q: "Kapan waktu terbaik untuk mengirimkan link undangan digital?", a: "Idealnya adalah 2 hingga 4 minggu sebelum hari H acara pernikahan diselenggarakan." },
            { q: "Apakah boleh menyebarkan undangan digital lewat grup WA?", a: "Sebaiknya hindari mengirim di grup untuk kerabat dekat atau senior. Mengirim secara personal (japri) jauh lebih sopan dan dihargai." }
          ]
        }
      };

      const article = articles[slug];
      if (!article) {
        return next();
      }

      const title = `${article.title} - Blog invitationbuilder.net`;
      const description = article.desc;
      const canonicalUrl = `https://invitationbuilder.net/blog/${slug}`;
      const imageUrl = "https://invitationbuilder.net/logo.png";

      // Article Schema & FAQ Schema
      const articleSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            "@id": `${canonicalUrl}#article`,
            "isPartOf": {
              "@id": `${canonicalUrl}#webpage`
            },
            "headline": article.title,
            "description": article.desc,
            "datePublished": `${article.date}T09:00:00+07:00`,
            "dateModified": `${article.date}T09:00:00+07:00`,
            "mainEntityOfPage": canonicalUrl,
            "author": {
              "@type": "Organization",
              "name": "invitationbuilder.net Team",
              "url": "https://invitationbuilder.net/"
            },
            "publisher": {
              "@type": "Organization",
              "name": "invitationbuilder.net",
              "logo": {
                "@type": "ImageObject",
                "url": "https://invitationbuilder.net/logo.png"
              }
            },
            "image": imageUrl
          },
          {
            "@type": "FAQPage",
            "@id": `${canonicalUrl}#faq`,
            "mainEntity": article.faqs.map(f => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": f.a
              }
            }))
          }
        ]
      };

      let htmlPath = path.join(process.cwd(), "index.html");
      if (process.env.NODE_ENV === "production") {
        htmlPath = path.join(process.cwd(), "dist", "index.html");
      }
      if (!fs.existsSync(htmlPath)) {
        htmlPath = path.join(process.cwd(), "index.html");
      }

      let htmlContent = fs.readFileSync(htmlPath, "utf-8");

      if (process.env.NODE_ENV !== "production" && vite) {
        htmlContent = await vite.transformIndexHtml(req.originalUrl, htmlContent);
      }

      htmlContent = htmlContent
        .replace("<!-- DYNAMIC_CANONICAL -->", `<link rel="canonical" href="${canonicalUrl}" />`)
        .replace("<!-- DYNAMIC_SEO_TITLE -->", `<title>${title}</title>`)
        .replace(
          "<!-- DYNAMIC_SEO_META -->",
          `<meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />`
        )
        .replace("<!-- DYNAMIC_JSON_LD -->", `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`);

      return res.status(200).set({ "Content-Type": "text/html" }).end(htmlContent);
    } catch (err: any) {
      console.error("[SEO Blog Article] Error rendering blog article page:", err);
      next();
    }
  });

  // --- Dynamic XML Sitemap for SEO Crawlers ---
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const result = await dbQuery(
        "SELECT slug, updated_at FROM invitations WHERE (is_template = FALSE OR is_template IS NULL) AND slug IS NOT NULL"
      );
      
      const xmlUrls = result.rows.map((row: any) => {
        const lastMod = row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        return `
  <url>
    <loc>https://invitationbuilder.net/v/${encodeURIComponent(row.slug)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`;
      }).join('');

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://invitationbuilder.net/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.00</priority>
  </url>
  <!-- Public Invitations -->${xmlUrls}
</urlset>`;

      res.header("Content-Type", "application/xml");
      return res.status(200).send(sitemapXml);
    } catch (error: any) {
      console.error("[Sitemap] Error generating sitemap.xml:", error);
      return res.status(500).send("Error generating sitemap");
    }
  });

  // --- Dynamic HTML SEO Meta Injection for Public Invitation Pages ---
  app.get("/v/:slug", async (req, res, next) => {
    try {
      const slug = req.params.slug;
      
      // Fetch invitation details by slug
      const result = await dbQuery(
        "SELECT id, title, slug, thumbnail, updated_at FROM invitations WHERE slug = $1",
        [slug]
      );

      if (result.rows.length === 0) {
        // Invitation not found - let the React app handle the 404 or serve fallback html
        return next();
      }

      const item = result.rows[0];

      // Server-Side Read Tracking: Update guest status to 'read' (double check) when opened with ?to=Name
      const guestNameParam = req.query.to;
      if (guestNameParam) {
        const guestNameStr = String(guestNameParam).trim();
        if (pool && !useLocalFallback) {
          await dbQuery(
            "UPDATE guests SET status = 'read', updated_at = CURRENT_TIMESTAMP WHERE (invitation_id = $1 OR invitation_id = $2) AND LOWER(name) = LOWER($3)",
            [item.id, slug, guestNameStr]
          );
        } else {
          if (!localDB['guests']) localDB['guests'] = [];
          let updatedAny = false;
          for (const g of localDB['guests']) {
            if ((g.invitation_id === item.id || g.invitation_id === slug) && g.name.toLowerCase().trim() === guestNameStr.toLowerCase()) {
              g.status = 'read';
              g.updated_at = new Date().toISOString();
              updatedAny = true;
            }
          }
          if (updatedAny) {
            saveLocalDB();
          }
        }
      }

      const title = `Undangan Digital ${item.title} - Online & Elegan`;
      const description = `Undangan digital online untuk ${item.title}. Buka undangan untuk melihat detail acara, lokasi peta, galeri foto, kisah cinta, dan kirim ucapan serta konfirmasi RSVP online.`;
      const canonicalUrl = `https://invitationbuilder.net/v/${item.slug}`;
      const imageUrl = item.thumbnail || "https://invitationbuilder.net/logo.png";

      // JSON-LD Structured Data Schema for specific invitation page
      const jsonLdSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `${canonicalUrl}#webpage`,
            "url": canonicalUrl,
            "name": `Undangan Pernikahan ${item.title}`,
            "description": description,
            "isPartOf": {
              "@id": "https://invitationbuilder.net/#website"
            }
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${canonicalUrl}#breadcrumb`,
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://invitationbuilder.net/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Undangan",
                "item": canonicalUrl
              }
            ]
          }
        ]
      };

      // Determine HTML index file path based on environment
      let htmlPath = path.join(process.cwd(), "index.html");
      if (process.env.NODE_ENV === "production") {
        htmlPath = path.join(process.cwd(), "dist", "index.html");
      }
      if (!fs.existsSync(htmlPath)) {
        htmlPath = path.join(process.cwd(), "index.html");
      }

      let htmlContent = fs.readFileSync(htmlPath, "utf-8");

      // Apply Vite transformation in development mode
      if (process.env.NODE_ENV !== "production" && vite) {
        htmlContent = await vite.transformIndexHtml(req.originalUrl, htmlContent);
      }

      // Inject SEO elements by replacing placeholder comments
      htmlContent = htmlContent
        .replace(
          "<!-- DYNAMIC_CANONICAL -->",
          `<link rel="canonical" href="${canonicalUrl}" />`
        )
        .replace(
          "<!-- DYNAMIC_SEO_TITLE -->",
          `<title>${title}</title>`
        )
        .replace(
          "<!-- DYNAMIC_SEO_META -->",
          `<meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />`
        )
        .replace(
          "<!-- DYNAMIC_JSON_LD -->",
          `<script type="application/ld+json">${JSON.stringify(jsonLdSchema)}</script>`
        );

      res.status(200).set({ "Content-Type": "text/html" }).end(htmlContent);
    } catch (err: any) {
      console.error("[SEO Injection] Error injecting dynamic metadata:", err);
      next();
    }
  });

  // --- Front-end Integration (Vite Middleware) ---
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Mounting Vite developer middleware...");
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Serving static production files from dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Server] Active! Running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();
