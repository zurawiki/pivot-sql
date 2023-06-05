import ReactDOM from "react-dom/client";

import "./index.css";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { App } from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  // <React.StrictMode> //disabled for react-dnd preview bug for now
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>
  // </React.StrictMode>
);
