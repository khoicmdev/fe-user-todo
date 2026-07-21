import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { queryClientAtom } from "jotai-tanstack-query";
import { Toaster } from "@repo/ui";
import { router } from "./routes/router-config";
import { queryClient } from "./lib/query-client";
import "./style.css";

// This ensures all atomWithQuery/atomWithMutation atoms use the same
// QueryClient instance as the QueryClientProvider above them.
function HydrateAtoms({ children }: { children: React.ReactNode }) {
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return <>{children}</>;
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {/* Single QueryClientProvider shared by ALL features (users, todos, etc.) */}
      <QueryClientProvider client={queryClient}>
        <Provider>
          <HydrateAtoms>
            <RouterProvider router={router} />
            <Toaster />
          </HydrateAtoms>
        </Provider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
