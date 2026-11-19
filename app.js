(function(){
const D=window.DATA,P=D.profile,C=D.contact;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isVid=f=>/\.mp4$/i.test(f);
const chips=a=>`<ul class="chips">${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
const label=k=>({cad:'CAD',simulation:'Simulation',design_practice:'Design practice',manufacturing:'Manufacturing',programming:'Programming',standards:'Standards',professional:'Professional',languages:'Languages'}[k]||k);

/* lightbox */
const lb=$('#lb'),stage=$('#lbStage'),cap=$('#lbCap');let items=[],idx=0;
function show(){const m=items[idx];
  stage.innerHTML=isVid(m.file)?`<video src="${m.file}" controls autoplay playsinline></video>`:`<img src="${m.file}" alt="${esc(m.caption)}">`;
  cap.textContent=m.caption+(items.length>1?`  (${idx+1} of ${items.length})`:'');
  $('#lbPrev').hidden=$('#lbNext').hidden=items.length<2}
function openLb(list,n){items=list;idx=n;show();lb.showModal()}
function step(d){idx=(idx+d+items.length)%items.length;show()}
$('#lbPrev').onclick=()=>step(-1);$('#lbNext').onclick=()=>step(1);$('#lbClose').onclick=()=>lb.close();
lb.addEventListener('click',e=>{if(e.target===lb)lb.close()});
lb.addEventListener('close',()=>{stage.innerHTML=''});
lb.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1)});

/* hero */
const cover=P.cover_images.map(f=>({file:f,caption:''}));
const capOf=f=>{for(const p of D.projects)for(const m of p.media)if(m.file===f)return m.caption;return''};
cover.forEach(c=>c.caption=capOf(c.file));
$('#hero').innerHTML=`
<div>
  <div class="who"><img src="${P.photo}" alt="Portrait of ${esc(P.name)}"><div>${esc(P.name)}<span>${esc(P.location)}</span></div></div>
  <h1>Mechanical design, proven by simulation.</h1>
  <p>${esc(P.about)}</p>
  <div class="cta"><a class="btn" href="#work">See the work</a><a class="btn ghost" href="${C.resume}" download>Download resume</a></div>
  <ul class="open" aria-label="Open to">${P.open_to.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
</div>
<div class="mosaic">${cover.map((c,i)=>`<button type="button" data-i="${i}" aria-label="Open image: ${esc(c.caption)}"><img src="${c.file}" alt="${esc(c.caption)}" ${i?'loading="lazy"':'fetchpriority="high"'}></button>`).join('')}</div>`;
$('.mosaic').addEventListener('click',e=>{const b=e.target.closest('button');if(b)openLb(cover,+b.dataset.i)});
$('#navResume').href=C.resume;

$('#facts').innerHTML=[
 ['AIR 2','Formula Student, Team Rudra, FFS 2025'],
 ['7 load cases','ANSYS validation of the MotoStudent chassis'],
 ['CSWP + CSWPA-W','SolidWorks design and weldments certified'],
 ['2 internships','running side by side in summer 2026']
].map(f=>`<div class="fact"><b>${f[0]}</b><span>${f[1]}</span></div>`).join('');

/* projects */
const SHOW=9;
$('#projects').innerHTML=D.projects.map(p=>{
  const meta=[['',p.org],['',p.role],['',p.period]].filter(m=>m[1]).map((m,i)=>`<span>${i===0?'<b>'+esc(m[1])+'</b>':esc(m[1])}</span>`).join('');
  const stats=p.stats.length?`<ul class="stats">${p.stats.map(s=>`<li><b>${esc(s[0])}</b><span>${esc(s[1])}</span></li>`).join('')}</ul>`:'';
  return `<article class="proj" id="${p.id}">
    <h3>${esc(p.title)}</h3><div class="meta">${meta}</div>
    <div class="pgrid"><p>${esc(p.summary)}</p>${stats}</div>
    ${chips(p.tools)}<div class="gal" data-p="${p.id}"></div></article>`}).join('');
D.projects.forEach(p=>{
  const g=document.querySelector(`.gal[data-p="${p.id}"]`);let shown=Math.min(SHOW,p.media.length);
  const tile=(m,i)=>{const v=isVid(m.file);
    return `<button type="button" class="t${v?' vid':''}" data-i="${i}" aria-label="Open: ${esc(m.caption)}">${v?`<video src="${m.file}#t=0.5" muted playsinline preload="metadata"></video>`:`<img src="${m.file}" alt="${esc(m.caption)}" loading="lazy">`}<i>${esc(m.caption)}</i></button>`};
  const draw=()=>{g.classList.toggle('lead',shown===5||shown===9);
    g.innerHTML=p.media.slice(0,shown).map(tile).join('');
    const old=g.nextElementSibling;if(old&&old.classList.contains('more'))old.remove();
    if(shown<p.media.length){const b=document.createElement('button');b.type='button';b.className='btn ghost small more';b.textContent=`Show all ${p.media.length} items`;b.onclick=()=>{shown=p.media.length;draw()};g.after(b)}};
  draw();
  g.addEventListener('click',e=>{const t=e.target.closest('.t');if(t)openLb(p.media,+t.dataset.i)});
});

/* skills */
$('#skillGrid').innerHTML=Object.entries(D.skills).map(([k,v])=>`<div><h3>${label(k)}</h3>${chips(v)}</div>`).join('');

/* experience + education */
$('#exp').innerHTML=`<div><h3>Experience</h3><ul class="tl">${D.experience.map(e=>`<li><b>${esc(e.role)}</b><span>${esc(e.org)}</span><span>${esc(e.period)}</span></li>`).join('')}</ul></div>
<div><h3>Education</h3><ul class="tl">${D.education.map(e=>`<li><b>${esc(e.degree)}</b><span>${esc(e.school)}</span><span>${esc(e.detail)}, ${esc(e.when)}</span></li>`).join('')}</ul></div>`;

/* certs */
const certs=D.certifications.map(c=>({file:c.image,caption:c.name}));
$('#certGrid').innerHTML=certs.map((c,i)=>`<button type="button" class="cert" data-i="${i}"><img src="${c.file}" alt="" loading="lazy"><span>${esc(c.caption)}</span></button>`).join('');
$('#certGrid').addEventListener('click',e=>{const b=e.target.closest('.cert');if(b)openLb(certs,+b.dataset.i)});
$('#ach').innerHTML=D.achievements.map(a=>`<li>${esc(a)}</li>`).join('');

/* contact */
$('#contact').innerHTML=`<h2>Let's build something. <a href="mailto:${C.email}">${esc(C.email)}</a></h2>
<div class="clinks"><a class="btn" href="mailto:${C.email}">Email</a><a class="btn ghost" href="tel:${C.phone.replace(/\s/g,'')}">${esc(C.phone)}</a><a class="btn ghost" href="${C.linkedin}" target="_blank" rel="noopener">LinkedIn</a><a class="btn ghost" href="${C.resume}" download>Resume (PDF)</a></div>`;
$('#year').textContent=`© ${new Date().getFullYear()} ${P.name}`;

/* scroll progress */
const bar=$('#scale');
addEventListener('scroll',()=>{const h=document.documentElement;bar.style.setProperty('--p',(h.scrollTop/(h.scrollHeight-h.clientHeight||1)).toFixed(4))},{passive:true});
})();
