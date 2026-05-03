import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, AnimatePresence } from "motion/react";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface BoxProps {
  mouseX: any;
  mouseY: any;
  index: number;
  key?: React.Key;
}

const Box = ({ mouseX, mouseY, index }: BoxProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Use springs for smooth movement
  const rotateX = useSpring(0, { stiffness: 100, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 100, damping: 20 });
  const translateZ = useSpring(0, { stiffness: 100, damping: 20 });
  const scale = useSpring(1, { stiffness: 100, damping: 20 });
  const opacity = useSpring(0.1, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const update = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = mouseX.get() - centerX;
      const dy = mouseY.get() - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const maxDist = 250;
      const strength = Math.max(0, 1 - dist / maxDist);

      // Apply rotations and Z-translation (rising effect)
      rotateX.set(dy * 0.2 * strength);
      rotateY.set(-dx * 0.2 * strength);
      translateZ.set(strength * 80); // Rise up to 80px
      scale.set(1 + strength * 0.3);
      opacity.set(0.1 + strength * 0.7);
    };

    const unsubscribeX = mouseX.on("change", update);
    const unsubscribeY = mouseY.on("change", update);

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY, rotateX, rotateY, translateZ, scale, opacity]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0, z: -100 }}
      animate={{ opacity: 0.1, scale: 1, z: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.0005,
        opacity: { duration: 0.5 },
        scale: { type: "spring", stiffness: 100, damping: 15 }
      }}
      style={{
        rotateX,
        rotateY,
        z: translateZ,
        scale,
        opacity,
        transformStyle: "preserve-3d",
      }}
      className="w-10 h-10 bg-primary/20 border border-primary/10 rounded-md flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]"
    >
      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
    </motion.div>
  );
};

const Typewriter = () => {
  const sentences = [
    "A splendidly interactive website featuring a reactive 3D grid system.",
    "Experience fluid motion and immersive depth as you move your cursor.",
    "Crafting digital environments that respond to your every movement."
  ];
  
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(50);

  useEffect(() => {
    const handleType = () => {
      const currentSentence = sentences[index];
      
      if (isDeleting) {
        // Deleting text
        setDisplayText(currentSentence.substring(0, displayText.length - 1));
        setSpeed(30);
      } else {
        // Typing text
        setDisplayText(currentSentence.substring(0, displayText.length + 1));
        setSpeed(50);
      }

      // Logic for switching states
      if (!isDeleting && displayText === currentSentence) {
        // Finished typing, wait before deleting
        setSpeed(2000);
        setIsDeleting(true);
      } else if (isDeleting && displayText === "") {
        // Finished deleting, wait before typing next sentence
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % sentences.length);
        setSpeed(500);
      }
    };

    const timer = setTimeout(handleType, speed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, speed]);

  return (
    <div className="h-16 flex items-center justify-center">
      <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
        {displayText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-5 bg-primary ml-1 align-middle"
        />
      </p>
    </div>
  );
};

const JuicyButton = ({ children, variant = "primary", href }: { children: React.ReactNode, variant?: "primary" | "outline", href: string }) => {
  const [isBursting, setIsBursting] = useState(false);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, color: string }[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    if (isBursting) return;
    
    setIsBursting(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: Date.now() + i,
      x: centerX,
      y: centerY,
      color: variant === "primary" ? "var(--primary)" : "var(--muted-foreground)"
    }));

    setParticles(newParticles);

    // Navigate after a short delay
    setTimeout(() => {
      window.open(href, "_blank");
    }, 400);

    // Reset particles after animation completes
    setTimeout(() => {
      setIsBursting(false);
      setParticles([]);
    }, 800);
  };

  return (
    <div className="relative">
      <motion.button
        animate={isBursting ? { 
          scale: [1, 1.15, 1],
          filter: ["blur(0px)", "blur(2px)", "blur(0px)"],
        } : {}}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={cn(
          "px-8 py-4 rounded-full font-medium transition-all relative z-10",
          variant === "primary" 
            ? "bg-primary text-primary-foreground" 
            : "border border-primary/20 hover:bg-primary/5"
        )}
      >
        {children}
      </motion.button>

      {isBursting && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ 
                x: (Math.random() - 0.5) * 300, 
                y: (Math.random() - 0.5) * 300, 
                scale: 0,
                opacity: 0,
                rotate: Math.random() * 360
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute w-2 h-2 rounded-sm"
              style={{ backgroundColor: p.color }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const InteractiveBoxGrid = () => {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const [gridSize, setGridSize] = useState({ cols: 0, rows: 0 });

  useEffect(() => {
    const updateGrid = () => {
      const cols = Math.ceil(window.innerWidth / 48);
      const rows = Math.ceil(window.innerHeight / 48);
      setGridSize({ cols, rows });
    };

    updateGrid();
    window.addEventListener("resize", updateGrid);
    return () => window.removeEventListener("resize", updateGrid);
  }, []);

  const boxes = useMemo(() => {
    return Array.from({ length: gridSize.cols * gridSize.rows }).map((_, i) => (
      <Box key={i} index={i} mouseX={mouseX} mouseY={mouseY} />
    ));
  }, [gridSize.cols, gridSize.rows, mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(800px circle at ${mouseX}px ${mouseY}px, rgba(var(--primary-rgb), 0.15), transparent 80%)`;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center"
      style={{ perspective: "1500px" }}
    >
      {/* Background Grid */}
      <div 
        className="absolute inset-0 grid justify-center content-center gap-2 p-4"
        style={{
          gridTemplateColumns: `repeat(${gridSize.cols}, 40px)`,
          gridTemplateRows: `repeat(${gridSize.rows}, 40px)`,
          transformStyle: "preserve-3d",
        }}
      >
        {boxes}
      </div>
      
      {/* Ambient Light */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="inline-block px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium tracking-widest uppercase text-primary mb-4">
            Interactive Design
          </div>
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-none">
            SPLINE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/50">
              INSPIRED
            </span>
          </h1>
          
          <Typewriter />
          
          <div className="pt-4 pointer-events-auto flex gap-4 justify-center">
            <JuicyButton href="https://github.com/iamzanz">
              Get Started
            </JuicyButton>
            <JuicyButton variant="outline" href="https://github.com/iamzanz">
              View Project
            </JuicyButton>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50 pointer-events-none">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="text-xl font-bold tracking-tighter pointer-events-auto cursor-pointer"
        >
          ZAN.
        </motion.div>
        <div className="flex gap-8 text-sm font-medium tracking-wide uppercase pointer-events-auto">
          <motion.a 
            href="#" 
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="hover:text-primary transition-colors"
          >
            Work
          </motion.a>
          <motion.a 
            href="#" 
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="hover:text-primary transition-colors"
          >
            About
          </motion.a>
          <motion.a 
            href="#" 
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="hover:text-primary transition-colors"
          >
            Contact
          </motion.a>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="fixed bottom-8 left-8 right-8 flex justify-between items-end z-50 pointer-events-none text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <div>© 2026 I'm Zanz</div>
        <div className="text-right">
        </div>
      </div>
    </div>
  );
};
