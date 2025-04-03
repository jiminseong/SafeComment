const params = new URLSearchParams(window.location.search);
const page = params.get("page");

if (page === "comment-report") {
  setTimeout(() => {
    window.location.href = "../pages/comment-report.html";
  }, 3000);
}

if (page === "good-comment") {
  setTimeout(() => {
    window.location.href = "../pages/good-comment.html";
  }, 3000);
}
