// ═══════════════════ STORAGE ═══════════════════
const S = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)||'[]'); } catch(e){ return []; } },
  set: (k,v) => localStorage.setItem(k, JSON.stringify(v))
};
let extraEtudes   = S.get('endo_etudes');
let assosDemandes = S.get('endo_assos');
let candidatures  = S.get('endo_cands');
let temoignages   = S.get('endo_temos');

// ═══════════════════ INIT ═══════════════════
let mapInited = false;

function isLoggedIn() {
  return Boolean(localStorage.getItem('authToken')) || document.body.dataset.authenticated === 'true';
}

async function refreshAuthenticationState() {
  let authenticated = isLoggedIn();
  let profile = null;
  try {
    const response = await fetch('/api/me', { credentials: 'same-origin' });
    authenticated = response.ok;
    if (authenticated) profile = await response.json();
  } catch (error) {
    console.error('Unable to verify authentication state:', error);
  }

  const authButton = document.querySelector('.login-btn, .nav-login-btn');
  if (authButton) {
    authButton.textContent = authenticated ? '👤 Compte' : '👤 Connexion';
    authButton.href = authenticated ? 'compte.html' : 'login.html';
  }

  if (window.location.pathname.endsWith('/compte.html') && !authenticated) {
    window.location.replace('login.html');
    return;
  }

  if (authenticated) {
    document.body.dataset.authenticated = 'true';
    const profileInfo = document.getElementById('profile-info');
    if (profileInfo && profile) {
      profileInfo.textContent = `${profile.username} · ${profile.email} · ${profile.type_account}`;
    }
  }
}

function requireAuthentication() {
  if (isLoggedIn()) return true;
  alert('Cette action nécessite une connexion.');
  window.location.href = 'login.html';
  return false;
}

document.addEventListener('DOMContentLoaded', () => {
  refreshAuthenticationState();
  renderCEtudes();
  updateCounters();
  renderStoredTemoignages();
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', submitSignup);
  }
  const patientTab = window.location.hash.match(/^#tab-(trouver|etudes|infos|faq|glossaire)$/);
  if (patientTab && document.getElementById('section-patient')) showTab(patientTab[1]);
  if (window.location.hash === '#admin') openAdminModal();
});

async function submitSignup(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.getElementById('signupMessage');
  const password = form.querySelector('[name="password"]').value;
  const confirmation = form.querySelector('[name="confirmPassword"]').value;
  const typeAccount = form.querySelector('[name="type_account"]:checked')?.value;

  if (password !== confirmation) {
    message.textContent = 'Les mots de passe ne correspondent pas.';
    return;
  }

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.querySelector('[name="username"]').value.trim(),
        email: form.querySelector('[name="email"]').value.trim(),
        password,
        type_account: typeAccount
      })
    });
    const result = await response.text();
    message.textContent = result || (response.ok ? 'Inscription réussie.' : 'Inscription impossible.');
    if (response.ok) form.reset();
  } catch (error) {
    console.error('Signup request failed:', error);
    message.textContent = 'Impossible de contacter le serveur.';
  }
}

// ═══════════════════ MAP ═══════════════════
function initMap() {
  const map = L.map('leaflet-map').setView([46.8, 2.3], 5.2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap contributors', maxZoom:18 }).addTo(map);
  const icon = L.divIcon({
    html:'<div style="background:#cc003b;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(204,0,59,.4)"></div>',
    className:'', iconSize:[14,14], iconAnchor:[7,7], popupAnchor:[0,-10]
  });
  [
    {n:'Paris',lat:48.866,lng:2.333,i:'Hôpital Lariboisière & Tenon · Dr. Sophie Martin'},
    {n:'Lyon',lat:45.749,lng:4.845,i:'CHU de Lyon · Pr. Julien Dubois · Référent national'},
    {n:'Marseille',lat:43.296,lng:5.381,i:'AP-HM · Dr. Amina Lefèvre · Consultation dédiée'},
    {n:'Bordeaux',lat:44.837,lng:-0.579,i:'CHU de Bordeaux · Pôle gynécologie'},
    {n:'Rennes',lat:48.117,lng:-1.678,i:'CHU de Rennes · Dr. Lucas Moreau · Fertilité'},
    {n:'Strasbourg',lat:48.574,lng:7.752,i:'CHU de Strasbourg · Dr. Carole Weiss'},
    {n:'Toulouse',lat:43.604,lng:1.444,i:'CHU de Toulouse · Dr. Marie Fontaine'},
    {n:'Nantes',lat:47.218,lng:-1.553,i:'CHU de Nantes · Endométriose & fertilité'},
    {n:'Lille',lat:50.630,lng:3.070,i:'CHU de Lille · Consultation spécialisée'},
    {n:'Montpellier',lat:43.611,lng:3.877,i:'CHU de Montpellier · Douleur pelvienne'},
  ].forEach(c => {
    const m = L.marker([c.lat,c.lng],{icon}).addTo(map);
    m.bindPopup(`<strong style="color:#cc003b;font-family:Inter,sans-serif">${c.n}</strong><br><span style="font-size:12px;font-family:Inter,sans-serif">${c.i}</span>`);
    m.on('click',()=>{ document.getElementById('chu-info').textContent = c.n+' — '+c.i; });
  });
}

// ═══════════════════ NAVIGATION ═══════════════════
function goHome() {
  const home = document.getElementById('home-view');
  const content = document.getElementById('content-area');
  if (!home || !content) return;
  home.style.display = '';
  content.style.display = 'none';
  document.querySelectorAll('.main-tab').forEach(b => b.classList.remove('active'));
}

function switchSpace(sp) {
  const home = document.getElementById('home-view');
  const content = document.getElementById('content-area');
  const section = document.getElementById('section-'+sp);
  if (!home || !content || !section) return;
  home.style.display = 'none';
  content.style.display = 'block';
  document.querySelectorAll('.main-tab').forEach((b,i)=>b.classList.toggle('active',['patient','chercheur','asso','temoignages','quisommesnous'][i]===sp));
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('visible'));
  section.classList.add('visible');
  if (sp === 'chercheur') renderCEtudes();
}
function showTab(tab) {
  ['trouver','etudes','infos','faq','glossaire'].forEach(t=>{const e=document.getElementById('tab-'+t);if(e)e.style.display=t===tab?'block':'none';});
  document.querySelectorAll('#section-patient .pill').forEach((p,i)=>p.classList.toggle('active',['etudes','trouver','infos','faq','glossaire'][i]===tab));
  if (tab === 'trouver' && !mapInited) { initMap(); mapInited = true; }
}
function showCtab(tab) {
  ['depot','encours','ressources'].forEach(t=>{const e=document.getElementById('ctab-'+t);if(e)e.style.display=t===tab?'block':'none';});
  document.querySelectorAll('#section-chercheur .pill').forEach((p,i)=>p.classList.toggle('active',['depot','encours','ressources'][i]===tab));
  if (tab==='encours') renderCEtudes();
}
function toggleFaq(item){item.classList.toggle('open');}

// ═══════════════════ FILTRES SPÉCIALISTES ═══════════════════
function filterSpec() {
  const q = document.getElementById('filter-spec-q').value.toLowerCase();
  const r = document.getElementById('filter-spec-region').value;
  let n = 0;
  document.querySelectorAll('#spec-grid .contact-item').forEach(el=>{
    const show = (!q||el.dataset.q.includes(q)||el.querySelector('h4').textContent.toLowerCase().includes(q))&&(!r||el.dataset.region===r);
    el.style.display = show?'':'none';
    if(show)n++;
  });
  document.getElementById('spec-count').textContent = n+' spécialiste'+(n>1?'s':'');
}

// ═══════════════════ FILTRES ÉTUDES (patiente) ═══════════════════
function filterEtudes() {
  const q = document.getElementById('filter-et-q').value.toLowerCase();
  const ty = document.getElementById('filter-et-type').value;
  const st = document.getElementById('filter-et-statut').value;
  const profil = document.getElementById('filter-et-profil').value;
  const ageVal = parseInt(document.getElementById('filter-et-age').value)||0;
  let n = 0;
  document.querySelectorAll('#etudes-list .study-card').forEach(el=>{
    const ageMin = parseInt(el.dataset.ageMin)||0;
    const ageMax = parseInt(el.dataset.ageMax)||99;
    const ageOk = !ageVal || (ageVal >= ageMin && ageVal <= ageMax);
    const profilOk = !profil || el.dataset.profil === profil || el.dataset.profil === 'tous';
    const show = (!q||el.dataset.q.includes(q)||el.querySelector('h4').textContent.toLowerCase().includes(q))&&(!ty||el.dataset.type===ty)&&(!st||el.dataset.statut===st)&&profilOk&&ageOk;
    el.style.display = show?'':'none';
    if(show)n++;
  });
  document.getElementById('et-count').textContent = n+' étude'+(n>1?'s':'');
  document.getElementById('et-empty').style.display = n===0?'block':'none';
}

function saveEmailNotif() {
  const email = document.getElementById('notif-email').value.trim();
  if (!email || !email.includes('@')) { showToast('❌ Merci d\'entrer un email valide.'); return; }
  const emails = S.get('endo_notifs');
  if (!emails.includes(email)) { emails.push(email); S.set('endo_notifs', emails); }
  document.getElementById('notif-email').value = '';
  showToast('🔔 Vous serez alertée dès qu\'une nouvelle étude correspond à votre profil !');
}

// ═══════════════════ ÉTUDES CHERCHEUR ═══════════════════
const PRELOADED = [
  {id:'pre1',titre:'ENDO-BIO — Biomarqueurs sanguins',type:'Prélèvement sanguin',etab:'CHU de Lyon',ville:'Lyon',statut:'Recrutement ouvert',dedommagement:'40€',criteres:'18–45 ans',nb:50,inscrits:32,email:'contact@chu-lyon.fr',isPre:true},
  {id:'pre2',titre:'DIAG-ENDO — Imagerie IRM',type:'IRM / imagerie',etab:'Hôpital Lariboisière',ville:'Paris',statut:'Places limitées',dedommagement:'60€',criteres:'Diagnostic confirmé',nb:25,inscrits:22,email:'contact@lariboisiere.fr',isPre:true},
  {id:'pre3',titre:'QUALI-VIE — Qualité de vie',type:'Questionnaire en ligne',etab:'En ligne',ville:'En ligne',statut:'Recrutement ouvert',dedommagement:'15€ (bon cadeau)',criteres:'Toutes',nb:200,inscrits:80,email:'qualivie@endorecherche.fr',isPre:true},
  {id:'pre4',titre:'MENSTRUO — Sang menstruel',type:'Prélèvement de sang menstruel',etab:'À domicile',ville:'Toute France',statut:'Recrutement ouvert',dedommagement:'50€',criteres:'18–50 ans',nb:50,inscrits:11,email:'menstruo@inserm.fr',isPre:true},
];

function renderCEtudes() {
  const c = document.getElementById('c-etudes-list');
  if(!c) return;
  c.innerHTML = '';
  [...PRELOADED, ...extraEtudes].forEach(e => c.appendChild(buildCCard(e)));
  filterCetudes();
}

function buildCCard(e) {
  const bc = e.statut==='Recrutement ouvert'?'green':e.statut==='Places limitées'?'amber':'';
  const pct = e.nb ? Math.min(100,Math.round((e.inscrits||0)/e.nb*100)) : 0;
  const d = document.createElement('div');
  d.className='study-card';
  d.dataset.type=e.type||'';
  d.dataset.statut=e.statut||'';
  d.dataset.q=(e.titre+' '+e.etab+' '+e.ville+' '+e.type).toLowerCase();
  d.dataset.id=e.id;
  d.innerHTML=`
    <div class="study-card-body">
      <span class="study-badge ${bc}">${e.statut}</span>
      <div class="study-info">
        <h4>${e.titre}</h4>
        <p>${e.type} · ${e.etab}${e.ville?' · '+e.ville:''}${e.criteres?' · '+e.criteres:''}${e.dedommagement?' · 💶 '+e.dedommagement:''}</p>
        <p style="margin-top:4px;font-size:11.5px;color:var(--text-muted)">📧 ${e.email}</p>
      </div>
      ${e.nb?`<div class="study-progress"><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><span class="progress-label">${e.inscrits||0} / ${e.nb} participantes recrutées</span></div>`:''}
    </div>
    <div class="study-actions">
      ${!e.isPre?`<button class="study-delete" onclick="deleteEtude('${e.id}')" title="Supprimer">🗑️</button>`:''}
      <button class="study-btn" onclick="openPartModal('${e.titre.replace(/'/g,"\\'")}','${e.etab.replace(/'/g,"\\'")}','${(e.dedommagement||'').replace(/'/g,"\\'")}')">Voir ↗</button>
    </div>`;
  return d;
}

function filterCetudes() {
  const q = (document.getElementById('filter-c-q')||{value:''}).value.toLowerCase();
  const ty = (document.getElementById('filter-c-type')||{value:''}).value;
  const st = (document.getElementById('filter-c-statut')||{value:''}).value;
  let n = 0;
  document.querySelectorAll('#c-etudes-list .study-card').forEach(el=>{
    const show = (!q||el.dataset.q.includes(q))&&(!ty||el.dataset.type===ty)&&(!st||el.dataset.statut===st);
    el.style.display=show?'':'none';
    if(show)n++;
  });
  const cc=document.getElementById('c-count'), ce=document.getElementById('c-empty');
  if(cc) cc.textContent=n+' étude'+(n>1?'s':'');
  if(ce) ce.style.display=n===0?'block':'none';
}

function deleteEtude(id) {
  if(!confirm('Supprimer cette annonce ?')) return;
  extraEtudes = extraEtudes.filter(e=>e.id!==id);
  S.set('endo_etudes', extraEtudes);
  document.querySelectorAll(`[data-id="${id}"]`).forEach(el=>el.remove());
  updateCounters();
  refreshAdminCounts();
  renderAdminAnn();
  showToast('🗑️ Annonce supprimée.');
}

// ═══════════════════ PUBLIER ANNONCE ═══════════════════
function publierAnnonce() {
  if (!requireAuthentication()) return;
  const titre = document.getElementById('f-titre').value.trim();
  const type  = document.getElementById('f-type').value;
  const etab  = document.getElementById('f-etab').value.trim();
  const email = document.getElementById('f-email').value.trim();
  if (!titre||!type||!etab||!email) { showToast('⚠️ Veuillez remplir tous les champs obligatoires.'); return; }
  const e = {
    id:'e'+Date.now(), titre, type, etab, email,
    dedommagement: document.getElementById('f-dedommagement').value.trim(),
    statut: document.getElementById('f-statut').value,
    criteres: document.getElementById('f-criteres').value.trim(),
    desc: document.getElementById('f-desc').value.trim(),
    nb: parseInt(document.getElementById('f-nb').value)||0,
    ville: document.getElementById('f-ville').value.trim(),
    inscrits:0, isPre:false, date:new Date().toLocaleDateString('fr-FR')
  };
  extraEtudes.push(e);
  S.set('endo_etudes', extraEtudes);

  const bc=e.statut==='Recrutement ouvert'?'green':e.statut==='Places limitées'?'amber':'';
  const card=document.createElement('div');
  card.className='study-card';
  card.dataset.type=e.type; card.dataset.statut=e.statut;
  card.dataset.q=(e.titre+' '+e.etab+' '+e.ville+' '+e.type).toLowerCase();
  card.dataset.id=e.id;
  card.innerHTML=`
    <div class="study-card-body">
      <span class="study-badge ${bc}">${e.statut}</span>
      <div class="study-info"><h4>${e.titre}</h4><p>${e.type} · ${e.etab}${e.ville?' · '+e.ville:''}${e.criteres?' · '+e.criteres:''}${e.dedommagement?' · 💶 Dédommagement : '+e.dedommagement:''}</p></div>
      ${e.nb?`<div class="study-progress"><div class="progress-track"><div class="progress-fill" style="width:0%"></div></div><span class="progress-label">0 / ${e.nb} participantes recrutées</span></div>`:''}
    </div>
    <div class="study-actions">
      <button class="study-fav" onclick="toggleFavStudy(this)">🤍</button>
      <button class="study-btn" onclick="openPartModal('${e.titre.replace(/'/g,"\\'")}','${e.etab.replace(/'/g,"\\'")}','${(e.dedommagement).replace(/'/g,"\\'")}')">Participer ↗</button>
    </div>`;
  document.getElementById('etudes-list').appendChild(card);

  ['f-titre','f-etab','f-criteres','f-desc','f-email','f-dedommagement','f-nb','f-ville'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f-type').value='';
  updateCounters();
  renderCEtudes();
  renderAdminAnn();
  showToast('🎉 Annonce publiée et visible en temps réel !');
  setTimeout(()=>{ window.location.href='patientes.html#tab-etudes'; }, 1800);
}

// ═══════════════════ FAVORIS ═══════════════════
function toggleFav(btn){const a=btn.classList.toggle('active');btn.textContent=a?'❤️':'🤍';showToast(a?'❤️ Spécialiste ajouté aux favoris':'🤍 Retiré des favoris');}
function toggleFavStudy(btn){const a=btn.classList.toggle('active');btn.textContent=a?'❤️':'🤍';showToast(a?'❤️ Étude ajoutée aux favoris':'🤍 Retirée des favoris');}

// ═══════════════════ MODALS ═══════════════════
function openContactModal(nom,etab){
  document.getElementById('mc-title').textContent='Contacter '+nom;
  document.getElementById('mc-sub').textContent=etab;
  document.getElementById('modal-contact').style.display='flex';
}
function envoyerContact(){
  const n=document.getElementById('mc-nom').value.trim(),e=document.getElementById('mc-email').value.trim();
  if(!n||!e){showToast('⚠️ Veuillez remplir les champs obligatoires.');return;}
  closeModal('modal-contact');
  ['mc-nom','mc-email','mc-tel','mc-msg'].forEach(id=>document.getElementById(id).value='');
  showToast('✅ Demande envoyée ! Le spécialiste vous répondra sous 48h.');
}
function openPartModal(titre,etab,dedommagement){
  document.getElementById('mp-title').textContent=titre;
  document.getElementById('mp-sub').textContent=etab;
  document.getElementById('mp-dedommagement').textContent=dedommagement?' Pour cette étude : '+dedommagement:' Aucun dédommagement prévu.';
  document.getElementById('modal-part').style.display='flex';
}
function envoyerPart(){
  const n=document.getElementById('mp-nom').value.trim(),e=document.getElementById('mp-email').value.trim();
  if(!n||!e){showToast('⚠️ Veuillez remplir les champs obligatoires.');return;}
  const etude=document.getElementById('mp-title').textContent;
  candidatures.push({nom:n,email:e,etude,ddn:document.getElementById('mp-ddn').value,diag:document.getElementById('mp-diag').value,ville:document.getElementById('mp-ville').value,date:new Date().toLocaleDateString('fr-FR')});
  S.set('endo_cands',candidatures);
  const el=document.getElementById('counter-candidatures');
  el.textContent=parseInt(el.textContent)+1;
  closeModal('modal-part');
  ['mp-nom','mp-email','mp-ddn','mp-ville'].forEach(id=>document.getElementById(id).value='');
  renderAdminCand();
  showToast('✅ Candidature envoyée ! L\'équipe vous contactera pour confirmer votre éligibilité.');
}
function soumettreAsso(){
  if (!requireAuthentication()) return;
  const n=document.getElementById('a-nom').value.trim(),e=document.getElementById('a-email').value.trim(),d=document.getElementById('a-desc').value.trim();
  if(!n||!e||!d){showToast('⚠️ Veuillez remplir tous les champs obligatoires.');return;}
  assosDemandes.push({nom:n,type:document.getElementById('a-type').value,contact:document.getElementById('a-contact').value,email:e,zone:document.getElementById('a-zone').value,desc:d,site:document.getElementById('a-site').value,date:new Date().toLocaleDateString('fr-FR'),status:'pending'});
  S.set('endo_assos',assosDemandes);
  ['a-nom','a-contact','a-email','a-zone','a-desc','a-site'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('a-type').value='';
  renderAdminAsso();
  showToast('✅ Demande envoyée ! Notre équipe vous répondra sous 5 jours ouvrés.');
}
function publierTemoignage(){
  if (!requireAuthentication()) return;
  const p=document.getElementById('t-prenom').value.trim(),th=document.getElementById('t-theme').value,tx=document.getElementById('t-texte').value.trim();
  if(!p||!th||!tx){showToast('⚠️ Veuillez remplir tous les champs.');return;}
  const anon=document.getElementById('t-anon').checked;
  const mois=new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  const t={
    prenom:anon?'Anonyme':p, theme:th, texte:tx, date:mois,
    age:document.getElementById('t-age').value.trim(),
    ville:document.getElementById('t-ville').value.trim(),
    duree:document.getElementById('t-duree').value,
    traitement:document.getElementById('t-traitement').value
  };
  temoignages.unshift(t); S.set('endo_temos',temoignages);
  const card=buildTemoCard(t);
  const list=document.getElementById('temoignages-list');
  list.insertBefore(card,list.firstChild);
  const el=document.getElementById('counter-temoignages');
  if(el)el.textContent=parseInt(el.textContent)+1;
  ['t-prenom','t-texte','t-age','t-ville'].forEach(id=>document.getElementById(id).value='');
  ['t-theme','t-duree','t-traitement'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('t-anon').checked=false;
  showToast('💬 Témoignage publié ! Merci de partager votre vécu.');
}
function buildTemoCard(t){
  const av=['🌸','💜','🌺','🌷','💐','🌼'][Math.floor(Math.random()*6)];
  const meta=[t.age?t.age+' ans':'', t.ville, t.duree?'Errance : '+t.duree:''].filter(Boolean).join(' · ');
  const traitement=t.traitement?`<span class="temoignage-tag" style="background:var(--primary-pale);margin-left:6px">${t.traitement}</span>`:'';
  const d=document.createElement('div'); d.className='temoignage-card';
  d.innerHTML=`<div class="temoignage-header"><div class="temoignage-avatar">${av}</div><div class="temoignage-meta"><div class="temoignage-name">${t.prenom}${meta?' — <span style="font-weight:400;color:var(--text-muted);font-size:12px">'+meta+'</span>':''}</div><div class="temoignage-date">${t.date}</div></div></div><div class="temoignage-text">« ${t.texte} »</div><div style="margin-top:10px"><span class="temoignage-tag">${t.theme}</span>${traitement}</div>`;
  return d;
}
function renderStoredTemoignages(){
  if(!temoignages.length)return;
  const list=document.getElementById('temoignages-list');
  if(!list)return;
  temoignages.forEach(t=>list.appendChild(buildTemoCard(t)));
  const counter=document.getElementById('counter-temoignages');
  if(counter)counter.textContent=3+temoignages.length;
}

// ═══════════════════ COMPTEURS ═══════════════════
function updateCounters(){
  const etudesCounter=document.getElementById('counter-etudes');
  const candidaturesCounter=document.getElementById('counter-candidatures');
  if(etudesCounter)etudesCounter.textContent=4+extraEtudes.length;
  if(candidaturesCounter)candidaturesCounter.textContent=candidatures.length;
}

// ═══════════════════ ADMIN ═══════════════════
const ADMIN_PWD='endo2026';
let adminOk=false;

function openAdminModal(){
  document.getElementById('modal-admin').style.display='flex';
  if(adminOk){document.getElementById('admin-login').style.display='none';document.getElementById('admin-dash').style.display='block';refreshAdminCounts();renderAdminAnn();renderAdminAsso();renderAdminCand();}
}
function checkPwd(){
  if(document.getElementById('admin-pwd').value===ADMIN_PWD){
    adminOk=true;
    document.getElementById('admin-login').style.display='none';
    document.getElementById('admin-dash').style.display='block';
    document.getElementById('admin-pwd').value='';
    document.getElementById('admin-err').style.display='none';
    refreshAdminCounts(); renderAdminAnn(); renderAdminAsso(); renderAdminCand();
  } else { document.getElementById('admin-err').style.display='block'; }
}
function showAdminTab(t){
  ['ann','asso','cand'].forEach(x=>document.getElementById('adm-'+x).style.display=x===t?'block':'none');
  document.querySelectorAll('.admin-tab').forEach((b,i)=>b.classList.toggle('active',['ann','asso','cand'][i]===t));
}
function refreshAdminCounts(){
  document.getElementById('adm-ann-n').textContent=extraEtudes.length;
  document.getElementById('adm-asso-n').textContent=assosDemandes.length;
  document.getElementById('adm-cand-n').textContent=candidatures.length;
}
function renderAdminAnn(){
  const el=document.getElementById('adm-ann-body');
  if(!el)return; refreshAdminCounts();
  if(!extraEtudes.length){el.innerHTML='<div class="admin-empty">Aucune annonce publiée via le formulaire.</div>';return;}
  el.innerHTML=`<table class="admin-table"><thead><tr><th>Titre</th><th>Type</th><th>Établissement</th><th>Statut</th><th>Date</th><th>Action</th></tr></thead><tbody>${extraEtudes.map(e=>`<tr><td><strong>${e.titre}</strong><br><small>${e.email}</small></td><td>${e.type}</td><td>${e.etab}</td><td><span class="admin-badge ${e.statut==='Recrutement ouvert'?'approved':'pending'}">${e.statut}</span></td><td>${e.date}</td><td><button class="admin-action delete" onclick="adminDelAnn('${e.id}')">🗑️ Supprimer</button></td></tr>`).join('')}</tbody></table>`;
}
function adminDelAnn(id){
  if(!confirm('Supprimer ?'))return;
  extraEtudes=extraEtudes.filter(e=>e.id!==id);
  S.set('endo_etudes',extraEtudes);
  document.querySelectorAll(`[data-id="${id}"]`).forEach(el=>el.remove());
  updateCounters(); renderCEtudes(); renderAdminAnn();
  showToast('🗑️ Annonce supprimée.');
}
function renderAdminAsso(){
  const el=document.getElementById('adm-asso-body');
  if(!el)return; refreshAdminCounts();
  if(!assosDemandes.length){el.innerHTML='<div class="admin-empty">Aucune demande reçue.</div>';return;}
  el.innerHTML=`<table class="admin-table"><thead><tr><th>Association</th><th>Type</th><th>Contact</th><th>Email</th><th>Date</th><th>Actions</th></tr></thead><tbody>${assosDemandes.map((a,i)=>`<tr><td><strong>${a.nom}</strong></td><td>${a.type}</td><td>${a.contact}</td><td>${a.email}</td><td>${a.date}</td><td><button class="admin-action approve" onclick="adminApprAsso(${i})">✅ Valider</button><button class="admin-action delete" onclick="adminDelAsso(${i})">🗑️</button></td></tr>`).join('')}</tbody></table>`;
}
function adminApprAsso(i){showToast('✅ Association "'+assosDemandes[i].nom+'" validée.');assosDemandes[i].status='approved';S.set('endo_assos',assosDemandes);renderAdminAsso();}
function adminDelAsso(i){if(!confirm('Supprimer ?'))return;assosDemandes.splice(i,1);S.set('endo_assos',assosDemandes);renderAdminAsso();showToast('🗑️ Demande supprimée.');}
function renderAdminCand(){
  const el=document.getElementById('adm-cand-body');
  if(!el)return; refreshAdminCounts();
  if(!candidatures.length){el.innerHTML='<div class="admin-empty">Aucune candidature reçue.</div>';return;}
  el.innerHTML=`<table class="admin-table"><thead><tr><th>Nom</th><th>Email</th><th>Étude</th><th>Diagnostic</th><th>Ville</th><th>Date</th><th>Action</th></tr></thead><tbody>${candidatures.map((c,i)=>`<tr><td>${c.nom}</td><td>${c.email}</td><td>${c.etude}</td><td>${c.diag}</td><td>${c.ville||'—'}</td><td>${c.date}</td><td><button class="admin-action delete" onclick="adminDelCand(${i})">🗑️</button></td></tr>`).join('')}</tbody></table>`;
}
function adminDelCand(i){if(!confirm('Supprimer ?'))return;candidatures.splice(i,1);S.set('endo_cands',candidatures);renderAdminCand();updateCounters();showToast('🗑️ Candidature supprimée.');}

// ═══════════════════ UTILS ═══════════════════
function closeModal(id){document.getElementById(id).style.display='none';}
function closeIf(ev,id){if(ev.target===document.getElementById(id))closeModal(id);}
document.addEventListener('keydown',e=>{if(e.key==='Escape')['modal-contact','modal-part','modal-info','modal-admin'].forEach(closeModal);});
function showToast(msg){
  const t=document.getElementById('toast');
  const message=document.getElementById('toast-msg');
  if(!t||!message)return;
  message.textContent=msg;
  t.classList.remove('hidden');
  clearTimeout(window._tt);
  window._tt=setTimeout(()=>t.classList.add('hidden'),4500);
}

// ═══════════════════ INFO MODALS ═══════════════════
const INFO={
  endometriose:{titre:"Qu'est-ce que l'endométriose ?",body:"L'endométriose est une maladie chronique et inflammatoire qui touche environ <strong>1 femme sur 10 en âge de procréer</strong>, soit près de 200 millions de femmes dans le monde.<br><br>Elle se caractérise par la présence de tissu semblable à la muqueuse utérine (endomètre) en dehors de l'utérus : sur les ovaires, les trompes, le péritoine, parfois l'intestin ou la vessie.<br><br>Ces implants réagissent aux hormones du cycle menstruel et provoquent des <strong>inflammations, des adhérences et des douleurs</strong>."},
  symptomes:{titre:"Reconnaître les symptômes",body:"<strong>🩸 Règles douloureuses</strong> (dysménorrhée) — douleurs qui ne cèdent pas avec des antidouleurs classiques<br><strong>⚡ Douleurs pelviennes chroniques</strong> — en dehors des règles<br><strong>😣 Douleurs lors des rapports sexuels</strong> (dyspareunie)<br><strong>🚽 Douleurs à la défécation ou la miction</strong> pendant les règles<br><strong>😴 Fatigue chronique intense</strong><br><strong>🤰 Difficultés à concevoir</strong><br><br>Si vous reconnaissez plusieurs de ces symptômes, consultez un spécialiste."},
  parcours:{titre:"Le parcours de soin",body:"<strong>1. Médecin généraliste</strong> — Premier interlocuteur, prescrit des examens et oriente.<br><br><strong>2. Gynécologue</strong> — Examen clinique, échographie pelvienne, bilan hormonal.<br><br><strong>3. Centre spécialisé endométriose</strong> — IRM pelvienne, consultation multidisciplinaire.<br><br><strong>4. Diagnostic & traitement</strong> — Traitement hormonal et/ou chirurgical selon la gravité.<br><br><strong>5. Suivi à long terme</strong> — L'endométriose nécessite un suivi régulier, même après traitement."},
  traitements:{titre:"Traitements disponibles",body:"<strong>💊 Traitements hormonaux</strong><br>Pilule contraceptive, progestatifs, DIU hormonal, agonistes de la GnRH.<br><br><strong>🔪 Chirurgie</strong><br>Cœlioscopie pour retirer les lésions. Doit être réalisée par un chirurgien expert.<br><br><strong>💆 Approches complémentaires</strong><br>Kiné périnéale, ostéopathie, régime anti-inflammatoire, gestion du stress.<br><br><strong>🔬 Recherche en cours</strong><br>Biomarqueurs, immunothérapie, nouvelles molécules."},
  fertilite:{titre:"Endométriose & fertilité",body:"L'endométriose peut affecter la fertilité, mais de nombreuses femmes atteintes ont des grossesses naturelles.<br><br><strong>Options :</strong><br>- Suivi gynécologique rapproché<br>- Stimulation ovarienne<br>- FIV (remboursée jusqu'à 43 ans)<br>- Préservation de fertilité (congélation d'ovocytes)<br><br>Consultez un spécialiste en fertilité pour un bilan personnalisé."},
  quotidien:{titre:"Vivre au quotidien",body:"<strong>🥗 Alimentation anti-inflammatoire</strong> — Oméga-3, légumes, curcuma. Limiter gluten, sucre raffiné.<br><br><strong>🏃 Activité physique adaptée</strong> — Yoga, natation, marche.<br><br><strong>🧘 Gestion de la douleur</strong> — Bouillotte, TENS, sophrologie, mindfulness.<br><br><strong>💬 Soutien psychologique</strong> — Thérapie, groupes de parole (EndoFrance, Endomind).<br><br><strong>💼 Aménagements professionnels</strong> — RQTH, congé menstruel."},
  droits:{titre:"Vos droits & démarches",body:"<strong>ALD 31</strong> — Depuis 2022, prise en charge à 100% pour les formes sévères.<br><br><strong>Arrêt maladie</strong> — Votre médecin peut les prescrire en cas de douleurs invalidantes.<br><br><strong>RQTH</strong> — Aménagements de poste, horaires flexibles, télétravail. À demander à la MDPH.<br><br><strong>Congé menstruel</strong> — Certaines entreprises proposent des jours dédiés."},
  adenomyose:{titre:"L'adénomyose",body:"L'adénomyose est la présence de tissu endométrial à <strong>l'intérieur du muscle utérin</strong>.<br><br><strong>Symptômes :</strong> règles très abondantes, douleurs pelviennes intenses, utérus augmenté de volume, fatigue par anémie.<br><br><strong>Diagnostic :</strong> IRM pelvienne ou échographie spécialisée.<br><br><strong>Traitements :</strong> similaires à l'endométriose. Peut coexister avec l'endométriose."},
  epidemio:{titre:"Données épidémiologiques",body:"<strong>En France :</strong><br>- ~2,5 millions de femmes touchées (10%)<br>- Délai moyen de diagnostic : <strong>7 ans</strong><br>- 40% des femmes infertiles ont une endométriose<br>- Coût estimé : 10 000€/an/patiente<br><br><strong>Dans le monde :</strong><br>- 190 millions de femmes touchées<br>- 1ère cause de douleur pelvienne chronique<br><br>Source : HAS, Inserm, WHO 2023"},
  protocoles:{titre:"Protocoles & recommandations",body:"<strong>HAS 2017/2023</strong> — Prise en charge multidisciplinaire dans des centres experts. IRM = examen de référence.<br><br><strong>ESHRE 2022</strong> — Guidelines sur le diagnostic, la chirurgie et la fertilité.<br><br><strong>CNGE</strong> — Centres Nationaux de Référence en Gynécologie-Endométriose."},
  partenariats:{titre:"Partenariats & réseau",body:"🏥 <strong>Réseau inter-CHU</strong> — Partage de bonnes pratiques<br>🌸 <strong>EndoFrance</strong> — Association nationale<br>💜 <strong>Endomind</strong> — Bourse de recherche<br>🔬 <strong>Inserm</strong> — Études épidémiologiques<br><br>Pour proposer un partenariat, utilisez le formulaire dans l'espace Association."},
  'sang-menstruel':{titre:"Recherche sur le sang menstruel",body:"Le sang menstruel contient des cellules endométriales vivantes permettant d'étudier l'endométriose <strong>sans chirurgie invasive</strong>.<br><br><strong>Kit à domicile :</strong> collecteur menstruel stérile, tube de conservation, envoi pré-affranchi.<br><br><strong>Données :</strong> anonymisées, protégées (RGPD).<br><br>Consultez l'onglet 'Études ens' pour les études ouvertes."},
  brochures:{titre:"Brochures téléchargeables",body:"📄 Guide patiente 'Comprendre mon endométriose' — 12 pages<br>📄 Affiche de sensibilisation — Format A3<br>📄 Fiche symptômes — À remplir avant consultation<br>📄 Guide 'Mes droits avec l'endométriose'<br>📄 Brochure pour les proches<br><br>Contactez-nous via le formulaire Association pour accéder aux documents."},
  webinaires:{titre:"Webinaires & événements",body:"📅 <strong>15 mai 2026</strong> — 'Sang menstruel : où en est la recherche ?' — En ligne<br><br>📅 <strong>1-2 juin 2026</strong> — Journées nationales endométriose — Paris<br><br>📅 <strong>18 juin 2026</strong> — Formation soignants — Lyon, CHU<br><br>📅 <strong>Septembre 2026</strong> — Colloque ESHRE — Bruxelles"},
  endofrance:{titre:"EndoFrance",body:"Association nationale de référence fondée en 2001. Groupes de parole, permanence téléphonique, ressources documentaires.<br><br>🌐 <strong>endofrance.org</strong><br>📞 0 800 800 400 (gratuit)"},
  endomind:{titre:"Endomind",body:"Association de sensibilisation et de recherche. Bourse de recherche annuelle, campagnes nationales, soutien aux patientes et soignants.<br><br>🌐 <strong>endomind.org</strong>"},
  'endofrance-contact':{titre:"Contacter EndoFrance",body:"📞 <strong>0 800 800 400</strong> (numéro gratuit)<br>🌐 endofrance.org<br>📧 contact@endofrance.org<br><br>Groupes de parole locaux dans toute la France."},
  'endomind-contact':{titre:"Contacter Endomind",body:"🌐 endomind.org<br>📧 contact@endomind.org<br><br>Présents sur Instagram et Facebook avec une communauté active."},
};
function openInfoModal(key){
  const c=INFO[key]; if(!c)return;
  document.getElementById('info-title').textContent=c.titre;
  document.getElementById('info-body').innerHTML=c.body;
  document.getElementById('modal-info').style.display='flex';
}
