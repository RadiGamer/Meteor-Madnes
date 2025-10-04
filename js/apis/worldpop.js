function circlePoly(lat, lon, radiusKm, steps=128){
  const R = 6371; const pts = [];
  for (let i=0;i<steps;i++){
    const theta = (i/steps)*2*Math.PI;
    const dByR = radiusKm / R;
    const lat1 = lat*Math.PI/180, lon1 = lon*Math.PI/180;
    const lat2 = Math.asin(Math.sin(lat1)*Math.cos(dByR) + Math.cos(lat1)*Math.sin(dByR)*Math.cos(theta));
    const lon2 = lon1 + Math.atan2(Math.sin(theta)*Math.sin(dByR)*Math.cos(lat1), Math.cos(dByR)-Math.sin(lat1)*Math.sin(lat2));
    pts.push([lon2*180/Math.PI, lat2*180/Math.PI]);
  }
  pts.push(pts[0]);
  return {"type":"Polygon","coordinates":[pts]};
}
export async function worldpopSum(lat, lon, radiusKm, year=2020, apiKey=null){
  const poly = circlePoly(lat, lon, radiusKm);
  const dataset = 'wpgppop';
  const url = `https://api.worldpop.org/v1/services/stats?dataset=${dataset}&year=${year}${apiKey?('&API_KEY='+encodeURIComponent(apiKey)) : ''}`;
  const r = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(poly) });
  if (!r.ok) throw new Error('WorldPop HTTP ' + r.status);
  const task = await r.json();
  if (!task.taskid && task.data){ return task.data.total_population ?? task.data.sum ?? 0; }
  const statusUrl = `https://api.worldpop.org/v1/services/stats?taskid=${task.taskid}${apiKey?('&API_KEY='+encodeURIComponent(apiKey)) : ''}`;
  for (let i=0;i<20;i++){
    await new Promise(res=>setTimeout(res, 1000));
    const s = await fetch(statusUrl); if (!s.ok) break;
    const sj = await s.json();
    if (sj.status==='finished'){ return sj.data.total_population ?? sj.data.sum ?? 0; }
  }
  throw new Error('WorldPop: timeout');
}
