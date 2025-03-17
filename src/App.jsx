import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import Router
import { auth } from "./firebaseConfig"; // Firebase auth
import { onAuthStateChanged, signOut } from "firebase/auth";
import Particles from "./Particles";
import SpotifyPlst from "./SpotifyPlst";
import TextReveal from "./TextReveal";
import CheckUpBtn from "./CheckUpBtn";
import SignInBtn from "./SignInBtn";
import MenuButton from "./MenuButton"; // Animated menu button
import CheckUpHandler from "./CheckUpHandler"; // Import new CheckUpHandler
import ComingSoonPage from "./ComingSoonPage"; // Import Coming Soon page

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Main App Route */}
        <Route
          path="/"
          element={
            <nav>
              {/* Top Menu Bar (Appears on Scroll) */}
              <div className={`top-menu-bar ${isScrolled ? "scrolled" : ""}`}>
                {isScrolled && (
                  <>
                    <MenuButton isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

                    <img src="/sushruta_icon.png" alt="Sushruta Logo" className="sushruta-logo scrolled" />

                    <div className="signin-btn-container">
                      {user ? (
                        <div className="user-info">
                          <span className="username">Hello {user.displayName?.split(" ")[0] || "User"}</span>
                          <button className="signout-btn" onClick={() => signOut(auth)}>Sign Out</button>
                        </div>
                      ) : (
                        <SignInBtn onClick={() => setIsAuthOpen(true)} />
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Floating Menu Modal */}
              {isMenuOpen && (
                <div className="menu-modal-overlay" onClick={() => setIsMenuOpen(false)}>
                  <div className="menu-modal-content" onClick={(e) => e.stopPropagation()}>
                    <h1>Sushruta</h1>
                    <p>
                      This project brings cutting-edge heart disease prediction to your fingertips, delivering 97.55% accuracy using advanced Machine Learning and Deep Learning techniques. 
                      With automated feature selection (RFE & PCA) and a powerful hybrid model (ANN + Random Forest + Ensemble Learning), you can get fast, reliable predictions anytime, anywhere. 
                      This model brings you closer to cardiologist-level insights, empowering early detection and smarter healthcare decisions like never before. 🤍
                    </p>
                  </div>
                </div>
              )}

              {/* Initial Floating Logo */}
              <img src="/sushruta_icon.png" alt="Sushruta Logo" className={`sushruta-logo ${isScrolled ? "scrolled" : "initial"}`} />

              {/* Background Particles */}
              <Particles />

              {/* Spotify Playlist Widget */}
              <SpotifyPlst />

              {/* Text Reveal Component */}
              <TextReveal>
                {`We Predict.\nYou Live.\nUs United.`}
              </TextReveal>

              {/* Check-Up Button with Handler */}
              <div className="check-up-btn-container">
                <CheckUpHandler />
              </div>

              {/* Authentication Popup */}
              {isAuthOpen && (
                <div className="auth-popup-overlay" onClick={() => setIsAuthOpen(false)}>
                  <div className="auth-popup-content" onClick={(e) => e.stopPropagation()}>
                    <UserAuth />
                  </div>
                </div>
              )}
            </nav>
          }
        />

        {/* Coming Soon Page Route */}
        <Route path="/coming-soon" element={<ComingSoonPage />} />
      </Routes>
    </Router>
  );
}

export default App;
