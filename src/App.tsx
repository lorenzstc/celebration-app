// celebration_app/src/App.tsx
import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Fireworks } from "fireworks-js";
import "./App.css";

const CelebrationApp = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [showWebcam, setShowWebcam] = useState(true);
  const webcamRef = useRef<Webcam | null>(null);
  const certificateRef = useRef(null);
  const fireworksRef = useRef<Fireworks | null>(null);
  const fireworksContainerRef = useRef<HTMLDivElement | null>(null);

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
          opacity: 0.7,
          acceleration: 1.02,
          particles: 80,
          explosion: 5,
          intensity: 30,
          friction: 0.98,
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
  
        // Warten, bis DOM vollständig ist, dann starten
        setTimeout(() => {
          fireworksRef.current?.start();
        }, 500);
      }
    };
  
    // Starte Fireworks, wenn die Seite bereit ist
    window.addEventListener("load", initializeFireworks);

    // Countdown starten
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
        const imageSrc = webcamRef.current?.getScreenshot();
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
    if (!certificateRef.current) return;

    html2canvas(certificateRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("zertifikat_einreichung.pdf");
    });
  };

  return (
    <div className="celebration-container">
      <div ref={fireworksContainerRef} className="fireworks-container"></div>
      <h1 className="celebration-title">🎉 Herzlichen Glückwunsch zur Einreichung! 🎉</h1>
      {countdown > 0 && <h2 className="countdown-text">📸 Fotoaufnahme in {countdown} Sekunden...</h2>}

      {showWebcam && (
        <div className="webcam-container">
          <Webcam ref={webcamRef} screenshotFormat="image/png" className="webcam" />
        </div>
      )}

      {capturedImage && (
        <div className="certificate-container">
          <div ref={certificateRef} className="certificate">
            <h2>🏆 Zertifikat der Einreichung 🏆</h2>
            <p>Verliehen an:</p>
            <h3 className="celebration-name">Hervorragende/r Forscher/in</h3>
            <p>Für die erfolgreiche Einreichung der Dissertation 📜</p>
            <p>Das ist Klaus enough am Dr-Titel</p>
            <img src={capturedImage} alt="Aufgenommenes Foto" className="certificate-image" />
            <p className="signature">Unterschrift: <strong>Lehrstuhl für Eskalation (LfE)! 🎉</strong></p>
          </div>
          <button className="btn-download" onClick={generatePDF}>📄 Zertifikat herunterladen</button>
        </div>
      )}
    </div>
  );
};

export default CelebrationApp;
