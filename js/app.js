import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/FlyControls.js';
import { makeLabelRenderer } from './ui.js';
import { buildSolarSystem, setTimeDays, focusTarget } from './solarSystem.js';
import { TimeController } from './time.js';
import { buildStars } from './stars.js';

import { fetchNeoFeed } from './apis/neo.js';
import { fetchSBDBElements, NeoLayer } from './apis/sbdb.js';
import { fetchFireballs } from './apis/fireball.js';
import { epqsElevation } from './apis/usgs.js';
import { worldpopSum } from './apis/worldpop.js';
import { overpassAmenities } from './apis/osm.js';

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.01, 5e6);
camera.position.set(0, 300, 500);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true; orbit.dampingFactor = 0.05;
const fly = new FlyControls(camera, renderer.domElement);
fly.movementSpeed = 100; fly.rollSpeed = Math.PI/12; fly.dragToLook = true; fly.enabled = false;

scene.add(new THREE.HemisphereLight(0xffffff, 0x111133, 0.25));
scene.add(new THREE.PointLight(0xffffff, 3, 0, 2));

buildStars(scene, 8000);

const labelRenderer = makeLabelRenderer();
document.body.appendChild(labelRenderer.domElement);

const { planetMeshes, planetLabels, orbitLines, sun } = buildSolarSystem(THREE, scene);
const time = new TimeController();

const tSlider = document.getElementById('tSlider');
const rateEl = document.getElementById('rate');
const playEl = document.getElementById('play');
const fovEl = document.getElementById('fov');
const starsEl = document.getElementById('stars');
const realtimeEl = document.getElementById('realtime');

rateEl.oninput = () => time.setRate(+rateEl.value);
realtimeEl.onchange = () => {
  if (realtimeEl.checked) { time.setMode('real'); }
  else { time.setMode('sim'); time.setSimDays(+tSlider.value); }
};
tSlider.oninput = () => { if (time.mode==='sim') time.setSimDays(+tSlider.value); };
fovEl.oninput = ()=>{ camera.fov = +fovEl.value; camera.updateProjectionMatrix(); };
starsEl.oninput = () => buildStars(scene, +starsEl.value);

document.getElementById('focusSun').onclick = ()=> focusTarget('Sun', {THREE, camera, orbit, sun, planetMeshes});
document.getElementById('focusEarth').onclick = ()=> focusTarget('Earth', {THREE, camera, orbit, sun, planetMeshes});
window.addEventListener('keydown', (e)=>{
  if (e.code==='Space'){ playEl.checked = !playEl.checked; }
  const idx = ['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'][parseInt(e.key)-1];
  if (idx) focusTarget(idx, {THREE, camera, orbit, sun, planetMeshes});
  if (e.key.toLowerCase()==='h'){ const el = document.getElementById('help'); el.style.display = (el.style.display==='none'?'':'none'); }
});

const neoLog = document.getElementById('neoLog');
const nasaKeyEl = document.getElementById('nasaKey');
const neoStartEl = document.getElementById('neoStart');
const neoEndEl = document.getElementById('neoEnd');
const sbdbDesEl = document.getElementById('sbdbDes');
function log(el, msg){ el.textContent = (msg + '\n' + el.textContent).slice(0, 6000); }

const neoLayer = new NeoLayer(scene);

document.getElementById('loadNeoFeed').onclick = async ()=>{
  try{
    const key = nasaKeyEl.value || 'DEMO_KEY';
    const start = neoStartEl.value || new Date().toISOString().slice(0,10);
    const end = neoEndEl.value || start;
    log(neoLog, `Fetching NeoWs feed ${start}..${end}`);
    const data = await fetchNeoFeed(start, end, key);
    const totals = Object.values(data.near_earth_objects||{}).reduce((a,arr)=>a+arr.length,0);
    log(neoLog, `NeoWs: ${totals} approaches`);
  }catch(e){ log(neoLog, 'NeoWs error: ' + e); }
};

document.getElementById('addSbdb').onclick = async ()=>{
  const des = sbdbDesEl.value.trim();
  if (!des) return log(neoLog, 'Enter a designation (e.g., 433 Eros)');
  try{
    const el = await fetchSBDBElements(des);
    neoLayer.addFromElements(el);
    log(neoLog, `SBDB: added ${des} (a=${el.a} AU, e=${el.e})`);
  }catch(e){ log(neoLog, 'SBDB error: ' + e); }
};

const fbLog = document.getElementById('fbLog');
document.getElementById('loadFireballs').onclick = async ()=>{
  try{
    const since = document.getElementById('fbSince').value || '2023-01-01';
    const loc = document.getElementById('fbLoc').value || 'true';
    const data = await fetchFireballs({ since, requireLoc: loc==='true' });
    log(fbLog, `Fireballs: ${data.count} events since ${since} (loc=${loc})`);
  }catch(e){ log(fbLog, 'Fireball error: ' + e); }
};

const impactLog = document.getElementById('impactLog');
document.getElementById('analyzeImpact').onclick = async ()=>{
  const lat = parseFloat(document.getElementById('impLat').value);
  const lon = parseFloat(document.getElementById('impLon').value);
  const radKm = parseFloat(document.getElementById('impRad').value);
  const year = parseInt(document.getElementById('wpYear').value,10);
  const wpKey = document.getElementById('wpKey').value.trim();
  const amenity = document.getElementById('osmAmenity').value.trim() || 'hospital';

  try{
    log(impactLog, 'Querying EPQS elevation...');
    const elev = await epqsElevation(lon, lat);
    log(impactLog, `EPQS elevation: ${elev?.value} ${elev?.units}`);

    log(impactLog, 'Querying WorldPop population...');
    const pop = await worldpopSum(lat, lon, radKm, year, wpKey || null);
    log(impactLog, `WorldPop estimated population in ${radKm} km: ${Math.round(pop)}`);

    log(impactLog, `Querying OSM amenities: ${amenity}...`);
    const amenities = await overpassAmenities(lat, lon, radKm, amenity);
    log(impactLog, `OSM: found ${amenities.length} ${amenity}(s)`);
  }catch(e){ log(impactLog, 'Analysis error: ' + e); }
};

let last = performance.now();
function animate(now){
  const dt = (now - last)/1000; last = now;
  const play = document.getElementById('play').checked;
  if (time.mode==='sim' && play) time.tick(dt);
  const days = time.days;
  if (time.mode==='sim') tSlider.value = days.toFixed(0);

  setTimeDays(days, { planetMeshes });
  neoLayer.setTimeDays(days);

  orbit.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.addEventListener('resize', ()=>{
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
});
