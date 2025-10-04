export async function fetchNeoFeed(startISO, endISO, apiKey='DEMO_KEY'){
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startISO}&end_date=${endISO}&api_key=${apiKey}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`NeoWs HTTP ${r.status}`);
  return r.json();
}
