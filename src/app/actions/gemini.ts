"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Store chat sessions per user (in production, use Redis or database)
const chatSessions = new Map<string, any>();

export async function analyzeVoiceIntent(
  userText: string,
  context: {
    currentStep: string;
    conversationHistory: { role: "user" | "model"; parts: string }[]; // Gemini format
    formData: any;
    currentPage: string;
    sessionId?: string; // Unique session ID for this conversation
  }
) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200,
        responseMimeType: "application/json",
      },
    });

    const sessionId = context.sessionId || "default";
    const isInBookingFlow = context.currentStep !== "idle";

    // System instruction that defines Tracy's behavior
    const systemInstruction = `You are Tracy, a smart and friendly AI voice assistant for a Pakistani courier/delivery service.

**YOUR PERSONALITY:**
- Warm, helpful, and conversational in English
- NEVER say "I don't understand" - always respond helpfully
- Guide users naturally through their goals
- Understand context and intent from natural speech
- Always confident and professional (0.9+ confidence)

**CURRENT CONTEXT:**
- Current Page: ${context.currentPage}
- Current Step: ${context.currentStep}
- Form Data: ${JSON.stringify(context.formData)}
${isInBookingFlow ? "\n**🎯 BOOKING INTERVIEW MODE ACTIVE**\nYou're helping the user fill a booking form step-by-step." : ""}

**🔥 CRITICAL CONTEXT RULE:**
You have conversation history. Check what YOU (Tracy) said last!
If your last message was a QUESTION, the user's response is ANSWERING that question.

**CRITICAL: SINGLE-WORD RESPONSES:**
If you ask a question and user gives ONE WORD, that IS the answer!
- You: "What's your name?" + User: "Shyam" = Extract "Shyam" as NAME ✅
- You: "Which city?" + User: "Karachi" = Extract "Karachi" as CITY ✅
- You: "What's the weight?" + User: "5" = Extract "5" as WEIGHT ✅

DO NOT treat single-word responses as "general_chat" - they are answers!

**YOUR CAPABILITIES:**
1. **SMART ROUTING** - Navigate: /booking, /tracking, /, /profile, /payment, /history
2. **CONVERSATIONAL BOOKING** - Extract data naturally from ANY speech pattern
3. **GENERAL CONVERSATION** - Answer any question helpfully
4. **SMART DATA EXTRACTION** - From natural speech, including multi-field at once

**RESPONSE JSON FORMAT:**
{
  "intent": "navigate|booking_start|booking_collect|provide_info|general_chat|confirm_booking",
  "action": {
    "type": "navigate|start_booking|extract_data|calculate_cost|confirm|reset|none",
    "navigateTo": "/booking | /tracking | / | /profile | /payment | /history",
    "extractedData": {
      "senderName": null, "senderPhone": null, "pickupCity": null, "pickupAddress": null,
      "receiverName": null, "receiverPhone": null, "dropoffCity": null, "dropoffAddress": null,
      "packageType": null, "weight": null, "deliverySpeed": null, "pickupDate": null, "pickupTime": null
    },
    "nextStep": "ask-name|ask-phone|ask-pickup-city|ask-pickup-address|ask-receiver-name|ask-receiver-phone|ask-delivery-city|ask-delivery-address|ask-package-type|ask-weight|ask-delivery-speed|ask-pickup-time|confirm|complete"
  },
  "response": "Natural friendly response in English",
  "confidence": 0.95
}

**STEP-BY-STEP EXAMPLES:**

**When currentStep = "ask-name":**
User: "Shyam" OR "my name is Shyam" OR "it's Shyam"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"senderName": "Shyam"}, "nextStep": "ask-phone"}, "response": "Nice to meet you, Shyam! What's your phone number?", "confidence": 0.95}

**When currentStep = "ask-phone":**
User: "0300-1234567"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"senderPhone": "03001234567"}, "nextStep": "ask-pickup-city"}, "response": "Got it! Which city should we pick up from?", "confidence": 0.95}

**When currentStep = "ask-pickup-city":**
User: "Rawalpindi" OR "pickup from Rawalpindi"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"pickupCity": "Rawalpindi"}, "nextStep": "ask-pickup-address"}, "response": "Rawalpindi! What's the pickup address?", "confidence": 0.95}

**When currentStep = "ask-pickup-address":**
User: "Satellite Town"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"pickupAddress": "Satellite Town"}, "nextStep": "ask-receiver-name"}, "response": "Perfect! Who is receiving this package?", "confidence": 0.95}

**When currentStep = "ask-receiver-name":**
User: "Ali"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"receiverName": "Ali"}, "nextStep": "ask-receiver-phone"}, "response": "Got it! What's Ali's phone number?", "confidence": 0.95}

**When currentStep = "ask-receiver-phone":**
User: "03111111111"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"receiverPhone": "03111111111"}, "nextStep": "ask-delivery-city"}, "response": "Perfect! Which city should we deliver to?", "confidence": 0.95}

**When currentStep = "ask-delivery-city":**
User: "Karachi"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"dropoffCity": "Karachi"}, "nextStep": "ask-delivery-address"}, "response": "Karachi! What's the delivery address?", "confidence": 0.95}

**When currentStep = "ask-delivery-address":**
User: "Clifton Block 5"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"dropoffAddress": "Clifton Block 5"}, "nextStep": "ask-package-type"}, "response": "Excellent! What type of package? Document, parcel, fragile, electronics, or food?", "confidence": 0.95}

**When currentStep = "ask-package-type":**
User: "parcel"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"packageType": "parcel"}, "nextStep": "ask-weight"}, "response": "Parcel noted! What's the weight in kilograms?", "confidence": 0.95}

**When currentStep = "ask-weight":**
User: "5" OR "5 kilos"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"weight": "5"}, "nextStep": "ask-delivery-speed"}, "response": "5 kg perfect! What delivery speed? Standard, express, or fast-track?", "confidence": 0.95}

**When currentStep = "ask-delivery-speed":**
User: "express"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"deliverySpeed": "express"}, "nextStep": "ask-pickup-time"}, "response": "Express delivery selected! When should we pick up? Today, tomorrow, or a specific time?", "confidence": 0.95}

**When currentStep = "ask-pickup-time":**
User: "tomorrow" OR "tomorrow at 2pm"
→ {"intent": "booking_collect", "action": {"type": "extract_data", "extractedData": {"pickupDate": "tomorrow", "pickupTime": "14:00"}, "nextStep": "confirm"}, "response": "Tomorrow at 2pm - noted! Let me confirm all your booking details...", "confidence": 0.95}

**When currentStep = "confirm":**
User: "yes" OR "correct" OR "confirm"
→ {"intent": "booking_collect", "action": {"type": "confirm", "nextStep": "complete"}, "response": "Perfect! Your booking is confirmed. You'll receive a confirmation SMS shortly.", "confidence": 0.95}

User: "no" OR "change"
→ {"intent": "booking_collect", "action": {"type": "none"}, "response": "No problem! What would you like to change?", "confidence": 0.95}

**When currentStep = "idle" and on /booking page:**
User: "my name is Shyam"
→ {"intent": "booking_start", "action": {"type": "start_booking", "extractedData": {"senderName": "Shyam"}, "nextStep": "ask-phone"}, "response": "Great! I'll help you book, Shyam. What's your phone number?", "confidence": 0.95}

**Navigation:**
User: "go to tracking" / "track my package"
→ {"intent": "navigate", "action": {"type": "navigate", "navigateTo": "/tracking"}, "response": "Opening tracking page!", "confidence": 0.95}

User: "go to dashboard" / "home"
→ {"intent": "navigate", "action": {"type": "navigate", "navigateTo": "/"}, "response": "Going to dashboard!", "confidence": 0.95}

**CRITICAL RULES:**
1. NEVER say "I don't understand"
2. ALWAYS respond in clear English
3. Single-word responses after questions ARE valid answers
4. Check conversation history to understand context
5. High confidence (0.9+) always
6. Extract data from ANY natural speech pattern

RESPOND NOW:`;

    // Get or create chat session
    let chat;
    if (chatSessions.has(sessionId) && context.conversationHistory.length > 0) {
      // Restore existing session
      chat = chatSessions.get(sessionId);
    } else {
      // Create new chat session with history
      chat = model.startChat({
        history: context.conversationHistory,
        systemInstruction: systemInstruction,
      });
      chatSessions.set(sessionId, chat);
    }

    // Send user message
    const result = await chat.sendMessage(userText);
    const response = await result.response;
    const text = response.text();

    console.log("📥 Gemini Response:", text);

    const parsed = JSON.parse(text);

    return {
      intent: parsed.intent || "general_chat",
      action: parsed.action || { type: "none" },
      response: parsed.response || "Something went wrong. Could you say that again?",
      confidence: parsed.confidence || 0.9,
      needsMoreInfo: parsed.needsMoreInfo || false,
    };
  } catch (error) {
    console.error("❌ Gemini Error:", error);
    return getSmartFallback(userText, context);
  }
}

// Clear chat session (call when booking completes or user wants to start fresh)
export async function clearChatSession(sessionId: string = "default") {
  chatSessions.delete(sessionId);
  console.log("🗑️ Cleared chat session:", sessionId);
}

function getSmartFallback(userText: string, context: any) {
  const lower = userText.toLowerCase();

  console.log("🔧 Smart fallback activated");
  console.log("🔧 Current step:", context.currentStep);
  console.log("🔧 Current page:", context.currentPage);

  // Special case: On booking page but idle - auto-start booking
  if (context.currentPage === "/booking" && context.currentStep === "idle") {
    console.log("🎯 User on booking page - checking if they're providing booking info");
    
    const namePatterns = /\b(my name is|i'm|i am|call me|this is|it's)\s+([a-z]+)/i;
    const nameMatch = userText.match(namePatterns);
    
    if (nameMatch || (userText.split(" ").length <= 3 && userText.length >= 3 && !lower.includes("book"))) {
      const name = nameMatch ? nameMatch[2] : userText
        .replace(/\b(my|name|is|i'm|call me|it's|this is)\b/gi, "")
        .trim();
        
      if (name.length >= 2 && /^[a-zA-Z\s]+$/.test(name)) {
        const cleanName = name
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
          
        return {
          intent: "booking_start",
          action: {
            type: "start_booking",
            extractedData: { senderName: cleanName },
            nextStep: "ask-phone",
          },
          response: `Great! I'll help you book, ${cleanName}. What's your phone number?`,
          confidence: 0.9,
        };
      }
    }
  }

  // Greetings
  if (lower.match(/\b(hey|hi|hello|tracy)\b/)) {
    return {
      intent: "general_chat",
      action: { type: "none" },
      response: "Hi! I'm Tracy, your courier assistant. How can I help you today?",
      confidence: 0.95,
    };
  }

  // Booking triggers
  if (lower.match(/\b(book|booking|parcel|package|delivery|courier|send|ship)\b/)) {
    return {
      intent: "booking_start",
      action: { type: "start_booking", navigateTo: "/booking", nextStep: "ask-name" },
      response: "Great! Let's book your delivery. What's your name?",
      confidence: 0.95,
    };
  }

  // Navigation
  if (lower.includes("track")) {
    return {
      intent: "navigate",
      action: { type: "navigate", navigateTo: "/tracking" },
      response: "Opening tracking page!",
      confidence: 0.95,
    };
  }
  if (lower.match(/\b(dashboard|home)\b/)) {
    return {
      intent: "navigate",
      action: { type: "navigate", navigateTo: "/" },
      response: "Going to dashboard!",
      confidence: 0.95,
    };
  }
  if (lower.match(/\b(profile|account)\b/)) {
    return {
      intent: "navigate",
      action: { type: "navigate", navigateTo: "/profile" },
      response: "Opening your profile!",
      confidence: 0.95,
    };
  }

  // Pricing info
  if (lower.match(/\b(cost|price|rate|charge|fee)\b/)) {
    return {
      intent: "provide_info",
      action: { type: "none" },
      response: "Rates depend on distance and speed. Documents start from PKR 150, parcels from PKR 250. Want to book?",
      confidence: 0.9,
    };
  }

  // DATA EXTRACTION when in booking flow
  if (context.currentStep !== "idle") {
    const extractedData: any = {};
    let nextStep = context.currentStep;
    let response = "";

    switch (context.currentStep) {
      case "ask-name":
        const nameText = userText
          .replace(/\b(my|name|is|i'm|call me|it's|this is|i am|me|here)\b/gi, "")
          .trim();
        
        const wordCount = nameText.split(/\s+/).filter(w => w.length > 0).length;
        const isLikelyName = wordCount <= 3 && nameText.length >= 2 && /^[a-zA-Z\s]+$/.test(nameText);
        
        if (isLikelyName) {
          const cleanName = nameText
            .split(" ")
            .filter(word => word.length > 0)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
            
          extractedData.senderName = cleanName;
          nextStep = "ask-phone";
          response = `Nice to meet you, ${cleanName}! What's your phone number?`;
          
          return {
            intent: "booking_collect",
            action: { type: "extract_data", extractedData, nextStep },
            response,
            confidence: 0.95,
          };
        }
        break;

      case "ask-phone":
        const phone = userText.replace(/\D/g, "");
        if (phone.length >= 10) {
          extractedData.senderPhone = phone;
          nextStep = "ask-pickup-city";
          response = "Got it! Which city should we pick up from?";
          return {
            intent: "booking_collect",
            action: { type: "extract_data", extractedData, nextStep },
            response,
            confidence: 0.95,
          };
        }
        break;

      case "ask-pickup-city":
        const cities = ["karachi", "lahore", "islamabad", "rawalpindi", "faisalabad", "multan", "peshawar", "quetta"];
        const city = cities.find((c) => lower.includes(c));
        if (city) {
          extractedData.pickupCity = city.charAt(0).toUpperCase() + city.slice(1);
          nextStep = "ask-pickup-address";
          response = `${extractedData.pickupCity}! What's the pickup address?`;
          return {
            intent: "booking_collect",
            action: { type: "extract_data", extractedData, nextStep },
            response,
            confidence: 0.95,
          };
        }
        break;

      case "ask-pickup-address":
        extractedData.pickupAddress = userText;
        nextStep = "ask-receiver-name";
        response = "Perfect! Who is receiving this package?";
        return {
          intent: "booking_collect",
          action: { type: "extract_data", extractedData, nextStep },
          response,
          confidence: 0.9,
        };

      case "ask-receiver-name":
        const receiverName = userText.replace(/\b(name|is|called|receiver)\b/gi, "").trim();
        if (receiverName.length >= 2) {
          extractedData.receiverName = receiverName
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          nextStep = "ask-receiver-phone";
          response = `Got it! What's ${extractedData.receiverName}'s phone number?`;
          return {
            intent: "booking_collect",
            action: { type: "extract_data", extractedData, nextStep },
            response,
            confidence: 0.95,
          };
        }
        break;

      case "ask-receiver-phone":
        const receiverPhone = userText.replace(/\D/g, "");
        if (receiverPhone.length >= 10) {
          extractedData.receiverPhone = receiverPhone;
          nextStep = "ask-delivery-city";
          response = "Perfect! Which city should we deliver to?";
          return {
            intent: "booking_collect",
            action: { type: "extract_data", extractedData, nextStep },
            response,
            confidence: 0.95,
          };
        }
        break;

      case "ask-delivery-city":
        const deliveryCities = ["karachi", "lahore", "islamabad", "rawalpindi", "faisalabad", "multan", "peshawar", "quetta"];
        const deliveryCity = deliveryCities.find((c) => lower.includes(c));
        if (deliveryCity) {
          extractedData.dropoffCity = deliveryCity.charAt(0).toUpperCase() + deliveryCity.slice(1);
          nextStep = "ask-delivery-address";
          response = `${extractedData.dropoffCity}! What's the delivery address?`;
          return {
            intent: "booking_collect",
            action: { type: "extract_data", extractedData, nextStep },
            response,
            confidence: 0.95,
          };
        }
        break;

      case "ask-delivery-address":
        extractedData.dropoffAddress = userText;
        nextStep = "ask-package-type";
        response = "Excellent! What type of package? Document, parcel, fragile, electronics, or food?";
        return {
          intent: "booking_collect",
          action: { type: "extract_data", extractedData, nextStep },
          response,
          confidence: 0.9,
        };

      case "ask-package-type":
        if (lower.includes("document") || lower.includes("doc")) extractedData.packageType = "document";
        else if (lower.includes("fragile")) extractedData.packageType = "fragile";
        else if (lower.includes("electron")) extractedData.packageType = "electronics";
        else if (lower.includes("food")) extractedData.packageType = "food";
        else extractedData.packageType = "parcel";
        nextStep = "ask-weight";
        response = `${extractedData.packageType} noted! What's the weight in kilograms?`;
        return {
          intent: "booking_collect",
          action: { type: "extract_data", extractedData, nextStep },
          response,
          confidence: 0.9,
        };

      case "ask-weight":
        const weight = userText.match(/(\d+(?:\.\d+)?)/);
        if (weight) {
          extractedData.weight = weight[1];
          nextStep = "ask-delivery-speed";
          response = `${weight[1]} kg perfect! What delivery speed? Standard, express, or fast-track?`;
          return {
            intent: "booking_collect",
            action: { type: "extract_data", extractedData, nextStep },
            response,
            confidence: 0.95,
          };
        }
        break;

      case "ask-delivery-speed":
        if (lower.includes("fast") || lower.includes("urgent")) extractedData.deliverySpeed = "fast-track";
        else if (lower.includes("express") || lower.includes("quick")) extractedData.deliverySpeed = "express";
        else extractedData.deliverySpeed = "standard";
        nextStep = "ask-pickup-time";
        response = `${extractedData.deliverySpeed} delivery! When should we pick up? Today, tomorrow, or a specific time?`;
        return {
          intent: "booking_collect",
          action: { type: "extract_data", extractedData, nextStep },
          response,
          confidence: 0.95,
        };

      case "ask-pickup-time":
        if (lower.includes("tomorrow")) extractedData.pickupDate = "tomorrow";
        else if (lower.includes("today")) extractedData.pickupDate = "today";
        
        const timeMatch = userText.match(/(\d{1,2})\s*(am|pm)?/i);
        if (timeMatch) {
          let hour = parseInt(timeMatch[1]);
          if (timeMatch[2]?.toLowerCase() === "pm" && hour < 12) hour += 12;
          extractedData.pickupTime = `${hour.toString().padStart(2, "0")}:00`;
        }
        
        nextStep = "confirm";
        response = "Got it! Let me confirm all your booking details...";
        return {
          intent: "booking_collect",
          action: { type: "extract_data", extractedData, nextStep },
          response,
          confidence: 0.9,
        };
    }
  }

  // Thank you
  if (lower.match(/\b(thanks|thank you|appreciate)\b/)) {
    return {
      intent: "general_chat",
      action: { type: "none" },
      response: "You're welcome! Anything else I can help with?",
      confidence: 0.95,
    };
  }

  // Default helpful response
  return {
    intent: "general_chat",
    action: { type: "none" },
    response: "I'm your courier assistant! I can help with bookings, tracking, or answer questions. What do you need?",
    confidence: 0.85,
  };
}