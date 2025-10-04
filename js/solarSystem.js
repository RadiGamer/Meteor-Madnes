import * as THREE from 'three';
import { makeLabel } from './ui.js';
import { elementsToPosition, au } from './kepler.js';
const bodies = [
  { name:'Mercury', color:0xc6b18b, a:0.387098, e:0.205630, i:7.0049,  O:48.331,  w:29.124,  L:252.251,  P:87.969 },
  { name:'Venus',   color:0xd9c08f, a:0.723332, e:0.006772, i:3.3946,  O:76.680,  w:54.884,  L:181.979, P:224.701 },
  { name:'Earth',   color:0x88aaff, a:1.000000, e:0.016710, i:0.0000,  O:-11.260, w:102.947, L:100.464, P:365.256 },
  { name:'Mars',    color:0xff6f4f, a:1.523679, e:0.093400, i:1.850,   O:49.558,  w:286.502, L:355.453, P:686.980 },
  { name:'Jupiter', color:0xffd29b, a:5.204267, e:0.048775, i:1.303,   O:100.464, w:273.867, L:34.404,  P:4332.589 },
  { name:'Saturn',  color:0xf2e3b6, a:9.582017, e:0.055723, i:2.485,   O:113.665, w:339.392, L:49.944,  P:10759.22 },
  { name:'Uranus',  color:0xa0d8ff, a:19.18916, e:0.047220, i:0.773,   O:74.006,  w:96.998,  L:313.232, P:30685.4 },
  { name:'Neptune', color:0x6fb6ff, a:30.06992, e:0.008590, i:1.770,   O:131.784, w:276.336, L:-55.120, P:60190 }
];
export function buildSolarSystem(THREE, scene){
  const sun = new THREE.Mesh(new THREE.SphereGeometry(au(0.02),32,16), new THREE.MeshBasicMaterial({ color: 0xffd27f }));
  scene.add(sun);
  const planetMeshes = {}; const planetLabels = {}; const orbitLines = {};
  bodies.forEach(p=>{
    const radiusAU = Math.max(0.015, 0.003 + Math.log10(p.a+1)*0.01);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(au(radiusAU),32,16), new THREE.MeshStandardMaterial({ color:p.color, roughness:0.8, metalness:0.0 }));
    scene.add(mesh); planetMeshes[p.name]=mesh;
    const lab = makeLabel(p.name); mesh.add(lab); lab.position.set(0, au(radiusAU*2.2), 0); planetLabels[p.name]=lab;
    const curvePts = [];
    for (let d=0; d<=360; d+=2){ const M = (d - (p.w + p.O)); curvePts.push(elementsToPosition(p.a, p.e, p.i, p.O, p.w, M)); }
    const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
    const line = new THREE.LineLoop(curveGeo, new THREE.LineBasicMaterial({ color:p.color, transparent:true, opacity:0.35 })); scene.add(line); orbitLines[p.name]=line;
  });
  setTimeDays(0, { planetMeshes });
  return { planetMeshes, planetLabels, orbitLines, sun };
}
export function setTimeDays(days, { planetMeshes }){
  bodies.forEach(p=>{
    const n = 360/p.P;
    const M = (p.L - p.w - p.O) + n*days;
    const pos = elementsToPosition(p.a, p.e, p.i, p.O, p.w, M);
    planetMeshes[p.name].position.copy(pos);
  });
}
export function focusTarget(name, { THREE, camera, orbit, sun, planetMeshes }){
  const target = name==='Sun' ? sun : planetMeshes[name]; if (!target) return;
  const bb = new THREE.Sphere(); new THREE.Box3().setFromObject(target).getBoundingSphere(bb);
  orbit.target.copy(target.position); camera.position.sub(orbit.target).setLength(Math.max(bb.radius*6, 40)).add(orbit.target); orbit.update();
}
