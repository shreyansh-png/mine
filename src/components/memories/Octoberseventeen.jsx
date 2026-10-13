import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const letters = [
  {
    number: "01",
    title: "Meri Cuckoo...",
    subtitle: "A little poem, written for you",
    image: "/assets/letters/l1.png",
  },
  {
    number: "02",
    title: "The Invisible String Theory",
    subtitle: "Maybe the universe knew",
    image: "/assets/letters/l2.png",
  },
  {
    number: "03",
    title: "I Love You!!!",
    subtitle: "A few things from my heart",
    image: "/assets/letters/l3.png",
  },
];

export default function OctoberSeventeen() {
  const [activeIndex, setActiveIndex] = useState(null);

  const activeLetter =
    activeIndex === null ? null : letters[activeIndex];

  function showPrevious() {
    setActiveIndex(
      (current) => (current - 1 + letters.length) % letters.length
    );
  }

  function showNext() {
    setActiveIndex(
      (current) => (current + 1) % letters.length
    );
  }

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex]);

  return (
    <section
      id="october-seventeen"
      className="relative overflow-hidden bg-[#111119] px-5 py-24 text-[#F4EAF0] sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-[10px] tracking-[0.35em] text-[#C99BB5]"
        >
          OCTOBER 17 · JUST FOR YOU
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-5 text-center font-serif text-4xl sm:text-6xl"
        >
          Three Letters, One Heart.
        </motion.h2>

        <p className="mx-auto mt-5 max-w-md text-center text-sm leading-7 text-white/45">
          Some feelings are too special to leave unsaid.
          I saved a little piece of my heart for you in each one.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">
          {letters.map((letter, index) => (
            <motion.button
              key={letter.number}
              type="button"
              onClick={() => setActiveIndex(index)}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="group text-left"
            >
              <div className="relative overflow-hidden rounded-2xl border border-[#C99BB5]/20 bg-[#1A151E] p-5 transition-colors duration-300 group-hover:border-[#C99BB5]/60 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.25em] text-[#C99BB5]">
                    LETTER {letter.number}
                  </span>

                  <span className="text-sm text-[#C99BB5]">
                    ♡
                  </span>
                </div>

                {/* Envelope illustration */}
                <div className="relative mx-auto mt-7 flex aspect-[1.45/1] w-full max-w-[280px] items-center justify-center">
                  <svg
                    viewBox="0 0 320 210"
                    className="h-full w-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.25)]"
                    aria-hidden="true"
                  >
                    <rect
                      x="15"
                      y="28"
                      width="290"
                      height="166"
                      rx="8"
                      fill="#211923"
                      stroke="#8C647B"
                      strokeOpacity="0.65"
                    />

                    <path
                      d="M17 34 L160 130 L303 34"
                      fill="none"
                      stroke="#C99BB5"
                      strokeOpacity="0.7"
                      strokeWidth="2"
                    />

                    <path
                      d="M17 190 L115 105 M303 190 L205 105"
                      fill="none"
                      stroke="#8C647B"
                      strokeOpacity="0.75"
                      strokeWidth="1.5"
                    />

                    <circle
                      cx="160"
                      cy="130"
                      r="23"
                      fill="#C99BB5"
                    />

                    <path
                      d="M160 142 C154 136 145 130 145 123 C145 113 157 111 160 120 C165 111 176 113 176 123 C176 130 166 137 160 142Z"
                      fill="#542D45"
                    />
                  </svg>

                  <span className="absolute bottom-[10%] right-[10%] text-[9px] tracking-widest text-white/40">
                    FOR CUCKOO
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="font-serif text-xl leading-snug text-white/90">
                    {letter.title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-white/45">
                    {letter.subtitle}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-[10px] tracking-[0.2em] text-white/45">
                      OPEN LETTER
                    </span>

                    <span className="text-[#C99BB5] transition-transform duration-300 group-hover:translate-x-1">
                      ↗
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="mt-10 text-center font-serif text-sm italic text-white/35">
          Made with love, always.
        </p>
      </div>

      {/* Open letter overlay */}
      <AnimatePresence>
        {activeLetter && (
          <motion.div
            key={activeLetter.number}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIndex(null)}
            className="fixed inset-0 z-[100] overflow-y-auto bg-[#0C0A10]/95 px-4 py-8 backdrop-blur-md sm:px-8"
            role="dialog"
            aria-modal="true"
            aria-label={activeLetter.title}
          >
            <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center">
              <div className="mb-5 flex w-full items-center justify-between">
                <p className="text-[10px] tracking-[0.25em] text-[#C99BB5]">
                  LETTER {activeLetter.number} OF 03
                </p>

                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:border-[#C99BB5] hover:text-white"
                  aria-label="Close letter"
                >
                  CLOSE ✕
                </button>
              </div>

              <motion.div
                initial={{ y: 24, scale: 0.97 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 12, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                onClick={(event) => event.stopPropagation()}
                className="w-full overflow-hidden rounded-sm border border-[#C99BB5]/25 bg-[#F5F0E7] shadow-[0_25px_100px_rgba(0,0,0,0.45)]"
              >
                <img
                  src={activeLetter.image}
                  alt={activeLetter.title}
                  className="block h-auto w-full"
                />
              </motion.div>

              <div className="mt-5 flex w-full items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={showPrevious}
                  className="rounded-full border border-[#C99BB5]/30 px-4 py-3 text-xs text-[#E8BDD0] transition hover:bg-white/5"
                >
                  ← Previous
                </button>

                <span className="text-center text-[9px] tracking-[0.2em] text-white/35">
                  A LITTLE PIECE OF MY HEART
                </span>

                <button
                  type="button"
                  onClick={showNext}
                  className="rounded-full border border-[#C99BB5]/30 px-4 py-3 text-xs text-[#E8BDD0] transition hover:bg-white/5"
                >
                  Next →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}