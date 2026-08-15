"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { duration, ease, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  blur?: boolean;
  once?: boolean;
  amount?: number;
};

export function Reveal({ delay = 0, y = 24, blur = true, className, children, amount, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: blur ? "blur(6px)" : "none" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ ...viewportOnce, amount: amount ?? viewportOnce.amount }}
      transition={{ duration: duration.cinematic, ease: ease.outExpo, delay }}
      className={cn("will-change-transform", className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({ className, children, gap = 0.07, ...rest }: HTMLMotionProps<"div"> & { gap?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: gap } } }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ className, children, y = 20, ...rest }: HTMLMotionProps<"div"> & { y?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.cinematic, ease: ease.outExpo } },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
