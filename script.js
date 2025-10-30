/* script.js
   - UI logic for the three-card apology prototype
   - logs interactions to Firestore via window.db (set in firebase.js)
*/

(function(){
  // elements
  const continueBtn = document.getElementById('continueBtn');
  const laterBtn = document.getElementById('laterBtn');
  const cardsSection = document.getElementById('cardsSection');
  const intro = document.getElementById('intro');
  const cardEls = Array.from(document.querySelectorAll('.card-reveal'));
  const finishBtn = document.getElementById('finishBtn');
  const restartBtn = document.getElementById('restartBtn');

  // visitor id for privacy
  const visitorId = localStorage.getItem('visitor_id') || 'v_' + Math.random().toString(36).slice(2,10);
  localStorage.setItem('visitor_id', visitorId);

  // state
  const opened = new Set();

  // helper: log to firestore
  function logAction(action, data = {}) {
    const doc = {
      action,
      timestamp: new Date().toISOString(),
      visitor_id: visitorId,
      ...data
    };
    if (window.db && typeof window.db.collection === 'function') {
      // save document under collection "userInteractions"
      window.db.collection('userInteractions').add(doc).catch(e => console.warn('Firestore error', e));
    } else {
      console.log('LOG (no DB):', doc);
    }
  }

  // show cards section
  continueBtn.addEventListener('click', () => {
    intro.classList.add('hidden');
    cardsSection.classList.remove('hidden');
    logAction('entered_cards');
  });

  laterBtn.addEventListener('click', () => {
    logAction('chose_later');
    // gentle feedback
    continueBtn.textContent = 'Come back anytime';
    continueBtn.classList.remove('primary');
    continueBtn.classList.add('ghost');
  });

  // reveal/hide card body
  function toggleCard(el) {
    const key = el.dataset.key || 'unknown';
    const body = el.querySelector('.card-body');
    const isVisible = body.classList.contains('visible');
    if (!isVisible) {
      body.classList.add('visible');
      el.setAttribute('aria-pressed','true');
      opened.add(key);
      logAction('open_card', { card: key });
    } else {
      body.classList.remove('visible');
      el.setAttribute('aria-pressed','false');
      opened.delete(key);
      logAction('close_card', { card: key });
    }
    // if all opened, enable finish
    if (opened.size === cardEls.length) finishBtn.disabled = false;
    else finishBtn.disabled = true;
    // small friendly pulse when open
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)'}], { duration: 260, easing:'ease-out' });
  }

  cardEls.forEach(el => {
    // click
    el.addEventListener('click', () => toggleCard(el));
    // accessible keyboard
    el.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard(el); } });
  });

  // restart flow
  restartBtn.addEventListener('click', () => {
    // reset
    cardEls.forEach(el => {
      const b = el.querySelector('.card-body');
      b.classList.remove('visible');
      el.setAttribute('aria-pressed','false');
    });
    opened.clear();
    finishBtn.disabled = true;
    logAction('restart_flow');
    // back to top
    cardsSection.scrollIntoView({behavior:'smooth'});
  });

  // finish action
  finishBtn.addEventListener('click', () => {
    logAction('finished', { opened: Array.from(opened) });
    // subtle confetti
    playConfetti();
    finishBtn.disabled = true;
    finishBtn.textContent = 'Thanks!';
  });

  // small confetti (lightweight)
  function playConfetti() {
    const count = 26;
    for (let i=0;i<count;i++){
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.left = (20 + Math.random()*60) + '%';
      el.style.top = (10 + Math.random()*30) + '%';
      el.style.width = '8px';
      el.style.height = '12px';
      el.style.background = ['#3772ff','#ff8aa5','#ffd6a5','#a0e9d7'][Math.floor(Math.random()*4)];
      el.style.borderRadius = '3px';
      el.style.zIndex = 9999;
      el.style.opacity = '0.95';
      document.body.appendChild(el);

      const dx = (Math.random()-0.5)*400;
      const dy = 300 + Math.random()*200;
      el.animate([
        { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${dy}px) translateX(${dx}px) rotate(${Math.random()*360}deg)`, opacity: 0 }
      ], { duration: 1200 + Math.random()*600, easing: 'cubic-bezier(.2,.9,.3,1)'});
      setTimeout(()=> el.remove(), 2000);
    }
  }

  // optional: try logging page view
  logAction('page_view');
})();
