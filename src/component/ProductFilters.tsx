import { useState, useEffect } from "react";
import api from "../api";

function ProductFilters({
  onFilterChange,
}: {
  onFilterChange: (filters: any) => void;
}) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("products/");
        const cats: string[] = Array.from(
          new Set(res.data.map((p: any) => p.category as string))
        );
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const applyFilters = () => {
    onFilterChange({ category: selectedCategory, price, rating });
  };

  const resetFilters = () => {
    setSelectedCategory("");
    setPrice("");
    setRating("");
    onFilterChange({ category: "", price: "", rating: "" });
  };

  return (
    <div className="d-flex gap-2 mb-3">
      {/* Category Dropdown */}
      <select
        className="form-select"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Price Filter */}
      <input
        type="number"
        className="form-control"
        placeholder="Max Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      {/* Rating Filter */}
      <input
        type="number"
        className="form-control"
        placeholder="Min Rating"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />

      <button className="btn btn-primary" onClick={applyFilters}>
        Apply
      </button>
      <button className="btn btn-secondary" onClick={resetFilters}>
        Reset
      </button>
    </div>
  );
}

export default ProductFilters;
