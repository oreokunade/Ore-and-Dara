import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Countdown } from './components/Countdown';
import { EventDetails } from './components/EventDetails';
import { Programme } from './components/Programme';
import { Colours } from './components/Colours';
import { GiftWishlist } from './components/GiftWishlist';
import { Gifts } from './components/Gifts';
import { Gallery } from './components/Gallery';
import { QandA } from './components/QandA';
import { RsvpForm } from './components/RsvpForm';
import { Footer } from './components/Footer';
import { MusicPlayer } from './components/MusicPlayer';
import { AdminPage } from './pages/AdminPage';
import { FloatingRSVP } from './components/FloatingRSVP';
import { ToastContainer } from './components/Toast';
import { ToastMessage } from './types';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    (window as any).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          if ((window as any).lenis) {
            (window as any).lenis.scrollTo(element);
          } else {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const addToast = (title: string, message?: string, type: 'success' | 'info' | 'error' = 'success') => {
    const newToast: ToastMessage = {
      id: String(Date.now()),
      title,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const scrollToRsvp = () => {
    const element = document.getElementById('rsvp');
    if (element) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(element, { offset: -50, duration: 1.5 });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const HomePage = () => (
    <>
      <Navbar onOpenRsvp={scrollToRsvp} />
      <main>
        <Hero onRsvpClick={scrollToRsvp} />
        <Countdown />
        <EventDetails onNotify={addToast} />
        <Programme />
        <Colours />
        
        <Gifts onNotify={addToast} />
        <FloatingRSVP onRSVPClick={scrollToRsvp} />

        {/* Link to Wishlist Page */}
        <section id="wishlist" className="py-24 px-4 bg-brand-cream relative border-t border-brand-espresso/10">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden mb-8 shadow-xl relative border-4 border-white">
              <img src="/assets/0V3A8849_(2).jpg" alt="Oreoluwa & Oluwadara" className="w-full h-full object-cover object-top" />
            </div>
            <p className="text-sm tracking-[0.2em] uppercase text-brand-goldDark font-semibold font-sans mb-3">Wedding Registry</p>
            <h2 className="text-4xl sm:text-5xl font-serif text-brand-espresso mb-6">Our Wishlist</h2>
            <p className="font-sans text-brand-muted text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              To help us start our new home together, we have handpicked items we need most. You can select any item to pay for it and bless our union directly.
            </p>
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/wishlist');
              }}
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-brand-espresso text-brand-cream font-sans text-sm font-semibold tracking-widest uppercase hover:bg-brand-charcoal transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              View Curated Registry
            </button>
          </div>
        </section>
        <QandA />
        <RsvpForm onNotify={addToast} />
        <Gallery />
      </main>
      <Footer />
    </>
  );

  const WishlistPage = () => (
    <>
      <Navbar onOpenRsvp={() => navigate('/#rsvp')} />
      <main className="pt-20">
        <GiftWishlist onNotify={addToast} />
      </main>
      <Footer />
    </>
  );

  return (
    <div className="min-h-screen bg-brand-cream text-brand-espresso font-sans selection:bg-brand-gold selection:text-brand-espresso">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/admin" element={<AdminPage onNotify={addToast} />} />
        <Route path="/admin-01" element={<AdminPage onNotify={addToast} />} />
        <Route path="*" element={<HomePage />} />
      </Routes>

      {!location.pathname.startsWith('/admin') && <MusicPlayer />}
    </div>
  );
}

export default App;
