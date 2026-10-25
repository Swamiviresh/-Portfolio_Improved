import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowDown, ArrowDownRight, ArrowUpRight, Github, Mail, Phone, MapPin, Menu, X, ShieldCheck, CarFront, Layers3, Trophy, ExternalLink } from 'lucide-react';
import ThreeHero from './components/ThreeHero.jsx';

gsap.registerPlugin(ScrollTrigger);

const RESUME_URL = import.meta.env.NEXT_PUBLIC_RESUME_URL || 'https://nlmmbqpnshyrovulfmhm.supabase.co/storage/v1/object/public/resume/Viresh_Swami_Updated_Resume.pdf';

const projects = [
  {
    n: '01', type: 'REAL-TIME / MULTIPLAYER',
    title: <>Aviator crash<br/>game.</>,
    desc: 'A real-time multiplayer crash game featuring a Canvas 2D plane animation, optimistic cashout UI, and a cancel-bet flow. Migrated from local SQLite to Turso cloud SQLite to keep data persistent on Render.',
    tags: ['React', 'Node.js', 'Express', 'Socket.io', 'Turso'],
    icon: <Layers3 size={21}/>, visual: 'aviator',
    source: 'https://github.com/Swamiviresh/aviator',
  },
  {
    n: '02', type: 'IOT / FULL-STACK',
    title: <>Smart parking,<br/>connected live.</>,
    desc: 'An IoT-integrated parking system with multi-level parking management, time-based slot booking, slot selection, and disability accommodation. Built with a six-member cross-disciplinary team on an approximately ₹8,000 budget.',
    tags: ['React', 'Vite', 'Tailwind', 'Node.js', 'Turso'],
    icon: <CarFront size={21}/>, visual: 'parking',
    source: 'https://github.com/Swamiviresh/New-Smart-Parking',
    live: 'https://smartparking.live/',
  },
  {
    n: '03', type: 'FINTECH / WEB APP',
    title: <>Finwise money<br/>tracker.</>,
    desc: 'A personal finance tracking application built with TypeScript and React to manage and visualize income and expenses with reusable, type-safe UI components.',
    tags: ['TypeScript', 'React', 'Data Visualization'],
    icon: <Layers3 size={21}/>, visual: 'finwise',
    source: 'https://github.com/Swamiviresh/Finwise',
  },
  {
    n: '04', type: 'WEB UTILITIES',
    title: <>File format<br/>converter.</>,
    desc: 'A browser-based file conversion utility focused on safe environment-variable handling, clear failure states, and thoughtful client-side file-processing flows.',
    tags: ['TypeScript', 'React', 'Web APIs'],
    icon: <ArrowDownRight size={21}/>, visual: 'converter',
    source: 'https://github.com/Swamiviresh/Convert',
  },
];

function Wordmark({ light = false }) {
  return <a className={`wordmark ${light ? 'light' : ''}`} href="#home" aria-label="Viresh Swami home">V<span>.</span></a>;
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
  return <div className="preloader"><div className="loader-top"><span>VIRESH SWAMI / PORTFOLIO</span><span>SOFTWARE + IOT — 2026</span></div><div className="loader-center"><div className="loader-clip"><h2 className="loader-title">MAKE IT<br/><i>MATTER.</i></h2></div><div className="loader-progress"><span>PREPARING THE EXPERIENCE</span><span><b ref={count}>000</b> / 100</span></div><div className="loader-meter"><i ref={fill}/></div></div><div className="loader-bottom"><span>CODE / CURIOSITY / CRAFT</span><span>PLEASE STAND BY ↗</span></div></div>;
}

function Header({ menuOpen, setMenuOpen, menuRef }) {
  return <>
    <header className="site-header"><Wordmark/><div className="header-center"><i/> SOFTWARE DEVELOPER & IOT ENTHUSIAST <span>/ 2026</span></div><button className="menu-trigger magnetic" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'CLOSE' : 'MENU'} {menuOpen ? <X size={17}/> : <Menu size={17}/>}</button></header>
    <div className={`menu-overlay ${menuOpen ? 'menu-visible' : ''}`} aria-hidden={!menuOpen} ref={menuRef}>
      <div className="menu-top"><span>VIRESH SWAMI / INDEX</span><span>SELECT A DESTINATION ↘</span></div>
      <nav className="menu-links">{[['01','Home','#home'],['02','Selected work','#work'],['03','About & education','#about'],['04','Contact','#contact']].map(([n,label,href])=><a href={href} key={n} tabIndex={menuOpen ? 0 : -1} onClick={()=>setMenuOpen(false)}><span>{n}</span><b>{label}</b><ArrowUpRight size={25}/></a>)}</nav>
      <div className="menu-bottom"><span>SOFTWARE / IOT / REAL-WORLD BUILDS</span><span>BENGALURU, INDIA ↗</span></div>
    </div>
  </>;
}

function Hero() {
  return <section id="home" className="hero section-shell">
    <div className="eyebrow intro-fade"><i/> VIRESH SWAMI — SOFTWARE DEVELOPER & IOT ENTHUSIAST</div>
    <div className="hero-grid"><div className="hero-copy"><h1 className="hero-title"><span><b>BUILDING</b></span><span className="indent"><b>WHAT'S</b></span><span><b>NEXT<span className="lime">.</span></b></span></h1>
      <div className="hero-intro intro-fade"><p>I’m <strong>Viresh Swami</strong> — an Information Science & Engineering student who builds real-time applications, IoT-integrated web solutions, and full-stack projects. Based in Bengaluru, India.</p><a className="round-arrow magnetic" href="#work" aria-label="Explore work"><ArrowDownRight size={23}/></a></div>
      <div className="hero-quicklinks intro-fade"><a href="https://github.com/Swamiviresh" target="_blank" rel="noreferrer"><Github size={15}/> GITHUB <ArrowUpRight size={12}/></a><a href="mailto:swamiviresh2007@email.com"><Mail size={15}/> EMAIL <ArrowUpRight size={12}/></a><a href={RESUME_URL} target="_blank" rel="noreferrer"><ArrowDown size={14}/> RESUME PDF</a></div>
      </div>
      <div className="hero-art"><div className="coordinates top">BENGALURU<br/>KARNATAKA, IN</div><ThreeHero/><div className="coordinates bottom">REAL-TIME / WEBGL<br/>POINTER TRACKING ↗</div><div className="figure-index"><span>FIG. 001</span><b>THE BUILDER</b></div><div className="scroll-cue">SCROLL TO EXPLORE <ArrowDown size={14}/></div></div>
    </div>
    <div className="hero-footer intro-fade"><span>SOFTWARE / IOT / FULL-STACK</span><span>SIDDAGANGA INSTITUTE OF TECHNOLOGY</span><span>01 — 04</span></div>
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
  if (type === 'parking') return <div className="visual visual-parking"><div className="visual-head"><span>SP / DASHBOARD</span><span>LIVE SYSTEM <i/></span></div><div className="parking-layout"><div><small>AVAILABLE SLOTS</small><strong>08<span>/12</span></strong><div className="occupancy"><i/></div><small>LIVE OCCUPANCY</small></div><div className="parking-slots">{Array.from({length:12},(_,i)=><div key={i} className={[2,5,8,10].includes(i)?'filled':''}>{String(i+1).padStart(2,'0')}</div>)}</div></div><div className="visual-foot"><span>ENTRY: RFID VERIFIED</span><span>BOOK / ACCESS ↗</span></div><div className="visual-stamp">CONNECTED<br/>SYSTEMS</div></div>;
  if (type === 'security') return <div className="visual visual-security"><div className="visual-head"><span>NETWORK / STUDY</span><span>STATUS: LEARNING</span></div><div className="security-orbit"><i/><i/><i/><b><ShieldCheck size={46}/></b><span>+</span></div><div className="security-data"><span>NETWORK<br/><b>01 / LOCAL</b></span><span>ACCESS<br/><b>CONTROLLED</b></span><span>MODE<br/><b>LEARN</b></span></div></div>;
  if (type === 'aviator') return <div className="visual visual-aviator"><div className="visual-head"><span>AVIATOR / LIVE ROUND</span><span>SOCKET.IO <i/></span></div><div className="aviator-sky"><div className="aviator-grid"/><div className="aviator-curve"/><div className="aviator-plane">↗</div><strong>2.48<span>×</span></strong><small>MULTIPLIER IN MOTION</small></div><div className="visual-foot"><span>REAL-TIME MULTIPLAYER</span><span>ROUND ACTIVE ↗</span></div></div>;
  if (type === 'finwise') return <div className="visual visual-finwise"><div className="visual-head"><span>FINWISE / OVERVIEW</span><span>MONTHLY SUMMARY</span></div><div className="finance-total"><small>NET BALANCE</small><strong>₹ 42,850<span>.00</span></strong><b>↗ 12.8% <small>THIS MONTH</small></b></div><div className="finance-bars">{[36,54,43,78,62,88,66,96,74,85,58,100].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div><div className="visual-foot"><span>INCOME / EXPENSES</span><span>INSIGHTS ↗</span></div></div>;
  if (type === 'converter') return <div className="visual visual-converter"><div className="visual-head"><span>FORMAT / CONVERTER</span><span>LOCAL PROCESSING</span></div><div className="converter-flow"><div className="file-tile"><b>PDF</b><span>document.pdf</span></div><ArrowDownRight size={26}/><div className="file-tile lime-file"><b>DOCX</b><span>document.docx</span></div></div><div className="converter-status"><i/> CONVERSION COMPLETE <span>100%</span></div><div className="visual-foot"><span>FILE UTILITIES</span><span>SAFE BY DESIGN ↗</span></div></div>;
  return <div className="visual visual-motion"><div className="browser-bar"><i/><i/><i/><span>viresh.app / portfolio</span><ArrowUpRight size={13}/></div><div className="mock-screen"><span>V.</span><div><small>SOFTWARE DEVELOPER / IOT</small><strong>LESS<br/>ORDINARY<span>.</span></strong><em>EXPLORE PROJECTS ↗</em></div><div className="mock-orb"><i/></div><footer>SOFTWARE　 SYSTEMS　 BUILDING</footer></div><div className="visual-foot"><span>INTERACTION STUDY — 03</span><span>IN PROGRESS ↗</span></div></div>;
}

function Work() {
  return <section id="work" className="work-section"><div className="work-heading section-shell"><SectionLabel n="01">FEATURED PROJECTS</SectionLabel><div className="work-heading-row"><h2 className="reveal-heading">BUILT IN<br/><i>THE REAL WORLD.</i></h2><p>Projects that connect code to people,<br/>devices, and everyday problems.</p></div></div><div className="projects-track">{projects.map(p=><article className="project-card" key={p.n}><a className="project-preview" href={p.source} target="_blank" rel="noreferrer" aria-label={`View source for ${p.type}`}><ProjectVisual type={p.visual}/><span className="preview-arrow"><ArrowUpRight size={21}/></span></a><div className="project-info"><div className="project-line"><span>{p.n} / {p.type}</span><span>{p.icon}</span></div><h3>{p.title}</h3><p>{p.desc}</p><div className="project-tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div><div className="project-links"><a href={p.source} target="_blank" rel="noreferrer"><Github size={14}/> SOURCE CODE <ArrowUpRight size={13}/></a>{p.live&&<a href={p.live} target="_blank" rel="noreferrer"><ExternalLink size={14}/> LIVE PROJECT <ArrowUpRight size={13}/></a>}</div></div></article>)}</div><div className="work-bottom section-shell"><span>MORE PROJECTS & EXPERIMENTS</span><a href="https://github.com/Swamiviresh" target="_blank" rel="noreferrer">VISIT GITHUB <ArrowUpRight size={16}/></a></div></section>;
}

function About() {
  const skills = [
    ['01','LANGUAGES','Python / HTML / CSS'],
    ['02','WEB & REAL-TIME','React / Node.js / Express / Socket.io'],
    ['03','IOT & SYSTEMS','IoT-integrated apps / robotics / connected devices'],
    ['04','TOOLS & PLATFORMS','Git / GitHub / Render / Namecheap / VS Code / Cursor / Claude Code'],
  ];
  const education = [
    { period:'2025 — 2029', title:'Bachelor of Engineering', subtitle:'Information Science & Engineering', place:'Siddaganga Institute of Technology · Tumakuru, Karnataka', result:'CGPA 7.93 · 1st Year' },
    { period:'2023 — 2024', title:'Senior Secondary · Science', subtitle:'Sri Chaitanya Educational Institute', place:'Pune, Maharashtra', result:'67.83%' },
    { period:'2014 — 2023', title:'Secondary Education · 1st–10th', subtitle:'Podar International School', place:'Latur, Maharashtra', result:'92.16%' },
  ];
  return <section id="about" className="about-section section-shell"><SectionLabel n="02">ABOUT / SKILLS / EDUCATION</SectionLabel><div className="about-grid"><h2 className="reveal-heading">CURIOUS BY<br/>DEFAULT.<br/><i>BUILDER BY</i><br/>CHOICE.</h2><div className="about-copy intro-fade"><p className="about-lead">I like figuring out how things work—then making them work a little better.</p><p>I'm Viresh Swami, a Software Developer & IoT Enthusiast pursuing a Bachelor of Engineering in Information Science & Engineering at Siddaganga Institute of Technology. I enjoy building real-time multiplayer applications, IoT-integrated web solutions, and full-stack projects. I learn by shipping projects, debugging what breaks, and refining the details.</p><div className="about-note"><span><MapPin size={13} /> BASED IN</span><b>BENGALURU, KARNATAKA, INDIA ↗</b></div></div></div>
    <div className="subsection-heading"><span>01 /</span><h3>SKILLS & TECHNOLOGIES</h3><i/></div><div className="skills-list">{skills.map(([n,title,desc])=><div className="skill-row" key={n}><span>{n}</span><b>{title}</b><span>{desc}</span><ArrowUpRight size={17}/></div>)}</div>
    <div className="subsection-heading education-heading"><span>02 /</span><h3>EDUCATION</h3><i/></div><div className="education-list">{education.map((e)=><article className="education-row" key={e.period}><span className="education-period">{e.period}</span><div className="education-main"><h4>{e.title}</h4><b>{e.subtitle}</b><p>{e.place}</p></div><span className="education-result">{e.result}</span></article>)}</div>
    <div className="award-card"><div className="award-icon"><Trophy size={25}/></div><div className="award-copy"><span>APRIL 2026 / CORSIT · SIT TUMAKURU</span><h3>1st Place Winner — Robotics Workshop ’26</h3><p>Recognized for performance, innovation, and technical excellence at ROBOCOR ’26; the certificate was signed by Dr. S. V. Dinesh (Principal) and Dr. H. S. Shridhar (Club Mentor). Also participated in the Arcane Quiz competition.</p></div><div className="award-mark">#01</div></div>
  </section>;
}

function Contact() {
  return <section id="contact" className="contact-section"><div className="contact-noise"/><div className="contact-inner section-shell"><SectionLabel n="03" dark>THE NEXT CHAPTER</SectionLabel><div className="contact-content"><p>HAVE A PROJECT IN MIND?</p><h2>LET'S MAKE<br/><i>IT MATTER.</i></h2><a className="contact-cta magnetic" href="mailto:swamiviresh2007@email.com"><span>EMAIL VIRESH SWAMI</span><ArrowUpRight size={24}/></a><div className="contact-details"><a href="mailto:swamiviresh2007@email.com"><Mail size={16}/> swamiviresh2007@email.com</a><a href="tel:+919890659693"><Phone size={16}/> +91 9890659693</a><a href={RESUME_URL} target="_blank" rel="noreferrer"><ArrowDown size={16}/> DOWNLOAD RESUME</a></div></div><footer className="footer-bottom"><Wordmark light/><span>VIRESH SWAMI · SOFTWARE DEVELOPER & IOT ENTHUSIAST</span><div className="socials"><a href="https://github.com/Swamiviresh" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17}/></a><a href="mailto:swamiviresh2007@email.com" aria-label="Email"><Mail size={17}/></a></div><span>© 2026 VIRESH SWAMI</span></footer></div></section>;
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
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { gsap.set('.intro-fade,.hero-art,.reveal-heading,.section-label,.skill-row,.education-row,.award-card,.contact-content,.project-card',{clearProps:'all',opacity:1,y:0}); ScrollTrigger.refresh(); return; }
    const ctx = gsap.context(() => {
      gsap.set('.hero-title b',{yPercent:120,rotateX:-20,transformOrigin:'50% 100%'});
      gsap.set('.intro-fade,.hero-art',{y:24,opacity:0});
      const intro=gsap.timeline({defaults:{ease:'power4.out'},delay:.08});
      intro.to('.hero-title b',{yPercent:0,rotateX:0,duration:1.15,stagger:.13},0).to('.hero-art',{y:0,opacity:1,duration:1.3},.25).to('.intro-fade',{y:0,opacity:1,duration:.8,stagger:.08},.42).from('.site-header > *',{y:-18,opacity:0,duration:.8,stagger:.1},.1);
      gsap.utils.toArray('.reveal-heading').forEach(el=>gsap.fromTo(el,{y:65,opacity:0,clipPath:'inset(0 0 14% 0)'},{y:0,opacity:1,clipPath:'inset(0 0 0 0)',duration:1,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 86%',once:true}}));
      gsap.utils.toArray('.section-label').forEach(el=>gsap.fromTo(el,{x:-22,opacity:0},{x:0,opacity:1,duration:.7,scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
      gsap.utils.toArray('.skill-row,.education-row,.award-card,.about-note,.about-copy').forEach((el,i)=>gsap.fromTo(el,{y:35,opacity:0},{y:0,opacity:1,duration:.8,delay:i*.035,scrollTrigger:{trigger:el,start:'top 89%',once:true}}));
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

  return <div className={`app-shell ${menuOpen?'menu-is-open':''}`} ref={root}><div className="scroll-progress"><i/></div><CustomCursor/><Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} menuRef={menu}/><main><Hero/><Marquee/><Work/><About/><Contact/></main>{loading&&<Preloader onComplete={finish}/>}</div>;
}
