import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './components/Home'
import ProductDetail from './components/ProductDetail'
import { GiHamburger } from "react-icons/gi";
import { FaGlassWhiskey } from "react-icons/fa";
import './App.css'

export default function App() {
  return (
    <div className="app-root">
      <header className="topbar">
      <Link to="/" className="brand">
        Food Product Explorer{" "}
        <span className="icons">
          <GiHamburger className="food-icon" />
          <FaGlassWhiskey className="drink-icon" />
        </span>
      </Link>
    </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:barcode" element={<ProductDetail />} />
        </Routes>
      </main>

      <footer className="footer">
        Data from OpenFoodFacts —  &nbsp;
        <a href="https://world.openfoodfacts.org/" target="_blank" rel="noreferrer">
            openfoodfacts.org
        </a>
      </footer>
    </div>
  )
}
