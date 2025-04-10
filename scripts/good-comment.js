const params = new URLSearchParams(window.location.search);
const title = decodeURIComponent(params.get("title") || "제목 없음");

document.getElementById("videoTitle").textContent = title;

// ====== 알림 표시 함수 ======
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

// ====== 복사 버튼 클릭 시 ======
document.getElementById("copyBtn").addEventListener("click", () => {
  const text = document.getElementById("recommendComment").textContent;

  navigator.clipboard
    .writeText(text)
    .then(() => showAlert("복사되었습니다!"))
    .catch((err) => {
      showAlert("복사 실패 😢");
      console.error(err);
    });
});

// ====== 추천 요청 버튼 클릭 시 ======
document.getElementById("submitBtn").addEventListener("click", () => {
  const userComment = document.getElementById("commentInput").value;
  if (!userComment.trim()) return showAlert("댓글을 입력해주세요!");

  showAlert("추천 중입니다...");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => document.title,
      },
      async (results) => {
        const title = results[0]?.result || "제목 없음";
        document.getElementById("videoTitle").textContent = title;

        try {
          const res = await fetch("https://safe-comment-server-geminai.vercel.app/api/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, userComment }),
          });

          if (!res.ok) throw new Error(`API 오류: ${res.status}`);

          const data = await res.json();
          document.getElementById("recommendComment").textContent =
            data.recommendComment || "추천 결과 없음";
          showAlert("추천 완료!");
        } catch (error) {
          console.error("Gemini API 호출 실패:", error);
          showAlert("추천에 실패했습니다.");
          document.getElementById("recommendComment").textContent = "추천 실패. 다시 시도해주세요.";
        }
      }
    );
  });
});
