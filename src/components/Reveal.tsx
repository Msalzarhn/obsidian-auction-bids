import { motion, useReducedMotion, type Variants, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

function useVariants(distance = 24): Variants {
  const reduce = useReducedMotion();
  return {
    hidden: reduce
      ? { opacity: 0 }
      : { opacity: 0, y: distance, scale: 0.98, filter: "blur(6px)" },
    visible: reduce
      ? { opacity: 1, transition: { duration: 0.3 } }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.75, ease: EASE },
        },
  };
}

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  distance?: number;
  once?: boolean;
  amount?: number;
  as?: "div" | "section" | "header" | "footer" | "ul" | "li";
  immediate?: boolean;
};

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(function Reveal(
  { children, delay = 0, distance = 24, once = false, amount = 0.2, immediate = false, as = "div", ...rest },
  ref
) {
  const variants = useVariants(distance);
  const Comp = motion[as] as typeof motion.div;
  const activation = immediate
    ? { initial: "hidden" as const, animate: "visible" as const }
    : { initial: "hidden" as const, whileInView: "visible" as const, viewport: { once, amount, margin: "0px 0px -8% 0px" } };

  return (
    <Comp
      ref={ref}
      variants={variants}
      transition={{ delay }}
      {...activation}
      {...rest}
    >
      {children}
    </Comp>
  );
});

type RevealGroupProps = HTMLMotionProps<"div"> & {
  stagger?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
  as?: "div" | "section" | "ul" | "ol";
};

export function RevealGroup({
  children,
  stagger = 0.08,
  delay = 0,
  once = false,
  amount = 0.15,
  as = "div",
  ...rest
}: RevealGroupProps) {
  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: "0px 0px -8% 0px" }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({
  children,
  distance = 24,
  className,
  ...rest
}: HTMLMotionProps<"div"> & { distance?: number }) {
  const variants = useVariants(distance);
  return (
    <motion.div variants={variants} className={className} {...rest}>
      {children}
    </motion.div>
  );
}
