/// 환경변수의 허용 도메인 목록을 정리한다.
/// 브라우저가 보내는 Origin 에는 끝 슬래시가 없으므로, 붙어 있으면 떼어낸다.
export function parseOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}
