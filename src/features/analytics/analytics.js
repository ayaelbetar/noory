const events = [];

/**
 * Records a POC analytics event in memory and prints it for local inspection.
 * Production telemetry must not include raw child audio, transcripts, or names.
 *
 * @param {string} name
 * @param {Record<string, unknown>} [payload]
 * @returns {{ name: string, payload: Record<string, unknown>, at: string }}
 */
export function track(name, payload = {}) {
  const event = { name, payload, at: new Date().toISOString() };
  events.push(event);
  console.info("[noory-demo]", event);
  return event;
}

/** @returns {Array<{ name: string, payload: Record<string, unknown>, at: string }>} A copy of POC events. */
export function getEvents() {
  return [...events];
}

/** Clears locally buffered POC analytics events. */
export function clearEvents() {
  events.length = 0;
}
