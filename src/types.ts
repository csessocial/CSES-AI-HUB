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
    title: "[부스트코스] Generative AI & Large Language Model 기초 실무",
    provider: "부스트코스",
    level: "입문",
    category: "디지털 실무",
    tags: ["생성형 AI", "LLM 기초", "ChatGPT", "프롬프트"],
    duration: "총 4주 (주당 3시간)",
    description: "생성형 AI의 작동 원리부터 GPT, Claude 등 주요 LLM 도구를 실무에 바로 도입할 수 있는 기본기 중심의 실무 입문 강의입니다.",
    curriculum: [
      "1주차: 생성형 AI의 등장배경과 거대언어모델(LLM) 원리",
      "2주차: 직무 효율화를 위한 효과적인 프롬프트 작성 공식",
      "3주차: ChatGPT 및 Claude 주요 기능 및 실습 활용",
      "4주차: 인공지능 윤리 및 사내 보안 가이드라인 준수"
    ],
    isHighlight: false,
    link: "https://www.boostcourse.org"
  },
  {
    id: 102,
    title: "[한국표준협회] 업무 자동화를 위한 Python 및 AI 데이터 분석 실무",
    provider: "한국표준협회",
    level: "중급",
    category: "디지털 실무",
    tags: ["파이썬", "데이터 분석", "Pandas", "자동화"],
    duration: "총 6주 (주당 4시간)",
    description: "단순 반복 행정 업무를 파이썬 코딩과 AI 분석 라이브러리(Pandas, NumPy)를 활용하여 원스톱으로 자동화하는 실전형 중급 마스터 코스입니다.",
    curriculum: [
      "1주차: 데이터 수집 및 정제용 파이썬 핵심 기초 문법",
      "2주차: Pandas/NumPy를 활용한 엑셀 보고서 자동 병합",
      "3주차: 데이터 시각화 라이브러리(Matplotlib, Seaborn) 분석 실무",
      "4주차: 공공 데이터 오픈 API 연계 및 자동 수집 에이전트 구축"
    ],
    isHighlight: false,
    link: "https://www.oksa.or.kr"
  },
  {
    id: 103,
    title: "[K-MOOC] 파이썬 머신러닝 & 딥러닝 인공지능 수학 입문",
    provider: "K-MOOC",
    level: "입문",
    category: "디지털 실무",
    tags: ["머신러닝", "딥러닝", "수학 기초", "AI 핵심"],
    duration: "총 8주 (주당 2시간)",
    description: "머신러닝과 딥러닝의 핵심 알고리즘 뒤에 숨겨진 수학적 배경을 이해하고, 실무 응용을 위한 개념적 기초 체력을 기르는 K-MOOC 대표 학술/실무 강좌입니다.",
    curriculum: [
      "1주차: 인공지능을 위한 기초 선형대수학과 통계학 개념",
      "2주차: 지도학습 and 비지도학습 알고리즘의 작동 원리",
      "3주차: 인공신경망(ANN) and 역전파 알고리즘 수식 직관 이해",
      "4주차: 선형 회귀 및 로지스틱 분류 알고리즘 실전 실습"
    ],
    isHighlight: false,
    link: "http://www.kmooc.kr"
  },
  {
    id: 104,
    title: "[부스트코스] RAG 기반의 Custom GPTs 및 사내 데이터 학습 챗봇 구축",
    provider: "부스트코스",
    level: "고급",
    category: "디지털 실무",
    tags: ["Custom GPTs", "RAG 에이전트", "사내 데이터", "AI 챗봇"],
    duration: "총 3주 (주당 6시간)",
    description: "외부로의 기밀 유출 걱정 없이 사내 문서(PDF, CSV, MD 등)를 안전하게 임베딩(Embedding)하고, 특정 실무 맞춤형 RAG 에이전트 및 챗봇을 직접 배포하는 실습 중심의 고급 코스입니다.",
    curriculum: [
      "1주차: Custom GPTs 설계 아키텍처 및 API Action 연동법",
      "2주차: 임베딩 벡터 데이터베이스 개념 및 RAG 검색 파이프라인 최적화",
      "3주차: LangChain 프레임워크를 활용한 나만의 커스텀 지식 기반 AI 개발"
    ],
    isHighlight: false,
    link: "https://www.boostcourse.org"
  },
  {
    id: 105,
    title: "[한국표준협회] 실무 맞춤형 No-Code AI 및 RPA 업무 자동화 워크숍",
    provider: "한국표준협회",
    level: "입문",
    category: "디지털 실무",
    tags: ["노코드 AI", "RPA", "업무 자동화", "Zapier"],
    duration: "단기 2일 마스터 (총 16시간)",
    description: "복잡한 코드 한 줄 없이도 Zapier, Make, Microsoft Power Automate 등 대표적인 노코드(No-Code) 툴에 생성형 AI API를 연계하여 완전 무인 자동화 워크플로우를 완성하는 단기 집중 워크숍입니다.",
    curriculum: [
      "1일차: 노코드 자동화 개념 이해 및 Zapier 기본 트리거-액션 마스터",
      "2일차: GPT API와 노코드 연계, 메일 수신 시 자동 분석 및 보고서 전송 구축"
    ],
    isHighlight: false,
    link: "https://www.oksa.or.kr"
  },
  {
    id: 106,
    title: "[K-MOOC] 자연어 처리(NLP) 및 최신 트랜스포머 아키텍처 이해",
    provider: "K-MOOC",
    level: "고급",
    category: "디지털 실무",
    tags: ["NLP", "트랜스포머", "BERT", "GPT 아키텍처"],
    duration: "총 6주 (주당 3시간)",
    description: "현대 생성형 AI 혁신을 견인한 Transformer 구조와 Attention 메커니즘을 상세히 해부하고, 자연어 처리(NLP) 태스크에 대한 미세조정(Fine-Tuning)까지 심도 있게 탐구하는 고급 전문 개발 교육입니다.",
    curriculum: [
      "1주차: RNN과 LSTM을 넘어선 Self-Attention 메커니즘 개요",
      "2주차: Transformer Encoder-Decoder 아키텍처 핵심 해부",
      "3주차: 사전학습 모델(BERT, GPT)의 원리와 파인튜닝 실무 적용"
    ],
    isHighlight: false,
    link: "http://www.kmooc.kr"
  },
  {
    id: 107,
    title: "[부스트코스] 딥러닝 모델 배포 및 실전 MLOps 구축 가이드",
    provider: "부스트코스",
    level: "고급",
    category: "디지털 실무",
    tags: ["MLOps", "모델 배포", "CI/CD", "파이프라인"],
    duration: "총 4주 (주당 4시간)",
    description: "연구실 단계를 벗어나 로컬에 빌드된 AI 모델을 안정적인 서비스 형태로 배포하고, 지속적인 모니터링과 데이터 피드백 루프를 결합하는 MLOps 핵심 생태계 실무 강의입니다.",
    curriculum: [
      "1주차: FastAPI를 활용한 경량 AI 인프라 서비스 API 서버 빌드",
      "2주차: Docker 컨테이너라이제이션을 통한 일관성 있는 배포 환경 구성",
      "3주차: MLflow를 사용한 실험 이력 관리 및 가중치 파일 관리 가이드"
    ],
    isHighlight: true,
    link: "https://www.boostcourse.org"
  },
  {
    id: 108,
    title: "[한국표준협회] 프롬프트 엔지니어링 마스터 클래스: 기획부터 고급 최적화까지",
    provider: "한국표준협회",
    level: "중급",
    category: "디지털 실무",
    tags: ["프롬프트 엔지니어링", "Few-Shot", "CoT", "최적화"],
    duration: "총 2주 (실습 중심 온/오프라인 병행)",
    description: "단순히 AI에게 말을 거는 단계를 넘어, Few-Shot 러닝, Chain-of-Thought(CoT), ReAct 등의 고급 엔지니어링 기법을 접목하여 결과의 정밀도를 99% 이상 끌어올리는 특화 과정입니다.",
    curriculum: [
      "1주차: 제로샷/퓨샷 기법 및 구체적 시스템 프롬프트(Role Playing) 설계법",
      "2주차: 복잡한 논리 해결을 위한 Chain-of-Thought 및 ReAct 추론 구조화 실무"
    ],
    isHighlight: true,
    link: "https://www.oksa.or.kr"
  },
  {
    id: 109,
    title: "[K-MOOC] 웹 브라우저 안에서 구동하는 실전 TensorFlow.js 인공지능 개발",
    provider: "K-MOOC",
    level: "중급",
    category: "디지털 실무",
    tags: ["TensorFlow.js", "웹 AI", "컴퓨터 비전", "자바스크립트"],
    duration: "총 5주 (주당 3시간)",
    description: "서버 자원의 부담 없이 사용자의 웹 브라우저(Client-side) 내에서 실시간 웹캠 모션 인식, 객체 탐지, 텍스트 분석 모델을 구동하는 자바스크립트 기반 실전 웹 AI 구현 과정입니다.",
    curriculum: [
      "1주차: 브라우저 환경에서의 TensorFlow.js 작동 구조 및 전처리",
      "2주차: 웹캠을 통한 실시간 컴퓨터 비전(Object Detection) 모델 서빙",
      "3주차: 브라우저 내 경량 모델 전이학습(Transfer Learning) 실습"
    ],
    isHighlight: true,
    link: "http://www.kmooc.kr"
  },
  {
    id: 110,
    title: "[부스트코스] PyTorch로 시작하는 인공지능 딥러닝 핵심 기초",
    provider: "부스트코스",
    level: "중급",
    category: "디지털 실무",
    tags: ["PyTorch", "딥러닝", "인공신경망", "모델 학습"],
    duration: "총 5주 (주당 4시간)",
    description: "연구 분석 및 데이터 처리에 필수적인 글로벌 대표 딥러닝 프레임워크 PyTorch의 기초 텐서 계산부터 시작하여, 커스텀 데이터셋을 구성하고 인공신경망 모델을 직접 개발해보는 실습 코스입니다.",
    curriculum: [
      "1주차: PyTorch 텐서 기본 연산 및 선형 회귀 기초 모델 구성",
      "2주차: 경사하강법과 역전파 최적화 알고리즘 구현 실습",
      "3주차: CNN을 활용한 정형/비정형 이미지 피처 추출 기법",
      "4주차: 인공신경망 과적합(Overfitting) 방지 및 모델 검증 가이드"
    ],
    isHighlight: false,
    link: "https://www.boostcourse.org"
  },
  {
    id: 111,
    title: "[부스트코스] 모두를 위한 AI 비즈니스 혁신과 업무 생산성 패키지",
    provider: "부스트코스",
    level: "입문",
    category: "디지털 실무",
    tags: ["비즈니스 AI", "생산성", "업무 자동화", "Claude"],
    duration: "총 3주 (주당 2시간)",
    description: "비개발 연구직군도 손쉽게 이해할 수 있는 AI 도구 활용 극대화 과정으로, 연구 기획, 논문 초록 정제, 업무 일정 관리 등에 인공지능 비서를 접목하는 실전 노하우를 습득합니다.",
    curriculum: [
      "1주차: ChatGPT, Claude, Gemini 실무적 장단점 및 직무 정합성 분석",
      "2주차: 연구 성과 보고서의 핵심 메시지 고속 필터링 및 요약 자동화",
      "3주차: 마크다운(Markdown) 문서를 활용한 사내 업무 연계 및 자동 정제"
    ],
    isHighlight: false,
    link: "https://www.boostcourse.org"
  },
  {
    id: 112,
    title: "[부스트코스] 모두를 위한 딥러닝 핵심 개념과 데이터 실무 분석",
    provider: "부스트코스",
    level: "입문",
    category: "디지털 실무",
    tags: ["인공지능 개론", "딥러닝 기초", "데이터 시각화", "AI 입문"],
    duration: "총 4주 (주당 3시간)",
    description: "수학적 지식이 부족해도 직관적으로 이해할 수 있는 딥러닝 마스터 클래스로, 전 세계 50만 명 이상이 수강한 검증된 딥러닝 입문 바이블 강의의 실습 특화 패키지입니다.",
    curriculum: [
      "1주차: 인공지능과 머신러닝의 핵심 메커니즘과 분류 모델",
      "2주차: 텐서플로우 기반의 간단한 선형 분류기 실전 동작 원리",
      "3주차: 다층 퍼셉트론과 깊은 신경망의 학습 성능 튜닝 노하우",
      "4주차: 정형 데이터에 숨겨진 연관 관계 시각화 및 예측 분석"
    ],
    isHighlight: false,
    link: "https://www.boostcourse.org"
  },
  {
    id: 113,
    title: "[한국표준협회] 생성형 AI 기반 비즈니스 문서 기획 및 슬라이드 디자인 워크숍",
    provider: "한국표준협회",
    level: "중급",
    category: "디지털 실무",
    tags: ["문서 기획", "PPT 디자인", "보고서 생성", "워크숍"],
    duration: "단기 2일 집중 (총 16시간)",
    description: "연구원들을 위한 맞춤형 비즈니스 PPT 시나리오 작성 특화 강좌로, ChatGPT로 보고서 텍스트의 구조를 짜고 Gamma, Beautiful.ai 등의 디자인 도구를 활용해 15분 만에 슬라이드를 배포하는 과정입니다.",
    curriculum: [
      "1일차: AI를 통한 사업 기획서 아웃라인 전개 및 목차 자동 다듬기",
      "2일차: 슬라이드 빌더와 생성형 AI 연계를 통한 고신뢰성 발표 자료 완성"
    ],
    isHighlight: false,
    link: "https://www.oksa.or.kr"
  },
  {
    id: 114,
    title: "[한국표준협회] 실무 연구자를 위한 AI 특허 정보 분석 및 기술 보고서 자동 수집",
    provider: "한국표준협회",
    level: "고급",
    category: "디지털 실무",
    tags: ["특허 분석", "기술 보고서", "데이터 크롤링", "AI 연구"],
    duration: "총 4주 (주당 3시간)",
    description: "국내외 주요 기술 특허 명세서와 연구 데이터를 AI 기반 분석 모델로 자동 매핑하고 수집 기법을 익히는 실무형 기술 교육입니다.",
    curriculum: [
      "1주차: 글로벌 주요 특허 정보 사이트 자동 분석 프레임워크 구축",
      "2주차: 기술 키워드 및 클러스터링을 활용한 선행 기술 조사 설계",
      "3주차: 파이썬 기반 데이터 수집 패키지 연계 및 크롤러 코딩 실습",
      "4주차: 기술 동향 시각화 분석 및 최종 예측 보고서 레이아웃 생성"
    ],
    isHighlight: false,
    link: "https://www.oksa.or.kr"
  },
  {
    id: 115,
    title: "[한국표준협회] ESG 및 사회성과 평가서 자동 생성을 위한 대형 프롬프트 아키텍트 실습",
    provider: "한국표준협회",
    level: "고급",
    category: "디지털 실무",
    tags: ["ESG 평가", "사회성과", "프롬프트 아키텍트", "대형 프롬프트"],
    duration: "단기 3일 마스터 (총 24시간)",
    description: "GRI 2026, ISSB 지표 등 복잡한 사회성과 평가지표들을 원격 연동하여 기업의 경영 성과 보고서 원본을 대량 요약 분석하고 정량 데이터를 신속히 가공하는 최고 난이도의 프롬프트 설계 과정입니다.",
    curriculum: [
      "1일차: 글로벌 공시 규범 기준에 입각한 원데이터 가공 프롬프트 엔지니어링",
      "2일차: Hallucination(정보 왜곡) 제로 보증을 위한 Context 분기 주입 기술",
      "3일차: 최종 산출된 ESG 지수 요약본의 한글 파일 표 일괄 변환 및 배포"
    ],
    isHighlight: true,
    link: "https://www.oksa.or.kr"
  },
  {
    id: 116,
    title: "[K-MOOC] 인공지능과 윤리적 가치: 알고리즘 설계와 편향적 지표 조율",
    provider: "K-MOOC",
    level: "입문",
    category: "디지털 실무",
    tags: ["AI 윤리", "알고리즘 감사", "공정성 지표", "가치 조율"],
    duration: "총 6주 (주당 2시간)",
    description: "인공지능 시스템이 초래할 수 있는 사회적 불평등과 데이터 편향성을 체계적으로 추적하고, 이를 해결하기 위한 기술적/정책적 알고리즘 감사 프레임워크를 정립하는 인문/기술 융합 특화 강의입니다.",
    curriculum: [
      "1주차: 알고리즘 편향성의 역사와 인공지능 공정성(Fairness) 기본 척도",
      "2주차: 데이터 샘플링 및 레이블 편향을 자동으로 보정하는 파이썬 감사 도구",
      "3주차: Explainable AI(설명 가능한 인공지능) 원리와 실무 모델 적용",
      "4주차: 글로벌 기업 및 주요국 정부의 고신뢰성 AI 가이드라인 규제 분석"
    ],
    isHighlight: false,
    link: "http://www.kmooc.kr"
  },
  {
    id: 117,
    title: "[K-MOOC] 파이썬 기반 빅데이터 정량 통계 분석 및 다차원 데이터 시각화",
    provider: "K-MOOC",
    level: "중급",
    category: "디지털 실무",
    tags: ["정량 분석", "빅데이터", "데이터 시각화", "Seaborn"],
    duration: "총 8주 (주당 3시간)",
    description: "사회과학 및 비즈니스 의사결정에 널리 활용되는 회귀분석, 상관분석, 요인분석 등 고도화 통계 모형을 파이썬 라이브러리로 수월하게 구현하고, 복잡한 다차원 데이터를 직관적인 시각화 차트로 연출하는 마스터 강의입니다.",
    curriculum: [
      "1주차: 표본 데이터에 적합한 가설 검정 및 기초 정량 통계 핵심 개념",
      "2주차: 다중회귀분석 및 시계열 추세 분석을 위한 통계 모델 파이프라인",
      "3주차: Seaborn 및 Plotly 라이브러리를 이용한 인터랙티브 대시보드 시각화",
      "4주차: 사회적 지표 연구용 공공 통계 데이터 정제 해커톤 실습"
    ],
    isHighlight: false,
    link: "http://www.kmooc.kr"
  },
  {
    id: 118,
    title: "[K-MOOC] 인공지능 이미지 분석 기초와 컴퓨터 비전 딥러닝 실무",
    provider: "K-MOOC",
    level: "고급",
    category: "디지털 실무",
    tags: ["이미지 분석", "컴퓨터 비전", "CNN", "딥러닝"],
    duration: "총 7주 (주당 3시간)",
    description: "비정형 이미지 및 영상 자원에 내포된 유의미한 객체를 검출하고, 세분화(Segmentation) 및 광학문자인식(OCR) 라이브러리를 활용하여 텍스트 자료로 완전 변환하는 딥러닝 기반의 영상 처리 고급 실무 과정입니다.",
    curriculum: [
      "1주차: 이미지 데이터 구조 이해 및 OpenCV 라이브러리 전처리 필수 기법",
      "2주차: 합성곱신경망(CNN) 기초 아키텍처와 특징 맵(Feature Map) 가시화",
      "3주차: Pre-trained 사전학습 모델 전이 학습을 통한 연구용 객체 식별",
      "4주차: 실무 오프라인 보고서 자동 디지털 인덱싱용 OCR AI 파이프라인 개발"
    ],
    isHighlight: true,
    link: "http://www.kmooc.kr"
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
    content: "유럽연합(EU)의 CSRD 시행 계획이 한국 기업들에게도 파급력을 미치고 있습니다. 이번에 도입되는 글로벌 공시 2.0 핵심은 '이중 중요성(Double Materiality)' 적용 여부입니다. 기업의 경영 활동이 지구 환경과 커뮤니티 삶에 미치는 임팩트(Inside-out)와, 기후 위기 및 환경 규제가 기업의 지속가능성에 미치는 재무적 영향(Outside-in)을 동일한 눈높이에서 계량 작성하여 외부 이해관계자에게 전면 오픈해야 합니다. 국내 주요 대기업 연구진은 글로벌 경쟁력을 잃지 않기 위해 선제적으로 기후 공시 인프라를 전면 가동하겠다는 방침을 드러내고 있습니다.",
    category: "AI/SV",
    publishedAt: "2026-06-22",
    source: "ESG 글로벌 브리프",
    readTime: "4분",
    isFeatured: true
  }
];

export const SEED_REPORTS: Report[] = [
  {
    id: 1,
    title: "2026 기업 사회공헌 지표 및 사회적 이익 보고서",
    institution: "사회적가치연구원 (CSES)",
    tags: ["사회공헌", "화폐화", "ESG", "CSES"],
    category: "국내",
    publishedYear: 2026,
    downloads: 4890,
    fileSize: "5.4 MB",
    abstract: "국내 주요 500대 기업을 대상으로 실시한 화폐화 측정 프로젝트 결과를 담은 신규 연합 보고서입니다.",
    link: "https://www.cses.re.kr"
  },
  {
    id: 2,
    title: "글로벌 ESG 공시 2.0 및 이중 중요성 평가 전면 가이드라인",
    institution: "ISSB & 유럽연합",
    tags: ["ESG 공시", "이중 중요성", "CSRD", "글로벌 표준"],
    category: "국외",
    publishedYear: 2026,
    downloads: 3750,
    fileSize: "6.2 MB",
    abstract: "ISSB 기후 표준안 및 EU CSRD 도입 가속화에 맞춰, 기업의 '재무적 임팩트'와 '사회환경적 임팩트'를 양방향 공시하는 이중 중요성 기조를 전면 해설한 가이드북입니다.",
    link: "https://www.ifrs.org"
  },
  {
    id: 3,
    title: "사회성과인센티브(SPC) 10년의 성과와 향후 과제 연구서",
    institution: "사회적가치연구원 (CSES)",
    tags: ["SPC", "사회적가치", "인센티브", "성과측정"],
    category: "국내",
    publishedYear: 2025,
    downloads: 5120,
    fileSize: "8.3 MB",
    abstract: "사회성과인센티브(SPC) 출범 10주년을 맞아 그간 참여 기업들이 창출해 낸 사회적 가치를 종합적으로 정량 분석하고, 차세대 SPC 측정 메커니즘을 정립한 학술 보고서입니다.",
    link: "https://www.cses.re.kr"
  },
  {
    id: 4,
    title: "지방소멸 대응을 위한 사회성과연계채권(SIB) 성과 보상체계 타당성 검토",
    institution: "국토연구원 (KRIHS)",
    tags: ["지방소멸", "SIB", "사회성과연계채권", "지역활성화", "혁신 사례"],
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
    title: "The role of artificial intelligence in achieving the Sustainable Development Goals",
    author: "Ricardo Vinuesa, Hossein Azizpour, Iolanda Leite, Masoumeh Balaei, Virginia Dignum, Frank Domhagen, Anna Felländer, Simone Langhans, Max Tegmark & Francesco Fuso Nerini",
    date: "2020.01",
    tag: "Policy Paper",
    publisher: "Nature Communications",
    doi_or_id: "DOI: 10.1038/s41467-020-16240-3",
    abstract: "본 연구는 인공지능(AI)이 UN 지속가능발전목표(SDGs)의 17개 목표와 169개 세부 과제 달성에 미치는 영향을 분석하였습니다. AI가 134개 세부 목표(79%) 달성을 촉진하는 긍정적 촉매제 역할을 수행할 수 있는 반면, 정보 격차 심화 및 에너지 소모 등의 부작용으로 59개 세부 목표(35%)에 부정적인 영향을 줄 수 있음을 실증하였습니다.",
    link: "https://www.nature.com/articles/s41467-020-16240-3"
  },
  {
    id: 2,
    title: "How Generative AI Will Change Jobs",
    author: "Thomas H. Davenport, Ian Barkin",
    date: "2023.06",
    tag: "Analysis",
    publisher: "Harvard Business Review (HBR)",
    doi_or_id: "HBR-2023-06",
    abstract: "생성형 AI가 현대 노동 시장의 직무 구조와 임직원 생산성에 미치는 직접적인 영향을 실증적으로 분석하였습니다. 단순 업무의 자동화를 넘어, 인간의 창의적 업무 프로세스를 보완하는 협업 모델의 중요성을 다루며, 기술 도입에 맞춘 인력 재교육(Reskilling)과 적응 능력 강화의 당위성을 제시합니다.",
    link: "https://hbr.org/2023/06/how-generative-ai-will-change-jobs"
  },
  {
    id: 3,
    title: "Governing AI for Humanity: Final Report",
    author: "UN High-level Advisory Body on Artificial Intelligence",
    date: "2024.09",
    tag: "Policy Paper",
    publisher: "United Nations (UN)",
    doi_or_id: "UN-AI-GOV-2024",
    abstract: "UN 사무총장 직속 AI 고위급 자문위원회가 발표한 글로벌 AI 거버넌스 최종 보고서입니다. 기술 격차 해소, 공통 표준 수립, 윤리적 활용 준수를 골자로 하며, AI 혁신으로부터 소외되는 개발도상국을 포용하기 위한 '글로벌 AI 임팩트 기금' 설치 및 공통의 리스크 진단 표준안 수립을 전 세계에 제안합니다.",
    link: "https://www.un.org/en/ai-advisory-body"
  },
  {
    id: 4,
    title: "EU Artificial Intelligence Act (EU AI Act)",
    author: "European Parliament",
    date: "2024.03",
    tag: "Policy Paper",
    publisher: "European Parliament (EU)",
    doi_or_id: "EU-ACT-24",
    abstract: "유럽연합(EU)의 전 세계 최초의 인공지능 법안입니다. AI 기술의 위험 범주를 '수용 불가능한 위험', '고위험', '제한된 위험', '최소 위험'의 4단계로 나누어 차등적 규제를 적용하며, 고위험 AI에 대한 투명성 공시 의무, 알고리즘 감사, 시민 기본권 보호 가이드라인을 강제하고 이를 위반할 시 강력한 징벌적 과징금을 처분하도록 정립했습니다.",
    link: "https://www.europarl.europa.eu/news/en/headlines/society/20230601STO93804/eu-ai-act-first-regulation-on-artificial-intelligence"
  },
  {
    id: 5,
    title: "사회성과인센티브(SPC) 10년의 성과와 향후 과제 연구서",
    author: "나석권, 최명, 정경윤 (CSES 연구진)",
    date: "2025.04",
    tag: "Deep Dive",
    publisher: "사회적가치연구원 (CSES)",
    doi_or_id: "CSES-SPC-10YR",
    abstract: "사회성과인센티브(SPC) 제도의 도입 10주년을 맞아, 참여 기업들이 창출한 사회성과 측정 결과를 종합 계량화하고 사회적 가치(SV) 화폐화 산출 지표를 체계적으로 분석한 공식 학술 보고서입니다. SPC를 통한 소셜 벤처 생태계의 성장 촉진 효과 및 차세대 성과보상체계 설계안을 제안합니다.",
    link: "https://www.cses.re.kr/board/research/list.do"
  },
  {
    id: 6,
    title: "The economic potential of generative AI: The next productivity frontier",
    author: "Michael Chui, James Manyika, Lareina Yee",
    date: "2023.06",
    tag: "Analysis",
    publisher: "McKinsey Global Institute",
    doi_or_id: "MGI-GENAI-2023",
    abstract: "생성형 AI의 상용화가 글로벌 경제의 부가가치 및 전 산업 부문 생산성 향상에 끼치는 파급 효과를 실증 분석하였습니다. 보고서에 따르면 생성형 AI는 연간 약 2.6조 달러에서 4.4조 달러 규모의 추가적인 경제적 편익을 창출할 잠재력을 보유하고 있으며, 고객 서비스, 마케팅, 소프트웨어 공학 등 핵심 직무군에서의 자동화 속도를 전격 가속화할 것임을 구체적 통계 지표로 입증하였습니다.",
    link: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier"
  },
  {
    id: 7,
    title: "Artificial Intelligence Index Report 2024",
    author: "Nestor Maslej, Loredana Fattorini, Ray Perrault, Jack Clark",
    date: "2024.04",
    tag: "Analysis",
    publisher: "Stanford University (HAI)",
    doi_or_id: "HAI-INDEX-24",
    abstract: "전 세계 AI 기술 성능의 발전 흐름, 상용화 동향, 학술 연구 발표 수, 컴퓨팅 전력 소모에 따른 탄소 발자국 및 각국의 법적 규제 추이를 분석한 스탠퍼드 HAI의 연례 지표 보고서입니다. AI 기술 훈련 비용의 급증 추세와 기술 격차, 대형 언어 모델의 유해성과 신뢰성 검증 지표를 다각도로 조사하였습니다.",
    link: "https://hai.stanford.edu/research/ai-index-report-2024"
  },
  {
    id: 8,
    title: "Actionable Auditing: Investigating the Impact of Publicly Facing Biased Facial Analysis Systems",
    author: "Inioluwa Deborah Raji, Joy Buolamwini",
    date: "2019.01",
    tag: "Deep Dive",
    publisher: "MIT Media Lab / ACM",
    doi_or_id: "10.1145/3306618.3314244",
    abstract: "상용 인공지능 안면 인식 알고리즘 모델에 유해하게 내재된 인종 및 성별 편향성을 비판적으로 폭로하고, 이를 해결하기 위한 정기적인 알고리즘 감사(Algorithmic Audit)의 구조적 기준을 제시한 선구적인 학술 논문입니다. 기술이 지향해야 할 공정성과 사회적 기여 가치를 실증 설계로 규명했습니다.",
    link: "https://dl.acm.org/doi/10.1145/3306618.3314244"
  },
  {
    id: 9,
    title: "Constitutional AI: Harmlessness from AI Feedback",
    author: "Yuntao Bai, Saurabh Kadavath, Sandipan Kundu, Amanda Askell",
    date: "2022.12",
    tag: "Deep Dive",
    publisher: "Anthropic Research",
    doi_or_id: "arXiv:2212.08073",
    abstract: "인간의 수동 피드백(RLHF) 대신 명문화된 헌법적 가치 지침(Constitutional Rules)과 자가 피드백 루프를 결합하여 인공지능 스스로 무해성(Harmlessness)과 안전성을 최적화해 고도 훈련하도록 돕는 'Constitutional AI' 방법론을 기술적으로 정립한 기념비적 논문입니다.",
    link: "https://arxiv.org/abs/2212.08073"
  },
  {
    id: 10,
    title: "Green AI",
    author: "Roy Schwartz, Jesse Dodge, Noah A. Smith, Oren Etzioni",
    date: "2020.12",
    tag: "Field Report",
    publisher: "Communications of the ACM",
    doi_or_id: "10.1145/3381831",
    abstract: "인공지능 연구 및 훈련 과정에서 컴퓨팅 스케일의 급증에 따른 전기적 소모량과 무분별한 이산화탄소 탄소 발자국 축적을 'Green AI'라는 친환경 ESG 개념을 통해 비판적으로 입증하였습니다. 모델 정확도(Accuracy)뿐만 아니라 연산당 에너지 효율성(Efficiency)을 AI 평가의 공식 핵심 척도로 삼아야 함을 정량 계측식으로 주장합니다.",
    link: "https://arxiv.org/abs/1907.10597"
  },
  {
    id: 11,
    title: "The Global Risks Report 2024",
    author: "World Economic Forum (WEF) Research",
    date: "2024.01",
    tag: "Investment",
    publisher: "World Economic Forum (WEF)",
    doi_or_id: "WEF-RISK-2024",
    abstract: "글로벌 비즈니스 및 지구 환경 측면의 위험 요인들을 종합 서베이한 세계경제포럼의 글로벌 리스크 보고서입니다. 기술 부문의 최고 위험 요소로 생성형 AI를 매개로 한 잘못된 정보(Misinformation/Disinformation) 유포를 꼽고 있으며, 기후 변화 대응 실패 및 지정학적 불안정성과의 상호 인과 관계를 구조적으로 조명하였습니다.",
    link: "https://www.weforum.org/publications/global-risks-report-2024/"
  },
  {
    id: 12,
    title: "Tasks, Automation, and the Labor Market in the Era of AI",
    author: "Daron Acemoglu, Pascual Restrepo",
    date: "2019.05",
    tag: "Analysis",
    publisher: "National Bureau of Economic Research (NBER)",
    doi_or_id: "NBER-w25875",
    abstract: "디지털 자동화 및 인공지능 도입이 현대 가계 노동 시장의 고용 비율과 실질 임금 성장에 미치는 불균형적 파급 효과를 작업(Tasks) 중심 프레임워크를 기반으로 거시 분석하였습니다. 자동화의 대체 효과가 신규 일자리 창출의 생산성 증대 효과를 상회할 때 야기되는 사회적 불평등 구조를 수식 모델로 증명하고 대응 정책 방향을 피력했습니다.",
    link: "https://www.nber.org/papers/w25875"
  }
];
