import React, { useState, useEffect } from "react";
import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  useParams,
  Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Dashboard from "./Page/Dashboard";
import { useAuth } from "./Auth/AuthContext";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import ProtectedRoute from "./Auth/ProtectedUser";
import DashboardSKK from "./Page/PageSKK/DashboardKKS";
import HomeDashSKK from "./Page/PageSKK/Components/HomeDashSKK";
import HomeDashKKKS from "./Page/PageKKKS/HomeDash";
import SplashScreen from "./Page/Components/SplashScreen"; // Import SplashScreen
import RoleRedirect from "./Auth/RoleRedirect";
import ExplorationSKK from "./Page/PageSKK/ExplorationSKK";
import DevelopmentSKK from "./Page/PageSKK/DevelopmentSKK";
import WellServiceSKK from "./Page/PageSKK/WellServiceSKK";
import WorkOverSKK from "./Page/PageSKK/WorkOverSKK";
import PlanningExp from "./Page/PageSKK/ChildExploration/PlanningExp";
import PlanningDevelopment from "./Page/PageSKK/ChildDevelopment/PlanningDev";
import PlanningWellService from "./Page/PageSKK/ChildWellService/PlanningWS";
import PlanningWorkOver from "./Page/PageSKK/ChildWorkOver/PlanningWO";
import PengajuanDrillingForm from "./Page/Forms/PengajuanDrillingForm";
import PlanningExpKKKS from "./Page/Components/PageExplorasi/PlanningExp";
import OperationDev from "./Page/PageSKK/ChildDevelopment/OperationDev";
import PPPDev from "./Page/PageSKK/ChildDevelopment/PPPDev";
import CloseOutDev from "./Page/PageSKK/ChildDevelopment/CloseOutDev";
import OperationWO from "./Page/PageSKK/ChildWorkOver/OperationWO";
import PPPWO from "./Page/PageSKK/ChildWorkOver/PPPWO";
import CloseOutWO from "./Page/PageSKK/ChildWorkOver/CloseOutWO";
import OperationWS from "./Page/PageSKK/ChildWellService/OperationWS";
import PPPWS from "./Page/PageSKK/ChildWellService/PPPWS";
import CloseOutWS from "./Page/PageSKK/ChildWellService/CloseOutWS";
import OperationExp from "./Page/PageSKK/ChildExploration/OperationExp";
import PPPExp from "./Page/PageSKK/ChildExploration/PPPExp";
import CloseOutExp from "./Page/PageSKK/ChildExploration/CloseOutExp";
import PlanDevelopmentForm from "./Page/Forms/PlanDevelopmentForm";
import PlanningWorkOverKKKS from "./Page/Components/PageWorkOVer/PlanningExp";
import PlanWellServiceKKKS from "./Page/Components/PageWellService/PlanningExp";
import PlanDevelopKKKS from "./Page/Components/PageExploitasi/PlanningExp";
import PlanWorkOverForm from "./Page/Forms/PlanWorkOver";
import PlanWellServiceForm from "./Page/Forms/PlanWellService";
import OperationExpKKKS from "./Page/Components/PageExplorasi/OperationExpKKKS";
import OperationFormsKKKS from "./Page/Forms/Operation/OperationFormsKKKS";
import RigForm from "./Page/Components/PageRig/RigForm";

import "../src/assets/css/ag-grid-theme-builder.css";
import OperationWoKKKS from "./Page/Components/PageWorkOVer/OperationExpKKKS";
import OperationWSKKKS from "./Page/Components/PageWellService/OperationWSKKKS";
import OperationDevKKKS from "./Page/Components/PageExploitasi/OperationDevKKKS";
import SubmitP3 from "./Page/Forms/PPP/SubmitP3";
import WellMaster from "./Page/Components/PageWellMaster/WellMaster";
import Rig from "./Page/Components/PageRig/Rig";
import WellMasterForm from "./Page/Forms/MastelWell/WellMasterForm";
import Map from "./Page/PageSKK/Map";
import P3DevelopmentKKKS from "./Page/Components/PageExploitasi/P3Dev";
import ViewPlannings from "./Page/PageSKK/ViewPlanning";
import ViewPlanningKKKS from "./Page/Components/PageView/ViewJobPhase/ViewPlanning";
import ViewExplorationKKKS from "./Page/Components/PageView/ViewJobPhase/ViewExploration";
import ViewPppKKKS from "./Page/Components/PageView/ViewJobPhase/ViewPPP";
import ViewWellMaster from "./Page/Components/PageView/ViewJobPhase/ViewWellMaster";
// import ViewOperationNew from "./Page/Components/PageView/ViewJobPhase/ViewOperatingNew";
import ApproveForm from "./Page/Forms/Operation/ApproveForm";
// import ViewPlanningSKK from "./Page/Components/PageView/ViewSKK/ViewPlanning";

import ViewPPP from "./Page/Components/PageView/ViewJobPhase/ViewPPP";
import ViewCO from "./Page/Components/PageView/ViewJobPhase/ViewCO";
import PPPExploration from "./Page/Components/PageExplorasi/P3Exp";
import PPPWorkOver from "./Page/Components/PageWorkOVer/P3WorkOver";
import PPPWellService from "./Page/Components/PageWellService/P3WellService";
import CloseOutExplorationKKKS from "./Page/Components/PageExplorasi/CloseOut";
import CloseOutDevelopmentKKKS from "./Page/Components/PageExploitasi/CloseOut";
import CloseOutWorkOverKKKS from "./Page/Components/PageWorkOVer/CloseOut";
import CloseOutWellServiceKKKS from "./Page/Components/PageWellService/CloseOut";


import UpdateOperasi from "./Page/Forms/UpdateOperasional";
import Report from "./Page/PageSKK/Report";
import MachineLearning from "./Page/PageSKK/MachineLearning";
import WellMasterSKK from "./Page/PageSKK/WellMasterSKK";
import RigMasterSKK from "./Page/PageSKK/RigMasterSKK";
import SubmitCloseOut from "./Page/Forms/CloseOut/SubmitCloseOut";
import EdittPlanningExpDev from "./Page/Forms/EdittPlanningExpDev";
import PageNotFound from "./Page/Error/PageNotFound";

const allowedJobTypes = [
  "exploration",
  "development",
  "workover",
  "wellservice",
  "dashboard",
];

const JobTypeValidation = ({ element }) => {
  const { job_type } = useParams(); 

  
  if (!allowedJobTypes.includes(job_type)) {
   
    return <Navigate to="/not-found" />;
  }

  return element; 
};

function App() {
  const { isAuthenticated } = useAuth();
  const [showSplashScreen, setShowSplashScreen] = useState(false);
  const [splashScreenShown, setSplashScreenShown] = useState(false);

  useEffect(() => {
    
    const hasShownSplash = localStorage.getItem("splashScreenShown") === "true";
    setSplashScreenShown(hasShownSplash);

    if (isAuthenticated && !hasShownSplash) {
      setShowSplashScreen(true);
    }
  }, [isAuthenticated]);

  
  
  const handleSplashScreenComplete = () => {
    setShowSplashScreen(false); // Sembunyikan splash screen setelah selesai
  };

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: <RoleRedirect />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "",
      element: (
        <ProtectedRoute element={<Dashboard />} allowedRoles={["KKKS"]} />
      ),
      children: [
        {
          // path: "",
          path: "/dashboard",
          // element: (<ProtectedRoute element={<HomeDashKKKS />} allowedRoles={["KKKS"]} />),
          element: showSplashScreen ? (
            <SplashScreen onAnimationComplete={handleSplashScreenComplete} />
          ) : (
            <ProtectedRoute
              element={<HomeDashKKKS />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "planning/view/:job_id",
          element: (
            <ProtectedRoute
              element={<ViewPlanningKKKS />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "operation/view/:job_id",
          element: (
            <ProtectedRoute
              element={<ViewExplorationKKKS />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "ppp/view/:job_id",
          element: (
            <ProtectedRoute element={<ViewPPP />} allowedRoles={["KKKS"]} />
          ),
        },
      ],
    },
    {
      path: "exploration",
      element: (
        <ProtectedRoute element={<Dashboard />} allowedRoles={["KKKS"]} />
      ),
      children: [
        {
          // Tambahkan index route dengan Navigate
          index: true,
          element: <Navigate to="planning" replace />
        },
        {
          path: "planning",
          element: (
            <ProtectedRoute
              element={<PlanningExpKKKS />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "planning/form",
          element: (
            <ProtectedRoute
              element={<PengajuanDrillingForm />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "operation",
          element: <OperationExpKKKS />,
        },
        {
          // path: "operasiupdate/:job_id",
          // path: "operation/update/:job_id",
          // element: <UpdateOperasi />,
        },

        {
          path: "operation/update/:job_id",
          element: (
            <ProtectedRoute
              element={<OperationFormsKKKS job_type={"exploration"} />}
              allowedRoles={["KKKS"]}
            />
          ),
        },

        {
          path: "ppp",
          element: <PPPExploration />,
        },
        {
          path: "ppp/form/:job_id",
          element: <SubmitP3 />,
        },
        {
          path: "closeout",
          element: <CloseOutExplorationKKKS />,
        },
        {
          path: "closeout/form/:job_id",
          element: <SubmitCloseOut />,
        },
      ],
    },
    {
      path: "development",
      element: (
        <ProtectedRoute element={<Dashboard />} allowedRoles={["KKKS"]} />
      ),
      children: [
        {
          // Tambahkan index route dengan Navigate
          index: true,
          element: <Navigate to="planning" replace />
        },
        {
          path: "planning",
          element: <PlanDevelopKKKS />,
        },
        {
          path: "planning/form",
          element: (
            <ProtectedRoute
              element={<PlanDevelopmentForm />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "ppp",
          element: <P3DevelopmentKKKS />,
        },
        {
          path: "ppp/form/:job_id",
          element: <SubmitP3 />,
        },
        {
          path: "operation",
          element: (
            <ProtectedRoute
              element={<OperationDevKKKS />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "operation/update/:job_id",
          element: (
            <ProtectedRoute
              element={<OperationFormsKKKS job_type={"development"} />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "closeout",
          element: <CloseOutDevelopmentKKKS />,
        },
        {
          path: "closeout/form/:job_id",
          element: <SubmitCloseOut />,
        },
      ],
    },
    {
      path: "workover",
      element: (
        <ProtectedRoute element={<Dashboard />} allowedRoles={["KKKS"]} />
      ),
      children: [
        {
          // Tambahkan index route dengan Navigate
          index: true,
          element: <Navigate to="planning" replace />
        },
        {
          path: "planning",
          element: <PlanningWorkOverKKKS />,
        },
        {
          path: "planning/form",
          element: (
            <ProtectedRoute
              element={<PlanWorkOverForm />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "operation",
          element: (
            <ProtectedRoute
              element={<OperationWoKKKS />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "operation/update/:job_id",
          element: (
            <ProtectedRoute
              element={<OperationFormsKKKS job_type={"workover"} />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "ppp",
          element: <PPPWorkOver />,
        },
        {
          path: "ppp/form/:job_id",
          element: <SubmitP3 />,
        },
        {
          path: "closeout",
          element: <CloseOutWorkOverKKKS />,
          // ANCHOR CLOSEOUT WORKOVER
        },
        {
          path: "closeout/form/:job_id",
          element: <SubmitCloseOut />,
        },
      ],
    },
    {
      path: "wellservice",
      element: <Dashboard />,
      children: [
        {
          // Tambahkan index route dengan Navigate
          index: true,
          element: <Navigate to="planning" replace />
        },
        {
          path: "planning",
          element: <PlanWellServiceKKKS />,
        },
        {
          path: "planning/form",
          element: (
            <ProtectedRoute
              element={<PlanWellServiceForm />}
              allowedRoles={["KKKS"]}
            />
          ),
        },

        {
          path: "operation",
          element: (
            <ProtectedRoute
              element={<OperationWSKKKS />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "operation/update/:job_id",
          element: (
            <ProtectedRoute
              element={<OperationFormsKKKS job_type={"wellservice"} />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "ppp",
          element: <PPPWellService />,
        },
        {
          path: "ppp/form/:job_id",
          element: <SubmitP3 />,
        },
        {
          path: "closeout",
          element: <CloseOutWellServiceKKKS />,
          // ANCHOR CLOSEOUT WELL SERVICE
        },
        {
          path: "closeout/form/:job_id",
          element: <SubmitCloseOut />,
        },
      ],
    },
    ,
    {
      path: "wellmaster",
      element: <Dashboard />,
      children: [
        {
          path: "", // Untuk "/wellmaster"
          element: <WellMaster />,
        },
        {
          path: "form", // Untuk "/wellmaster/form"
          element: (
            <ProtectedRoute
              element={<WellMasterForm />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "edit/:well_id",
          element: (
            <ProtectedRoute
              element={<WellMasterForm />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
        {
          path: "view/:well_id",
          element: (
            <ProtectedRoute
              element={<ViewWellMaster />}
              allowedRoles={["KKKS"]}
            />
          ),
        },
      ],
    },
    {
      path: "rig",
      element: <Dashboard />,
      children: [
        {
          path: "",
          element: <Rig />,
        },
        {
          path: "create/form",
          element: (
            <ProtectedRoute element={<RigForm />} allowedRoles={["KKKS"]} />
          ),
        },
      ],
    },
    // {
    //   path: "view",
    //   element: <Dashboard />,
    //   children: [
    //     {
    //       path: "planning/:job_id", // Untuk "/wellmaster"
    //       element: <ViewPlanningKKKS />,
    //     },
    //     {
    //       path: "operational/:job_id",
    //       element: <ViewExplorationKKKS />,
    //     },
    //     // {
    //     //   path: "operational/wrm/:job_id",
    //     //   element: <ViewOperationNew />,
    //     // },
    //     {
    //       path: "ppp/:job_id",
    //       element: <ViewPPP />,
    //     },
    //   ],
    // },

    // ==============================================================

    // {
    //   path: ":job_type/planning/view/:job_id",
    //   element: <Dashboard />,
    //   children: [
    //     {
    //       path: "",
    //       element: (
    //         <ProtectedRoute
    //           element={<JobTypeValidation element={<ViewPlanningKKKS />} />}
    //           allowedRoles={["KKKS"]}
    //         />
    //       ),
    //     },
    //   ],
    // },
    // {
    //   path: ":job_type/operating/view/:job_id",
    //   element: <Dashboard />,
    //   children: [
    //     {
    //       path: "",
    //       element: (
    //         <ProtectedRoute
    //           element={<JobTypeValidation element={<ViewExplorationKKKS />} />}
    //           allowedRoles={["KKKS"]}
    //         />
    //       ),
    //     },
    //   ],
    // },
    // {
    //   path: ":job_type/ppp/view/:job_id",
    //   element: <Dashboard />,
    //   children: [
    //     {
    //       path: "",
    //       element: (
    //         <ProtectedRoute
    //           element={<JobTypeValidation element={<ViewPppKKKS />} />}
    //           allowedRoles={["KKKS"]}
    //         />
    //       ),
    //     },
    //   ],
    // },
    // // :job_type/ppp/validate/:job_id
    // {
    //   path: ":job_type/planning/validate/:job_id",
    //   element: <Dashboard />,
    //   children: [
    //     {
    //       path: "",
    //       element: (
    //         <ProtectedRoute
    //           element={<JobTypeValidation element={<ViewPlanningKKKS />} />}
    //           allowedRoles={["KKKS"]}
    //         />
    //       ),
    //     },
    //   ],
    // },
    // {
    //   path: ":job_type/ppp/view/:job_id",
    //   element: <Dashboard />,
    //   children: [
    //     {
    //       path: "",
    //       element: (
    //         <ProtectedRoute
    //           element={<JobTypeValidation element={<ViewPppKKKS />} />}
    //           allowedRoles={["KKKS"]}
    //           />
    //       ),
    //     },
    //   ],
    // },
    {
      path: ":job_type",
      element: <Dashboard />,
      children: [
        {
          path: "planning/edit/:job_id",
          element: (
            <JobTypeValidation
              element={
                <ProtectedRoute
                  element={<EdittPlanningExpDev />}
                  allowedRoles={["KKKS"]}
                />
              }
            />
          ),
        },
        {
          path: "operation/wrm/:job_id",
          element: <ApproveForm />,
        },
        {
          path: "planning/view/:job_id",
          element: (
            <JobTypeValidation
              element={
                <ProtectedRoute
                  element={<ViewPlanningKKKS />}
                  allowedRoles={["KKKS"]}
                />
              }
            />
          ),
        },
        {
          // operating
          path: "operation/view/:job_id",
          element: (
            <JobTypeValidation
              element={
                <ProtectedRoute
                  element={<ViewExplorationKKKS />}
                  allowedRoles={["KKKS"]}
                />
              }
            />
          ),
        },
        {
          path: "ppp/view/:job_id",
          element: (
            <JobTypeValidation
              element={
                <ProtectedRoute element={<ViewPPP />} allowedRoles={["KKKS"]} />
              }
            />
          ),
        },
        {
          path: "planning/validate/:job_id",
          element: (
            <JobTypeValidation
              element={
                <ProtectedRoute
                  element={<ViewPlanningKKKS />}
                  allowedRoles={["KKKS"]}
                />
              }
            />
          ),
        },
        {
          path: "ppp/validate/:job_id", // Untuk "/wellmaster"
          element: (
            <JobTypeValidation
              element={
                <ProtectedRoute
                  element={<ViewPppKKKS />}
                  allowedRoles={["KKKS"]}
                />
              }
            />
          ),
        },
      ],
    },
    {
      path: "/skk",
      element: (
        <ProtectedRoute element={<DashboardSKK />} allowedRoles={["Admin"]} />
      ),
      children: [
        {
          path: "",
          element: (
            <ProtectedRoute
              element={<HomeDashSKK />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: ":job_type/planning/view/:job_id",
          element: (
            <JobTypeValidation
              element={
                <ProtectedRoute
                  element={<ViewPlanningKKKS />}
                  allowedRoles={["Admin"]}
                />
              }
            />
          ),
        },
        {
          // operating
          path: ":job_type/operating/view/:job_id",
          element: (
            <JobTypeValidation
              element={
                <ProtectedRoute
                  element={<ViewExplorationKKKS />}
                  allowedRoles={["Admin"]}
                />
              }
            />
          ),
        },
        {
          path: ":job_type/ppp/view/:job_id",
          element: (
            <JobTypeValidation
              element={
                <ProtectedRoute
                  element={<ViewPPP />}
                  allowedRoles={["Admin"]}
                />
              }
            />
          ),
        },
        {
          path: ":job_type/planning/validate/:job_id",
          element: (
            <JobTypeValidation
              element={
                <ProtectedRoute
                  element={<ViewPlanningKKKS />}
                  allowedRoles={["Admin"]}
                />
              }
            />
          ),
        },
        {
          path: ":job_type/ppp/validate/:job_id", // Untuk "/wellmaster"
          element: (
            <JobTypeValidation
              element={
                <ProtectedRoute
                  element={<ViewPppKKKS />}
                  allowedRoles={["Admin"]}
                />
              }
            />
          ),
        },
        {
          path: "map",
          element: (
            <ProtectedRoute element={<Map />} allowedRoles={["Admin"]} />
          ),
        },
        {
          path: "machine-learning",
          element: (
            <ProtectedRoute
              element={<MachineLearning />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "exploration",
          element: (
            <ProtectedRoute
              element={<ExplorationSKK />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "exploration/planning",
          element: (
            <ProtectedRoute
              element={<PlanningExp />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "exploration/operation",
          element: (
            <ProtectedRoute
              element={<OperationExp />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "exploration/ppp",
          element: (
            <ProtectedRoute element={<PPPExp />} allowedRoles={["Admin"]} />
          ),
        },
        {
          path: "exploration/closeout",
          element: (
            <ProtectedRoute
              element={<CloseOutExp />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "development",
          element: (
            <ProtectedRoute
              element={<DevelopmentSKK />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "development/planning",
          element: (
            <ProtectedRoute
              element={<PlanningDevelopment />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "development/operation",
          element: (
            <ProtectedRoute
              element={<OperationDev />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "development/ppp",
          element: (
            <ProtectedRoute element={<PPPDev />} allowedRoles={["Admin"]} />
          ),
        },
        {
          path: "development/closeout",
          element: (
            <ProtectedRoute
              element={<CloseOutDev />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "wellservice",
          element: (
            <ProtectedRoute
              element={<WellServiceSKK />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "wellservice/planning",
          element: (
            <ProtectedRoute
              element={<PlanningWellService />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "wellservice/operation",
          element: (
            <ProtectedRoute
              element={<OperationWS />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "wellservice/ppp",
          element: (
            <ProtectedRoute element={<PPPWS />} allowedRoles={["Admin"]} />
          ),
        },
        {
          path: "wellservice/closeout",
          element: (
            <ProtectedRoute element={<CloseOutWS />} allowedRoles={["Admin"]} />
          ),
        },
        {
          path: "workover",
          element: (
            <ProtectedRoute
              element={<WorkOverSKK />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "workover/planning",
          element: (
            <ProtectedRoute
              element={<PlanningWorkOver />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "workover/operation",
          element: (
            <ProtectedRoute
              element={<OperationWO />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "workover/ppp",
          element: (
            <ProtectedRoute element={<PPPWO />} allowedRoles={["Admin"]} />
          ),
        },
        {
          path: "workover/closeout",
          element: (
            <ProtectedRoute element={<CloseOutWO />} allowedRoles={["Admin"]} />
          ),
        },
        {
          path: "report",
          element: (
            <ProtectedRoute element={<Report />} allowedRoles={["Admin"]} />
          ),
        },
        // {
        //   path: "skk/view/planning/:job_id",
        //   element: (
        //     <ProtectedRoute
        //       element={<ViewPlannings />}
        //       allowedRoles={["Admin"]}
        //     />
        //   ),
        // },
        {
          path: "view/planning/:job_id",
          element: (
            <ProtectedRoute
              element={<ViewPlannings />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "wellmaster",
          element: (
            <ProtectedRoute
              element={<WellMasterSKK />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "rigmaster",
          element: (
            <ProtectedRoute
              element={<RigMasterSKK />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "report/division",
          element: (
            <ProtectedRoute
              element={
                <Report url={import.meta.env.VITE_DIVISION_REPORT_URL} />
              }
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "report/daily",
          element: (
            <ProtectedRoute
              element={<Report url={import.meta.env.VITE_DAILY_REPORT_URL} />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "report/weekly",
          element: (
            <ProtectedRoute
              element={<Report url={import.meta.env.VITE_WEEKLY_REPORT_URL} />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "report/monthly",
          element: (
            <ProtectedRoute
              element={<Report url={import.meta.env.VITE_MONTHLY_REPORT_URL} />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "report/ppp",
          element: (
            <ProtectedRoute
              element={<Report url={import.meta.env.VITE_PPP_REPORT_URL} />}
              allowedRoles={["Admin"]}
            />
          ),
        },
        {
          path: "report/pusdatin",
          element: (
            <ProtectedRoute
              element={
                <Report url={import.meta.env.VITE_PUSDATIN_REPORT_URL} />
              }
              allowedRoles={["Admin"]}
            />
          ),
        },
      ],
    },
    {
      path: "*",
      // element: <ErrorPage />,
      element: <PageNotFound />,
    },
    {
      path: "not-found",
      element: <PageNotFound />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router}/>

    </>
  );
}

export default App;
