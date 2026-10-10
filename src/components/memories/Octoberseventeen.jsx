
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const letters = [
  {
    number: "01",
    title: "The first letter",
    text: "Replace this with the exact words from your first original letter.",
  },
  {
    number: "02",
    title: "The second letter",
    text: "Replace this with the exact words from your second original letter.",
  },
  {
    number: "03",
    title: "The third letter",
    text: "Replace this with the exact words from your third original letter.",
  },
];

export default function OctoberSeventeen() {
  const [opened, setOpened] = useState(null);

  return (
    <section
      id="october-seventeen"
      className="relative overflow-hidden bg-[#111119] px-6 py-28 text-[#F2EEF2] sm:py-36"
    >
      <div className="mx-auto max-w-3xl">

        {/* Chapter introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9 }}
          className="mb-20 text-center sm:mb-28"
        >
          <p className="text-[10px] tracking-[0.3em] text-white/40">
            17 OCTOBER · LAST YEAR
          </p>

          <h2 className="mt-7 font-serif text-5xl font-normal leading-tight tracking-tight sm:text-7xl">
            A day that became
            <span className="mt-1 block text-[#C99BB5]">
              a part of us.
            </span>
          </h2>

          <p
            className="mx-auto mt-7 max-w-md text-2xl leading-relaxed text-white/65 sm:text-3xl"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            Some feelings are easier to write than to say. ♡
          </p>

          <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-white/40">
            Three letters, written a year ago, carrying pieces of my heart.
          </p>
        </motion.div>

        {/* Three original letters */}
        <div className="border-t border-white/10">
          {letters.map((letter, index) => {
            const isOpen = opened === index;

            return (
              <motion.div
                key={letter.number}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className="border-b border-white/10"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpened(isOpen ? null : index)
                  }
                  className="group flex w-full items-center gap-5 py-7 text-left sm:py-9"
                >
                  <span className="font-serif text-2xl italic text-[#C99BB5]">
                    {letter.number}
                  </span>

                  <span className="flex-1">
                    <span className="block text-xs tracking-[0.18em] text-white/45">
                      LETTER {letter.number}
                    </span>

                    <span className="mt-2 block font-serif text-2xl text-white/90 transition-colors group-hover:text-[#E8BDD0] sm:text-3xl">
                      {letter.title}
                    </span>
                  </span>

                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    className="text-xl text-[#C99BB5]"
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pl-10 sm:pl-14">
                        <div className="border-l border-[#C99BB5]/35 pl-5 sm:pl-7">
                          <p
                            className="whitespace-pre-line text-xl leading-relaxed text-[#E8BDD0] sm:text-2xl"
                            style={{ fontFamily: "'Caveat', cursive" }}
                          >
                            {letter.text}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[10px] tracking-[0.16em] text-white/30">
          OPEN EACH LETTER WHENEVER YOU LIKE ♡
        </p>
      </div>
    </section>
  );
}
