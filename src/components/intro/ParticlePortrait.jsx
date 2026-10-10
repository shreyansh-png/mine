
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ParticlePortrait() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const photoRef = useRef(null);
  const captionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const photo = photoRef.current;

    if (!section || !canvas || !photo) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = "/assets/cutout/couple.png";

    let particles = [];
    let width = 0;
    let height = 0;
    let frameId;
    let scrollAnimation;
    let destroyed = false;

    const progress = { value: 0 };

    const pointer = {
      x: -1000,
      y: -1000,
      active: false,
    };

    function resize() {
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const scale = Math.min(
        width / 260,
        height / (260 * image.naturalHeight / image.naturalWidth)
      );

      const imageWidth = 260 * scale;
      const imageHeight =
        (260 * image.naturalHeight / image.naturalWidth) * scale;

      const offsetX = (width - imageWidth) / 2;
      const offsetY = (height - imageHeight) / 2;

      particles.forEach((p) => {
        p.tx = offsetX + p.u * imageWidth;
        p.ty = offsetY + p.v * imageHeight;
        p.scatterX = p.randomX * width * 0.75;
        p.scatterY = p.randomY * height * 0.75;
      });
    }

    function createParticles() {
      const sampleWidth = 260;
      const sampleHeight = Math.round(
        sampleWidth * image.naturalHeight / image.naturalWidth
      );

      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = sampleWidth;
      sampleCanvas.height = sampleHeight;

      const sampleCtx = sampleCanvas.getContext("2d", {
        willReadFrequently: true,
      });

      if (!sampleCtx) return;

      sampleCtx.drawImage(image, 0, 0, sampleWidth, sampleHeight);

      const pixels = sampleCtx.getImageData(
        0, 0, sampleWidth, sampleHeight
      ).data;

      particles = [];

      for (let y = 0; y < sampleHeight; y += 3) {
        for (let x = 0; x < sampleWidth; x += 3) {
          const i = (y * sampleWidth + x) * 4;

          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          // Transparent background ke pixels skip karo
          if (a < 100) continue;

          // Kuch pixels skip karke particle count manageable rakho
          if (Math.random() < 0.08) continue;

          particles.push({
            u: (x + 0.5) / sampleWidth,
            v: (y + 0.5) / sampleHeight,
            color: `rgba(${r},${g},${b},${a / 255})`,
            size: 0.7 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
            randomX: (Math.random() - 0.5) * 2,
            randomY: (Math.random() - 0.5) * 2,
            tx: 0,
            ty: 0,
            scatterX: 0,
            scatterY: 0,
          });
        }
      }

      resize();

      // Scroll karne par particle disperse honge
      // aur actual photo reveal hogi
      scrollAnimation = gsap.to(progress, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      ScrollTrigger.refresh();
    }

    function draw(time) {
      if (destroyed) return;

      const p = gsap.utils.clamp(0, 1, progress.value);

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 1 - p;

      for (const particle of particles) {
        const floatAmount = 1 - p;

        let x =
          particle.tx +
          particle.scatterX * p +
          Math.sin(time * 0.0007 + particle.phase) *
            0.7 * floatAmount;

        let y =
          particle.ty +
          particle.scatterY * p +
          Math.cos(time * 0.0007 + particle.phase) *
            0.7 * floatAmount;

        // Cursor ya finger ke paas subtle particle reaction
        if (pointer.active && p < 0.4) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0 && distance < 65) {
            const force = (1 - distance / 65) * 15;

            x += (dx / distance) * force;
            y += (dy / distance) * force;
          }
        }

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // Particles disperse hote hi actual photo visible hogi
      photo.style.opacity = String(p);

      if (captionRef.current) {
        captionRef.current.style.opacity = String(p);
      }

      frameId = requestAnimationFrame(draw);
    }

    function handlePointerMove(event) {
      const rect = canvas.getBoundingClientRect();

      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    function handleImageLoad() {
      if (destroyed) return;

      createParticles();
      frameId = requestAnimationFrame(draw);
    }

    function handleImageError() {
      console.error(
        "Could not load couple.png. Check public/assets/cutout/couple.png"
      );
    }

    image.addEventListener("load", handleImageLoad);
    image.addEventListener("error", handleImageError);

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    window.addEventListener("resize", resize);

    if (image.complete && image.naturalWidth > 0) {
      handleImageLoad();
    }

    return () => {
      destroyed = true;

      cancelAnimationFrame(frameId);

      scrollAnimation?.scrollTrigger?.kill();
      scrollAnimation?.kill();

      image.removeEventListener("load", handleImageLoad);
      image.removeEventListener("error", handleImageError);

      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);

      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      id="particle-portrait"
      ref={sectionRef}
      className="relative h-[220svh] bg-[#111119]"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden px-5">

        <p className="absolute top-8 text-[10px] tracking-[0.25em] text-white/40 sm:top-10">
          A LITTLE WORLD, MADE OF US
        </p>

        {/* Photo aur particles same position par render honge */}
        <div className="absolute inset-0 h-full w-full object-contain mix-blend-screen">
          <img
            ref={photoRef}
            src="/assets/cutout/couple.png"
            alt="Our favourite memory"
            className="absolute inset-0 h-full w-full object-contain"
            style={{ opacity: 0 }}
            draggable="false"
          />

          <canvas
            ref={canvasRef}
            aria-label="A portrait made of particles"
            className="absolute inset-0 h-full w-full touch-pan-y"
          />
        </div>

        <p
          ref={captionRef}
          className="absolute bottom-20 text-center font-['Caveat'] text-3xl text-[#C99BB5] sm:bottom-24 sm:text-4xl"
          style={{ opacity: 0 }}
        >
          And here we are. ♡
        </p>

        <p className="absolute bottom-8 text-[9px] tracking-[0.22em] text-white/35 sm:bottom-10">
          SCROLL TO REVEAL
        </p>
      </div>
    </section>
  );
}
