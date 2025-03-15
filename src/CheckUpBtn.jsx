import React from "react"
import { ArrowRight } from "lucide-react"

// Simple utility function to replace the cn from lib/utils
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const CheckUpBtn = React.forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "check-up-btn",
          className,
        )}
        {...props}
      >
        <div className="check-up-btn-content">
          <div className="check-up-btn-dot"></div>
          <span className="check-up-btn-text">
            {children}
          </span>
        </div>
        <div className="check-up-btn-hover">
          <span>{children}</span>
          <ArrowRight />
        </div>
      </button>
    )
  }
)

CheckUpBtn.displayName = "CheckUpBtn"

export default CheckUpBtn;