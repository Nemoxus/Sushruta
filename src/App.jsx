import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import Router
import { auth } from "./firebaseConfig"; // Firebase auth
import { onAuthStateChanged, signOut } from "firebase/auth";
import Particles from "./Particles";
import SpotifyPlst from "./SpotifyPlst";
import TextReveal from "./TextReveal";
import CheckUpBtn from "./CheckUpBtn";
import SignInBtn from "./SignInBtn";
import Predict from "./Predict"; // Import Predict component
import MenuButton from "./MenuButton"; // Animated menu button
import CheckUpHandler from "./CheckUpHandler"; // Import new CheckUpHandler
import InputDataPage from "./InputDataPage"; // Import Input Data Page

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
                    This project brings accessible heart disease risk prediction to your fingertips,
                    offering reliable results with around 81% accuracy. By analyzing basic health inputs,
                    it provides fast and easy insights to support early detection and promote healthier
                    decisions. While it uses advanced technology behind the scenes, it is not a
                    replacement for medical professionals — rather, it’s a helpful tool designed
                    to assist doctors and empower patients to take timely action for their heart health.🤍
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

        {/* Input Form Data Page Route */}
        <Route path="/input-data-form" element={<InputDataPage />} />
        <Route path="/predict" element={<Predict />} />
      </Routes>
    </Router>
  );
}

export default App;
