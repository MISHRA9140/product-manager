export function validateProduct({ name, price, category, image }) {
  const errors = {};

  if (name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }
  if (price === "" || Number.isNaN(Number(price)) || Number(price) <= 0) {
    errors.price = "Enter a price greater than 0.";
  }
  if (!category.trim()) {
    errors.category = "Category is required.";
  }
  const img = image.trim();
  if (img) {
    // allowed: full http(s) URL, or a local path like images/photo.jpg
    const isLocalPath = /^(\.?\/)?[\w\-./]+\.(jpe?g|png|webp|gif|svg|avif)$/i.test(img);
    let isHttpUrl = false;
    try {
      isHttpUrl = ["http:", "https:"].includes(new URL(img).protocol);
    } catch {
      isHttpUrl = false;
    }
    if (!isLocalPath && !isHttpUrl) {
      errors.image = "Enter an http(s) URL or a local path like images/photo.jpg";
    }
  }
  return errors; // empty object = valid
}