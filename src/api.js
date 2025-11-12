
const BASE_URL = "https://world.openfoodfacts.org";

/**
 * Fetch generic products (no filter)
 */
export async function fetchProductsGeneric(page = 1, pageSize = 20) {
  const res = await fetch(`${BASE_URL}/cgi/search.pl?search_simple=1&page=${page}&page_size=${pageSize}&json=true`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

/**
 * Fetch products by category
 */
export async function fetchProductsByCategory(category, page = 1, pageSize = 20) {
  const res = await fetch(`${BASE_URL}/category/${encodeURIComponent(category)}.json?page=${page}&page_size=${pageSize}`);
  if (!res.ok) throw new Error("Failed to fetch category products");
  return res.json();
}

/**
 * Fetch list of categories
 */
export async function fetchCategories(page = 1, pageSize = 100) {
  const res = await fetch(`${BASE_URL}/categories.json?page=${page}&page_size=${pageSize}`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

/**
 * Search products by name
 */
export async function searchProductsByName(name, page = 1, pageSize = 20) {
  const res = await fetch(
    `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(name)}&search_simple=1&page=${page}&page_size=${pageSize}&json=true`
  );
  if (!res.ok) throw new Error("Failed to search products");
  return res.json();
}

/**
 * Get product details by barcode
 */
export async function getProductByBarcode(barcode) {
  const res = await fetch(`${BASE_URL}/api/v0/product/${barcode}.json`);
  if (!res.ok) throw new Error("Failed to fetch product by barcode");
  return res.json();
}
