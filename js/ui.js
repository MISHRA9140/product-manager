import { formatPrice } from "./utils.js";

const list = document.getElementById("product-list");
const template = document.getElementById("product-card-template");
const toastContainer = document.getElementById("toast-container");

/* ---------- Products ---------- */

export function renderProducts(products) {
  list.innerHTML = "";

  if (products.length === 0) {
    list.innerHTML =
      '<p class="empty">No products match your filters. Try clearing the search.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  products.forEach((product) => {
    const card = template.content.cloneNode(true);

    card.querySelector(".card").dataset.id = product.id;
    card.querySelector(".tag").textContent = product.category;
    card.querySelector(".card-title").textContent = product.name;
    card.querySelector(".card-price").textContent = formatPrice(product.price);

    if (product.image) {
      const img = document.createElement("img");
      img.src = product.image;
      img.alt = product.name;
      img.loading = "lazy";
      card.querySelector(".card-img").appendChild(img);
    }

    fragment.appendChild(card);
  });

  list.appendChild(fragment);
}

/* ---------- Toast ---------- */

export function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = "toast" + (isError ? " is-error" : "");
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

/* ---------- Cart ---------- */

const cartList = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const drawer = document.getElementById("cart-drawer");
const overlay = document.getElementById("overlay");

function createButton(text, action, className, label) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = className;
  btn.textContent = text;
  btn.dataset.action = action;
  if (label) btn.setAttribute("aria-label", label);
  return btn;
}

export function renderCart(items, total, count) {
  cartList.innerHTML = "";
  cartCount.textContent = count;
  cartTotal.textContent = formatPrice(total);
  cartEmpty.hidden = items.length > 0;

  const fragment = document.createDocumentFragment();

  items.forEach(({ product, qty }) => {
    const row = document.createElement("li");
    row.className = "cart-row";
    row.dataset.id = product.id;

    const info = document.createElement("div");
    info.className = "cart-info";
    const name = document.createElement("strong");
    name.textContent = product.name;
    const line = document.createElement("span");
    line.textContent = `${formatPrice(product.price)} × ${qty} = ${formatPrice(
      Math.round(product.price * qty * 100) / 100
    )}`;
    info.append(name, line);

    const controls = document.createElement("div");
    controls.className = "qty";
    const value = document.createElement("span");
    value.className = "qty-value";
    value.textContent = qty;
    controls.append(
      createButton("−", "decrease", "btn btn-ghost", "Decrease quantity"),
      value,
      createButton("+", "increase", "btn btn-ghost", "Increase quantity")
    );

    row.append(info, controls, createButton("Remove", "remove", "btn btn-danger"));
    fragment.appendChild(row);
  });

  cartList.appendChild(fragment);
}

export function openCart() {
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
}

export function closeCart() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
}