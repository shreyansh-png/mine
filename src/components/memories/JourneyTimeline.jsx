
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const memories = [
  {
    id: "01",
    image: "/assets/cutout/garba-night.png",
    alt: "Our Garba Night",
    date: "THE BEGINNING",
    title: "Garba Night",
    caption: "Where our memories began",
    position: "left-[0%] top-[0%] md:left-[2%] md:top-[0%]",
  },
  {
    id: "02",
    image: "/assets/cutout/first-flower.png",
    alt: "The first flower",
    date: "A LITTLE SURPRISE",
    title: "First Flower",
    caption: "A little flower, a memory forever",
    position: "left-[54%] top-[13%] md:left-[68%] md:top-[12%]",
  },
  {
    id: "03",
    image: "/assets/cutout/video-call.png",
    alt: "Our video call",
    date: "THAT SMILE",
    title: "That Smile",
    caption: "Vo smile bhool nahi sakta, vo khushi tumhari ♡",
    position: "left-[0%] top-[30%] md:left-[4%] md:top-[29%]",
  },
  {
    id: "04",
    image: "/assets/cutout/thf-date.png",
    alt: "Our THF date",
    date: "10 DECEMBER",
    title: "THF🍵",
    caption: "A day I'll always keep close ♡",
    position: "left-[54%] top-[46%] md:left-[65%] md:top-[44%]",
  },
  {
    id: "05",
    image: "/assets/cutout/chowk.png",
    alt: "Our Chowk memory",
    date: "AN UNPLANNED MOMENT",
    title: "Chowk",
    caption: "Just another random moment that became special",
    position: "left-[0%] top-[63%] md:left-[2%] md:top-[62%]",
  },
  {
    id: "06",
    image: "/assets/cutout/birthday.png",
    alt: "My birthday memory",
    date: "MY BIRTHDAY",
    title: "You Made My Day",
    caption: "Thank you for making my day so special ♡",
    position: "left-[52%] top-[80%] md:left-[61%] md:top-[79%]",
  },
];

const pathData =
  "M 165 45 C 350 45, 650 100, 790 145 C 930 195, 460 245, 205 315 C 35 370, 460 420, 770 470 C 920 520, 450 590, 180 650 C 35 710, 440 780, 755 850 C 850 880, 850 920, 850 940";

export default function JourneyTimeline() {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const path = pathRef.current;

      if (path) {
        const length = path.getTotalLength();

        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 75%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }

      gsap.utils.toArray(".memory-item").forEach((item) => {
        gsap.fromTo(
          item,
          {
            autoAlpha: 0,
            y: 35,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#111119] px-4 pb-20 pt-24 text-[#F2EEF2] sm:px-8 md:pt-32">
      {/* Section heading */}
      <div className="mx-auto mb-10 max-w-5xl text-center md:mb-16">
        <p className="text-[10px] tracking-[0.35em] text-[#C99BB5] sm:text-xs">
          CHAPTER 03 / OUR JOURNEY
        </p>

        <h2 className="mt-5 font-serif text-4xl font-normal leading-tight sm:text-6xl md:text-7xl">
          Every little thing
          <br />
          <span className="italic text-[#C99BB5]">
            led me to you.
          </span>
        </h2>

        <p className="mt-5 text-[10px] tracking-[0.25em] text-white/40">
          SIX MOMENTS · ONE STORY
        </p>
      </div>

      {/* Organic memory trail */}
      <div
        ref={sectionRef}
        className="relative mx-auto h-[2300px] w-full max-w-6xl sm:h-[2450px] md:h-[2650px]"
      >
        {/* Dotted path, revealed by its animated SVG mask */}
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <mask
              id="journey-path-mask"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="1000"
              height="1000"
            >
              <path
                ref={pathRef}
                d={pathData}
                fill="none"
                stroke="white"
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          </defs>

          {/* A subtle stationary trail */}
          <path
            d={pathData}
            fill="none"
            stroke="#C99BB5"
            strokeWidth="1.5"
            strokeOpacity="0.12"
          />

          {/* The animated pink dotted trail */}
          <path
            d={pathData}
            fill="none"
            stroke="#C99BB5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 10"
            mask="url(#journey-path-mask)"
          />
        </svg>

        {/* Scattered transparent cutouts */}
        {memories.map((memory) => (
          <figure
            key={memory.id}
            className={`memory-item invisible absolute z-10 w-[44%] sm:w-[38%] md:w-[29%] ${memory.position}`}
          >
            <div className="group">
              <img
                src={memory.image}
                alt={memory.alt}
                loading="lazy"
                draggable="false"
                className="h-auto w-full object-contain drop-shadow-[0_8px_22px_rgba(201,155,181,0.08)] transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                onLoad={() => ScrollTrigger.refresh()}
              />

              <figcaption className="mt-3 sm:mt-5">
                <p className="text-[8px] tracking-[0.16em] text-[#C99BB5] sm:text-[10px] sm:tracking-[0.22em]">
                  {memory.id} / {memory.date}
                </p>

                <h3 className="mt-2 font-serif text-xl font-normal leading-tight sm:text-3xl">
                  {memory.title}
                </h3>

                <p
                  className="mt-2 text-base leading-snug text-white/60 sm:text-xl"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  {memory.caption}
                </p>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="font-serif text-2xl italic text-[#C99BB5] sm:text-3xl">
          And this is only our beginning. ♡
        </p>
      </div>
    </section>
  );
}
