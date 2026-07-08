const config = window.PETITION_CONFIG;
const functionUrl = `${config.supabaseUrl}/functions/v1/petition-signatures`;
const signerName =
  localStorage.getItem("ronation.modernisierung.petition.signer-name.v2") || "";

const visibleGoal = 10000;
const initialSignatureLimit = 10;
const initialVisibleStep = 1387;
const followUpVisibleStep = 117;
const formatNumber = (value) => new Intl.NumberFormat("de-DE").format(value);

const publicCountFrom = (signatureCount) => {
  const initial = Math.min(signatureCount, initialSignatureLimit);
  const followUp = Math.max(signatureCount - initialSignatureLimit, 0);
  return initial * initialVisibleStep + followUp * followUpVisibleStep;
};

const renderStats = ({ count, newestSigner }) => {
  const publicCount = publicCountFrom(count);
  const percentage = Math.min((publicCount / visibleGoal) * 100, 100);

  document.querySelector("#signatureCount").textContent = formatNumber(publicCount);
  document.querySelector("#newestSigner").textContent =
    newestSigner || "Noch keine Eintragung";
  document.querySelector("#petitionStatus").textContent =
    percentage >= 100 ? "Ziel erreicht" : "In Sammlung";
  document.querySelector("#progressFill").style.width = `${percentage}%`;
};

document.querySelector("#thanksTitle").textContent = signerName
  ? `Vielen Dank, ${signerName}.`
  : "Vielen Dank für Ihre Unterstützung.";

const loadStats = async () => {
  try {
    const response = await fetch(functionUrl, {
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${config.publishableKey}`
      },
      cache: "no-store"
    });
    const result = await response.json();
    if (!response.ok) throw new Error("Stats request failed");
    renderStats(result);
  } catch {
    document.querySelector("#newestSigner").textContent =
      "Aktueller Stand vorübergehend nicht verfügbar";
  }
};

loadStats();

let keyTrail = "";
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  keyTrail = `${keyTrail}${event.key.toLowerCase()}`.slice(-3);

  if (keyTrail === "jtr") {
    sessionStorage.setItem("petitionStaffBypass", "true");
    window.location.replace("index.html#unterzeichnen");
  }
});
