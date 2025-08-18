import { useEffect, useRef, useState } from "react";
import "./ScrollTopButton.scss";

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);
  const [justShown, setJustShown] = useState(false);
  const anchorRef = useRef(null);
  const popTimerRef = useRef(null);

  /* rAF throttle */
  const rafThrottle = (fn) => {
    let running = false;
    return (...args) => {
      if (running) return;
      running = true;
      requestAnimationFrame(() => {
        fn(...args);
        running = false;
      });
    };
  };

  /* Trouve le VRAI parent scrollable pour ce bouton */
  const getScrollParent = (el) => {
    let p = el?.parentElement;
    while (p) {
      const cs = getComputedStyle(p);
      if (/(auto|scroll|overlay)/i.test(cs.overflowY)) return p;
      p = p.parentElement;
    }
    return window; // sinon: viewport
  };

  /* 1) Visibilité basée sur le bon scroller */
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const showFrom = 80;
    const scroller = getScrollParent(anchor);

    const getTop = () => {
      if (scroller === window) {
        return (
          window.pageYOffset ??
          document.documentElement.scrollTop ??
          document.body.scrollTop ??
          0
        );
      }
      return scroller.scrollTop || 0;
    };

    let wasVisible = false;
    const update = rafThrottle(() => {
      const now = getTop() > showFrom;
      setVisible(now);
      if (now && !wasVisible) {
        setJustShown(true);
        clearTimeout(popTimerRef.current);
        popTimerRef.current = setTimeout(() => setJustShown(false), 900);
      }
      wasVisible = now;
    });

    // Écoute UNIQUEMENT le bon scroller + resize
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update(); // init

    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearTimeout(popTimerRef.current);
    };
  }, []);

  /* 2) Offset auto si widget cookies/bulles en bas */
  useEffect(() => {
    const computeOffset = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      let offset = 0;
      let align = "flex-end";
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const nodes = Array.from(
        document.querySelectorAll(
          '[class*="cookie" i], [id*="cookie" i], [aria-label*="cookie" i], [data-cookie], .cookie, .cookies, [role="dialog"], [role="alert"]'
        )
      );

      nodes.forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed") return;
        const r = el.getBoundingClientRect();
        if (r.height < 28) return;
        if (r.bottom < vh - 8) return;

        const isBottomBar = r.width >= vw * 0.4;
        const isRightBubble = r.right >= vw - 240;

        if (isBottomBar || isRightBubble) {
          offset = Math.max(offset, r.height + 36);
        }
        // if (isRightBubble) align = "flex-start"; // à activer si besoin
      });

      anchor.style.setProperty("--cookies-offset", `${offset}px`);
      anchor.style.setProperty("--align", align);
    };

    const run = () => computeOffset();
    run();
    const t1 = setTimeout(run, 600);
    const t2 = setTimeout(run, 1800);
    const t3 = setTimeout(run, 3600);

    const onResize = rafThrottle(run);
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* 3) Scroll vers le haut — on remonte à la fois le scroller réel et la fenêtre */
  const scrollTop = () => {
    const anchor = anchorRef.current;
    const scroller = anchor ? getScrollParent(anchor) : window;
    const scrollers = new Set([window, scroller]);

    scrollers.forEach((target) => {
      try {
        if (target === window) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          target.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch {
        if (target === window) {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        } else {
          target.scrollTop = 0;
        }
      }
    });
  };

  return (
    <div ref={anchorRef} className="scroll-top-anchor" aria-hidden={!visible}>
      <button
        type="button"
        className={`scroll-top-btn ${visible ? "is-visible" : ""} ${justShown ? "just-shown" : ""}`}
        aria-label="Revenir en haut de la page"
        title="Revenir en haut"
        onClick={scrollTop}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 6l-7 7h4v5h6v-5h4l-7-7z" />
        </svg>
      </button>
    </div>
  );
}