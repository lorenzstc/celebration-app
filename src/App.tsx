// celebration_app/src/App.tsx
import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Fireworks } from "fireworks-js";
import "./App.css";

const CelebrationApp = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [showWebcam, setShowWebcam] = useState(true);
  const webcamRef = useRef<Webcam | null>(null);
  const certificateRef = useRef(null);
  const fireworksRef = useRef<Fireworks | null>(null);
  const fireworksContainerRef = useRef<HTMLDivElement | null>(null);
  const videoConstraints = {
    width: window.innerWidth > 1920 ? 3840 : window.innerWidth > 1280 ? 1920 : 1280, // Automatische Anpassung der Auflösung
    height: window.innerHeight > 1080 ? 2160 : window.innerHeight > 720 ? 1080 : 720,
    facingMode: "user", // Standard-Webcam nutzen
    frameRate: { ideal: 30, max: 60 } // Falls möglich, mit bis zu 60 FPS aufnehmen
  };
  

  const fireworkSounds = [
    "https://fireworks.js.org/sounds/explosion0.mp3",
    "https://fireworks.js.org/sounds/explosion1.mp3",
    "https://fireworks.js.org/sounds/explosion2.mp3"
  ];

  useEffect(() => {
    const initializeFireworks = () => {
      if (!fireworksRef.current && fireworksContainerRef.current) {
        fireworksRef.current = new Fireworks(fireworksContainerRef.current, {
          autoresize: true,
          opacity: 0.9,
          acceleration: 1.05,
          particles: 120,
          explosion: 7,
          intensity: 40,
          friction: 0.97,
          gravity: 2,
          sound: {
            enabled: true,
            files: fireworkSounds,
            volume: {
              min: 50,
              max: 100
            }
          },
        });
        setTimeout(() => {
          fireworksRef.current?.start();
        }, 500);
      }
    };

    window.addEventListener("load", initializeFireworks);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => capturePhoto(), 500);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      fireworksRef.current?.stop();
      window.removeEventListener("load", initializeFireworks);
    };
  }, []);

  const capturePhoto = () => {
    if (webcamRef.current) {
      setTimeout(() => {
        const imageSrc = webcamRef.current?.getScreenshot({ width: 3840, height: 2160 });
        if (imageSrc) {
          setCapturedImage(imageSrc);
          setTimeout(stopWebcamStream, 500);
        } else {
          setTimeout(capturePhoto, 500);
        }
      }, 500);
    }
  };

  const stopWebcamStream = () => {
    if (webcamRef.current && webcamRef.current.video) {
      const stream = webcamRef.current.video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
    setShowWebcam(false);
  };

  const generatePDF = () => {
    const enteredName = prompt("Bitte gib deinen Namen ein:");
    if (!enteredName) return; // Falls kein Name eingegeben wird, brich ab.

    if (!certificateRef.current) return;

    html2canvas(certificateRef.current, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png", 1.0); // Maximale Qualität setzen
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight, "", "FAST"); // Schnellere Performance
      
      // Schriftgröße setzen
      pdf.setFontSize(20);

      // Y-Koordinate anpassen, damit der Name über dem Bild platziert wird
      pdf.text(`${enteredName}`, 105, 70, { align: "center" });
      

      pdf.save("zertifikat_einreichung.pdf");
    });
};


  return (
    <div className="celebration-container">
      <div ref={fireworksContainerRef} className="fireworks-container"></div>
      <h1 className="celebration-title">
  🎉 <span style={{ color: "#ffcc00", textShadow: "0 0 10px #ffcc00" }}>Herzlichen Glückwunsch</span> zur Einreichung! 🎉
      </h1>
      {countdown > 0 && <h2 className="countdown-text">📸 Foto in {countdown} Sekunden...</h2>}

      {showWebcam && (
        <div className="webcam-container animated-bounce">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/png"
            className="webcam bordered"
            videoConstraints={videoConstraints}
          />
        </div>
      )}

      {capturedImage && (
        <div className="certificate-container">
          <div ref={certificateRef} className="certificate modern-certificate">
            <div className="certificate-border stylish">
              <h2>🏆 Ehrenvolles Zertifikat der Einreichung 🏆</h2>
              <p>Verliehen an:</p>
              <h3 className="celebration-name highlight">Mega-Brain der Wissenschaft</h3>
              <br />
              <p>Für die erfolgreiche Einreichung der Dissertation 📜🎓</p>
              <img src={capturedImage} alt="Aufgenommenes Foto" className="certificate-image framed shadow" />
              <div className="certificate-seal pulse">🏅 Ehrenmedaille für Exzellenz 🏅</div>
              <p className="signature">Verliehen vom <strong>Lehrstuhl für Eskalation (LfE)! 🚀</strong></p>
              <p className="signature2">Ihr Einreichungskomitee Kippo und Lorenzo wünscht alles Gute!</p>
              </div>
          </div>
          <button className="btn-download fancy-button" onClick={generatePDF}>📄 Zertifikat herunterladen</button>
        </div>
      )}
    </div>
  );
};

export default CelebrationApp;
