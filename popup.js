function isSupportedPlatform(url) {
  return url.includes("youtube.com");
  // || url.includes("instagram.com");
}

document.getElementById("btn-report").addEventListener("click", () => {
  moveToPageIfSupported("pages/comment-report.html");
});

document.getElementById("btn-good").addEventListener("click", () => {
  moveToPageIfSupported("pages/good-comment.html");
});

function showAlert(message) {
  const alertBox = document.getElementById("custom-alert2");
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
