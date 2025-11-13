import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductByBarcode } from "../api";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { barcode } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductByBarcode(barcode);
        setProduct(data.product);
      } catch (error) {
        console.error("Failed to fetch product detail", error);
      }
    }
    loadProduct();
  }, [barcode]);

  if (!product) return <p>Loading product details...</p>;

  return (
    <div className="product-detail">
      {/* Circular Back Button */}
      <Link to="/" className="back-circle" title="Back to Home">
        ←
      </Link>
      
      <h1>{product.product_name}</h1>
      <img src={product.image_front_url} alt={product.product_name} />
      <p><strong>Brand:</strong> {product.brands || "N/A"}</p>
      <p><strong>Quantity:</strong> {product.quantity || "N/A"}</p>
      <p><strong>Ingredients:</strong> {product.ingredients_text || "Not available"}</p>
      <p><strong>Nutrition Grade:</strong> {product.nutrition_grades || "N/A"}</p>
    </div>
  );
}