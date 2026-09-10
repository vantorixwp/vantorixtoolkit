/* ------------------------------------------------------------------
   Vantorix Pro — contact composer.

   The plugin's License screen links here as /#contact?domain=example.com,
   so someone arriving from their dashboard finds the domain already filled
   in and only has to press send.
   ------------------------------------------------------------------ */

(function () {
  'use strict';

  /** Change this one line if the number changes. */
  var WHATSAPP_NUMBER = '8801810398545';

  var planField = document.getElementById('planField');
  var domainField = document.getElementById('domainField');
  var noteField = document.getElementById('noteField');
  var messageField = document.getElementById('messageField');
  var waBtn = document.getElementById('waBtn');
  var copyBtn = document.getElementById('copyBtn');
  var copyStatus = document.getElementById('copyStatus');
  var hint = document.getElementById('composerHint');

  if (!planField || !messageField) {
    return;
  }

  /* ---- Read a domain passed in the URL, from either ?domain= or #contact?domain= */

  function domainFromUrl() {
    var direct = new URLSearchParams(window.location.search).get('domain');
    if (direct) {
      return direct;
    }

    var hash = window.location.hash;
    var q = hash.indexOf('?');
    if (q > -1) {
      return new URLSearchParams(hash.slice(q + 1)).get('domain');
    }

    return null;
  }

  /* ---- Keep only something that looks like a hostname, never raw markup */

  function cleanDomain(value) {
    if (!value) {
      return '';
    }

    var host = String(value)
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      .replace(/^www\./, '');

    return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) ? host : '';
  }

  /* ---- Build the message ------------------------------------------------ */

  function buildMessage() {
    var plan = planField.value;
    var price = planField.options[planField.selectedIndex].textContent.split('—')[1] || '';
    var domain = domainField.value.trim();
    var note = noteField.value.trim();

    var lines = [
      'Hello Vantorix,',
      '',
      'I would like the ' + plan + ' package' + (price ? ' (' + price.trim() + ')' : '') + '.',
      'Domain for the licence: ' + (domain || '(I will confirm this)')
    ];

    if (note) {
      lines.push('', note);
    }

    lines.push('', 'Please let me know how to pay.');

    return lines.join('\n');
  }

  function refresh() {
    var text = buildMessage();
    messageField.value = text;
    waBtn.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }

  /* ---- Wire it up ------------------------------------------------------- */

  var incoming = cleanDomain(domainFromUrl());

  if (incoming) {
    domainField.value = incoming;
    if (hint) {
      hint.hidden = false;
    }
  }

  [planField, domainField, noteField].forEach(function (field) {
    field.addEventListener('input', refresh);
    field.addEventListener('change', refresh);
  });

  refresh();

  /* ---- "Ask for this" buttons on the pricing cards ---------------------- */

  document.querySelectorAll('[data-plan]').forEach(function (button) {
    button.addEventListener('click', function () {
      planField.value = button.getAttribute('data-plan');
      refresh();

      document.getElementById('contact').scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });

      window.setTimeout(function () {
        domainField.focus();
      }, 400);
    });
  });

  /* ---- Copy to clipboard ------------------------------------------------ */

  function say(text) {
    copyStatus.textContent = text;
    window.setTimeout(function () {
      copyStatus.textContent = '';
    }, 3000);
  }

  copyBtn.addEventListener('click', function () {
    var text = messageField.value;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        function () {
          say('Message copied.');
        },
        function () {
          say('Could not copy. Select the text and copy it manually.');
        }
      );
      return;
    }

    messageField.removeAttribute('readonly');
    messageField.select();

    try {
      var ok = document.execCommand('copy');
      say(ok ? 'Message copied.' : 'Could not copy. Select the text and copy it manually.');
    } catch (err) {
      say('Could not copy. Select the text and copy it manually.');
    }

    messageField.setAttribute('readonly', 'readonly');
    window.getSelection().removeAllRanges();
  });
})();
