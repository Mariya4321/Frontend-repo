import { Routes, Route } from "react-router-dom";
import Signup from "./component/Signup";
import Login from "./component/Login";
import Product from "./component/Product";
import Navbar from "./component/nav";
import Cart from "./component/Cart";

function App() {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Routes */}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Product />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
