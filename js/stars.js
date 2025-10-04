import * as THREE from 'three';
export function buildStars(scene, count = 8000) {
  if (scene.__stars) scene.remove(scene.__stars);
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const R = 8000;
  for (let i = 0; i < count; i++) {
    const u = Math.random(), v = Math.random();
    const theta = 2*Math.PI*u, phi = Math.acos(2*v-1);
    const r = R * (0.7 + 0.3*Math.random());
    positions[3*i+0] = r*Math.sin(phi)*Math.cos(theta);
    positions[3*i+1] = r*Math.cos(phi);
    positions[3*i+2] = r*Math.sin(phi)*Math.sin(theta);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size: 1.1, sizeAttenuation: true, color: 0xaec6ff });
  scene.__stars = new THREE.Points(geo, mat);
  scene.add(scene.__stars);
}
