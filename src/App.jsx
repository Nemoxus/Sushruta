import { useState, useEffect } from "react";
import { auth } from "./firebaseConfig"; // Import Firebase auth
import { onAuthStateChanged, signOut } from "firebase/auth";
import Particles from "./Particles";
import SpotifyPlst from "./SpotifyPlst";
import TextReveal from "./TextReveal";
import CheckUpBtn from "./CheckUpBtn";
import SignInBtn from "./SignInBtn";

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null); // State to track the logged-in user

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <nav>
      {/* Top Menu Bar (Appears on Scroll) */}
      <div className={`top-menu-bar ${isScrolled ? "scrolled" : ""}`}>
        {isScrolled && (
          <>
            {/* Menu Button */}
            <div className="menu-btn">
              <div className="menu-line"></div>
              <div className="menu-line"></div>
            </div>

            {/* Sushruta Logo */}
            <img
              src="/sushruta_icon.png"
              alt="Sushruta Logo"
              className="sushruta-logo scrolled"
            />

            {/* User Info / Sign-In Button */}
            <div className="signin-btn-container">
              {user ? (
                <div className="user-info">
                  <span className="username">Hello {user.displayName.split(" ")[0] || "User"}</span>
                  <button className="signout-btn" onClick={() => signOut(auth)}>Sign Out</button>
                </div>
              ) : (
                <SignInBtn onClick={() => setIsAuthOpen(true)} />
              )}
            </div>
          </>
        )}
      </div>

      {/* Sushruta Logo Initially Floating */}
      <img
        src="/sushruta_icon.png"
        alt="Sushruta Logo"
        className={`sushruta-logo ${isScrolled ? "scrolled" : "initial"}`}
      />

      {/* Background Particles */}
      <Particles />

      {/* Spotify Playlist Widget */}
      <SpotifyPlst />

      {/* Text Reveal Component */}
      <TextReveal>
        {`We Predict.\nYou Live.\nUs United.`}
      </TextReveal>

      {/* Check-Up Button */}
      <div className="check-up-btn-container">
        <CheckUpBtn>Check Up</CheckUpBtn>
      </div>

      {/* Authentication Popup (Appears when SignInBtn is clicked) */}
      {isAuthOpen && (
        <div className="auth-popup-overlay" onClick={() => setIsAuthOpen(false)}>
          <div className="auth-popup-content" onClick={(e) => e.stopPropagation()}>
            <UserAuth />
          </div>
        </div>
      )}
    </nav>
  );
}

export default App;
