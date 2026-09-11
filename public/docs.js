/* Docs: keep the side navigation in step with what you are reading. */
(function () {
  'use strict';

  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) {
    return;
  }

  var byId = {};
  var targets = [];

  links.forEach(function (link) {
    var section = document.getElementById(link.getAttribute('href').slice(1));
    if (section) {
      byId[section.id] = link;
      targets.push(section);
    }
  });

  var current = null;

  function mark(id) {
    if (current === id) {
      return;
    }
    if (current && byId[current]) {
      byId[current].classList.remove('is-here');
    }
    current = id;
    if (byId[id]) {
      byId[id].classList.add('is-here');
    }
  }

  var observer = new IntersectionObserver(
    function (entries) {
      var visible = entries
        .filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });

      if (visible.length) {
        mark(visible[0].target.id);
      }
    },
    { rootMargin: '-72px 0px -65% 0px', threshold: 0 }
  );

  targets.forEach(function (section) { observer.observe(section); });
})();
