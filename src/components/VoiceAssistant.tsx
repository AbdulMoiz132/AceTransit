"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

type TracyScope = "global" | "booking" | "login" | "signup" | "payment";

type TracyAction =
	| "booking.next"
	| "booking.back"
	| "booking.detectLocation"
	| "booking.submit"
	| "payment.pay"
	| "login.submit"
	| "signup.submit";

type TracySetFieldDetail = {
	scope: TracyScope;
	field: string;
	value: string;
};

type TracyActionDetail = {
	scope: TracyScope;
	action: TracyAction;
};

type Intent =
	| { type: "navigate"; path: string }
	| { type: "startBooking" }
	| { type: "bookingAction"; action: TracyAction }
	| { type: "paymentAction"; action: TracyAction }
	| { type: "pageAction"; scope: "login" | "signup"; action: TracyAction }
	| { type: "setField"; scope: TracyScope; field: string; value: string }
	| { type: "stop" }
	| { type: "help" }
	| { type: "unknown" };

const OPTIONAL_PREFIX = "hey tracy";

const routeAliases: Array<{ match: RegExp; path: string }> = [
	{ match: /\b(login|sign in)\b/i, path: "/auth/login" },
	{ match: /\b(sign up|signup|register|create account)\b/i, path: "/auth/signup" },
	{ match: /\b(dashboard|home)\b/i, path: "/dashboard" },
	{ match: /\bbooking|book( a)? delivery|place( an)? order\b/i, path: "/booking" },
	{ match: /\btracking|track( my)? (order|delivery|package)\b/i, path: "/tracking" },
	{ match: /\bprofile\b/i, path: "/profile" },
	{ match: /\bpayment|checkout\b/i, path: "/payment" },
	{ match: /\bchat\b/i, path: "/chat" },
];

type BookingFlowField = {
	field: string;
	label: string;
	prompt: string;
	optional?: boolean;
};

const bookingFlowByStep: Record<number, BookingFlowField[]> = {
	1: [
		{ field: "senderName", label: "sender name", prompt: "Sender name?" },
		{ field: "senderPhone", label: "sender phone", prompt: "Sender phone number?" },
		{
			field: "pickupAddress",
			label: "pickup address",
			prompt: "Pickup address? You can also say: detect my location.",
		},
		{ field: "pickupCity", label: "pickup city", prompt: "Pickup city?" },
	],
	2: [
		{ field: "receiverName", label: "receiver name", prompt: "Receiver name?" },
		{ field: "receiverPhone", label: "receiver phone", prompt: "Receiver phone number?" },
		{ field: "dropoffAddress", label: "dropoff address", prompt: "Dropoff address?" },
		{ field: "dropoffCity", label: "dropoff city", prompt: "Dropoff city?" },
	],
	3: [
		{ field: "packageType", label: "package type", prompt: "Package type? For example: parcel, document, fragile, electronics, food." },
		{ field: "weight", label: "weight", prompt: "Package weight in kilograms? For example: 2." },
		{ field: "dimensions.length", label: "length", prompt: "Package length in centimeters? Say a number, or say skip.", optional: true },
		{ field: "dimensions.width", label: "width", prompt: "Package width in centimeters? Say a number, or say skip.", optional: true },
		{ field: "dimensions.height", label: "height", prompt: "Package height in centimeters? Say a number, or say skip.", optional: true },
	],
	4: [
		{ field: "deliverySpeed", label: "delivery speed", prompt: "Delivery speed? Say standard, express, or fast track." },
		{ field: "pickupDate", label: "pickup date", prompt: "Pickup date? Say today, tomorrow, or a date like 2025-12-23." },
		{ field: "pickupTime", label: "pickup time", prompt: "Pickup time? Say a time like 14:30." },
	],
};

function isAffirmative(text: string) {
	return /\b(yes|yeah|yep|correct|right|confirm|ok|okay)\b/i.test(text);
}

function isNegative(text: string) {
	return /\b(no|nope|wrong|incorrect|cancel)\b/i.test(text);
}

function isSkip(text: string) {
	return /\b(skip|leave it|not now|none)\b/i.test(text);
}

function isKeep(text: string) {
	return /\b(keep|leave|same)\b/i.test(text);
}

function isChange(text: string) {
	return /\b(change|update|replace|edit)\b/i.test(text);
}

function normalizeText(text: string) {
	return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseDateToISO(value: string): string | null {
	const v = value.trim().toLowerCase();
	if (!v) return null;

	const now = new Date();
	const toISO = (d: Date) => {
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, "0");
		const dd = String(d.getDate()).padStart(2, "0");
		return `${yyyy}-${mm}-${dd}`;
	};

	if (v === "today") return toISO(now);
	if (v === "tomorrow") {
		const d = new Date(now);
		d.setDate(d.getDate() + 1);
		return toISO(d);
	}

	const isoMatch = v.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
	if (isoMatch) return isoMatch[0];

	const slashMatch = v.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
	if (slashMatch) {
		const mm = String(Number(slashMatch[1])).padStart(2, "0");
		const dd = String(Number(slashMatch[2])).padStart(2, "0");
		const yyyy = slashMatch[3];
		return `${yyyy}-${mm}-${dd}`;
	}

	// Try common natural language dates, relying on Date.parse.
	// Examples: "23 december 2025", "december 23 2025", "23 december"
	const parsed = Date.parse(value);
	if (!Number.isNaN(parsed)) {
		const d = new Date(parsed);
		return toISO(d);
	}

	return null;
}

function parseTimeToHHMM(value: string): string | null {
	const v = value.trim().toLowerCase();
	if (!v) return null;

	// Support am/pm: "2 pm", "2:30pm"
	const ampm = v.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
	if (ampm) {
		let hh = Number(ampm[1]);
		const mm = Number(ampm[2] ?? "0");
		const ap = ampm[3];
		if (ap === "pm" && hh < 12) hh += 12;
		if (ap === "am" && hh === 12) hh = 0;
		const hhn = Math.max(0, Math.min(23, hh));
		const mmn = Math.max(0, Math.min(59, mm));
		return `${String(hhn).padStart(2, "0")}:${String(mmn).padStart(2, "0")}`;
	}

	const match = v.match(/\b(\d{1,2})(?::(\d{2}))\b/);
	if (!match) return null;
	const hh = Math.max(0, Math.min(23, Number(match[1])));
	const mm = Math.max(0, Math.min(59, Number(match[2])));
	return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function extractDigits(text: string) {
	return (text ?? "").replace(/\D+/g, "");
}

function extractNumber(text: string) {
	const m = (text ?? "").match(/(\d+(?:\.\d+)?)/);
	return m?.[1] ?? null;
}

function getTracyFieldElement(field: string): HTMLInputElement | HTMLSelectElement | null {
	if (typeof document === "undefined") return null;
	return document.querySelector(`[data-tracy-field="${field}"]`);
}

function setNativeValue(el: HTMLInputElement | HTMLSelectElement, value: string) {
	// React controlled inputs track value internally; use the native setter.
	const proto = el instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLSelectElement.prototype;
	const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
	if (descriptor?.set) descriptor.set.call(el, value);
	else (el as unknown as { value: string }).value = value;
}

function tryFillDomField(field: string, value: string) {
	const el = getTracyFieldElement(field);
	if (!el) return false;
	setNativeValue(el, value);
	el.dispatchEvent(new Event("input", { bubbles: true }));
	el.dispatchEvent(new Event("change", { bubbles: true }));
	return true;
}

function getFieldValueFromDom(field: string): string | null {
	const el = getTracyFieldElement(field);
	if (!el) return null;
	return (el as HTMLInputElement).value ?? "";
}

function isEmptyValue(value: string | null | undefined) {
	return !value || !value.trim();
}

function extractFieldValue(field: string, raw: string): string | null {
	const text = raw.trim();
	if (!text) return null;

	if (field === "senderPhone" || field === "receiverPhone") {
		const digits = extractDigits(text);
		return digits.length >= 7 ? digits : text;
	}
	if (field === "weight") {
		return extractNumber(text) ?? text;
	}

	if (field === "pickupDate") return parseDateToISO(text) ?? text;
	if (field === "pickupTime") return parseTimeToHHMM(text) ?? text;
	return text;
}

function parseIntent(rawText: string): Intent {
	const text = normalizeText(rawText);
	if (!text) return { type: "unknown" };

	if (/(^|\b)(stop|cancel|nevermind|never mind|quiet)\b/.test(text)) {
		return { type: "stop" };
	}

	if (/(^|\b)(help|what can you do|commands)\b/.test(text)) {
		return { type: "help" };
	}

	if (/\b(start booking|book a delivery|place an order|create a booking)\b/.test(text)) {
		return { type: "startBooking" };
	}

	// Booking actions
	if (/\b(next|continue)\b/.test(text)) {
		return { type: "bookingAction", action: "booking.next" };
	}
	if (/\b(back|previous|go back)\b/.test(text)) {
		return { type: "bookingAction", action: "booking.back" };
	}
	if (/\b(detect|use|get) (my )?(current )?location\b|\b(auto|current) location\b|\b(pickup )?location\b/.test(text)) {
		return { type: "bookingAction", action: "booking.detectLocation" };
	}
	if (/\b(submit|confirm booking|finish booking|proceed to payment)\b/.test(text)) {
		return { type: "bookingAction", action: "booking.submit" };
	}

	// Payment actions
	if (/\b(pay|pay now|confirm payment|make payment|complete payment)\b/.test(text)) {
		return { type: "paymentAction", action: "payment.pay" };
	}

	// Auth submit actions
	if (/\b(submit|sign in now|log in now|login now|sign up now|create account now)\b/.test(text)) {
		// Scope resolved later using current route.
		return { type: "unknown" };
	}

	// Direct navigation
	for (const r of routeAliases) {
		if (r.match.test(text)) return { type: "navigate", path: r.path };
	}
	const goMatch = text.match(/\b(go to|open|navigate to)\s+([a-z\-/ ]+)\b/);
	if (goMatch?.[2]) {
		const maybe = goMatch[2].trim();
		if (maybe.startsWith("/")) return { type: "navigate", path: maybe };
	}

	// Field sets (booking)
	const patterns: Array<{ re: RegExp; scope: TracyScope; field: string }> = [
		{ re: /\b(sender name)\s*(is)?\s*(.+)$/i, scope: "booking", field: "senderName" },
		{ re: /\b(sender phone|sender number)\s*(is)?\s*(.+)$/i, scope: "booking", field: "senderPhone" },
		{ re: /\b(pickup address)\s*(is)?\s*(.+)$/i, scope: "booking", field: "pickupAddress" },
		{ re: /\b(pickup city)\s*(is)?\s*(.+)$/i, scope: "booking", field: "pickupCity" },
		{ re: /\b(receiver name)\s*(is)?\s*(.+)$/i, scope: "booking", field: "receiverName" },
		{ re: /\b(receiver phone|receiver number)\s*(is)?\s*(.+)$/i, scope: "booking", field: "receiverPhone" },
		{ re: /\b(dropoff address|drop off address|delivery address)\s*(is)?\s*(.+)$/i, scope: "booking", field: "dropoffAddress" },
		{ re: /\b(dropoff city|drop off city|delivery city)\s*(is)?\s*(.+)$/i, scope: "booking", field: "dropoffCity" },
		{ re: /\b(weight)\s*(is)?\s*(.+)$/i, scope: "booking", field: "weight" },
		{ re: /\b(package type)\s*(is)?\s*(.+)$/i, scope: "booking", field: "packageType" },
		{ re: /\b(delivery speed|speed)\s*(is)?\s*(.+)$/i, scope: "booking", field: "deliverySpeed" },
		{ re: /\b(length)\s*(is)?\s*(.+)$/i, scope: "booking", field: "dimensions.length" },
		{ re: /\b(width)\s*(is)?\s*(.+)$/i, scope: "booking", field: "dimensions.width" },
		{ re: /\b(height)\s*(is)?\s*(.+)$/i, scope: "booking", field: "dimensions.height" },
		{ re: /\b(pickup date|pick up date)\s*(is)?\s*(.+)$/i, scope: "booking", field: "pickupDate" },
		{ re: /\b(pickup time|pick up time)\s*(is)?\s*(.+)$/i, scope: "booking", field: "pickupTime" },

		// Login
		{ re: /\b(email)\s*(is)?\s*(.+)$/i, scope: "login", field: "email" },
		{ re: /\b(password)\s*(is)?\s*(.+)$/i, scope: "login", field: "password" },

		// Signup
		{ re: /\b(name|full name)\s*(is)?\s*(.+)$/i, scope: "signup", field: "name" },
		{ re: /\b(signup email|sign up email|email)\s*(is)?\s*(.+)$/i, scope: "signup", field: "email" },
		{ re: /\b(signup password|sign up password|password)\s*(is)?\s*(.+)$/i, scope: "signup", field: "password" },
	];

	for (const p of patterns) {
		const m = rawText.match(p.re);
		if (m?.[3]) {
			return { type: "setField", scope: p.scope, field: p.field, value: m[3].trim() };
		}
	}

	return { type: "unknown" };
}

function pickFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
	if (!voices.length) return null;
	const preferred = [
		/female/i,
		/woman/i,
		/zira/i,
		/susan/i,
		/samantha/i,
		/victoria/i,
		/google uk english female/i,
	];
	for (const re of preferred) {
		const v = voices.find((vv) => re.test(vv.name));
		if (v) return v;
	}
	// Fall back to an English voice if possible.
	return voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ?? voices[0];
}

export default function VoiceAssistant() {
	const router = useRouter();
	const pathname = usePathname();

	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
	const listeningRef = useRef(false);
	const shouldBeListeningRef = useRef(false);
	const restartBackoffMsRef = useRef(250);
	const restartTimerRef = useRef<number | null>(null);
	const partialTimerRef = useRef<number | null>(null);
	const lastPartialRef = useRef<string>("");
	const isSpeakingRef = useRef(false);

	const [isListening, setIsListening] = useState(false);
	const [status, setStatus] = useState<"idle" | "listening" | "awake" | "speaking" | "error">("idle");
	const [lastHeard, setLastHeard] = useState<string>("");
	const [typed, setTyped] = useState<string>("");
	const [activeTask, setActiveTask] = useState<null | "booking">(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [hasMounted, setHasMounted] = useState(false);

	type BookingGuidedState = {
		enabled: boolean;
		step: number;
		index: number;
		awaiting: "none" | "keepOrChange" | "value" | "confirm" | "confirmDetectedLocation";
		field: string | null;
		label: string | null;
		candidate: string | null;
		prefilled: string | null;
		detected: { address: string; city: string } | null;
	};

	const bookingGuidedRef = useRef<BookingGuidedState>({
		enabled: false,
		step: 1,
		index: 0,
		awaiting: "none",
		field: null,
		label: null,
		candidate: null,
		prefilled: null,
		detected: null,
	});

	const speechRecognitionCtor = useMemo(() => {
		if (typeof window === "undefined") return null;
		return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
	}, []);

	const supported = useMemo(() => {
		if (!hasMounted) return false;
		return !!speechRecognitionCtor && typeof window !== "undefined" && "speechSynthesis" in window;
	}, [speechRecognitionCtor, hasMounted]);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!("speechSynthesis" in window)) return;

		const refreshVoices = () => {
			const voices = window.speechSynthesis.getVoices();
			voiceRef.current = pickFemaleVoice(voices);
		};

		refreshVoices();
		window.speechSynthesis.onvoiceschanged = refreshVoices;
		return () => {
			window.speechSynthesis.onvoiceschanged = null;
		};
	}, []);

	const emitSetField = (detail: TracySetFieldDetail) => {
		// Best-effort DOM fill (helps controlled inputs update via onChange)
		if (detail.scope === "booking") {
			try {
				tryFillDomField(detail.field, detail.value);
			} catch {
				// ignore
			}
		}
		window.dispatchEvent(new CustomEvent<TracySetFieldDetail>("tracy:setField", { detail }));
	};

	const emitAction = (detail: TracyActionDetail) => {
		window.dispatchEvent(new CustomEvent<TracyActionDetail>("tracy:action", { detail }));
	};

	const safeClearTimers = useCallback(() => {
		if (restartTimerRef.current) {
			window.clearTimeout(restartTimerRef.current);
			restartTimerRef.current = null;
		}
		if (partialTimerRef.current) {
			window.clearTimeout(partialTimerRef.current);
			partialTimerRef.current = null;
		}
	}, []);

	const scheduleRestart = useCallback(
		function scheduleRestartImpl(reason: string) {
			if (typeof window === "undefined") return;
			if (!shouldBeListeningRef.current) return;
			if (!speechRecognitionCtor) return;
			if (document.hidden) return;
			if (isSpeakingRef.current) return;

			if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
			const delay = restartBackoffMsRef.current;
			restartTimerRef.current = window.setTimeout(() => {
				restartTimerRef.current = null;
				try {
					recognitionRef.current?.start();
					restartBackoffMsRef.current = 250;
					setStatus("listening");
				} catch (e) {
					console.warn("Tracy recognition restart failed:", reason, e);
					restartBackoffMsRef.current = Math.min(2500, restartBackoffMsRef.current * 2);
					scheduleRestartImpl("restart-backoff");
				}
			}, delay);
		},
		[speechRecognitionCtor],
	);

	const speakWithRecovery = useCallback(
		(text: string) => {
			if (typeof window === "undefined") return;
			if (!("speechSynthesis" in window)) return;
			try {
				// Pause recognition while speaking to avoid engines getting stuck.
				recognitionRef.current?.abort();
			} catch {
				// ignore
			}

			isSpeakingRef.current = true;
			setStatus("speaking");
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 1.02;
			utterance.pitch = 1.1;
			utterance.volume = 1;
			if (voiceRef.current) utterance.voice = voiceRef.current;
			utterance.onend = () => {
				isSpeakingRef.current = false;
				setStatus(shouldBeListeningRef.current ? "listening" : "idle");
				scheduleRestart("tts-ended");
			};
			utterance.onerror = () => {
				isSpeakingRef.current = false;
				setStatus(shouldBeListeningRef.current ? "listening" : "idle");
				scheduleRestart("tts-error");
			};

			window.speechSynthesis.cancel();
			window.speechSynthesis.speak(utterance);
		},
		[scheduleRestart],
	);

	const getCurrentStepFields = useCallback((step: number) => bookingFlowByStep[step] ?? bookingFlowByStep[1], []);

	const askCurrentBookingField = useCallback(() => {
		const state = bookingGuidedRef.current;
		if (!state.enabled) return;
		const fields = getCurrentStepFields(state.step);
		if (state.index >= fields.length) {
			state.awaiting = "none";
			state.field = null;
			state.label = null;
			state.candidate = null;
			state.prefilled = null;
			speakWithRecovery(`Step ${state.step} complete. Say next to continue, or back.`);
			return;
		}

		const f = fields[state.index];
		state.field = f.field;
		state.label = f.label;
		state.candidate = null;
		state.detected = null;

		const currentValue = getFieldValueFromDom(f.field);
		if (!isEmptyValue(currentValue)) {
			state.prefilled = currentValue ?? "";
			state.awaiting = "keepOrChange";
			speakWithRecovery(`I found ${f.label} already filled as ${currentValue}. Say keep, or say change.`);
			return;
		}

		state.prefilled = null;
		state.awaiting = "value";
		speakWithRecovery(f.prompt);
	}, [getCurrentStepFields, speakWithRecovery]);

	const advanceBookingField = useCallback(() => {
		const state = bookingGuidedRef.current;
		state.index += 1;
		askCurrentBookingField();
	}, [askCurrentBookingField]);

	const startGuidedBooking = useCallback((initialStep: number) => {
		bookingGuidedRef.current.enabled = true;
		bookingGuidedRef.current.step = initialStep;
		bookingGuidedRef.current.index = 0;
		bookingGuidedRef.current.awaiting = "none";
		bookingGuidedRef.current.field = null;
		bookingGuidedRef.current.label = null;
		bookingGuidedRef.current.candidate = null;
		bookingGuidedRef.current.prefilled = null;
		bookingGuidedRef.current.detected = null;
		setActiveTask("booking");
		window.setTimeout(() => {
			askCurrentBookingField();
		}, 250);
	}, [askCurrentBookingField]);

	useEffect(() => {
		const onStep = (event: Event) => {
			const detail = (event as CustomEvent<{ step: number }>).detail;
			if (!detail?.step) return;
			if (!bookingGuidedRef.current.enabled) return;
			bookingGuidedRef.current.step = detail.step;
			bookingGuidedRef.current.index = 0;
			bookingGuidedRef.current.awaiting = "none";
			bookingGuidedRef.current.field = null;
			bookingGuidedRef.current.label = null;
			bookingGuidedRef.current.candidate = null;
			bookingGuidedRef.current.prefilled = null;
			bookingGuidedRef.current.detected = null;
			window.setTimeout(() => {
				askCurrentBookingField();
			}, 250);
		};

		const onDetectedLocation = (event: Event) => {
			const detail = (event as CustomEvent<{ address: string; city: string }>).detail;
			if (!detail?.address || !detail?.city) return;
			const state = bookingGuidedRef.current;
			if (!state.enabled) return;
			if (state.field !== "pickupAddress") return;
			state.detected = { address: detail.address, city: detail.city };
			state.awaiting = "confirmDetectedLocation";
			speakWithRecovery(`I detected pickup address ${detail.address} in ${detail.city}. Say yes to use it, or no to enter manually.`);
		};

		window.addEventListener("tracy:booking:step", onStep);
		window.addEventListener("tracy:booking:detectedLocation", onDetectedLocation);
		return () => {
			window.removeEventListener("tracy:booking:step", onStep);
			window.removeEventListener("tracy:booking:detectedLocation", onDetectedLocation);
		};
	}, [askCurrentBookingField, speakWithRecovery]);

	const handleIntent = async (intent: Intent, rawText: string) => {
		if (intent.type === "stop") {
			setActiveTask(null);
			bookingGuidedRef.current.enabled = false;
			setStatus(isListening ? "listening" : "idle");
			speakWithRecovery("Okay.");
			return;
		}

		if (intent.type === "help") {
			speakWithRecovery(
				"You can say: go to booking, go to login, start booking, next, back, detect my location, or set fields like sender name is Ali.",
			);
			return;
		}

		if (intent.type === "navigate") {
			router.push(intent.path);
			if (intent.path === "/booking") {
				window.setTimeout(() => {
					speakWithRecovery("Booking page opened. I'll ask each field. After you answer, say yes to confirm.");
					startGuidedBooking(1);
				}, 400);
				return;
			}
			speakWithRecovery(`Opening ${intent.path.replace("/", "") || "home"}.`);
			return;
		}

		if (intent.type === "startBooking") {
			router.push("/booking");
			speakWithRecovery("Opening booking. I'll ask each field. After you answer, say yes to confirm.");
			startGuidedBooking(1);
			return;
		}

		if (intent.type === "bookingAction") {
			// Booking navigation is only on explicit user command.
			emitAction({ scope: "booking", action: intent.action });
			if (intent.action === "booking.next") speakWithRecovery("Okay, next.");
			if (intent.action === "booking.back") speakWithRecovery("Okay, going back.");
			if (intent.action === "booking.submit") speakWithRecovery("Okay. Proceeding to payment.");
			if (intent.action === "booking.detectLocation") speakWithRecovery("Okay, detecting your pickup location.");
			return;
		}

		if (intent.type === "paymentAction") {
			emitAction({ scope: "payment", action: intent.action });
			speakWithRecovery("Okay. Processing payment now.");
			return;
		}

		// Guided booking response handling (blind-friendly ask/confirm flow)
		// Do not depend on pathname: users may answer while the route is still transitioning.
		if (bookingGuidedRef.current.enabled) {
			const state = bookingGuidedRef.current;
			const spoken = rawText.trim();
			const norm = normalizeText(spoken);

			if (state.awaiting === "keepOrChange") {
				if (isKeep(norm) || isAffirmative(norm)) {
					speakWithRecovery("Okay, keeping it.");
					advanceBookingField();
					return;
				}
				if (isChange(norm)) {
					state.awaiting = "value";
					const fields = getCurrentStepFields(state.step);
					const f = fields[state.index];
					speakWithRecovery(`Okay. ${f.prompt}`);
					return;
				}
				speakWithRecovery("Please say keep, or change.");
				return;
			}

			if (state.awaiting === "confirmDetectedLocation") {
				if (isAffirmative(norm)) {
					const detected = state.detected;
					if (!detected) {
						state.awaiting = "value";
						askCurrentBookingField();
						return;
					}
					emitSetField({ scope: "booking", field: "pickupAddress", value: detected.address });
					emitSetField({ scope: "booking", field: "pickupCity", value: detected.city });
					speakWithRecovery("Okay. Pickup location saved.");
					// Skip pickupCity prompt since we filled it too.
					state.index += 2;
					state.awaiting = "none";
					state.detected = null;
					askCurrentBookingField();
					return;
				}
				if (isNegative(norm)) {
					state.detected = null;
					state.awaiting = "value";
					speakWithRecovery("Okay. Please say the pickup address.");
					return;
				}
				speakWithRecovery("Please say yes to use it, or no to enter manually.");
				return;
			}

			if (state.awaiting === "value") {
				const fields = getCurrentStepFields(state.step);
				const f = fields[state.index];
				if (f?.optional && isSkip(norm)) {
					speakWithRecovery("Okay, skipped.");
					advanceBookingField();
					return;
				}
				// Special: allow detect location while asking for pickup address
				if (f?.field === "pickupAddress" && /\b(detect|use|get) (my )?(current )?location\b|\b(auto|current) location\b|\b(pickup )?location\b/.test(norm)) {
					emitAction({ scope: "booking", action: "booking.detectLocation" });
					speakWithRecovery("Okay. Detecting your pickup location now.");
					return;
				}

				const value = extractFieldValue(f.field, spoken) ?? spoken;
				state.candidate = value;
				state.awaiting = "confirm";
				speakWithRecovery(`You said ${value}. Say yes to confirm, or no to repeat.`);
				return;
			}

			if (state.awaiting === "confirm") {
				if (isAffirmative(norm)) {
					const fields = getCurrentStepFields(state.step);
					const f = fields[state.index];
					const value = state.candidate ?? "";
					if (f?.field && value) {
						emitSetField({ scope: "booking", field: f.field, value });
					}
					speakWithRecovery("Saved.");
					state.candidate = null;
					state.awaiting = "none";
					advanceBookingField();
					return;
				}
				if (isNegative(norm)) {
					state.candidate = null;
					state.awaiting = "value";
					speakWithRecovery("Okay. Say it again.");
					return;
				}
				// Treat anything else as a new value and re-confirm
				const fields = getCurrentStepFields(state.step);
				const f = fields[state.index];
				const value = extractFieldValue(f.field, spoken) ?? spoken;
				state.candidate = value;
				speakWithRecovery(`You said ${value}. Say yes to confirm, or no to repeat.`);
				return;
			}
			return;
		}

		if (intent.type === "setField") {
			// Avoid overwriting already filled visible fields unless user explicitly used "change".
			const normalized = normalizeText(rawText);
			const isExplicitChange = /\b(change|update|replace|set)\b/.test(normalized);
			const el = intent.scope === "booking" ? getTracyFieldElement(intent.field) : null;
			if (intent.scope === "booking" && el && !isExplicitChange) {
				const currentValue = getFieldValueFromDom(intent.field);
				if (!isEmptyValue(currentValue)) {
					speakWithRecovery("That field is already filled. Say change to update it.");
					return;
				}
			}

			const value = extractFieldValue(intent.field, intent.value) ?? intent.value;
			emitSetField({ scope: intent.scope, field: intent.field, value });
			speakWithRecovery("Got it.");

			if (activeTask === "booking" && intent.scope === "booking") {
				// In guided booking mode we do not auto-advance. User must say "next".
			}

			return;
		}

		// Route-specific submit fallback
		const normalized = normalizeText(rawText);
		if (/\b(submit|sign in|login)\b/.test(normalized) && pathname === "/auth/login") {
			emitAction({ scope: "login", action: "login.submit" });
			speakWithRecovery("Signing you in.");
			return;
		}
		if (/\b(submit|sign up|signup|create account)\b/.test(normalized) && pathname === "/auth/signup") {
			emitAction({ scope: "signup", action: "signup.submit" });
			speakWithRecovery("Creating your account.");
			return;
		}

		speakWithRecovery("Sorry, I didn't catch that. Try saying help.");
	};

	const startListening = () => {
		if (!speechRecognitionCtor) {
			setStatus("error");
			return;
		}
		shouldBeListeningRef.current = true;
		restartBackoffMsRef.current = 250;
		safeClearTimers();
		lastPartialRef.current = "";
		if (recognitionRef.current) {
			try {
				recognitionRef.current.stop();
			} catch {
				// ignore
			}
			recognitionRef.current = null;
		}

		const recognition = new speechRecognitionCtor();
		recognition.lang = "en-US";
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.maxAlternatives = 1;

		recognition.onstart = () => {
			listeningRef.current = true;
			setIsListening(true);
			setStatus("listening");
		};
		recognition.onend = () => {
			listeningRef.current = false;
			setIsListening(false);
			setStatus("idle");
			// Auto-restart if user didn't explicitly stop.
			scheduleRestart("onend");
		};
		recognition.onerror = (e) => {
			console.error("Tracy STT error:", e.error, e.message);
			setIsListening(false);
			listeningRef.current = false;

			// Restart for transient errors
			if (e.error === "no-speech" || e.error === "aborted" || e.error === "network" || e.error === "audio-capture") {
				scheduleRestart(`error-${e.error}`);
				return;
			}

			// Permission / blocked errors
			setStatus("error");
			shouldBeListeningRef.current = false;
		};

		const processText = (text: string) => {
			const cleaned = text.replace(new RegExp(OPTIONAL_PREFIX, "ig"), "").trim();
			if (!cleaned) return;
			const intent = parseIntent(cleaned);
			void handleIntent(intent, cleaned);
		};

		recognition.onresult = (event) => {
			let transcript = "";
			let finalTranscript = "";
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				const t = result[0]?.transcript ?? "";
				transcript += t;
				if (result.isFinal) finalTranscript += t;
			}

			const heard = (finalTranscript || transcript).trim();
			if (!heard) return;
			setLastHeard(heard);

			// Prefer finals, but if engine never finalizes, treat stable interim as final.
			if (finalTranscript) {
				if (partialTimerRef.current) {
					window.clearTimeout(partialTimerRef.current);
					partialTimerRef.current = null;
				}
				lastPartialRef.current = "";
				processText(finalTranscript);
				return;
			}

			// Debounce interim
			lastPartialRef.current = transcript.trim();
			if (partialTimerRef.current) window.clearTimeout(partialTimerRef.current);
			partialTimerRef.current = window.setTimeout(() => {
				partialTimerRef.current = null;
				const value = lastPartialRef.current;
				lastPartialRef.current = "";
				if (value) processText(value);
			}, 1200);
		};

		recognitionRef.current = recognition;
		try {
			recognition.start();
		} catch (e) {
			console.error(e);
			setStatus("error");
		}
	};

	const stopListening = () => {
		shouldBeListeningRef.current = false;
		safeClearTimers();
		recognitionRef.current?.stop();
		recognitionRef.current = null;
		listeningRef.current = false;
		setIsListening(false);
		setActiveTask(null);
		setStatus("idle");
		try {
			window.speechSynthesis.cancel();
		} catch {
			// ignore
		}
	};

	useEffect(() => {
		// If route changes while we're in booking flow, keep it.
		if (activeTask === "booking" && pathname !== "/booking") {
			// no-op; user might be navigating. Tracy can continue.
		}
	}, [pathname, activeTask]);

	const runTyped = async () => {
		const text = typed.trim();
		if (!text) return;
		setTyped("");
		const cleaned = text.replace(new RegExp(OPTIONAL_PREFIX, "ig"), "").trim();
		setStatus(isListening ? "listening" : "awake");
		const intent = parseIntent(cleaned);
		await handleIntent(intent, cleaned);
	};

	// Avoid hydration mismatch: server renders null, and first client render also null.
	if (!hasMounted || !supported) {
		return null;
	}

	return (
		<div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]">
			{!isExpanded ? (
				<button
					type="button"
					aria-label="Open Tracy"
					onClick={() => setIsExpanded(true)}
					className="relative h-12 w-12 rounded-full border border-gray-200 bg-white shadow-lg flex items-center justify-center"
				>
					<span className="text-sm font-semibold text-gray-900">T</span>
					<span
						className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
							status === "listening" ? "bg-orange-500" : status === "error" ? "bg-red-500" : "bg-gray-300"
						}`}
					/>
				</button>
			) : (
				<div className="w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white/95 backdrop-blur px-3 py-3 shadow-lg">
					<div className="flex items-center justify-between gap-2">
						<div className="min-w-0">
							<p className="text-sm font-semibold text-gray-900 truncate">Tracy</p>
							<p className="text-xs text-gray-600 truncate">
								{status === "idle" && "Tap Start to talk"}
								{status === "listening" && "Listening"}
								{status === "awake" && "Ready"}
								{status === "speaking" && "Speaking"}
								{status === "error" && "Mic error — check permissions"}
							</p>
						</div>

						<div className="flex items-center gap-2">
							{!isListening ? (
								<Button size="sm" onClick={startListening}>
									Start
								</Button>
							) : (
								<Button size="sm" variant="outline" onClick={stopListening}>
									Stop
								</Button>
							)}
							<Button size="sm" variant="outline" onClick={() => setIsExpanded(false)}>
								Close
							</Button>
						</div>
					</div>

					<div className="mt-3">
						<p className="text-[11px] text-gray-500">Last heard</p>
						<p className="text-xs text-gray-800 line-clamp-2 min-h-[2.25rem]">{lastHeard || "—"}</p>
					</div>

					<div className="mt-3 flex gap-2">
						<input
							value={typed}
							onChange={(e) => setTyped(e.target.value)}
							placeholder="Type a command (fallback)"
							className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
						/>
						<Button size="sm" onClick={runTyped}>
							Send
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

