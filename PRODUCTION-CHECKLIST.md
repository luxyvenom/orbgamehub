# Production Deployment Checklist

> 배포 전 반드시 수정해야 하는 인증 우회 및 테스트 코드 목록 (총 12건)

---

## CRITICAL (반드시 수정)

### 1. 보호 페이지 인증 체크 복원
- **파일:** `src/app/(protected)/layout.tsx`
- **라인:** 12-15
- **현재:** 인증 리다이렉트 주석처리됨
- **수정:** 주석 해제
```tsx
// 현재 (테스트용)
// TODO: restore auth check after testing
// if (!session) {
//   redirect('/');
// }

// 수정 후
if (!session) {
  redirect('/');
}
```

### 2. PvP API 데모 모드 인증 우회 제거
- **파일:** `src/lib/pvp-auth.ts`
- **라인:** 29-40
- **현재:** `?demo=true` 파라미터로 모든 PvP API 인증 우회 가능
- **수정:** 데모 로직 전체 삭제, 세션 없으면 null 반환만 유지
```tsx
// 삭제할 부분 (29-40줄)
const url = new URL(req.url);
const isDemo = url.searchParams.get('demo') === 'true';
if (isDemo) {
  // ... 전체 삭제
}
```

### 3. PvP "Skip Payment (Demo)" 버튼 제거
- **파일:** `src/app/(protected)/play/eye-fighter/pvp/page.tsx`
- **위치:** Create 뷰 (343-349줄), Join 뷰 (644-660줄)
- **현재:** 결제 없이 방 생성/입장 가능
- **수정:** 버튼 2개 삭제 + `handleCreateDemo`, `handleJoinDemo` 함수 삭제 + `createRoom`/`joinRoom`의 `demo` 파라미터 삭제

### 4. AI 모드 "Skip Payment (Demo)" 버튼 제거
- **파일:** `src/app/(protected)/play/eye-fighter/ai/page.tsx`
- **라인:** 274-279
- **현재:** AI 대전 결제 없이 플레이 가능
- **수정:** 버튼 삭제

### 5. 자기 방 입장 제한 복원
- **파일:** `src/app/api/pvp/join-room/route.ts`
- **라인:** 27-31
- **현재:** 같은 유저가 자기 방에 입장 가능 (테스트용)
- **수정:** 주석 해제
```tsx
// 현재 (테스트용)
// if (room.p1_wallet === user.wallet) {
//   return NextResponse.json({ error: 'Cannot join your own room' }, { status: 400 });
// }

// 수정 후
if (room.p1_wallet === user.wallet) {
  return NextResponse.json({ error: 'Cannot join your own room' }, { status: 400 });
}
```

---

## HIGH (중요)

### 6-8. 강제 역할 지정 (forceRole) 제거
- **파일:**
  - `src/app/api/pvp/room-status/route.ts` (27-31줄)
  - `src/app/api/pvp/player-ready/route.ts` (30-32줄)
  - `src/app/api/pvp/report-blink/route.ts` (37-39줄)
- **현재:** `?role=p2` 파라미터로 역할 강제 지정 가능
- **수정:** `forceRole` 관련 로직 전체 삭제, 지갑 주소로만 역할 판별
```tsx
// 삭제 후 역할 판별
let myRole: PlayerRole;
if (room.p1_wallet === user.wallet) {
  myRole = 'p1';
} else if (room.p2_wallet === user.wallet) {
  myRole = 'p2';
} else {
  return NextResponse.json({ error: 'Not in this room' }, { status: 403 });
}
```

### 9. usePvpRoom 훅 테스트 파라미터 제거
- **파일:** `src/hooks/usePvpRoom.ts`
- **라인:** 17-39
- **현재:** `forceRole`, `isDemo`, `demoId` 파라미터를 모든 API 호출에 전달
- **수정:** 파라미터 삭제, `usePvpRoom(roomId)` 시그니처로 변경, `buildParams`에서 demo/role 로직 제거

### 10. 게임 페이지 테스트 파라미터 제거
- **파일:** `src/app/(protected)/play/eye-fighter/pvp/[roomId]/page.tsx`
- **라인:** 28-32
- **현재:** URL에서 `demo`, `demoId`, `role` 읽어서 훅에 전달
- **수정:** 삭제 후 `usePvpRoom(roomId)`만 호출

### 11. 결제 검증 데모 우회 제거
- **파일:** `src/app/api/confirm-payment/route.ts`
- **라인:** 22-25
- **현재:** `DEV_PORTAL_API_KEY` 없으면 결제 검증 자동 통과
- **수정:** 에러 반환으로 변경
```tsx
// 현재 (테스트용)
if (!process.env.DEV_PORTAL_API_KEY) {
  return NextResponse.json({ success: true, demo: true });
}

// 수정 후
if (!process.env.DEV_PORTAL_API_KEY) {
  return NextResponse.json({ error: 'Payment verification not configured' }, { status: 500 });
}
```

### 12. 결제 시작 API 인증 추가
- **파일:** `src/app/api/initiate-payment/route.ts`
- **현재:** 인증 체크 없음, 결제 ID DB 저장 미구현
- **수정:** `auth()` 체크 추가 + 결제 ID를 DB에 저장하여 검증

---

## 일괄 검색 키워드

코드에서 아래 키워드를 검색하면 테스트/데모 코드를 찾을 수 있습니다:

| 키워드 | 용도 |
|--------|------|
| `// TODO` | 임시 코드 표시 |
| `demo` | 데모 모드 관련 |
| `forceRole` | 테스트 역할 강제 |
| `Skip Payment` | 결제 우회 버튼 |
| `demoId` | 데모 사용자 식별 |
| `isDemo` | 데모 모드 플래그 |

---

## 환경 변수 확인

배포 전 아래 환경 변수가 설정되어 있는지 확인:

| 변수 | 용도 | 필수 |
|------|------|------|
| `NEXTAUTH_SECRET` | JWT 세션 암호화 | 필수 |
| `NEXTAUTH_URL` | 앱 URL | 필수 |
| `HMAC_SECRET_KEY` | Nonce 서명 검증 | 필수 |
| `DEV_PORTAL_API_KEY` | 결제 검증 API 키 | 필수 |
| `UPSTASH_REDIS_REST_URL` | Redis 연결 | 필수 |
| `UPSTASH_REDIS_REST_TOKEN` | Redis 인증 | 필수 |
