import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";

import {
  fetchCategories,
  fetchProductsGeneric,
  searchProductsByName,
  fetchProductsByCategory,
  getProductByBarcode,
} from "../api";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";
import "../components/Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    let mounted = true;
    fetchCategories(1, 200)
      .then((data) => {
        if (!mounted) return;
        if (data && data.tags) {
          setCategories(data.tags.slice(0, 50));
        }
      })
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  // Load products whenever search or category changes
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    loadProducts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort]);

  async function loadProducts(p = page, replace = false) {
    setLoading(true);
    try {
      let data;
      if (search) data = await searchProductsByName(search, p, 24);
      else if (category) data = await fetchProductsByCategory(category, p, 24);
      else data = await fetchProductsGeneric(p, 24);

      const items = data?.products || [];
      setProducts((prev) => (replace ? items : [...prev, ...items]));
      setHasMore(items.length === 24);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    loadProducts(next);
  }

  // Barcode search
  function handleBarcodeSearch(e) {
    e.preventDefault();
    if (!barcode) return;
    getProductByBarcode(barcode)
      .then((res) => {
        if (res && res.status === 1) {
          navigate(`/product/${barcode}`);
        } else {
          alert("Product not found for this barcode.");
        }
      })
      .catch(() => alert("Error fetching product by barcode"));
  }

  // Sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    if (sort === "name-asc")
      sorted.sort((a, b) =>
        (a.product_name || "").localeCompare(b.product_name || "")
      );
    else if (sort === "name-desc")
      sorted.sort((a, b) =>
        (b.product_name || "").localeCompare(a.product_name || "")
      );
    else if (sort === "nutri-asc")
      sorted.sort((a, b) =>
        (a.nutrition_grades || "").localeCompare(b.nutrition_grades || "")
      );
    else if (sort === "nutri-desc")
      sorted.sort((a, b) =>
        (b.nutrition_grades || "").localeCompare(a.nutrition_grades || "")
      );
    return sorted;
  }, [products, sort]);

  // --- Custom Styles for React Select ---
  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "#fff",
      borderColor: "#ddd",
      borderRadius: "8px",
      padding: "2px 4px",
      minWidth: "220px",
      cursor: "pointer",
      boxShadow: "none",
      "&:hover": { borderColor: "#f54c18" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#fff",
      zIndex: 999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor:
        state.isFocused && state.data.value === ""
          ? "#f54c18" // hover for “All categories” or “Sort by”
          : state.isFocused
          ? "#f54c18"
          : "#fff",
      color:
        state.isFocused && state.data.value === ""
          ? "white"
          : state.isFocused
          ? "#fdf9f9ff"
          : "#000",
      cursor: "pointer",
      fontWeight: state.isSelected ? "600" : "normal",
    }),
  };

  // --- Category Options ---
  const categoryOptions = [
    { value: "", label: "All categories" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: `${cat.name} (${cat.products})`,
    })),
  ];

  // --- Sort Options ---
  const sortOptions = [
    { value: "", label: "Sort by" },
    { value: "name-asc", label: "🔤 Name A-Z" },
    { value: "name-desc", label: "🔡 Name Z-A" },
    { value: "nutri-asc", label: "🥦 Nutrition Grade A→E" },
    { value: "nutri-desc", label: "🍔 Nutrition Grade E→A" },
  ];

  return (
    <div className="container">
      {/* Controls Row */}
      <section className="controls">
        <form className="controls-row" onSubmit={handleBarcodeSearch}>
          <input
            placeholder="🔍 Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* 🔸 Category Dropdown */}
          <Select
            options={categoryOptions}
            styles={customStyles}
            value={categoryOptions.find((opt) => opt.value === category)}
            onChange={(opt) => setCategory(opt.value)}
            placeholder="Select category"
          />

          {/* 🔸 Sort By Dropdown */}
          <Select
            options={sortOptions}
            styles={customStyles}
            value={sortOptions.find((opt) => opt.value === sort)}
            onChange={(opt) => setSort(opt.value)}
            placeholder="Sort by"
          />

          <input
            placeholder="Barcode (e.g. 737628064502)"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <button type="submit">Search Barcode</button>
        </form>
      </section>

      {/* Product Grid */}
      <section className="product-grid">
        {sortedProducts.length === 0 && !loading && (
          <div className="empty">No products found.</div>
        )}
        {sortedProducts.map((p) => (
          <ProductCard key={p.code || Math.random()} product={p} />
        ))}
      </section>

      {/* Load More */}
      <div className="load-more">
        {loading ? (
          <div>Loading...</div>
        ) : hasMore ? (
          <button onClick={handleLoadMore}>Load more</button>
        ) : (
          <div>End of results</div>
        )}
      </div>
    </div>
  );
}
