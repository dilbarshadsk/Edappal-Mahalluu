export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { houseNo, certificateType = "Marriage NOC" } = req.body || {};
  
  // Evaluate based on standard household records
  const isPaid = houseNo === 'B-01' || houseNo === 'B-19';
  
  const auditResult = {
    houseNo: houseNo || 'M-14',
    certificateType,
    evaluatedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    items: [
      {
        criterion: "Monthly Subscription Payment",
        status: isPaid ? "Cleared" : "Pending (1 Month - ₹250)",
        passed: isPaid,
        note: isPaid ? "All dues paid up to current month." : "Current cycle pending. Settle online or at the Mahallu office."
      },
      {
        criterion: "Household Census Registration",
        status: "Verified",
        passed: true,
        note: "All resident members and dependents registered in EDAPPAL Mahallu Directory."
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

  return res.status(200).json(auditResult);
}
