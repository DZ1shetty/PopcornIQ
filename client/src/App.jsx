import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy Loaded Pages for faster initial bundle scan 🏎️
const Home = lazy(() => import('./pages/Home'));
const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PersonDetails = lazy(() => import('./pages/PersonDetails'));
const SectionPage = lazy(() => import('./pages/SectionPage'));

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CinematicBackground from './components/CinematicBackground';
import SearchPalette from './components/SearchPalette';
import GenreDiscovery from './components/GenreDiscovery';
import CountryDiscovery from './components/CountryDiscovery';
import MoodDiscovery from './components/MoodDiscovery';
import ArchiveDiscovery from './components/ArchiveDiscovery';
import ErrorBoundary from './components/ErrorBoundary';

// 🎭 High-Fidelity Neural Transition Component
const PageWrapper = ({ children, variant = "fade" }) => {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.02 }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[variant]}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};

import Lenis from 'lenis';

function App() {
  // 🚂 Smooth Scroll System (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isMoodOpen, setIsMoodOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const closeAllOverlays = () => {
    setIsSearchOpen(false);
    setIsGenreOpen(false);
    setIsCountryOpen(false);
    setIsMoodOpen(false);
    setIsArchiveOpen(false);
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
    setIsGenreOpen(false);
    setIsCountryOpen(false);
    setIsMoodOpen(false);
    setIsArchiveOpen(false);
  };

  const handleGenreClick = () => {
    setIsGenreOpen(true);
    setIsSearchOpen(false);
    setIsCountryOpen(false);
    setIsMoodOpen(false);
    setIsArchiveOpen(false);
  };

  const handleCountryClick = () => {
    setIsCountryOpen(true);
    setIsSearchOpen(false);
    setIsGenreOpen(false);
    setIsMoodOpen(false);
    setIsArchiveOpen(false);
  };

  const handleMoodClick = () => {
    setIsMoodOpen(true);
    setIsSearchOpen(false);
    setIsGenreOpen(false);
    setIsCountryOpen(false);
    setIsArchiveOpen(false);
  };

  const handleArchiveClick = () => {
    setIsArchiveOpen(true);
    setIsSearchOpen(false);
    setIsGenreOpen(false);
    setIsCountryOpen(false);
    setIsMoodOpen(false);
  };

  // 🔒 Global Body Scroll Lock while overlays are active
  useEffect(() => {
    if (isSearchOpen || isGenreOpen || isCountryOpen || isMoodOpen || isArchiveOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--removed-body-padding, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }, [isSearchOpen, isGenreOpen, isCountryOpen, isMoodOpen, isArchiveOpen]);

  // 🚀 Close overlays on route change, but check for triggers first
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const trigger = params.get('trigger');

    if (trigger === 'genres') {
      setIsGenreOpen(true);
      // Clean URL without refresh
      window.history.replaceState({}, '', '/home');
    } else if (trigger === 'countries') {
      setIsCountryOpen(true);
      window.history.replaceState({}, '', '/home');
    } else {
      closeAllOverlays();
    }
  }, [location.pathname, location.search]);

  const hideGlobalNavbarOn = ['/', '/login', '/register'];
  const showNavbar = user && !hideGlobalNavbarOn.includes(location.pathname);

  // Global Keyboard Telemetry ⌨️
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleSearchClick();
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        handleSearchClick();
      }
      if (e.key === 'g' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        handleGenreClick();
      }
      if (e.key === 'c' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        handleCountryClick();
      }
      if (e.key === 'm' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        handleMoodClick();
      }
      if (e.key === 'w' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        handleArchiveClick();
      }
      if (e.key === 'Escape') {
        closeAllOverlays();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 🖱️ Global Spotlight Tracker
  useEffect(() => {
    const updateMouse = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', updateMouse);
    return () => window.removeEventListener('mousemove', updateMouse);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-primary font-sans relative overflow-hidden selection:bg-accent selection:text-white">

        {/* 🔦 Global Cinema Spotlight */}
        <div
          className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.04), transparent 40%)`
          }}
        />

        {/* 🎞️ Global Film Grain */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay z-[9998]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        <CinematicBackground />

        {/* Overlays */}
        <SearchPalette
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
        <GenreDiscovery
          isOpen={isGenreOpen}
          onClose={() => setIsGenreOpen(false)}
        />
        <CountryDiscovery
          isOpen={isCountryOpen}
          onClose={() => setIsCountryOpen(false)}
        />
        <MoodDiscovery
          isOpen={isMoodOpen}
          onClose={() => setIsMoodOpen(false)}
        />
        <ArchiveDiscovery
          isOpen={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
        />

        {showNavbar && (
          <Navbar
            onDiscoverClick={closeAllOverlays}
            onSearchClick={handleSearchClick}
            onGenreClick={handleGenreClick}
            onCountryClick={handleCountryClick}
            onMoodClick={handleMoodClick}
            onArchiveClick={handleArchiveClick}
            isSearchOpen={isSearchOpen}
            isGenreOpen={isGenreOpen}
            isCountryOpen={isCountryOpen}
            isMoodOpen={isMoodOpen}
            isArchiveOpen={isArchiveOpen}
          />
        )}

        {/* Cinematic Route Loading 🎢 */}
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-12 h-px bg-accent animate-pulse" />
          </div>
        }>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <PageWrapper>
                  <LandingPage />
                </PageWrapper>
              } />
              <Route path="/login" element={
                <PageWrapper>
                  {user ? <Navigate to="/home" /> : <LandingPage />}
                </PageWrapper>
              } />
              <Route path="/register" element={
                <PageWrapper>
                  {user ? <Navigate to="/home" /> : <LandingPage />}
                </PageWrapper>
              } />

              <Route path="/home" element={
                <ProtectedRoute>
                  <PageWrapper variant="slide">
                    <Home />
                  </PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/movie/:id" element={
                <ProtectedRoute>
                  <PageWrapper variant="scale">
                    <MovieDetails />
                  </PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/person/:id" element={
                <ProtectedRoute>
                  <PageWrapper variant="scale">
                    <PersonDetails />
                  </PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/section/:type" element={
                <ProtectedRoute>
                  <PageWrapper variant="fade">
                    <SectionPage />
                  </PageWrapper>
                </ProtectedRoute>
              } />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
