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
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export interface PromptTemplate {
  id: "translator" | "writer" | "advisor";
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
    provider: "사회적가치연구원(CSES) / K-MOOC",
    level: "입문",
    category: "종합",
    tags: ["SV 측정", "사회공헌", "기본이론"],
    duration: "총 8주 (주당 2시간)",
    description: "사회적가치(Social Value)의 탄생 배경부터 개념 정립, 그리고 핵심 측정 방법론까지 포괄적으로 배울 수 있는 종합 입문 과정입니다.",
    curriculum: [
      "1주차: 자본주의의 변화와 사회적 가치의 당위성",
      "2주차: CSES 사회적 가치 측정 가이드라인 정독",
      "3주차: 사회적 성과의 측정 및 화폐화 기초 공식",
      "4주차: 주요 이해관계자 분석 및 경제적 이익 연계"
    ],
    isHighlight: false
  },
  {
    id: 102,
    title: "ESG 공시 지표 마스터 클래스 (중급 실무)",
    provider: "한국생산성본부 / CSES 연계",
    level: "중급",
    category: "ESG 공시",
    tags: ["ESG", "공시 표준", "GRI / ISSB"],
    duration: "총 4주 (주당 4시간)",
    description: "ISSB 및 GRI 글로벌 가이드라인을 기반으로 기업의 환경, 사회, 지배구조 데이터를 체계적으로 수집하고 정량 공시하는 실무 테크닉을 함양합니다.",
    curriculum: [
      "1주차: 글로벌 ESG 공시 의무화 동향 분석",
      "2주차: 중요성 평가(Double Materiality) 방법론 및 실무 실습",
      "3주차: Scope 3 탄소 배출공식 및 공급망 임팩트 측정",
      "4주차: 감사 대응을 위한 고보증 ESG 보고서 최종 구성법"
    ],
    isHighlight: false
  },
  {
    id: 103,
    title: "AI 사업 기획 및 임팩트 프롬프팅 (고급 응용)",
    provider: "CSES 디지털혁신 센터",
    level: "고급",
    category: "디지털 실무",
    tags: ["AI 프롬프트", "데이터 기획", "Gemini 융합"],
    duration: "총 3주 (주당 6시간)",
    description: "연구 분석 실무에서 생성형 AI와 Large Language Model을 안전하게 융합하고, 사회적 결핍 모델링을 위한 프롬프트 기스크럭쳐를 구축하는 과정입니다.",
    curriculum: [
      "1주차: 생성형 AI 기본 모델과 프롬프트 패턴 매칭 연구",
      "2주차: RAG를 활용한 SV 성과 논문 통합 요약 대행 설계",
      "3주차: 프롬프트 인젝션 방지 및 고신뢰성 에이전트 워크플로우 테스트"
    ],
    isHighlight: false
  },
  {
    id: 104,
    title: "사회적 혁신가 온보딩 코스 (입문 입문)",
    provider: "사회적협동조합 전경련",
    level: "입문",
    category: "사회공헌",
    tags: ["혁신 모델", "임팩트 투자", "소셜 비즈니스"],
    duration: "단기 2일 마스터",
    description: "체인지메이커로서 사회 문제를 비즈니스 모델을 선도하여 해결하려는 차세대 소셜 벤처 리더들을 위한 스타터 패키지 강의입니다.",
    curriculum: [
      "1주차: 사회 혁신의 메커니즘과 성공적 비즈니스 케이스 스터디",
      "2주차: 린 소셜 캔버스를 통한 가설 검증과 시제품 구상"
    ],
    isHighlight: false
  },
  {
    id: 105,
    title: "데이터로 보는 지역 소멸 대응책 (중급 리서치)",
    provider: "행정안전부 / CSES 공동연구진",
    level: "중급",
    category: "지역혁신",
    tags: ["지역 활성화", "인구통계", "SROI 측정"],
    duration: "총 6주 (주당 3시간)",
    description: "인구 감소와 소멸 위기에 놓인 지자체의 구체적 데이터를 통해 로컬 커뮤니티의 SROI(사회적 투자수익률)를 시각화하고 대안 모델을 점검합니다.",
    curriculum: [
      "1주차: 대한민국 로컬 위기 인구통계 지리정보시스템 입문",
      "2주차: 고향사랑기부제와 로컬 기금 사업의 SV 산식 설계",
      "3주차: 지역혁신 거점 비즈니스의 장기 사회적 성과 시계열 분석"
    ]
  },
  {
    id: 106,
    title: "글로벌 사회공헌 트렌드 & Net zero 세미나 (고급 국제)",
    provider: "국제임팩트평가학회(IAIA) 아시아 지부",
    level: "고급",
    category: "사회공헌",
    tags: ["탄소중립", "SDGs", "글로벌 동향"],
    duration: "총 5주 (주당 4시간)",
    description: "글로벌 기업들이 구사하는 대규모 기후 및 생물다양성 공헌 프로젝트와 넷제로 로드맵 연계형 SV 관리 기법을 학습하는 연구원 전용 심포지엄 교육 코스입니다.",
    curriculum: [
      "1주차: 과학기반감축목표 이니셔티브(SBTi) 넷제로 동향 요약",
      "2주차: 개발도상국 현지 사회공헌의 UN SDGs 기여도 계량 평가",
      "3주차: 생물다양성 손실(Nature Positive) 화폐 가치를 산출하는 혁신 프레임워크"
    ]
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
    tags: ["글로벌 표준", "AI 윤리", "사회적 영향성"],
    category: "국외",
    publishedYear: 2025,
    downloads: 1420,
    abstract: "인공지능의 급속한 파급에 따른 알고리즘 모델의 편견 및 사회적 고용 마찰을 정량 평가하는 글로벌 가치 지표 프레임워크를 수안하여 제시하는 UNESCO 공식 보고서 원문입니다.",
    fileSize: "4.2 MB"
  },
  {
    id: 2,
    title: "SROI(사회적투자수익률)를 적용한 로컬 탄소 저감 프로젝트 편익 계량화",
    institution: "사회적가치연구원(CSES)",
    tags: ["SROI", "화폐 가치", "탄소중립"],
    category: "국내",
    publishedYear: 2026,
    downloads: 2980,
    abstract: "친환경 제품 순환 프로젝트와 로컬 협동조합 태양광 마트 등의 활동에서 회수되는 사회적 편익 총량을 화폐 가치로 치환하고 실증 공식으로 검증해 낸 최고 권위 보고서입니다.",
    fileSize: "5.8 MB"
  },
  {
    id: 3,
    title: "세계경제포럼(WEF) ESG 메트릭스 및 이중 중요성 측정 구조",
    institution: "세계경제포럼(WEF)",
    tags: ["WEF", "ESG 지표", "이중 중요성"],
    category: "국외",
    publishedYear: 2025,
    downloads: 1850,
    abstract: "4대 축(인민, 지구, 번영, 거버넌스)을 기초로 하여 다국적 대기업들이 즉각 계량화할 수 있는 합의형 ESG 투명 보고 지침서 연구 초록입니다.",
    fileSize: "3.7 MB"
  },
  {
    id: 4,
    title: "지역 소멸 방지 임팩트 펀드의 SROI 평가 및 성과 연계 채권 실증 분석",
    institution: "행정안전부 국토연구원",
    tags: ["SIB", "지역 활성화", "인구소멸"],
    category: "국내",
    publishedYear: 2026,
    downloads: 2130,
    abstract: "소멸 위험군의 시가 단위 도시 청년 유입을 목적으로 설계된 사회성과연계채권(SIB)의 실질 화폐화 회수 모델을 다각도로 정밀 진단하는 정부 합동 공인 정책 연구서입니다.",
    fileSize: "7.1 MB"
  },
  {
    id: 5,
    title: "사회공헌 프레임워크를 연계한 대기업 공동 가치 사업의 파급성 측정 가이드라인",
    institution: "한국경제인협회 연구진 / CSES",
    tags: ["CSV", "사회적 성과", "이해관계자"],
    category: "국내",
    publishedYear: 2026,
    downloads: 3105,
    abstract: "단순 일회성 보조금을 탈하고 소셜 혁신 벤처 인프라와 제휴하여 제품 및 공공 가치를 공동 조달할 때 대기업과 소셜 생태계가 각각 수혜하게 되는 사회 경제 이자율 측정 구조를 밝힙니다.",
    fileSize: "4.9 MB"
  },
  {
    id: 6,
    title: "OECD 고용혁신 및 디지털 약자 정보격차 해소 지수 보고서",
    institution: "OECD",
    tags: ["디지털 혁신", "소외계층", "포용 경제"],
    category: "국외",
    publishedYear: 2024,
    downloads: 1210,
    abstract: "회원 국가들의 고령화 및 모바일 기기 격차에 따른 고용 불평등 격차 해소를 위해 설계된 신규 포용 지수 편제를 제언하고 정책 거버넌스 가이드라인을 다룹니다.",
    fileSize: "3.1 MB"
  }
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "translator",
    title: "📄 학술 논문 초록 번역기",
    subtitle: "English to Korean 학술 의역 및 SV 핵심 키워드 맥락 해석",
    icon: "Globe",
    placeholder: "이곳에 영문 논문의 초록(Abstract) 텍스트를 입력해 주세요...",
    defaultPrompt: `The widespread adoption of generative artificial intelligence yields significant environmental costs, primarily through massive electricity consumption in data centers. To mitigate these social externalities, we present a novel framework that quantifies the carbon impact per query, translating algorithmic complexity into environmental social return on investment (SROI). This study demonstrates how social entrepreneurs can leverage localized model deployment to lower carbon emissions by up to forty percent.`
  },
  {
    id: "writer",
    title: "✍️ 사회적 가치 뉴스 기사 작성기",
    subtitle: "전달하려는 핵심 팩트 기반의 수준급 보도자료 초안 뼈대 생성",
    icon: "FileText",
    placeholder: "보도자료에 포함할 핵심 팩트나 키워드를 입력해 주세요 (예: 'CSES, 인구소멸 지역 청년들을 위해 30억 규모 혁신 거점 펀드 조성 완료, 연내 50개 벤처 활성화 예정' 등)...",
    defaultPrompt: `사회적가치연구원(CSES)이 행정안전부와 협업하여 전국 인구소멸 위험지 12개 초소형 도시에 청년 혁신 거점 구축을 도울 20억 규모 '로컬 SV 임팩트 기금' 조성을 마쳤다. 이로 인해 연내 청년 로컬 크리에이터 벤처 30여 개가 창업 인력 주거와 워크 스페이스 혜택을 직접 조달하게 되며, 지역의 유휴 공간을 재생하고 SROI를 가속할 것으로 전격 평가된다.`
  },
  {
    id: "advisor",
    title: "💡 기획서 고도화 AI 어드바이저",
    subtitle: "UN SDGs 연계성 보강, SROI 지표 보완, 임팩트 확장 전략 조언",
    icon: "Compass",
    placeholder: "검토받고 싶은 사회 혁신 사업이나 기획서 초안, 비즈니스 모델 요약을 적어주세요...",
    defaultPrompt: `동네 은퇴자분들을 배송원으로 연계하여 전통 시장 신선 식품을 즉시 근처 오피스 및 가계로 새벽 배달해 주는 소셜 배송 비즈니스입니다. 은퇴자분들께는 하루 4시간의 정당한 소일거리 임금을 보장하고, 배달 과정에 다회용 재사용 보랭백을 전면 강제 적용하여 플라스틱 박스를 전량 교체하여 친환경 순환 가치도 창출하고자 합니다.`
  }
];
