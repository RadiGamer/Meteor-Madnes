import * as THREE from 'three';
export const AU = 149597870.7; export const SCALE = 100; export const KM_TO_UNITS = (SCALE / AU);
export function au(x){ return x * SCALE; }
function deg2rad(d){return d*Math.PI/180;}
function keplerE(M,e){ let E=M; for(let i=0;i<8;i++){E=E-(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));} return E; }
export function elementsToPosition(aAU,e,iDeg,OmegaDeg,omegaDeg,Mdeg){
  const i=deg2rad(iDeg), Omega=deg2rad(OmegaDeg), omega=deg2rad(omegaDeg), M=deg2rad(Mdeg);
  const E = keplerE(M,e); const nu = 2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2), Math.sqrt(1-e)*Math.cos(E/2));
  const r = aAU*(1 - e*Math.cos(E)); const xP = r*Math.cos(nu), yP = r*Math.sin(nu);
  const cosO=Math.cos(Omega), sinO=Math.sin(Omega), cosi=Math.cos(i), sini=Math.sin(i), cosw=Math.cos(omega), sinw=Math.sin(omega);
  const x = (cosO*cosw - sinO*sinw*cosi)*xP + (-cosO*sinw - sinO*cosw*cosi)*yP;
  const y = (sinO*cosw + cosO*sinw*cosi)*xP + (-sinO*sinw + cosO*cosw*cosi)*yP;
  const z = (sini*sinw)*xP + (sini*cosw)*yP;
  return new THREE.Vector3(au(x), au(y), au(z));
}
