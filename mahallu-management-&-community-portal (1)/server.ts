import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Comprehensive local knowledge base for offline/fallback intelligence
function getLocalKnowledgeReply(message: string, context?: any): { reply: string; clearanceStatus?: any; suggestedActions?: any[] } {
  const lower = message.toLowerCase();

  // Clearance check intent
  if (lower.includes('clearance') || lower.includes('eligible') || lower.includes('check my status') || lower.includes('clear payment') || lower.includes('clear chanda')) {
    const houseNo = context?.currentUser?.houseNo || 'M-14';
    const houseName = context?.houseName || 'Baitul Noor';
    const duesStatus = context?.duesStatus || 'Pending';

    let clearanceVerdict = "Eligible with Minor Notice";
    let clearanceDetails = "Your household family census is fully registered. Monthly subscription payment has 1 pending cycle (₹250).";
    let actions = [
      { label: "Pay Pending Dues (₹250)", actionType: "navigate", targetTab: "financials" },
      { label: "Proceed to Apply Certificate", actionType: "navigate", targetTab: "services" }
    ];

    if (duesStatus === 'Paid') {
      clearanceVerdict = "Fully Cleared & Approved";
      clearanceDetails = "All monthly subscription dues are up to date with zero arrears. Your household is in good standing for NOCs, Marriage Registration, and Voting.";
      actions = [
        { label: "Apply for Certificate / NOC", actionType: "navigate", targetTab: "services" },
        { label: "Download Latest Receipt", actionType: "navigate", targetTab: "financials" }
      ];
    }

    return {
      reply: `### Mahallu Clearance Assessment for House #${houseNo} (${houseName})
**Verdict: ${clearanceVerdict}**

${clearanceDetails}

**Standard Mahallu Clearance Rules:**
1. **Subscription Payments:** Must have no more than 2 consecutive months overdue for Marriage NOC or Committee voting rights.
2. **Census Verification:** All resident family members (including children, spouses, and abroad residents) must be listed in the Mahallu Family Register.
3. **Prerequisite Documents:** Photo ID proof, Aadhaar, and bride/groom details (for Marriage NOC).

Would you like me to guide you through clearing your pending dues or submitting a formal request now?`,
      clearanceStatus: {
        houseNo,
        verdict: clearanceVerdict,
        isCleared: duesStatus === 'Paid',
        pendingDues: duesStatus === 'Paid' ? 0 : 250,
        censusComplete: true
      },
      suggestedActions: actions
    };
  }

  // Marriage NOC / Certificate doubts
  if (lower.includes('marriage') || lower.includes('noc') || lower.includes('nikah') || lower.includes('wedding')) {
    return {
      reply: `### Marriage Clearance & NOC Guidelines
For marriage (Nikah) registration or an official **No Objection Certificate (NOC)** from EDAPPAL Central Mahallu Jama'ath:

**Required Checklist:**
1. **Application:** Submit an NOC / Marriage Certificate request under the **Service Requests** section.
2. **Identification:** Aadhaar Card / Passport copies of both Bride and Groom.
3. **Age Verification:** Age must meet statutory guidelines (Groom: 21+, Bride: 18+).
4. **Mahallu Clearance:** Household subscription payment must be cleared up to the current month.
5. **Mahallu Transfer (if applicable):** If the spouse belongs to another Mahallu, an NOC from their respective Mahallu Jama'ath committee is required.
6. **Processing Time:** 24 to 48 hours for General Secretary & Khasi review.

Would you like to draft your Marriage NOC application right now?`,
      suggestedActions: [
        { label: "Apply for Marriage NOC", actionType: "navigate", targetTab: "services" },
        { label: "Check Household Clearance", actionType: "check_clearance" }
      ]
    };
  }

  // Payment / Subscription dues
  if (lower.includes('chanda') || lower.includes('dues') || lower.includes('subscription') || lower.includes('fee') || lower.includes('payment') || lower.includes('receipt')) {
    return {
      reply: `### Monthly Subscription Payment Information
- **Standard Subscription:** Monthly payment is fixed as per household census tier (standard ₹250/month for General households, ₹100/month subsidized for Priority support).
- **Payment Modes:** 
  1. Instant Online UPI (Google Pay, PhonePe, Paytm, BHIM) via the **Financials & Payments** tab.
  2. Direct Cash at the EDAPPAL Central Mahallu Office (9:00 AM - 1:00 PM, 4:30 PM - 8:30 PM).
  3. Bank Transfer / NEFT to the EDAPPAL Waqf Trust Account.
- **Official Receipt:** A verifiable digital receipt with serial number and QR seal is automatically generated immediately upon payment.

You can view your current ledger and download past receipts in the **Financials** tab.`,
      suggestedActions: [
        { label: "View & Pay Dues", actionType: "navigate", targetTab: "financials" },
        { label: "Check Clearance Status", actionType: "check_clearance" }
      ]
    };
  }

  // Prayer & Iqamah timings
  if (lower.includes('prayer') || lower.includes('time') || lower.includes('namaz') || lower.includes('adhan') || lower.includes('iqamah') || lower.includes('jumu') || lower.includes('friday') || lower.includes('khutbah')) {
    return {
      reply: `### Mosque Prayer & Jumu'ah Timings
**Daily Prayer Schedule (EDAPPAL Central Juma Masjid):**
- **Fajr:** Adhan 05:00 AM | Iqamah 05:25 AM
- **Dhuhr:** Adhan 12:35 PM | Iqamah 12:55 PM
- **Asr:** Adhan 04:30 PM | Iqamah 04:50 PM
- **Maghrib:** Adhan 06:38 PM | Iqamah 06:45 PM
- **Isha:** Adhan 08:05 PM | Iqamah 08:25 PM

**Friday Jumu'ah Schedule:**
- **First Adhan:** 12:20 PM
- **Khutbah:** 12:45 PM by Chief Imam Usthad Moulavi Bilal Qasimi
- **Topic:** "Strengthening Mahallu Solidarity & Mutual Support in Times of Need"
- **Jumu'ah Salah:** 01:15 PM`,
      suggestedActions: [
        { label: "View Full Prayer & Notices Tab", actionType: "navigate", targetTab: "prayer-notices" }
      ]
    };
  }

  // Financial / Medical Aid & Zakat
  if (lower.includes('aid') || lower.includes('medical') || lower.includes('zakat') || lower.includes('help') || lower.includes('relief') || lower.includes('charity')) {
    return {
      reply: `### Financial & Medical Relief Aid Process
EDAPPAL Central Mahallu maintains a dedicated Baitul Mal Welfare & Emergency Medical Fund:

**Eligibility & Documents:**
- Hospital discharge summary / medical prescription / fee quotation.
- Ration card photocopy (BPL / Priority families receive immediate expedited clearance).
- Application submitted under **Service Requests > Financial & Medical Aid**.
- Applications are verified by the Ward Representative and disbursed on a weekly basis, or within 4 hours for critical emergency cases.`,
      suggestedActions: [
        { label: "Apply for Financial/Medical Aid", actionType: "navigate", targetTab: "services" },
        { label: "Donate to Relief Campaigns", actionType: "navigate", targetTab: "financials" }
      ]
    };
  }

  // Janazah / Burial / Qabaristan
  if (lower.includes('janazah') || lower.includes('death') || lower.includes('burial') || lower.includes('qabaristan') || lower.includes('grave')) {
    return {
      reply: `### Janazah (Funeral) Protocols & Assistance
**In the event of a demise within the Mahallu:**
1. **Immediate Notice:** Inform Mahallu Helpline (+91 495 2410022) or General Secretary (+91 98471 23456).
2. **Qabaristan Clearance:** Grave allotment and Mayyith washing facility (Ghusl khana) are arranged free of charge for all registered residents.
3. **Community Notice:** An urgent announcement is broadcast immediately to the Mahallu portal and community noticeboard.
4. **Transport:** Mahallu Mayyith ambulance is on standby 24/7.`,
      suggestedActions: [
        { label: "View Noticeboard & Janazah Notices", actionType: "navigate", targetTab: "prayer-notices" }
      ]
    };
  }

  // General default welcoming reply
  return {
    reply: `Assalamu Alaikum wa Rahmatullahi wa Barakatuh! 
I am **Mahallu Sahayi**, your dedicated AI Assistant for EDAPPAL Central Mahallu Jama'ath.

I am here to answer any doubts and provide instant clearances regarding:
- **Clearance & Eligibility Audits:** Check if your household is clear for Marriage NOC, Nikah, or Madrasa registration.
- **Certificates & NOC:** Requirements, paperwork, and status tracking for residency and marriage certificates.
- **Payments & Subscriptions:** Pending dues calculation, UPI payments, and official receipt downloads.
- **Prayer & Jumu'ah:** Adhan, Iqamah timings, and Friday Khutbah details.
- **Welfare & Medical Aid:** How to apply for Baitul Mal emergency grants.

How may I assist you with your household doubts or clearance today?`,
    suggestedActions: [
      { label: "Check My Clearance Status", actionType: "check_clearance" },
      { label: "Marriage NOC Requirements", actionType: "quick_prompt", prompt: "What documents are required for a Marriage NOC?" },
      { label: "How to Pay Dues", actionType: "quick_prompt", prompt: "How can I check and pay my pending payment dues?" },
      { label: "Prayer & Iqamah Schedule", actionType: "quick_prompt", prompt: "What are today's prayer and Friday Jumu'ah timings?" }
    ]
  };
}

// AI Chatbot endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], residentContext = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "A message string is required." });
    }

    const ai = getGeminiClient();

    // If Gemini API is not configured or fails, use the comprehensive fallback knowledge engine
    if (!ai) {
      const fallbackResult = getLocalKnowledgeReply(message, residentContext);
      return res.json({
        reply: fallbackResult.reply,
        clearanceStatus: fallbackResult.clearanceStatus,
        suggestedActions: fallbackResult.suggestedActions,
        isFallback: true
      });
    }

    // Build context-aware prompt with Mahallu bylaws, current user state, and role
    const systemInstruction = `You are "Mahallu Sahayi" (മഹല്ല് സഹായി), the official, intelligent AI Assistant for EDAPPAL Central Mahallu Jama'ath (Waqf Reg. KL/WQF/142/1984).
Your primary duties are:
1. Answer residents' doubts regarding Mahallu administration, Islamic civic guidelines, prayer timings, subscription dues (payments), Madrasa, Janazah protocols, and community welfare.
2. Conduct Clearance checks for residents applying for Marriage NOC (No Objection Certificate), Residency Certificates, Financial Aid, or General Body voting eligibility.
3. Help residents understand what documents, fees, or steps are needed to obtain clearances.

CURRENT RESIDENT & MAHALLU CONTEXT:
- Mahallu Name: EDAPPAL Central Mahallu Jama'ath
- Waqf Reg: KL/WQF/142/1984
- Current User: ${residentContext?.currentUser ? `${residentContext.currentUser.name} (Role: ${residentContext.currentUser.role}, House: ${residentContext.currentUser.houseNo || 'N/A'}, Ward: ${residentContext.currentUser.ward || 'N/A'})` : 'Guest / Unauthenticated Resident'}
- Household Status: ${residentContext?.duesStatus ? `Monthly payment is ${residentContext.duesStatus}` : 'Registered Household'}
- Monthly Payment Fee: ₹250/month standard (subsidized for priority families)
- Mosque Prayer Timings: Fajr 5:25 AM, Dhuhr 12:55 PM, Asr 4:50 PM, Maghrib 6:45 PM, Isha 8:25 PM. Friday Jumu'ah Khutbah at 12:45 PM.
- Office Hours: 9:00 AM - 1:00 PM and 4:30 PM - 8:30 PM. Helpline: +91 495 2410022.

CLEARANCE RULES:
- For Marriage NOC: Family must have registered members in census, subscription payment cleared up to current month (no more than 2 months overdue), statutory age proof (groom 21+, bride 18+), spouse Mahallu details.
- For Residency Certificate: Verified head of family signature, active residential address in designated ward.
- For Financial/Medical Aid: BPL or Priority verification, medical bills/discharge summary, verified by Ward Representative.

RESPONSE GUIDELINES:
- Greet respectfully (e.g., "Assalamu Alaikum").
- Speak in clear, professional, warm English. You may understand and use appropriate cultural/Malayalam terms (Nikah, Chanda, Janazah, Mahallu, Madrasa, Qabaristan, Sulh).
- Provide structured answers with bullet points or step-by-step numbered lists for clarity.
- When residents ask about their clearance, evaluate their situation and clearly state their clearance status, requirements, and next steps.
- Conclude with a helpful proactive suggestion or action.`;

    // Construct conversation payload
    const formattedHistory = (history || []).slice(-6).map((item: any) => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text || item.content || '' }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        ...formattedHistory,
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I am here to assist you with any Mahallu clearance or doubt.";

    // Generate smart actions based on content
    const lowerReply = replyText.toLowerCase();
    const suggestedActions = [];

    if (lowerReply.includes('service request') || lowerReply.includes('apply') || lowerReply.includes('certificate') || lowerReply.includes('noc')) {
      suggestedActions.push({ label: "Open Service Requests", actionType: "navigate", targetTab: "services" });
    }
    if (lowerReply.includes('chanda') || lowerReply.includes('payment') || lowerReply.includes('pay') || lowerReply.includes('financial')) {
      suggestedActions.push({ label: "View Financials & Pay Dues", actionType: "navigate", targetTab: "financials" });
    }
    if (lowerReply.includes('prayer') || lowerReply.includes('jumu') || lowerReply.includes('notice')) {
      suggestedActions.push({ label: "Check Prayer & Notices", actionType: "navigate", targetTab: "prayer-notices" });
    }
    if (lowerReply.includes('clearance')) {
      suggestedActions.push({ label: "Run Clearance Audit", actionType: "check_clearance" });
    }

    // Clearance payload if asked
    let clearanceStatus = null;
    if (lowerReply.includes('clearance') || message.toLowerCase().includes('clearance')) {
      const isPaid = residentContext?.duesStatus === 'Paid';
      clearanceStatus = {
        houseNo: residentContext?.currentUser?.houseNo || 'M-14',
        verdict: isPaid ? 'Fully Cleared & Approved' : 'Action Required (Pending Dues)',
        isCleared: isPaid,
        pendingDues: isPaid ? 0 : 250,
        censusComplete: true
      };
    }

    return res.json({
      reply: replyText,
      clearanceStatus,
      suggestedActions: suggestedActions.slice(0, 3),
      isFallback: false
    });

  } catch (error: any) {
    console.error("Gemini API error, falling back to local knowledge engine:", error?.message || error);
    const fallbackResult = getLocalKnowledgeReply(req.body.message || '', req.body.residentContext);
    return res.json({
      reply: fallbackResult.reply,
      clearanceStatus: fallbackResult.clearanceStatus,
      suggestedActions: fallbackResult.suggestedActions,
      isFallback: true,
      errorNotice: "Processed via Mahallu Offline Knowledge Base"
    });
  }
});

// Dedicated Clearance Check API
app.post("/api/clearance-check", (req, res) => {
  const { houseNo, familyId, certificateType = "Marriage NOC" } = req.body;
  
  // Evaluate based on mock records
  const isPaid = houseNo === 'B-01' || houseNo === 'B-19'; // e.g. B-01 is fully paid
  
  const auditResult = {
    houseNo: houseNo || 'M-14',
    certificateType,
    evaluatedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    items: [
      {
        criterion: "Monthly Subscription Payment",
        status: isPaid ? "Cleared" : "Pending (1 Month - ₹250)",
        passed: isPaid,
        note: isPaid ? "All dues paid up to September 2026." : "September 2026 pending. Please clear online or at office."
      },
      {
        criterion: "Household Census Registration",
        status: "Verified",
        passed: true,
        note: "All resident members and dependents registered in Mahallu Directory."
      },
      {
        criterion: "Statutory Documentation (Aadhaar / ID)",
        status: "Ready",
        passed: true,
        note: "Head of family ID and address proof on file."
      },
      {
        criterion: "Executive Committee Review Eligibility",
        status: isPaid ? "Eligible for Instant Approval" : "Conditional on Payment Clearance",
        passed: isPaid,
        note: isPaid ? "Can be issued within 24 hours of submission." : "Will be reviewed immediately after subscription settlement."
      }
    ],
    overallStatus: isPaid ? "CLEARED" : "ACTION_REQUIRED",
    actionRequired: isPaid ? null : "Pay ₹250 pending subscription to finalize clearance"
  };

  res.json(auditResult);
});

// Vite middleware for development vs static build in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mahallu Management Server running on port ${PORT}`);
  });
}

startServer();
