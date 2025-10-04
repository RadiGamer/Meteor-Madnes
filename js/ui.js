import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.160.0/examples/jsm/renderers/CSS2DRenderer.js';
export function makeLabelRenderer(){
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'fixed';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  return labelRenderer;
}
export function makeLabel(text){
  const div = document.createElement('div');
  div.textContent = text;
  div.style.padding = '2px 6px';
  div.style.background = 'rgba(20,24,48,.65)';
  div.style.border = '1px solid rgba(120,140,255,.35)';
  div.style.borderRadius = '8px';
  div.style.fontSize = '11px';
  div.style.color = '#e6ecff';
  return new CSS2DObject(div);
}
