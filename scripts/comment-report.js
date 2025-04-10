// 1. 유튜브만 지원
function isSupportedPlatform(url) {
  return url.includes("youtube.com");
}

// 2. 중앙 댓글 추출
function extractCommentFromPage(tab) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        const result = {
          comment: "댓글 없음",
          user: "작성자 없음",
          title: document.title,
        };

        const comments = Array.from(document.querySelectorAll("#content-text"));
        const users = Array.from(document.querySelectorAll("#author-text span"));
        const centerY = window.innerHeight / 2;
        let closest = null;
        let closestDistance = Infinity;
        let index = -1;

        comments.forEach((el, i) => {
          const rect = el.getBoundingClientRect();
          const elCenterY = rect.top + rect.height / 2;
          const distance = Math.abs(centerY - elCenterY);

          if (distance < closestDistance) {
            closest = el;
            closestDistance = distance;
            index = i;
          }
        });

        if (closest) {
          result.comment = closest.innerText.trim();
          result.user = users[index]?.innerText.trim() || "작성자 없음";

          closest.style.filter = "blur(5px)"; // 5px 정도의 blur 효과
        }

        return result;
      },
    },
    async (results) => {
      const data = results[0].result;
      const blurBox = document.getElementById("blur");
      blurBox.innerText = data.comment;

      // 댓글 정보 저장
      window.currentCommentData = data;
    }
  );
}

// 3. 현재 탭 가져와서 시작
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab) return;

  if (isSupportedPlatform(tab.url)) {
    extractCommentFromPage(tab);
  } else {
    document.getElementById("notYoutube").innerText = "지원하지 않는 플랫폼입니다.";
  }
});

// 4. 알림 함수
function showAlert(message) {
  const alertBox = document.getElementById("custom-alert2");
  if (!alertBox) return;
  alertBox.innerHTML = message;
  alertBox.style.display = "block";
  alertBox.style.opacity = "1";

  setTimeout(() => {
    alertBox.style.opacity = "0";
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 300);
  }, 2000);
}

// 5. 신고 맡기기 버튼 동작
document.getElementById("btn-report-comment").addEventListener("click", async () => {
  const userBadComment = document.getElementById("blur").textContent;
  if (!userBadComment) return showAlert("댓글을 다시 신고해주세요");

  const commentData = window.currentCommentData || {
    comment: userBadComment,
    user: "작성자 없음",
    title: title,
  };

  try {
    const res1 = await fetch("https://safe-comment-server.vercel.app/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, userBadComment }),
    });

    if (res1) {
      const data = await res1.json();
      if (data.result.trim() === "true") {
        const res2 = await fetch("https://safecomment-default-rtdb.firebaseio.com/reports.json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            ...commentData,
          }),
        });
        if (res2.ok) {
          showAlert("신고되었습니다!");
        } else {
          showAlert("신고에 실패했어요.");
        }
      } else if (data.result.trim() === "false") {
        showAlert("악플이 아니라고 판단했어요.");
      } else {
        showAlert("판단 결과를 알 수 없어요.");
      }
    }
  } catch (e) {
    console.error(e);
    showAlert("에러 발생!");
  }
});

document.getElementById("btn-good").addEventListener("click", () => {
  moveToPageIfSupported("../pages/good-comment.html");
});

function moveToPageIfSupported(targetPage) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0]?.url || "";
    if (isSupportedPlatform(currentUrl)) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => document.title,
        },
        (results) => {
          const title = encodeURIComponent(results[0]?.result || "제목 없음");
          window.location.href = `${targetPage}?title=${title}`;
        }
      );
    } else {
      showAlert("이 기능은 YouTube에서 <br/> 사용할 수 있어요.");
    }
  });
}

// ====== 위로 요청 버튼 클릭 시 ======
document.getElementById("submitBtn2").addEventListener("click", () => {
  const userBadComment = document.getElementById("blur").textContent;
  if (!userBadComment) return showAlert("댓글을 다시 신고해주세요");

  showAlert("기다려주세요!");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => document.title,
      },
      async (results) => {
        const title = results[0]?.result || "제목 없음";

        try {
          const res = await fetch("https://safe-comment-server.vercel.app/api/comfort", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, userBadComment }),
          });

          if (!res.ok) throw new Error(`API 오류: ${res.status}`);

          const data = await res.json();
          document.getElementById("comfortText").textContent =
            data.comfortText.trim() === "false"
              ? "악플이 아니에요 ㅎㅎ"
              : data.comfortText || "위로 결과 없음";

          showAlert("힘드셨죠😌");
        } catch (error) {
          console.error("Gemini API 호출 실패:", error);
          showAlert("추천에 실패했습니다.");
          document.getElementById("comfortText").textContent = "다시 시도해주세요.";
        }
      }
    );
  });
});
