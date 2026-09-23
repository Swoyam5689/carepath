export const doctors = [
  { id: "d1", name: "Dr. Alok Verma", specialty: "General Medicine", category: "general-medicine", qualification: "MD (Internal Medicine)", experience: "12 yrs exp", initials: "AV", hospital: "CityCare Hospital", room: "Room 102", fee: 600 },
  { id: "d2", name: "Dr. Rohan Sharma", specialty: "Cardiology", category: "cardiology", qualification: "DM, MD (Cardiology)", experience: "16 yrs exp", initials: "RS", hospital: "Metro Health Institute", room: "Room 305", fee: 900 },
  { id: "d3", name: "Dr. Radhika Sen", specialty: "Dermatology", category: "dermatology", qualification: "MD, DNB (Dermatology)", experience: "8 yrs exp", initials: "RS", hospital: "CityCare Hospital", room: "Room 204", fee: 650 },
  { id: "d4", name: "Dr. Vikram Sethi", specialty: "Orthopedics", category: "orthopedics", qualification: "MS (Orthopedics)", experience: "14 yrs exp", initials: "VS", hospital: "CityCare Hospital", room: "Room 108", fee: 700 },
  { id: "d5", name: "Dr. Meera Nambiar", specialty: "Dermatology", category: "dermatology", qualification: "MD (Dermatology)", experience: "10 yrs exp", initials: "MN", hospital: "Green Valley Medical Centre", room: "Room 112", fee: 550 },
  { id: "d6", name: "Dr. Priya Nair", specialty: "Radiology", category: "radiology", qualification: "MD (Radiodiagnosis)", experience: "12 yrs exp", initials: "PN", hospital: "Green Valley Medical Centre", room: "Scan Wing B", fee: 750 },
  { id: "d7", name: "Dr. Pooja Bhatt", specialty: "Pediatrics", category: "pediatrics", qualification: "MD (Pediatrics), DCH", experience: "9 yrs exp", initials: "PB", hospital: "CityCare Hospital", room: "Child Care Wing", fee: 500 },
  { id: "d8", name: "Dr. Farhan Ali", specialty: "Neurology", category: "neurology", qualification: "DM (Neurology), MBBS", experience: "15 yrs exp", initials: "FA", hospital: "Metro Health Institute", room: "Neuro Wing 402", fee: 950 },
  { id: "d9", name: "Dr. Amitav Ghosh", specialty: "Cardiology", category: "cardiology", qualification: "MD, DNB (Cardiology)", experience: "13 yrs exp", initials: "AG", hospital: "CityCare Hospital", room: "Cardiac Unit 201", fee: 850 },
  { id: "d10", name: "Dr. S. K. Gupta", specialty: "General Medicine", category: "general-medicine", qualification: "MBBS, MD", experience: "18 yrs exp", initials: "SG", hospital: "Community General Hospital", room: "OPD 1", fee: 450 },
  { id: "d11", name: "Dr. Rajeshwar Sharma", specialty: "Ayurvedic Medicine & Panchakarma", category: "ayush", qualification: "BAMS, MD (Ayurveda)", experience: "20 yrs exp", initials: "RS", hospital: "All India Institute of Ayurveda (AIIA)", room: "Ayush OPD 04", fee: 500 },
  { id: "d12", name: "Dr. Sunita Vaidya", specialty: "Classical Nadi Vigyan & Doshic Balance", category: "ayush", qualification: "BAMS, Ph.D. (Dravyaguna)", experience: "17 yrs exp", initials: "SV", hospital: "Charak Ayurvedic Research Hospital", room: "Nadi Suite", fee: 550 }
];

export const initialState = {
  user: { name: "Swyom Sharma", email: "patient@carepath.demo", role: "patient", authenticated: false },
  records: [
    { id: "r1", name: "Complete Blood Count.pdf", type: "Blood report", date: "2026-08-12", size: "1.2 MB" },
    { id: "r2", name: "Chest X-Ray.png", type: "X-ray", date: "2026-07-28", size: "2.8 MB" },
    { id: "r3", name: "Prescription - General OPD.pdf", type: "Prescription", date: "2026-08-02", size: "640 KB" }
  ],
  shares: [],
  shareAudit: [],
  allergies: []
};

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
