/**
 * 여러 줄로 저장된 글을 문단 배열로 나눈다.
 * 첫 문단은 화면에서 결론처럼 강조하므로, 순서를 유지한 채 빈 줄만 걷어낸다.
 */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}
