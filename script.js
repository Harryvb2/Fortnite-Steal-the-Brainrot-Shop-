const products = [
  { name: "Dul Dul Dul (NEON)", price: 40, img: "dul-dul-dul.png" },
  { name: "Spaghetti Tualetti (LIGHTNING TRAIT)", price: 30, img: "tualetti.png" },
  { name: "Chicleteira Bicicleteira (HALLOWEEN)", price: 20, img: "chicleteira.png" },
  { name: "La Grande Combinacion (HALLOWEEN)", price: 10, img: "La-grande.png" }
];

const soldOut = JSON.parse(localStorage.getItem("soldOut")) || [];
let cart = [];

const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const checkoutBtn = document.getElementById("checkout");
const modal = document.getElementById("review-modal");
const reviewList = document.getElementById("review-list");
const reviewTotal = document.getElementById("review-total");
const cancelReview = document.getElementById("cancel-review");
const confirmBuy = document.getElementById("confirm-buy");

function renderProducts() {
  if (!productList) return;
  productList.innerHTML = "";
  products.forEach(p => {
    const isSold = soldOut.includes(p.name);
    const div = document.createElement("div");
    div.classList.add("product");
    if (isSold) div.classList.add("sold-out");
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>£${p.price}</p>
      <button ${isSold ? "disabled" : ""} class="btn add-btn" data-name="${p.name}">Add to Cart</button>
    `;
    productList.appendChild(div);
  });
}

function updateCart() {
  if (!cartItems) return;
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((item, i) => {
    total += item.price;
    const li = document.createElement("li");
    li.textContent = `${item.name} - £${item.price}`;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.classList.add("remove-btn");
    removeBtn.onclick = () => removeFromCart(i);
    li.appendChild(removeBtn);
    cartItems.appendChild(li);
  });
  totalPriceElement.textContent = `Total: £${total}`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function handleAddToCart(e) {
  if (!e.target.classList.contains("add-btn")) return;
  const name = e.target.dataset.name;
  const product = products.find(p => p.name === name);
  cart.push(product);
  updateCart();
}

function openReviewModal() {
  if (cart.length === 0) return alert("Your cart is empty!");
  reviewList.innerHTML = "";
  let total = 0;
  cart.forEach(p => {
    total += p.price;
    const li = document.createElement("li");
    li.textContent = `${p.name} - £${p.price}`;
    reviewList.appendChild(li);
  });
  reviewTotal.textContent = `Total: £${total}`;
  modal.classList.remove("hidden");
}

function confirmPurchase() {
  const total = cart.reduce((sum, p) => sum + p.price, 0);
  alert(`Redirecting to PayPal... Total: £${total}`);
  const email = "s.mooij2011@gmail.com";
  window.open(`https://www.paypal.com/paypalme/${email}/${total}`, "_blank");
  cart.forEach(item => soldOut.push(item.name));
  localStorage.setItem("soldOut", JSON.stringify(soldOut));
  cart = [];
  updateCart();
  renderProducts();
  modal.classList.add("hidden");
  alert("Thank you for your purchase! Please open a ticket in our Discord to claim your Brainrots.");
}

if (productList) {
  productList.addEventListener("click", handleAddToCart);
  checkoutBtn.addEventListener("click", openReviewModal);
  cancelReview.addEventListener("click", () => modal.classList.add("hidden"));
  confirmBuy.addEventListener("click", confirmPurchase);
  renderProducts();
}


