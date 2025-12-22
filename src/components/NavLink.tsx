/**
 * @fileoverview Custom NavLink wrapper for React Router.
 * Provides className-based styling for active/pending states.
 */

import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Props for the NavLink component extending React Router's NavLinkProps.
 */
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  /** Base className applied to the link */
  className?: string;
  /** Additional className when the route is active */
  activeClassName?: string;
  /** Additional className when navigation is pending */
  pendingClassName?: string;
}

/**
 * Custom NavLink component wrapping React Router's NavLink.
 * Simplifies applying active/pending styles via separate className props
 * instead of using a function for the className prop.
 *
 * @example
 * <NavLink to="/home" className="nav-item" activeClassName="active" />
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
