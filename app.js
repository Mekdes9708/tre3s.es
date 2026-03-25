(function () {
  const config = window.TR3ES_CONFIG || {};
  const analytics = config.analytics || {};
  const crm = config.crm || {};

  function injectAnalytics() {
    if (analytics.ga4MeasurementId) {
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + analytics.ga4MeasurementId;
      document.head.appendChild(gtagScript);

      const inline = document.createElement('script');
      inline.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${analytics.ga4MeasurementId}');
      `;
      document.head.appendChild(inline);
    }

    if (analytics.plausibleDomain) {
      const plausible = document.createElement('script');
      plausible.defer = true;
      plausible.setAttribute('data-domain', analytics.plausibleDomain);
      plausible.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(plausible);
    }

    if (analytics.clarityId) {
      const clarity = document.createElement('script');
      clarity.textContent = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/" + i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${analytics.clarityId}");
      `;
      document.head.appendChild(clarity);
    }
  }

  function trackEvent(name, data) {
    if (window.gtag) {
      window.gtag('event', name, data || {});
    }
    if (window.plausible) {
      window.plausible(name, { props: data || {} });
    }
  }

  function setupReveal() {
    const elements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    elements.forEach((el) => observer.observe(el));
  }

  function setupMobileNav() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mobileNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  async function handleCRMSubmit(payload) {
    const provider = crm.provider || 'mailto';

    if (provider === 'hubspot' && crm.hubspotPortalId && crm.hubspotFormId) {
      const res = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${crm.hubspotPortalId}/${crm.hubspotFormId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: [
            { name: 'firstname', value: payload.name || '' },
            { name: 'email', value: payload.email || '' },
            { name: 'company', value: payload.organization || '' },
            { name: 'message', value: `[${payload.type}] ${payload.message}` }
          ]
        })
      });
      if (!res.ok) throw new Error('HubSpot submission failed');
      return 'Inquiry sent successfully.';
    }

    if ((provider === 'formspree' || provider === 'webhook') && crm.endpoint) {
      const res = await fetch(crm.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Form submission failed');
      return 'Inquiry sent successfully.';
    }

    const recipient = crm.recipientEmail || 'Info@tr3es.es';
    const subject = encodeURIComponent('TR3ES Inquiry: ' + payload.type);
    const body = encodeURIComponent(
      `Name: ${payload.name}\nEmail: ${payload.email}\nOrganization: ${payload.organization}\nType: ${payload.type}\n\nMessage:\n${payload.message}`
    );
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    return 'Opening your email client...';
  }

  function setupForm() {
    const form = document.getElementById('inquiryForm');
    const status = document.getElementById('formStatus');
    if (!form || !status) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      status.textContent = 'Submitting...';
      try {
        await handleCRMSubmit(data);
        status.textContent = 'Inquiry prepared successfully.';
        trackEvent('submit_inquiry', { inquiry_type: data.type || 'unknown' });
      } catch (err) {
        status.textContent = 'Submission failed. Please try again or email directly.';
      }
    });
  }

  function setupCTAEvents() {
    document.querySelectorAll('a.button, .footer-links a, .nav a').forEach((el) => {
      el.addEventListener('click', () => {
        trackEvent('click_navigation', { target: el.getAttribute('href') || '' });
      });
    });
  }

  injectAnalytics();
  setupReveal();
  setupMobileNav();
  setupForm();
  setupCTAEvents();
})();
