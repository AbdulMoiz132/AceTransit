"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Mic, MicOff, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { analyzeVoiceIntent, clearChatSession } from "@/app/actions/gemini";
import { useBookingStore } from "@/store/bookingStore";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type QuestionStep =
  | "idle"
  | "ask-name"
  | "ask-phone"
  | "ask-pickup-city"
  | "ask-pickup-address"
  | "ask-receiver-name"
  | "ask-receiver-phone"
  | "ask-delivery-city"
  | "ask-delivery-address"
  | "ask-package-type"
  | "ask-weight"
  | "ask-delivery-speed"
  | "ask-pickup-time"
  | "confirm"
  | "complete";

type GeminiMessage = {
  role: "user" | "model";
  parts: string;
};

export default function TracyVoiceAssistant() {
  const router = useRouter();
  const pathname = usePathname();
  
  const {
    formData,
    updateFormData,
    setDeliveryFee,
    setAutoMode,
    resetBooking,
  } = useBookingStore();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("Click mic to start");
  const [micLevel, setMicLevel] = useState(0);
  const [questionStep, setQuestionStep] = useState<QuestionStep>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>([]);
  const conversationHistoryRef = useRef<GeminiMessage[]>([]);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasOfferedBookingHelp = useRef(false);
  const sessionId = useRef<string>(`session-${Date.now()}`);

  useEffect(() => {
    conversationHistoryRef.current = conversationHistory;
  }, [conversationHistory]);

  useEffect(() => {
    console.log("🔄 Question step changed to:", questionStep);
  }, [questionStep]);

  useEffect(() => {
    const voiceEnabled = localStorage.getItem("voice_enabled") === "true";
    if (voiceEnabled) startListening();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const voiceEnabled = localStorage.getItem("voice_enabled") === "true";

    if (
      pathname === "/booking" &&
      voiceEnabled &&
      questionStep === "idle" &&
      !hasOfferedBookingHelp.current
    ) {
      hasOfferedBookingHelp.current = true;

      setTimeout(() => {
        const question = "I can help you fill this booking form! What's your name?";
        speak(question);
        setFeedback("💡 Voice booking active - tell me your name");
        
        setQuestionStep("ask-name");
        setAutoMode(true);
        
        setConversationHistory([{ role: "model", parts: question }]);
      }, 2000);
    }
  }, [pathname, questionStep]);

  const startListening = async () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback("❌ Speech recognition not supported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startAudioMonitoring(stream);
      shouldListenRef.current = true;

      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          if (questionStep === "idle") {
            setFeedback("🎤 Listening... Say 'Hey Tracy'");
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (shouldListenRef.current && !isProcessing) {
            setTimeout(() => {
              if (shouldListenRef.current) {
                try {
                  recognition.start();
                } catch (e) {}
              }
            }, 300);
          }
        };

        recognition.onresult = (event: any) => {
          let final = "";
          let interim = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const text = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += text;
            } else {
              interim += text;
            }
          }

          if (interim) setTranscript(interim);

          if (final) {
            setTranscript(final);
            console.log("📝 Final transcript:", final);
            
            if (isProcessing) {
              console.log("⏳ Already processing, ignoring this input");
              return;
            }
            
            processWithLLM(final);
            setTimeout(() => setTranscript(""), 3000);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("❌ Recognition error:", event.error);
          if (event.error === "not-allowed") {
            shouldListenRef.current = false;
            setIsListening(false);
            setFeedback("❌ Microphone access denied");
          }
        };

        recognitionRef.current = recognition;
      }

      recognitionRef.current.start();
      localStorage.setItem("voice_enabled", "true");
    } catch (err) {
      console.error("❌ Mic error:", err);
      setFeedback("❌ Microphone access denied");
    }
  };

  const stopListening = () => {
    shouldListenRef.current = false;
    if (recognitionRef.current) recognitionRef.current.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    setIsListening(false);
    setQuestionStep("idle");
    setAutoMode(false);
    
    clearChatSession(sessionId.current);
    setConversationHistory([]);
    
    localStorage.setItem("voice_enabled", "false");
  };

  // CLIENT-SIDE EXTRACTION - Runs FIRST before calling AI
  const extractDataClientSide = (text: string, step: QuestionStep): { extracted: boolean; data?: any; response?: string; nextStep?: QuestionStep } => {
    const lower = text.toLowerCase();
    
    console.log("🔍 Client-side extraction:", step, text);
    
    switch (step) {
      case "ask-name": {
        // Remove filler words
        const cleanText = text
          .replace(/\b(my|name|is|i'm|i am|call me|it's|this is|me|here)\b/gi, "")
          .trim();
        
        // Check if it looks like a name (1-3 words, letters only)
        const words = cleanText.split(/\s+/).filter(w => w.length > 0);
        const isName = words.length >= 1 && words.length <= 3 && /^[a-zA-Z\s]+$/.test(cleanText);
        
        if (isName && cleanText.length >= 2) {
          const name = cleanText
            .split(" ")
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          
          console.log("✅ CLIENT EXTRACTED NAME:", name);
          return {
            extracted: true,
            data: { senderName: name },
            response: `Nice to meet you, ${name}! What's your phone number?`,
            nextStep: "ask-phone"
          };
        }
        break;
      }
      
      case "ask-phone": {
        const phone = text.replace(/\D/g, "");
        if (phone.length >= 10) {
          console.log("✅ CLIENT EXTRACTED PHONE:", phone);
          return {
            extracted: true,
            data: { senderPhone: phone },
            response: "Got it! Which city should we pick up from?",
            nextStep: "ask-pickup-city"
          };
        }
        break;
      }
      
      case "ask-pickup-city": {
        const cities = ["karachi", "lahore", "islamabad", "rawalpindi", "faisalabad", "multan", "peshawar", "quetta"];
        const city = cities.find(c => lower.includes(c));
        if (city) {
          const cityName = city.charAt(0).toUpperCase() + city.slice(1);
          console.log("✅ CLIENT EXTRACTED CITY:", cityName);
          return {
            extracted: true,
            data: { pickupCity: cityName },
            response: `${cityName}! What's the pickup address?`,
            nextStep: "ask-pickup-address"
          };
        }
        break;
      }
      
      case "ask-pickup-address": {
        if (text.length >= 3) {
          console.log("✅ CLIENT EXTRACTED PICKUP ADDRESS:", text);
          return {
            extracted: true,
            data: { pickupAddress: text },
            response: "Perfect! Who is receiving this package?",
            nextStep: "ask-receiver-name"
          };
        }
        break;
      }
      
      case "ask-receiver-name": {
        const cleanText = text.replace(/\b(name|is|called|receiver)\b/gi, "").trim();
        if (cleanText.length >= 2 && /^[a-zA-Z\s]+$/.test(cleanText)) {
          const name = cleanText
            .split(" ")
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          console.log("✅ CLIENT EXTRACTED RECEIVER NAME:", name);
          return {
            extracted: true,
            data: { receiverName: name },
            response: `Got it! What's ${name}'s phone number?`,
            nextStep: "ask-receiver-phone"
          };
        }
        break;
      }
      
      case "ask-receiver-phone": {
        const phone = text.replace(/\D/g, "");
        if (phone.length >= 10) {
          console.log("✅ CLIENT EXTRACTED RECEIVER PHONE:", phone);
          return {
            extracted: true,
            data: { receiverPhone: phone },
            response: "Perfect! Which city should we deliver to?",
            nextStep: "ask-delivery-city"
          };
        }
        break;
      }
      
      case "ask-delivery-city": {
        const cities = ["karachi", "lahore", "islamabad", "rawalpindi", "faisalabad", "multan", "peshawar", "quetta"];
        const city = cities.find(c => lower.includes(c));
        if (city) {
          const cityName = city.charAt(0).toUpperCase() + city.slice(1);
          console.log("✅ CLIENT EXTRACTED DELIVERY CITY:", cityName);
          return {
            extracted: true,
            data: { dropoffCity: cityName },
            response: `${cityName}! What's the delivery address?`,
            nextStep: "ask-delivery-address"
          };
        }
        break;
      }
      
      case "ask-delivery-address": {
        if (text.length >= 3) {
          console.log("✅ CLIENT EXTRACTED DELIVERY ADDRESS:", text);
          return {
            extracted: true,
            data: { dropoffAddress: text },
            response: "Excellent! What type of package? Document, parcel, fragile, electronics, or food?",
            nextStep: "ask-package-type"
          };
        }
        break;
      }
      
      case "ask-package-type": {
        let packageType = "parcel";
        if (lower.includes("document") || lower.includes("doc")) packageType = "document";
        else if (lower.includes("fragile")) packageType = "fragile";
        else if (lower.includes("electron")) packageType = "electronics";
        else if (lower.includes("food")) packageType = "food";
        
        console.log("✅ CLIENT EXTRACTED PACKAGE TYPE:", packageType);
        return {
          extracted: true,
          data: { packageType },
          response: `${packageType} noted! What's the weight in kilograms?`,
          nextStep: "ask-weight"
        };
      }
      
      case "ask-weight": {
        const weight = text.match(/(\d+(?:\.\d+)?)/);
        if (weight) {
          console.log("✅ CLIENT EXTRACTED WEIGHT:", weight[1]);
          return {
            extracted: true,
            data: { weight: weight[1] },
            response: `${weight[1]} kg perfect! What delivery speed? Standard, express, or fast-track?`,
            nextStep: "ask-delivery-speed"
          };
        }
        break;
      }
      
      case "ask-delivery-speed": {
        let speed = "standard";
        if (lower.includes("fast") || lower.includes("urgent")) speed = "fast-track";
        else if (lower.includes("express") || lower.includes("quick")) speed = "express";
        
        console.log("✅ CLIENT EXTRACTED SPEED:", speed);
        return {
          extracted: true,
          data: { deliverySpeed: speed },
          response: `${speed} delivery! When should we pick up? Today, tomorrow, or a specific time?`,
          nextStep: "ask-pickup-time"
        };
      }
      
      case "ask-pickup-time": {
        let pickupDate = "";
        let pickupTime = "";
        
        if (lower.includes("tomorrow")) pickupDate = "tomorrow";
        else if (lower.includes("today")) pickupDate = "today";
        
        const timeMatch = text.match(/(\d{1,2})\s*(am|pm)?/i);
        if (timeMatch) {
          let hour = parseInt(timeMatch[1]);
          if (timeMatch[2]?.toLowerCase() === "pm" && hour < 12) hour += 12;
          pickupTime = `${hour.toString().padStart(2, "0")}:00`;
        }
        
        console.log("✅ CLIENT EXTRACTED PICKUP TIME:", pickupDate, pickupTime);
        return {
          extracted: true,
          data: { pickupDate, pickupTime },
          response: "Got it! Let me confirm all your booking details...",
          nextStep: "confirm"
        };
      }
    }
    
    return { extracted: false };
  };

  const processWithLLM = async (text: string) => {
    setIsProcessing(true);

    console.log("🧠 User said:", text);
    console.log("📍 Current step:", questionStep);
    
    // TRY CLIENT-SIDE EXTRACTION FIRST for booking steps
    if (questionStep !== "idle" && questionStep !== "confirm" && questionStep !== "complete") {
      const clientResult = extractDataClientSide(text, questionStep);
      
      if (clientResult.extracted) {
        console.log("🎯 CLIENT-SIDE EXTRACTION SUCCESSFUL!");
        
        // Update form data
        if (clientResult.data) {
          updateFormData(clientResult.data);
        }
        
        // Update conversation history
        const newHistory: GeminiMessage[] = [
          ...conversationHistoryRef.current,
          { role: "user", parts: text },
          { role: "model", parts: clientResult.response! },
        ];
        setConversationHistory(newHistory);
        
        // Move to next step
        if (clientResult.nextStep) {
          setQuestionStep(clientResult.nextStep);
          
          if (clientResult.nextStep === "confirm") {
            setTimeout(() => speakConfirmation(), 1500);
          }
        }
        
        // Speak response
        speak(clientResult.response!);
        setFeedback(`💬 ${clientResult.response!}`);
        
        setIsProcessing(false);
        return; // Skip AI call
      }
    }
    
    // If client-side extraction failed, use AI
    console.log("🤖 Using AI for extraction...");
    
    const currentHistory = [...conversationHistoryRef.current];
    
    console.log("📚 Conversation history (Gemini format):");
    currentHistory.forEach((msg, idx) => {
      console.log(`  ${idx + 1}. ${msg.role}: ${msg.parts}`);
    });
    console.log("📦 Current form data:", formData);
    setFeedback("🧠 Thinking...");

    try {
      const result = await analyzeVoiceIntent(text, {
        currentStep: questionStep,
        conversationHistory: currentHistory,
        formData: formData,
        currentPage: pathname,
        sessionId: sessionId.current,
      });

      console.log("🎯 Tracy understood:", result);

      const newHistory: GeminiMessage[] = [
        ...currentHistory,
        { role: "user", parts: text },
        { role: "model", parts: result.response },
      ];
      
      setConversationHistory(newHistory);

      speak(result.response);
      setFeedback(`💬 ${result.response}`);

      await handleIntent(result);

    } catch (error) {
      console.error("❌ Error:", error);
      const fallbackMsg = "Sorry, I didn't catch that. Could you say it again?";
      speak(fallbackMsg);
      setFeedback(`💬 ${fallbackMsg}`);
      
      const newHistory: GeminiMessage[] = [
        ...currentHistory,
        { role: "user", parts: text },
        { role: "model", parts: fallbackMsg },
      ];
      setConversationHistory(newHistory);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIntent = async (result: any) => {
    const { intent, action } = result;

    console.log("📍 Processing intent:", intent);
    console.log("🎬 Action:", action);

    switch (intent) {
      case "navigate":
        if (action.navigateTo) {
          handleNavigation(action.navigateTo);
        }
        break;

      case "booking_start":
        console.log("🎬 Starting booking flow");
        
        if (action.extractedData) {
          const cleanedData: any = {};
          Object.keys(action.extractedData).forEach((key) => {
            if (action.extractedData[key] !== null && action.extractedData[key] !== undefined) {
              cleanedData[key] = action.extractedData[key];
            }
          });

          if (Object.keys(cleanedData).length > 0) {
            console.log("📝 Starting with initial data:", cleanedData);
            updateFormData(cleanedData);
          }
        }
        
        let nextStep: QuestionStep = "ask-name";
        if (action.nextStep) {
          nextStep = action.nextStep as QuestionStep;
        }
        
        console.log("🎯 Setting question step to:", nextStep);
        setQuestionStep(nextStep);
        setAutoMode(true);
        console.log("✅ Question step should now be:", nextStep);
        
        if (action.navigateTo === "/booking" && pathname !== "/booking") {
          setTimeout(() => router.push("/booking"), 1000);
        }
        break;

      case "booking_collect":
        if (action.extractedData) {
          const cleanedData: any = {};
          Object.keys(action.extractedData).forEach((key) => {
            if (action.extractedData[key] !== null) {
              cleanedData[key] = action.extractedData[key];
            }
          });

          if (Object.keys(cleanedData).length > 0) {
            console.log("📝 Updating form data:", cleanedData);
            updateFormData(cleanedData);
          }
        }

        if (action.nextStep) {
          console.log("➡️ Moving to step:", action.nextStep);
          setQuestionStep(action.nextStep);

          if (action.nextStep === "confirm") {
            setTimeout(() => speakConfirmation(), 1500);
          }

          if (action.nextStep === "complete") {
            setTimeout(() => {
              setQuestionStep("idle");
              setAutoMode(false);
              clearChatSession(sessionId.current);
              setConversationHistory([]);
            }, 2000);
          }
        }

        if (action.type === "reset") {
          resetBooking();
          setQuestionStep("idle");
          setAutoMode(false);
          clearChatSession(sessionId.current);
          setConversationHistory([]);
        }

        if (action.type === "confirm") {
          setTimeout(() => {
            localStorage.setItem("bookingData", JSON.stringify({ formData }));
            router.push("/payment");
            setQuestionStep("idle");
            setAutoMode(false);
            clearChatSession(sessionId.current);
            setConversationHistory([]);
          }, 1500);
        }
        break;

      case "confirm_booking":
        if (action.type === "calculate_cost") {
          setQuestionStep("confirm");
        }
        break;

      case "provide_info":
      case "general_chat":
        break;
    }
  };

  const speakConfirmation = () => {
    const summary = `Let me confirm your booking: Sender ${formData.senderName || "not provided"}, phone ${formData.senderPhone || "not provided"}, pickup from ${formData.pickupCity || "city"}, ${formData.pickupAddress || "address"}. Receiver ${formData.receiverName || "not provided"}, phone ${formData.receiverPhone || "not provided"}, delivery to ${formData.dropoffCity || "city"}, ${formData.dropoffAddress || "address"}. Package type ${formData.packageType || "parcel"}, weight ${formData.weight || "not specified"} kg, ${formData.deliverySpeed || "standard"} delivery. Is everything correct? Say yes to confirm or no to make changes.`;
    
    speak(summary);
    setFeedback("✅ Confirming booking - say 'yes' or 'no'");
  };

  const handleNavigation = (route: string) => {
    console.log("🧭 Navigating to:", route);

    const routeNames: Record<string, string> = {
      "/": "dashboard",
      "/booking": "booking page",
      "/tracking": "tracking page",
      "/payment": "payment page",
      "/profile": "profile page",
      "/history": "history page",
    };

    const pageName = routeNames[route] || "page";
    
    if (route === "/booking") {
      const message = "Opening booking page. What's your name?";
      speak(message);
      setFeedback(`📍 ${message}`);
      
      setTimeout(() => {
        setQuestionStep("ask-name");
        setAutoMode(true);
        setConversationHistory([{ role: "model", parts: message }]);
      }, 1500);
    } else {
      speak(`Opening ${pageName}`);
      setFeedback(`📍 Opening ${pageName}...`);
    }

    setTimeout(() => {
      router.push(route);
    }, 1000);
  };

  const startAudioMonitoring = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 256;
      microphone.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkLevel = () => {
        if (!shouldListenRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMicLevel(Math.min(100, avg * 2));
        requestAnimationFrame(checkLevel);
      };
      checkLevel();
    } catch (e) {
      console.error("❌ Audio monitoring error:", e);
    }
  };

  const speak = (text: string) => {
    console.log("🔊 Speaking:", text);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const getStatusColor = () => {
    if (isProcessing) return "text-blue-500";
    if (questionStep !== "idle") return "text-orange-500";
    return "text-green-500";
  };

  const getStatusText = () => {
    if (isProcessing) return "🧠 PROCESSING";
    if (questionStep === "confirm") return "✅ CONFIRMING";
    if (questionStep !== "idle") return "📋 BOOKING";
    if (isListening) return "● LIVE";
    return "";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {(isListening || transcript || questionStep !== "idle") && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-2xl p-5 max-w-md border-2 border-purple-300 pointer-events-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Tracy AI
            </h3>
            <span className={`text-xs font-bold ${getStatusColor()} animate-pulse`}>
              {getStatusText()}
            </span>
          </div>

          {isListening && (
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all"
                style={{ width: `${micLevel}%` }}
              />
            </div>
          )}

          <div className="bg-white rounded-lg p-3 mb-2 min-h-[60px] border border-purple-200">
            <p className="text-gray-800 font-medium text-sm">
              {transcript || (
                <span className="text-gray-400 italic">
                  {questionStep !== "idle" ? "Speak your answer..." : "Say 'Hey Tracy'"}
                </span>
              )}
            </p>
          </div>

          <p className="text-xs text-purple-700 font-semibold mb-2">
            {feedback}
          </p>

          {questionStep !== "idle" ? (
            <div className="mt-2 text-xs bg-purple-100 rounded-lg p-2">
              <p className="font-bold text-purple-900 mb-1">📋 Booking in Progress</p>
              <p className="text-purple-700">Step: {questionStep.replace("ask-", "").replace("-", " ")}</p>
              {questionStep === "confirm" && (
                <div className="mt-2 flex gap-2">
                  <div className="flex items-center gap-1 text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>Say "yes"</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-700">
                    <XCircle className="w-3 h-3" />
                    <span>Say "no"</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2 text-xs bg-blue-50 rounded-lg p-2">
              <p className="font-bold text-blue-900 mb-1">💡 Try saying:</p>
              <ul className="text-blue-700 space-y-0.5">
                <li>• "Start booking"</li>
                <li>• "Go to tracking"</li>
                <li>• "How much does delivery cost?"</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="pointer-events-auto">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`rounded-full w-16 h-16 shadow-2xl transition-all hover:scale-110 flex items-center justify-center ${
            isListening
              ? "bg-gradient-to-r from-red-500 to-pink-600 ring-4 ring-red-200"
              : "bg-gradient-to-r from-purple-600 to-blue-600"
          }`}
        >
          {isListening ? (
            <Mic className="w-7 h-7 text-white animate-pulse" />
          ) : (
            <MicOff className="w-7 h-7 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}