"use client";

import { useState, useEffect, useRef } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Mic } from "lucide-react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

export default function HealthManagerTab({ user, setActiveTab }: { user: any, setActiveTab?: (id: string) => void }) {
  const [voiceStep, setVoiceStep] = useState<"idle" | "asking_when" | "asking_what" | "asking_frequency">("idle");
  const voiceStepRef = useRef("idle");
  const alarmDataRef = useRef({ message: "", time: "", frequency: "", timeTranscript: "", messageTranscript: "", frequencyTranscript: "" });
  const isHardwareRecordingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const isTTSPlayingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lastSpeechTimeRef = useRef(Date.now());
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);

  const speakText = (text: string, onEnd?: () => void) => {
    isTTSPlayingRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
       const utterance = new SpeechSynthesisUtterance(text.replace(/\*/g, ""));
       utterance.lang = "en-US";
       utterance.rate = 1.1;
       
       // Prevent Chrome garbage collection bug
       if (!(window as any).synthUtterances) (window as any).synthUtterances = [];
       (window as any).synthUtterances.push(utterance);

       utterance.onend = () => {
          isTTSPlayingRef.current = false;
          if (onEnd) onEnd();
          if (recognitionRef.current) { try { recognitionRef.current.start(); } catch(e){} }
       };
       utterance.onerror = () => {
          isTTSPlayingRef.current = false;
          if (onEnd) onEnd();
          if (recognitionRef.current) { try { recognitionRef.current.start(); } catch(e){} }
       };
       window.speechSynthesis.speak(utterance);
    } else {
       isTTSPlayingRef.current = false;
       if (onEnd) onEnd();
       if (recognitionRef.current) { try { recognitionRef.current.start(); } catch(e){} }
    }
  };

  const getLlamaTime = async (transcript: string) => {
    try {
      const d = new Date();
      const current = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      const res = await fetch("/api/parse-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, localTime: current })
      });
      const data = await res.json();
      return data.time || "12:00";
    } catch {
      return "12:00";
    }
  };

  const saveAlarm = async (message: string, time: string, frequency: string) => {
    const days = frequency.includes("week") ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Everyday"];
    if (user && user.id !== "guest_user") {
      await addDoc(collection(db, "users", user.id, "reminders"), {
        text: message,
        timeOfDay: time,
        frequency: days.includes("Everyday") ? "daily" : "weekly",
        active: true,
        createdAt: new Date().toISOString()
      });
    }
    
    const existing = localStorage.getItem("roboDocAlarms");
    const alarms = existing ? JSON.parse(existing) : [];
    const newAlarm = {
      id: Date.now().toString(),
      message,
      time,
      days,
      isActive: true
    };
    alarms.push(newAlarm);
    localStorage.setItem("roboDocAlarms", JSON.stringify(alarms));
  };

  const advanceVoiceStep = async () => {
     if (isProcessingRef.current || isTTSPlayingRef.current) return;
     const currentStep = voiceStepRef.current;
     
     if (currentStep === "idle") {
         if (setActiveTab) setActiveTab("ai-diagnostics");
         return;
     }
     
     if (currentStep === "asking_when") {
         isProcessingRef.current = true;
         if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e){} }
         const parsedTime = await getLlamaTime(alarmDataRef.current.timeTranscript || "5 PM");
         alarmDataRef.current.time = parsedTime;
         voiceStepRef.current = "idle";
         setVoiceStep("idle");
         
         speakText("Done! What do you want me to say?", () => {
            isProcessingRef.current = false;
            voiceStepRef.current = "asking_what";
            setVoiceStep("asking_what");
         });
     } 
     else if (currentStep === "asking_what") {
         isProcessingRef.current = true;
         if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e){} }
         alarmDataRef.current.message = alarmDataRef.current.messageTranscript || "Time for your medicine";
         voiceStepRef.current = "idle";
         setVoiceStep("idle");
         
         speakText("Done! Everyday or Everyweek alarm", () => {
            isProcessingRef.current = false;
            voiceStepRef.current = "asking_frequency";
            setVoiceStep("asking_frequency");
         });
     }
     else if (currentStep === "asking_frequency") {
         isProcessingRef.current = true;
         if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e){} }
         alarmDataRef.current.frequency = alarmDataRef.current.frequencyTranscript || "Everyday";
         
         await saveAlarm(alarmDataRef.current.message, alarmDataRef.current.time, alarmDataRef.current.frequency);
         
         voiceStepRef.current = "idle";
         setVoiceStep("idle");
         speakText("Done!", () => {
            isProcessingRef.current = false;
         });
     }
  };

  // Initialize MediaPipe Gesture Recognizer
  useEffect(() => {
    const initModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setGestureRecognizer(recognizer);
      } catch (err) {
        console.error("Failed to initialize gesture recognizer", err);
      }
    };
    initModel();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
         if (backgroundVideoRef.current) {
            backgroundVideoRef.current.srcObject = stream;
         }
      })
      .catch(console.error);
    }
  }, []);

  // Gesture loop
  useEffect(() => {
    let animationFrameId: number;
    let lastVideoTime = -1;
    let thumbsUpFrames = 0;

    const detectGesture = async () => {
      if (backgroundVideoRef.current && gestureRecognizer) {
        const video = backgroundVideoRef.current;
        if (video.currentTime !== lastVideoTime && video.videoWidth > 0) {
          lastVideoTime = video.currentTime;
          try {
            const results = gestureRecognizer.recognizeForVideo(video, performance.now());
            if (results.gestures && results.gestures.length > 0) {
              const gestureName = results.gestures[0][0].categoryName;
              if (gestureName === "Thumb_Up") {
                thumbsUpFrames++;
                if (thumbsUpFrames > 45) { 
                  thumbsUpFrames = 0;
                  advanceVoiceStep();
                }
              } else {
                thumbsUpFrames = 0;
              }
            }
          } catch(e) {}
        }
      }
      animationFrameId = requestAnimationFrame(detectGesture);
    };
    if (gestureRecognizer) {
      detectGesture();
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [gestureRecognizer]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false; 
        recognitionRef.current.lang = "en-US";
        
        recognitionRef.current.onstart = () => {
           isHardwareRecordingRef.current = true;
           setIsListening(true);
           isListeningRef.current = true;
           lastSpeechTimeRef.current = Date.now();
        };
        recognitionRef.current.onend = () => {
           isHardwareRecordingRef.current = false;
           setIsListening(false);
           isListeningRef.current = false;
           if (recognitionRef.current && !isTTSPlayingRef.current) {
              try { recognitionRef.current.start(); } catch(e){}
           }
        };
        
        recognitionRef.current.onerror = (event: any) => {
           isHardwareRecordingRef.current = false;
           setIsListening(false);
           isListeningRef.current = false;
        };
        
        recognitionRef.current.onresult = async (event: any) => {
          if (isProcessingRef.current || isTTSPlayingRef.current) return;
          if (!event.results[event.results.length - 1].isFinal) return;
          lastSpeechTimeRef.current = Date.now();
          const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
          
          if (transcript.includes("return to helper mode") || transcript.includes("helper mode") || transcript.includes("help mode") || transcript.includes("go back")) {
             if (setActiveTab) setActiveTab("ai-diagnostics");
             return;
          }
          
          if (voiceStepRef.current === "idle") {
             if (transcript.includes("set alarm") || transcript.includes("set an alarm") || transcript.includes("add alarm") || transcript.includes("add reminder")) {
                isProcessingRef.current = true;
                if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e){} }
                speakText("When do you want me to set the alarm?", () => {
                   isProcessingRef.current = false;
                   voiceStepRef.current = "asking_when";
                   setVoiceStep("asking_when");
                });
             }
             return;
          }
          
          if (voiceStepRef.current === "asking_when") {
             alarmDataRef.current.timeTranscript = transcript;
          } else if (voiceStepRef.current === "asking_what") {
             alarmDataRef.current.messageTranscript = transcript;
          } else if (voiceStepRef.current === "asking_frequency") {
             alarmDataRef.current.frequencyTranscript = transcript;
          }
        };
      }
    }
    
    const watchdog = setInterval(() => {
      const now = Date.now();
      if (recognitionRef.current && !isTTSPlayingRef.current && !isProcessingRef.current) {
        if (!isHardwareRecordingRef.current) {
           try { recognitionRef.current.start(); } catch (e) {}
        } else if (now - lastSpeechTimeRef.current > 8000) {
           try { recognitionRef.current.stop(); } catch(e){}
           lastSpeechTimeRef.current = now;
        }
      }
    }, 2000);
    
    return () => {
      clearInterval(watchdog);
      isListeningRef.current = false;
      if (recognitionRef.current) {
         recognitionRef.current.onend = null;
         recognitionRef.current.onresult = null;
         recognitionRef.current.onerror = null;
         try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, [user]);

  // Boot sequence auto-start
  useEffect(() => {
     speakText("When do you want me to set the alarm?", () => {
         voiceStepRef.current = "asking_when";
         setVoiceStep("asking_when");
     });
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Invisible video element for gesture tracking (Must not use display: none) */}
      <video ref={backgroundVideoRef} className="absolute opacity-0 w-[1px] h-[1px] pointer-events-none" autoPlay playsInline muted />
      
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/20 to-black pointer-events-none"></div>
      
      {/* Pulsing Orb UI */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer glow rings */}
          <div className={`absolute inset-0 rounded-full border border-brand-500/30 transition-all duration-700 ease-in-out ${isListening ? 'scale-125 opacity-0 animate-ping' : 'scale-100 opacity-50'}`}></div>
          <div className={`absolute inset-4 rounded-full border border-brand-400/50 transition-all duration-500 ease-in-out ${isListening ? 'scale-110 opacity-30 animate-pulse' : 'scale-100 opacity-50'}`}></div>
          
          {/* Core Orb */}
          <div className={`relative w-48 h-48 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out shadow-[0_0_50px_rgba(255,51,102,0.3)] ${isListening ? 'bg-gradient-to-tr from-brand-600 to-neon-red shadow-[0_0_80px_rgba(255,51,102,0.6)]' : 'bg-gradient-to-tr from-brand-900 to-brand-700'}`}>
             <Mic className={`w-16 h-16 ${isListening ? 'text-white' : 'text-brand-300'}`} />
          </div>
        </div>
        
        {/* Status Text */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-light tracking-wider text-white mb-2">
            {voiceStep === "asking_when" ? "Awaiting Time" : 
             voiceStep === "asking_what" ? "Awaiting Message" :
             voiceStep === "asking_frequency" ? "Awaiting Frequency" :
             isListening ? "Listening..." : "Health Manager Active"}
          </h2>
          <p className="text-brand-300 text-sm opacity-60">Say your answer, then show a 👍 to confirm</p>
          <p className="text-brand-300 text-sm opacity-60 mt-1">Say "Return to helper mode" to exit</p>
        </div>
      </div>
    </div>
  );
}
