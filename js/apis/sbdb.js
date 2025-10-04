import * as THREE from 'three';
import { elementsToPosition, au } from '../kepler.js';
export async function fetchSBDBElements(des){
  const q = encodeURIComponent(des);
  const url = `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${q}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('SBDB HTTP ' + r.status);
  const j = await r.json();
  if (!j.orb || !j.orb.elements) throw new Error('No elements for ' + des);
  const E = j.orb.elements;
  const get = (n)=> parseFloat((E.find(e=>e.name===n)||{}).value);
  const a = get('a'), e = get('e'), inc = get('i'), Omega = get('om'), w = get('w'), n = get('n'), M = get('ma');
  const L = M + w + Omega; const P = 360.0 / n;
  return { a, e, i:inc, O:Omega, w, L, P, name: j.object?.fullname || des };
}
export class NeoLayer {
  constructor(scene){ this.scene = scene; this.points = []; }
  clear(){ this.points.forEach(p=>this.scene.remove(p)); this.points = []; }
  addFromElements(el, color=0x00ff99){
    const m = new THREE.Mesh(new THREE.SphereGeometry(au(0.003),12,12), new THREE.MeshBasicMaterial({ color }));
    m.userData.el = el; this.scene.add(m); this.points.push(m);
  }
  setTimeDays(days){
    for (const m of this.points){
      const p = m.userData.el; const n = 360/p.P; const M = (p.L - p.w - p.O) + n*days;
      m.position.copy(elementsToPosition(p.a, p.e, p.i, p.O, p.w, M));
    }
  }
}
