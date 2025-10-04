export async function epqsElevation(lon, lat, units='Meters'){
  const url = `https://epqs.nationalmap.gov/v1/json?x=${lon}&y=${lat}&units=${units}&wkid=4326`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('EPQS HTTP ' + r.status);
  const j = await r.json();
  return j && j.value ? j : j?.USGS_Elevation_Point_Query_Service?.Elevation_Point_Query_Result;
}
