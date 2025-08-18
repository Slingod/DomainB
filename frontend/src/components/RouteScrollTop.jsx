import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Remonte en haut à chaque navigation.
 * - Si un hash (#section-3) est présent et existe, on scrolle dessus.
 * - Sinon on remonte en haut de la fenêtre ET des conteneurs scrollables courants.
 */
export default function RouteScrollTop({ behavior = "auto" }) {
  const location = useLocation();

  useEffect(() => {
    const scrollToTopEverywhere = () => {
      const scrollers = new Set(["window"]);

      document
        .querySelectorAll("html, body, #root, main, .page, .content, .legal-content")
        .forEach((el) => {
          const cs = getComputedStyle(el);
          const canScroll =
            el.scrollHeight > el.clientHeight &&
            /(auto|scroll|overlay)/i.test(cs.overflowY);
          if (canScroll || el === document.documentElement || el === document.body) {
            scrollers.add(el);
          }
        });

      scrollers.forEach((target) => {
        try {
          if (target === "window") {
            window.scrollTo({ top: 0, left: 0, behavior });
          } else {
            target.scrollTo({ top: 0, left: 0, behavior });
          }
        } catch {
          if (target === "window") {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          } else {
            target.scrollTop = 0;
            target.scrollLeft = 0;
          }
        }
      });
    };

    // Si on a une ancre (#id), tenter de scroller dessus après rendu
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const el = document.getElementById(id);
      if (el) {
        try {
          el.scrollIntoView({ behavior, block: "start", inline: "nearest" });
          return;
        } catch {
          // fallback
          scrollToTopEverywhere();
          return;
        }
      }
    }

    scrollToTopEverywhere();
    // Re-tenter juste après le rendu si besoin
    const t = setTimeout(scrollToTopEverywhere, 0);
    return () => clearTimeout(t);
  }, [location.pathname, location.search, location.hash, behavior]);

  return null;
}