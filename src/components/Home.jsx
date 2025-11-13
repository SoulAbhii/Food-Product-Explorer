import React, { useEffect, useState, useMemo, useRef } from "react";
import Select from "react-select";

import {
  fetchCategories,
  fetchProductsGeneric,
  searchProductsByName,
  fetchProductsByCategory,
  getProductByBarcode,
} from "../api";
import ProductCard from "./ProductCard";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState(sessionStorage.getItem('homeSearch') || "");
  const [barcode, setBarcode] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [sort, setSort] = useState(sessionStorage.getItem('homeSort') || "");

  const navigate = useNavigate();
  const location = useLocation();
  const initialLoadDone = useRef(false);

  // Fetch categories and load saved state
  useEffect(() => {
    let mounted = true;
    fetchCategories(1, 200)
      .then((data) => {
        if (!mounted) return;
        if (data && data.tags) {
          setCategories(data.tags);
          // Restore filters from navigation state or sessionStorage
          let savedSearch = location.state?.filters?.search || sessionStorage.getItem('homeSearch') || "";
          let savedCategoryStr = location.state?.filters?.category || sessionStorage.getItem('homeCategory');
          let savedSort = location.state?.filters?.sort || sessionStorage.getItem('homeSort') || "";
          let savedCategory = null;
          if (savedCategoryStr) {
            try {
              savedCategory = JSON.parse(savedCategoryStr);
            } catch (e) {
              // Ignore invalid JSON
            }
          }
          setSearch(savedSearch);
          setCategory(savedCategory);
          setSort(savedSort);
        }
      })
      .then(() => {
        // After categories are loaded, load saved state
        let savedSearch = location.state?.filters?.search || sessionStorage.getItem('homeSearch') || "";
        let savedCategoryStr = location.state?.filters?.category || sessionStorage.getItem('homeCategory');
        let savedSort = location.state?.filters?.sort || sessionStorage.getItem('homeSort') || "";
        let savedCategory = null;
        if (savedCategoryStr) {
          try {
            savedCategory = JSON.parse(savedCategoryStr);
          } catch (e) {
            // Ignore invalid JSON
          }
        }
        setSearch(savedSearch);
        setCategory(savedCategory);
        setSort(savedSort);

        const savedProducts = sessionStorage.getItem('homeProducts');
        const savedPage = sessionStorage.getItem('homePage');
        const savedHasMore = sessionStorage.getItem('homeHasMore');

        if (savedProducts && savedPage && savedHasMore && !savedSearch && !savedCategory && !savedSort) {
          setProducts(JSON.parse(savedProducts));
          setPage(parseInt(savedPage));
          setHasMore(savedHasMore === 'true');
        } else {
          // Load products based on current filters (which include saved ones)
          loadProducts(1, true);
        }
        initialLoadDone.current = true;
      })
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  // Load products whenever search or category changes
  useEffect(() => {
    if (search || category || sort) {
      setProducts([]);
      setPage(1);
      setHasMore(true);
      loadProducts(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort]);

  // Save filters to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('homeSearch', search);
  }, [search]);

  useEffect(() => {
    sessionStorage.setItem('homeCategory', JSON.stringify(category));
  }, [category]);

  useEffect(() => {
    sessionStorage.setItem('homeSort', sort);
  }, [sort]);

  async function loadProducts(p = page, replace = false) {
    setLoading(true);
    try {
      let data;
      if (search) data = await searchProductsByName(search, p, 24);
      else if (category) data = await fetchProductsByCategory(category.value, p, 24);
      else data = await fetchProductsGeneric(p, 24);

      const items = data?.products || [];
      setProducts((prev) => (replace ? items : [...prev, ...items]));
      setHasMore(items.length === 24);

      // Save to sessionStorage only for initial loads (no filters)
      if (!search && !category && !sort && replace) {
        sessionStorage.setItem('homeProducts', JSON.stringify(replace ? items : [...(JSON.parse(sessionStorage.getItem('homeProducts') || '[]')), ...items]));
        sessionStorage.setItem('homePage', p.toString());
        sessionStorage.setItem('homeHasMore', (items.length === 24).toString());
      }
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
            value={category}
            onChange={(opt) => setCategory(opt)}
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
        {loading && products.length === 0 ? (
          <div className="loading">Loading products...</div>
        ) : sortedProducts.length === 0 && !loading ? (
          <div className="empty">No products found.</div>
        ) : (
          sortedProducts.map((p) => (
            <ProductCard key={p.code || Math.random()} product={p} />
          ))
        )}
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