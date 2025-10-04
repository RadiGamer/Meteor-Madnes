const J2000 = Date.UTC(2000,0,1,12,0,0);
export class TimeController {
  constructor() { this.mode='sim'; this.rateDaysPerSec=365; this.simDays=0; }
  setMode(m){ this.mode=m; }
  setRate(r){ this.rateDaysPerSec=r; }
  setSimDays(d){ this.simDays=d; }
  tick(dt){ if (this.mode==='sim') this.simDays += this.rateDaysPerSec*dt; }
  get days(){ return this.mode==='real' ? (Date.now()-J2000)/(1000*86400) : this.simDays; }
}
