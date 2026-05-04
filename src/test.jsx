import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import logo from "./assets/youtube and taobao.png";
import poster from "./assets/psd chor2.png";
import poster1 from "./assets/image.png";

const videos = [
  {
    id: 1,
    badge: "26:00",
    label: "1.របៀបបង្កើតគណនី",
    videoUrl: "https://www.youtube.com/shorts/5yroddfwvng",
    steps: [
      { time: "00:16", desc: "ដើម្បីបង្កើតគណនី" },
      { time: "01:12", desc: "ចូលបង្កើតគណនី ក្នុង VTS App" },
      { time: "01:58", desc: "បំពេញតាមលក្ខខណ្ឌដែលបានកំណត់" },
    ],
    poster: poster,
  },
  {
    id: 2,
    badge: "02:22",
    label: "2.បំពេញអាសយដ្ឋាន",
    videoUrl: "https://www.youtube.com/shorts/5yroddfwvng",
    steps: [
      { time: "00:26", desc: "ចូលទៅកាន់កន្លែងបញ្ចូលអាសយដ្ឋាន" },
      { time: "01:40", desc: "ចូលយក Address ក្នុង VTS App" },
      { time: "02:23", desc: "បំពេញព័ត៌មាន" },
    ],
    poster: poster1,
  },
  {
    id: 3,
    badge: "01:58",
    label: "3. របៀបទិញ",
    videoUrl: "https://www.youtube.com/shorts/5yroddfwvng",
    steps: [
      { time: "00:36", desc: "ដើម្បីធ្វើការទិញ" },
      { time: "01:02", desc: "ចូលទៅកាន់ VTS App" },
      { time: "02:38", desc: "ចុចលើទំនិញដែលចង់បានហូវ" },
    ],
    poster: poster,
  },
  {
    id: 4,
    badge: "03:45",
    label: "4. របៀបដឹកជញ្ជូន",
    videoUrl: "https://www.youtube.com/shorts/5yroddfwvng",
    steps: [
      { time: "00:46", desc: "ដើម្បីដឹកជញ្ជូន" },
      { time: "01:22", desc: "ចូលទៅកាន់ VTS App" },
      { time: "02:58", desc: "ចុចលើទំនិញដែលចង់បានហូវ" },
    ],
    poster: poster1,
  },
];

const App = () => {
  const [activeIndex, setActiveIndex] = useState(1);
  // Which video is opened in fullscreen modal; null means modal is closed.
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const scrollRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollStopTimerRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimerRef = useRef(null);
  const overlayRef = useRef(null);
  const activeVideo = videos[activeIndex] ?? videos[0];

  useEffect(() => {
    return () => {
      if (scrollStopTimerRef.current) {
        clearTimeout(scrollStopTimerRef.current);
      }
      if (programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Use requestAnimationFrame or a 0ms timeout to ensure
    // the browser has rendered the layout first.
    const timeoutId = setTimeout(() => {
      const items = el.querySelectorAll(".snap-item");
      const secondSlide = items[1];
      if (secondSlide) {
        secondSlide.scrollIntoView({
          behavior: "auto", // Instant jump
          inline: "center",
          block: "nearest",
        });
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    // Lock page scroll while fullscreen player is open.
    if (fullscreenIndex === null) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreenIndex]);

  // Request native device fullscreen as soon as the overlay mounts.
  useEffect(() => {
    if (fullscreenIndex === null) return;
    const el = overlayRef.current;
    if (!el) return;
    const requestFS =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen;
    if (requestFS) {
      requestFS.call(el).catch(() => {});
    }
  }, [fullscreenIndex]);

  // Sync React state when user exits native fullscreen (back button / swipe down).
  useEffect(() => {
    const onFSChange = () => {
      const fsEl =
        document.fullscreenElement || document.webkitFullscreenElement;
      if (!fsEl) {
        setFullscreenIndex(null);
      }
    };
    document.addEventListener("fullscreenchange", onFSChange);
    document.addEventListener("webkitfullscreenchange", onFSChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFSChange);
      document.removeEventListener("webkitfullscreenchange", onFSChange);
    };
  }, []);

  const handleScroll = () => {
    // Ignore scroll events triggered by programmatic scrollIntoView calls.
    if (isProgrammaticScrollRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    // Mark scrolling state briefly so click handlers can ignore swipe taps.
    isScrollingRef.current = true;
    if (scrollStopTimerRef.current) {
      clearTimeout(scrollStopTimerRef.current);
    }
    scrollStopTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 120);
    // Find the card whose center is closest to the viewport center.
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    const items = el.querySelectorAll(".snap-item");
    items.forEach((item, i) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const dist = Math.abs(center - itemCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

  const centerSlide = (index) => {
    setActiveIndex(index);
    const el = scrollRef.current;
    if (!el) return;
    const items = el.querySelectorAll(".snap-item");
    const target = items[index];
    if (!target) return;
    // Suppress handleScroll during programmatic smooth scroll to avoid extra re-renders.
    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimerRef.current) {
      clearTimeout(programmaticScrollTimerRef.current);
    }
    target.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    programmaticScrollTimerRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 500);
  };

  const openFullscreen = (index) => {
    setFullscreenIndex(index);
  };

  const closeFullscreen = () => {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen)
        .call(document)
        .catch(() => {});
    }
    setFullscreenIndex(null);
  };
  console.log("activeVideo", activeVideo);

  return (
    <div className="min-h-screen bg-transparent">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-item { transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1); }
        .snap-item.active { transform: scale(1.06); }
        .snap-item.inactive { transform: scale(0.9); }
        .snap-label {
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), font-size 0.25s ease;
        }
        .snap-item.active .snap-label { transform: scale(1.08); font-size: 15px; font-weight: 900; }
        .snap-item.inactive .snap-label { transform: scale(0.96); font-size: 13px; }
      `}</style>

      <div className="w-full bg-[#ffffff] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 px-4 pt-4">
          <div className="rounded-xl shrink-0  flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-15 w-15 object-contain" />
          </div>
          <span
            className="text-lg font-extrabold text-gray-800"
            style={{ fontFamily: "Khmer, sans-serif" }}
          >
            វិដេអូបង្រៀន
          </span>
        </div>

        {/* Video carousel — scroll-snap centered, no scrollbar */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="no-scrollbar flex gap-2 overflow-x-auto scroll-snap-x mandatory WebkitOverflowScrolling-touch touch-pan-x px-[calc(50%-88px)] py-3"
        >
          {videos.map((v, i) => (
            <div
              key={v.id}
              className={`snap-item ${i === activeIndex ? "active" : "inactive"} `}
              style={{
                flexShrink: 0,
                width: "150px",
                height: "290px",
                cursor: "pointer",
                scrollSnapAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              onClick={() => {
                if (isScrollingRef.current) {
                  return;
                }
                centerSlide(i);
              }}
            >
              <div className=" w-full h-full rounded-xl overflow-hidden relative background-gradient-to-br from-orange-400 to-orange-600">
                <img
                  src={v.poster}
                  alt={v.label}
                  className="w-full h-full object-cover"
                />
                {/* Duration badge */}
                <div className="absolute top-2 left-2 bg-black/20 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {v.badge}
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <button
                    type="button"
                    aria-label={`Play ${v.label} in large screen`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isScrollingRef.current) return;
                      if (i !== activeIndex) {
                        centerSlide(i);
                      }
                      openFullscreen(i);
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.15)",
                      backdropFilter: "blur(1px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                      cursor: "pointer",
                      pointerEvents: "auto",
                    }}
                  >
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderTop: "9px solid transparent",
                        borderBottom: "9px solid transparent",
                        borderLeft: "16px solid white",
                        marginLeft: 4,
                        pointerEvents: "none",
                      }}
                    />
                  </button>
                </div>
              </div>

              <p
                className="snap-label text-center text-gray-700 font-bold mt-2"
                style={{ fontFamily: "Khmer, sans-serif", lineHeight: 1.2 }}
              >
                {v.label}
              </p>
            </div>
          ))}
        </div>

        {/* Steps section*/}
        <div className=" rounded-xl p-3">
          <p
            className="text-[15px] font-bold text-gray-800 mb-2"
            style={{ fontFamily: "Khmer, sans-serif" }}
          >
            💡 ជំនួយ
          </p>
          {(activeVideo?.steps ?? []).map((s, i) => (
            <div key={i} className="flex items-start gap-2 mb-1">
              <span
                className="text-gray-600 text-sm"
                style={{ fontFamily: "Khmer, sans-serif" }}
              >
                នាទី
              </span>
              <span className="text-[#1969da]  text-sm font-semibold">
                {s.time}
              </span>
              <span
                className="text-gray-700 text-sm"
                style={{ fontFamily: "Khmer, sans-serif" }}
              >
                - {s.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {fullscreenIndex !== null && videos[fullscreenIndex] && (
        // Fullscreen overlay: tap outside or X button to close.
        <div
          ref={overlayRef}
          onClick={closeFullscreen}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100vw",
              height: "100vh",
              background: "#000",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                background: "#000",
              }}
            >
              <ReactPlayer
                src={videos[fullscreenIndex].videoUrl}
                width="100%"
                height="100%"
                controls
                playing
                config={{
                  youtube: {
                    playerVars: {
                      rel: 0,
                      modestbranding: 1,
                      playsinline: 0,
                    },
                  },
                }}
              />
            </div>

            <button
              type="button"
              onClick={closeFullscreen}
              className="absolute top-5 left-5 border border-white/35 rounded-full text-white bg-black/50 w-10 h-10 flex items-center justify-center cursor-pointer"
              aria-label="Back"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M15 6L9 12L15 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
