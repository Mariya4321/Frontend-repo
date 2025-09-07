import { useEffect, useState } from "react";
import api from "../api";
import "./Product.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
}

function Product() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    rating: "",
  });
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState({
    name: "",
    price: "",
    category: "",
    rating: "",
  });

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<Product[]>("/products/", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const products = res.data ?? [];
        setProducts(products);
        setFiltered(products);

        // Extract unique categories safely
        const cats = Array.from(
          new Set(
            products
              .map((p) => p.category)
              .filter((c): c is string => c !== undefined && c !== null)
          )
        );
        setCategories(cats);

        if (token) {
          const profileRes = await api.get("/profile/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsAdmin(profileRes.data.is_superuser ?? false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [token]);

  // Filters
  useEffect(() => {
    let result = products;
    if (filters.category)
      result = result.filter((p) => p.category === filters.category);
    if (filters.minPrice)
      result = result.filter((p) => p.price >= parseFloat(filters.minPrice));
    if (filters.maxPrice)
      result = result.filter((p) => p.price <= parseFloat(filters.maxPrice));
    if (filters.rating)
      result = result.filter((p) => p.rating >= parseFloat(filters.rating));
    setFiltered(result);
  }, [filters, products]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleCategory = (category: string) =>
    setFilters({ ...filters, category });
  const handleResetFilters = () =>
    setFilters({ category: "", minPrice: "", maxPrice: "", rating: "" });

  const addToCart = async (id: number) => {
    if (!token) return alert("Login required!");
    try {
      await api.post(
        "/cart/add/",
        { product_id: id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart!");
    } catch {
      alert("Error adding to cart");
    }
  };

  // Add product
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(
        "/products/",
        {
          ...newProduct,
          price: parseFloat(newProduct.price),
          rating: parseFloat(parseFloat(newProduct.rating).toFixed(1)),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product added!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    }
  };

  // Start edit
  const startEdit = (product: Product) => {
    setEditProductId(product.id);
    setEditProduct({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      rating: product.rating.toFixed(1),
    });
  };

  // Update product
  const updateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProductId) return;
    try {
      await api.put(
        `/products/${editProductId}/`,
        {
          ...editProduct,
          price: parseFloat(editProduct.price),
          rating: parseFloat(parseFloat(editProduct.rating).toFixed(1)),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product updated!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error updating product");
    }
  };

  // Delete product
  const deleteProduct = async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert("Error deleting product");
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3 border-0 rounded-3 sidebar">
            <h5 className="mb-3 text-primary">Categories</h5>
            <ul className="list-group list-group-flush">
              <li
                className={`list-group-item category-item ${
                  filters.category === "" ? "active" : ""
                }`}
                onClick={() => handleCategory("")}
              >
                All
              </li>
              {categories.map((cat) => (
                <li
                  key={cat}
                  className={`list-group-item category-item ${
                    filters.category === cat ? "active" : ""
                  }`}
                  onClick={() => handleCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
          {/* Filters */}
          <div className="card shadow-sm p-3 mt-3 border-0 rounded-3 sidebar">
            <h6 className="text-primary">Filter</h6>
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              className="form-control mb-2"
              value={filters.minPrice}
              onChange={handleChange}
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              className="form-control mb-2"
              value={filters.maxPrice}
              onChange={handleChange}
            />
            <input
              type="number"
              step={0.1}
              name="rating"
              placeholder="Min Rating"
              className="form-control mb-2"
              value={filters.rating}
              onChange={handleChange}
            />
            <button
              className="btn btn-outline-primary w-100"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Products */}
        <div className="col-md-9">
          {/* Add Product */}
          {isAdmin && (
            <div className="card shadow-sm mb-4 p-4 rounded-3 add-product-card">
              <h4 className="mb-3 text-success">Add New Product</h4>
              <form className="row g-3" onSubmit={addProduct}>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-control"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    step={0.1}
                    className="form-control"
                    placeholder="Rating"
                    value={newProduct.rating}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        rating:
                          parseFloat(parseFloat(e.target.value).toFixed(1)) +
                          "",
                      })
                    }
                    required
                  />
                </div>
                <div className="col-12">
                  <button className="btn btn-success w-100" type="submit">
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Product (below Add) */}
          {isAdmin && editProductId && (
            <div className="card shadow-sm mb-4 p-4 rounded-3 edit-product-card">
              <h4 className="mb-3 text-warning">Edit Product</h4>
              <form className="row g-3" onSubmit={updateProduct}>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    value={editProduct.name}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-control"
                    value={editProduct.category}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        category: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    step={0.1}
                    className="form-control"
                    value={editProduct.rating}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        rating:
                          parseFloat(parseFloat(e.target.value).toFixed(1)) +
                          "",
                      })
                    }
                    required
                  />
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-warning w-50" type="submit">
                    Update
                  </button>
                  <button
                    className="btn btn-secondary w-50"
                    onClick={() => setEditProductId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product Grid */}
          <div className="row">
            {filtered.length === 0 ? (
              <p className="text-muted">No products found.</p>
            ) : (
              filtered.map((product) => (
                <div key={product.id} className="col-md-4 mb-4">
                  <div className="card h-100 shadow-sm product-card border-0">
                    <div className="bg-light d-flex align-items-center justify-content-center rounded product-img">
                      <span className="text-muted">📦</span>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{product.name}</h5>
                      <p className="card-text text-muted small">
                        {product.description}
                      </p>
                      <p className="fw-bold text-success">₹{product.price}</p>
                      <p className="text-warning">
                        ⭐ {product.rating.toFixed(1)}
                      </p>
                      {isAdmin ? (
                        <div className="mt-auto d-flex flex-column gap-2">
                          <button
                            className="btn btn-warning w-100"
                            onClick={() => startEdit(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger w-100"
                            onClick={() => deleteProduct(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary mt-auto w-100"
                          onClick={() => addToCart(product.id)}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
