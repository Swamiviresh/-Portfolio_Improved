import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowDown, ArrowDownRight, ArrowUpRight, Github, Linkedin, Mail, Menu, X, ShieldCheck, CarFront, Layers3 } from 'lucide-react';
import ThreeHero from './components/ThreeHero.jsx';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { n: '01', type: 'IOT / FULL-STACK', title: <>Smart parking,<br/>without the guesswork.</>, desc: 'A sensor-driven parking system connecting physical slots to a live dashboard, booking, and RFID-based entry.', tags: ['React', 'ESP8266', 'Supabase'], icon: <CarFront size={21}/>, visual: 'parking', href: 'https://github.com/Swamiviresh/New-Smart-Parking' },
  { n: '02', type: 'SECURITY / SYSTEMS', title: <>Think like<br/>the other side.</>, desc: 'Linux labs, security experiments, and networking fundamentals focused on how systems fail—and how to make them safer.', tags: ['Linux', 'Networking', 'Python'], icon: <ShieldCheck size={21}/>, visual: 'security', href: 'https://github.com/Swamiviresh' },
  { n: '03', type: 'WEB / INTERACTION', title: <>Interfaces with<br/>a little more life.</>, desc: 'An animation-first playground exploring expressive layouts, bold interaction, and digital experiences that feel alive.', tags: ['React', 'GSAP', 'Three.js'], icon: <Layers3 size={21}/>, visual: 'motion', href: 'https://github.com/Swamiviresh' },
];

function Wordmark({ light = false }) {
  return <a className={`wordmark ${light ? 'light' : ''}`} href="#home" aria-label="Viresh home">V<span>.</span></a>;
}

function Preloader({ onComplete }) {
  const count = useRef(null), fill = useRef(null);
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onComplete(); return; }
    const value = { n: 0 };
    const tl = gsap.timeline({ onComplete });
    tl.to(value, { n: 100, duration: 1.7, ease: 'power2.inOut', onUpdate: () => { if (count.current) count.current.textContent = String(Math.round(value.n)).padStart(3, '0'); } }, 0)
      .to(fill.current, { scaleX: 1, duration: 1.7, ease: 'power2.inOut' }, 0)
      .fromTo('.loader-title', { yPercent: 120, rotate: 2 }, { yPercent: 0, rotate: 0, duration: .8, ease: 'power4.out' }, .12)
      .to('.loader-title', { yPercent: -120, duration: .55, ease: 'power4.in' }, 1.22)
      .to('.preloader', { yPercent: -105, duration: .85, ease: 'power4.inOut' }, 1.47);
    return () => tl.kill();
  }, [onComplete]);
  return <div className="preloader"><div className="loader-top"><span>V. / DIGITAL PORTFOLIO</span><span>INDEPENDENT BUILD — 2026</span></div><div className="loader-center"><div className="loader-clip"><h2 className="loader-title">MAKE IT<br/><i>MATTER.</i></h2></div><div className="loader-progress"><span>PREPARING THE EXPERIENCE</span><span><b ref={count}>000</b> / 100</span></div><div className="loader-meter"><i ref={fill}/></div></div><div className="loader-bottom"><span>CODE / CURIOSITY / CRAFT</span><span>PLEASE STAND BY ↗</span></div></div>;
}

function Header({ menuOpen, setMenuOpen }) {
  return <>
    <header className="site-header"><Wordmark/><div className="header-center"><i/> AVAILABLE FOR GOOD IDEAS <span>/ 2026</span></div><button className="menu-trigger magnetic" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'CLOSE' : 'MENU'} {menuOpen ? <X size={17}/> : <Menu size={17}/>}</button></header>
    <div className={`menu-overlay ${menuOpen ? 'menu-visible' : ''}`} aria-hidden={!menuOpen}>
      <div className="menu-top"><span>VIRESH / INDEX</span><span>SELECT A DESTINATION ↘</span></div>
      <nav className="menu-links">{[['01','Home','#home'],['02','Selected work','#work'],['03','About','#about'],['04','Contact','#contact']].map(([n,label,href])=><a href={href} key={n} tabIndex={menuOpen ? 0 : -1} onClick={()=>setMenuOpen(false)}><span>{n}</span><b>{label}</b><ArrowUpRight size={25}/></a>)}</nav>
      <div className="menu-bottom"><span>INDEPENDENT THINKING. INTENTIONAL BUILDING.</span><span>TUMAKURU, INDIA ↗</span></div>
    </div>
  </>;
}

function Hero() {
  return <section id="home" className="hero section-shell">
    <div className="eyebrow intro-fade"><i/> PORTFOLIO — INFORMATION SCIENCE & ENGINEERING</div>
    <div className="hero-grid"><div className="hero-copy"><h1 className="hero-title"><span><b>BUILDING</b></span><span className="indent"><b>WHAT'S</b></span><span><b>NEXT<span className="lime">.</span></b></span></h1>
      <div className="hero-intro intro-fade"><p>I’m Viresh — an engineering student who likes turning <strong>curiosity into working things.</strong> Somewhere between software, systems, and security.</p><a className="round-arrow magnetic" href="#work" aria-label="Explore work"><ArrowDownRight size={23}/></a></div></div>
      <div className="hero-art"><div className="coordinates top">12°58' N<br/>77°34' E</div><ThreeHero/><div className="coordinates bottom">REAL-TIME / WEBGL<br/>POINTER TRACKING ↗</div><div className="figure-index"><span>FIG. 001</span><b>THE BUILDER</b></div><div className="scroll-cue">SCROLL TO EXPLORE <ArrowDown size={14}/></div></div>
    </div>
    <div className="hero-footer intro-fade"><span>SCROLL A LITTLE. STAY CURIOUS.</span><span>BUILD / BREAK / LEARN</span><span>01 — 04</span></div>
  </section>;
}

function Marquee() {
  const words = ['IDEATE','BUILD','TEST','REFINE','REPEAT'];
  return <div className="marquee"><div className="marquee-track">{Array.from({length:4},(_,i)=><div className="marquee-group" key={i}>{words.map((w,j)=><span key={w}>{w}<b>{j%2 ? '↗' : '✳'}</b></span>)}</div>)}</div></div>;
}

function SectionLabel({ n, children, dark = false }) {
  return <div className={`section-label ${dark ? 'dark' : ''}`}><span>{n} /</span><b>{children}</b><i/></div>;
}

function ProjectVisual({ type }) {
  if (type === 'parking') return <div className="visual visual-parking"><div className="visual-head"><span>SP / DASHBOARD</span><span>LIVE SYSTEM <i/></span></div><div className="parking-layout"><div><small>AVAILABLE SLOTS</small><strong>08<span>/12</span></strong><div className="occupancy"><i/></div><small>LIVE OCCUPANCY</small></div><div className="parking-slots">{Array.from({length:12},(_,i)=><div key={i} className={[2,5,8,10].includes(i)?'filled':''}>{String(i+1).padStart(2,'0')}</div>)}</div></div><div className="visual-foot"><span>ENTRY: RFID VERIFIED</span><span>SYNC 0.4s ↗</span></div><div className="visual-stamp">CONNECTED<br/>SYSTEMS</div></div>;
  if (type === 'security') return <div className="visual visual-security"><div className="visual-head"><span>THREAT MODEL / 001</span><span>STATUS: LEARNING</span></div><div className="security-orbit"><i/><i/><i/><b><ShieldCheck size={46}/></b><span>+</span></div><div className="security-data"><span>NETWORK<br/><b>01 / LOCAL</b></span><span>ACCESS<br/><b>CONTROLLED</b></span><span>MODE<br/><b>LEARN</b></span></div></div>;
  return <div className="visual visual-motion"><div className="browser-bar"><i/><i/><i/><span>viresh.dev / experience</span><ArrowUpRight size={13}/></div><div className="mock-screen"><span>V.</span><div><small>INDEPENDENT DIGITAL STUDIO</small><strong>LESS<br/>ORDINARY<span>.</span></strong><em>EXPLORE PROJECTS ↗</em></div><div className="mock-orb"><i/></div><footer>STRATEGY　 DESIGN　 DEVELOPMENT</footer></div><div className="visual-foot"><span>INTERACTION STUDY — 03</span><span>IN PROGRESS ↗</span></div></div>;
}

function Work() {
  return <section id="work" className="work-section"><div className="work-heading section-shell"><SectionLabel n="01">SELECTED WORK</SectionLabel><div className="work-heading-row"><h2 className="reveal-heading">MADE WITH<br/><i>INTENTION.</i></h2><p>Experiments, systems, and ideas<br/>that made it out of my notes app.</p></div></div><div className="projects-track">{projects.map(p=><article className="project-card" key={p.n}><a className="project-preview" href={p.href} target="_blank" rel="noreferrer" aria-label={`Open project ${p.n}`}><ProjectVisual type={p.visual}/><span className="preview-arrow"><ArrowUpRight size={21}/></span></a><div className="project-info"><div className="project-line"><span>{p.n} / {p.type}</span><span>{p.icon}</span></div><h3>{p.title}</h3><p>{p.desc}</p><div className="project-tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div></div></article>)}</div><div className="work-bottom section-shell"><span>MORE EXPERIMENTS IN THE WORKSHOP</span><a href="https://github.com/Swamiviresh" target="_blank" rel="noreferrer">VISIT GITHUB <ArrowUpRight size={16}/></a></div></section>;
}

function About() {
  const skills = [['01','SOFTWARE','React / JavaScript / Python'],['02','SYSTEMS','Linux / Networking / APIs'],['03','HARDWARE','Arduino / IoT / Sensors'],['04','CURRENTLY EXPLORING','Cybersecurity / WebGL / Motion']];
  return <section id="about" className="about-section section-shell"><SectionLabel n="02">A LITTLE ABOUT ME</SectionLabel><div className="about-grid"><h2 className="reveal-heading">CURIOUS BY<br/>DEFAULT.<br/><i>BUILDER BY</i><br/>CHOICE.</h2><div className="about-copy intro-fade"><p className="about-lead">I like figuring out how things work—then trying to make them work a little better.</p><p>I'm an Information Science & Engineering student at SIT Tumakuru. My interests sit at the intersection of software, connected devices, and security. I learn best by building things, breaking them, and being curious enough to fix them.</p><div className="about-note"><span>BASED IN</span><b>TUMAKURU, INDIA ↗</b></div></div></div><div className="skills-list">{skills.map(([n,title,desc])=><div className="skill-row" key={n}><span>{n}</span><b>{title}</b><span>{desc}</span><ArrowUpRight size={17}/></div>)}</div></section>;
}

function Contact() {
  return <section id="contact" className="contact-section"><div className="contact-noise"/><div className="contact-inner section-shell"><SectionLabel n="03" dark>THE NEXT CHAPTER</SectionLabel><div className="contact-content"><p>HAVE A PROJECT IN MIND?</p><h2>LET'S MAKE<br/><i>IT MATTER.</i></h2><a className="contact-cta magnetic" href="mailto:hello@viresh.dev"><span>START A CONVERSATION</span><ArrowUpRight size={24}/></a></div><footer className="footer-bottom"><Wordmark light/><span>DESIGNED & BUILT WITH INTENTION.</span><div className="socials"><a href="https://github.com/Swamiviresh" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17}/></a><a href="https://linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17}/></a><a href="mailto:hello@viresh.dev" aria-label="Email"><Mail size={17}/></a></div><span>© 2026 VIRESH</span></footer></div></section>;
}

function CustomCursor() {
  const dot = useRef(null), ring = useRef(null);
  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = gsap.quickTo(dot.current,'x',{duration:.12,ease:'power3'}), y = gsap.quickTo(dot.current,'y',{duration:.12,ease:'power3'});
    const rx = gsap.quickTo(ring.current,'x',{duration:.3,ease:'power3'}), ry = gsap.quickTo(ring.current,'y',{duration:.3,ease:'power3'});
    const move = e => { x(e.clientX); y(e.clientY); rx(e.clientX); ry(e.clientY); };
    const over = e => { if(e.target.closest('a,button')) ring.current?.classList.add('cursor-hover'); };
    const out = e => { if(e.target.closest('a,button') && !e.relatedTarget?.closest('a,button')) ring.current?.classList.remove('cursor-hover'); };
    window.addEventListener('pointermove',move); document.addEventListener('pointerover',over); document.addEventListener('pointerout',out);
    return () => { window.removeEventListener('pointermove',move); document.removeEventListener('pointerover',over); document.removeEventListener('pointerout',out); };
  },[]);
  return <div className="cursor-system" aria-hidden="true"><i ref={dot}/><div ref={ring}/></div>;
}

export default function App() {
  const [loading,setLoading] = useState(true), [menuOpen,setMenuOpen] = useState(false);
  const root = useRef(null), menu = useRef(null);
  const finish = useCallback(() => setLoading(false), []);
  useEffect(() => { document.body.classList.toggle('is-loading',loading); return () => document.body.classList.remove('is-loading'); },[loading]);

  useEffect(() => {
    if (loading) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reduced ? null : new Lenis({duration:1.12,smoothWheel:true,wheelMultiplier:.88,touchMultiplier:1.3});
    const tick = t => lenis?.raf(t*1000);
    if (lenis) { lenis.on('scroll',ScrollTrigger.update); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0); }
    const anchors = [];
    document.querySelectorAll('a[href^="#"]').forEach(a => { const target=document.querySelector(a.getAttribute('href')); if(!target)return; const fn=e=>{e.preventDefault();setMenuOpen(false);lenis?lenis.scrollTo(target,{duration:1.2}):target.scrollIntoView();};a.addEventListener('click',fn);anchors.push([a,fn]); });
    const magnetic = [];
    if (!reduced && !matchMedia('(pointer: coarse)').matches) document.querySelectorAll('.magnetic').forEach(el=>{const move=e=>{const r=el.getBoundingClientRect();gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.14,y:(e.clientY-r.top-r.height/2)*.14,duration:.35,ease:'power3.out',overwrite:true});};const leave=()=>gsap.to(el,{x:0,y:0,duration:.65,ease:'elastic.out(1,.35)',overwrite:true});el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);magnetic.push([el,move,leave]);});
    return () => { anchors.forEach(([a,fn])=>a.removeEventListener('click',fn)); magnetic.forEach(([el,m,l])=>{el.removeEventListener('pointermove',m);el.removeEventListener('pointerleave',l);}); if(lenis){gsap.ticker.remove(tick);lenis.destroy();} };
  },[loading]);

  useLayoutEffect(() => {
    if (loading || !root.current) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { gsap.set('.intro-fade,.hero-art,.reveal-heading,.section-label,.skill-row,.contact-content,.project-card',{clearProps:'all',opacity:1,y:0}); ScrollTrigger.refresh(); return; }
    const ctx = gsap.context(() => {
      gsap.set('.hero-title b',{yPercent:120,rotateX:-20,transformOrigin:'50% 100%'});
      gsap.set('.intro-fade,.hero-art',{y:24,opacity:0});
      const intro=gsap.timeline({defaults:{ease:'power4.out'},delay:.08});
      intro.to('.hero-title b',{yPercent:0,rotateX:0,duration:1.15,stagger:.13},0).to('.hero-art',{y:0,opacity:1,duration:1.3},.25).to('.intro-fade',{y:0,opacity:1,duration:.8,stagger:.08},.42).from('.site-header > *',{y:-18,opacity:0,duration:.8,stagger:.1},.1);
      gsap.utils.toArray('.reveal-heading').forEach(el=>gsap.fromTo(el,{y:65,opacity:0,clipPath:'inset(0 0 14% 0)'},{y:0,opacity:1,clipPath:'inset(0 0 0 0)',duration:1,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 86%',once:true}}));
      gsap.utils.toArray('.section-label').forEach(el=>gsap.fromTo(el,{x:-22,opacity:0},{x:0,opacity:1,duration:.7,scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
      gsap.utils.toArray('.skill-row,.about-note,.about-copy').forEach((el,i)=>gsap.fromTo(el,{y:35,opacity:0},{y:0,opacity:1,duration:.8,delay:i*.04,scrollTrigger:{trigger:el,start:'top 89%',once:true}}));
      gsap.fromTo('.contact-content',{y:45,opacity:0},{y:0,opacity:1,duration:1,scrollTrigger:{trigger:'.contact-content',start:'top 85%',once:true}});
      gsap.to('.marquee-track',{xPercent:-25,ease:'none',scrollTrigger:{trigger:'.marquee',start:'top bottom',end:'bottom top',scrub:.5}});
      gsap.to('.hero-art',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.55}});
      gsap.to('.contact-noise',{yPercent:-13,ease:'none',scrollTrigger:{trigger:'.contact-section',start:'top bottom',end:'bottom top',scrub:.5}});
      gsap.to('.scroll-progress i',{scaleX:1,ease:'none',scrollTrigger:{trigger:document.documentElement,start:'top top',end:'bottom bottom',scrub:.1}});
      const mm=gsap.matchMedia();
      mm.add('(min-width: 1024px) and (min-height: 680px) and (pointer: fine)',()=>{
        const section=root.current.querySelector('.work-section'),track=root.current.querySelector('.projects-track');if(!section||!track)return;
        const travel=()=>Math.max(0,track.scrollWidth-window.innerWidth+window.innerWidth*.07);
        gsap.to(track,{x:()=>-travel(),ease:'none',scrollTrigger:{trigger:section,start:'top top',end:()=>'+='+ (travel()+window.innerHeight*.35),pin:section,scrub:.9,anticipatePin:1,invalidateOnRefresh:true}});
        gsap.fromTo('.project-card',{y:45,opacity:0},{y:0,opacity:1,stagger:.12,duration:.8,scrollTrigger:{trigger:section,start:'top 75%',once:true}});
      });
      mm.add('(max-width: 1023px), (max-height: 679px), (pointer: coarse)',()=>gsap.fromTo('.project-card',{y:40,opacity:0},{y:0,opacity:1,stagger:.12,duration:.75,scrollTrigger:{trigger:'.projects-track',start:'top 82%',once:true}}));
    },root);
    return () => ctx.revert();
  },[loading]);

  useLayoutEffect(() => {
    if(loading||!menu.current)return;
    const el=menu.current;
    if(menuOpen){gsap.set(el,{visibility:'visible',clipPath:'inset(0 0 100% 0)'});const tl=gsap.timeline();tl.to(el,{clipPath:'inset(0 0 0 0)',duration:.8,ease:'power4.inOut'}).fromTo('.menu-top,.menu-bottom',{y:16,opacity:0},{y:0,opacity:1,duration:.45},.35).fromTo('.menu-links a',{yPercent:120,rotateX:-16},{yPercent:0,rotateX:0,stagger:.08,duration:.65,ease:'power4.out'},.27);return()=>tl.kill();}
    const tl=gsap.to(el,{clipPath:'inset(0 0 100% 0)',duration:.65,ease:'power4.inOut',onComplete:()=>gsap.set(el,{visibility:'hidden'})});return()=>tl.kill();
  },[menuOpen,loading]);
  useEffect(()=>{if(!menuOpen)return;const fn=e=>{if(e.key==='Escape')setMenuOpen(false);};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn);},[menuOpen]);

  return <div className={`app-shell ${menuOpen?'menu-is-open':''}`} ref={root}><div className="scroll-progress"><i/></div><CustomCursor/><Header menuOpen={menuOpen} setMenuOpen={setMenuOpen}/><main><Hero/><Marquee/><Work/><About/><Contact/></main>{loading&&<Preloader onComplete={finish}/>}</div>;
}
