document.addEventListener("DOMContentLoaded", async () => {
     lucide.createIcons();
     const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
     });

     try {
          const response = await fetch(
               "https://api-backend-576250219124.europe-west4.run.app/scan",
               {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: tab.url }),
               },
          );
          const data = await response.json();
          renderTacticalUI(data);
     } catch (error) {
          document.getElementById("loading-overlay").innerHTML =
               '<p class="mono-text" style="color:#f87171; font-weight:bold;">INTEL LINK OFFLINE</p>';
     }
});

function renderTacticalUI(data) {
     document.getElementById("loading-overlay").classList.add("hidden");

     const panel = document.getElementById("main-panel");
     const badge = document.getElementById("verdict-badge");
     const status = (data.veridicitate || "UNKNOWN").toLowerCase();

     // Resetare clase
     panel.className = "sitrep-container";
     badge.className = "badge-tactical";

     // Aplicare Logica Tematizare din React
     if (status.includes("fals") || status.includes("demontat")) {
          panel.classList.add("theme-fals");
          badge.classList.add("badge-fals");
     } else if (
          status.includes("parțial") ||
          status.includes("suspect") ||
          status.includes("neconfirmat")
     ) {
          panel.classList.add("theme-suspect");
          badge.classList.add("badge-suspect");
     } else if (status.includes("confirmat") || status.includes("adevărat")) {
          panel.classList.add("theme-adevarat");
          badge.classList.add("badge-adevarat");
     } else {
          panel.classList.add("theme-default");
          badge.classList.add("badge-default");
     }

     badge.innerText = (data.veridicitate || "UNKNOWN").toUpperCase();

     // Update Threat Score
     const toxicity = data.ai_verdict?.scor_toxicitate || 0;
     document.getElementById("toxicity-value").innerText = `${toxicity}%`;
     document
          .getElementById("toxicity-fill")
          .style.setProperty("--p", `${toxicity}%`);

     // Inserare Date
     document.getElementById("consensus-text").innerText =
          data.explicatie_consens || "No intelligence found.";
     document.getElementById("summary-text").innerText =
          data.ai_summary || "Propagation analysis incomplete.";
     document.getElementById("techniques-text").innerText =
          data.ai_verdict?.tehnici_manipulare || "None detected.";

     // Emotions Tags
     const tagsContainer = document.getElementById("emotions-tags");
     tagsContainer.innerHTML = "";
     (data.ai_verdict?.emotii_principale || []).forEach((emo) => {
          const span = document.createElement("span");
          span.className = "tag-red";
          span.innerText = emo.toUpperCase();
          tagsContainer.appendChild(span);
     });

     document.getElementById("btn-full-report").onclick = () => {
          chrome.tabs.create({
               // Înlocuiește cu URL-ul primit de la Vercel (ex: https://findout-site.vercel.app)
               url: `https://findout-gdg.vercel.app/dashboard?url=${encodeURIComponent(data.url)}`,
          });
     };

     lucide.createIcons();
}
