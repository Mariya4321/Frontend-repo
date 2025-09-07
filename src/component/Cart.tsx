import { useEffect, useState } from "react";
import api from "../api";

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
}

function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access");

  // Fetch cart items
  const fetchCart = async () => {
    try {
      const res = await api.get("/cart/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Increase/Decrease quantity
  const updateQuantity = async (id: number, newQty: number) => {
    if (newQty <= 0) return; // prevent invalid qty
    try {
      const res = await api.patch(
        `/cart/item/${id}/`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart((prev) => prev.map((item) => (item.id === id ? res.data : item)));
    } catch (err) {
      console.error("Error updating quantity", err);
    }
  };

  // Remove item from cart
  const removeItem = async (id: number) => {
    try {
      await api.delete(`/cart/item/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error removing item", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading cart...</p>;

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary">🛒 Your Cart</h2>
      {cart.length === 0 ? (
        <div className="alert alert-info text-center">No items in cart.</div>
      ) : (
        <div className="row">
          <div className="col-md-8">
            {cart.map((item) => (
              <div key={item.id} className="card mb-3 shadow-sm">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-1">{item.product.name}</h5>
                    <p className="card-text mb-0 text-muted">
                      ₹{item.product.price} × {item.quantity} ={" "}
                      <strong>₹{item.product.price * item.quantity}</strong>
                    </p>
                  </div>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="col-md-4">
            <div className="card shadow-sm p-3">
              <h4 className="mb-3">Order Summary</h4>
              <p className="d-flex justify-content-between">
                <span>Total Items:</span> <span>{cart.length}</span>
              </p>
              <p className="d-flex justify-content-between fw-bold">
                <span>Total Price:</span> <span>₹{total}</span>
              </p>
              <button className="btn btn-success w-100 mt-2">Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
