const storeKeys = {
  signed: "ronation.modernisierung.petition.signed.v2",
  signerName: "ronation.modernisierung.petition.signer-name.v2"
};

const config = window.PETITION_CONFIG;
const functionUrl = `${config.supabaseUrl}/functions/v1/petition-signatures`;
const form = document.querySelector("#petitionForm");
const nameInput = document.querySelector("#rpName");
const addressInput = document.querySelector("#rpAddress");
const signButton = document.querySelector("#signButton");
const formMessage = document.querySelector("#formMessage");

let bypassActive = sessionStorage.getItem("petitionStaffBypass") === "true";
let keyTrail = "";
sessionStorage.removeItem("petitionStaffBypass");

const cleanText = (value) => value.trim().replace(/\s+/g, " ");
const hasSigned = () => localStorage.getItem(storeKeys.signed) === "true" && !bypassActive;
const isConfigured = () =>
  config &&
  !config.supabaseUrl.includes("YOUR_PROJECT_REF") &&
  !config.publishableKey.includes("YOUR_SUPABASE");

const setMessage = (message, type = "") => {
  formMessage.textContent = message;
  formMessage.className = `form-message${type ? ` is-${type}` : ""}`;
};

const goToResults = () => window.location.replace("danke.html");

if (hasSigned()) {
  goToResults();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (hasSigned()) {
    goToResults();
    return;
  }

  const name = cleanText(nameInput.value);
  const address = cleanText(addressInput.value);

  if (!name) {
    setMessage("Bitte tragen Sie Ihren Roleplay-Namen ein.", "error");
    nameInput.focus();
    return;
  }

  if (!isConfigured()) {
    setMessage("Die Petitionsdatenbank ist noch nicht eingerichtet.", "error");
    return;
  }

  signButton.disabled = true;
  signButton.textContent = "Unterschrift wird eingetragen …";
  setMessage("");

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${config.publishableKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, address })
    });
    const result = await response.json();

    if (!response.ok) {
      const messages = {
        duplicate_name: "Dieser Roleplay-Name hat bereits unterschrieben.",
        duplicate_ip: "Sie haben diese Petition bereits unterschrieben.",
        invalid_name: "Bitte tragen Sie einen gültigen Roleplay-Namen ein.",
        invalid_address: "Die In-Universe-Adresse ist zu lang."
      };
      setMessage(messages[result.code] || "Die Unterschrift konnte nicht eingetragen werden.", "error");
      return;
    }

    localStorage.setItem(storeKeys.signed, "true");
    localStorage.setItem(storeKeys.signerName, name);
    goToResults();
  } catch {
    setMessage("Die Petitionsdatenbank ist momentan nicht erreichbar. Bitte versuchen Sie es erneut.", "error");
  } finally {
    signButton.disabled = false;
    signButton.textContent = "Petition unterzeichnen";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  keyTrail = `${keyTrail}${event.key.toLowerCase()}`.slice(-3);

  if (keyTrail === "jtr") {
    bypassActive = true;
    setMessage("Eingabe freigegeben.", "success");
  }
});
