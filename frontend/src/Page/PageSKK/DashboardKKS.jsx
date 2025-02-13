// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
// import Sidebar from "../Components/Sidebar";
// import Navbar from "../Components/Navbar";
// import HomePage from "./Components/HomeDash";
import { Outlet, useLocation } from "react-router-dom";
import SidebarKKS from "./Components/SidebarSKK";
import NavbarKKKS from "./Components/NavbarSKK";
import { useAuth } from "../../Auth/AuthContext";

export function DashboardSKK() {
  const [selectedNav, setSelectedNav] = useState("homeDash");
  const location = useLocation();
  const { logout,checkAndLogout } = useAuth();

  const handleNavClick = (value) => {
    setSelectedNav(value);
  };
  const username = JSON.parse(localStorage.getItem("user")).username;
  useEffect(()=> {
    checkAndLogout();
  },[location.pathname])

  return (
    <Flex backgroundColor={"#F9FAFB"}>
      <SidebarKKS
        userName={username}
        onLogout={logout}
        handleMenuValue={handleNavClick}
        selectedNav={selectedNav}
      />
      <Box flex="1" p={4} width={"100%"}>
        {/* <NavbarKKKS
          backgroundColor={"white"}
          appName={
            (location.pathname === "/skk/dashboard" && "Dashboard") ||
            (location.pathname === "/skk/exploration" && "Eksplorasi") ||
            (location.pathname === "/skk/development" && "Development") ||
            (location.pathname === "/skk/workover" && "Work Over") ||
            (location.pathname === "/skk/wellservice" && "Well Service") ||
            (location.pathname === "/skk/exploration/planningexploration" &&
              "Planning Exploration")
          }
          nameUser={username}

          // appName={selectedNav === 1 && "Homepage"}
          // {selectedNav === 2 && "Add Data"}
        /> */}
        <Box mt={4}>
          <Box>
            {/* {selectedNav === 'homeDash' && <HomePage handleTambahData={setPageForm} />} */}
            {/* {selectedNav === 'submission' && <PengajuanPekerjaan handleTambahData={setPageForm} />} */}
            {/* {selectedNav === 'operations' && <OperasiPengerjaan handleTambahData={setPageForm} />} */}
            {/* {selectedNav === 'PPP' && <PPP handleTambahData={setPageForm} />} */}

            {/* {selectedNav === 2 && <AddData />} */}
            {/* <PengajuanPekerjaan /> */}
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default DashboardSKK;
