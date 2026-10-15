"use client";

import { useState, useRef, useEffect } from "react";
import { X, ThumbsUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import CuteNeonEyes, { EyeState } from "@/components/CuteNeonEyes";

export default function AIDiagnosticsTab({ 
  user, 
  setActiveTab, 
  setStartVoiceAlarmFlow 
}: { 
  user: any; 
  setActiveTab?: (id: string) => void; 
  setStartVoiceAlarmFlow?: (val: boolean) => void; 
}) {
  const [messages, setMessages] = useState<{ role: string; content: string; hasImage?: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  
  // Awake State: Starts dormant until "WakeUp Robodoc" is heard
  const [isAwake, setIsAwake] = useState(false);
  const isAwakeRef = useRef(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);

  // UI Modal Camera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const isCameraActiveRef = useRef(false);
  
  // Invisible Background Camera (for gestures)
  const [isBackgroundCameraActive, setIsBackgroundCameraActive] = useState(false);
  
  const [emergencyVideoUrl, setEmergencyVideoUrl] = useState("");
  const emergencyVideoUrlRef = useRef("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(true);
  const isTTSPlayingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Gesture Recognizer State
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);

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

  const playDirectTTS = (text: string, onEnd?: () => void) => {
    isTTSPlayingRef.current = true;
    setIsTTSPlaying(true);
    if (recognitionRef.current) { 
      try { recognitionRef.current.stop(); } catch(e){} 
    }
    
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/\*/g, ""));
      utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      utterance.rate = 1.1; 
      
      if (!(window as any).synthUtterances) (window as any).synthUtterances = [];
      (window as any).synthUtterances.push(utterance);

      let ended = false;
      const handleEnd = () => {
        if (ended) return;
        ended = true;
        isTTSPlayingRef.current = false;
        setIsTTSPlaying(false);
        if (isListeningRef.current && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch(e){}
        }
        if (onEnd) onEnd();
      };

      utterance.onend = handleEnd;
      utterance.onerror = handleEnd;
      window.speechSynthesis.speak(utterance);

      const estimatedTimeMs = (text.length * 85) + 2000;
      setTimeout(() => {
        if (!ended) {
          try { window.speechSynthesis.cancel(); } catch(e){}
          handleEnd();
        }
      }, Math.min(estimatedTimeMs, 12000));
    } else {
      isTTSPlayingRef.current = false;
      setIsTTSPlaying(false);
      if (onEnd) onEnd();
    }
  };

  const wakeUpRobodoc = () => {
    if (isAwakeRef.current) return;
    setIsAwake(true);
    isAwakeRef.current = true;
    setInput("");
    playDirectTTS("Hello! RoboDoc is awake. How can I help you today?");
  };

  const processTranscript = (transcript: string) => {
    if (isCameraActiveRef.current) return;

    const lower = transcript.toLowerCase();
    const clean = lower.replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

    // 1. DORMANT STATE: STRICT WAKE WORD FILTER
    // Only "WakeUp Robodoc" wakes it up. Everything else is completely ignored and it remains silent.
    if (!isAwakeRef.current) {
      const isWakeWord = 
        clean.includes("wakeup robodoc") ||
        clean.includes("wake up robodoc") ||
        clean.includes("wake up robo doc") ||
        clean.includes("wakeup robo doc") ||
        clean.includes("wake up robot") ||
        clean.includes("wakeup robot") ||
        clean.includes("wake up") ||
        clean.includes("wakeup");

      if (isWakeWord) {
        wakeUpRobodoc();
      }
      // If it doesn't match wake word, REMAIN COMPLETELY SILENT!
      return;
    }

    // 2. AWAKE STATE: Handle commands and conversations
    setInput(transcript);

    // Sleep command
    if (clean.includes("go to sleep") || clean.includes("sleep robodoc") || clean.includes("bye robodoc") || clean.includes("shut down")) {
      playDirectTTS("Going to sleep. Say WakeUp Robodoc whenever you need me.", () => {
        setIsAwake(false);
        isAwakeRef.current = false;
        setInput("");
      });
      return;
    }

    // Health manager command
    if (clean.includes("health manager") || clean.includes("healthmanager") || clean.includes("set alarm") || clean.includes("set an alarm") || clean.includes("add alarm")) {
      if (setStartVoiceAlarmFlow && setActiveTab) {
        setStartVoiceAlarmFlow(true);
        setActiveTab("health-manager");
      }
      return;
    }

    // Emergency command
    if (clean.includes("emergency") || clean.includes("emegency")) {
      isCameraActiveRef.current = true;
      setInput("Emergency scan activated.");
      playDirectTTS("Opening camera for emergency scan. Please show the injury.", () => {
        setIsCameraActive(true);
      });
      return;
    }

    // Mute command
    if (clean.includes("mute") || clean.includes("stop speaking") || clean.includes("shut up") || clean.includes("quiet")) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      isTTSPlayingRef.current = false;
      setIsTTSPlaying(false);
      setInput("");
      return;
    }

    // Normal Conversation
    const cleanedTranscript = transcript.trim();
    if (cleanedTranscript.length > 0) {
      handleSend(cleanedTranscript);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        processTranscript(transcript);
      };
      
      recognitionRef.current.onerror = () => {
        // Silently recover background listener
      };

      recognitionRef.current.onend = () => {
        if (isListeningRef.current && !isTTSPlayingRef.current) {
          try { recognitionRef.current.start(); } catch(e){}
        }
      };

      // Start listening on mount in background
      setTimeout(() => {
        startRecording();
      }, 500);
    }
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch(e){}
    }
    setIsListening(true);
    isListeningRef.current = true;
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    setIsListening(false);
    isListeningRef.current = false;
  };

  useEffect(() => {
    const setupCamera = async () => {
      try {
        if (!cameraStreamRef.current) {
          cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        }
        
        const stream = cameraStreamRef.current;
        
        if (isCameraActive) {
          if (backgroundVideoRef.current) backgroundVideoRef.current.srcObject = null;
          if (videoRef.current) videoRef.current.srcObject = stream;
          setIsBackgroundCameraActive(false);
        } else {
          if (videoRef.current) videoRef.current.srcObject = null;
          if (backgroundVideoRef.current) {
            backgroundVideoRef.current.srcObject = stream;
            setIsBackgroundCameraActive(true);
          }
        }
      } catch (err) {
        console.error("Camera access:", err);
        setIsCameraActive(false);
        setIsBackgroundCameraActive(false);
      }
    };
    
    setupCamera();
  }, [isCameraActive]);

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  useEffect(() => {
    isCameraActiveRef.current = isCameraActive;
    emergencyVideoUrlRef.current = emergencyVideoUrl;
    
    if (isCameraActive || emergencyVideoUrl) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isCameraActive, emergencyVideoUrl]);

  // Continuous Gesture Detection Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastVideoTime = -1;
    let thumbsUpFrames = 0;
    let openPalmFrames = 0;

    const detectGesture = async () => {
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
                if (thumbsUpFrames > 45) {
                  thumbsUpFrames = 0;
                  captureImageAndSend();
                  return;
                }
              } else if (gestureName === "Open_Palm" && isBackgroundCameraActive) {
                openPalmFrames++;
                if (openPalmFrames > 5) {
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                  openPalmFrames = 0;
                  isTTSPlayingRef.current = false;
                  setIsTTSPlaying(false);
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

  const handleSend = async (overrideInput?: string, overrideImage?: File) => {
    const textToSend = overrideInput !== undefined ? overrideInput : input;
    if (!textToSend.trim() && !overrideImage) return;

    const userMsg = textToSend.trim();
    const hasImage = !!overrideImage;
    
    setMessages(prev => [...prev, { role: "user", content: userMsg || "Uploaded an image for analysis.", hasImage }]);
    setInput("");
    setIsLoading(true);
    isLoadingRef.current = true;

    stopRecording();

    try {
      const formData = new FormData();
      formData.append("message", userMsg);
      formData.append("language", language); 
      
      if (overrideImage) {
        formData.append("image", overrideImage);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData
      });
      
      let responseToSpeak = "";
      
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          responseToSpeak = data.response || "I am here with you. How can I help you today?";
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
              buffer = lines.pop() || "";
              
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
                    // Skip stream parse errors
                  }
                }
              }
            }
          }
        }
      } else {
        responseToSpeak = "I am right here with you. Please tell me more about how you are feeling.";
        setMessages(prev => [...prev, { role: "assistant", content: responseToSpeak }]);
      }

      if (!responseToSpeak.trim()) {
        responseToSpeak = "I am right here with you. How can I assist you with your health today?";
        setMessages(prev => [...prev, { role: "assistant", content: responseToSpeak }]);
      }

      // Check for emergency redirect
      if (responseToSpeak.match(/EMERGENCY_REDIRECT/i)) {
        const urlMatch = responseToSpeak.match(/(https?:\/\/(?:www\.)?youtube\.com\/embed\/[A-Za-z0-9_-]+(?:\?autoplay=1)?)/);
        if (urlMatch && urlMatch[1]) {
          setEmergencyVideoUrl(urlMatch[1]);
          responseToSpeak = responseToSpeak.replace(/EMERGENCY_REDIRECT:?/i, "").replace(urlMatch[1], "").trim();
        }
      }
      
      // Auto-play TTS with speech synthesis
      playDirectTTS(responseToSpeak);
      
    } catch (err: any) {
      console.error("Chat error handled gracefully:", err);
      // NEVER show or speak Groq API error
      const fallbackResponse = "I'm right here with you. Please tell me more about what you need.";
      setMessages(prev => [...prev, { role: "assistant", content: fallbackResponse }]);
      playDirectTTS(fallbackResponse);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Determine current eye expression state
  const eyeState: EyeState = !isAwake
    ? "dormant"
    : isTTSPlaying
    ? "speaking"
    : isLoading
    ? "thinking"
    : isListening
    ? "listening"
    : "awake";

  // Clean status text under eyes
  const statusSubtitle = !isAwake
    ? 'Say "WakeUp Robodoc" to start'
    : isLoading
    ? "Thinking..."
    : isTTSPlaying
    ? "Speaking..."
    : input
    ? `"${input}"`
    : messages.length > 0 && messages[messages.length - 1].role === "assistant"
    ? messages[messages.length - 1].content
    : "Listening...";

  return (
    <div className="flex-1 min-h-screen bg-[#070709] flex flex-col items-center justify-center relative overflow-hidden select-none">
      
      {/* Background ambient neon gray glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(226,232,240,0.06)_0%,rgba(7,7,9,1)_70%)] pointer-events-none z-0" />
      
      {/* Emergency First Aid Video Modal */}
      {emergencyVideoUrl && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(226,232,240,0.3)]">
          <div className="flex justify-end p-4 bg-neutral-900 border-b border-slate-700">
            <button 
              onClick={() => { setEmergencyVideoUrl(""); window.location.reload(); }} 
              className="bg-slate-800 text-slate-200 hover:bg-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
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

      {/* Invisible background camera for Open Palm tracking */}
      <video 
        ref={backgroundVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute opacity-0 w-[1px] h-[1px] pointer-events-none"
      />

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
            
            <div className="relative w-full max-w-lg mx-auto aspect-video rounded-3xl border-2 border-slate-400 overflow-hidden shadow-[0_0_35px_rgba(226,232,240,0.3)]">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-6">
                <p className="text-white font-medium text-lg flex items-center gap-2 drop-shadow-md">
                  <ThumbsUp className="w-6 h-6 text-slate-300 animate-pulse" /> 
                  Show Thumbs Up to capture
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Screen: Only Cute Eyes and Sleek Neon Gray Aesthetic */}
      <div className="w-full h-full min-h-[calc(100vh-2rem)] flex flex-col justify-between items-center relative z-10 py-8 px-4 sm:px-8">
        
        {/* Minimalist Header */}
        <div className="w-full flex justify-between items-center z-20 max-w-4xl">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-[0_0_15px_rgba(226,232,240,0.5)]">
              ROBODOC
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${isAwake ? 'bg-slate-200 shadow-[0_0_10px_#fff] animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
              {isAwake ? "Online" : "Standby"}
            </span>
          </div>
        </div>

        {/* Centerpiece: Cute Neon Eyes */}
        <div className="flex-1 flex flex-col items-center justify-center my-auto w-full max-w-2xl">
          <CuteNeonEyes 
            state={eyeState}
            onClick={wakeUpRobodoc}
            statusText={statusSubtitle}
          />
        </div>

        {/* Bottom indicator */}
        <div className="text-center pb-2">
          <p className="text-xs tracking-widest text-slate-500 uppercase">
            {!isAwake 
              ? 'Listening for "WakeUp Robodoc"' 
              : 'Say "Health Manager" to set alarms • "Go to sleep" to rest'}
          </p>
        </div>

      </div>
    </div>
  );
}