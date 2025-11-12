let cart = [];
let total = 0;

// product bought tracker
let boughtProducts = JSON.parse(localStorage.getItem('bought')) || {};

function updateSoldOut(id){
  const btn = document.getElementById("btn-" + id);
  const sold = document.getElementById("sold-" + id);
  if(boughtProducts[id]){
    if(btn) btn.disabled = true;
    if(sold) sold.style.display = "inline-block";
  } else {
    if(btn) btn.disabled = false;
    if(sold) sold.style.display = "none";
  }
}

function addToCart(id,name,price){
  if(boughtProducts[id]){
    alert("This product is sold out.");
    return;
  }
  const exists = cart.find(p=>p.id===id);
  if(exists){
    alert("Already in cart");
    return;
  }
  cart.push({id,name,price});
  total+=price;
  updateSoldOut(id);
  alert(`${name} added to cart!`);
}

function checkoutCart(){
  if(cart.length===0){ alert("Cart empty"); return;}
  // Open PayPal
  const form = document.createElement('form');
  form.action = "https://www.paypal.com/cgi-bin/webscr";
  form.method="post";
  form.target="_blank";

  form.appendChild(hiddenInput('cmd','_xclick'));
  form.appendChild(hiddenInput('business','s.mooij2011@gmail.com'));
  form.appendChild(hiddenInput('item_name',cart.map(p=>p.name).join(', ')));
  form.appendChild(hiddenInput('amount',total.toFixed(2)));
  form.appendChild(hiddenInput('currency_code','GBP'));

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  // mark bought
  cart.forEach(p=>boughtProducts[p.id]=true);
  localStorage.setItem('bought',JSON.stringify(boughtProducts));
  cart=[];
  total=0;
  alert("Payment window opened. Claim your items in Discord!");
  // reload to update sold out
  location.reload();
}

function hiddenInput(name,value){
  const inp=document.createElement('input');
  inp.type='hidden';
  inp.name=name;
  inp.value=value;
  return inp;
}

// initialize sold out
['dul','tualetti','chic1','chic2','grande'].forEach(id=>updateSoldOut(id));



