let debug = false;

export function log(...args) {
  if (debug) console.log(...args);
}

export function warn(...args) {
  if (debug) console.warn(...args);
}

export function toggleDebug(v) {
  debug = v !== undefined ? Boolean(v) : !debug;
  console.log('[SmartForms] debug', debug);
  return debug;
}
