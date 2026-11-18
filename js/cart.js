const STORAGE_KEY = "product-manager-cart";

// Closure: `items` is private. Outside code can only use the returned methods.
export function createCart() {
  const items = new Map(); // product id -> { product, qty }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      JSON.parse(raw).forEach(([id, item]) => {
        const valid =
          item && item.product && Number.isFinite(item.product.price) && item.qty > 0;
        if (valid) items.set(id, item);
      });
    } catch (error) {
      console.error("Could not read saved cart:", error.message);
      localStorage.removeItem(STORAGE_KEY); // corrupted data: start fresh
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...items]));
    } catch (error) {
      console.error("Could not save cart:", error.message);
    }
  }

  load();

  return {
    add(product) {
      const existing = items.get(product.id);
      if (existing) {
        existing.qty += 1;
      } else {
        items.set(product.id, { product: { ...product }, qty: 1 });
      }
      save();
    },

    increase(id) {
      const item = items.get(id);
      if (item) {
        item.qty += 1;
        save();
      }
    },

    decrease(id) {
      const item = items.get(id);
      if (!item) return;
      item.qty -= 1;
      if (item.qty <= 0) items.delete(id);
      save();
    },

    remove(id) {
      items.delete(id);
      save();
    },

    clear() {
      items.clear();
      save();
    },

    getItems() {
      return [...items.values()];
    },

    getCount() {
      let count = 0;
      items.forEach((item) => (count += item.qty));
      return count;
    },

    getTotal() {
      let total = 0;
      items.forEach((item) => (total += item.product.price * item.qty));
      return Math.round(total * 100) / 100; // avoid 0.1 + 0.2 style errors
    },
  };
}