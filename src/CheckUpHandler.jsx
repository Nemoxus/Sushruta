import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, signInWithGoogle } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { CheckUpBtn } from "./CheckUpBtn";

// Floating Modal component
const FloatingModal = ({ isOpen, onClose, children, isSignIn }) => {
  if (!isOpen) return null;

  return (
    <div className="floating-modal-container">
      <div className={`floating-modal-content ${isSignIn ? 'sign-in-size' : ''}`}>
        {/* Cross Button (Close) */}
        <button className="close-button" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
};

// Sign In Modal content
const SignInModal = ({ onSignIn, onClose }) => {
  return (
    <div className="text-center sign-in-modal">
      <p className="sign-in-text">You need to sign in first</p>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSignIn();
          onClose();
        }}
        className="sign-in-link"
      >
        Sign In
      </a>
    </div>
  );
};

// Terms & Conditions Modal content
const TosModal = ({ onAccept, onClose }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="tos-modal text-white">
      <h2>Terms & Conditions</h2>
      <div className="space-y-4 mb-6">
        <p>
          1. It is to be noted that this tool is for fair use only and should
          not be exploited by any means for any illegal and harmful use cases.
          Users are strictly prohibited from utilizing this platform for
          activities that may cause harm to individuals, organizations, or
          systems.
        </p>
        <p>
          2. Sushruta is an open source product by Shreejata Gupta and should be
          considered the intellectual property of the owner. The owner should be
          contacted first before any modifications or any changes to the source
          code are implemented to ensure compliance with licensing and
          attribution requirements.
        </p>
        <p>
          3. Your medical input data will be collected and used for fair use
          only to train the model further and improve its accuracy and
          efficiency. All data collection practices comply with relevant privacy
          laws and regulations, and any personally identifiable information will
          be protected according to our privacy policy.
        </p>
      </div>

      <div className="checkbox-container">
        <input
          type="checkbox"
          id="agree-checkbox"
          checked={agreed}
          onChange={() => setAgreed(!agreed)}
        />
        <label htmlFor="agree-checkbox">I agree to the Terms and Conditions</label>
      </div>

      <div className="flex justify-center">
        <button
          onClick={agreed ? onAccept : null}
          className={`next-button ${!agreed ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!agreed}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Main component
const CheckUpHandler = () => {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showTosModal, setShowTosModal] = useState(false);
  const navigate = useNavigate();

  const handleCheckUpClick = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setShowSignInModal(true);
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (!userData.tos_check) {
          setShowTosModal(true);
        } else {
          window.open("/input-data-form", "_blank");
        }
      } else {
        console.error("User document not found in database");
        setShowSignInModal(true);
      }
    } catch (error) {
      console.error("Error checking user status:", error);
    }
  };

  const handleSignIn = () => {
    signInWithGoogle();
  };

  const handleTosAccept = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, { tos_check: true }, { merge: true });

        setShowTosModal(false);
        window.open("/input-data-form", "_blank");
      }
    } catch (error) {
      console.error("Error updating TOS acceptance:", error);
    }
  };

  return (
    <>
      <CheckUpBtn onClick={handleCheckUpClick}>Check Up</CheckUpBtn>

      {/* Sign In Modal */}
      <FloatingModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)}
        isSignIn={true}
      >
        <SignInModal onSignIn={handleSignIn} onClose={() => setShowSignInModal(false)} />
      </FloatingModal>

      {/* Terms & Conditions Modal */}
      <FloatingModal 
        isOpen={showTosModal} 
        onClose={() => setShowTosModal(false)}
        isSignIn={false}
      >
        <TosModal onAccept={handleTosAccept} onClose={() => setShowTosModal(false)} />
      </FloatingModal>
    </>
  );
};

export default CheckUpHandler;