import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import "./styles.css";
import App from "./App";
const client = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } });
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><ConfigProvider theme={{ token: { colorPrimary: "#165DFF", borderRadius: 8, fontFamily: "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" } }}><QueryClientProvider client={client}><App /></QueryClientProvider></ConfigProvider></React.StrictMode>);
