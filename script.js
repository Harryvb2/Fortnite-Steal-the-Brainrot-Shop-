let cart = [];
let totalPrice = 0;

function showNotification(message){
    let notif = document.createElement('div');
    notif.className = 'cart-notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(()=>{ notif.classList.add('show'); }, 10);
    setTimeout(()=>{
        notif.classList.remove('show');
        setTimeout(()=>document.body.removeChild(notif),300);
    }, 2500);
}

function addToCart(id,name,price){
    const exists = cart.find(item=>item.id===id);
    if(exists){ showNotification(`${name} is already in your cart.`); return; }
    cart.push({id,name,price});
    totalPrice+=price;
    updateCart();
    const btn = document.getElementById('add-'+id);
    if(btn){ btn.disabled=true; btn.textContent='Added'; btn.classList.add('disabled'); }
    showNotification(`${name} added to cart!`);
}

function removeFromCart(id){
    const idx = cart.findIndex(item=>item.id===id);
    if(idx===-1) return;
    totalPrice-=cart[idx].price;
    cart.splice(idx,1);
    updateCart();
    const btn = document.getElementById('add-'+id);
    if(btn){ btn.disabled=false; btn.textContent='Add to cart'; btn.classList.remove('disabled'); }
    showNotification(`Item removed from cart.`);
}

function updateCart(){
    const cartList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if(!cartList) return;
    cartList.innerHTML='';
    if(cart.length===0){ cartList.innerHTML='<li>Your cart is empty.</li>'; }
    else{
        cart.forEach(i=>{
            const li=document.createElement('li');
            li.className='cart-item';
            li.innerHTML=`<span class="cart-name">${i.name}</span>
            <span class="cart-price">£${i.price}</span>
            <button class="remove-btn" onclick="removeFromCart('${i.id}')">Remove</button>`;
            cartList.appendChild(li);
        });
    }
    if(cartTotal) cartTotal.textContent=`Total: £${totalPrice.toFixed(2)}`;
}

function goToCheckout(){
    localStorage.setItem('cart',JSON.stringify(cart));
    localStorage.setItem('totalPrice',totalPrice);
    window.location.href='checkout.html';
}
