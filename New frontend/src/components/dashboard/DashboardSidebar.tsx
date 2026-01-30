import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import {
  GraduationCap,
  LayoutDashboard,
  Search,
  Star,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Search, label: "Discover", path: "/discover" },
  { icon: Star, label: "Shortlist", path: "/shortlist" },
  { icon: FileText, label: "Applications", path: "/applications" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const DashboardSidebar = ({ isOpen, setOpen }: { isOpen?: boolean, setOpen?: (val: boolean) => void }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useApp();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen?.(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{
          x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -256 : 0),
          opacity: 1,
          width: collapsed ? 72 : 256
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-50 transition-all",
          "lg:translate-x-0",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md flex-shrink-0"
            >
              <GraduationCap className="h-5 w-5" />
            </motion.div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-lg font-bold text-foreground font-bungee tracking-tight"
                >
                  AI Counsellor
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.1 }}
              >
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm relative overflow-hidden",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10"
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                  </motion.div>
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-border">
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm w-full",
              "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Collapse toggle (Desktop only) */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -right-3 top-20 hidden lg:block"
        >
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full bg-card border shadow-sm"
            onClick={() => setCollapsed(!collapsed)}
          >
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="h-3 w-3" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.aside>
    </>
  );
};
