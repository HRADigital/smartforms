let debug = false;

export function log(...args) {
    // eslint-disable-next-line no-console -- intentional debug logger output
    if (debug) console.log(...args);
}

export function warn(...args) {
    if (debug) console.warn(...args);
}

export function toggleDebug(v) {
    debug = v !== undefined ? Boolean(v) : !debug;
    // eslint-disable-next-line no-console -- intentional debug-state notice
    console.log('[SmartForms] debug', debug);
    return debug;
}
