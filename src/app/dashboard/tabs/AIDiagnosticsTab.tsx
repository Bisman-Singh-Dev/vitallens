"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquareText, ImagePlus, Send, Loader2, Camera as CameraIcon, X, Mic, MicOff, ThumbsUp, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

export default function AIDiagnosticsTab({ user, setActiveTab, setStartVoiceAlarmFlow }: { user: any, setActiveTab?: (id: string) => void, setStartVoiceAlarmFlow?: (val: boolean) => void }) {
  const [messages, setMessages] = useState<{role: string, content: string, hasImage?: boolean}[]>([
    { role: "assistant", content: "Hello! I am your AI Health Assistant. Say 'RoboDoc Wake Up' for English, or 'Utha Ja' for Hindi!" }
  ]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [micError, setMicError] = useState<string | null>(null);
  
  // UI Modal Camera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const isCameraActiveRef = useRef(false);
  
  // Invisible Background Camera (for gestures while looking at chat)
  const [isBackgroundCameraActive, setIsBackgroundCameraActive] = useState(false);
  
  const [emergencyVideoUrl, setEmergencyVideoUrl] = useState("");
  const emergencyVideoUrlRef = useRef("");
  
  const [isWakingUp, setIsWakingUp] = useState(false);
  const isWakingUpRef = useRef(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(true); // Ref to avoid stale closures in event listeners
  const isHardwareRecordingRef = useRef(false); // Track actual browser hardware state
  const isTTSPlayingRef = useRef(false); // Prevent mic from hearing the TTS
  const lastSpeechTimeRef = useRef(Date.now());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Gesture Recognizer State
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
  
  // Audio Ref for stopping TTS
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

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
          runningMode: "VIDEO"
        });
        setGestureRecognizer(recognizer);
      } catch (e) {
        console.error("Failed to load MediaPipe model", e);
      }
    };
    initModel();
  }, []);

  const playDirectTTS = (text: string, onEnd: () => void) => {
    isTTSPlayingRef.current = true;
    stopRecording();
    
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
       const utterance = new SpeechSynthesisUtterance(text.replace(/\*/g, ""));
       utterance.lang = language === "hi" ? "hi-IN" : "en-US";
       // Speak slightly faster for UI triggers to make the app feel incredibly snappy
       utterance.rate = 1.15; 
       
       // Prevent Chrome garbage collection bug
       if (!(window as any).synthUtterances) (window as any).synthUtterances = [];
       (window as any).synthUtterances.push(utterance);

       let ended = false;
       const handleEnd = () => {
          if (ended) return;
          ended = true;
          isTTSPlayingRef.current = false;
          onEnd();
       };

       utterance.onend = handleEnd;
       utterance.onerror = handleEnd;
       window.speechSynthesis.speak(utterance);

       // Chromium auto-play policy or silent TTS stalls can block onend forever.
       // Add a fallback timeout based on text length to unblock the UI automatically.
       const estimatedTimeMs = (text.length * 80) + 2000;
       setTimeout(() => {
          if (!ended) {
             console.warn("TTS stalled or blocked by Chromium autoplay policy. Forcing UI to resume.");
             try { window.speechSynthesis.cancel(); } catch(e){}
             handleEnd();
          }
       }, Math.min(estimatedTimeMs, 10000)); // Cap the wait at 10s max

    } else {
       isTTSPlayingRef.current = false;
       onEnd();
    }
  };

  const handleManualWakeUp = () => {
     if (isCameraActiveRef.current || isWakingUpRef.current) return;
     setLanguage("en");
     setIsWakingUp(true);
     isWakingUpRef.current = true;
     playDirectTTS("I am awake. Please show me what's wrong.", () => {
        setIsWakingUp(false);
        isWakingUpRef.current = false;
        setIsCameraActive(true);
        isCameraActiveRef.current = true;
     });
     setInput("");
  };

  
  const processAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    isLoadingRef.current = true;
    setInput("Processing audio...");
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const res = await fetch("/api/stt", {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) throw new Error("Transcription failed");
      const data = await res.json();
      
      let transcript = (data.text || "").toLowerCase();
      setInput(transcript);

      // Give user time to see what was heard
      setTimeout(() => {
          if (isCameraActiveRef.current || isWakingUpRef.current) return;

          if (transcript.includes("emergency") || transcript.includes("emegency")) {
            isCameraActiveRef.current = true;
            setInput("CRITICAL ALERT: The user has explicitly triggered an EMERGENCY! You MUST apply the CRITICAL EMERGENCY RULE and generate the EMERGENCY_REDIRECT youtube link for whatever you see in the photo.");
            playDirectTTS(language === "hi" ? "आपातकालीन कैमरा खोल रहा हूँ" : "Opening camera for emergency scan. Please show the injury.", () => {
               setIsCameraActive(true);
            });
          } else if (transcript.includes("health manager") || transcript.includes("healthmanager")) {
            if (setStartVoiceAlarmFlow && setActiveTab) {
              setStartVoiceAlarmFlow(true);
              setActiveTab("health-manager");
            }
          } else if (transcript.includes("help") || transcript.includes("halp")) {
            isCameraActiveRef.current = true;
            setInput("");
            playDirectTTS(language === "hi" ? "कैमरा खोल रहा हूँ" : "Opening camera. Please show me the problem.", () => {
               setIsCameraActive(true);
            });
          } else if (transcript.includes("uth") || transcript.includes("uta") || transcript.includes("utha")) {
            setLanguage("hi");
            setIsWakingUp(true);
            isWakingUpRef.current = true;
            playDirectTTS("मैं जाग रहा हूँ। कृपया मुझे समस्या दिखाएं।", () => {
               setIsWakingUp(false);
               isWakingUpRef.current = false;
               setIsCameraActive(true);
               isCameraActiveRef.current = true;
            });
            setInput("");
          } else if (transcript.includes("wake") || transcript.includes("wak")) {
            setLanguage("en");
            setIsWakingUp(true);
            isWakingUpRef.current = true;
            playDirectTTS("I am awake. Please show me what's wrong.", () => {
               setIsWakingUp(false);
               isWakingUpRef.current = false;
               setIsCameraActive(true);
               isCameraActiveRef.current = true;
            });
            setInput("");
          } else if (transcript.includes("mute") || transcript.includes("stop speaking") || transcript.includes("shut up") || transcript.includes("quiet")) {
            if (currentAudioRef.current) {
               currentAudioRef.current.pause();
               currentAudioRef.current.currentTime = 0;
               currentAudioRef.current = null;
            }
            if (typeof window !== "undefined" && window.speechSynthesis) {
               window.speechSynthesis.cancel();
            }
            isTTSPlayingRef.current = false;
            setInput("");
          } else if (transcript.includes("close the first aid video") || transcript.includes("close first aid video") || transcript.includes("close video")) {
            setEmergencyVideoUrl("");
            setInput("");
            setMessages([]);
          } else if (transcript.includes("refresh") || transcript.includes("restart") || transcript.includes("reset")) {
            setEmergencyVideoUrl("");
            setInput("");
            setMessages([]);
          } else {
             const cleanedTranscript = transcript.trim();
             if (cleanedTranscript.length > 0) {
                handleSend(cleanedTranscript);
             } else {
                setInput("");
             }
          }
      }, 1000);

    } catch (e) {
      console.error(e);
      setMicError("Transcription failed");
      setInput("");
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      isListeningRef.current = true;
      setIsListening(true);
      setMicError(null);
    } catch (err) {
      console.error("Mic permission denied:", err);
      setMicError("Mic Permission Denied or Not Found");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    isListeningRef.current = false;
    setIsListening(false);
  };

  const toggleListen = () => {
    if (isListeningRef.current) {
      isListeningRef.current = false;
      stopRecording();
      setIsListening(false);
    } else {
      isListeningRef.current = true;
      
      setIsListening(true);
    }
  };

  // Manage UI Camera Stream
  useEffect(() => {
    if (isCameraActive) {
      startCamera(videoRef);
    } else {
      stopCamera(videoRef);
    }
  }, [isCameraActive]);

  // Manage Background Camera Stream
  useEffect(() => {
    if (!isCameraActive) {
      setIsBackgroundCameraActive(true);
      startCamera(backgroundVideoRef);
    } else {
      setIsBackgroundCameraActive(false);
      stopCamera(backgroundVideoRef);
    }
  }, [isCameraActive]);

  const startCamera = async (ref: React.RefObject<HTMLVideoElement | null>) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setIsCameraActive(false);
      setIsBackgroundCameraActive(false);
    }
  };

  const stopCamera = (ref: React.RefObject<HTMLVideoElement | null>) => {
    if (ref.current && ref.current.srcObject) {
      const stream = ref.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      ref.current.srcObject = null;
    }
  };
  
  // Keep refs in sync for gesture loop overrides and microphone muting
  useEffect(() => {
     isCameraActiveRef.current = isCameraActive;
     emergencyVideoUrlRef.current = emergencyVideoUrl;
     
     if (isCameraActive || emergencyVideoUrl) {
         stopRecording();
     } else {
         
     }
  }, [isCameraActive, emergencyVideoUrl]);

  // Continuous Gesture Detection Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastVideoTime = -1;
    let thumbsUpFrames = 0;
    let openPalmFrames = 0;

    const detectGesture = async () => {
      // Determine which video feed is active
      const activeRef = isCameraActive ? videoRef : (isBackgroundCameraActive ? backgroundVideoRef : null);
      
      if (activeRef?.current && gestureRecognizer) {
        const video = activeRef.current;
        if (video.currentTime !== lastVideoTime && video.videoWidth > 0) {
          lastVideoTime = video.currentTime;
          
          try {
            const results = gestureRecognizer.recognizeForVideo(video, performance.now());
            
            if (results.gestures && results.gestures.length > 0) {
              const gestureName = results.gestures[0][0].categoryName;
              
              if (gestureName === "Thumb_Up" && isCameraActive && !isLoading) {
                thumbsUpFrames++;
                if (thumbsUpFrames > 45) { // roughly 1.5s of holding thumbs up
                  thumbsUpFrames = 0;
                  captureImageAndSend();
                  return; // exit loop so we don't spam captures
                }
              } else if (gestureName === "Open_Palm" && isBackgroundCameraActive) {
                openPalmFrames++;
                if (openPalmFrames > 5) {
                  // Stop Deepgram audio if playing
                  if (currentAudioRef.current) {
                    currentAudioRef.current.pause();
                    currentAudioRef.current.currentTime = 0;
                    currentAudioRef.current = null;
                  }
                  // Stop Native Speech Synthesis if playing
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                  openPalmFrames = 0;
                  
                  isTTSPlayingRef.current = false;
                  
                }
              } else {
                thumbsUpFrames = 0;
                openPalmFrames = 0;
              }
            }
          } catch(e) {}
        }
      }
      animationFrameId = requestAnimationFrame(detectGesture);
    };
    
    if ((isCameraActive || isBackgroundCameraActive) && gestureRecognizer) {
      detectGesture();
    }
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isCameraActive, isBackgroundCameraActive, gestureRecognizer, isLoading]);

  const captureImageAndSend = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    
    // Scale down the image to prevent Vercel 4.5MB Payload limit crashes (Failed to fetch)
    let width = videoRef.current.videoWidth;
    let height = videoRef.current.videoHeight;
    const MAX_WIDTH = 1280;
    const MAX_HEIGHT = 720;
    
    if (width > MAX_WIDTH) {
       height = Math.round(height * (MAX_WIDTH / width));
       width = MAX_WIDTH;
    }
    if (height > MAX_HEIGHT) {
       width = Math.round(width * (MAX_HEIGHT / height));
       height = MAX_HEIGHT;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        setIsCameraActive(false);
        isCameraActiveRef.current = false;
        handleSend("I have taken a picture of my condition.", file);
      }
    }, "image/jpeg", 0.7);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSend = async (overrideInput?: string, overrideImage?: File) => {
    const textToSend = overrideInput !== undefined ? overrideInput : input;
    const currentImage = overrideImage || selectedImage;
    
    if (!textToSend.trim() && !currentImage) return;

    const userMsg = textToSend.trim();
    const hasImage = !!currentImage;
    
    setMessages(prev => [...prev, { role: "user", content: userMsg || "Uploaded an image for analysis.", hasImage }]);
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);
    isLoadingRef.current = true;

    // Force mute the microphone while processing the request
    stopRecording();

    try {
      const formData = new FormData();
      formData.append("message", userMsg);
      // Pass the language state to the API so it knows whether to use English or Hindi
      formData.append("language", language); 
      
      if (currentImage) {
        formData.append("image", currentImage);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) {
         const errText = await res.text();
         throw new Error(errText || "Failed to fetch");
      }

      let responseToSpeak = "";
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
         const data = await res.json();
         if (data.error) throw new Error(data.error);
         responseToSpeak = data.response;
         setMessages(prev => [...prev, { role: "assistant", content: responseToSpeak }]);
      } else {
         // Process SSE stream
         const reader = res.body?.getReader();
         const decoder = new TextDecoder("utf-8");
         
         setMessages(prev => [...prev, { role: "assistant", content: "" }]);
         
         if (reader) {
             let buffer = "";
             while (true) {
               const { done, value } = await reader.read();
               if (done) break;
               
               buffer += decoder.decode(value, { stream: true });
               
               const lines = buffer.split("\n");
               buffer = lines.pop() || ""; // Keep the incomplete line in the buffer
               
               for (const line of lines) {
                  if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
                     try {
                       const dataStr = line.slice(6);
                       const data = JSON.parse(dataStr);
                       
                       let textChunk = "";
                       if (data.candidates && data.candidates[0].content) {
                          textChunk = data.candidates[0].content.parts[0].text;
                       } else if (data.choices && data.choices[0].delta) {
                          textChunk = data.choices[0].delta.content || "";
                       }
                       
                       if (textChunk) {
                          responseToSpeak += textChunk;
                          setMessages(prev => {
                             const newMsgs = [...prev];
                             newMsgs[newMsgs.length - 1].content = responseToSpeak;
                             return newMsgs;
                          });
                       }
                     } catch (e) {
                       console.error("Error parsing chunk:", e, line);
                     }
                  }
               }
             }
         }
      }

      let emergencyRedirectUrl = "";
      
      if (responseToSpeak.match(/EMERGENCY_REDIRECT/i)) {
        const urlMatch = responseToSpeak.match(/(https?:\/\/(?:www\.)?youtube\.com\/embed\/[A-Za-z0-9_-]+(?:\?autoplay=1)?)/);
        if (urlMatch && urlMatch[1]) {
          emergencyRedirectUrl = urlMatch[1];
          // Remove the URL and keyword from spoken text
          responseToSpeak = responseToSpeak.replace(/EMERGENCY_REDIRECT:?/i, "").replace(urlMatch[1], "").trim();
        }
      }
      
      if (emergencyRedirectUrl) {
          setTimeout(() => {
             setEmergencyVideoUrl(emergencyRedirectUrl);
          }, 500); // Give it half a second so the UI updates first
      }
      
      // Auto-play TTS
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
         isTTSPlayingRef.current = true;
         stopRecording();
         const utterance = new SpeechSynthesisUtterance(responseToSpeak.replace(/\*/g, ""));
         utterance.lang = language === "hi" ? "hi-IN" : "en-US";
         utterance.rate = 1.1; // Make it snappy
         
         if (!(window as any).synthUtterances) (window as any).synthUtterances = [];
         (window as any).synthUtterances.push(utterance);

         utterance.onend = () => {
            isTTSPlayingRef.current = false;
            setIsBackgroundCameraActive(false); // Shutdown invisible camera when done
            
         };
         utterance.onerror = () => {
            isTTSPlayingRef.current = false;
            setIsBackgroundCameraActive(false);
            
         };
         window.speechSynthesis.speak(utterance);
      }
      
    } catch (err: any) {
      const errMsg = `Sorry, I encountered an error: ${err.message}`;
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
      playDirectTTS(errMsg, () => {
         setIsBackgroundCameraActive(false);
         
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
      
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background ambient glow matching HealthManagerTab */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/20 to-black pointer-events-none z-0"></div>
      {emergencyVideoUrl && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,51,102,0.3)]">
           <div className="flex justify-end p-4 bg-neutral-900 border-b border-neon-red/30">
              <button onClick={() => { setEmergencyVideoUrl(""); window.location.reload(); }} className="bg-neon-red/20 text-neon-red hover:bg-neon-red hover:text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all">
                 <X className="w-5 h-5" /> Close First Aid Video
              </button>
           </div>
           <iframe 
              src={emergencyVideoUrl} 
              className="flex-1 w-full h-full" 
              allow="autoplay; encrypted-media" 
              allowFullScreen
           />
        </div>
      )}

      {/* Invisible background camera for Open Palm tracking while on chat screen */}
      <video 
        ref={backgroundVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute opacity-0 w-[1px] h-[1px] pointer-events-none"
      />

      {/* Waking Up Modal */}
      <AnimatePresence>
        {isWakingUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-4"
          >
             <div className="flex gap-8 mb-12">
                <motion.div 
                   animate={{ scaleY: [0.1, 1, 0.1, 1], opacity: [0.5, 1, 0.5, 1] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                   className="w-16 h-8 bg-neon-red rounded-[50px] shadow-[0_0_40px_rgba(255,51,102,1)]" 
                />
                <motion.div 
                   animate={{ scaleY: [0.1, 1, 0.1, 1], opacity: [0.5, 1, 0.5, 1] }}
                   transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                   className="w-16 h-8 bg-neon-red rounded-[50px] shadow-[0_0_40px_rgba(255,51,102,1)]" 
                />
             </div>
             <p className="text-neon-red text-2xl font-black tracking-[0.3em] animate-pulse uppercase">
                {language === "hi" ? "रोबोडॉक शुरू हो रहा है..." : "Booting RoboDoc..."}
             </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widescreen Camera Modal */}
      <AnimatePresence>
        {isCameraActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 z-30 flex flex-col items-center justify-center p-8 backdrop-blur-md"
          >
            <button 
              onClick={() => setIsCameraActive(false)}
              className="absolute top-6 right-6 p-3 text-gray-400 hover:text-white bg-neutral-800 rounded-full"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="relative w-full max-w-lg mx-auto aspect-video rounded-3xl border-2 border-neon-red overflow-hidden shadow-[0_0_30px_rgba(255,51,102,0.3)]">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-6">
                <p className="text-white font-medium text-lg flex items-center gap-2 drop-shadow-md">
                  <ThumbsUp className="w-6 h-6 text-neon-red animate-pulse" /> 
                  {language === "hi" ? "फोटो खींचने के लिए थम्स अप दिखाएं" : "Show Thumbs Up to capture"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Futuristic AI Diagnostic Lab UI */}
      <div className="w-full h-full min-h-[calc(100vh-4rem)] flex flex-col justify-between relative z-10 overflow-hidden py-4 px-2 sm:px-8">
        
        {/* Header Title */}
        <div className="w-full flex justify-between pt-2 px-2 sm:px-0 z-20">
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red drop-shadow-[0_0_10px_rgba(255,51,102,0.3)]">
            ROBODOC
          </h1>
          {micError && (
             <div className="bg-red-500/20 border border-red-500 text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 max-w-[200px] sm:max-w-xs truncate">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
               {micError}
             </div>
          )}
        </div>

        {/* Central Orb / Voice Interface */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 my-4">
           
           {/* Glowing AI Orb Matching HealthManagerTab */}
           <div 
             onClick={handleManualWakeUp}
             role="button"
             tabIndex={0}
             className="relative mb-4 sm:mb-8 flex items-center justify-center cursor-pointer group focus:outline-none hover:scale-105 transition-transform duration-300"
             aria-label="Manual Wake Up"
           >
             <div className="relative w-40 h-40 sm:w-64 sm:h-64 flex items-center justify-center">
               {/* Outer glow rings */}
               <div className={`absolute inset-0 rounded-full border border-brand-500/30 transition-all duration-700 ease-in-out ${isListening ? 'scale-125 opacity-0 animate-ping' : 'scale-100 opacity-50'}`}></div>
               <div className={`absolute inset-4 rounded-full border border-brand-400/50 transition-all duration-500 ease-in-out ${isListening ? 'scale-110 opacity-30 animate-pulse' : 'scale-100 opacity-50'}`}></div>
               
               {/* Core Orb */}
               <div className={`relative w-28 h-28 sm:w-48 sm:h-48 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out shadow-[0_0_50px_rgba(255,51,102,0.3)] ${isListening ? 'bg-gradient-to-tr from-brand-600 to-neon-red shadow-[0_0_80px_rgba(255,51,102,0.6)]' : isLoading ? 'bg-gradient-to-tr from-brand-800 to-neon-purple animate-pulse' : 'bg-gradient-to-tr from-brand-900 to-brand-700'}`}>
                  {isListening ? (
                     <Mic className={`w-10 h-10 sm:w-16 sm:h-16 text-white drop-shadow-[0_0_15px_rgba(255,51,102,0.8)]`} />
                  ) : isLoading ? (
                     <div className="flex gap-1 sm:gap-2">
                        <motion.div animate={{ height: [10, 30, 10] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 sm:w-2 bg-white rounded-full" />
                        <motion.div animate={{ height: [10, 45, 10] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 sm:w-2 bg-white rounded-full" />
                        <motion.div animate={{ height: [10, 30, 10] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 sm:w-2 bg-white rounded-full" />
                     </div>
                  ) : (
                     <Brain className="w-10 h-10 sm:w-16 sm:h-16 text-brand-300 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)] opacity-80" />
                  )}
               </div>
             </div>
           </div>

           {/* Live Transcription / Last Message */}
           <div className="w-full max-w-2xl text-center min-h-[60px] sm:min-h-[100px] mb-4 sm:mb-8">
              <AnimatePresence mode="popLayout">
                 {input && (
                   <motion.p 
                     key="transcription"
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                     className="text-xl font-medium text-gray-300 italic"
                   >
                     "{input}"
                   </motion.p>
                 )}
                 {!input && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
                   <motion.div
                     key="last-response"
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                     className="text-lg text-white font-medium bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl inline-block text-left"
                   >
                     <p className="whitespace-pre-wrap">{messages[messages.length - 1].content}</p>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Voice Input Button */}
           <button 
             onClick={() => {
                if (isListeningRef.current) {
                   stopRecording();
                } else {
                   startRecording();
                }
             }}
             className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 ${
               isListening 
                 ? 'bg-neon-red/20 text-neon-red border border-neon-red shadow-[0_0_30px_rgba(255,51,102,0.4)]' 
                 : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40'
             }`}
           >
             {isListening ? (
               <><div className="w-3 h-3 rounded-full bg-neon-red animate-pulse" /> Stop Listening</>
             ) : (
               <><Mic className="w-5 h-5" /> Start Voice Input</>
             )}
           </button>
        </div>

        {/* Bottom Floating Control Bar (Now Flowing Naturally at Bottom) */}
        <div className="w-full max-w-3xl mx-auto px-2 pb-4">
           <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
             <label className="p-2 sm:p-4 hover:bg-white/10 rounded-xl cursor-pointer transition-colors text-gray-400 hover:text-white flex items-center justify-center group relative shrink-0">
               <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
               <CameraIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
               {selectedImage && <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-2 h-2 rounded-full bg-neon-red animate-pulse" />}
             </label>
             <input 
               type="text" 
               value={input} 
               onChange={e => setInput(e.target.value)} 
               onKeyDown={e => e.key === "Enter" && handleSend()}
               placeholder="Or type your symptoms manually..."
               className="flex-1 bg-transparent text-white px-2 sm:px-4 py-2 sm:py-4 text-sm sm:text-lg focus:outline-none placeholder-gray-500 min-w-0"
             />
             <button 
               onClick={() => handleSend()}
               disabled={isLoading || (!input.trim() && !selectedImage)}
               className={`p-2 sm:p-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                 isLoading || (!input.trim() && !selectedImage)
                   ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                   : 'bg-brand-600 text-white hover:bg-brand-500 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]'
               }`}
             >
               {isLoading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Send className="w-5 h-5 sm:w-6 sm:h-6" />}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}