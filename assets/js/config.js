/* =====================================================================
   TRUCKIN' GOOD GEAR — SHOP CONFIG (the ONE place to edit)
   ---------------------------------------------------------------------
   1. Prices below are INDICATIVE ONLY (to be confirmed). Change them here.
   2. When Stripe is set up, paste each Stripe Payment Link URL against
      the product (and colourway) and size, e.g.
         '9oh': { S: 'https://buy.stripe.com/abc123', M: '...', ... }
   3. Then set ordersOpen: true. Until then every buy button shows
      "Coming soon" and nothing can be purchased.
   A size with an empty '' link stays "Coming soon" even when orders open.
   4. Cartoon Truck art paths are in cartoonArt below. An empty '' path shows
      an "Artwork coming soon" tile; paste a path to swap the art in.
   ===================================================================== */
window.TGG_CONFIG = {
  ordersOpen: false,
  currency: 'AUD',
  prices: {            // provisional, pending costs — not final
    teeSingle: 45,     // one shirt
    teeMulti: 40,      // each, when buying two or more shirts
    tee: 40,           // listing “from” price (volume rate)
    // hoodie: no confirmed price — do not display a made-up figure
    customPhoto: 7.5   // surcharge for a customer photo print, TBC
  },
  /* Shirt volume rate: $45 for one, $40 each for two or more. Pending costs. */
  shirtUnitPrice: function (qty) {
    var p = this.prices || {};
    var single = p.teeSingle != null ? Number(p.teeSingle) : 45;
    var multi = p.teeMulti != null ? Number(p.teeMulti) : 40;
    qty = Number(qty) || 0;
    if (qty <= 0) return 0;
    return qty >= 2 ? multi : single;
  },
  shirtTotal: function (qty) {
    qty = Number(qty) || 0;
    return this.shirtUnitPrice(qty) * qty;
  },
  /* CARTOON-ART-START: image path per Cartoon Truck design. Empty = "Artwork coming soon" tile.
     To swap in new art: put the image in assets/img/cartoon/ and paste its path here. */
  cartoonArt: {
    'cartoon-9oh': '',
    'cartoon-freight-shaker': '',
    'cartoon-agi': '',
    'western-star-4800': '',
    'western-star-4900': '',
    'kenworth-k104': '',
    'kenworth-k108': '',
    'kenworth-k200': '',
    'send-it-down-sesame-street': 'assets/img/cartoon/send-it-down-sesame-street.jpg'
  },
  /* CARTOON-ART-END */
  sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  paymentLinks: {
    '9oh':                       { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'freight-shaker':            { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'agi':                       { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'cartoon-9oh':               { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'cartoon-freight-shaker':    { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'cartoon-agi':               { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'western-star-4800':          { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'western-star-4900':          { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'kenworth-k104':              { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'kenworth-k108':              { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'kenworth-k200':              { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'send-it-down-sesame-street': { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'float-em/black-blue':       { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'float-em/white-blue':       { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'float-em/black-green':      { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'float-em/white-purple':     { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'float-em/black-yellow':     { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'float-em/blue-white':       { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'what-part-of/white':        { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'what-part-of/blue':         { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'what-part-of/red':          { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'what-part-of/purple':       { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'what-part-of/teal':         { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'dock-life':                 { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    'check-your-truckin-mates':    { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' },
    // old id kept as an alias so earlier preview-cart items still work
    'remember-your-truckin-mates': { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '' }
  }
};
