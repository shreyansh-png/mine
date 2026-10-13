import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const stars = [
  { top: "12%", left: "14%" },
  { top: "22%", left: "83%" },
  { top: "43%", left: "8%" },
  { top: "62%", left: "92%" },
  { top: "78%", left: "17%" },
  { top: "85%", left: "76%" },
  { top: "32%", left: "94%" },
  { top: "70%", left: "5%" },
];

export default function FinalChapter() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      id="final-chapter"
      className="relative isolate flex min-h-[90svh] items-center justify-center overflow-hidden bg-[#111119] px-5 py-24 text-[#F4EAF0] sm:py-32"
    >
      {/* Soft ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9D456E]/10 blur-[110px] sm:h-[600px] sm:w-[600px]"
      />

      {/* Quiet stars */}
      {stars.map((star, index) => (
        <motion.span
          key={index}
          aria-hidden="true"
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-[#E8BDD0]/70"
          style={{ top: star.top, left: star.left }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.3, 0.8] }}
          transition={{
            duration: 3 + (index % 3),
            repeat: Infinity,
            delay: index * 0.35,
          }}
        />
      ))}

      <div className="relative mx-auto w-full max-w-2xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[9px] tracking-[0.38em] text-[#C99BB5] sm:text-[10px]"
        >
          AND THIS ISN'T THE END
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="mx-auto mt-6 max-w-xl font-serif text-4xl leading-tight sm:text-6xl"
        >
          Until Our
          <span className="block italic text-[#D6A3BC]">
            Next Chapter
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 1 }}
          className="mx-auto mt-6 max-w-md text-sm leading-7 text-white/50"
        >
          Three letters, countless memories, and a thousand
          little moments still waiting for us
        </motion.p>

        <div className="relative mx-auto mt-14 flex min-h-[260px] items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {!isOpen ? (
              <motion.div
                key="sealed-envelope"
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.88 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col items-center"
              >
                <motion.button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  whileHover={{ y: -7, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label="Open your final letter"
                  aria-expanded={isOpen}
                  className="group relative block w-[260px] max-w-[78vw] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99BB5] focus-visible:ring-offset-8 focus-visible:ring-offset-[#111119] sm:w-[300px]"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <svg
                      viewBox="0 0 320 220"
                      className="w-full overflow-visible drop-shadow-[0_18px_35px_rgba(0,0,0,0.3)]"
                      aria-hidden="true"
                    >
                      <rect
                        x="15"
                        y="42"
                        width="290"
                        height="164"
                        rx="9"
                        fill="#251923"
                        stroke="#C99BB5"
                        strokeOpacity="0.65"
                      />

                      <path
                        d="M17 48 L160 151 L303 48"
                        fill="none"
                        stroke="#9B6B85"
                        strokeWidth="2"
                      />

                      <path
                        d="M17 199 L113 118 M303 199 L207 118"
                        fill="none"
                        stroke="#9B6B85"
                        strokeOpacity="0.7"
                        strokeWidth="2"
                      />

                      <path
                        d="M18 48 L160 143 L302 48"
                        fill="#3D2539"
                        stroke="#C99BB5"
                        strokeOpacity="0.8"
                        strokeWidth="1.5"
                      />

                      <circle
                        cx="160"
                        cy="144"
                        r="24"
                        fill="#C99BB5"
                      />

                      <path
                        d="M160 157 C151 149 143 143 143 136 C143 125 156 123 160 133 C165 123 177 125 177 136 C177 143 169 150 160 157Z"
                        fill="#672D4B"
                      />
                    </svg>

                    <span className="absolute -right-3 top-1/2 -translate-y-1/2 font-serif text-3xl italic text-[#D6A3BC]">
                      ♡
                    </span>
                  </motion.div>
                </motion.button>

                <p className="mt-8 text-[9px] tracking-[0.3em] text-white/35">
                  A LITTLE SOMETHING FOR YOU
                </p>

                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="mt-4 border-b border-[#C99BB5]/50 pb-2 text-[10px] tracking-[0.25em] text-[#E8BDD0] transition hover:border-[#C99BB5] hover:text-white"
                >
                  OPEN MY LAST LETTER ↗
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="final-letter"
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.98 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="w-full rounded-sm border border-[#C99BB5]/30 bg-[#1A151D]/95 px-6 py-9 text-left shadow-[0_20px_80px_rgba(0,0,0,0.25)] sm:px-12 sm:py-12"
              >
                <p className="text-center text-[9px] tracking-[0.32em] text-[#C99BB5]">
                  TO MY CUCKOO
                </p>

                <h3 className="mt-5 text-center font-serif text-3xl leading-tight sm:text-4xl">
                  Happy Anniversary,
                  <span className="mt-1 block italic text-[#D6A3BC]">
                    Cuckoo ♡
                  </span>
                </h3>

                <div className="mx-auto my-7 h-px w-16 bg-[#C99BB5]/50" />

                <div className="space-y-5 text-sm leading-8 text-white/65 sm:text-base">
                  <p>
                    If these pages could hold every little thing I feel
                    for you, they would never be enough
                  </p>

                  <p>
                    Thank you for every laugh, every random moment,
                    every little memory, and all the happiness you bring
                  </p>

                  <p>
                    This isn't the end of our story — just another page
                  </p>

                  <p>
                    I can't wait for all the ordinary days, silly
                    conversations, new places, and tiny moments still
                    waiting for us
                  </p>
                </div>

                <div className="mt-9 border-t border-white/10 pt-6 text-right">
                  <p className="font-serif text-xl italic text-[#E8BDD0]">
                    Yours, always
                  </p>

                  <p className="mt-2 font-serif text-2xl italic text-white/90">
                    Shreyansh ♡
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mx-auto mt-8 block border-b border-white/20 pb-2 text-[9px] tracking-[0.25em] text-white/40 transition hover:border-[#C99BB5] hover:text-[#E8BDD0]"
                >
                  FOLD THE LETTER BACK
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-12"
        >
          <div className="mx-auto mb-5 h-px w-12 bg-[#C99BB5]/40" />

          <p className="font-serif text-lg italic text-white/75">
            Our story is still being written
          </p>

          <p className="mt-4 text-[9px] tracking-[0.3em] text-[#C99BB5]/60">
            MADE WITH LOVE, ALWAYS
          </p>
        </motion.div>
      </div>
    </section>
  );
}