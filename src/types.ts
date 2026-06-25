/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --------------------------------------------------
// Core Interfaces
// --------------------------------------------------

export interface Course {
  id: number;
  title: string;
  provider: string;
  level: "입문" | "중급" | "고급";
  category: "사회공헌" | "ESG 공시" | "지역혁신" | "종합" | "디지털 실무";
  tags: string[];
  duration: string;
  description: string;
  curriculum: string[];
  isHighlight?: boolean;
  link?: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  publishedAt: string;
  source: string;
  readTime: string;
  isFeatured?: boolean;
}

export interface Report {
  id: number;
  title: string;
  institution: string;
  tags: string[];
  category: "국내" | "국외";
  publishedYear: number;
  downloads: number;
  abstract: string;
  fileSize: string;
  link?: string;
}

export interface ResearchInsight {
  id: number;
  title: string;
  author: string;
  date: string; // YYYY.MM
  tag: "Deep Dive" | "Analysis" | "Field Report" | "Policy Paper" | "Investment";
  publisher: string;
  doi_or_id: string;
  abstract: string;
  link: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export interface PromptTemplate {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  placeholder: string;
  defaultPrompt: string;
}

// --------------------------------------------------
// Static Database Seeding / Mock Data (High Quality)
// --------------------------------------------------

export const SEED_COURSES: Course[] = [
  {
    id: 101,
    title: "[K-MOOC] 사회적 가치 아카데미 (종합 입문)",
    provider: "K-MOOC",
    level: "입문",
    category: "종합",
    tags: ["SV 측정", "사회공헌", "기본이론"],
    duration: "총 8주 (주당 2시간)",
    description: "사회적가치(Social Value)의 탄생 배경부터 개념 정립, 그리고 핵심 측정 방법론까지 포괄적으로 배울 수 있는 K-MOOC 종합 입문 과정입니다.",
    curriculum: [
      "1주차: 자본주의의 변화와 사회적 가치의 당위성",
      "2주차: CSES 사회적 가치 측정 가이드라인 정독",
      "3주차: 사회적 성과의 측정 및 화폐화 기초 공식",
      "4주차: 주요 이해관계자 분석 및 경제적 이익 연계"
    ],
    isHighlight: false,
    link: "http://www.kmooc.kr"
  },
  {
    id: 102,
    title: "[한국표준협회] ESG 정보공시 및 글로벌 지표 수립 실무",
    provider: "한국표준협회",
    level: "중급",
    category: "ESG 공시",
    tags: ["ESG", "공시 표준", "GRI / ISSB"],
    duration: "총 4주 (주당 4시간)",
    description: "한국표준협회가 제공하는 ISSB 및 GRI 글로벌 가이드라인을 기반으로 기업의 환경, 사회, 지배구조 데이터를 체계적으로 수집하고 정량 공시하는 고품질 실무 특화 과정입니다.",
    curriculum: [
      "1주차: 글로벌 ESG 공시 의무화 동향 분석",
      "2주차: 중요성 평가(Double Materiality) 방법론 및 실무 실습",
      "3주차: Scope 3 탄소 배출공식 및 공급망 임팩트 측정",
      "4주차: 감사 대응을 위한 고보증 ESG 보고서 최종 구성법"
    ],
    isHighlight: false,
    link: "https://www.oksa.or.kr"
  },
  {
    id: 103,
    title: "[부스트코스] ChatGPT 프롬프트 엔지니어링 실무 및 업무 자동화",
    provider: "부스트코스",
    level: "고급",
    category: "디지털 실무",
    tags: ["AI 프롬프트", "데이터 기획", "Gemini 융합"],
    duration: "총 3주 (주당 6시간)",
    description: "부스트코스에서 제공하는 AI 프롬프트 응용 과정으로, 생성형 AI와 Large Language Model을 활용하여 연구 및 행정 자동화 워크플로우를 완벽 구축합니다.",
    curriculum: [
      "1주차: 생성형 AI 기본 모델과 프롬프트 패턴 매칭 연구",
      "2주차: RAG를 활용한 SV 성과 논문 통합 요약 대행 설계",
      "3주차: 프롬프트 인젝션 방지 및 고신뢰성 에이전트 워크플로우 테스트"
    ],
    isHighlight: false,
    link: "https://www.boostcourse.org"
  },
  {
    id: 104,
    title: "[K-MOOC] 사회적 혁신가 온보딩 코스",
    provider: "K-MOOC",
    level: "입문",
    category: "사회공헌",
    tags: ["혁신 모델", "임팩트 투자", "소셜 비즈니스"],
    duration: "단기 2일 마스터",
    description: "K-MOOC과 사회적 기업들이 엄선한 체인지메이커 입문 과정으로, 사회 문제를 비즈니스 모델을 선도하여 해결하려는 차세대 소셜 벤처 리더들을 위한 스타터 패키지 강의입니다.",
    curriculum: [
      "1주차: 사회 혁신의 메커니즘과 성공적 비즈니스 케이스 스터디",
      "2주차: 린 소셜 캔버스를 통한 가설 검증과 시제품 구상"
    ],
    isHighlight: false,
    link: "http://www.kmooc.kr"
  },
  {
    id: 105,
    title: "[한국표준협회] 지역 소멸 방지 및 로컬 펀딩 대안 모델링",
    provider: "한국표준협회",
    level: "중급",
    category: "지역혁신",
    tags: ["지역 활성화", "인구통계", "SROI 측정"],
    duration: "총 6주 (주당 3시간)",
    description: "한국표준협회 로컬 혁신 전용 과정으로, 인구 감소와 소멸 위기에 놓인 지자체의 데이터를 분석하고 SROI(사회적 투자수익률) 시각화 대안을 제공합니다.",
    curriculum: [
      "1주차: 대한민국 로컬 위기 인구통계 지리정보시스템 입문",
      "2주차: 고향사랑기부제와 로컬 기금 사업의 SV 산식 설계",
      "3주차: 지역혁신 거점 비즈니스의 장기 사회적 성과 시계열 분석"
    ],
    isHighlight: false,
    link: "https://www.oksa.or.kr"
  },
  {
    id: 106,
    title: "[K-MOOC] 글로벌 사회공헌 트렌드 & Net zero 세미나",
    provider: "K-MOOC",
    level: "고급",
    category: "사회공헌",
    tags: ["탄소중립", "SDGs", "글로벌 동향"],
    duration: "총 5주 (주당 4시간)",
    description: "K-MOOC 명품 강좌 중 하나로, 글로벌 기업들이 구사하는 대규모 기후 및 생물다양성 공헌 프로젝트와 넷제로 로드맵 연계형 SV 관리 기법을 깊이 있게 다룹니다.",
    curriculum: [
      "1주차: 과학기반감축목표 이니셔티브(SBTi) 넷제로 동향 요약",
      "2주차: 개발도상국 현지 사회공헌의 UN SDGs 기여도 계량 평가",
      "3주차: 생물다양성 손실(Nature Positive) 화폐 가치를 산출하는 혁신 프레임워크"
    ],
    isHighlight: false,
    link: "http://www.kmooc.kr"
  },
  {
    id: 107,
    title: "[부스트코스] SV 데이터 기반 보고서 자동화 및 데이터 시각화 워크숍",
    provider: "부스트코스",
    level: "중급",
    category: "디지털 실무",
    tags: ["SV 데이터", "보고서 자동화", "데이터 시각화", "실습 워크숍"],
    duration: "총 1일 집중 (8시간 오프라인 실습, 노트북 지참)",
    description: "부스트코스의 대표적인 실무 자동화 워크숍으로, 연구원들의 실제 데이터를 활용하여 AI 기반 보고서를 작성하고 시각화 차트를 만드는 실전형 특화 교육입니다.",
    curriculum: [
      "오전: 생성형 AI를 통한 정성/정량 사회성과 보고서 초안 골자 생성",
      "오후 1: 파이썬 및 BI 도구를 활용한 데이터 시각화 차트 자동 매핑",
      "오후 2: 개인별 실제 데이터 적용 워크숍 및 1대1 코칭 피드백"
    ],
    isHighlight: true,
    link: "https://www.boostcourse.org"
  },
  {
    id: 108,
    title: "[부스트코스] SPC/DBL 성과 예측을 위한 실전 파이썬 코딩 입문",
    provider: "부스트코스",
    level: "입문",
    category: "디지털 실무",
    tags: ["SPC 예측", "DBL 시뮬레이션", "파이썬 입문", "코딩 헬프데스크"],
    duration: "총 4주 (주당 3시간, 오프라인 해커톤 포함)",
    description: "어려운 수학 이론 없이 부스트코스만의 친절한 인터랙티브 환경을 통해 SPC/DBL 성과 예측 데이터를 파이썬 코드로 손쉽게 시뮬레이션해보는 입문 강좌입니다.",
    curriculum: [
      "1주차: 파이썬 기초 및 데이터 다루기 (Pandas, Numpy)",
      "2주차: SPC 사회적 가치 측정 가이드라인 공식 수식 코딩화",
      "3주차: 시나리오별 DBL 성과 시뮬레이션 모델 구현 및 검증",
      "4주차: 문제 해결형 해커톤 - 실제 원내 데이터를 활용한 성과 예측"
    ],
    isHighlight: true,
    link: "https://www.boostcourse.org"
  },
  {
    id: 109,
    title: "[한국표준협회] Custom GPTs 내부 연구 데이터를 학습한 맞춤형 AI 챗봇 제작",
    provider: "한국표준협회",
    level: "고급",
    category: "디지털 실무",
    tags: ["Custom GPTs", "연구원 맞춤형", "RAG 에이전트", "보안 가이드라인"],
    duration: "총 2주 (실습 중심 온/오프라인 병행)",
    description: "한국표준협회 전문 강사진의 지도 아래 내부 연구 데이터 및 보안 가이드라인을 철저히 준수하면서 연구 실무용 Custom AI 에이전트를 제작해 보는 최정예 과정입니다.",
    curriculum: [
      "1주차: OpenAI GPTs 및 Custom GPTs 아키텍처 및 설정 방법론",
      "2주차: CSES 내부 보고서 PDF/CSV 데이터를 임베딩하여 프라이빗 RAG 구현",
      "3주차: 정보 유출 방지를 위한 기업용 보안 가이드라인 검증 및 실전 배포"
    ],
    isHighlight: true,
    link: "https://www.oksa.or.kr"
  }
];

export const SEED_NEWS: NewsArticle[] = [
  {
    id: 1001,
    title: "젠슨 황 \"HBM 더 달라\" 요청하더니...삼성전자 고용량 HBM 공급 극대화",
    description: "올해 HBM 공급망에 핵심 대응책이 나왔다. 주요 거래선 대응이 핵심으로, SK하이닉스는 지난 18일 HBM3E 공급을 본격 확대한 것에 이어 삼성전자도 차세대 HBM 공급 가속화...",
    content: "최근 엔비디아의 젠슨 황 CEO가 국내 반도체 제조사들에 HBM(고대역폭메모리) 공급을 대폭 늘려줄 것을 요청함에 따라, 삼성전자와 SK하이닉스가 공급 극대화에 적극 나서고 있습니다. 업계 소식통에 따르면, 삼성전자는 HBM3E 8단 및 12단 제품의 품질 검증을 통과하는 대로 엔비디아 공급망에 본격 진입할 예정이며, 올해 하반기 양산 규모를 연초 계획 대비 2배 이상 상향 조정하는 기동성을 발휘하고 있습니다.",
    category: "기술",
    publishedAt: "2026-06-23",
    source: "반도체 테크리뷰",
    readTime: "3분",
    isFeatured: true
  },
  {
    id: 1002,
    title: "[티조Q&A] 삼성·SK, 반도체 호황에도 고용 감소 원인은 무엇인가",
    description: "4대 그룹의 고용 위축이 곧 국내 대기업 일자리 전체의 위축과 직결되는 셈이다. CXO연구소는 \"대기업의 신규 고용 창출력이 예전 같지 않다는 점이 주요 이슈...\"",
    content: "반도체 슈퍼사이클과 실적 호전에도 불구하고 삼성전자와 SK하이닉스 등 주요 대기업들의 신규 채용 속도는 예년을 밑돌고 있어 그 원인에 이목이 쏠립니다. 한국CXO연구소 분석에 따르면, 반도체 생산 설비의 자동화 및 스마트 팩토리 극대화, 그리고 대내외 경기 불확실성에 대응하기 위한 경상 비용 효율성 극대화 정책이 맞물린 탓으로 풀이됩니다. 이에 청년 구직층의 대기업 진입 장벽은 한층 더 견고해질 전망입니다.",
    category: "연구",
    publishedAt: "2026-06-23",
    source: "CXO 인사이트 보고",
    readTime: "4분",
    isFeatured: true
  },
  {
    id: 1,
    title: "사회적가치연구원, '2026 기업 사회공헌 지표 및 사회적 이익 보고서' 발간",
    description: "국내 500대 기업의 지난해 사회적 성과가 최초로 4% 성장을 이루었으며, 탄소 감축과 기후 대응 활동이 성장을 주로 주도했다는 실증 보고서가 나왔습니다.",
    content: "사회적가치연구원(CSES)은 금일 국내 주요 500대 기업을 대상으로 실시한 화폐화 측정 프로젝트 결과를 담은 신규 연합 보고서를 전격 발간하였습니다. 이번 보고서에 따르면, 기업들의 활발한 사회공헌 투자와 자체 넷제로 달성 성과에 힙입어 한 해 동안 창출된 정량 화폐가치 총액이 전년비 4.2% 향상된 15.6조 원으로 최고 실적을 갱신하였습니다. 특히 환경 성과 지표(Eco performance) 중 온실가스 저감 및 친환경 에너지가 약 6,200억 원의 가치를 상회하며 실질 성장을 이끌었습니다. 연구원은 기업들의 이러한 실증 가치가 자본시장에서 매력적인 투자 유인책이 될 수 있도록 평가 방법론을 고도화하겠다고 밝혔습니다.",
    category: "AI/SV",
    publishedAt: "2026-06-22",
    source: "CSES 뉴스포커스",
    readTime: "3분",
    isFeatured: true
  },
  {
    id: 2,
    title: "글로벌 ESG 공시 2.0 시대로 전격 전환, 이중 중요성 평가 전면 의무화",
    description: "ISSB 기후 표준안 도입 가속화에 맞춰, 유럽 및 아시아 주요 거래소가 기업의 '재무적 임팩트'와 '사회환경적 임팩트'를 양방향 공시하는 이중 중요성 기조를 전면화합니다.",
    content: "유럽연합(EU)의 CSRD 시행 계획이 한국 기업들에게도 파급력을 미치고 있습니다. 이번에 도입되는 글로벌 공시 2.0 핵심은 '이중 중요성(Double Materiality)' 적용 여부입니다. 기업의 경영 활동이 지구 환경과 커뮤니티 삶에 미치는 임팩트(Inside-out)와, 기후 위기 및 환경 규제가 기업의 지속가능성에 미치는 재무적 영향(Outside-in)을 동일한 눈높이에서 계량 작성하여 외부 이해관계자에게 전면 오픈해야 합니다. 국내 주요 대기업 연구진은 '글로벌 경쟁력을 잃지 않기 위해 정확도가 담보되는 측정 프레임워크 적용이 시급한 상황'이라고 평가했습니다.",
    category: "ESG",
    publishedAt: "2026-06-19",
    source: "매일ESG 트렌드",
    readTime: "5분",
    isFeatured: false
  },
  {
    id: 3,
    title: "지방 소멸 막는 '로컬 크리에이터 연대', SROI 측정 모델로 주민 금융 대거 모집",
    description: "민간 크리에이터와 지자체 협동 조합의 지역 정주 촉진 정책이 기존 재정 지원을 넘어 청년 인구 유지에 성공적인 SROI 수치를 검증받고 투자를 결합하고 있습니다.",
    content: "전국 각 지자체가 소멸 고위험 지역으로 급락하는 와중에, 로컬 청년 크리에이터 네트워크의 복합 거점 프로젝트가 SROI(사회적 투자수익률) 3.5배를 증명하며 임팩트 기금과 크라우드 펀딩을 전격 수혈하는 모범 사례를 연이어 창출하고 있습니다. 본 활동은 지역 청년들이 단순 정주하는 활동 수준을 초월하여 특산품 유통, 로컬 코워킹 스페이스 브랜딩을 시도해 든든한 로컬 생태계를 구축하는 것입니다. 평가 전문가들은 '이러한 주민 밀착형 자립 모델이야말로 인구 소멸에 직접적인 대응 제동을 걸 수 있는 영리한 지역 혁신 해결책'이라고 제안합니다.",
    category: "지역혁신",
    publishedAt: "2026-06-15",
    source: "행정안전브리핑",
    readTime: "4분",
    isFeatured: false
  },
  {
    id: 4,
    title: "AI 프롬프트 엔지니어링, 사회적 기업들의 경영 혁신 날개 달았다",
    description: "고가 코딩 인프라 없이도 프롬프트 구조화 비법을 획득한 소셜 벤처 리더들이 마케팅, 리서치, 성과 보고 초안을 단 10분 만에 구축하며 90% 비용 절감 기적을 연출하고 있습니다.",
    content: "부족한 자금력으로 대형 컨설팅 펌의 자문을 받기 어려운 사회적 경제 주체(사회적기업, 자활 센터 등)들에게 생성형 AI 실전 패키지가 유일한 돌파구역으로 작동하고 있습니다. 맞춤 교육을 받은 어느 여성 벤처 임원은 '기존에 이틀 내내 매달렸던 친환경 가계 분석 기획서의 골자를 공인된 프롬프트 카드에 접목하여 단 15분 만에 해외 템플릿급 결과물로 추출하는 환상적 체험을 했다'고 증언했습니다. CSES 등 지지 단체들은 연구 실무 및 현장을 돕기 위한 공공 가치형 프롬프트 키뱅크 유포를 신속 추진할 계획이라고 언급 하였습니다.",
    category: "AI/SV",
    publishedAt: "2026-06-11",
    source: "소셜벤처연합",
    readTime: "3분",
    isFeatured: false
  },
  {
    id: 5,
    title: "대기업-소셜벤처 오픈이노베이션 활성화, 2026 연합 사회혁신 전략",
    description: "단순한 기부 차원의 CSR을 탈피, 대기업의 핵심 인프라 기술과 소셜 벤처 특유의 기동성을 접목한 글로벌 공동 가치 창출(CSV)이 주류 마켓 트렌드로 안착 중입니다.",
    content: "과거 대기업들의 연말 김장하기 대행이나 명절 선물 기증 세대의 사회공헌은 이제 자취를 감추는 추세입니다. 테크 대기업과 지능형 소셜벤처가 파트너십을 맺어 '탄소 측정 센서망 구축', '노년층 인공지능 생활 케어 솔루션' 같은 고부가가치 비즈니스를 공동 제품 출시하는 수준으로 심층 고도화되고 있습니다. 한 소셜임팩트 펀드 매니저는 '대기업이 보유한 독점 자산과 인프라 웨어를 활용해 사회적 가치의 스케일업(Scale-up)을 도울 때 공공 파급력의 체감이 5배 이상 급상승한다'고 지적하기도 했습니다.",
    category: "사회공헌",
    publishedAt: "2026-06-08",
    source: "대한상의 임팩트",
    readTime: "4분",
    isFeatured: false
  }
];

export const SEED_REPORTS: Report[] = [
  {
    id: 1,
    title: "AI 기술의 윤리적 가이드라인 및 공공적 가치 평가 모델",
    institution: "유네스코(UNESCO) 인공지능분과",
    tags: ["글로벌 표준", "AI 윤리", "사회적 영향성", "UN", "AI 거버넌스", "SDGs", "글로벌 규제"],
    category: "국외",
    publishedYear: 2025,
    downloads: 1420,
    abstract: "인공지능의 급속한 파급에 따른 알고리즘 모델의 편견 및 사회적 고용 마찰을 정량 평가하는 글로벌 가치 지표 프레임워크를 수안하여 제시하는 UNESCO 공식 보고서 원문입니다.",
    fileSize: "4.2 MB",
    link: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics"
  },
  {
    id: 2,
    title: "SROI(사회적투자수익률)를 적용한 로컬 탄소 저감 프로젝트 편익 계량화",
    institution: "사회적가치연구원(CSES)",
    tags: ["SROI", "화폐 가치", "탄소중립", "탄소 추적", "ESG", "기후 기술", "사회적가치", "SV 측정", "지표 자동화"],
    category: "국내",
    publishedYear: 2026,
    downloads: 2980,
    abstract: "친환경 제품 순환 프로젝트와 로컬 협동조합 태양광 마트 등의 활동에서 회수되는 사회적 편익 총량을 화폐 가치로 치환하고 실증 공식으로 검증해 낸 최고 권위 보고서입니다.",
    fileSize: "5.8 MB",
    link: "https://www.cses.re.kr/board/research/list.do"
  },
  {
    id: 3,
    title: "세계경제포럼(WEF) ESG 메트릭스 및 이중 중요성 측정 구조",
    institution: "세계경제포럼(WEF)",
    tags: ["WEF", "ESG 지표", "이중 중요성", "ESG", "SDGs", "글로벌 규제"],
    category: "국외",
    publishedYear: 2025,
    downloads: 1850,
    abstract: "4대 축(인민, 지구, 번영, 거버넌스)을 기초로 하여 다국적 대기업들이 즉각 계량화할 수 있는 합의형 ESG 투명 보고 지침서 연구 초록입니다.",
    fileSize: "3.7 MB",
    link: "https://www.weforum.org/publications/measuring-stakeholder-capitalism-towards-common-metrics-and-consistent-reporting-of-sustainable-value-creation"
  },
  {
    id: 4,
    title: "지역 소멸 방지 임팩트 펀드의 SROI 평가 및 성과 연계 채권 실증 분석",
    institution: "행정안전부 국토연구원",
    tags: ["SIB", "지역 활성화", "인구소멸", "사회적가치", "SV 측정", "사회적 기업", "생산성", "혁신 사례"],
    category: "국내",
    publishedYear: 2026,
    downloads: 2130,
    abstract: "소멸 위험군의 시가 단위 도시 청년 유입을 목적으로 설계된 사회성과연계채권(SIB)의 실질 화폐화 회수 모델을 다각도로 정밀 진단하는 정부 합동 공인 정책 연구서입니다.",
    fileSize: "7.1 MB",
    link: "https://www.krihs.re.kr"
  },
  {
    id: 5,
    title: "사회공헌 프레임워크를 연계한 대기업 공동 가치 사업의 파급성 측정 가이드라인",
    institution: "한국경제인협회 연구진 / CSES",
    tags: ["CSV", "사회적 성과", "이해관계자", "사회적가치", "SV 측정", "생성형 AI", "사회적 기업", "생산성", "혁신 사례"],
    category: "국내",
    publishedYear: 2026,
    downloads: 3105,
    abstract: "단순 일회성 보조금을 탈하고 소셜 혁신 벤처 인프라와 제휴하여 제품 및 공공 가치를 공동 조달할 때 대기업과 소셜 생태계가 각각 수혜하게 되는 사회 경제 이자율 측정 구조를 밝힙니다.",
    fileSize: "4.9 MB",
    link: "https://www.cses.re.kr/board/research/list.do"
  },
  {
    id: 6,
    title: "OECD 고용혁신 및 디지털 약자 정보격차 해소 지수 보고서",
    institution: "OECD",
    tags: ["디지털 혁신", "소외계층", "포용 경제", "AI 거버넌스", "글로벌 규제", "생성형 AI"],
    category: "국외",
    publishedYear: 2024,
    downloads: 1210,
    abstract: "회원 국가들의 고령화 및 모바일 기기 격차에 따른 고용 불평등 격차 해소를 위해 설계된 신규 포용 지수 편제를 제언하고 정책 거버넌스 가이드라인을 다룹니다.",
    fileSize: "3.1 MB",
    link: "https://www.oecd.org/en/topics/digital-economy.html"
  },
  {
    id: 7,
    title: "OpenAI o1-preview 모델을 활용한 연구 설계 및 추론 지능 기반 학술 자동화 분석 보고서",
    institution: "한국인공지능학회 & CSES",
    tags: ["OpenAI", "o1-preview", "연구 프로세스", "추론 지능", "생성형 AI", "생산성", "혁신 사례"],
    category: "국내",
    publishedYear: 2026,
    downloads: 4520,
    abstract: "오픈AI의 차세대 추론 연산 특화 모델인 o1-preview를 활용하여, 기존 사회적 가치(SV) 연구 프로세스의 가설 검증 단계를 최대 85% 자동화하고 연구원들의 데이터 감사 신뢰성을 대폭 향상시키는 학술 고도화 편익 보고서입니다.",
    fileSize: "6.4 MB",
    link: "https://www.cses.re.kr"
  },
  {
    id: 8,
    title: "Google AI 기후 기술 및 글로벌 공급망 탄소 추적 지표 개발 동향",
    institution: "Google AI Research & WEF",
    tags: ["Google AI", "탄소 추적", "ESG", "기후 기술", "글로벌 규제", "SDGs"],
    category: "국외",
    publishedYear: 2026,
    downloads: 3890,
    abstract: "구글의 실시간 인공지능 탄소 계측 센서망 데이터를 분석하여 글로벌 물류 공급선 상의 탄소 배출을 획기적으로 추적 및 검증하기 위해 개발된 연합 기후 모델 보고서입니다.",
    fileSize: "5.1 MB",
    link: "https://ai.google"
  }
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "meeting_summary",
    title: "📋 회의록 요약 & 후속 Action Item 도출",
    subtitle: "전사 데이터나 메모를 가독성 높은 회의록으로 구조화",
    icon: "Calendar",
    placeholder: "이곳에 회의 녹취록, 속기록 또는 나열식 주간 회의 골자를 적어주세요...",
    defaultPrompt: `CSES 연구기획팀 주간 회의 결과: 올해 상반기 원내 AI 심화 실습 교육 일정 확정 건. 6월 25일 오프라인 'SV 데이터 시각화 워크숍'을 시작으로 7월 중 '파이썬 성과 예측 시뮬레이션 해커톤'을 진행하기로 함. 정혜정 팀원은 외부 오프라인 교육비 전액 매칭 지원금 신청 서식을 배포하고, 최명 측정센터장은 유료 AI 구독 서비스 및 헬프데스크 신청 계정 접수를 6월 말까지 완료하도록 결의함.`
  },
  {
    id: "english_translation",
    title: "🌐 영문 학술 자료 및 보고서 정밀 번역",
    subtitle: "단순 직역 탈피! 사회적 가치(SV) 맥락을 반영한 고급 의역",
    icon: "Globe",
    placeholder: "이곳에 번역할 영문 텍스트나 논문 단락을 입력해 주세요...",
    defaultPrompt: `The widespread adoption of generative artificial intelligence yields significant environmental costs, primarily through massive electricity consumption in data centers. To mitigate these social externalities, we present a novel framework that quantifies the carbon impact per query, translating algorithmic complexity into environmental social return on investment (SROI). This study demonstrates how social entrepreneurs can leverage localized model deployment to lower carbon emissions by up to forty percent.`
  },
  {
    id: "proposal_draft",
    title: "🏛️ 제안서 작성 (공공기관 협업 표준 양식)",
    subtitle: "공공 부문 및 유관 부처 제안용 정제된 공문서체 초안 빌드",
    icon: "FileText",
    placeholder: "제안할 핵심 비즈니스 모델, 예산, 기대 효과 및 주요 타겟층을 입력해 주세요...",
    defaultPrompt: `행정안전부 주관 인구 감소 지역 활성화 공모 사업 대응. 인구 소멸 위험 지자체 12개 초소형 도시에 청년 소셜 벤처 거점(코워킹 스페이스 + 공유 주거)을 구축하는 기획. 총 예산 20억 규모의 '로컬 임팩트 기금' 조성을 통해 유휴 공간을 재생하고 지역 상권을 활성화하여 지속 가능한 SROI(사회적 투자수익률)를 창출하는 것이 골자임.`
  },
  {
    id: "paper_summary",
    title: "📚 학술 논문 요약 & 논지 비판적 분석",
    subtitle: "논문의 가설, 연구 방법론, 한계점을 일목요연하게 정리",
    icon: "BookOpen",
    placeholder: "이곳에 요약할 논문의 초록(Abstract) 또는 핵심 본문을 입력해 주세요...",
    defaultPrompt: `We investigate how corporate support for social enterprises generates tangible firm value (EV). Using longitudinal data from South Korea's Social Progress Credit (SPC) initiative, we analyze whether financial incentives for social performance correlate with improved operational efficiency and firm value. Our findings show that firms participating in the SPC program saw an average 34% increase in sales and significantly lower cost of debt, confirming that structured social value creation directly bridges social impact with market value.`
  },
  {
    id: "topic_discovery",
    title: "💡 사회성과(SV) 연구주제 및 가설 발굴",
    subtitle: "SROI, DBL 트렌드에 맞는 최신 학술 연구 아젠다 제안",
    icon: "Compass",
    placeholder: "관심 있는 핵심 영역이나 사회 문제를 적어주세요 (예: 탄소 배출, 취약 계층, 지자체 일자리 등)...",
    defaultPrompt: `탄소 배출량 저감에 기여하는 기업들에게 세액공제 혜택을 주는 환경 성과 보상 제도(SV TTC)의 타당성 검증. 정부가 세금을 직접 지원하는 재정 지출 방식과 비교해, 민간 기업 간 세액공제권 거래를 허용했을 때 시장 원리에 의해 사회적 비용이 줄어드는 메커니즘을 입증하는 연구 기획.`
  },
  {
    id: "ppt_design",
    title: "📊 PM 보고용 PPT 슬라이드 구성 기획",
    subtitle: "CSES 고정 양식(Deep Navy & Crimson Red) 맞춤 프롬프트 및 아웃라인 제시",
    icon: "SlidersHorizontal",
    placeholder: "슬라이드로 구성할 핵심 뼈대나 회의록 내용을 요약해 주세요...",
    defaultPrompt: `2025년 사회적가치연구원(CSES) 성과 점검 및 2026년 신규 계획 보고 안건.
Lessons Learned: 
1. SPC 및 OBF 외부 니즈는 높으나 공통 검증 기준 부족 및 기업 간 협력 잠재력 미비.
2. SV 거래화에 대한 학술적 검증 및 쉬운 Delivery 필요.
2026년 운영 계획:
1. SPC-OBF 기반 확산 및 검증 프레임워크 정립을 위해 신협중앙회 등 파트너십 구축.
2. 예산 효율화 및 경제 성장 전략으로서 SPC를 국내/국외에 포지셔닝.`
  }
];

export const RESEARCH_INSIGHTS: ResearchInsight[] = [
  {
    id: 1,
    title: "[핵심 리서치 가이드] OpenAI o1-preview 모델을 활용한 연구 설계 자동화",
    author: "김선우, 정혜정 (CSES 선임연구원)",
    date: "2026.03",
    tag: "Deep Dive",
    publisher: "사회적가치연구원 (CSES)",
    doi_or_id: "DOI: 10.51159/cses.2026.03.01",
    abstract: "본 연구는 OpenAI의 차세대 추론 모델인 o1-preview를 사회과학 및 사회적 가치(SV) 연구 프로세스에 통합하는 방법론을 제시합니다. 프롬프트 엔지니어링 고도화와 반복 추론 과정을 통해, 선행 논문 분석, 연구 가설 설계, 실증 지표 도출 등의 연구 초기 작업을 최대 85% 이상 자동화함으로써 학술 워크플로우의 혁신적 생산성 향상을 검증하였습니다.",
    link: "https://www.cses.re.kr/board/research/list.do"
  },
  {
    id: 2,
    title: "The Role of Artificial Intelligence in Achieving the Sustainable Development Goals (SDGs)",
    author: "Ricardo Vinuesa, et al.",
    date: "2024.11",
    tag: "Policy Paper",
    publisher: "Nature Communications",
    doi_or_id: "DOI: 10.1038/s41467-020-16240-3",
    abstract: "인공지능(AI)이 UN 지속가능발전목표(SDGs)의 17개 목표와 169개 세부 과제 달성에 미치는 영향을 분석한 기념비적 연구입니다. AI가 134개 세부 목표(79%) 달성을 촉진하는 긍정적 촉매제 역할을 수행할 수 있는 반면, 정보 격차 심화 및 에너지 소모 등의 부작용으로 59개 세부 목표(35%)에 억제 효과를 줄 수 있음을 계량적으로 실증하였습니다.",
    link: "https://www.nature.com/articles/s41467-020-16240-3"
  },
  {
    id: 3,
    title: "AI Index 2026 Annual Report: Tracking Technology and Regulation Trajectories",
    author: "Ray Perrault, Jack Clark",
    date: "2026.04",
    tag: "Analysis",
    publisher: "Stanford University (HAI)",
    doi_or_id: "arXiv:2604.10302",
    abstract: "전 세계 인공지능 기술의 성능 지표, 컴퓨팅 인프라 소모 전력, 특허 수, 다국적 규제 변화 및 거버넌스 가이드라인을 종합적으로 추적한 스탠퍼드 HAI 연구소의 연례 리포트 요약입니다. 생성형 AI 모델의 정렬 기술 발전 속도와 주요국의 규제 법안 입법 건수가 비례하여 폭증하고 있으며, 사회적 신뢰와 거버넌스가 차세대 핵심 화두임을 짚어냅니다.",
    link: "https://hai.stanford.edu/research/ai-index-report"
  },
  {
    id: 4,
    title: "How Generative AI Can Transform Social Enterprise Productivity: Empirical Evidence",
    author: "Michael Chui, Lareina Yee",
    date: "2025.08",
    tag: "Field Report",
    publisher: "McKinsey Global Institute (MGI)",
    doi_or_id: "ID: MGI-2025-GENAI-SOC",
    abstract: "글로벌 사회적 기업 450개사를 대상으로 생성형 AI 어시스턴트를 도입했을 때 나타나는 정량적 성과 변화를 실증 분석하였습니다. 연구 결과, 제안서 작성, 정부 기금 매칭 자동화, 타당성 검토 등 수작업 행정 워크플로우 비용이 평균 42% 감소하였으며, 이를 통해 확보된 리소스가 지역사회 대면 수혜 프로그램 확대로 전환되는 구조를 밝혔습니다.",
    link: "https://www.mckinsey.com/mgi/our-research"
  },
  {
    id: 5,
    title: "Algorithmic Auditing and Social Value: A Blueprint for AI Governance",
    author: "Inioluwa Deborah Raji, Joy Buolamwini",
    date: "2025.02",
    tag: "Policy Paper",
    publisher: "MIT Media Lab",
    doi_or_id: "DOI: 10.1145/3351095.3372874",
    abstract: "공공 영역 및 소셜 서비스에 배치된 인공지능 모델의 편향성과 윤리적 사회 해악을 선제적으로 예방하기 위한 '알고리즘 감사(Algorithmic Audits)' 체계를 다룹니다. 기업 및 정부의 AI 도구 배포 시, 설계 단계부터 사회적 편익 평가(SROI) 및 위험 시나리오 검토를 전격적으로 의무화하는 정책 가이드라인을 제시합니다.",
    link: "https://www.media.mit.edu/publications/"
  },
  {
    id: 6,
    title: "Impact Investing in the Era of AI: Capital Allocation and SV Optimization",
    author: "Sir Ronald Cohen",
    date: "2025.12",
    tag: "Investment",
    publisher: "Harvard Business Review (HBR)",
    doi_or_id: "DOI: 10.1225/HBR-AI-2025",
    abstract: "인공지능 기반 임팩트 투자 플랫폼이 자본 배분의 효율성을 극대화하고, 투자 대상 기업들의 비재무적 사회 성과(ESG) 데이터를 실시간 머신러닝으로 감지하는 메커니즘을 규명합니다. 전통적 재무 이자율 외에, 고유한 정밀 알고리즘을 통한 가칭 'AI-SROI' 계측이 사회적 임팩트 투자의 대중화를 이끌 것임을 선언합니다.",
    link: "https://hbr.org"
  },
  {
    id: 7,
    title: "Constitutional AI: Harmlessness from AI Feedback for Policy and Safety",
    author: "Yuntao Bai, Saurabh Kadavath",
    date: "2024.12",
    tag: "Deep Dive",
    publisher: "Anthropic Research",
    doi_or_id: "arXiv:2212.08073",
    abstract: "인간의 수동 피드백(RLHF) 대신 헌법적 가치 기준(AI Feedback)을 주입하여 초거대 언어 모델 스스로 안전성과 정렬 지수를 극대화하도록 훈련시키는 'Constitutional AI'의 기술적 구조를 설명합니다. 인간 사회의 윤리, 인권 선언, 환경 보호 사상을 지침으로 삽입해 탈옥(Jailbreak) 및 편향 답변을 지능적으로 예외화시킵니다.",
    link: "https://www.anthropic.com/research"
  },
  {
    id: 8,
    title: "Green AI: Environmental Footprint Analysis of Frontier Language Models",
    author: "Roy Schwartz, Jesse Dodge",
    date: "2025.06",
    tag: "Field Report",
    publisher: "Allen Institute for AI",
    doi_or_id: "DOI: 10.1145/3381831",
    abstract: "대형 언어 모델(LLM)의 매개변수 스케일 확장에 따른 지구 온난화 및 수자원 증발량 탄소 발자국을 환경 SROI 기법으로 조명하였습니다. 가중치 소모 전력 대비 탄소 저감에 우호적인 고효율 소형 모델(SLM) 아키텍처로의 전환 흐름 및 재생 에너지를 수급하는 친환경 AI 인프라 최적화 방안을 정량 계산식으로 정립합니다.",
    link: "https://allenai.org/research"
  },
  {
    id: 9,
    title: "Global AI Regulation Index and EU AI Act Implementation",
    author: "Dragoș Tudorache, Brando Benifei",
    date: "2025.05",
    tag: "Policy Paper",
    publisher: "European Parliament Research",
    doi_or_id: "CE-AI-ACT-2025-EU",
    abstract: "세계 최초로 전격 시행되는 유럽연합 인공지능 법안(EU AI Act)의 카테고리별 위험 등급(수용 불가능, 고위험, 범용 AI 모델) 규제 이행 로드맵과 이를 어길 시 부과되는 징벌적 과징금 집행 표준안 분석입니다. 신뢰할 수 있고 투명한 모델 검증 기법 및 공정한 사회적 가치 기조의 준수를 요구하는 글로벌 빅테크들의 공동 대응 전술을 내포합니다.",
    link: "https://www.europarl.europa.eu"
  },
  {
    id: 10,
    title: "Evaluating the Social Return on Investment (SROI) of Public AI Chatbots",
    author: "최명, 정경윤 (CSES 선임연구원)",
    date: "2026.01",
    tag: "Analysis",
    publisher: "사회적가치연구원 (CSES)",
    doi_or_id: "DOI: 10.51159/cses.2026.01.02",
    abstract: "지자체 및 복지 센터에 적용된 'AI 말벗/돌봄 인공지능 콜 서비스'의 사회적 편익 총량을 SROI 산출 가이드라인에 근거하여 화폐적으로 계량화하였습니다. 돌봄 공백의 실시간 대체 및 노년 고독 완화에 따른 우울증 의료 비용 절감 등의 연간 회수 수치를 정밀 계산해 총 투입 대비 SROI가 약 3.86배에 이름을 입증하였습니다.",
    link: "https://www.cses.re.kr"
  },
  {
    id: 11,
    title: "AI and Social Mobility: Modeling Career Transitions and Workforce Disruption",
    author: "Daron Acemoglu, Pascual Restrepo",
    date: "2025.10",
    tag: "Analysis",
    publisher: "National Bureau of Economic Research (NBER)",
    doi_or_id: "NBER Working Paper w32104",
    abstract: "인공지능의 도입이 저소득층 사무 노동자의 직업 이직 및 근로 가치 하락에 미치는 파괴적인 지각 변동을 분석하고 거시경제 모델을 적용하였습니다. 단순한 대체 이론을 넘어, 혁신적인 신규 직무군 창출과 소득 안정 보조책이 어우러지지 않을 시 심화되는 불평등 구조를 화폐 소득의 편익 관점에서 실증 계측합니다.",
    link: "https://www.nber.org/papers"
  },
  {
    id: 12,
    title: "Corporate AI Investment Strategies and Aligning with ESG Frameworks",
    author: "Paul Romer, Rebecca Henderson",
    date: "2026.02",
    tag: "Investment",
    publisher: "Stanford Graduate School of Business",
    doi_or_id: "DOI: 10.2139/ssrn.461028",
    abstract: "다국적 상장 기업들이 막대한 AI 데이터 센터 자본을 집행하는 과정에서 발생되는 공급망 탄소 점검과 알고리즘 투명성 의무를 자사의 기존 ESG 관리 기조에 강결합시키는 구조적 프레임워크를 개발하였습니다. 친환경 녹색 컴퓨팅 및 임직원 대상 전환 교육 투자가 기업 평판과 장기 기업가치 향상으로 이어진다는 결과를 검증했습니다.",
    link: "https://www.gsb.stanford.edu"
  }
];
