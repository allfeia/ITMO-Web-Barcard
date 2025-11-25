import {BrowserRouter, Routes, Route} from 'react-router-dom'
import StartPage from "./start-page/StartPage.jsx";
import {createRoot} from "react-dom/client";
import React from "react";


createRoot(document.getElementById("root")).render(
  <BrowserRouter>
      <Routes>
          <Route path="/" element={<StartPage />} />
      </Routes>
  </BrowserRouter>
);
