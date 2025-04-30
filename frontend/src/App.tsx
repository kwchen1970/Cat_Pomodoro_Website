import { Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import { PATHS } from "./constants/Navigation";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      {/* Login route at / */}
      <Route path="/" element={<Login />} />

      {/* RootLayout routes */}
      <Route element={<RootLayout />}>
        {PATHS.map((page) => (
          <Route
            key={page.link}
            path={page.link.slice(1)}
            element={page.element}
          />
        ))}
      </Route>
    </Routes>
  );
}

