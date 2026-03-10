import { motion, AnimatePresence } from "framer-motion";
import { Layers } from "lucide-react";

interface LogoAnimationProps {
  collapsed?: boolean;
  onAnimationComplete?: () => void;
}

const LogoAnimation = ({ collapsed = false, onAnimationComplete }: LogoAnimationProps) => {
  return (
    <div className="flex items-center gap-2.5 justify-center">
      <motion.div
        className="w-7 h-7 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center"
        animate={collapsed ? { scale: [1, 1.2, 1], rotate: [0, 90, 0] } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onAnimationComplete={onAnimationComplete}
      >
        <Layers className="w-3.5 h-3.5 text-primary" />
      </motion.div>
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            className="font-display font-bold text-sm text-foreground tracking-tight overflow-hidden whitespace-nowrap"
            initial={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Instruction OS
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogoAnimation;
