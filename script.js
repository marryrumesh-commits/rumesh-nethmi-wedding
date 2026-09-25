(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const pre = $('#preloader'), opening = $('#opening'), site = $('#site'), wipe = $('#pageWipe');
  const params = new URLSearchParams(location.search); const guest = params.get('name') ? decodeURIComponent(params.get('name')).trim() : '';
  const displayGuest = guest || 'Guest';
  $('#guestGreeting').textContent = guest ? `Dear ${displayGuest}` : 'Dear Guest';
  $('#heroGuest').textContent = guest ? `A place has been saved especially for ${displayGuest}.` : 'A place has been saved especially for you.';
  $('#rsvpGuestText').textContent = guest ? `${displayGuest}, we would be so happy to celebrate this beautiful evening with you.` : 'We would be so happy to celebrate this beautiful evening with you.';
  $('#guestNameField').value = guest;

  setTimeout(() => { pre.classList.add('done'); site.classList.add('ready'); }, 1350);

  function openInvitation(){
    opening.classList.add('closed');
    setTimeout(() => document.body.classList.remove('locked'), 900);
    setTimeout(() => $('#home').scrollIntoView({behavior:'smooth'}), 950);
  }
  $('#openInvite').addEventListener('click', openInvitation); $('#openInvite2').addEventListener('click', openInvitation);

  const reveal = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }), {threshold:.12});
  $$('.reveal').forEach(el => reveal.observe(el));

  const chapters = $$('.chapter[data-chapter]'); const railCurrent=$('#railCurrent'), railLabel=$('#railLabel');
  const chapterObs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){ railCurrent.textContent=e.target.dataset.chapter; railLabel.textContent=e.target.dataset.label; }}), {threshold:.35});
  chapters.forEach(x=>chapterObs.observe(x));

  addEventListener('scroll',()=>{ const d=document.documentElement; $('#progress').style.width=((scrollY/(d.scrollHeight-innerHeight))*100)+'%'; },{passive:true});

  function navClick(a){ a.addEventListener('click', e=>{ const href=a.getAttribute('href'); if(!href?.startsWith('#')) return; e.preventDefault(); wipe.classList.remove('go'); void wipe.offsetWidth; wipe.classList.add('go'); setTimeout(()=>$(href)?.scrollIntoView({behavior:'smooth',block:'start'}),260); }); }
  $$('.floating-nav a[href^="#"], .scroll-chip, .closing-actions a').forEach(navClick);

  // subtle card tilt
  $$('.tilt').forEach(card=>{
    card.addEventListener('pointermove',e=>{ if(innerWidth<900) return; const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; card.style.transform=`perspective(900px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg) translateY(-4px)`; });
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });

  // custom cursor
  const c=document.createElement('div'); const cr=document.createElement('div'); c.className='cursor'; cr.className='cursor-ring'; document.body.append(c,cr);
  addEventListener('pointermove',e=>{c.style.opacity=1;cr.style.opacity=1;c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';cr.style.left=e.clientX+'px';cr.style.top=e.clientY+'px';});
  $$('a,button').forEach(el=>{el.addEventListener('mouseenter',()=>{cr.style.width='46px';cr.style.height='46px'});el.addEventListener('mouseleave',()=>{cr.style.width='32px';cr.style.height='32px'});el.addEventListener('pointerdown',()=>{el.classList.add('tap-pulse');setTimeout(()=>el.classList.remove('tap-pulse'),420)});});

  // Invitation background video: autoplay silently, with a small fallback for browsers that delay autoplay.
  const introVideo = document.querySelector('.intro-video-bg video');
  if(introVideo){
    introVideo.muted = true;
    introVideo.defaultMuted = true;
    const startIntroVideo = () => { const play = introVideo.play(); if(play && play.catch) play.catch(()=>{}); };
    startIntroVideo();
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) startIntroVideo(); });
  }

  // countdown
  const target = new Date('2026-11-19T17:30:00+05:30').getTime();
  function countdown(){ let diff=Math.max(0,target-Date.now()); const d=Math.floor(diff/86400000); diff%=86400000; const h=Math.floor(diff/3600000); diff%=3600000; const m=Math.floor(diff/60000); const s=Math.floor((diff%60000)/1000); $('#days').textContent=String(d).padStart(2,'0');$('#hours').textContent=String(h).padStart(2,'0');$('#minutes').textContent=String(m).padStart(2,'0');$('#seconds').textContent=String(s).padStart(2,'0'); }
  countdown(); setInterval(countdown,1000);

  // RSVP counter + persistent Netlify Blobs backend
  let count=1; const countInput=$('#count'), out=$('#countOutput'), countWrap=$('#countWrap');
  function setCount(v){count=Math.min(10,Math.max(1,v));out.textContent=count;countInput.value=count;}
  $('#plus').addEventListener('click',()=>setCount(count+1)); $('#minus').addEventListener('click',()=>setCount(count-1));
  $$('input[name="attendance"]').forEach(r=>r.addEventListener('change',()=>countWrap.classList.toggle('show',r.value==='Accepted' && r.checked)));
  $('#rsvpForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const form=e.currentTarget, fd=new FormData(form), submit=form.querySelector('.rsvp-submit');
    const payload={guestName:fd.get('guestName')||'Guest',attendance:fd.get('attendance'),count:Number(fd.get('count')||1),message:fd.get('message')||''};
    if(!payload.attendance){ $('#rsvpStatus').textContent='Please select your attendance.'; return; }
    submit.disabled=true; submit.style.opacity='.65'; $('#rsvpStatus').textContent='Sending your RSVP…';
    try{
      const res=await fetch('/api/rsvps',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(data.error||'Unable to save RSVP');
      $('#rsvpStatus').textContent='Thank you — your response has been received with love.';
      form.reset(); setCount(1); countWrap.classList.remove('show'); toast('RSVP received');
    }catch(err){
      $('#rsvpStatus').textContent='We could not save your RSVP right now. Please try again.';
      toast('RSVP could not be saved');
    }finally{ submit.disabled=false; submit.style.opacity=''; }
  });

  // gallery lightbox
  const items=$$('.g-item'), lb=$('#lightbox'), lbImg=$('#lbImage'), lbCap=$('#lbCaption'), lbCount=$('#lbCount'); let current=0;
  function showLight(i){current=(i+items.length)%items.length;const el=items[current];lbImg.src=el.dataset.img;lbCap.textContent=el.dataset.caption;lbCount.textContent=`${String(current+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
  function closeLight(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  items.forEach((el,i)=>el.addEventListener('click',()=>showLight(i))); $('#lbClose').addEventListener('click',closeLight);$('#lbPrev').addEventListener('click',()=>showLight(current-1));$('#lbNext').addEventListener('click',()=>showLight(current+1));lb.addEventListener('click',e=>{if(e.target===lb)closeLight()});
  addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')closeLight();if(e.key==='ArrowLeft')showLight(current-1);if(e.key==='ArrowRight')showLight(current+1)});

  // share
  async function share(){const url=location.href;try{if(navigator.share)await navigator.share({title:'Rumesh & Nethmi — Wedding Invitation',text:guest?`You are invited, ${guest}.`:'You are invited to Rumesh & Nethmi’s wedding.',url});else{await navigator.clipboard.writeText(url);toast('Invitation link copied');}}catch{} }
  $('#shareBtn').addEventListener('click',share);$('#shareBtn2').addEventListener('click',share);

  // calendar ICS
  $('#calendarBtn').addEventListener('click',()=>{const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Rumesh & Nethmi//Wedding//EN','BEGIN:VEVENT','UID:rumesh-nethmi-20261119@invitation','DTSTAMP:20260925T000000Z','DTSTART:20261119T173000','DTEND:20261120T000000','SUMMARY:Rumesh & Nethmi — Wedding Celebration','LOCATION:SENURI Grand Castello, Centurian Banquet, Divulapitiya','DESCRIPTION:Poruwa Ceremony at 5:45 PM.','END:VEVENT','END:VCALENDAR'].join('\r\n');const blob=new Blob([ics],{type:'text/calendar'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Rumesh-Nethmi-Wedding.ics';a.click();URL.revokeObjectURL(a.href);toast('Calendar file prepared');});

  // Wedding music: start from the opening screen. Browsers may block audible
  // autoplay until the visitor interacts; the first tap/click then starts it.
  const weddingMusic = $('#weddingMusic');
  let musicStarted = false;
  async function startWeddingMusic(){
    if(!weddingMusic) return false;
    weddingMusic.loop = true;
    weddingMusic.volume = 0.82;
    try {
      await weddingMusic.play();
      musicStarted = true;
      $('#musicBtn')?.classList.add('is-playing');
      return true;
    } catch(e) {
      return false;
    }
  }
  startWeddingMusic();
  ['pointerdown','touchstart','keydown'].forEach(evt => {
    document.addEventListener(evt, () => {
      if(!musicStarted) startWeddingMusic();
    }, {once:false, passive:true});
  });
  $('#openInvite')?.addEventListener('click', startWeddingMusic);
  $('#openInvite2')?.addEventListener('click', startWeddingMusic);
  $('#musicBtn')?.addEventListener('click', async () => {
    if(weddingMusic.paused){ await startWeddingMusic(); toast('Music on'); }
    else { weddingMusic.pause(); musicStarted=false; $('#musicBtn').classList.remove('is-playing'); toast('Music off'); }
  });

  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2200)}
})();
