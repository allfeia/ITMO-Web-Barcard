import { useState } from "react";
import OrderModal from "./OderCard.jsx";
import { useAuth } from "../authContext/useAuth.js";

function Result() {
  const { roles } = useAuth();

  const [orderOpen, setOrderOpen] = useState(false);

  const rolesArr = Array.isArray(roles) ? roles : roles ? [roles] : [];
  const isAdminOrStaff =
    rolesArr.includes("bar_admin") || rolesArr.includes("staff");

  return (
    <>
      <h1>Result</h1>

      {!isAdminOrStaff && (
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
          <button className="learn" onClick={() => setOrderOpen(true)}>
            Заказать
          </button>
        </div>
      )}

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        cocktailId={2}
      />
    </>
  );
}

export default Result;