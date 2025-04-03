const article = document.querySelector("article");

// `document.querySelector`는 선택자에 일치하는 요소가 없을 경우 null을 반환할 수 있습니다.
if (article) {
  const text = article.textContent;
  const wordMatchRegExp = /[^\s]+/g; // 정규 표현식
  const words = text.matchAll(wordMatchRegExp);
  // matchAll은 반복자를 반환하므로, 배열로 변환해서 단어 수를 구합니다.
  const wordCount = [...words].length;
  const readingTime = Math.round(wordCount / 200); // 평균 1분에 200단어 기준으로 읽는 시간 계산
  const badge = document.createElement("p");
  // 기사 헤더의 게시 정보와 동일한 스타일을 사용합니다.
  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏱️ ${readingTime} min read`;

  // API 레퍼런스 문서를 지원합니다.
  const heading = article.querySelector("h1");
  // 날짜가 포함된 기사 문서도 지원합니다.
  const date = article.querySelector("time")?.parentNode;

  (date ?? heading).insertAdjacentElement("afterend", badge);
}
