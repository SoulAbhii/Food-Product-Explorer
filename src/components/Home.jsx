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

  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [sort, setSort] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);

  // Initialize component - run only once on mount
  useEffect(() => {
    const initializeComponent = async () => {
      // Load saved state from sessionStorage
      const savedState = loadStateFromStorage();
      
      // Apply saved state
      if (savedState.search) setSearch(savedState.search);
      if (savedState.category) setCategory(savedState.category);
      if (savedState.sort) setSort(savedState.sort);
      if (savedState.products.length > 0) {
        setProducts(savedState.products);
        setPage(savedState.page);
        setHasMore(savedState.hasMore);
      }

      // Fetch categories
      try {
        const categoriesData = await fetchCategories(1, 200);
        if (categoriesData?.tags) {
          setCategories(categoriesData.tags);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }

      // If no saved products, load initial products
      if (savedState.products.length === 0) {
        await loadProducts(1, true);
      }

      isInitialMount.current = false;
    };

    initializeComponent();
  }, []);

  // Load products when filters change (after initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      const loadWithNewFilters = async () => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        await loadProducts(1, true);
      };
      loadWithNewFilters();
    }
  }, [search, category?.value, sort]);

  // Save state to sessionStorage whenever relevant state changes
  useEffect(() => {
    if (!isInitialMount.current) {
      saveStateToStorage();
    }
  }, [products, page, hasMore, search, category, sort]);

  // Helper function to load state from sessionStorage
  const loadStateFromStorage = () => {
    try {
      const savedSearch = sessionStorage.getItem('homeSearch') || "";
      const savedCategoryStr = sessionStorage.getItem('homeCategory');
      const savedSort = sessionStorage.getItem('homeSort') || "";
      const savedProducts = sessionStorage.getItem('homeProducts');
      const savedPage = sessionStorage.getItem('homePage');
      const savedHasMore = sessionStorage.getItem('homeHasMore');

      let savedCategory = null;
      if (savedCategoryStr && savedCategoryStr !== "null") {
        try {
          savedCategory = JSON.parse(savedCategoryStr);
        } catch (e) {
          console.error("Error parsing saved category:", e);
        }
      }

      return {
        search: savedSearch,
        category: savedCategory,
        sort: savedSort,
        products: savedProducts ? JSON.parse(savedProducts) : [],
        page: savedPage ? parseInt(savedPage) : 1,
        hasMore: savedHasMore ? savedHasMore === 'true' : true
      };
    } catch (error) {
      console.error("Error loading state from storage:", error);
      return {
        search: "",
        category: null,
        sort: "",
        products: [],
        page: 1,
        hasMore: true
      };
    }
  };

  // Helper function to save state to sessionStorage
  const saveStateToStorage = () => {
    try {
      sessionStorage.setItem('homeSearch', search);
      sessionStorage.setItem('homeCategory', JSON.stringify(category));
      sessionStorage.setItem('homeSort', sort);
      sessionStorage.setItem('homeProducts', JSON.stringify(products));
      sessionStorage.setItem('homePage', page.toString());
      sessionStorage.setItem('homeHasMore', hasMore.toString());
    } catch (error) {
      console.error("Error saving state to storage:", error);
    }
  };

  async function loadProducts(p = page, replace = false) {
    if (loading) return;
    
    setLoading(true);
    try {
      let data;
      if (search) {
        data = await searchProductsByName(search, p, 24);
      } else if (category) {
        data = await fetchProductsByCategory(category.value, p, 24);
      } else {
        data = await fetchProductsGeneric(p, 24);
      }

      const items = data?.products || [];
      
      if (replace) {
        setProducts(items);
      } else {
        setProducts(prev => [...prev, ...items]);
      }
      
      setHasMore(items.length === 24);

    } catch (err) {
      console.error("Error loading products:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    loadProducts(next, false);
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

  // Clear all filters
  function handleClearFilters() {
    setSearch("");
    setCategory(null);
    setSort("");
    setBarcode("");
    setProducts([]);
    setPage(1);
    setHasMore(true);
    
    // Clear session storage
    sessionStorage.removeItem('homeSearch');
    sessionStorage.removeItem('homeCategory');
    sessionStorage.removeItem('homeSort');
    sessionStorage.removeItem('homeProducts');
    sessionStorage.removeItem('homePage');
    sessionStorage.removeItem('homeHasMore');
    
    // Load default products
    loadProducts(1, true);
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
          ? "#f54c18"
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
          
          {/* Clear Filters Button */}
          {(search || category || sort) && (
            <button type="button" onClick={handleClearFilters} className="clear-btn">
              Clear Filters
            </button>
          )}
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