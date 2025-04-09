// 1. YouTube URL 체크
function isSupportedPlatform(url) {
  return url.includes("youtube.com");
}

// 2. 현재 탭에 content script 삽입하고 댓글 수집
function extractCommentFromPage(tab) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        let commentText = "화면에서 댓글을 찾을 수 없어요.";

        // 모든 유튜브 댓글 DOM 요소
        const comments = Array.from(document.querySelectorAll("#content-text"));

        if (comments.length === 0) return commentText;

        const centerY = window.innerHeight / 2;

        let closest = null;
        let closestDistance = Infinity;

        comments.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const elCenterY = rect.top + rect.height / 2;
          const distance = Math.abs(centerY - elCenterY);

          if (distance < closestDistance) {
            closest = el;
            closestDistance = distance;
          }
        });

        if (closest) {
          commentText = closest.innerText.trim();
        }

        return commentText;
      },
    },
    (injectionResults) => {
      if (chrome.runtime.lastError) {
        console.error("Script injection failed:", chrome.runtime.lastError.message);
        document.getElementById("blur").innerText = "댓글을 불러오지 못했어요.";
        return;
      }

      const comment = injectionResults[0].result;
      document.getElementById("blur").innerText = comment;
    }
  );
}

// 3. 현재 탭 가져와서 처리 시작
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab) return;

  if (isSupportedPlatform(tab.url)) {
    extractCommentFromPage(tab);
  } else {
    document.getElementById("notYoutube").innerText = "지원하지 않는 플랫폼";
  }
});
