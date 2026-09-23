import React, { useState } from "react";
import { ShieldCheck, ScanLine, Check, LockKeyhole } from "lucide-react";
import { useLanguage, LanguageSelector } from "../i18n/LanguageContext.jsx";
import { ThemeToggle } from "../theme/ThemeContext.jsx";
import { PageIntro } from "../components/NavAndStats.jsx";
import AccountVerificationPanel from "../identity/AccountVerificationPanel.jsx";

export function ProfilePage({ state, onSave, onVerificationComplete }) {
  const { t, language } = useLanguage();
  const user = state.user || {};
  const demographics = user.demographics || {};
  const healthProfile = user.healthProfile || {};
  const emergencyContact = user.emergencyContact || {};

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [mobile, setMobile] = useState(user.mobile || "");

  // Demographics
  const [dob, setDob] = useState(demographics.dob || "");
  const [gender, setGender] = useState(demographics.gender || "Not specified");
  const [city, setCity] = useState(demographics.city || "");
  const [address, setAddress] = useState(demographics.address || "");

  // Health Profile
  const [bloodGroup, setBloodGroup] = useState(healthProfile.bloodGroup || "");
  const [heightCm, setHeightCm] = useState(healthProfile.heightCm || 168);
  const [weightKg, setWeightKg] = useState(healthProfile.weightKg || 65);
  const [conditions, setConditions] = useState(healthProfile.chronicConditions || []);
  const [customCond, setCustomCond] = useState("");
  const [allergyText, setAllergyText] = useState((healthProfile.allergies || state.allergies || []).join(", "));
  const [medsText, setMedsText] = useState((healthProfile.regularMedications || []).join(", "));

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState(emergencyContact.name || "");
  const [emergencyRelation, setEmergencyRelation] = useState(emergencyContact.relation || "");
  const [emergencyPhone, setEmergencyPhone] = useState(emergencyContact.phone || "");

  // Calculate BMI
  const bmi = (heightCm > 0 && weightKg > 0)
    ? (weightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1)
    : null;

  const COMMON_CONDITIONS = [
    "Type 2 Diabetes", "Hypertension", "Asthma", "Thyroid Disorder",
    "Heart Disease", "Arthritis", "Acid Reflux / GERD", "None"
  ];

  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  function toggleCondition(cond) {
    if (cond === "None") {
      setConditions(conditions.includes("None") ? [] : ["None"]);
      return;
    }
    const filtered = conditions.filter(c => c !== "None");
    if (filtered.includes(cond)) {
      setConditions(filtered.filter(c => c !== cond));
    } else {
      setConditions([...filtered, cond]);
    }
  }

  function addCustomCondition() {
    const trimmed = customCond.trim();
    if (!trimmed || conditions.includes(trimmed)) return;
    setConditions(conditions.filter(c => c !== "None").concat(trimmed));
    setCustomCond("");
  }

  function handleSave() {
    const allergiesList = allergyText.split(",").map(x => x.trim()).filter(Boolean);
    const medsList = medsText.split(",").map(x => x.trim()).filter(Boolean);

    onSave({
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      preferredLanguage: language,
      demographics: {
        dob,
        gender,
        city: city.trim(),
        address: address.trim()
      },
      healthProfile: {
        bloodGroup,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        chronicConditions: conditions,
        allergies: allergiesList,
        regularMedications: medsList
      },
      emergencyContact: {
        name: emergencyName.trim(),
        relation: emergencyRelation.trim(),
        phone: emergencyPhone.trim()
      },
      allergies: allergiesList
    });
  }

  return (
    <div className="profile-page">
      <PageIntro
        eyebrow="PROFILE & IDENTITY"
        title="Profile & Identity"
        subtitle="Manage your personal demographics, health vitals, and ABHA / Aadhaar identity verification."
        tag={<><i/>ABHA ID Verified</>}
        action={
          <span className="abha-id-chip">
            <ShieldCheck size={14} color="#059669" />
            <span>Ayushman Bharat Verified</span>
          </span>
        }
      />

      {/* Digital ABHA Smart Card */}
      <div className="abha-smart-card">
        <div className="abha-card-header">
          <div className="abha-card-emblem-wrap">
            <div className="abha-card-emblem">🏛️</div>
            <div>
              <span className="abha-card-ministry-title">Ministry of Health & Family Welfare · Govt. of India</span>
              <span className="abha-card-scheme-title">Ayushman Bharat Digital Mission (ABDM)</span>
            </div>
          </div>
          <div className="abha-chip-graphic">
            <div className="smart-chip" title="Cryptographic Microchip" />
            <span className="live" style={{fontSize:9.5,padding:"2px 8px",background:"rgba(255,255,255,0.12)"}}><i/>ABHA Active</span>
          </div>
        </div>

        <div className="abha-card-body">
          <div>
            <div className="abha-card-number-block">
              <span className="abha-number-label">ABHA Health ID Number</span>
              <div className="abha-number-display">91-2304-9821-4412</div>
            </div>
            <div className="abha-vitals-grid">
              <div className="abha-vital-item">
                <span>Cardholder Name</span>
                <strong>{name || "Aarav Sharma"}</strong>
              </div>
              <div className="abha-vital-item">
                <span>ABHA Address</span>
                <strong>{user.abhaAddress || (name ? `${name.toLowerCase().replace(/\s+/g,".")}@abdm` : "aarav.sharma@abdm")}</strong>
              </div>
              <div className="abha-vital-item">
                <span>Gender / DOB</span>
                <strong>{gender || "Male"} · {dob || "1994-08-14"}</strong>
              </div>
              <div className="abha-vital-item">
                <span>Blood Group</span>
                <strong>{bloodGroup || "O+"}</strong>
              </div>
            </div>
          </div>

          <div className="abha-qr-badge">
            <div style={{fontSize:28,lineHeight:1,display:"grid",placeItems:"center"}}>
              <ScanLine size={32} color="#a7f3d0"/>
            </div>
            <span>Verified ABDM QR</span>
          </div>
        </div>
      </div>

      {/* Primary Account Card */}
      <div className="card vault" style={{ marginBottom: 20, padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, borderBottom: "1px solid var(--line)", paddingBottom: 18, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div className="profile-avatar" style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--green-soft)", color: "var(--green)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
              {name ? name.slice(0, 2).toUpperCase() : "PT"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: 19, color: "var(--navy)" }}>{name || t("patientProfile")}</h2>
                <span style={{ fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "var(--green-dark)", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 12 }}>
                  Patient Account
                </span>
              </div>
              <span className="muted" style={{ fontSize: 13, marginTop: 3, display: "block" }}>
                {mobile ? `+91 ${mobile}` : t("mobileNotLinked")} · {email || t("emailNotSpecified")}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)" }}>{t("selectLanguage")}:</span>
            <LanguageSelector variant="compact" />
            <ThemeToggle variant="compact" />
          </div>
        </div>

        <div>
          <div className="two-fields">
            <label className="field" style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>{t("fullName")} *</span>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t("fullNamePlaceholder")}
                style={{ fontSize: 14.5, padding: "12px 14px", width: "100%" }}
              />
            </label>
            <label className="field" style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>{t("email")} *</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                style={{ fontSize: 14.5, padding: "12px 14px", width: "100%" }}
              />
            </label>
          </div>
          <label className="field" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>{t("mobileNumber")} *</span>
            <input
              type="tel"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder={t("mobilePlaceholder")}
              style={{ fontSize: 14.5, padding: "12px 14px", width: "100%" }}
            />
          </label>
        </div>
      </div>

      {/* Demographics Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ color: "var(--green)", marginBottom: 6 }}>{t("demographicsEyebrow")}</div>
        <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>{t("personalDemographicsTitle")}</h3>
        <div className="two-fields">
          <label className="field">
            <span>{t("dateOfBirth")}</span>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} />
          </label>
          <label className="field">
            <span>{t("gender")}</span>
            <select value={gender} onChange={e => setGender(e.target.value)}>
              <option value="Not specified">{t("selectGenderOption")}</option>
              <option value="Male">{t("male")}</option>
              <option value="Female">{t("female")}</option>
              <option value="Other">{t("otherGender")}</option>
            </select>
          </label>
        </div>
        <div className="two-fields">
          <label className="field">
            <span>{t("city")} / District</span>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder={t("cityPlaceholder")} />
          </label>
          <label className="field">
            <span>{t("residentialAddressLabel")}</span>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder={t("addressPlaceholder")} />
          </label>
        </div>
      </div>

      {/* Core Health Profile Card */}
      <div className="card health" style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ color: "var(--green)", marginBottom: 6 }}>{t("healthProfileEyebrow")}</div>
        <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>{t("coreVitalsMedicalHistoryTitle")}</h3>

        {/* Blood Group */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#283b34" }}>
            {t("bloodGroup")}
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                type="button"
                className={`chip-btn ${bloodGroup === bg ? "active" : ""}`}
                onClick={() => setBloodGroup(bloodGroup === bg ? "" : bg)}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Typed Height & Weight Input */}
        <div className="two-fields" style={{ marginBottom: 16 }}>
          <label className="field" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>
              {t("height")} (cm) *
            </span>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="number"
                min="40"
                max="250"
                step="1"
                value={heightCm}
                onChange={e => setHeightCm(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 168"
                style={{ fontSize: 15, padding: "12px 48px 12px 14px", width: "100%", fontWeight: 600 }}
              />
              <span style={{ position: "absolute", right: 14, color: "var(--muted)", fontWeight: 700, fontSize: 13, pointerEvents: "none" }}>
                cm
              </span>
            </div>
          </label>

          <label className="field" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>
              {t("weight")} (kg) *
            </span>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="number"
                min="10"
                max="300"
                step="0.5"
                value={weightKg}
                onChange={e => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 65"
                style={{ fontSize: 15, padding: "12px 48px 12px 14px", width: "100%", fontWeight: 600 }}
              />
              <span style={{ position: "absolute", right: 14, color: "var(--muted)", fontWeight: 700, fontSize: 13, pointerEvents: "none" }}>
                kg
              </span>
            </div>
          </label>
        </div>

        {bmi && (
          <div style={{
            background: "#f0fdf4",
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 13,
            marginBottom: 16,
            border: "1px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--green-dark)", fontWeight: 600 }}>{t("calculatedBmi")}:</span>
              <strong style={{ fontSize: 15, color: "var(--green-dark)" }}>{bmi} kg/m²</strong>
            </div>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 6,
              background: Number(bmi) < 18.5 ? "#fef3c7" : Number(bmi) < 25 ? "#dcfce7" : Number(bmi) < 30 ? "#fef3c7" : "#fee2e2",
              color: Number(bmi) < 18.5 ? "#92400e" : Number(bmi) < 25 ? "#166534" : Number(bmi) < 30 ? "#92400e" : "#991b1b"
            }}>
              {Number(bmi) < 18.5 ? t("underweight") : Number(bmi) < 25 ? t("normalWeight") : Number(bmi) < 30 ? t("overweight") : t("obese")}
            </span>
          </div>
        )}

        {/* Chronic Conditions */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#283b34" }}>
            {t("chronicConditions")}
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {COMMON_CONDITIONS.map(cond => (
              <button
                key={cond}
                type="button"
                className={`chip-btn ${conditions.includes(cond) ? "active" : ""}`}
                onClick={() => toggleCondition(cond)}
              >
                {cond}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder={t("addOtherConditionPlaceholder")}
              value={customCond}
              onChange={e => setCustomCond(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomCondition(); } }}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13 }}
            />
            <button type="button" className="outline-btn" onClick={addCustomCondition} disabled={!customCond.trim()}>
              {t("add")}
            </button>
          </div>
        </div>

        {/* Allergies & Medications */}
        <label className="field" style={{ marginBottom: 12 }}>
          <span>{t("allergies")}</span>
          <input
            placeholder={t("allergiesPlaceholder")}
            value={allergyText}
            onChange={e => setAllergyText(e.target.value)}
          />
          <small className="muted">{t("safetyAlertsScannerHint")}</small>
        </label>

        <label className="field">
          <span>{t("regularMeds")}</span>
          <input
            placeholder={t("currentMedsPlaceholder")}
            value={medsText}
            onChange={e => setMedsText(e.target.value)}
          />
        </label>
      </div>

      {/* Emergency Contact Card */}
      <div className="card appointments" style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ color: "var(--green)", marginBottom: 6 }}>{t("emergencyContactEyebrow")}</div>
        <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>{t("primaryEmergencyContactTitle")}</h3>
        <div className="two-fields">
          <label className="field">
            <span>{t("emergencyContactName")}</span>
            <input
              value={emergencyName}
              onChange={e => setEmergencyName(e.target.value)}
              placeholder={t("emergencyContactNamePlaceholder")}
            />
          </label>
          <label className="field">
            <span>{t("relationship")}</span>
            <input
              value={emergencyRelation}
              onChange={e => setEmergencyRelation(e.target.value)}
              placeholder={t("emergencyRelationshipPlaceholder")}
            />
          </label>
        </div>
        <label className="field">
          <span>{t("emergencyContactPhone")}</span>
          <input
            type="tel"
            value={emergencyPhone}
            onChange={e => setEmergencyPhone(e.target.value)}
            placeholder={t("emergencyPhonePlaceholder")}
          />
        </label>
      </div>

      {/* Save Action */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <button className="primary-btn" onClick={handleSave} style={{ padding: "10px 24px" }}>
          <Check size={16} /> {t("saveProfileChanges")}
        </button>
      </div>

      {/* ABHA / Identity Verification */}
      <AccountVerificationPanel user={state.user} onVerificationComplete={onVerificationComplete} />

      <div className="privacy-banner" style={{ marginTop: 20 }}>
        <LockKeyhole size={20} />
        <div>
          <strong>{t("dpdpNoticeTitle")}</strong>
          <span>{t("dpdpNoticeBody")}</span>
        </div>
      </div>
    </div>
  );
}
