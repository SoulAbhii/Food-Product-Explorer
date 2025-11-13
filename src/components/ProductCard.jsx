import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  // Fallback image if product has no image
  const imageUrl =
    product.image_front_small_url ||
    product.image_url ||
    "https://via.placeholder.com/240x180?text=No+Image";

  // Nutrition grade (A-E)
  const grade = product.nutrition_grades?.toLowerCase() || null;

  const handleClick = () => {
    // Navigate to product detail WITHOUT passing any state that might interfere
    navigate(`/product/${product.code}`);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <img
        src={imageUrl}
        alt={product.product_name}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/240x180?text=No+Image";
        }}
      />
      <div className="info">
        <h3>{product.product_name || "Unknown Product"}</h3>
        <p>{product.brands || "Unknown Brand"}</p>
      </div>

      {product.nutrition_grades && (
        <div className={`badge ${product.nutrition_grades.toLowerCase()}`}>
          Nutrition Grade: {product.nutrition_grades.toUpperCase()}
        </div>
      )}
    </div>
  );
}