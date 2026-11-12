/* Truckin' Good Gear — small site script (no build step) */
(function () {
  var C = window.TGG_CONFIG || { ordersOpen: false, prices: {}, paymentLinks: {} };
  function money(n) { return '$' + (Number(n) % 1 ? Number(n).toFixed(2) : String(n)); }

  // Mobile nav
  var t = document.querySelector('.nav-toggle'), nav = document.getElementById('site-nav');
  if (t && nav) t.addEventListener('click', function () {
    var open = nav.classList.toggle('open'); t.setAttribute('aria-expanded', open);
  });

  // Prices from config (static fallback text is already in the HTML)
  document.querySelectorAll('[data-price]').forEach(function (el) {
    var k = el.getAttribute('data-price'), v = C.prices && C.prices[k];
    if (k === 'tee') {
      el.textContent = 'From $40';
      return;
    }
    if (k === 'hoodie') {
      el.textContent = 'Price to be confirmed';
      return;
    }
    if (v == null) return;
    el.textContent = k === 'customPhoto' ? '+' + money(v) : 'From ' + money(v);
  });

  // Shop filters
  var fbtns = document.querySelectorAll('[data-filter]');
  function applyFilter(f) {
    var ok = false;
    fbtns.forEach(function (b) { if (b.dataset.filter === f) ok = true; });
    if (!ok) f = 'all';
    fbtns.forEach(function (b) { var on = b.dataset.filter === f; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
    var n = 0;
    document.querySelectorAll('[data-category]').forEach(function (c) {
      var show = f === 'all' || c.dataset.category.split(' ').indexOf(f) > -1; c.hidden = !show; if (show) n++;
    });
    var cnt = document.getElementById('result-count'); if (cnt) cnt.textContent = n + (n === 1 ? ' design' : ' designs');
  }
  if (fbtns.length) {
    fbtns.forEach(function (b) { b.addEventListener('click', function () {
      applyFilter(b.dataset.filter);
      history.replaceState(null, '', b.dataset.filter === 'all' ? location.pathname : '?range=' + b.dataset.filter);
    }); });
    applyFilter(new URLSearchParams(location.search).get('range') || 'all');
  }

  // Cartoon Truck art: TGG_CONFIG.cartoonArt is the one place for these image paths.
  // The HTML ships with the art that existed at build time; this applies any path set later.
  var ART = C.cartoonArt || {};
  document.querySelectorAll('[data-art-key]').forEach(function (box) {
    var path = ART[box.dataset.artKey]; if (!path) return;
    var isPdp = box.classList.contains('art-slot');
    var img = box.querySelector('img');
    if (img) { if (isPdp) img.src = path; return; }
    var tile = box.querySelector('.dock-mark'); if (!tile) return;
    img = document.createElement('img');
    img.src = path; img.loading = 'lazy';
    img.alt = box.dataset.artAlt || ''; img.decoding = 'async';
    if (isPdp) { img.id = 'pdp-img'; tile.replaceWith(img); var sw = document.querySelector('.swatches button'); if (sw) sw.dataset.img = path; }
    else { var a = document.createElement('a'); a.className = 'media'; a.href = tile.getAttribute('href'); a.tabIndex = -1; a.setAttribute('aria-hidden', 'true'); a.appendChild(img); tile.replaceWith(a); }
  });

  // Product page
  var pdp = document.querySelector('.pdp[data-product]');
  if (pdp) {
    var product = pdp.dataset.product, variant = pdp.dataset.defaultVariant || '', size = '';
    var img = document.getElementById('pdp-img'), buy = document.getElementById('buy'), note = document.getElementById('buy-note');
    var sw = pdp.querySelectorAll('.swatches button, .colour-swatches button, .pdp-thumbs [data-variant]'), sz = pdp.querySelectorAll('.sizes button');
    function key() { return variant ? product + '/' + variant : product; }
    var storefront = pdp.classList.contains('pdp-storefront');
    var garment = 'tee';
    function priceFor(g) {
      if (g === 'hoodie') return { text: 'Price to be confirmed', note: 'Hoodie pricing is still to be confirmed and is not part of the shirt rate.' };
      if (g === 'tee') return { text: '$45 AUD', note: 'Provisional T-shirt price, pending costs: $45 for one shirt, or $40 each when you buy two or more.' };
      return { text: 'Price to be confirmed', note: 'Final garment price including GST and shipping is still to be confirmed.' };
    }
    function renderPrice() {
      var el = document.getElementById('pdp-price');
      if (!el) return;
      var p = priceFor(garment);
      el.textContent = p.text;
      var n = document.getElementById('pdp-price-note'); if (n) n.textContent = p.note;
    }
    function update() {
      var links = (C.paymentLinks || {})[key()] || {}, url = size && links[size];
      if (storefront) {
        if (buy) {
          buy.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.5L21 8H7"/></svg> Add to cart';
          buy.classList.add('add-cart');
          buy.removeAttribute('href');
        }
        if (note) note.textContent = (size ? 'Size ' + size + ' noted. ' : 'Choose a size to add this to your cart. ') + 'Orders aren’t open yet. This is a preview and nothing will be charged.';
        renderPrice();
        return;
      }
      if (C.ordersOpen && url) {
        buy.textContent = 'Buy now'; buy.href = url; buy.classList.remove('disabled'); buy.removeAttribute('aria-disabled');
        note.textContent = 'You’ll be taken to secure checkout.';
      } else {
        buy.textContent = 'Coming soon'; buy.removeAttribute('href'); buy.classList.add('disabled'); buy.setAttribute('aria-disabled', 'true');
        note.textContent = (size ? 'Size ' + size + ' noted. ' : '') + 'Orders aren’t open yet. This is a preview and nothing will be charged.';
      }
    }
    function setShot(el, src, alt) {
      if (!el || !src) return;
      el.src = src;
      if (alt) el.alt = alt;
    }
    function pickVariant(b) {
      var all = pdp.querySelectorAll('[data-variant]');
      all.forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.variant === b.dataset.variant); });
      variant = b.dataset.variant;
      if (img) { img.src = b.dataset.img || img.src; img.alt = b.dataset.alt || img.alt; }
      setShot(document.getElementById('pdp-img-front'), b.dataset.imgFront, b.dataset.altFront);
      setShot(document.getElementById('pdp-img-back'), b.dataset.imgBack, b.dataset.altBack);
      var o = document.getElementById('colour-out'); if (o) o.textContent = b.dataset.label;
      var media = document.querySelector('.pdp-media'); if (media && b.dataset.bg) media.className = 'pdp-media ' + b.dataset.bg;
      history.replaceState(null, '', '#' + variant); update();
    }
    sw.forEach(function (b) { b.addEventListener('click', function () { pickVariant(b); }); });
    var h = location.hash.slice(1), start = null;
    sw.forEach(function (b) { if (b.dataset.variant === h) start = b; });
    if (start) pickVariant(start);
    sz.forEach(function (b) { b.addEventListener('click', function () {
      sz.forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); size = b.dataset.size;
      var o = document.getElementById('size-out'); if (o) o.textContent = size; update();
    }); });
    if (buy) buy.addEventListener('click', function (e) {
      if (storefront) { e.preventDefault(); window.TGG.addToCartFromPdp(pdp, { product: product, variant: variant, size: size, garment: garment }); return; }
      if (buy.classList.contains('disabled')) e.preventDefault();
    });
    function garmentIsAvailable(btn) {
      if (!btn) return true;
      if (btn.getAttribute('data-available') === 'false') return false;
      if (btn.getAttribute('aria-disabled') === 'true') return false;
      return true;
    }
    function updateShotNote() {
      var el = document.getElementById('shot-note');
      if (!el) return;
      if (garment === 'hoodie') {
        el.hidden = false;
        el.textContent = 'Hoodie photos still to come. The T-shirt is shown so you can see the print.';
      } else {
        el.hidden = true;
        el.textContent = '';
      }
    }
    pdp.querySelectorAll('.garment, [data-garment]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!garmentIsAvailable(b)) {
          toast('That garment isn’t available to preview yet. Photos and pricing are still to be confirmed.');
          return;
        }
        pdp.querySelectorAll('.garment, [data-garment]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        garment = b.dataset.garment || 'tee';
        renderPrice();
        updateShotNote();
      });
    });
    renderPrice();
    updateShotNote();
    update();
  }

  // Your Truck custom preview
  var form = document.getElementById('custom-form');
  if (form) {
    var sel = form.querySelector('[name=slogan]'), gar = form.querySelector('[name=garment]'), file = form.querySelector('[name=truck-photo]');
    var pvS = document.getElementById('pv-slogan'), pvP = document.getElementById('pv-photo'), pvM = document.getElementById('pv-meta'), err = document.getElementById('photo-error');
    var url;
    function meta() {
      var g = gar.options[gar.selectedIndex];
      pvS.textContent = sel.value;
      pvM.textContent = g.text + ' · photo option ' + ('+' + money(C.prices.customPhoto || 7.5)) + ' (to be confirmed)';
    }
    sel.addEventListener('change', meta); gar.addEventListener('change', meta); meta();
    file.addEventListener('change', function () {
      var f = file.files[0]; err.textContent = '';
      if (!f) return;
      if (!/^image\//.test(f.type)) { err.textContent = 'Please choose an image file (JPG, PNG or HEIC).'; file.value = ''; return; }
      if (f.size > 8 * 1024 * 1024) { err.textContent = 'That photo is over 8 MB. Please choose a smaller one.'; file.value = ''; return; }
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(f);
      pvP.innerHTML = ''; var i = new Image(); i.src = url; i.alt = 'Preview of your uploaded vehicle photo'; pvP.appendChild(i);
    });
  }

  // Year in footer
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();


  // ---------- Shared storefront tools: search, account, cart, size guide ----------
  var CATALOG = [
    { name: "FLOAT ’EM", url: "float-em.html", tag: "18-speed shift pattern" },
    { name: "check your truckin’ mates", url: "check-your-truckin-mates.html", tag: "Mental-health range, new wording" },
    { name: "9OH", url: "9oh.html", tag: "Kenworth T909" },
    { name: "Freight Shaker", url: "freight-shaker.html", tag: "Freightliner Argosy" },
    { name: "DON’T TALK TO ME MATE, I DRIVE AN AGI", url: "agi.html", tag: "International ACCO" },
    { name: "What Part Of", url: "what-part-of.html", tag: "Shift-pattern back print" },
    { name: "Dock Life", url: "dock-life.html", tag: "Dock collection concept" },
    { name: "SEND IT DOWN SESAME STREET", url: "send-it-down-sesame-street.html", tag: "Kenworth T909 B-double" },
    { name: "9OH (Cartoon Truck range)", url: "cartoon-9oh.html", tag: "Cartoon Truck range" },
    { name: "Freight Shaker (Cartoon Truck range)", url: "cartoon-freight-shaker.html", tag: "Cartoon Truck range" },
    { name: "DON’T TALK TO ME MATE, I DRIVE AN AGI (Cartoon)", url: "cartoon-agi.html", tag: "Cartoon Truck range" },
    { name: "Western Star 4800", url: "western-star-4800.html", tag: "Cartoon Truck range" },
    { name: "Western Star 4900", url: "western-star-4900.html", tag: "Cartoon Truck range" },
    { name: "Kenworth K104", url: "kenworth-k104.html", tag: "Cartoon Truck range" },
    { name: "Kenworth K108", url: "kenworth-k108.html", tag: "Cartoon Truck range" },
    { name: "Kenworth K200", url: "kenworth-k200.html", tag: "Cartoon Truck range" },
    { name: "Your Truck custom print", url: "your-truck.html", tag: "Custom photo print" },
    { name: "Custom workwear", url: "custom-workwear.html", tag: "Uniforms and workwear" }
  ];

  var CART_KEY = "tgg-preview-cart";
  var WISH_KEY = "tgg-preview-wish";

  function cartRead() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (e) { return []; }
  }
  function cartWrite(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCartCount();
    renderCartDrawer();
  }
  function cartCount() {
    return cartRead().reduce(function (n, i) { return n + (i.qty || 1); }, 0);
  }
  function renderCartCount() {
    var n = cartCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = n;
      el.hidden = false;
      el.setAttribute("data-empty", n === 0 ? "true" : "false");
    });
  }

  function toast(msg) {
    var t = document.querySelector(".tgg-toast");
    if (!t) { t = document.createElement("div"); t.className = "tgg-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._tm);
    toast._tm = setTimeout(function () { t.hidden = true; }, 2400);
  }

  function garmentLabel(g) {
    return ({ tee: "T-Shirt", hoodie: "Hoodie", singlet: "Singlet", polo: "Polo", jacket: "Jacket" })[g] || g || "T-Shirt";
  }
  function isTeeGarment(g) { return !g || g === "tee"; }
  function shirtUnitPrice(qty) {
    if (C.shirtUnitPrice) return C.shirtUnitPrice(qty);
    var single = (C.prices && C.prices.teeSingle != null) ? Number(C.prices.teeSingle) : 45;
    var multi = (C.prices && C.prices.teeMulti != null) ? Number(C.prices.teeMulti) : 40;
    qty = Number(qty) || 0;
    if (qty <= 0) return 0;
    return qty >= 2 ? multi : single;
  }
  function shirtTotal(qty) {
    if (C.shirtTotal) return C.shirtTotal(qty);
    qty = Number(qty) || 0;
    return shirtUnitPrice(qty) * qty;
  }
  function cartShirtQty(items) {
    return items.reduce(function (n, i) { return n + (isTeeGarment(i.garment) ? (i.qty || 1) : 0); }, 0);
  }
  function cartTotals(items) {
    var q = cartShirtQty(items);
    return { shirtQty: q, shirtUnit: shirtUnitPrice(q), shirtTotal: shirtTotal(q), hasNonTee: items.some(function (i) { return !isTeeGarment(i.garment); }) };
  }

  function addToCartFromPdp(pdp, opts) {
    var gBtn = pdp && pdp.querySelector('.garment[aria-pressed="true"], [data-garment][aria-pressed="true"]');
    if (gBtn && (gBtn.getAttribute("data-available") === "false" || gBtn.getAttribute("aria-disabled") === "true")) {
      toast("That garment isn’t available to preview yet.");
      return;
    }
    if (!opts.size) { toast("Choose a size first."); return; }
    var items = cartRead();
    var front = document.getElementById("pdp-img-front");
    var colourBtn = pdp.querySelector('[data-variant][aria-pressed="true"]');
    var titleEl = pdp.querySelector("[data-product-title], h1.pdp-title, h1.mates-title, h1");
    var pageTitle = (pdp.getAttribute("data-title") || (titleEl && (titleEl.getAttribute("data-title") || titleEl.textContent)) || "").replace(/\s+/g, " ").trim();
    var entry = {
      id: [opts.product, opts.variant, opts.size, opts.garment].join("|"),
      product: opts.product,
      title: pageTitle || opts.product || "Item",
      variant: opts.variant,
      label: colourBtn ? colourBtn.dataset.label : opts.variant,
      size: opts.size,
      garment: opts.garment || "tee",
      qty: 1,
      img: front ? front.src : (colourBtn && colourBtn.dataset.imgFront) || pdp.getAttribute("data-cart-img") || "",
      priceKind: isTeeGarment(opts.garment) ? "tee" : "tbc"
    };
    var found = items.filter(function (i) { return i.id === entry.id; })[0];
    if (found) found.qty += 1;
    else items.push(entry);
    cartWrite(items);
    toast("Added to cart (preview only — nothing will be charged).");
    openLayer("cart");
  }

  window.TGG = window.TGG || {};
  window.TGG.addToCartFromPdp = addToCartFromPdp;
  window.TGG.shirtUnitPrice = shirtUnitPrice;
  window.TGG.shirtTotal = shirtTotal;
  window.TGG.cartTotals = cartTotals;

  function ensureLayers() {
    if (document.getElementById("site-overlay")) return;
    var overlay = document.createElement("button");
    overlay.type = "button";
    overlay.className = "site-overlay";
    overlay.id = "site-overlay";
    overlay.hidden = true;
    overlay.setAttribute("aria-label", "Close");
    overlay.addEventListener("click", closeLayers);

    var search = document.createElement("div");
    search.className = "search-panel";
    search.id = "site-search";
    search.hidden = true;
    search.innerHTML = '<div class="inner"><label for="site-search-input" class="opt-label">Search the range</label><input id="site-search-input" type="search" placeholder="Search designs and slogans" autocomplete="off"><ul class="search-results" id="search-results"></ul></div>';

    var account = document.createElement("div");
    account.className = "pop";
    account.id = "account-pop";
    account.hidden = true;
    account.setAttribute("role", "dialog");
    account.setAttribute("aria-label", "Account");
    account.innerHTML = '<p><strong>Accounts aren’t open yet.</strong></p><p>This is a storefront preview, so there’s no sign-in or account page yet. If you need to reach us, send a message.</p><a class="button" href="contact.html">Contact</a>';

    var cart = document.createElement("aside");
    cart.className = "cart-drawer";
    cart.id = "site-cart";
    cart.hidden = true;
    cart.setAttribute("role", "dialog");
    cart.setAttribute("aria-label", "Cart");
    cart.innerHTML = '<h2>Your cart</h2><div class="cart-items" id="cart-items"></div><div class="cart-foot"><p class="cart-total" id="cart-total" hidden></p><p class="small" id="cart-note">Shirt rate, pending costs: $45 for one, or $40 each for two or more. Preview cart only. Orders aren’t open and nothing will be charged.</p><button type="button" class="button add-cart" id="cart-checkout" disabled>Checkout — coming soon</button><button type="button" class="button outline" id="cart-close" style="margin-top:8px;width:100%">Keep looking</button></div>';

    var modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "size-guide-modal";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "size-guide-title");
    modal.innerHTML = '<div class="modal-card"><button type="button" class="tool-btn modal-close" data-close aria-label="Close size guide"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button><h2 id="size-guide-title">Size guide</h2><p>A full size chart will be added once the garment blanks are chosen. Sizes shown on this page run from S to 7XL and are planned only — availability is still to be confirmed.</p><p>Larger-size shirts are planned to be about 10&nbsp;cm longer in <strong>length only</strong> than the standard length for that size. The cutoff for which sizes this applies to has not been set yet, and the measurements still need supplier confirmation. Width is not covered by this note.</p><p class="small">Until then, treat the size you pick as a preference on a preview request, not a finished measurement chart.</p></div>';

    var header = document.querySelector(".site-header");
    if (header) header.appendChild(search);
    document.body.appendChild(overlay);
    if (header) header.appendChild(account);
    document.body.appendChild(cart);
    document.body.appendChild(modal);

    var input = document.getElementById("site-search-input");
    if (input) input.addEventListener("input", function () { renderSearch(input.value); });
    var closeCart = document.getElementById("cart-close");
    if (closeCart) closeCart.addEventListener("click", closeLayers);
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.closest("[data-close]")) closeLayers();
    });
  }

  function renderSearch(q) {
    var box = document.getElementById("search-results");
    if (!box) return;
    q = (q || "").trim().toLowerCase();
    var hits = !q ? CATALOG.slice(0, 8) : CATALOG.filter(function (i) {
      return (i.name + " " + i.tag).toLowerCase().indexOf(q) > -1;
    });
    if (!hits.length) { box.innerHTML = "<li class=small>No matching designs.</li>"; return; }
    box.innerHTML = hits.map(function (i) {
      return '<li><a href="' + i.url + '">' + i.name + '<small>' + i.tag + "</small></a></li>";
    }).join("");
  }

  function renderCartDrawer() {
    var box = document.getElementById("cart-items");
    if (!box) return;
    var items = cartRead();
    if (!items.length) {
      box.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      var emptyTotal = document.getElementById("cart-total");
      var emptyNote = document.getElementById("cart-note");
      if (emptyTotal) { emptyTotal.hidden = true; emptyTotal.textContent = ""; }
      if (emptyNote) emptyNote.textContent = "Shirt rate, pending costs: $45 for one, or $40 each for two or more. Preview cart only. Orders aren’t open and nothing will be charged.";
      return;
    }
    var totals = cartTotals(items);
    box.innerHTML = items.map(function (i, idx) {
      var linePrice, unitNote;
      if (isTeeGarment(i.garment)) {
        unitNote = money(totals.shirtUnit) + " AUD each";
        linePrice = money(totals.shirtUnit * (i.qty || 1)) + " AUD";
      } else {
        unitNote = "Price to be confirmed";
        linePrice = "TBC";
      }
      var meta = [garmentLabel(i.garment), i.label, i.size ? ("Size " + i.size) : ""].filter(Boolean).join(" · ");
      return '<div class="cart-line"><img src="' + (i.img || "assets/img/float-em-black-blue-main-sm.jpg") + '" alt="">' +
        "<div><strong>" + (i.title || "Item") + "</strong><p>" + meta + "</p><p>" + unitNote + "</p></div>" +
        '<div><p>x' + i.qty + "</p><p>" + linePrice + '</p><button type="button" class="tool-btn" data-remove="' + idx + '" aria-label="Remove">×</button></div></div>';
    }).join("");
    box.querySelectorAll("[data-remove]").forEach(function (b) {
      b.addEventListener("click", function () {
        var items = cartRead();
        items.splice(Number(b.dataset.remove), 1);
        cartWrite(items);
      });
    });
    var note = document.getElementById("cart-note");
    var totalEl = document.getElementById("cart-total");
    if (note) {
      note.innerHTML = "Shirt rate, pending costs: $45 for one, or $40 each for two or more." +
        (totals.hasNonTee ? " Hoodie or other garment prices are still to be confirmed and are not included in the shirt total." : "") +
        " Preview cart only. Orders aren’t open and nothing will be charged.";
    }
    if (totalEl) {
      totalEl.hidden = false;
      totalEl.textContent = "Shirt total: " + money(totals.shirtTotal) + " AUD";
    }
  }

  function closeLayers() {
    ["site-search", "account-pop", "site-cart", "size-guide-modal", "site-overlay"].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.hidden = true;
    });
    document.querySelectorAll(".tool-btn[aria-expanded]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    document.body.style.overflow = "";
  }
  function openLayer(name) {
    ensureLayers();
    closeLayers();
    var map = { search: "site-search", account: "account-pop", cart: "site-cart", size: "size-guide-modal" };
    var el = document.getElementById(map[name]);
    var overlay = document.getElementById("site-overlay");
    if (!el) return;
    el.hidden = false;
    if (overlay && name !== "search" && name !== "account") overlay.hidden = false;
    if (name === "search" || name === "account") { /* panel sits in the header */ }
    else { document.body.style.overflow = "hidden"; }
    if (name === "search") {
      renderSearch("");
      var input = document.getElementById("site-search-input");
      if (input) setTimeout(function () { input.focus(); }, 20);
    }
    if (name === "cart") renderCartDrawer();
    var btn = document.querySelector('[data-open="' + name + '"]');
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  document.addEventListener("click", function (e) {
    var open = e.target.closest("[data-open]");
    if (open) {
      e.preventDefault();
      var name = open.getAttribute("data-open");
      var elMap = { search: "site-search", account: "account-pop", cart: "site-cart", size: "size-guide-modal" };
      var el = document.getElementById(elMap[name]);
      if (el && !el.hidden && open.getAttribute("aria-expanded") === "true") closeLayers();
      else openLayer(name);
      return;
    }
    if (e.target.closest(".search-panel") || e.target.closest("#account-pop") || e.target.closest(".cart-drawer") || e.target.closest(".modal-card")) return;
    if (e.target.closest(".header-tools")) return;
    var search = document.getElementById("site-search");
    var acc = document.getElementById("account-pop");
    if (search && !search.hidden && !e.target.closest(".search-panel")) closeLayers();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLayers(); });

  var wishBtn = document.querySelector(".wish-btn");
  if (wishBtn) {
    var wishProduct = (document.querySelector(".pdp[data-product]") || {}).dataset;
    var wishKey = WISH_KEY + ":" + ((wishProduct && wishProduct.product) || "float-em");
    var wished = false;
    try { wished = localStorage.getItem(wishKey) === "1"; } catch (e) {}
    wishBtn.setAttribute("aria-pressed", wished);
    wishBtn.addEventListener("click", function () {
      var on = wishBtn.getAttribute("aria-pressed") !== "true";
      wishBtn.setAttribute("aria-pressed", on);
      try { localStorage.setItem(wishKey, on ? "1" : "0"); } catch (e) {}
    });
  }

  document.querySelectorAll(".thumb-nav").forEach(function (b) {
    b.addEventListener("click", function () {
      var scroller = document.querySelector(".pdp-thumbs-list") || document.querySelector(".pdp-thumbs");
      if (!scroller) return;
      scroller.scrollBy({ top: b.dataset.dir === "up" ? -120 : 120, behavior: "smooth" });
    });
  });

  ensureLayers();
  renderCartCount();

  // Register the PWA service worker on https or localhost only
  if ('serviceWorker' in navigator) {
    var host = location.hostname;
    var isLocal = host === 'localhost' || host === '127.0.0.1';
    if (location.protocol === 'https:' || isLocal) {
      navigator.serviceWorker.register('./sw.js').catch(function () { /* ignore file:// and preview failures */ });
    }
  }
})();
