const BASE_URL = "https://dummyjson.com/products";

// One helper so error handling lives in one place
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

// Convert API fields to our own product shape
function normalize(item) {
  return {
    id: item.id,
    name: item.title,
    price: item.price,
    category: item.category,
    image: item.thumbnail,
  };
}

export async function getProducts() {
  const data = await request(`${BASE_URL}?limit=20`);
  return data.products.map(normalize);
}

// dummyjson accepts these calls but does not really save data
function toPayload(product) {
  return {
    title: product.name,
    price: product.price,
    category: product.category,
    thumbnail: product.image,
  };
}

const jsonHeaders = { "Content-Type": "application/json" };

export async function createProduct(product) {
  const data = await request(`${BASE_URL}/add`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(toPayload(product)),
  });
  return data; // server id is always the same, so app keeps its own id
}

export async function updateProduct(id, product) {
  return request(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(toPayload(product)),
  });
}

export async function deleteProduct(id) {
  return request(`${BASE_URL}/${id}`, { method: "DELETE" });
}
