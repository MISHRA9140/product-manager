import { getProducts, createProduct, updateProduct, deleteProduct } from "./api.js";
import { renderProducts, showToast, renderCart, openCart, closeCart } from "./ui.js";
import { sampleProducts } from "./data.js";
import { debounce, throttle, withTimeout } from "./utils.js";
import { validateProduct } from "./validators.js";
import { createCart } from "./cart.js";

let allProducts = [];
const cart = createCart();
 // loads saved cart from LocalStorage
const filters = { search: "", category: "all", sort: "default" };

/* ---------- Search, filter, sort ---------- */

function applyFilters() {
  let result = allProducts.filter((p) =>
    p.name.toLowerCase().includes(filters.search.toLowerCase())
  );

  if (filters.category !== "all") {
    result = result.filter((p) => p.category === filters.category);
  }

  // [...result] makes a copy so the original array is not changed
  switch (filters.sort) {
    case "price-asc":
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  renderProducts(result);
}

function fillCategories() {
  const select = document.getElementById("category-filter");
  const current = select.value;
  select.innerHTML = '<option value="all">All categories</option>';

  const categories = new Set(allProducts.map((p) => p.category)); // unique values
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // keep the selection if that category still exists
  select.value = categories.has(current) ? current : "all";
  filters.category = select.value;
}

function setupControls() {
  const searchInput = document.getElementById("search-input");
  const categorySelect = document.getElementById("category-filter");
  const sortSelect = document.getElementById("sort-select");

  searchInput.addEventListener(
    "input",
    debounce((e) => {
      filters.search = e.target.value;
      applyFilters();
    }, 300)
  );

  categorySelect.addEventListener("change", (e) => {
    filters.category = e.target.value;
    applyFilters();
  });

  sortSelect.addEventListener("change", (e) => {
    filters.sort = e.target.value;
    applyFilters();
  });
}

/* ---------- Add / Edit modal + validation ---------- */

const modal = document.getElementById("product-modal");
const form = document.getElementById("product-form");
const idInput = document.getElementById("product-id");

function clearErrors() {
  form.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
  form.querySelectorAll("input").forEach((el) => el.classList.remove("invalid"));
}

function openAddModal() {
  form.reset();
  clearErrors();
  idInput.value = "";
  document.getElementById("modal-title").textContent = "Add product";
  modal.showModal();
}

function openEditModal(product) {
  form.reset();
  clearErrors();
  idInput.value = product.id;
  document.getElementById("modal-title").textContent = "Edit product";
  document.getElementById("p-name").value = product.name;
  document.getElementById("p-price").value = product.price;
  document.getElementById("p-category").value = product.category;
  document.getElementById("p-image").value = product.image || "";
  modal.showModal();
}

document.getElementById("add-product-btn").addEventListener("click", openAddModal);
document.getElementById("modal-cancel").addEventListener("click", () => modal.close());

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const data = Object.fromEntries(new FormData(form));
  const errors = validateProduct(data);

  const fields = Object.keys(errors);
  if (fields.length > 0) {
    fields.forEach((field) => {
      form.querySelector(`[data-error-for="${field}"]`).textContent = errors[field];
      form.querySelector(`[name="${field}"]`).classList.add("invalid");
    });
    return; // stop: do not save invalid data
  }

  const cleaned = {
    name: data.name.trim(),
    price: Number(data.price),
    category: data.category.trim().toLowerCase(),
    image: data.image.trim(),
  };

  const saveBtn = form.querySelector('button[type="submit"]');
  saveBtn.disabled = true;

  try {
    if (idInput.value === "") {
      await withTimeout(createProduct(cleaned), 8000);
      allProducts = [{ id: Date.now(), local: true, ...cleaned }, ...allProducts];
      showToast("Product added");
    } else {
      const id = Number(idInput.value);
      const existing = allProducts.find((p) => p.id === id);
      // local-only products do not exist on the server
      if (existing && !existing.local) await withTimeout(updateProduct(id, cleaned), 8000);
      allProducts = allProducts.map((p) => (p.id === id ? { ...p, ...cleaned } : p));
      showToast("Product updated");
    }
  } catch (error) {
    showToast(`Could not save product: ${error.message}`, true);
    return; // keep the modal open so the user can retry
  } finally {
    saveBtn.disabled = false;
  }

  fillCategories();
  applyFilters();
  modal.close();
});

/* ---------- Event delegation: one listener for all cards ---------- */

document.getElementById("product-list").addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.closest(".card").dataset.id);
  const product = allProducts.find((p) => p.id === id);
  if (!product) return;

  switch (btn.dataset.action) {
    case "delete":
      if (!confirm(`Delete "${product.name}"?`)) return;
      try {
        if (!product.local) await withTimeout(deleteProduct(id), 8000);
      } catch (error) {
        showToast(`Could not delete: ${error.message}`, true);
        return;
      }
      allProducts = allProducts.filter((p) => p.id !== id);
      fillCategories();
      applyFilters();
      showToast("Product deleted");
      break;

    case "edit":
      openEditModal(product);
      break;

    case "add-to-cart":
      cart.add(product);
      refreshCart();
      showToast(`${product.name} added to cart`);
      break;
  }
});

/* ---------- Cart ---------- */

function refreshCart() {
  renderCart(cart.getItems(), cart.getTotal(), cart.getCount());
}

document.getElementById("cart-toggle").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
document.getElementById("overlay").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});

// Event delegation for quantity buttons inside the cart
document.getElementById("cart-items").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.closest(".cart-row").dataset.id);

  switch (btn.dataset.action) {
    case "increase":
      cart.increase(id);
      break;
    case "decrease":
      cart.decrease(id);
      break;
    case "remove":
      cart.remove(id);
      break;
  }
  refreshCart();
});

document.getElementById("clear-cart").addEventListener("click", () => {
  if (cart.getCount() === 0) return;
  if (!confirm("Remove all items from the cart?")) return;
  cart.clear();
  refreshCart();
  showToast("Cart cleared");
});

/* ---------- Throttle example: shadow on header while scrolling ---------- */

const topbar = document.querySelector(".topbar");
window.addEventListener(
  "scroll",
  throttle(() => topbar.classList.toggle("is-scrolled", window.scrollY > 10), 150)
);

/* ---------- Init ---------- */

async function init() {
  const status = document.getElementById("status");
  status.hidden = false;
  status.className = "status";
  status.textContent = "Loading products...";

  try {
    const apiProducts = await withTimeout(getProducts(), 8000);
    allProducts = [...sampleProducts, ...apiProducts];
    status.hidden = true;
  } catch (error) {
    // API failed: still show local sample products
    allProducts = [...sampleProducts];
    status.className = "status is-error";
    status.textContent = `Could not load products from the server (${error.message}). Showing sample products.`;
  }

  fillCategories();
  setupControls();
  applyFilters();
  refreshCart(); // show cart restored from LocalStorage
}

init();