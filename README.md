# 🥗 Food Product Explorer

A React.js web application that allows users to search and explore food products using the **Open Food Facts API**.  
Users can browse by category, sort products, or even look up items using a **barcode number**.

---
## 🚀 Live Demo

👉 **[View the app on Netlify](https://food-product-explorer-abhi.netlify.app/)**  


## 🚀 Features

- 🔍 **Search by Product Name** – Quickly find food products by typing their name.
- 🏷️ **Filter by Category** – Choose from a wide range of product categories.
- 🍔 **Sort Products** – Sort by name or nutrition grade (A → E or E → A).
- 📦 **Barcode Search** – Enter a barcode number to get product details instantly.
- 🧾 **Flipkart-Style Product Cards** – Clean, modern UI for easy browsing.
- 📱 **Responsive Design** – Works perfectly on desktop and mobile.
- ⚡ **Pagination / Load More** – Load products dynamically without refreshing.

---

## 🛠️ Tech Stack

| Technology | Description |
|-------------|-------------|
| **React.js (Vite)** | Frontend Framework |
| **React Router** | Page Navigation |
| **React Select** | Custom Dropdowns |
| **CSS / Flexbox / Grid** | Styling & Layout |
| **Open Food Facts API** | Public food data source |

---

## 📁 Folder Structure

food-product-explorer/
│
├── src/
│ ├── api.js # API calls to Open Food Facts
│ ├── components/
│ │ ├── Home.jsx # Main page (search, filters, product list)
│ │ ├── ProductCard.jsx # Individual product cards
│ │ ├── ProductDetail.jsx# Product details page
│ │ ├── Home.css # Styles for main page
│ │ ├── ProductCard.css # Flipkart-style product cards
│ │ ├── ProductDetail.css# Detail page styling
│ ├── App.jsx # App routing
│ ├── main.jsx # React entry file
│
├── package.json
├── vite.config.js
├── README.md
└── index.html


## ⚙️ Installation & Setup

Follow these steps to run the project locally:

### 1️⃣ Clone the repository

```bash
git clone https://github.com/SoulAbhii/Food-Product-Explorer.git
2️⃣ Navigate into the folder
cd Food-Product-Explorer

3️⃣ Install dependencies
npm install

4️⃣ Run the development server
npm run dev


Now open your browser and visit 👉 http://localhost:5173
