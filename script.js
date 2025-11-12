// script.js - Cart logic, sold-out, notifications, checkout (PayPal + credit card)

let cart = [];
let totalPrice = 0;

// Add to cart function
function addToCart(id, name, price) {
  const exists = cart.find(item => item.id === id);
  if (exists) {
    showNotification(`${name} is already in your cart.`);
    return;
  }

  cart.push({ id, name, price });
  totalPrice += price;
  updateCartUI();

  const btn = document.getElementById('add-' + id);
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Added';
    btn.classList.add('disabled');
    const sold = btn.nextElementSibling;
    if (sold && sold.classList.contains('sold-out')) sold.style.display = 'block';
  }

  showNotification(`${name} added to cart`);
}

// Remove from cart
function removeFromCart(id) {
  const index = cart.findIndex(item => item.id === id);
  if (index === -1) return;

  totalPrice -= cart[index].price;
  const removedItem = cart[index].name;
  cart.splice(index, 1);
  updateCartUI();

  const btn = document.getElementById('add-' + id);
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Add to cart';
    btn.classList.remove('disabled');
    const sold = btn.nextElementSibling;
    if (sold && sold.classList.contains('sold-out')) sold.style.display = 'none';
  }

  showNotification(`${removedItem} removed from cart`);
}

// Update cart UI
function updateCartUI() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  if (!cartItems) return;

  cartItems.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <span>${item.name}</span>
      <span>£${item.price.toFixed(2)}</span>
      <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
    `;
    cartItems.appendChild(li);
  });

  if (cartTotal) cartTotal.textContent = `Total: £${totalPrice.toFixed(2)}`;
}

// Show notification
function showNotification(message) {
  const notif = document.getElementById('cart-notification');
  notif.textContent = message;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 1800);
}

// Checkout modal
function checkout() {
  if (cart.length === 0) {
    showNotification('Cart is empty!');
    return;
  }

  const modal = document.getElementById('checkoutModal');
  const checkoutItems = document.getElementById('checkout-items');
  const checkoutTotal = document.getElementById('checkout-total');

  checkoutItems.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} — £${item.price.toFixed(2)}`;
    checkoutItems.appendChild(li);
  });

  checkoutTotal.textContent = `Total: £${totalPrice.toFixed(2)}`;
  modal.style.display = 'flex';
}

// Close checkout modal
function closeCheckout() {
  document.getElementById('checkoutModal').style.display = 'none';
}

// Post-purchase modal
function showPostPurchase() {
  const modal = document.getElementById('postModal');
  modal.style.display = 'flex';

  cart = [];
  totalPrice = 0;
  updateCartUI();

  const addBtns = document.querySelectorAll('.add-btn');
  addBtns.forEach(b => {
    b.disabled = false;
    b.textContent = 'Add to cart';
    b.classList.remove('disabled');
    const sold = b.nextElementSibling;
    if (sold && sold.classList.contains('sold-out')) sold.style.display = 'none';
  });
}

function closePost() {
  document.getElementById('postModal').style.display = 'none';
}

// Proceed to payment (PayPal / Credit card)
function proceedToPay() {
  if (cart.length === 0) {
    showNotification('Cart is empty!');
    closeCheckout();
    return;
  }

  const form = document.createElement('form');
  form.action = 'https://www.paypal.com/cgi-bin/webscr';
  form.method = 'post';
  form.target = '_blank';

  form.appendChild(hiddenInput('cmd', '_xclick'));
  form.appendChild(hiddenInput('business', 's.mooij2011@gmail.com'));
  form.appendChild(hiddenInput('item_name', cart.map(i => i.name).join(', ')));
  form.appendChild(hiddenInput('amount', totalPrice.toFixed(2)));
  form.appendChild(hiddenInput('currency_code', 'GBP'));

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  closeCheckout();
  showPostPurchase();
}

// Helper hidden input
function hiddenInput(name, value) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
}

// Close modal by clicking outside
window.addEventListener('click', (e) => {
  const checkoutModal = document.getElementById('checkoutModal');
  const postModal = document.getElementById('postModal');
  if (e.target === checkoutModal) closeCheckout();
  if (e.target === postModal) closePost();
});



