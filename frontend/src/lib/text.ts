/**
 * contentEditable 로 편집한 글을 정리한다.
 *
 * 브라우저는 스페이스를 연속으로 누르면 줄바꿈 없는 공백(U+00A0)을 넣는다.
 * 이 문자는 좁은 화면에서도 줄이 나뉘지 않아 레이아웃을 밀어낸다.
 * 줄바꿈은 의미가 있으므로 그대로 두고, 가로 공백만 정리한다.
 */
export function normalizeEditedText(raw: string): string {
  return raw
    .replace(/ /g, ' ')
    .replace(/[ 	]+/g, ' ')
    .replace(/[ 	]+$/gm, '')
    .trim();
}
