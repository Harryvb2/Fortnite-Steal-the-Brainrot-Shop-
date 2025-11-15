// script.js - unified shop + bundles + cart + checkout logic
// PayPal email: s.mooij2011@gmail.com

// --- DATA ---
const PRODUCTS = {
  dul: { id:'dul', name:'Dul Dul Dul (NEON)', price:40 },
  tualetti: { id:'tualetti', name:'Spaghetti Tualetti (LIGHTNING TRAIT)', price:30 },
  chic1: { id:'chic1', name:'Chicleteira Bicicleteira (HALLOWEEN)', price:20 },
  chic2: { id:'chic2', name:'Chicleteira Bicicleteira (HALLOWEEN)', price:20 },
  grande: { id:'grande', name:'La Grande Combinacion (HALLOWEEN)', price:10 }
};

const BUNDLES = {
  bundle1: { id:'bundle1', name:'Bundle 1', price:95, items:['dul','tualetti','chic1','chic2','grande'] },
  bundle2: { id:'bundle2', name:'Bundle 2', price:45, items:['dul','chic1','chic2'] },
  bundle3: { id:'bundle3', name:'Bundle 3', price:45, items:['grande','chic1','chic2','tualetti'] }
};

// state
let soldProducts = { dul:false, tualetti:false, chic1:false, chic2:false, grande:false };
let soldBundles = { bundle1:false, bundle2:false, bundle3:false };
let chicSoldCount = 0;

let cart = [];
let totalPrice = 0;

// helpers
function q(id){ return document.getElementById(id); }
function showNotification(msg){ const n = q('cart-notification'); if(!n) return; n.textContent = msg; n.classList.add('show'); setTimeout(()=>n.classList.remove('show'),1600); }
function disableButton(id, text='Sold Out'){ const b = q(id); if(b){ b.disabled=true; b.textContent = text; b.classList.add('disabled'); } }
function enableButton(id, text='Add to cart'){ const b = q(id); if(b){ b.disabled=false; b.textContent = text; b.classList.remove('disabled'); } }
function showSoldBadge(wrapperId){ const w = q(wrapperId); if(!w) return; let badge = w.querySelector('.sold-out'); if(!badge){ badge = document.createElement('div'); badge.className='sold-out'; badge.textContent='Sold Out'; w.appendChild(badge); } badge.style.display='block'; }
function hideSoldBadge(wrapperId){ const w = q(wrapperId); if(!w) return; const badge = w.querySelector('.sold-out'); if(badge) badge.style.display='none'; }

// cart UI
function updateCartUI(){
  const ul = q('cart-items'); if(!ul) return;
  ul.innerHTML = '';
  cart.forEach(it => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `<span>${it.name}</span> <span>£${it.price.toFixed(2)}</span> <button class="remove-btn" onclick="removeFromCart('${it.id}')">Remove</button>`;
    ul.appendChild(li);
  });
  const totalEl = q('cart-total'); if(totalEl) totalEl.textContent = `Total: £${totalPrice.toFixed(2)}`;
}

// add/remove
function addProductToCart(pid){
  if(soldProducts[pid]){ showNotification('This item is sold out'); return; }
  if(cart.find(i=>i.id===pid)){ showNotification('Already in cart'); return; }
  const p = PRODUCTS[pid];
  cart.push({ id:pid, name:p.name, price:p.price, type:'product' });
  totalPrice += p.price;
  updateCartUI();
  const btn = q('add-' + pid); if(btn){ btn.disabled=true; btn.textContent='Added'; btn.classList.add('disabled'); }
  showNotification(p.name + ' added to cart');
}
function addBundleToCart(bid){
  if(soldBundles[bid]){ showNotification('This bundle is sold out'); return; }
  if(cart.find(i=>i.id===bid)){ showNotification('Already in cart'); return; }
  const b = BUNDLES[bid];
  cart.push({ id:bid, name:b.name, price:b.price, type:'bundle' });
  totalPrice += b.price;
  updateCartUI();
  const btn = q('add-' + bid); if(btn){ btn.disabled=true; btn.textContent='Added'; btn.classList.add('disabled'); }
  showNotification(b.name + ' added to cart');
}
function removeFromCart(id){
  const idx = cart.findIndex(i=>i.id===id); if(idx===-1) return;
  totalPrice -= cart[idx].price;
  const removed = cart[idx];
  cart.splice(idx,1);
  updateCartUI();
  // re-enable button only if not sold
  if(removed.type === 'product'){
    if(!soldProducts[removed.id]) enableButton('add-' + removed.id,'Add to cart');
  } else {
    if(!soldBundles[removed.id]) enableButton('add-' + removed.id,'Add to cart');
  }
  showNotification(removed.name + ' removed');
}

// marking sold and rules
function markProductSold(pid){
  if(soldProducts[pid]) return;
  soldProducts[pid] = true;
  disableButton('add-' + pid, 'Sold Out');
  showSoldBadge('prod-' + pid);
  // chic logic
  if(pid === 'chic1' || pid === 'chic2'){ chicSoldCount++; }
}
function markBundleSold(bid){
  if(soldBundles[bid]) return;
  soldBundles[bid] = true;
  disableButton('add-' + bid, 'Sold Out');
  showSoldBadge('prod-' + bid);
}

// apply rules after successful purchase
function processSoldItemsFromCart(){
  const purchasedProducts = cart.filter(i=>i.type==='product').map(i=>i.id);
  const purchasedBundles = cart.filter(i=>i.type==='bundle').map(i=>i.id);

  // bundles first
  purchasedBundles.forEach(bid => {
    markBundleSold(bid);
    if(bid === 'bundle1'){
      // bundle1 bought -> all loose items and all bundles sold out
      Object.keys(PRODUCTS).forEach(pid => markProductSold(pid));
      Object.keys(BUNDLES).forEach(bid2 => markBundleSold(bid2));
    }
    if(bid === 'bundle2'){
      // bundle2 bought -> dul + all chic sold
      markProductSold('dul');
      markProductSold('chic1');
      markProductSold('chic2');
      // note: bundle2 itself already marked sold
    }
    if(bid === 'bundle3'){
      // bundle3 bought -> grande, tualetti, all chic sold
      markProductSold('grande');
      markProductSold('tualetti');
      markProductSold('chic1');
      markProductSold('chic2');
    }
  });

  // products next
  purchasedProducts.forEach(pid => {
    markProductSold(pid);
    if(pid === 'grande'){
      markBundleSold('bundle1');
      markBundleSold('bundle3');
    }
    if(pid === 'tualetti'){
      markBundleSold('bundle1');
      markBundleSold('bundle3');
    }
    if(pid === 'dul'){
      markBundleSold('bundle1');
      markBundleSold('bundle2');
    }
    if(pid === 'chic1' || pid === 'chic2'){
      if(chicSoldCount >= 2){
        Object.keys(BUNDLES).forEach(bid => markBundleSold(bid));
      }
    }
  });

  // conflict locks
  if(soldBundles.bundle1 && soldBundles.bundle2) markBundleSold('bundle3');
  if(soldBundles.bundle2 && soldBundles.bundle3) markBundleSold('bundle1');
  if(soldBundles.bundle1 && soldBundles.bundle3) markBundleSold('bundle2');

  // final UI sync
  refreshAllUI();
}

// refresh UI according to sold state and cart
function refreshAllUI(){
  Object.keys(PRODUCTS).forEach(pid => {
    if(soldProducts[pid]){
      disableButton('add-' + pid, 'Sold Out');
      showSoldBadge('prod-' + pid);
    } else {
      const inCart = cart.find(i=>i.id===pid);
      if(inCart){ const btn = q('add-' + pid); if(btn){ btn.disabled=true; btn.textContent='Added'; btn.classList.add('disabled'); } }
      else { enableButton('add-' + pid, 'Add to cart'); hideSoldBadge('prod-' + pid); }
    }
  });

  Object.keys(BUNDLES).forEach(bid => {
    if(soldBundles[bid]){
      disableButton('add-' + bid,'Sold Out');
      showSoldBadge('prod-' + bid);
    } else {
      const inCart = cart.find(i=>i.id===bid);
      if(inCart){ const btn = q('add-' + bid); if(btn){ btn.disabled=true; btn.textContent='Added'; btn.classList.add('disabled'); } }
      else { enableButton('add-' + bid,'Add to cart'); hideSoldBadge('prod-' + bid); }
    }
  });

  updateCartUI();
}

// checkout & payment
function checkout(){
  if(cart.length === 0){ showNotification('Your cart is empty!'); return; }
  const modal = q('checkoutModal'); const list = q('checkout-items'); const total = q('checkout-total');
  if(!modal || !list || !total) return;
  list.innerHTML = '';
  cart.forEach(it => { const li = document.createElement('li'); li.textContent = `${it.name} — £${it.price.toFixed(2)}`; list.appendChild(li); });
  total.textContent = `Total: £${totalPrice.toFixed(2)}`;
  modal.style.display = 'flex';
}
function closeCheckout(){ const modal = q('checkoutModal'); if(modal) modal.style.display = 'none'; }

function proceedToPay(){
  if(cart.length === 0){ showNotification('Cart empty'); closeCheckout(); return; }
  // Build form to PayPal
  const form = document.createElement('form'); form.method='post'; form.target='_blank'; form.action='https://www.paypal.com/cgi-bin/webscr';
  form.appendChild(hiddenInput('cmd','_xclick'));
  form.appendChild(hiddenInput('business','s.mooij2011@gmail.com'));
  form.appendChild(hiddenInput('item_name', cart.map(i=>i.name).join(', ')));
  form.appendChild(hiddenInput('amount', totalPrice.toFixed(2)));
  form.appendChild(hiddenInput('currency_code','GBP'));
  document.body.appendChild(form); form.submit(); document.body.removeChild(form);

  // simulate success -> apply sold rules
  processSoldItemsFromCart();

  // clear cart
  cart = []; totalPrice = 0; updateCartUI(); refreshAllUI();

  // show post modal
  const post = q('postModal'); if(post) post.style.display = 'flex';
}
function closePost(){ const post = q('postModal'); if(post) post.style.display = 'none'; }

function hiddenInput(name,value){ const i = document.createElement('input'); i.type='hidden'; i.name=name; i.value=value; return i; }

// init bindings
function initBindings(){
  // product buttons
  Object.keys(PRODUCTS).forEach(pid => {
    const btn = q('add-' + pid); if(btn) btn.addEventListener('click', ()=>addProductToCart(pid));
  });
  // bundle buttons
  Object.keys(BUNDLES).forEach(bid => {
    const btn = q('add-' + bid); if(btn) btn.addEventListener('click', ()=>addBundleToCart(bid));
  });
  // ensure nav active highlight matches pathname (fallback)
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if(href && location.pathname.endsWith(href)) {
      document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
      link.classList.add('active');
    }
  });

  refreshAllUI();
}

// close modals clicking outside
window.addEventListener('click', (e) => {
  const cm = q('checkoutModal'); const pm = q('postModal');
  if(cm && e.target === cm) closeCheckout();
  if(pm && e.target === pm) closePost();
});

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBindings);
else initBindings();



