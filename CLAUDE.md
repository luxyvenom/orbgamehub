# CLAUDE.md - OrbGameHub (오브게임허브)

## 프로젝트 위치
`C:/Users/Lenovo/world26/orbgamehub/`

## 프로젝트 개요

**OrbGameHub** - World Mini App 기반 AI 눈싸움(Eye Staring Contest) PvP 베팅 게임
- 카메라 기반 눈 깜빡임 감지 + WLD 베팅
- World ID가 **핵심 전제** — 없으면 게임이 성립하지 않음
- MiniKit 5대 기능: WalletAuth, Verify, Pay, SendTransaction, Notification

### 왜 World ID가 필수인가 (심사 30점)
```
문제: 온라인 베팅 게임에서 봇/다중 계정이 시스템을 악용
→ World ID Proof of Personhood = 1인 1계정
→ 봇이 카메라 앞에서 눈싸움을 할 수 없음 (생체 + 신원 이중 검증)
→ World ID 없이는 공정한 베팅 게임 불가
```

---

## 현재 프로젝트 구조 (빌드 완료)

```
orbgamehub/
├── src/
│   ├── app/
│   │   ├── layout.tsx                         # MiniKitProvider + SessionProvider
│   │   ├── page.tsx                           # 로그인 페이지 (AuthButton)
│   │   ├── globals.css                        # Tailwind CSS
│   │   ├── (protected)/
│   │   │   ├── layout.tsx                     # 인증 체크 + Navigation
│   │   │   ├── home/
│   │   │   │   └── page.tsx                   # 게임 허브 (GameHub 컴포넌트)
│   │   │   ├── play/
│   │   │   │   └── eye-fighter/
│   │   │   │       ├── page.tsx               # 모드 선택 (AI / PvP)
│   │   │   │       ├── ai/
│   │   │   │       │   └── page.tsx           # AI 대전 모드
│   │   │   │       └── pvp/
│   │   │   │           ├── page.tsx           # PvP 로비 (Create/Join)
│   │   │   │           └── [roomId]/
│   │   │   │               └── page.tsx       # PvP 게임 방
│   │   │   ├── games/
│   │   │   │   └── page.tsx                   # 게임 목록
│   │   │   ├── profile/
│   │   │   │   └── page.tsx                   # 프로필
│   │   │   └── wallet/
│   │   │       └── page.tsx                   # 지갑
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts    # NextAuth SIWE 핸들러
│   │       ├── verify-proof/route.ts          # World ID 증명 검증
│   │       ├── initiate-payment/route.ts      # 결제 UUID 생성
│   │       ├── confirm-payment/route.ts       # 결제 서버사이드 확인
│   │       ├── send-notification/route.ts     # 결과 알림 전송
│   │       └── pvp/
│   │           ├── create-room/route.ts       # PvP 방 생성
│   │           ├── join-room/route.ts         # PvP 방 입장
│   │           ├── room-status/route.ts       # 방 상태 조회
│   │           ├── player-ready/route.ts      # 준비 완료
│   │           ├── report-blink/route.ts      # 깜빡임 보고
│   │           └── report-disconnect/route.ts # 연결 해제
│   ├── auth/
│   │   ├── index.ts                           # NextAuth 설정 (SIWE 기반)
│   │   └── wallet/
│   │       ├── index.ts                       # walletAuth() 함수
│   │       ├── client-helpers.ts              # HMAC nonce 해싱
│   │       └── server-helpers.ts              # nonce 생성
│   ├── components/
│   │   ├── AuthButton/index.tsx               # 자동 로그인 버튼
│   │   ├── EyeFighter/                        # Eye Fighter 공유 컴포넌트
│   │   ├── GameHub/index.tsx                  # 게임 허브 메인 UI
│   │   ├── Navigation/index.tsx               # 하단 탭 네비게이션
│   │   ├── PageLayout/index.tsx               # Page 레이아웃 컴포넌트
│   │   ├── Pay/index.tsx                      # Pay 예제 컴포넌트
│   │   ├── Transaction/index.tsx              # Transaction 예제 컴포넌트
│   │   ├── UserInfo/index.tsx                 # 사용자 정보 표시
│   │   ├── Verify/index.tsx                   # World ID 인증 버튼
│   │   └── ViewPermissions/index.tsx          # 권한 확인
│   ├── hooks/
│   │   ├── useEyeDetection.ts                 # 눈 깜빡임 감지 엔진
│   │   └── usePvpRoom.ts                      # PvP 방 상태 훅
│   ├── lib/
│   │   ├── constants.ts                       # APP_ID, 베팅 옵션, AI 설정
│   │   ├── pvp-types.ts                       # PvP 타입 정의
│   │   ├── pvp-auth.ts                        # PvP 인증 헬퍼
│   │   └── redis.ts                           # Upstash Redis 클라이언트
│   ├── providers/
│   │   ├── index.tsx                          # ErudaProvider + MiniKitProvider + SessionProvider
│   │   └── Eruda/                             # 디버그 콘솔
│   └── abi/
│       └── TestContract.json                  # 테스트 컨트랙트 ABI
├── .env.local                                 # 환경변수
├── middleware.ts                               # NextAuth 미들웨어
├── PRODUCTION-CHECKLIST.md                    # 배포 전 체크리스트
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 인증 | NextAuth 5 + SIWE (Sign-In With Ethereum) |
| World 연동 | @worldcoin/minikit-js + @worldcoin/minikit-react |
| UI 키트 | @worldcoin/mini-apps-ui-kit-react |
| 눈 감지 | @mediapipe/tasks-vision (FaceLandmarker) |
| 스타일링 | Tailwind CSS 4 |
| PvP 서버 | Upstash Redis (polling-based sync, 300ms) |
| 체인 | World Chain (viem) |
| 아이콘 | iconoir-react |

---

## 핵심 파일 설명

### 1. `/src/hooks/useEyeDetection.ts` — 눈 감지 엔진
- MediaPipe FaceLandmarker로 실시간 얼굴 랜드마크 감지
- EAR (Eye Aspect Ratio) 계산으로 눈 감김 판정
- LEFT_EYE: [362, 385, 387, 263, 373, 380]
- RIGHT_EYE: [33, 160, 158, 133, 153, 144]
- EAR < 0.19 → 눈 감음, 2프레임 연속 → 깜빡임 확정
- 반환: { isReady, isBlinking, blinkCount, ear, faceDetected, error, resetBlinks }

### 2. `/src/app/(protected)/play/eye-fighter/ai/page.tsx` — AI 대전
- 6단계 게임 플로우: verify → bet → ready → countdown → playing → result
- World ID 인증 (Orb 레벨)
- WLD Pay 베팅 (0.01 WLD)
- 카메라 눈 깜빡임 감지 vs AI 랜덤 타이머
- WIN_MULTIPLIER: 1.8x

### 3. PvP 시스템
- 6자리 숫자 룸코드 생성
- Upstash Redis로 방 상태 관리
- 300ms 폴링 기반 실시간 동기화
- PVP_BET_AMOUNT: 1.0 WLD, PVP_WIN_AMOUNT: 1.8 WLD
- sendBeacon으로 연결 해제 감지

### 4. API Routes
- `/api/verify-proof`: verifyCloudProof()로 World ID 증명 검증
- `/api/initiate-payment`: UUID 생성 (결제 참조)
- `/api/confirm-payment`: Developer Portal API로 결제 확인
- `/api/send-notification`: 게임 결과 푸시 알림
- `/api/pvp/*`: PvP 방 생성/입장/상태/준비/깜빡임/연결해제

---

## 게임 로직

```
AI 모드:
  AI 상대: 5~15초 랜덤 후 "깜빡임"
  플레이어 먼저 깜빡임 → 패배 (베팅금 손실)
  AI 먼저 깜빡임 → 승리 (1.8x 배당)
  20초 이상 → 무승부 (반환)

PvP 모드:
  두 플레이어 모두 Ready → 3초 카운트다운 → 게임 시작
  먼저 깜빡인 플레이어 패배
  최대 120초 → 무승부
  연결 해제 15초 타임아웃 → 상대방 승리
```

---

## 환경 변수 (.env.local)

```env
AUTH_SECRET=""                    # npx auth secret으로 생성
HMAC_SECRET_KEY='some-secret'     # openssl rand -base64 32
AUTH_URL=''                       # NGROK URL (개발) or 프로덕션 URL
NEXT_PUBLIC_APP_ID='app_xxx'      # Developer Portal App ID
DEV_PORTAL_API_KEY='xxx'          # Developer Portal API Key
NEXT_PUBLIC_GAME_WALLET='0x...'   # 베팅금 수신 주소
UPSTASH_REDIS_REST_URL=''         # Upstash Redis URL
UPSTASH_REDIS_REST_TOKEN=''       # Upstash Redis Token
```

---

## 개발 커맨드

```bash
cd C:/Users/Lenovo/world26/orbgamehub
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm run lint    # ESLint
```

---

## 심사 대응 전략

| 항목 (100점) | 배점 | 대응 |
|-------------|------|------|
| Problem & Human-Only Fit | 30 | 봇 베팅 방지 = World ID 필수 + 카메라 생체 이중검증 |
| Privacy-by-Design | 20 | ZKP nullifier_hash, 카메라 로컬 처리, 개인정보 수집 zero |
| Technical Execution | 20 | 실제 동작 데모, nonce 리플레이 방지, 서버사이드 검증 |
| Product Craft & UX | 15 | 로그인→인증→베팅→게임→결과 자연스러운 플로우 |
| Pitch & Impact | 15 | "봇 없는 공정 게임 허브" + 확장 가능한 플랫폼 |
