import { HeaderSimple } from "../components/Header";
import { PATHS } from "../constants/Navigation";
import { Outlet } from "react-router-dom";

const RootLayout = () => (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderSimple links={PATHS} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Outlet />
      </div>
    </div>
  );
  

export default RootLayout;
