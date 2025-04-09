const URL = "https://safecomment.web.app/signInWithPopup.html"; // Firebase 인증용 웹사이트

const iframe = document.createElement("iframe");
iframe.src = URL;
iframe.style.display = "none";
document.documentElement.appendChild(iframe);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== "offscreen") return false;

  function handleIframeMessage({ data }) {
    if (typeof data === "string" && data.startsWith("!_{")) return;
    try {
      const parsed = JSON.parse(data);
      window.removeEventListener("message", handleIframeMessage);
      sendResponse(parsed);
    } catch (e) {
      console.error("JSON parse error", e);
    }
  }

  window.addEventListener("message", handleIframeMessage, false);
  iframe.contentWindow.postMessage({ initAuth: true }, new URL(URL).origin);
  return true;
});
