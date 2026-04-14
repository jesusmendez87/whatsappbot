// utils/stateManager.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
 

const STATE_FILE = path.resolve('./data/userStates.json');

// Asegura que el directorio existe
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
}

// Carga estados desde disco
function loadStates() {
  try {
    if (!fs.existsSync(STATE_FILE)) return {};
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

// Guarda estados en disco
function saveStates(states) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(states, null, 2));
}

// Cache en memoria + sincronización con JSON
let cache = loadStates();

export const stateManager = {
  get(jid) {
    return cache[jid] || null;
  },

  set(jid, state) {
    cache[jid] = { ...state, updatedAt: new Date().toISOString() };
    saveStates(cache);
  },

  delete(jid) {
    delete cache[jid];
    saveStates(cache);
  },

  // Limpia estados inactivos hace más de X horas
  cleanup(hoursOld = 24) {
    const cutoff = Date.now() - hoursOld * 60 * 60 * 1000;
    let changed = false;
    for (const [jid, state] of Object.entries(cache)) {
      if (new Date(state.updatedAt).getTime() < cutoff) {
        delete cache[jid];
        changed = true;
      }
    }
    if (changed) saveStates(cache);
  }
};