import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "./Auth/AuthContext.jsx";
import { JobProvider } from "./Context/JobContext.jsx";
import {
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import "@fontsource/mulish"; // Defaults to weight 400
import "@fontsource/mulish/400.css"; // Specify weight
import "@fontsource/mulish/400-italic.css"; // Specify weight and style

const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChakraProvider>
      <AuthProvider>
        <JobProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </JobProvider>
      </AuthProvider>
    </ChakraProvider>
  </StrictMode>
);
