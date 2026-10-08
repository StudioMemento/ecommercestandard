'use client';

import {useEffect, useRef, useState} from 'react';
import {Pause, Play} from 'lucide-react';

type Connection = EventTarget & {saveData?:boolean};

/** Brand footage loads only when on screen; user pause always wins over autoplay. */
export function CampaignVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [mode,setMode] = useState<'auto'|'play'|'pause'>('auto');
  const [playing,setPlaying] = useState(false);
  const [hasFrame,setHasFrame] = useState(false);
  const [failed,setFailed] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 767px)');
    const connection = (navigator as Navigator & {connection?:Connection}).connection;
    let visible = false, disposed = false;
    const sync = () => {
      const allowed = mode==='play'||(mode==='auto'&&!motion.matches&&!connection?.saveData);
      if (!visible || document.hidden || !allowed || failed) {video.pause();return;}
      const source = `/video/jj-city-${mobile.matches?'square':'wide'}.mp4`;
      if (video.getAttribute('src')!==source) {video.src=source;video.load();}
      video.muted=true;
      void video.play().catch(() => {if(!disposed) setPlaying(false);});
    };
    const observer = new IntersectionObserver(entries => {visible=entries[0].isIntersecting;sync();},{threshold:0});
    observer.observe(video);
    document.addEventListener('visibilitychange',sync);
    motion.addEventListener('change',sync);
    mobile.addEventListener('change',sync);
    connection?.addEventListener('change',sync);
    return () => {disposed=true;video.pause();observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);mobile.removeEventListener('change',sync);connection?.removeEventListener('change',sync);};
  },[mode,failed]);
  return <>
    <div className="hero-depth campaign-media">
      <picture><source media="(max-width: 767px)" srcSet="/video/jj-city-square-poster.jpg"/><img className="hero-image" src="/video/jj-city-wide-poster.jpg" alt="Look uomo JACK & JONES in città: maglia verde, pantaloni chiari e cappellino rosso" width="1280" height="720" fetchPriority="high"/></picture>
      <video ref={ref} className={`campaign-film ${hasFrame?'has-frame':''}`} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} onPlaying={()=>{setPlaying(true);setHasFrame(true);}} onPause={()=>setPlaying(false)} onError={()=>{setFailed(true);setPlaying(false);setHasFrame(false);}}/>
    </div>
    {!failed&&<button className="campaign-control" type="button" onClick={()=>setMode(playing?'pause':'play')} aria-label={playing?'Metti in pausa il video JACK & JONES':'Riproduci il video JACK & JONES'}>{playing?<Pause size={15}/>:<Play size={15}/>}<span>{playing?'Pausa':'Riproduci'}</span><span className="campaign-duration">JACK & JONES · 9 SEC</span></button>}
  </>;
}
