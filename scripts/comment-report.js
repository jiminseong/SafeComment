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
  const commentData = window.currentCommentData;
  if (!commentData) return showAlert("신고할 댓글이 없어요.");

  try {
    const res = await fetch("https://safecomment-default-rtdb.firebaseio.com/reports.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...commentData,
      }),
    });

    if (res.ok) {
      showAlert("신고되었습니다!");
    } else {
      showAlert("신고에 실패했어요.");
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
