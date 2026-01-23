import { useState } from "react";
import { useSelector } from "react-redux";
import OrderModal from "./OderCard.jsx";
import { useAuth } from "../authContext/useAuth.js";

function Result() {
  const { roles } = useAuth();
  const cocktailId = useSelector((state) => state.game.cocktailId);

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
        cocktailId={cocktailId}
      />
    </>
  );
}

export default Result;