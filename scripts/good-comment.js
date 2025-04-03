const textarea = document.getElementById("autoResize");

textarea.addEventListener("input", () => {
  textarea.style.height = "23px";
  textarea.style.height = textarea.scrollHeight + "px";
});

//복사 버튼 클릭
document.getElementById("copyBtn").addEventListener("click", () => {
  console.log(1);
  const text = document.getElementById("recommend-comment").textContent;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      showAlert("복사되었습니다!");
    })
    .catch((err) => {
      showAlert("복사 실패 😢");
      console.error(err);
    });
});

function showAlert(message) {
  const alertBox = document.getElementById("custom-alert");
  alertBox.textContent = message;
  alertBox.style.display = "block";
  alertBox.style.opacity = "1";

  setTimeout(() => {
    alertBox.style.opacity = "0";
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 300);
  }, 1000);
}

// 유튜브에서 정보 추출
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "extractYoutubeInfo") {
      const title = document.querySelector("h1.title")?.innerText;
      const description = document.querySelector("#description")?.innerText;
      sendResponse({ title, description });
    }
  });
} else {
  console.error("chrome.runtime.onMessage를 사용할 수 없습니다.");
}

// 댓글 추천 받기 버튼 클릭
document.getElementById("submitBtn").addEventListener("click", () => {
  const userComment = document.getElementById("commentInput").value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "extractYoutubeInfo" }, async (response) => {
      const { title, description } = response;

      // 서버로 요청 보내기 예시
      const res = await fetch("https://your-server.com/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          userComment,
        }),
      });

      const data = await res.json();
      document.getElementById("recommendComment").textContent = data.recommendComment;
    });
  });
});
