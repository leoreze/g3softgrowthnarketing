(() => {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));

  const form = document.getElementById('leadForm');
  if (form) {
    const visitorId = (() => { try { let v=localStorage.getItem('g3soft_visitor_id'); if(!v){v=crypto.randomUUID();localStorage.setItem('g3soft_visitor_id',v);} return v; } catch { return ''; } })();
    const sessionId = (() => { try { let v=sessionStorage.getItem('g3soft_session_id'); if(!v){v=crypto.randomUUID();sessionStorage.setItem('g3soft_session_id',v);} return v; } catch { return ''; } })();
    const params = new URLSearchParams(location.search);
    const attr = {}; ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid','msclkid','ttclid','g3_link'].forEach(k=>{if(params.get(k))attr[k]=params.get(k);});
    try { Object.assign(attr, JSON.parse(localStorage.getItem('g3soft_attribution')||'{}')); } catch {}
    attr.referrer_url=document.referrer||attr.referrer_url||''; attr.landing_page_key='g3soft-site'; attr.landing_page_path='/g3soft'; attr.visitor_id=visitorId; attr.session_id=sessionId;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const success = form.querySelector('.form-success'); const button=form.querySelector('button[type="submit"]'); if(button)button.disabled=true;
      const data=Object.fromEntries(new FormData(form).entries());
      try { const r=await fetch('/api/public/marketing/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...attr,...data,product_interest:'',segment:'SITE',challenge:data.interest||'',whatsapp:data.phone||'',consent_marketing:true})}); const body=await r.json(); if(!r.ok)throw new Error(body?.message||'Não foi possível enviar sua solicitação.'); success.innerHTML=body.data.whatsapp_url?`Recebemos sua solicitação. <a href="${body.data.whatsapp_url}" target="_blank" rel="noopener">Continuar pelo WhatsApp ↗</a>`:'Recebemos sua solicitação. Agora a G3Soft pode dar continuidade ao atendimento.'; success.classList.add('show'); form.reset(); } catch(e){ success.textContent=e.message||'Não foi possível enviar. Tente novamente.'; success.classList.add('show'); } finally { if(button)button.disabled=false; }
    });
  }

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
  }
})();
