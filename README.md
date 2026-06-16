# LIFF 예약 앱

LINE LIFF 기반 병원 예약 시스템 프론트엔드입니다.

## 프로젝트 구조

```
src/
├── types/
│   └── index.ts              # 전역 타입 정의
├── hooks/
│   └── useLiff.ts            # LIFF 초기화 훅
├── utils/
│   ├── api.ts                # Axios API 클라이언트
│   └── format.ts             # 날짜·가격 등 포맷 유틸
├── components/
│   └── ui.tsx                # 공통 UI 컴포넌트
├── pages/
│   ├── LoginPage.tsx         # 화면 1: LINE 로그인
│   ├── ProfilePage.tsx       # 화면 2: 기본 정보 입력 (최초 1회)
│   ├── SelectTreatmentPage.tsx # 화면 3: 지점·시술 선택
│   ├── SelectDatetimePage.tsx  # 화면 4: 날짜·시간 선택
│   ├── ConfirmPage.tsx       # 화면 5: 예약 확인·제출
│   ├── CompletePage.tsx      # 화면 6: 접수 완료
│   └── ReservationHistoryPage.tsx # 예약 내역
├── App.tsx                   # 전체 흐름 라우팅
├── main.tsx                  # 진입점
└── index.css                 # 전역 스타일
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 아래 값을 입력합니다:

```
VITE_LIFF_ID=<LINE Developers Console에서 발급받은 LIFF ID>
VITE_API_BASE_URL=<백엔드 API 서버 주소>
```

### 3. LIFF 앱 등록 (LINE Developers Console)

1. [LINE Developers Console](https://developers.line.biz/) 접속
2. Provider 생성 (또는 기존 Provider 선택)
3. LINE Login 채널 생성
4. LIFF 탭 → LIFF 앱 추가
5. Size: `Full` 선택
6. Endpoint URL: 개발 시 ngrok 주소, 배포 시 실제 도메인 입력
7. Scope: `profile`, `openid` 체크
8. 발급된 LIFF ID를 `.env`의 `VITE_LIFF_ID`에 입력

### 4. 개발 서버 실행

```bash
npm run dev
```

> LIFF는 HTTPS 환경에서만 동작합니다.
> 로컬 개발 시 [ngrok](https://ngrok.com/)을 활용해 HTTPS URL을 생성하세요.
>
> ```bash
> ngrok http 3000
> # 발급된 https://xxxx.ngrok.io URL을 LIFF Endpoint URL에 등록
> ```

### 5. 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

## 배포

Vercel, Netlify, AWS S3+CloudFront 등 정적 호스팅 서비스에 배포합니다.
배포 후 LINE Developers Console의 LIFF Endpoint URL을 실제 도메인으로 업데이트하세요.

## API 연동

`src/utils/api.ts`에서 백엔드 API 엔드포인트를 확인할 수 있습니다.

| 엔드포인트 | 설명 |
|---|---|
| `GET /customers/me` | 내 프로필 조회 |
| `POST /customers/me` | 최초 프로필 등록 |
| `GET /branches` | 지점 목록 |
| `GET /branches/:id/treatments` | 지점별 시술 목록 |
| `GET /reservations/available-dates` | 예약 가능 날짜 조회 |
| `GET /reservations/available-slots` | 시간 슬롯 조회 |
| `POST /reservations` | 예약 신청 |
| `GET /reservations/me` | 내 예약 목록 |
| `PATCH /reservations/:id/cancel` | 예약 취소 |

모든 API 요청에는 LIFF `accessToken`이 `Authorization: Bearer <token>` 헤더로 자동 첨부됩니다.
백엔드에서는 이 토큰으로 LINE API에 사용자 정보를 검증해야 합니다.

## 기술 스택

- React 18
- TypeScript
- Vite
- LINE LIFF SDK 2.25
- Axios
