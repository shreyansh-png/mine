
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const fireflies = [
  { x: "12%", y: "24%", delay: 0 },
  { x: "83%", y: "19%", delay: 1.2 },
  { x: "22%", y: "72%", delay: 0.7 },
  { x: "76%", y: "78%", delay: 1.8 },
  { x: "48%", y: "15%", delay: 0.4 },
  { x: "91%", y: "48%", delay: 2 },
  { x: "8%", y: "54%", delay: 1 },
  { x: "64%", y: "31%", delay: 1.5 },
];

export default function Intro({ onStartMusic }) {
  const [bloom, setBloom] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  function beginStory() {
    if (leaving) return;

    onStartMusic?.();

    setBloom(true);
    setLeaving(true);

    timeoutRef.current = window.setTimeout(() => {
      document.getElementById("particle-portrait")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setLeaving(false);
    }, 550);
  }

  return (
    <section
      className={`relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#111119] px-6 text-[#F2EEF2] transition-opacity duration-700 ${
        leaving ? "opacity-70" : "opacity-100"
      }`}
    >
      {/* Original dark theme: only a little ambient colour */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,#261725_0%,#111119_65%)]" />

      {/* Very subtle orbital lines */}
      <svg
        viewBox="0 0 500 500"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(85vw,500px)] w-[min(85vw,500px)] -translate-x-1/2 -translate-y-1/2"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="250"
          cy="250"
          r="190"
          stroke="#C99BB5"
          strokeOpacity="0.09"
        />
        <ellipse
          cx="250"
          cy="250"
          rx="125"
          ry="190"
          transform="rotate(-32 250 250)"
          stroke="#C99BB5"
          strokeOpacity="0.07"
        />
      </svg>

      {/* Fireflies: quiet, not a particle overload */}
      {fireflies.map((fly, index) => (
        <motion.span
          key={index}
          className="pointer-events-none absolute z-[1] h-1 w-1 rounded-full bg-[#DAB4C9]"
          style={{
            left: fly.x,
            top: fly.y,
            boxShadow: "0 0 10px #C99BB577",
          }}
          animate={{
            x: [0, 8, -5, 0],
            y: [0, -12, 5, 0],
            opacity: [0.15, 0.65, 0.25, 0.15],
          }}
          transition={{
            duration: 7 + (index % 3),
            delay: fly.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Two small lights slowly meet behind the title */}
      <motion.span
        className="pointer-events-none absolute left-[12%] top-[38%] z-[1] h-2 w-2 rounded-full bg-[#D9A4C1] shadow-[0_0_18px_6px_#D9A4C122] blur-[1px]"
        animate={{
          x: ["0vw", "3vw", "32vw"],
          y: ["0vh", "-2vh", "12vh"],
          opacity: [0.25, 0.7, 0.5],
        }}
        transition={{
          duration: 7,
          times: [0, 0.15, 1],
          ease: "easeInOut",
        }}
      />

      <motion.span
        className="pointer-events-none absolute right-[12%] top-[62%] z-[1] h-2 w-2 rounded-full bg-[#D6B7A5] shadow-[0_0_18px_6px_#D6B7A522] blur-[1px]"
        animate={{
          x: ["0vw", "-3vw", "-32vw"],
          y: ["0vh", "2vh", "-12vh"],
          opacity: [0.25, 0.7, 0.5],
        }}
        transition={{
          duration: 7,
          times: [0, 0.15, 1],
          ease: "easeInOut",
        }}
      />

      {/* One quiet bloom, only after the two lights meet */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C99BB5]/20"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={
          bloom
            ? { scale: [0.4, 2.5], opacity: [0.5, 0] }
            : { scale: [0.75, 1], opacity: [0.05, 0.18] }
        }
        transition={
          bloom
            ? { duration: 1.1, ease: "easeOut" }
            : { duration: 4, repeat: Infinity, repeatType: "reverse" }
        }
      />

      {/* Main intro: same composition as before */}
      <main className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-7 text-[10px] tracking-[0.32em] text-white/45 sm:text-xs"
        >
          A LITTLE WORLD, JUST FOR
        </motion.p>

        <h1
          aria-label="Cuckoo"
          className="whitespace-nowrap font-['Cormorant_Garamond'] text-[clamp(4.5rem,17vw,9rem)] font-semibold italic leading-none tracking-[-0.045em]"
        >
          {"Cuckoo".split("").map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              initial={{ opacity: 0, filter: "blur(8px)", y: 8 }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                y: 0,
              }}
              transition={{
                duration: 1.1,
                delay: 0.2 + index * 0.12,
                ease: "easeOut",
              }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
          <span className="text-[#C99BB5]">.</span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1.2 }}
          className="mt-5 font-['Caveat'] text-2xl text-[#C99BB5] sm:text-3xl"
        >
          my favourite person ♡
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 1.2 }}
          className="mt-5 text-[10px] tracking-[0.18em] text-white/35"
        >
          365 DAYS OF US
        </motion.p>


<motion.button
  type="button"
  onClick={beginStory}
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 2.2, duration: 1 }}
  whileHover={{ color: "#FFFFFF" }}
  whileTap={{ scale: 0.97 }}
  className="group mt-12 inline-flex items-center gap-3 border-b border-[#C99BB5]/40 pb-2 text-[10px] tracking-[0.22em] text-white/60 transition-colors hover:border-[#C99BB5] sm:mt-14"
>
  OPEN OUR STORY
  <span className="text-[#C99BB5] transition-transform duration-300 group-hover:translate-x-1">
    ↗
  </span>
</motion.button>

      

      </main>

      {/* Quiet footer */}
      <footer className="absolute bottom-7 left-0 right-0 z-10 text-center">
        <p className="text-[9px] tracking-[0.2em] text-white/30">
          17 OCTOBER · MADE FOR CUCKOO
        </p>
      </footer>
    </section>
  );
}