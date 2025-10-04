export async function fetchFireballs({ since='2000-01-01', requireLoc=true }={}){
  const url = `https://ssd-api.jpl.nasa.gov/fireball.api?date-min=${since}${requireLoc?'&req-loc=true':''}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Fireball HTTP ' + r.status);
  return r.json();
}
