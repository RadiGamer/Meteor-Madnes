export async function overpassAmenities(lat, lon, radiusKm, amenity='hospital'){
  const around = Math.round(radiusKm*1000);
  const q = `[out:json];node["amenity"="${amenity}"](around:${around},${lat},${lon});out;`;
  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q);
  const r = await fetch(url);
  if (!r.ok) throw new Error('Overpass HTTP ' + r.status);
  const j = await r.json();
  return (j.elements || []).filter(e=>e.type==='node');
}
