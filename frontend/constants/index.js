// constants/index.js - BluCare+ Platform Data & Showcases

const workflowSteps = [
	{
		name: "Symptom Assessment",
		country: "AI",
		detail: "Initial Check",
		price: "Step 01",
	},
	{
		name: "Risk Evaluation",
		country: "AI",
		detail: "Analysis",
		price: "Step 02",
	},
	{
		name: "Condition Prediction",
		country: "ML",
		detail: "Deep Scan",
		price: "Step 03",
	},
	{
		name: "Report Generation",
		country: "SYS",
		detail: "Summary",
		price: "Step 04",
	},
];

const coreIntelligence = [
	{
		name: "Real-Time Risk Detection",
		country: "AI",
		detail: "Continuous",
		price: "Live",
	},
	{
		name: "Ambulance Locator",
		country: "GPS",
		detail: "Nearby",
		price: "SOS 108",
	},
	{
		name: "Medical History Mapping",
		country: "Data",
		detail: "Secure",
		price: "Protected",
	},
	{
		name: "Admin Alert Dashboard",
		country: "Panel",
		detail: "Monitoring",
		price: "Active",
	},
];

const storeInfo = {
	heading: "AI-Powered Healthcare Platform",
	description:
		"Providing intelligent symptom analysis, medical RAG, and emergency assistance powered by advanced medical AI systems.",
	contact: {
		phone: "+91 94038 71129",
		email: "support@ragblucare.ai",
	},
};

const openingHours = [
	{ label: "Availability", value: "24/7 AI Assistance" },
	{ label: "Emergency Support", value: "Real-Time Detection Enabled" },
	{ label: "Response Time", value: "Instant Analysis" },
];

const socials = [
	{
		name: "X (Twitter)",
		url: "https://x.com",
	},
	{
		name: "GitHub",
		url: "https://github.com",
	},
];

const architectureFeatures = [
	{
		id: 1,
		name: "Smart Follow-Up Engine",
		image: "",
		title: "Understands Before It Responds",
		description:
			"Our AI asks intelligent follow-up questions to deeply understand your symptoms, medical history, and risk factors before generating any conclusion.",
	},
	{
		id: 2,
		name: "Accurate Diagnosis System",
		image: "",
		title: "Precision Backed by Medical Intelligence",
		description:
			"Using structured medical knowledge and advanced evaluation models, the system provides clear, evidence-based diagnosis insights you can trust.",
	},
	{
		id: 3,
		name: "Nearby Emergency Assistance",
		image: "",
		title: "Help When You Need It Most",
		description:
			"Instantly locate nearby clinics, hospitals, and ambulances based on your disease and condition severity, enabling faster medical intervention when every moment matters.",
	},
	{
		id: 4,
		name: "Severity-Based Risk Prediction",
		image: "",
		title: "Early Detection. Smarter Decisions.",
		description:
			"The platform predicts possible conditions and categorizes them by severity level, helping you understand emergency and next best steps with greater clarity.",
	},
];

export {
	workflowSteps,
	coreIntelligence,
	openingHours,
	storeInfo,
	socials,
	architectureFeatures,
};
