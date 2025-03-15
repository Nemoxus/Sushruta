import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./index.css";

// Simple utility function to replace the cn from lib/utils
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const TextReveal = ({ children, className }) => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: targetRef });
  
    if (typeof children !== "string") {
      throw new Error("TextReveal: children must be a string");
    }
  
    const lines = children.split("\n");  // Split into separate lines
  
    return (
      <div ref={targetRef} className={cn("text-reveal-container", className)}>
        <div className="text-reveal-content">
          {lines.map((line, i) => (
            <motion.div
              key={i}
              className="text-reveal-line"
              style={{ opacity: useTransform(scrollYProgress, [i / lines.length, (i + 1) / lines.length], [0, 1]) }}
            >
              {line}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

const Word = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="text-reveal-word">
      <span className="text-reveal-word-bg">{children}</span>
      <motion.span style={{ opacity: opacity }} className="text-reveal-word-fg">
        {children}
      </motion.span>
    </span>
  );
};

export default TextReveal;