import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { motion, AnimatePresence } from "framer-motion";

createRoot(document.getElementById("root")!).render(
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <App />
    </motion.div>
  </AnimatePresence>
);
