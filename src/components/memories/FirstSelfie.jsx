
import { motion } from "motion/react";

export default function FirstSelfie() {
  return (
    <section
      id="first-selfie"
      className="flex min-h-screen items-center justify-center bg-[#111119] px-5 py-24 text-[#F2EEF2] sm:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Small editorial label */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.22em] text-white/60">
            THE FIRST SELFIE
          </span>

          <span className="text-[10px] tracking-[0.18em] text-[#C99BB5]">
            SEPT 27, 2025
          </span>
        </div>

        {/* Photo card */}
        <div className="border border-white/10 bg-white/[0.025] p-2.5 sm:p-3">
          <img
            src="/assets/photos/first-selfie.jpg"
            alt="Our first selfie together"
            loading="lazy"
            className="mx-auto block h-auto max-h-[65svh] w-full object-contain"
          />
        </div>

        {/* Caption */}
        <div className="mt-7 text-center sm:mt-9">
          <p className="text-[9px] tracking-[0.25em] text-white/40">
            BEFORE WE KNEW
          </p>

          <h2
            className="mx-auto mt-4 max-w-sm text-3xl leading-snug text-[#E8BDD0] sm:text-4xl"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            Little did we know, this one selfie would become the beginning of
            our little world ♡
          </h2>

          <p className="mt-5 text-xs text-white/40">
            And now, look at us
          </p>
        </div>
      </motion.div>
    </section>
  );
}
