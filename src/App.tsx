import React, { useState, useEffect, useRef } from "react";
import { 
  Home as HomeIcon, 
  BookOpen, 
  Newspaper, 
  Database, 
  Terminal, 
  Info, 
  Clock, 
  Search, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  User,
  X, 
  Send, 
  Loader2, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  ExternalLink,
  SlidersHorizontal,
  Bookmark,
  FileText,
  RefreshCw,
  Award,
  HelpCircle,
  ArrowRight,
  Calendar,
  Table,
  Lightbulb,
  Cpu,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";
import { motion } from "motion/react";
import { 
  SEED_COURSES, 
  SEED_NEWS, 
  SEED_REPORTS, 
  PROMPT_TEMPLATES, 
  RESEARCH_INSIGHTS,
  Course, 
  NewsArticle, 
  Report, 
  ChatMessage,
  ResearchInsight
} from "./types";
import { TypingText } from "./components/TypingText";

// Enhanced courses with custom cost values
interface EnhancedCourse extends Course {
  costType: "무료" | "유료";
}

const ENHANCED_COURSES: EnhancedCourse[] = SEED_COURSES.map(course => {
  // Public/K-MOOC and AI Innovator are free, private/productivity masterclasses are paid
  const isFree = course.provider.includes("K-MOOC") || course.provider.includes("CSES") || course.id % 2 === 1;
  return {
    ...course,
    costType: isFree ? "무료" : "유료"
  };
});

export default function App() {
  // --------------------------------------------------
  // 1. App Navigation & Theme State
  // --------------------------------------------------
  const [activeTab, setActiveTab] = useState<"Home" | "DailyNews" | "AIClassroom" | "DeepInsight_DB" | "DeepInsight_Prompt" | "Guide">("Home");
  const [time, setTime] = useState<Date>(new Date());
  
  // Real-time Clock synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --------------------------------------------------
  // 2. Naver News Search API States & Fetcher
  // --------------------------------------------------
  const [naverNews, setNaverNews] = useState<any[]>([]);
  const [naverSearchQuery, setNaverSearchQuery] = useState<string>("AI 기술");
  const [isNaverNewsLoading, setIsNaverNewsLoading] = useState<boolean>(false);

  // High-fidelity image and category news states for UI match
  const [cachedNewsList, setCachedNewsList] = useState<any[]>([]);
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>("전체");
  const [newsSearchText, setNewsSearchText] = useState<string>("");
  const [newsDateFilter, setNewsDateFilter] = useState<string>("");
  const [newsPage, setNewsPage] = useState<number>(1);

  // Reset page when filters change
  useEffect(() => {
    setNewsPage(1);
  }, [newsCategoryFilter, newsSearchText, newsDateFilter]);

  const decodeAndCleanHtml = (str: string) => {
    if (!str) return "";
    return str
      .replace(/<[^>]*>?/gm, "")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  };

  const getNewsImageFallback = (index: number) => {
    const fallbacks = [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
      "https://images.unsplash.com/photo-1507146482235-478696bd9465",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
    ];
    return `${fallbacks[index % fallbacks.length]}?auto=format&fit=crop&q=80&w=800`;
  };

  const getNewsCategory = (title: string, description: string) => {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes("규제") || text.includes("법") || text.includes("가이드라인") || text.includes("정책") || text.includes("정부") || text.includes("제재") || text.includes("의무") || text.includes("공시") || text.includes("의무화") || text.includes("소멸") || text.includes("에토스") || text.includes("윤리")) {
      return "규제";
    }
    if (text.includes("연구") || text.includes("보고서") || text.includes("지표") || text.includes("sroi") || text.includes("대학") || text.includes("조사") || text.includes("학술") || text.includes("분석") || text.includes("포럼") || text.includes("발표") || text.includes("세미나") || text.includes("학회")) {
      return "연구";
    }
    return "기술";
  };

  const getNewsFirstLine = (text: string): string => {
    if (!text) return "";
    let cleanText = text.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&apos;/g, "'").trim();
    let firstLine = cleanText.split("\n")[0].trim();
    const match = firstLine.match(/[^.!?]+[.!?]/);
    if (match) {
      return match[0].trim();
    }
    if (firstLine.length > 120) {
      return firstLine.substring(0, 120) + "...";
    }
    return firstLine;
  };

  const fetchCachedNews = async () => {
    setIsNaverNewsLoading(true);
    try {
      const response = await fetch("/api/news");
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const transformed = data.map((item: any, index: number) => {
            const title = decodeAndCleanHtml(item.title);
            const description = decodeAndCleanHtml(item.summary || item.description);
            const category = item.category || getNewsCategory(title, description);
            const image = item.image || getNewsImageFallback(index);
            return {
              id: item.id || `news-cached-${index}`,
              title,
              summary: getNewsFirstLine(description),
              pubDate: item.date || item.pubDate || "2026-06-24",
              source: item.source || "주요 언론",
              category,
              link: item.link || "https://www.cses.re.kr",
              image
            };
          });
          setCachedNewsList(transformed);
          return;
        }
      }
      setLocalFallbackNewsCache();
    } catch (err) {
      console.warn("Failed to fetch pre-scraped news cache:", err);
      setLocalFallbackNewsCache();
    } finally {
      setIsNaverNewsLoading(false);
    }
  };

  const setLocalFallbackNewsCache = () => {
    const formatted = SEED_NEWS.map((n, i) => ({
      id: `news-fallback-${i}`,
      title: n.title,
      summary: getNewsFirstLine(n.description),
      pubDate: n.publishedAt,
      source: n.source,
      category: n.category === "지역혁신" || n.category === "AI/SV" ? "연구" : "기술",
      link: "https://www.cses.re.kr",
      image: getNewsImageFallback(i)
    }));
    setCachedNewsList(formatted);
  };

  useEffect(() => {
    fetchCachedNews();
  }, []);

  const fetchNaverNews = async (queryText: string) => {
    setIsNaverNewsLoading(true);
    try {
      const response = await fetch(`/api/naver-news?query=${encodeURIComponent(queryText)}&display=30`);
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          const items = data.items || [];
          const transformed = items.map((item: any, index: number) => {
            const title = decodeAndCleanHtml(item.title);
            const description = decodeAndCleanHtml(item.description);
            const pubDate = item.pubDate ? new Date(item.pubDate).toISOString().split("T")[0] : "2026-06-24";
            const source = item.source || "주요 언론";
            const category = getNewsCategory(title, description);
            const image = item.image || getNewsImageFallback(index);
            return {
              id: `news-naver-${index}-${Date.now()}`,
              title,
              summary: getNewsFirstLine(description),
              pubDate,
              source,
              category,
              link: item.originallink || item.link,
              image
            };
          });
          setCachedNewsList(transformed);
          return;
        }
      }
      setLocalFallbackNewsCache();
    } catch (err) {
      console.warn("Failed to retrieve live Naver news, using fallback cache:", err);
      setLocalFallbackNewsCache();
    } finally {
      setIsNaverNewsLoading(false);
    }
  };

  const setLocalFallbackNews = () => {
    // Map existing SEED_NEWS articles to match Naver API format
    const formatted = SEED_NEWS.map(n => ({
      title: n.title,
      description: n.description,
      pubDate: n.publishedAt,
      source: n.source,
      origin: n.category === "지역혁신" || n.category === "AI/SV" ? "국내" : "해외",
      link: "https://www.cses.re.kr"
    }));
    setNaverNews(formatted);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchNaverNews(naverSearchQuery);
    }, 400);
    return () => {
      clearTimeout(handler);
    };
  }, [naverSearchQuery]);

  // Helper: Group news by publication date (YYYY-MM-DD or YYYY년 MM월 DD일)
  const groupNewsByDate = (newsList: any[]) => {
    if (!Array.isArray(newsList)) return {};
    const sorted = [...newsList].sort((a, b) => {
      const dateA = typeof a?.pubDate === "string" ? a.pubDate : "";
      const dateB = typeof b?.pubDate === "string" ? b.pubDate : "";
      return dateB.localeCompare(dateA);
    });
    const groups: { [key: string]: any[] } = {};
    
    sorted.forEach(item => {
      if (!item) return;
      let dateLabel = "2026년 06월 23일";
      if (typeof item.pubDate === "string") {
        const parts = item.pubDate.split("-");
        if (parts.length === 3) {
          dateLabel = `${parts[0]}년 ${parseInt(parts[1])}월 ${parseInt(parts[2])}일`;
        } else {
          // handles alternative date formats gracefully
          dateLabel = item.pubDate;
        }
      }
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(item);
    });
    return groups;
  };

  const groupedNews = groupNewsByDate(naverNews);

  // --------------------------------------------------
  // 3. Platform Guide Modal State
  // --------------------------------------------------
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // --------------------------------------------------
  // 4. Custom AI Classroom Explorer & Chatbot State
  // --------------------------------------------------
  const [searchCourseQuery, setSearchCourseQuery] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("전체");
  const [filterProvider, setFilterProvider] = useState<string>("전체");
  
  // Survey/Diagnostics state variables
  const [isSurveyOpen, setIsSurveyOpen] = useState<boolean>(false);
  const [surveyStep, setSurveyStep] = useState<number>(1);
  const [surveyAnswers, setSurveyAnswers] = useState({
    level: "",
    topic: "",
    skill: ""
  });
  const [diagnosedCourseIds, setDiagnosedCourseIds] = useState<number[]>([]);

  const handleStartSurvey = () => {
    setSurveyAnswers({ level: "", topic: "", skill: "" });
    setSurveyStep(1);
    setIsSurveyOpen(true);
  };

  const handleSurveyOption = (field: "level" | "topic" | "skill", value: string) => {
    const updated = { ...surveyAnswers, [field]: value };
    setSurveyAnswers(updated);
    
    if (surveyStep < 3) {
      setSurveyStep(prev => prev + 1);
    } else {
      // Calculate matching course recommendations
      calculateDiagnostics(updated);
      setSurveyStep(4);
    }
  };

  const calculateDiagnostics = (answers: typeof surveyAnswers) => {
    // Recommend courses based on the user's desired goal (skill choice)
    const matches = ENHANCED_COURSES.filter(course => {
      if (answers.skill === "데이터 분석 및 시각화 자동화") {
        return course.title.includes("데이터") || course.title.includes("시각화") || course.title.includes("파이썬") || course.id === 102 || course.id === 103 || course.id === 107;
      }
      if (answers.skill === "AI RAG 챗봇 제작 및 정보 검색") {
        return course.title.includes("RAG") || course.title.includes("챗봇") || course.title.includes("에이전트") || course.id === 104 || course.id === 109;
      }
      if (answers.skill === "고급 프롬프트 엔지니어링") {
        return course.title.includes("프롬프트") || course.title.includes("Prompt") || course.id === 101 || course.id === 108 || course.id === 106;
      }
      if (answers.skill === "행정 단순 반복 업무 자동화") {
        return course.title.includes("생산성") || course.title.includes("자동화") || course.title.includes("업무") || course.id === 105 || course.id === 102;
      }
      return true;
    });

    const ids = matches.length > 0 ? matches.map(c => c.id) : [101, 102, 104, 105, 108];
    setDiagnosedCourseIds(ids);
  };

  const clearDiagnosticsFilter = () => {
    setDiagnosedCourseIds([]);
    setIsSurveyOpen(false);
  };

  // AI Dialog Chatbot States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "cur-wel-msg",
      role: "model",
      content: `반갑습니다. **사회적가치연구원(CSES) AI 큐레이션 코치**입니다.\n\n연구원님의 실질적인 업무 전문성(예: SROI 화폐계측, GRI 표준 준수 등)을 고도화할 수 있도록 지원합니다. 궁금한 교육 내용이나 필요한 자원 분류를 질문해 주세요!`,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [activeCourseChat, setActiveCourseChat] = useState<EnhancedCourse | null>(null);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    const textToSend = chatInput;
    setChatInput("");

    try {
      const history = chatMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/education/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: history,
          selectedCourseContext: activeCourseChat
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "model",
            content: data.reply,
            timestamp: new Date()
          }
        ]);
        if (data.recommendedCourseIds) {
          setDiagnosedCourseIds(data.recommendedCourseIds);
        }
      } else {
        throw new Error();
      }
    } catch {
      // Fallback
      setChatMessages(prev => [
        ...prev,
        {
          id: `ai-fail-${Date.now()}`,
          role: "model",
          content: `[임시 로컬 데이터 복구 서비스 가동]\n\n연구원님께서 문의하신 **"${textToSend}"** 주제는 우리 연구원의 주요 연구 분야와 밀접합니다. 하단 교육 대시보드 리스트에서 수준별 ESG 및 공익 가치 과정을 찾아보세요.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --------------------------------------------------
  // 5. Deep Insight Modal & API state (News summary, prompts, report DB)
  // --------------------------------------------------
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  const handleOpenNewsDetail = (newsItem: any) => {
    setSelectedNews(newsItem);
  };

  // Prompt Library Custom States
  const [promptSearchQuery, setPromptSearchQuery] = useState<string>("");
  const [promptIdea, setPromptIdea] = useState<string>("");
  const [isIdeaSubmitted, setIsIdeaSubmitted] = useState<boolean>(false);
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);

  // Submitted Prompt Ideas State for Bulletin Board
  const [submittedPromptIdeas, setSubmittedPromptIdeas] = useState<any[]>([
    {
      id: "idea-1",
      content: "학술 연구 논문 초록의 핵심 내용만 구조화하여 국문으로 요약하고 키워드를 추출해주는 번역-요약 하이브리드 프롬프트가 필요합니다.",
      author: "이지은 연구원",
      date: "2026-06-25",
      status: "제안 검토 완료",
      hasImplemented: true
    },
    {
      id: "idea-2",
      content: "사회적가치(SV) 화폐화 측정 원데이터 엑셀 파일을 업로드하기 전, 누락 데이터(NaN)가 있는 부분을 검진해주는 파이썬 코드 생성용 프롬프트를 원합니다.",
      author: "김민재 연구원",
      date: "2026-06-24",
      status: "검토 진행 중",
      hasImplemented: false
    },
    {
      id: "idea-3",
      content: "특정 기업의 지속가능경영보고서(ESG)의 온실가스 배출 추이 정보만 추출하여 연도별 비교 표로 정리하는 특화 프롬프트를 제안합니다.",
      author: "최영진 연구원",
      date: "2026-06-22",
      status: "제안 검토 완료",
      hasImplemented: true
    }
  ]);

  const [customPrompts, setCustomPrompts] = useState([
    {
      id: 1,
      category: "ADMINISTRATION",
      title: "📋 회의록 요약 및 후속 행정 메일 기안",
      subtitle: "전사 데이터나 요약 기록을 체계적인 회의록과 고품격 수신인별 후속 행정 메일로 재가공합니다.",
      labTip: "Gemini 2.0 Flash 또는 GPT-4o를 사용해 단순 회의록을 넘어, 부서별 주요 R&R과 일정(Action Item)을 표 형태로 도출하는 데 탁월합니다.",
      promptText: `너는 CSES(사회적가치연구원)의 행정 비서이자 행정 효율화 전문가야. 아래 제공되는 '회의 전사 데이터 또는 나열식 회의 핵심 골자'를 분석하여 실무용 회의록과 담당자별 후속 조치 안내 이메일 기안을 격조 있게 작성해줘.

[회의 전사 데이터 / 골자]:
"[이곳에 회의 내용이나 전사본을 입력하세요]"

[요청 서식 가이드]:
1. **회의 개요**: 일시, 장소(미기재 시 공란), 참석자, 핵심 아젠다 3가지 요약
2. **논의 및 의결 사항**: 각 안건별 논의 내용 및 의결된 핵심 결정을 개조식으로 명료하게 정리
3. **Action Items (R&R)**: [담당부서/담당자 | 구체적 업무 | 데드라인 | 현재 상태(대기/진행중)] 구조의 마크다운 표(Table)로 도출
4. **후속 조치 행정 메일**: 전사 직원 또는 관련 담당자들에게 발송할 정중하고 정제된 이메일 초안 작성 (수신인 명시, 회의 주요 성과 공유, R&R 이행 요청 포함)`
    },
    {
      id: 2,
      category: "TRANSLATION",
      title: "🌐 영문 학술 자료 및 보고서 정밀 의역",
      subtitle: "단순 직역을 탈피하여, 사회공헌 및 ESG/SV 관련 전문 학술 맥락과 업계 전문 용어를 반영한 고급 의역을 제공합니다.",
      labTip: "Claude 3.5 Sonnet이나 Gemini 1.5 Pro를 연동하여 기계적인 기계 번역 투를 정교한 한국어 논문/보고서 문체로 가공해 보세요.",
      promptText: `너는 영미권 경제학 및 사회과학 저널(Nature, HBR, Oxford Academic 등)에 정통한 전문 학술 번역가이자 사회적 가치(SV) 및 ESG 도메인 지식이 깊은 CSES 연구원이야. 아래 제공되는 영문 논문 초록 또는 보고서 전문을 번역해줘.

[번역 요청 텍스트]:
"[이곳에 번역할 영문 텍스트를 입력하세요]"

[번역 및 교정 가이드]:
1. **맥락적 의역**: 기계적인 일대일 직역을 철저히 배제하고, 자연스러운 한국어 학술체(~것으로 파악된다, ~라 분석된다)로 작성해줘.
2. **SV/ESG 전문 용어 치환**: 도메인 표준어 적용 (예: 'Social Returns' -> '사회적 편익/성과', 'Externalities' -> '외부효과', 'Carbon footprint' -> '탄소 발자국', 'Value alignment' -> '가치 정렬').
3. **핵심 키워드 설명**: 번역문 하단에 핵심 전문 용어 3~5개를 선정하고, 해당 단어가 논문 내에서 가지는 학술적 정의를 간략히 해설해줘.`
    },
    {
      id: 3,
      category: "PROPOSAL",
      title: "🏛️ 제안서 작성 (공공기관 및 정부 부처 지원용)",
      subtitle: "공공기관, 지자체, 혹은 유관 정부 부서의 공모전이나 정부 과제 수탁에 부합하는 철저한 공문서식 제안서 초안을 빌드합니다.",
      labTip: "GPT-4o나 Claude 3.5 Sonnet을 활용하면 예산 배정 명분, 정책 정합성 및 사회적 파급 효과를 완벽한 기안서 톤으로 채울 수 있습니다.",
      promptText: `너는 대한민국 정부 부처(행안부, 고용부, 중기부 등) 및 지자체의 예산 심의를 완벽히 통과할 수 있는 사업 제안서를 작성하는 공공 기획 전문가야. 아래의 '기초 사업 개요'를 바탕으로 공공기관 맞춤형 제안서 초안을 기획해줘.

[기초 사업 개요]:
"[이곳에 핵심 사업 개요, 대략적인 예산, 주요 타겟층을 입력하세요]"

[제안서 작성 프레임워크]:
1. **사업명**: 공공 정책 기조에 부합하며 명확하고 매력적인 타이틀 제시 (예: '로컬 임팩트 활성화를 위한 ~')
2. **사업 배경 및 필요성**: 관련 정부 정책 및 사회적 이슈(예: 인구 소멸, 탄소 중립 등)와 사업의 강력한 연결 고리 제시
3. **사업 목표 및 내용**: 정량적 목표(수혜자 수, 창출 가치 등)와 정성적 비전 설계
4. **추진 체계 및 예산 구성안**: 타당성 높은 단계별 추진 계획 및 예산 배정 근거
5. **기대 효과 (공공 편익 및 SROI)**: 본 사업을 통해 창출되는 사회적 편익을 화폐 가치적 관점(Social Return on Investment) 및 지자체 지속가능성 관점에서 정량/정성 서술
6. **말투 및 형식**: 정형화된 공문서식 말투('~코자 함', '~하겠음', '추진 배경', '기대 효과' 등 명사형 종결 어미 활용)를 엄격히 준수할 것.`
    },
    {
      id: 4,
      category: "RESEARCH",
      title: "📚 학술 논문 요약 및 비판적 리포트 생성",
      subtitle: "논문의 핵심 가설, 방법론, 분석 데이터, 한계점을 구조화하여 요약하고, 연구원이 참고할 논리적 보완점까지 비판적으로 제언합니다.",
      labTip: "Gemini 1.5 Pro나 Claude 3.5 Sonnet의 논리적 추론 모델을 활성화하면 논문의 숨겨진 허점이나 방법론적 논거를 철저히 검증해 줍니다.",
      promptText: `너는 사회과학 및 소셜 임팩트 분야 최고 수준의 학술지 리뷰어(Reviewer)이자 비판적 경제학 연구원이야. 아래 제공된 학술 논문 초록 또는 핵심 텍스트를 읽고 연구 분석 리포트를 작성해줘.

[논문 텍스트]:
"[이곳에 분석할 논문 초록이나 본문 텍스트를 입력하세요]"

[리포트 작성 양식]:
1. **논문 핵심 요약 (Abstract Summary)**: 단 3문장 이내로 핵심 내용 축약
2. **연구 가설 및 독립/종속 변수**: 논문이 증명하고자 하는 핵심 가설과 이에 대응하는 연구 설계 변수 추출
3. **핵심 연구 방법론 및 실증적 결과**: 어떤 통계 기법이나 데이터셋을 사용했는지, 그리고 계측된 수치는 무엇인지 정리
4. **비판적 쟁점 및 학술적 한계점 (Critical Critique)**: 연구 설계의 잠재적 편향(Bias), 인과관계 증명의 한계점, 또는 간과된 외부 변수 2가지 지적
5. **CSES 연구 연계 확장 질문**: 이 논문을 바탕으로 우리 사회적가치연구원(CSES)이 추가로 연구해볼 수 있는 실무적 확장 질문 2가지 제안`
    },
    {
      id: 5,
      category: "RESEARCH",
      title: "💡 사회성과(SV) 연구주제 및 가설 발굴",
      subtitle: "글로벌 트렌드(OBF, ESG, 탄소중립, SROI 등)를 반영하여 실제 실무 보고서로 연결할 수 있는 혁신적인 미래 연구 주제와 가설을 탐색합니다.",
      labTip: "새로운 기획서 작성 시 브레인스토밍 파트너로 Gemini Pro를 활용하여 글로벌 아젠다(WEF, UN 등)와의 정책 싱크를 맞춰보세요.",
      promptText: `너는 사회적 가치(Social Value), 임팩트 금융, ESG 및 SROI(사회적 투자수익률) 분야의 글로벌 석학이자 CSES 리서치 아키텍트야. 아래 관심 키워드나 사회적 아젠다를 참고해 혁신적인 차세대 연구 주제 기획서안을 제시해줘.

[관심 도메인 / 아젠다]:
"[이곳에 아이디어를 얻고 싶은 분야를 입력하세요 (예: 탄소 감축 세액공제권, 노인 돌봄 AI, 소셜 벤처 기금 등)]"

[연구 주제 기획서 가이드]:
1. **추천 연구 제목**: 학술적이고도 실무 임팩트가 직관적으로 전달되는 명료한 제목 (3가지 제안)
2. **핵심 연구 가설 (Hypothesis)**: 실증적으로 검증 가능한 독립변수와 종속변수 간의 가설 설정 (예: 'A 제도를 도입하면 B 성과가 X배 증가할 것이다')
3. **선행 연구 검토 방향**: 어떤 분야의 선행 연구(예: 미국의 IRA TTC 세액공제 사례, 자발적 탄소 시장 VCM 등)를 주로 벤치마크해야 하는지 조언
4. **예상 실증 분석 방법론**: 설문조사, 무작위 통제 실험(RCT), 또는 이중차분법(DID) 등 연구 정밀도를 높일 방법론 제안
5. **기대 학술적/정책적 공헌**: 정부 입법, 기업 CSR 시스템화, 혹은 글로벌 담론 주도에 기여할 시사점 정리`
    },
    {
      id: 6,
      category: "PPT / PRESENTATION",
      title: "📊 PM 보고용 고정 양식 PPT 슬라이드 기안",
      subtitle: "CSES 공식 고정 디자인 가이드라인(Deep Navy & Crimson Red)을 반영해 AI가 그대로 모방하여 디자인하고 아웃라인을 짤 수 있도록 정밀 제안합니다.",
      labTip: "사용자가 첨부한 CSES 업무 현황 보고 공식 양식의 레이아웃, 폰트 및 핵심 컬러칩 정보를 프롬프트 내에 철저하게 탑재하여 제공합니다.",
      promptText: `너는 사회적가치연구원(CSES)의 전문 프레젠테이션(PPT) 디자이너이자 PM 전략 기획자야. 내가 전달하는 '회의록, 보고 내용, 또는 사업 계획 골자'를 바탕으로, **우리 기관(CSES)의 고정 PPT 디자인 양식**에 완벽히 정합하는 '슬라이드별 텍스트 배치 및 비주얼 가이드'를 작성해줘.

[슬라이드로 변환할 원본 내용]:
"[이곳에 PPT 슬라이드로 변환할 내용을 입력하세요]"

[CSES 공식 PPT 디자인 룰셋]:
- **핵심 컬러 테마 (Corporate Identity Color Palette)**:
  - Primary (Deep Navy): \`#10305A\` (주요 타이틀바, 슬라이드 표 상단, 정량 데이터 테두리에 사용)
  - Accent (Crimson Red / Wine Crimson): \`#8A0C25\` 또는 \`#D20A50\` (사회적가치연구원 공식 강조색. 핵심 강조 단어, 둥근 배지, 프로세스 방향 화살표에 적용)
  - Background (Clean Light): \`#F8FAFC\` 또는 \`#F1F5F9\` (배경 카드의 부드러운 화이트/그레이 처리)
- **슬라이드 공통 구조**:
  - **[우측 상단 메타데이터 박스]**: 우측 상단에 연도-월 일련 인덱스를 표시하는 박스 고수 (예: \`25-12\`)
  - **[좌측 상단 카테고리 태그]**: 둥근 사각형 안에 소문자나 국문으로 소속 파트를 표시 (예: \`[보고안건]\`, \`RESEARCH\`, \`SYSTEM AI\`)
  - **[비주얼 2단 분할 레이아웃]**: 슬라이드 내용을 장황하게 줄글로 쓰지 않고, 'Lessons Learned vs 2026년 운영계획' 또는 'Before vs After'처럼 좌우 2열(Two-column) 박스 형태로 대칭 정렬 배치
  - **[수치 가독성 극대화]**: "숫자로 보는 2025"나 "SROI 계측"처럼 중요한 화폐 가치 및 데이터는 좌측에 둥근 아이콘 배지를 부착하고 우측에 커다란 볼드 수치와 증감 추이를 표나 메타 박스 안에 디자인 배치

[요청 출력 서식 (슬라이드별 상세 기획)]:
각 슬라이드(최대 3-4장 분량으로 요약)에 대해 다음 양식으로 출력해줘:
---
**■ Slide [번호]: [슬라이드 핵심 타이틀]**
* **좌측 상단 태그**: [태그명 기재] | **우측 상단 메타 박스**: [25-12]
* **컬러 배합**: Primary (\`#10305A\`) 배경에 Accent (\`#8A0C25\`) 텍스트 강조
* **비주얼 레이아웃 설계**: (예: 2열 대칭 구조로 구성. 좌측 열에는 'Lessons Learned' 3가지 개조식 정리, 우측 열에는 '2026 운영계획' 대응 전략 배치)
* **슬라이드 실물 텍스트 콘텐츠**:
  - (슬라이드에 실제로 들어갈 텍스트를 간결하고 임팩트 있는 보고서체 명사형으로 작성)
* **AI 이미지 생성 및 도표 가이드**: (해당 슬라이드를 파워포인트나 HTML 코드로 구현할 때 사용할 아이콘, 화살표 흐름도, 또는 인포그래픽 구조를 구체적으로 가이드)`
    }
  ]);

  // Prompt Executor States
  const [activePromptTemplate, setActivePromptTemplate] = useState<string>("translator");
  const [promptInputText, setPromptInputText] = useState<string>("");
  const [promptExecutionResult, setPromptExecutionResult] = useState<string>("");
  const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleExecutePrompt = async () => {
    if (!promptInputText.trim() || isPromptLoading) return;
    setIsPromptLoading(true);
    setPromptExecutionResult("");

    try {
      const res = await fetch("/api/prompt/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: activePromptTemplate,
          userContent: promptInputText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPromptExecutionResult(data.result || "");
      } else {
        throw new Error();
      }
    } catch {
      setPromptExecutionResult(`[임시 결과 대체 안내]\n\n입력 내용:\n"${promptInputText}"\n\n현재 대행 점검 상태입니다. 번역 및 기획서 고도화를 완수하려면 Gemini API 키를 로드해 주십시오. 임시 보완 가이드는 우클릭 복사 후 실무에 대입해 보시는 것을 권장합니다.`);
    } finally {
      setIsPromptLoading(false);
    }
  };

  const currentTemplateObj = PROMPT_TEMPLATES.find(t => t.id === activePromptTemplate) || PROMPT_TEMPLATES[0];

  const handleCopyToClipboard = (text: string) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1500);
        })
        .catch((err) => {
          console.error("Failed to copy using navigator.clipboard:", err);
          fallbackCopyText(text);
        });
    } else {
      fallbackCopyText(text);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1500);
      } else {
        console.warn("execCommand copy fallback failed");
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
  };

  // Report SROI Archive States (Legacy / Compatible backup)
  const [reportSearchQuery, setReportSearchQuery] = useState<string>("");
  const [reportFilterCategory, setReportFilterCategory] = useState<string>("전체");
  const [reportSortKey, setReportSortKey] = useState<"downloads" | "publishedYear">("downloads");

  const filteredReports = SEED_REPORTS.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(reportSearchQuery.toLowerCase()) || 
                        r.abstract.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                        r.institution.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                        r.tags.some(t => t.toLowerCase().includes(reportSearchQuery.toLowerCase()));
    const matchCat = reportFilterCategory === "전체" || 
                     (reportFilterCategory === "국내" && r.category === "국내") ||
                     (reportFilterCategory === "국외" && r.category === "국외");
    return matchSearch && matchCat;
  }).sort((a, b) => b[reportSortKey] - a[reportSortKey]);

  // Premium AI Research DB (RESEARCH_INSIGHTS) States
  const [researchSearchQuery, setResearchSearchQuery] = useState<string>("");
  const [researchActiveTag, setResearchActiveTag] = useState<string>("전체");
  const [researchSortOrder, setResearchSortOrder] = useState<"latest" | "oldest">("latest");
  const [expandedInsights, setExpandedInsights] = useState<Record<number, boolean>>({});

  const filteredInsights = RESEARCH_INSIGHTS.filter(item => {
    const query = researchSearchQuery.toLowerCase().trim();
    const matchSearch = query === "" || 
                        item.title.toLowerCase().includes(query) || 
                        item.abstract.toLowerCase().includes(query) || 
                        item.author.toLowerCase().includes(query) || 
                        item.publisher.toLowerCase().includes(query) || 
                        item.doi_or_id.toLowerCase().includes(query) ||
                        item.tag.toLowerCase().includes(query);
    const matchTag = researchActiveTag === "전체" || item.tag === researchActiveTag;
    return matchSearch && matchTag;
  }).sort((a, b) => {
    if (researchSortOrder === "latest") {
      return b.date.localeCompare(a.date);
    } else {
      return a.date.localeCompare(b.date);
    }
  });

  // Download DB Table as clean Excel CSV spreadsheet
  const handleDownloadCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "ID,문서 제목,저자/연구진,발행일자,구분 태그,발행 저널/학회,DOI 또는 식별코드,국문 초록 핵심 요약,공식 다운로드 링크\n";
    
    filteredInsights.forEach(r => {
      const row = [
        r.id,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.author.replace(/"/g, '""')}"`,
        r.date,
        r.tag,
        `"${r.publisher.replace(/"/g, '""')}"`,
        `"${r.doi_or_id.replace(/"/g, '""')}"`,
        `"${r.abstract.replace(/"/g, '""')}"`,
        `"${r.link.replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CSES_AI_DB_Research_Insights_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download News Table as clean Excel CSV spreadsheet
  const handleDownloadNewsCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "순번,기사 제목,출처 언론사,카테고리,발행일자,원문 뉴스 링크\n";
    
    cachedNewsList.forEach((n, index) => {
      const row = [
        index + 1,
        `"${(n.title || "").replace(/"/g, '""')}"`,
        `"${(n.source || "").replace(/"/g, '""')}"`,
        n.category || "미분류",
        n.pubDate || n.date || "",
        `"${(n.link || "").replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CSES_AI_HUB_News_Database_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --------------------------------------------------
  // 6. UI Navigation Rendering Logic
  // --------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-[#FFF5F7]/40 via-slate-50 to-[#F0FDFA]/40 text-slate-800 font-sans selection:bg-brand-100 selection:text-brand-900" id="cses-app-container">
      
      {/* --------------------------------------------------
          GLOBAL TOP NAVIGATION BAR (GNB)
          -------------------------------------------------- */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100/80 sticky top-0 z-50 h-20 flex items-center shadow-[0_2px_15px_rgba(0,0,0,0.015)]">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          
          {/* Left Brand Area */}
          <div className="flex items-center gap-3 cursor-pointer select-none shrink-0" onClick={() => setActiveTab("Home")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D81159] to-[#b50e49] text-white flex items-center justify-center font-black text-base shadow-md shadow-brand-500/15">
              AI
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black tracking-tight text-[#D81159] leading-none">
                CSES AI HUB
              </span>
              <span className="text-[8px] text-slate-400 font-bold tracking-widest uppercase mt-1 leading-none">
                INSIGHT SUPPORT SYSTEM
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs (Horizontal & Responsive Scrollable on mobile) */}
          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {[
              { id: "Home" as const, label: "홈", icon: (className: string) => <HomeIcon className={className} /> },
              { id: "AIClassroom" as const, label: "AI 교육", icon: (className: string) => <BookOpen className={className} /> },
              { id: "DailyNews" as const, label: "AI 뉴스", icon: (className: string) => <Newspaper className={className} /> },
              { id: "DeepInsight_DB" as const, label: "AI DB", icon: (className: string) => <Database className={className} /> },
              { id: "DeepInsight_Prompt" as const, label: "AI 프롬프트", icon: (className: string) => <Terminal className={className} /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/10 scale-[1.02]"
                      : "text-slate-600 hover:bg-brand-50/50 hover:text-brand-500"
                  }`}
                >
                  <span className="shrink-0">{tab.icon(isActive ? "w-4 h-4 text-white" : "w-4 h-4 text-slate-400 group-hover:text-brand-500")}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Area: Search & SV Book Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-32 sm:w-48 lg:w-56 hidden md:block">
              <input
                type="text"
                placeholder="통합 검색..."
                value={naverSearchQuery}
                onChange={(e) => setNaverSearchQuery(e.target.value)}
                className="w-full bg-slate-50/80 text-xs pl-9 pr-4 py-2.5 rounded-full border border-slate-200 outline-none focus:bg-white focus:border-brand-500 transition-all text-slate-800 placeholder-slate-400 font-medium"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <a
              href="https://csessocial.github.io/sv-book/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-4 py-2.5 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-extrabold text-[11px] md:text-xs hover:from-[#D81159] hover:to-[#b50e49] active:scale-95 transition-all duration-200 shadow-sm border border-slate-800 whitespace-nowrap cursor-pointer group"
            >
              <span>SV Book 바로가기</span>
              <span className="group-hover:translate-x-0.5 transition-transform">📖</span>
            </a>
          </div>

        </div>
      </header>

      {/* --------------------------------------------------
          MAIN WORKSPACE LAYOUT Container
          -------------------------------------------------- */}
      <main className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto" id="cses-scroll-viewport">
          
          {/* TAB 1: Home Dashboard inside Bento Grid Layout */}
          {activeTab === "Home" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-12" 
              id="view-dashboard-home"
            >
              
              {/* BAND 1: Beautifully Brighter Soft Gradient Welcome Banner */}
              <div 
                className="relative overflow-hidden bg-gradient-to-tr from-brand-50 via-[#FFF5F7] to-amber-50/40 text-slate-800 rounded-[40px] p-8 md:p-14 lg:p-16 border border-brand-100/70 shadow-xl shadow-brand-500/5 text-start transition-all duration-300"
              >
                {/* Luminous dynamic background blobs */}
                <div className="absolute top-[-50px] right-[-50px] w-96 h-96 rounded-full bg-gradient-to-tr from-pink-300/10 to-brand-500/15 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-100px] left-[10%] w-80 h-80 rounded-full bg-gradient-to-tr from-amber-200/10 to-pink-200/10 blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-6 max-w-4xl">
                  <motion.span 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 uppercase"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
                    CSES AI INSIGHT HUB
                  </motion.span>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
                    AI로 더 넓게,<br />
                    연구를 <span className="bg-gradient-to-r from-brand-500 to-pink-600 bg-clip-text text-transparent">더 깊게.</span>
                  </h1>
                  
                  <div className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl font-semibold min-h-[50px]">
                    <TypingText texts={[
                      "사회적가치연구원(CSES)의 전문 지식과 실시간 인공지능 트렌드 분석을 결합하여,",
                      "연구의 질적 도약을 지원합니다."
                    ]} speed={35} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button 
                      onClick={() => {
                        const el = document.getElementById("platform-guide");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="bg-brand-500 text-white hover:bg-brand-600 font-black text-xs md:text-sm px-6 py-4 rounded-[20px] shadow-md shadow-brand-500/15 hover:shadow-brand-500/25 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                    >
                      플랫폼 가이드 보기 <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                    <button 
                      onClick={handleStartSurvey}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 font-black text-xs md:text-sm px-6 py-4 rounded-[20px] shadow-xs active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                    >
                      AI 역량 자가진단 <Sparkles className="w-4 h-4 text-brand-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* BAND 2: AI News cards with gentle hover and animation */}
              <div className="space-y-6">
                
                {/* Full Width News Block */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-slate-400 shrink-0" />
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">AI 뉴스</h2>
                    </div>
                    <button 
                      onClick={() => setActiveTab("DailyNews")}
                      className="text-xs font-bold text-slate-400 hover:text-[#D20A50] transition cursor-pointer"
                    >
                      전체 뉴스 보기
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cachedNewsList.length > 0 ? (
                      cachedNewsList.slice(0, 3).map((news, index) => (
                        <div 
                          key={`home-news-${news.id || index}`}
                          onClick={() => handleOpenNewsDetail(news)}
                          className="group bg-gradient-to-b from-white to-slate-50/50 hover:to-pink-50/10 rounded-[32px] p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(210,10,80,0.04)] hover:border-pink-200/50 transition-all duration-300 flex flex-col justify-between cursor-pointer space-y-4 text-start hover:-translate-y-1 animate-fadeIn"
                        >
                          <div className="space-y-4">
                            <div className="w-full h-40 rounded-[24px] overflow-hidden bg-slate-100 relative">
                              <img 
                                src={news.image || getNewsImageFallback(index)} 
                                alt={news.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="bg-pink-50 text-[#D20A50] px-2.5 py-1 rounded-lg">{news.category}</span>
                              <span className="text-slate-400">{news.pubDate}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#D20A50] transition-colors line-clamp-2">
                              {news.title}
                            </h3>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Loading State
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={`news-skeleton-${i}`} className="bg-white rounded-[32px] p-5 border border-slate-100 animate-pulse space-y-4">
                          <div className="w-full h-40 bg-slate-100 rounded-[24px]" />
                          <div className="h-4 bg-slate-100 rounded w-1/4" />
                          <div className="h-4 bg-slate-100 rounded w-3/4" />
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* BAND 3: CSES AI HUB 플랫폼 가이드 */}
              <div id="platform-guide" className="space-y-6 pt-4 text-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">CSES AI HUB 플랫폼 가이드</h2>
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm font-medium">
                    연구 효율을 극대화하는 5가지 지능형 핵심 기능을 확인해보세요.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Guide Card 1 */}
                  <motion.div 
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-gradient-to-b from-white to-slate-50/50 hover:to-pink-50/25 rounded-[28px] p-6 border border-slate-150/80 shadow-[0_4px_15px_rgba(0,0,0,0.012)] hover:shadow-[0_15px_35px_rgba(210,10,80,0.04)] hover:border-pink-200/50 flex flex-col justify-between text-start min-h-[290px] transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                        <HomeIcon className="w-5 h-5 text-slate-500" />
                      </div>
                      <h4 className="font-extrabold text-[#D20A50] text-sm">01. 홈 (Home)</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        AI 뉴스, 교육 역량 진단 등 플랫폼의 모든 주요 서비스를 한눈에 모아보는 편리한 시작 화면입니다.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("Home")}
                      className="text-[11px] font-black text-[#D20A50] hover:text-pink-700 pt-4 text-left cursor-pointer flex items-center gap-1 group"
                    >
                      홈 바로가기 <span className="group-hover:translate-x-1 transition-transform">&gt;</span>
                    </button>
                  </motion.div>

                  {/* Guide Card 2 */}
                  <motion.div 
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-gradient-to-b from-white to-slate-50/50 hover:to-pink-50/25 rounded-[28px] p-6 border border-slate-150/80 shadow-[0_4px_15px_rgba(0,0,0,0.012)] hover:shadow-[0_15px_35px_rgba(210,10,80,0.04)] hover:border-pink-200/50 flex flex-col justify-between text-start min-h-[290px] transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                        <BookOpen className="w-5 h-5 text-slate-500" />
                      </div>
                      <h4 className="font-extrabold text-[#D20A50] text-sm">02. AI 교육</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        나의 AI 활용 능력을 간단한 설문으로 진단하고, 비전공자부터 전문가 수준까지 딱 맞는 맞춤 강좌를 추천받습니다.
                      </p>
                    </div>
                    <button 
                      onClick={handleStartSurvey}
                      className="text-[11px] font-black text-[#D20A50] hover:text-pink-700 pt-4 text-left cursor-pointer flex items-center gap-1 group"
                    >
                      자가진단 시도 <span className="group-hover:translate-x-1 transition-transform">&gt;</span>
                    </button>
                  </motion.div>

                  {/* Guide Card 3 */}
                  <motion.div 
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-gradient-to-b from-white to-slate-50/50 hover:to-pink-50/25 rounded-[28px] p-6 border border-slate-150/80 shadow-[0_4px_15px_rgba(0,0,0,0.012)] hover:shadow-[0_15px_35px_rgba(210,10,80,0.04)] hover:border-pink-200/50 flex flex-col justify-between text-start min-h-[290px] transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                        <Newspaper className="w-5 h-5 text-slate-500" />
                      </div>
                      <h4 className="font-extrabold text-[#D20A50] text-sm">03. AI 뉴스</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        어렵고 복잡한 글로벌 인공지능 소식과 트렌드 정책자료를 국문 3줄 핵심 요약으로 편리하게 파악합니다.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("DailyNews")}
                      className="text-[11px] font-black text-[#D20A50] hover:text-pink-700 pt-4 text-left cursor-pointer flex items-center gap-1 group"
                    >
                      뉴스 전체 보기 <span className="group-hover:translate-x-1 transition-transform">&gt;</span>
                    </button>
                  </motion.div>

                  {/* Guide Card 4 */}
                  <motion.div 
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-gradient-to-b from-white to-slate-50/50 hover:to-pink-50/25 rounded-[28px] p-6 border border-slate-150/80 shadow-[0_4px_15px_rgba(0,0,0,0.012)] hover:shadow-[0_15px_35px_rgba(210,10,80,0.04)] hover:border-pink-200/50 flex flex-col justify-between text-start min-h-[290px] transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                        <Database className="w-5 h-5 text-slate-500" />
                      </div>
                      <h4 className="font-extrabold text-[#D20A50] text-sm">04. AI DB</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        국내외 다양한 전문 연구 기관들의 AI 관련 사회적 가치(SV) 트렌드 분석 리포트, 측정 연구 자료 등의 핵심 보고서를 수합해 둔 라이브러리입니다.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("DeepInsight_DB")}
                      className="text-[11px] font-black text-[#D20A50] hover:text-pink-700 pt-4 text-left cursor-pointer flex items-center gap-1 group"
                    >
                      보고서 탐색 <span className="group-hover:translate-x-1 transition-transform">&gt;</span>
                    </button>
                  </motion.div>

                  {/* Guide Card 5 */}
                  <motion.div 
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-gradient-to-b from-white to-slate-50/50 hover:to-pink-50/25 rounded-[28px] p-6 border border-slate-150/80 shadow-[0_4px_15px_rgba(0,0,0,0.012)] hover:shadow-[0_15px_35px_rgba(210,10,80,0.04)] hover:border-pink-200/50 flex flex-col justify-between text-start min-h-[290px] transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                        <Terminal className="w-5 h-5 text-slate-500" />
                      </div>
                      <h4 className="font-extrabold text-[#D20A50] text-sm">05. AI 프롬프트</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        다양한 연구 시나리오에 즉시 투입 가능한 검증된 프롬프트 카드로 원내 실무 속도를 두 배로 증가시킵니다.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("DeepInsight_Prompt")}
                      className="text-[11px] font-black text-[#D20A50] hover:text-pink-700 pt-4 text-left cursor-pointer flex items-center gap-1 group"
                    >
                      프롬프트 실행 <span className="group-hover:translate-x-1 transition-transform">&gt;</span>
                    </button>
                  </motion.div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: Daily News Archive (High-Fidelity Photo Match) */}
          {activeTab === "DailyNews" && (() => {
            const displayedNews = cachedNewsList.filter((item, index) => {
              const title = item.title || "";
              const summary = item.summary || item.description || "";
              const source = item.source || "";
              const category = item.category || getNewsCategory(title, summary);
              const pubDate = item.pubDate || "2026-06-24";

              if (newsCategoryFilter !== "전체" && category !== newsCategoryFilter) {
                return false;
              }

              if (newsSearchText.trim() !== "") {
                const searchLower = newsSearchText.toLowerCase();
                const matchTitle = title.toLowerCase().includes(searchLower);
                const matchSummary = summary.toLowerCase().includes(searchLower);
                const matchSource = source.toLowerCase().includes(searchLower);
                if (!matchTitle && !matchSummary && !matchSource) {
                  return false;
                }
              }

              if (newsDateFilter !== "") {
                if (!pubDate.includes(newsDateFilter)) {
                  return false;
                }
              }

              return true;
            });

            const topNews = (() => {
              if (displayedNews.length === 0) return [];
              if (newsCategoryFilter === "전체") {
                const tech = displayedNews.find(n => (n.category || "기술") === "기술");
                const reg = displayedNews.find(n => (n.category || "기술") === "규제");
                const res = displayedNews.find(n => (n.category || "기술") === "연구");
                
                const selected: any[] = [];
                if (tech) selected.push(tech);
                if (reg) selected.push(reg);
                if (res) selected.push(res);
                
                for (const item of displayedNews) {
                  if (selected.length >= 3) break;
                  if (!selected.some(s => s.id === item.id)) {
                    selected.push(item);
                  }
                }
                return selected;
              } else {
                return displayedNews.slice(0, 3);
              }
            })();

            const mainNewsList = displayedNews.filter(n => !topNews.some(t => t.id === n.id));
            const itemsPerPage = 9;
            const totalItems = mainNewsList.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
            const paginatedNews = mainNewsList.slice((newsPage - 1) * itemsPerPage, newsPage * itemsPerPage);

            return (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-10" 
                id="view-daily-news-archive"
              >
                {/* 1. Header Hero Area matching screenshot 1 */}
                <div className="flex flex-col items-center text-center py-6">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider bg-brand-50 text-brand-500 border border-brand-100 uppercase mb-4 shadow-3xs">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                    REAL-TIME GLOBAL AI NEWS DATABASE
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    실시간 축적 데이터베이스<br/>
                    <span className="text-brand-500">AI 뉴스 및 트렌드</span>
                  </h1>
                  <p className="text-slate-400 text-xs mt-3 max-w-lg font-semibold">
                    매일 KST 기준으로 최신 인공지능 기술, 규제, 연구 트렌드 뉴스가 지속적으로 축적됩니다.
                  </p>
                  
                  {/* Download CSV Action button */}
                  <div className="mt-5">
                    <button
                      onClick={handleDownloadNewsCSV}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-5 py-3 rounded-[15px] shadow-md shadow-emerald-500/15 hover:shadow-emerald-500/25 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center gap-2 border border-emerald-400"
                    >
                      <span className="text-sm">📥</span>
                      <span>전체 축적 뉴스 CSV 다운로드</span>
                    </button>
                  </div>
                </div>

                {/* 1-B. 오늘의 주요 AI 뉴스 (TOP 3) 따로 배치 */}
                {topNews.length > 0 && (
                  <div className="space-y-5 bg-slate-50/70 p-6 md:p-8 rounded-[3rem] border border-slate-100/80 text-start">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📌</span>
                        <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                          {newsCategoryFilter === "전체" ? "오늘의 카테고리별 핵심 뉴스 (TOP 3)" : `${newsCategoryFilter} 분야 주요 뉴스 (TOP 3)`}
                        </h2>
                      </div>
                      <span className="bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        RECOMMENDED TOP 3
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {topNews.map((item, index) => {
                        const category = item.category || "기술";
                        return (
                          <motion.div
                            key={`top-news-${item.id || index}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            onClick={() => handleOpenNewsDetail(item)}
                            className="group bg-white rounded-[2.5rem] border border-brand-100/50 shadow-md hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-350 cursor-pointer overflow-hidden p-5 flex flex-col justify-between h-full relative"
                          >
                            <div className="absolute top-4 right-4 z-10">
                              <span className="bg-brand-500 text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                                TOP {index + 1}
                              </span>
                            </div>
                            <div className="space-y-4 flex-grow flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="relative rounded-[1.5rem] overflow-hidden aspect-[16/10] bg-slate-50">
                                  <img
                                    src={item.image || getNewsImageFallback(index)}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-350"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = getNewsImageFallback(index);
                                    }}
                                  />
                                  <div className="absolute bottom-3 left-3">
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black text-white ${
                                      category === "규제" 
                                        ? "bg-orange-500" 
                                        : category === "연구" 
                                          ? "bg-emerald-500" 
                                          : "bg-brand-500"
                                    }`}>
                                      {category}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold font-mono">
                                  <span>{item.source}</span>
                                  <span>•</span>
                                  <span>{item.pubDate}</span>
                                </div>
                                <h3 className="text-sm md:text-base font-extrabold text-slate-900 group-hover:text-brand-500 transition-colors line-clamp-2 leading-snug">
                                  {item.title}
                                </h3>
                              </div>

                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Advanced Filters Row matching screenshot 1 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-100 pb-8">
                  
                  {/* Left Side: Category Filters */}
                  <div className="flex flex-col gap-2 items-start text-start w-full lg:w-auto">
                    <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase ml-1">
                      카테고리 필터
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {["전체", "기술", "규제", "연구"].map((category) => {
                        const isActive = (category === "전체" && newsCategoryFilter === "전체") || (newsCategoryFilter === category);
                        const label = category === "전체" ? "전체 보기" : category;
                        return (
                          <button
                            key={category}
                            onClick={() => setNewsCategoryFilter(category)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                              isActive
                                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-[1.03]"
                                : "bg-white text-slate-500 border border-slate-200/80 hover:border-brand-200 hover:text-brand-500"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Side: Interactive Search Inputs */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="키워드/매체명 검색"
                        value={newsSearchText}
                        onChange={(e) => setNewsSearchText(e.target.value)}
                        className="w-full bg-white text-xs pl-10 pr-4 py-2.5 rounded-full border border-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10 transition-all text-slate-800 placeholder-slate-400 font-medium"
                      />
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Date Picker Input */}
                    <div className="relative w-full sm:w-52">
                      <input
                        type="date"
                        value={newsDateFilter}
                        onChange={(e) => setNewsDateFilter(e.target.value)}
                        className="w-full bg-white text-xs pl-4 pr-10 py-2.5 rounded-full border border-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10 transition-all text-slate-800 placeholder-slate-400 font-medium appearance-none"
                      />
                      <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Reset Button (only shown when any filter is active) */}
                    {(newsCategoryFilter !== "전체" || newsSearchText !== "" || newsDateFilter !== "") && (
                      <button
                        onClick={() => {
                          setNewsCategoryFilter("전체");
                          setNewsSearchText("");
                          setNewsDateFilter("");
                        }}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer shrink-0"
                        title="필터 초기화"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>

                {/* 3. News Feed Cards Grid matching screenshot 1 */}
                {isNaverNewsLoading ? (
                  <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-400">
                    <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
                    <span className="text-xs font-bold font-sans">실시간 뉴스망에서 최신 기사를 불러오는 중...</span>
                  </div>
                ) : paginatedNews.length > 0 ? (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {paginatedNews.map((item, index) => {
                        const category = item.category || getNewsCategory(item.title, item.summary);
                        return (
                          <motion.div
                            key={item.id || index}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4 }}
                            onClick={() => handleOpenNewsDetail(item)}
                            className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xs hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden p-6 text-start flex flex-col justify-between"
                          >
                            <div className="space-y-4">
                              {/* Image Container with precise aspect ratio and badge overlay */}
                              <div className="relative rounded-[1.5rem] overflow-hidden aspect-[16/10] bg-slate-50">
                                <img
                                  src={item.image || getNewsImageFallback(index)}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-350"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = getNewsImageFallback(index);
                                  }}
                                />
                                {/* Overlay category badge */}
                                <div className="absolute bottom-4 left-4">
                                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black text-white ${
                                    category === "규제" 
                                      ? "bg-orange-500" 
                                      : category === "연구" 
                                        ? "bg-emerald-500" 
                                        : "bg-brand-500"
                                  }`}>
                                    {category}
                                  </span>
                                </div>
                              </div>

                              {/* Metadata */}
                              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold font-mono">
                                <span>{item.source}</span>
                                <span>•</span>
                                <span>{item.pubDate}</span>
                              </div>

                              {/* Heading */}
                              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-brand-500 transition-colors line-clamp-2 leading-snug">
                                {item.title}
                              </h3>

                              {/* Body Description */}

                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 text-start">
                        {/* Status text */}
                        <span className="text-xs text-slate-500 font-medium">
                          전체 <strong className="text-slate-900 font-extrabold">{totalItems}</strong>개 중{" "}
                          <strong className="text-brand-500 font-extrabold">
                            {Math.min((newsPage - 1) * itemsPerPage + 1, totalItems)} ~ {Math.min(newsPage * itemsPerPage, totalItems)}
                          </strong>
                          번째 뉴스 표시 중
                        </span>

                        {/* Page controls */}
                        <div className="flex items-center gap-1.5">
                          {/* Previous button */}
                          <button
                            disabled={newsPage === 1}
                            onClick={() => setNewsPage(prev => Math.max(prev - 1, 1))}
                            className={`p-2 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                              newsPage === 1
                                ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                : "bg-white border-slate-200 text-slate-600 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50/50"
                            }`}
                            title="이전 페이지"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {/* Page numbers */}
                          {Array.from({ length: totalPages }).map((_, i) => {
                            const pageNum = i + 1;
                            const isWithinRange = 
                              pageNum === 1 || 
                              pageNum === totalPages || 
                              Math.abs(pageNum - newsPage) <= 1;

                            if (!isWithinRange) {
                              if (pageNum === 2 || pageNum === totalPages - 1) {
                                return (
                                  <span key={`ellipse-${pageNum}`} className="text-slate-300 px-1 text-xs">
                                    •••
                                  </span>
                                );
                              }
                              return null;
                            }

                            const isCurrent = pageNum === newsPage;
                            return (
                              <button
                                key={`page-btn-${pageNum}`}
                                onClick={() => setNewsPage(pageNum)}
                                className={`w-8 h-8 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center ${
                                  isCurrent
                                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                                    : "bg-white text-slate-500 border border-slate-200 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50/50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}

                          {/* Next button */}
                          <button
                            disabled={newsPage === totalPages}
                            onClick={() => setNewsPage(prev => Math.min(prev + 1, totalPages))}
                            className={`p-2 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                              newsPage === totalPages
                                ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                : "bg-white border-slate-200 text-slate-600 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50/50"
                            }`}
                            title="다음 페이지"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-24 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center gap-4 text-center">
                    <p className="text-sm font-bold text-slate-500">
                      검색 조건에 해당되는 AI 뉴스 정보가 발견되지 않았습니다.
                    </p>
                    <button
                      onClick={() => {
                        setNewsCategoryFilter("전체");
                        setNewsSearchText("");
                        setNewsDateFilter("");
                      }}
                      className="px-4 py-2.5 bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-500/10 hover:bg-brand-600 transition"
                    >
                      필터 전면 초기화
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })()}

          {activeTab === "AIClassroom" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-8" 
              id="view-custom-classroom"
            >
              
              {/* Hero Banner Section */}
              <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto py-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-pink-100 text-[#D20A50] border border-pink-200 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 text-[#D20A50] animate-pulse" /> AI RESEARCHER RECOMMENDATION
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-display">
                  연구원을 위한 AI 교육 추천 서비스
                </h1>
                
                {/* Visual Recommendation Card Container */}
                <div className="w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md flex flex-col items-center justify-center space-y-5 relative overflow-hidden transition hover:shadow-lg">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#D20A50]" />
                  <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-xl shadow-xs border border-pink-100 shrink-0">
                    💡
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-slate-900 text-lg md:text-xl">연구원 맞춤형 교육 추천</h3>
                    <p className="text-slate-500 text-xs md:text-sm max-w-2xl leading-relaxed">
                      연구원님의 관심 연구 주제와 필요한 활용 기술을 바탕으로 가장 적합한 맞춤형 AI 추천 강좌를 즉시 제안해 드립니다.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button 
                      onClick={handleStartSurvey}
                      className="px-6 py-3 bg-[#D20A50] hover:bg-pink-600 text-white font-black text-xs md:text-sm rounded-xl shadow-lg shadow-pink-950/10 transition flex items-center gap-2 cursor-pointer"
                    >
                      {diagnosedCourseIds.length > 0 ? "다시 추천받기 🔄" : "진단 시작하기 →"}
                    </button>
                    {diagnosedCourseIds.length > 0 && (
                      <button 
                        onClick={clearDiagnosticsFilter}
                        className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs md:text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
                      >
                        추천 필터 해제 <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Diagnostic Insight Badge */}
                  {diagnosedCourseIds.length > 0 && (
                    <div className="w-full bg-pink-50/50 border border-pink-100 rounded-2xl p-5 text-left space-y-3 mt-4 animate-fade-in">
                      <span className="text-[10px] uppercase font-black text-[#D20A50] tracking-widest block">나의 진단 결과 키포인트</span>
                      <div className="flex flex-wrap gap-2.5">
                        <span className="text-[11px] font-bold bg-white px-3 py-1.5 rounded-lg text-[#D20A50] border border-pink-100 shadow-2xs">
                          연구 레벨: {surveyAnswers.level || "미지정"}
                        </span>
                        <span className="text-[11px] font-bold bg-white px-3 py-1.5 rounded-lg text-purple-700 border border-purple-100 shadow-2xs">
                          관심 아젠다: {surveyAnswers.topic || "미지정"}
                        </span>
                        <span className="text-[11px] font-bold bg-white px-3 py-1.5 rounded-lg text-indigo-700 border border-indigo-100 shadow-2xs">
                          필요 기술: {surveyAnswers.skill || "미지정"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Course roadmap list layout & AI mentor chat */}
              <div className="space-y-6 pt-6 border-t border-slate-200/60 text-start">
                
                {/* Roadmap Header & Searching */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">AI 교육 과정 로드맵</h2>
                    <p className="text-slate-500 text-xs md:text-sm">
                      분야별/난이도별 전체 AI 온라인 및 오프라인 무료 고품질 교육 프로그램 리스트입니다.
                    </p>
                  </div>

                  {/* Filters and search input */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="코스명/학습 정보 검색..." 
                        value={searchCourseQuery}
                        onChange={(e) => setSearchCourseQuery(e.target.value)}
                        className="w-full sm:w-64 bg-white text-xs pl-4 pr-16 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-[#D20A50] focus:ring-1 focus:ring-[#D20A50] font-medium"
                      />
                      <button 
                        className="absolute right-1 top-1 bottom-1 px-3 bg-[#D20A50] hover:bg-pink-600 text-white font-bold text-[10px] rounded-lg transition"
                      >
                        검색
                      </button>
                    </div>

                    {/* Inline Tag Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                      {[
                        { val: "전체", label: "All" },
                        { val: "한국표준협회", label: "한국표준협회" },
                        { val: "부스트코스", label: "부스트코스" },
                        { val: "K-MOOC", label: "K-MOOC" }
                      ].map((p) => {
                        const isSelected = filterProvider === p.val;
                        return (
                          <button
                            key={p.val}
                            onClick={() => setFilterProvider(p.val)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition duration-150 cursor-pointer whitespace-nowrap border ${
                              isSelected 
                                ? "bg-[#D20A50] text-white border-[#D20A50] shadow-sm" 
                                : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Full Width Course Grid Layout */}
                <div className="w-full">
                  
                  {/* Course Grid */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {ENHANCED_COURSES.filter(c => {
                        const lvlMatch = filterLevel === "전체" || c.level === filterLevel;
                        const provMatch = filterProvider === "전체" || c.provider.includes(filterProvider);
                        const wordMatch = c.title.toLowerCase().includes(searchCourseQuery.toLowerCase()) || 
                                          c.description.toLowerCase().includes(searchCourseQuery.toLowerCase());
                        const surveyIdMatch = diagnosedCourseIds.length === 0 || diagnosedCourseIds.includes(c.id);
                        return lvlMatch && provMatch && wordMatch && surveyIdMatch;
                      }).map((course) => {
                        const isPrimaryHighlight = diagnosedCourseIds.length > 0 && diagnosedCourseIds.includes(course.id);
                        return (
                          <div 
                            key={course.id}
                            className={`p-5 rounded-3xl border text-start transition duration-200 relative overflow-hidden flex flex-col justify-between min-h-[280px] bg-white ${
                              isPrimaryHighlight 
                                ? "border-[#D20A50] ring-2 ring-pink-100 bg-pink-50/5 shadow-xs" 
                                : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Metadata Badges row */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-extrabold rounded-md border border-slate-200/60">
                                  {course.provider}
                                </span>
                                <span className="px-2 py-0.5 bg-pink-50 text-[#D20A50] text-[9px] font-extrabold rounded-md border border-pink-100/60">
                                  {course.level}
                                </span>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold rounded-md border border-emerald-100/60">
                                  {course.costType}
                                </span>
                              </div>

                              {/* Title and Short description */}
                              <div className="space-y-1.5">
                                <h4 className="text-sm md:text-base font-extrabold text-slate-900 leading-snug tracking-tight line-clamp-2 min-h-[2.5rem]">
                                  {course.title}
                                </h4>
                                <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed line-clamp-3 min-h-[3.25rem]">
                                  {course.description}
                                </p>
                              </div>
                            </div>

                            {/* Direct Course Link button */}
                            <div className="pt-4 mt-auto">
                              <a 
                                href={course.link || "http://www.kmooc.kr"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-center block bg-slate-50 hover:bg-[#D20A50] hover:text-white border border-slate-200 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl transition duration-150 shadow-2xs cursor-pointer"
                              >
                                강의 링크 ↗
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* No Search results view */}
                    {ENHANCED_COURSES.filter(c => {
                      const lvlMatch = filterLevel === "전체" || c.level === filterLevel;
                      const provMatch = filterProvider === "전체" || c.provider.includes(filterProvider);
                      const wordMatch = c.title.toLowerCase().includes(searchCourseQuery.toLowerCase()) || 
                                        c.description.toLowerCase().includes(searchCourseQuery.toLowerCase());
                      const surveyIdMatch = diagnosedCourseIds.length === 0 || diagnosedCourseIds.includes(c.id);
                      return lvlMatch && provMatch && wordMatch && surveyIdMatch;
                    }).length === 0 && (
                      <div className="bg-slate-50 rounded-2xl p-12 text-center text-slate-400 font-medium text-xs border border-dashed border-slate-200">
                        해당 조건에 만족하는 추천 교육 과정이 존재하지 않습니다.
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </motion.div>
          )}


          {/* TAB 4-A: AI 프롬프트 라이브러리 */}
          {activeTab === "DeepInsight_Prompt" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-8 text-start max-w-7xl mx-auto" 
              id="view-deep-insight-prompt"
            >
              
              {/* Header section with search & status */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-[#D81159] rounded-full"></span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI 프롬프트 라이브러리</h2>
                  </div>
                  <p className="text-slate-500 text-sm max-w-2xl">
                    프롬프트를 자유롭게 수정하고 맞춤형으로 제작하여 즉시 활용하세요.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="bg-white px-4 py-2.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2 focus-within:border-[#D81159] transition">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="프롬프트 제목/내용 검색..." 
                      value={promptSearchQuery}
                      onChange={(e) => setPromptSearchQuery(e.target.value)}
                      className="text-xs text-slate-800 border-none focus:outline-none bg-transparent w-44"
                    />
                    {promptSearchQuery && (
                      <button onClick={() => setPromptSearchQuery("")} className="text-gray-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3.5 py-2.5 rounded-full flex items-center gap-1 border border-emerald-100">
                    ✏️ 편집 가능
                  </span>
                </div>
              </div>

              {/* 프롬프트 아이디어 실시간 현황판 (Bulletin Board) */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 text-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#D81159] shrink-0" />
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">프롬프트 제안 & 개발 현황판</h3>
                    </div>
                    <p className="text-slate-400 text-xs font-semibold">
                      연구원분들이 제안한 소중한 아이디어가 검토 및 제작되는 실시간 진행 상황입니다.
                    </p>
                  </div>
                  <span className="bg-pink-50 text-[#D81159] text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider self-start sm:self-center shrink-0 border border-pink-100/80">
                    📡 실시간 상태 연동 중
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">번호</th>
                        <th className="py-3 px-4">제안 내용</th>
                        <th className="py-3 px-4 w-32">제안자</th>
                        <th className="py-3 px-4 w-32">제안일</th>
                        <th className="py-3 px-4 w-36 text-center">진행 상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {submittedPromptIdeas.map((idea, index) => (
                        <tr key={idea.id} className="hover:bg-slate-50/50 transition duration-150">
                          <td className="py-4 px-4 text-center font-mono text-slate-400">{submittedPromptIdeas.length - index}</td>
                          <td className="py-4 px-4 pr-6">
                            <p className="text-slate-800 leading-relaxed font-bold break-words max-w-xl">
                              {idea.content}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-black border border-slate-200 shrink-0">
                              {idea.author[0]}
                            </div>
                            <span>{idea.author}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-400 font-mono whitespace-nowrap">{idea.date}</td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase border ${
                                idea.hasImplemented 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                  : "bg-amber-50 text-amber-600 border-amber-100"
                              }`}>
                                {idea.status}
                              </span>
                              {idea.hasImplemented && (
                                <span className="text-[8px] font-black text-emerald-500 flex items-center gap-0.5 animate-pulse">
                                  ✓ 라이브러리 반영 완료
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit ideas banner (Dark theme card) */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-800 flex flex-col lg:flex-row justify-between items-stretch gap-8 relative overflow-hidden">
                {/* Decorative background flare */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#D81159]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Left 60% */}
                <div className="lg:w-[55%] flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-[#D81159]/20 flex items-center justify-center border border-[#D81159]/30 shrink-0 shadow-lg shadow-[#D81159]/10">
                    <Lightbulb className="w-8 h-8 text-[#D81159] animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black tracking-tight text-white">프롬프트 제안하기</h3>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                      연구 수행 중 AI가 해결해주었으면 하는 작업이 있다면 언제든 알려주세요.
                      연구원님의 피드백을 바탕으로 최적화된 프롬프트를 설계하여 Lab 섹션에 반영합니다.
                    </p>
                  </div>
                </div>

                {/* Right 40% Form */}
                <div className="lg:w-[40%] flex flex-col justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xs relative z-10">
                  {isIdeaSubmitted ? (
                    <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
                      <span className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">✓</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">제안이 성공적으로 제출되었습니다!</h4>
                        <p className="text-xs text-slate-400 mt-1">소중한 제안을 바탕으로 프롬프트를 검토 및 보완하겠습니다.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsIdeaSubmitted(false);
                          setPromptIdea("");
                        }} 
                        className="text-xs text-[#D81159] font-black hover:underline mt-2"
                      >
                        새 제안 보내기
                      </button>
                    </div>
                  ) : (
                    <>
                      <textarea 
                        placeholder="필요한 프롬프트 아이디어들을 들려주세요..." 
                        value={promptIdea}
                        onChange={(e) => setPromptIdea(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-900/40 text-slate-200 placeholder-slate-500 text-xs rounded-xl p-3 border border-white/10 outline-none focus:border-[#D81159] transition resize-none leading-relaxed"
                      />
                      <button 
                        onClick={() => {
                          if (promptIdea.trim() === "") return;
                          const newIdea = {
                            id: `idea-${Date.now()}`,
                            content: promptIdea,
                            author: "나 (연구원)",
                            date: new Date().toISOString().slice(0, 10),
                            status: "검토 진행 중",
                            hasImplemented: false
                          };
                          setSubmittedPromptIdeas(prev => [newIdea, ...prev]);
                          setIsIdeaSubmitted(true);
                        }}
                        disabled={promptIdea.trim() === ""}
                        className="w-full py-3 bg-[#D81159] hover:bg-[#c40e4f] text-white text-xs font-black rounded-full transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none tracking-wider uppercase shadow-md shadow-[#D81159]/10 shrink-0"
                      >
                        SUBMIT IDEA
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Grid Layout of prompt cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {customPrompts.filter(p => {
                  const q = promptSearchQuery.toLowerCase().trim();
                  return q === "" || 
                         p.title.toLowerCase().includes(q) || 
                         p.subtitle.toLowerCase().includes(q) || 
                         p.category.toLowerCase().includes(q) || 
                         p.promptText.toLowerCase().includes(q);
                }).map((prompt) => {
                  const isCopiedThis = copiedPromptId === prompt.id;
                  return (
                    <div 
                      key={prompt.id}
                      className="bg-white rounded-[3rem] border border-gray-100 p-8 shadow-sm hover:border-[#D81159] hover:shadow-xl hover:shadow-[#D81159]/5 transition-all duration-300 flex flex-col justify-between gap-6 text-start relative group"
                    >
                      {/* Card Top Row with Badge & COPY Button */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-black text-[#D81159] tracking-wider uppercase">
                            {prompt.category}
                          </span>
                          <h3 className="font-black text-xl md:text-2xl tracking-tight text-slate-900 leading-snug group-hover:text-[#D81159] transition-colors duration-200">
                            {prompt.title}
                          </h3>
                        </div>

                        {/* Copy Prompt Solid Box */}
                        <button
                          onClick={() => {
                            handleCopyToClipboard(prompt.promptText);
                            setCopiedPromptId(prompt.id);
                            setTimeout(() => setCopiedPromptId(null), 2000);
                          }}
                          className={`w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 cursor-pointer select-none transition-all duration-300 shrink-0 border uppercase text-[9px] font-black tracking-wider ${
                            isCopiedThis
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                              : "bg-[#D81159] text-white border-[#D81159] hover:bg-[#c40e4f] shadow-md shadow-[#D81159]/10 hover:scale-105"
                          }`}
                          title="수정한 프롬프트 전체 복사하기"
                        >
                          {isCopiedThis ? (
                            <>
                              <Check className="w-5 h-5 text-white" />
                              <span className="scale-[0.9]">COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-5 h-5 text-white" />
                              <span className="scale-[0.9]">COPY PROMPT</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Subtitle / Description */}
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                        {prompt.subtitle}
                      </p>

                      {/* Green Lab Tip */}
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-start items-start">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <Cpu className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-emerald-600 tracking-wider block uppercase font-sans">LAB TIP</span>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {prompt.labTip}
                          </p>
                        </div>
                      </div>

                      {/* Spacer line divider */}
                      <div className="flex items-center justify-between gap-4 pt-2">
                        <span className="text-[10px] font-black text-slate-400 tracking-wider">INTERACTIVE EDITOR</span>
                        <div className="h-[1px] bg-slate-100 flex-grow" />
                        <span className="text-[10px] font-black text-emerald-500 tracking-wider uppercase">EDITABLE AREA ✏️</span>
                      </div>

                      {/* Editable Textarea */}
                      <div className="relative">
                        <textarea
                          value={prompt.promptText}
                          onChange={(e) => {
                            const updatedValue = e.target.value;
                            setCustomPrompts(prev => prev.map(p => p.id === prompt.id ? { ...p, promptText: updatedValue } : p));
                          }}
                          rows={10}
                          className="w-full bg-slate-50 border border-gray-100 focus:border-[#D81159]/40 focus:bg-white rounded-[2rem] p-6 text-xs md:text-sm outline-none font-mono text-slate-700 leading-relaxed resize-y transition-all"
                        />
                        <div className="absolute bottom-3 right-4 bg-slate-200/50 text-slate-500 text-[9px] font-black px-2.5 py-1 rounded-full pointer-events-none uppercase">
                          Live Editable
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </motion.div>
          )}

          {/* TAB 4-B: SROI 글로벌 리서치 데이터베이스 */}
          {activeTab === "DeepInsight_DB" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-8 text-start max-w-7xl mx-auto" 
              id="view-deep-insight-db"
            >
              
              {/* Banner Section */}
              <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-black text-[#D81159] uppercase tracking-wider block">CSES Academic Hub</span>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Research DB</h2>
                  <p className="text-slate-500 text-sm max-w-2xl">
                    사회적가치연구원(CSES)이 제공하는 글로벌 최고 권위 학술 논문 및 연구 동향 데이터베이스입니다. 
                    신뢰성이 보장된 12개의 핵심 연구 자료를 한눈에 아카이빙하고, 화폐화 산출 지표와 국문 핵심 초록을 원스톱으로 탐색할 수 있습니다.
                  </p>
                </div>
                <button 
                  onClick={handleDownloadCSV}
                  className="py-3 px-6 bg-[#D81159] text-white hover:bg-[#c40e4f] text-xs font-black rounded-full transition-all duration-300 inline-flex items-center gap-2 cursor-pointer shadow-md shadow-[#D81159]/10 shrink-0"
                  title="CSV 테이블 내려받기"
                >
                  <Download className="w-4 h-4 text-white" />
                  전체 DB 엑셀 CSV로 내보내기
                </button>
              </div>

              {/* ALL_NEWS Explorer: 기본 탑재 뉴스 데이터 키워드 */}
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-[#D81159] animate-pulse animate-spin-slow" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">기본 탑재 뉴스 & 학술 키워드 탐색 (ALL_NEWS)</h3>
                    <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">원하는 고유 키워드를 클릭하시면 아래 AI Research DB가 연동되어 즉시 매치 필터링됩니다.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    {
                      category: "[연구 설계 자동화 관련]",
                      keywords: ["OpenAI", "o1-preview", "연구 프로세스", "추론 지능"],
                    },
                    {
                      category: "[사회적 가치 측정 관련]",
                      keywords: ["사회적가치", "SV 측정", "알고리즘 감사", "지표 자동화"],
                    },
                    {
                      category: "[탄소 배출 추적 관련]",
                      keywords: ["Google AI", "탄소 추적", "ESG", "기후 기술"],
                    },
                    {
                      category: "[생산성 혁신 관련]",
                      keywords: ["생성형 AI", "사회적 기업", "생산성", "혁신 사례"],
                    },
                    {
                      category: "[글로벌 가이드라인 관련]",
                      keywords: ["UN", "AI 거버넌스", "SDGs", "글로벌 규제"],
                    },
                  ].map((group) => (
                    <div key={group.category} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/60 text-start space-y-2.5 flex flex-col justify-between">
                      <span className="text-[10px] font-black text-slate-400 tracking-tight block">
                        {group.category}
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {group.keywords.map((kw) => {
                          const isActive = researchSearchQuery.toLowerCase() === kw.toLowerCase();
                          return (
                            <button
                              key={kw}
                              onClick={() => {
                                if (isActive) {
                                  setReportSearchQuery("");
                                  setResearchSearchQuery("");
                                } else {
                                  setReportSearchQuery(kw);
                                  setResearchSearchQuery(kw);
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer border ${
                                isActive
                                  ? "bg-[#D81159] text-white border-[#D81159] shadow-md scale-[1.03]"
                                  : `bg-white hover:border-[#D81159]/20 text-slate-600 hover:text-[#D81159] border-slate-200/80`
                              }`}
                            >
                              {kw}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search & Filter Section */}
              <div className="flex flex-col gap-6" id="search-filter-section">
                {/* Search Bar & Sort Control Wrapper */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search Input Box */}
                  <div className="w-full md:max-w-md bg-white px-5 py-4 rounded-full border border-gray-100 shadow-sm flex items-center gap-3 focus-within:border-[#D81159] focus-within:shadow-md transition-all duration-300">
                    <Search className="w-5 h-5 text-gray-400 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="관심 연구 주제 또는 저자를 검색하세요..." 
                      value={researchSearchQuery}
                      onChange={(e) => setResearchSearchQuery(e.target.value)}
                      className="w-full text-sm text-slate-800 border-none focus:outline-none bg-transparent"
                    />
                    {researchSearchQuery && (
                      <button 
                        onClick={() => setResearchSearchQuery("")}
                        className="text-gray-400 hover:text-slate-600 cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Sort Switch Segmented Control */}
                  <div className="flex items-center bg-gray-100 p-1 rounded-full shrink-0 border border-gray-200">
                    <button
                      onClick={() => setResearchSortOrder("latest")}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                        researchSortOrder === "latest"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      최신순 ⚡
                    </button>
                    <button
                      onClick={() => setResearchSortOrder("oldest")}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                        researchSortOrder === "oldest"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      오래된순 📅
                    </button>
                  </div>
                </div>

                {/* Tag Toggle Tabs */}
                <div className="flex flex-wrap items-center gap-2 pb-2">
                  {["전체", "Deep Dive", "Analysis", "Field Report", "Policy Paper", "Investment"].map((tag) => {
                    const isSelected = researchActiveTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => setResearchActiveTag(tag)}
                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer border ${
                          isSelected
                            ? "bg-[#D81159] text-white border-[#D81159] shadow-lg shadow-[#D81159]/10"
                            : "bg-white text-slate-600 border-gray-100 hover:text-[#D81159] hover:border-[#D81159]"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Research Database list */}
              {filteredInsights.length > 0 ? (
                <div className="space-y-4 pb-8">
                  {filteredInsights.map((insight) => {
                    const isExpanded = !!expandedInsights[insight.id];
                    return (
                      <motion.div 
                        key={insight.id}
                        layout="position"
                        className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 p-5 md:p-6 shadow-xs hover:border-[#D81159] hover:shadow-md hover:shadow-[#D81159]/5 transition-all duration-300 flex flex-col gap-3.5 text-start relative group"
                      >
                        {/* Badges and Date Row */}
                        <div className="flex flex-row items-center justify-between gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-pink-50 text-[#D81159] text-[9px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase">
                              {insight.tag}
                            </span>
                            <span className="bg-slate-50 text-slate-500 border border-slate-200/60 text-[9px] font-black px-2.5 py-1 rounded-md flex items-center gap-1 tracking-wider uppercase">
                              🏛️ {insight.publisher}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-bold font-mono shrink-0">
                            {insight.date}
                          </span>
                        </div>

                        {/* Title Row */}
                        <div>
                          <h3 className="font-extrabold text-base md:text-lg lg:text-xl tracking-tight text-slate-900 leading-snug group-hover:text-[#D81159] transition-colors duration-200">
                            {insight.title}
                          </h3>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-bold">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span>저자: {insight.author}</span>
                          </div>
                          <span className="hidden sm:inline text-slate-200">|</span>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                            DOI/ID: {insight.doi_or_id}
                          </span>
                        </div>

                        {/* Toggleable Accordion 국문 요약 (Abstract) */}
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setExpandedInsights(prev => ({
                                ...prev,
                                [insight.id]: !prev[insight.id]
                              }));
                            }}
                            className="text-[10px] font-black text-[#D81159] bg-pink-50 hover:bg-pink-100/80 transition-all duration-200 flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-md w-fit"
                          >
                            <span>Abstract {isExpanded ? "요약 접기 ▲" : "논문 초록 보기 ▼"}</span>
                          </button>

                          {/* Accordion content with framer-motion */}
                          <motion.div
                            initial={false}
                            animate={{ 
                              height: isExpanded ? "auto" : 0, 
                              opacity: isExpanded ? 1 : 0 
                            }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/60 mt-1 space-y-1.5 text-start">
                              <span className="text-[10px] font-black text-[#D81159] tracking-wide block">
                                🔬 CSES 국문 초록 핵심 요약
                              </span>
                              <p className="text-[11px] md:text-xs text-slate-600 leading-relaxed font-semibold font-sans">
                                {insight.abstract}
                              </p>
                            </div>
                          </motion.div>
                        </div>

                        {/* Footer Info Line */}
                        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1">
                          <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                            🏛️ CSES AI DB
                          </span>

                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <a 
                              href={insight.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-[#D81159]/10 text-[#D81159] hover:bg-[#D81159] hover:text-white transition-all duration-200 text-[10px] font-black px-3.5 py-1.5 rounded-lg border border-[#D81159]/15 shadow-xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>원문 링크 바로가기</span>
                            </a>
                            <span className="bg-emerald-50 text-emerald-600 font-black text-[9px] px-2.5 py-1.5 rounded-md flex items-center gap-1 border border-emerald-100/80 uppercase tracking-wider shrink-0">
                              ✅ 실증 논문 검증 완료
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* No Results Empty State */
                <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white border border-gray-100 rounded-[3rem] shadow-xs space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-gray-100 shadow-inner">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-800">일치하는 연구 자료가 없습니다.</h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      검색 키워드 또는 선택한 분야 태그를 조정하여 새로운 고신뢰성 연구를 찾아보세요.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setResearchSearchQuery("");
                      setResearchActiveTag("전체");
                    }}
                    className="mt-2 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-full transition-all cursor-pointer"
                  >
                    필터 전체 초기화
                  </button>
                </div>
              )}

            </motion.div>
          )}

          {/* TAB 5: Guide View */}
          {activeTab === "Guide" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-6 text-start" 
              id="view-platform-guide"
            >
              {/* Main Banner */}
              <div className="bg-gradient-to-br from-[#D20A50] via-[#b80543] to-[#800028] text-white rounded-[32px] p-6 md:p-8 shadow-lg shadow-pink-900/10">
                <div className="max-w-3xl space-y-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/15 text-pink-100 border border-white/20">
                    <Sparkles className="w-3 h-3 text-pink-200" />
                    USER MANUAL
                  </span>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
                    CSES AI Insight Hub 플랫폼 종합 가이드
                  </h2>
                  <p className="text-pink-100/90 text-xs leading-relaxed font-semibold">
                    빅데이터 기술과 최신 대형언어모델(LLM)을 활용한 사회적 가치(SROI) 트렌드 자동화 및 학술 리서치 고도화를 지원하는 실무 가이드입니다.
                  </p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT: STEP GUIDE */}
                <div className="lg:col-span-8 space-y-6">
                  
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                      <SlidersHorizontal className="w-4.5 h-4.5 text-[#D20A50]" />
                      핵심 기능 기동 및 이용 가이드
                    </h3>

                    <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-8">
                      
                      {/* Step 1 */}
                      <div className="relative">
                        <span className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-pink-100 text-[#D20A50] border-2 border-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                          1
                        </span>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 font-extrabold text-slate-800 text-sm">
                            <span>실시간 포털 뉴스 수집 & 실시간 AI 임팩트 브리핑 (Daily News)</span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">#트렌드 분석</span>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            네이버 뉴스 실시간 연동 포털에서 <b>특정 키워드(#AI 기술, #AI 규제, #AI 연구 등)</b>로 발행된 최신 기사를 수집합니다. 
                            뉴스 목록에서 기사를 선택하면 우측 패널에서 Gemini AI 엔진이 기사의 원문을 해독하여 <b>SROI 및 ESG 관점의 1줄 에센셜 통찰 요점</b>을 3초 만에 생성해 제공합니다.
                          </p>
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 font-sans space-y-2 max-w-xl">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-100">
                              <span>뉴스 추출 시뮬레이션</span>
                              <span className="text-green-600 font-bold flex items-center gap-1">● ACTIVE</span>
                            </div>
                            <div className="p-2 py-1.5 bg-white rounded-lg border border-slate-100 text-xs font-bold text-slate-800 flex items-center justify-between">
                              <span className="truncate flex items-center gap-1.5">
                                <Newspaper className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                기업 ESG 탄소 배출량 관리, AI 기술과 만나 검증 고도화 실현
                              </span>
                              <button onClick={() => setActiveTab("DailyNews")} className="text-[10px] text-[#D20A50] font-bold hover:underline whitespace-nowrap ml-2">실습하기 →</button>
                            </div>
                            <div className="bg-white/70 rounded-xl p-2.5 border border-slate-100 text-[11px] leading-relaxed text-slate-600 space-y-1">
                              <span className="text-[9px] font-extrabold uppercase text-[#D20A50] tracking-wider block">GEMINI CORE LOGIC</span>
                              <p className="font-semibold text-slate-700">"본 기사는 AI를 활용한 신속한 온실가스 저감 성과 기재 및 SROI 측정 오차 축소 혁신 동향을 규명하고 있습니다."</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-pink-100 text-[#D20A50] border-2 border-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                          2
                        </span>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 font-extrabold text-slate-800 text-sm">
                            <span>자가진단 기획 & 초정밀 지식 큐레이션 코칭 (AI Classroom)</span>
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">#교육 로드맵</span>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            나만의 생성형 AI 활용 선호도와 목적을 체크하는 <b>3단계 AI 역량 자가진단(Survey)</b>을 진행합니다. 
                            진단이 종료되면 최적 학술 과정 1위가 특별 마킹되어 상단에 고정됩니다. 해당 과목을 클릭하면 전용 학습 챗방이 활성화되어 <b>AI 튜터와 커리큘럼 계획, 개념 질문 대화</b>를 실시간 1:1로 나눌 수 있습니다.
                          </p>
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 font-sans space-y-3 max-w-xl">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-100">
                              <span>학습 매칭 시뮬레이션</span>
                              <span className="text-indigo-600 font-bold">● ROADMAP LOADED</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="p-3 bg-white rounded-xl border border-pink-200 shadow-xs relative">
                                <span className="absolute top-1 right-2 text-[8px] bg-pink-100 text-[#D20A50] px-1 rounded font-bold">최적추천</span>
                                <p className="font-extrabold text-slate-800 truncate">SROI 화폐계측 초급 수료 교육</p>
                                <p className="text-slate-400 text-[10px] mt-0.5">난이도: 입문자 코스</p>
                              </div>
                              <div className="p-3 bg-white/45 rounded-xl border border-slate-100">
                                <p className="font-extrabold text-slate-400 truncate">임팩트 평가 전문가 워크숍</p>
                                <p className="text-slate-400 text-[10px] mt-0.5">난이도: 숙련 실무자</p>
                              </div>
                            </div>
                            <button onClick={() => setActiveTab("AIClassroom")} className="w-full text-center py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition">
                              강의실로 이동하여 자가진단 수행하기
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="relative">
                        <span className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-pink-100 text-[#D20A50] border-2 border-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                          3
                        </span>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 font-extrabold text-slate-800 text-sm">
                            <span>전문 번역·보도기획 프롬프트 실증 & 가치 DB 소장 (Deep Insight)</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">#리서치 보정</span>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            전문 학술 작업을 위한 <b>기획서 보충용 프롬프트 템플릿(초록 영역 번역, 언론 보도자료 초안)</b> 콘솔을 가동합니다. 
                            필요한 포맷 카드를 지정하고 텍스트만 채워 넣으면 전문가 수준으로 정밀 보정된 기안문을 완성할 수 있으며, 하단의 <b>공인 SROI 계측 데이터셋 정보</b>는 필터링하여 윈도우 원클릭 CSV 엑셀 백업본으로 직접 다운로드할 수 있습니다.
                          </p>
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 font-sans space-y-2 max-w-xl">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>CSV 엑셀 일괄 추출 시뮬레이션</span>
                              <span className="text-amber-600 font-bold">● DATASHEET ACTIVE</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200/50 flex items-center justify-between text-xs font-bold text-slate-700">
                              <span className="flex items-center gap-2 truncate">
                                <Database className="w-4 h-4 text-slate-400 shrink-0" />
                                CSES_SROI_Report_Archive_2026.csv
                              </span>
                              <button 
                                onClick={() => {
                                  setActiveTab("DeepInsight_DB");
                                  handleDownloadCSV();
                                }} 
                                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-[10px] shrink-0 font-bold"
                              >
                                즉시 백업 받기
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-md space-y-4">
                    <h3 className="font-extrabold text-xs tracking-wide uppercase text-pink-400 flex items-center gap-1.5 border-b border-slate-800 pb-3">
                      <Sparkles className="w-4.5 h-4.5 text-pink-400" />
                      CSES 연구원 꿀팁 가이드
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1 text-start">
                        <h4 className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                          프롬프트 클립보드 활용
                        </h4>
                        <p className="text-[11.5px] text-slate-300 leading-relaxed font-semibold">
                          프롬프트 실증도구를 실행하여 도출된 완벽한 국어/영어 결과문은 상단의 <b>[결과 복사하기]</b> 버튼 한 번으로 클립보드에 초정밀 자동 보관됩니다.
                        </p>
                      </div>
                      <div className="space-y-1 text-start pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                          실시간 네이버 동향 다차원 분석
                        </h4>
                        <p className="text-[11.5px] text-slate-300 leading-relaxed font-semibold">
                          포털 동향 메뉴에서 검색어 기재 부분 외에, 등록된 핵심 추천 태그인 <b>#AI 기술 / #AI 규제 / #AI 연구</b>를 클릭만 해도 즉석에서 쿼리가 주입됩니다.
                        </p>
                      </div>
                      <div className="space-y-1 text-start pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                          수준별 AI 코칭 가변성
                        </h4>
                        <p className="text-[11.5px] text-slate-300 leading-relaxed font-semibold">
                          AI Classroom의 챗봇 상담은 SROI 자가 진단을 완수한 이력을 능동적으로 연동하여, 대답의 예시와 개념 난이도를 주체적으로 가변합니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 text-start">
                      자주 묻는 질문 (FAQ)
                    </h3>
                    <div className="space-y-3 text-start">
                      <div>
                        <p className="font-bold text-xs text-slate-800">Q. 모바일 환경 지원 여부</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-semibold">
                          CSES AI Insight Hub는 완전 반응형 UI로 설계되어 스마트폰 및 태블릿에서도 최적화되어 작동합니다.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <p className="font-bold text-xs text-slate-800">Q. 데이터 보안 가이드라인</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-semibold">
                          모든 인공지능 프롬프트 정제는 비식별화 처리를 원칙으로 하며 실시간 API 전송 단계에서 완전 폐기 처리됩니다.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
      </main>

      {/* --------------------------------------------------
          POPUP MODAL: Interactive Survey Diagnostics Panel (Card 3 trigger)
          -------------------------------------------------- */}
      {isSurveyOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 overflow-y-auto" 
          id="survey-diagnose-modal"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] md:max-h-[85vh] text-start"
          >
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base">나의 맞춤 강좌 추천 진단</h3>
              </div>
              <button 
                onClick={() => setIsSurveyOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: Level 선호 수준 */}
            {surveyStep === 1 && (
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>진행 흐름: <b>1 / 3 단계</b></span>
                  <span className="font-bold text-[#D20A50]">선호 LLM 도구</span>
                </div>
                <h4 className="text-slate-800 font-extrabold text-sm md:text-base leading-snug">
                  어떤 생성형 AI(LLM) 도구를 주로 선호하고 실무에 활발히 사용하시나요?
                </h4>
                
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { val: "ChatGPT", title: "ChatGPT (OpenAI)", desc: "GPT-4o, o1, o3-mini 등 탁월한 추론 성능의 OpenAI 서비스 선호", icon: Sparkles },
                    { val: "Claude", title: "Claude (Anthropic)", desc: "Claude 3.5 Sonnet 등 자연스러운 문맥 이해와 코딩 작성 장점 선호", icon: SlidersHorizontal },
                    { val: "Gemini", title: "Gemini (Google)", desc: "Gemini 1.5/2.0 Pro 등 대용량 Context 및 구글 생태계 유기적 연동 선호", icon: Cpu },
                    { val: "사용경험 없음", title: "사용해 본 경험 거의 없음 / 기타", desc: "본격적인 생성형 AI 도구를 아직 실무에 고정 사용해보지 않음", icon: HelpCircle }
                  ].map((opt) => (
                    <button 
                      key={opt.val}
                      onClick={() => handleSurveyOption("level", opt.val)}
                      className="text-left p-4 rounded-2xl border border-slate-200 hover:border-[#D20A50] hover:bg-pink-50/10 transition cursor-pointer flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <opt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs md:text-sm">{opt.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Topic 주 관심 분야 */}
            {surveyStep === 2 && (
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>진행 흐름: <b>2 / 3 단계</b></span>
                  <span className="font-bold text-[#D20A50]">AI 도구 활용 빈도</span>
                </div>
                <h4 className="text-slate-800 font-extrabold text-sm md:text-base leading-snug">
                  AI 도구를 연구 업무나 업무 보조용으로 얼마나 자주 호출하여 활용하고 계신가요?
                </h4>
                
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { val: "거의 매일 상시 활용", title: "거의 매일 상시 활용 중", desc: "주간 이메일, 문서 초안, 번역 및 리서치 아이디에이션 등 적극 활용", icon: Clock },
                    { val: "주 1~2회 가끔 사용", title: "주 1~2회 가끔 사용", desc: "특별히 긴 논문 번역이 필요하거나 핵심 요약 브리핑이 필요할 때 호출", icon: Info },
                    { val: "월 1~2회 미만 혹은 미사용", title: "월 1~2회 미만 혹은 거의 사용 안 함", desc: "개념은 어느 정도 알지만 실제 업무 프로세스 및 실무 흐름에 융합하지 못함", icon: X }
                  ].map((opt) => (
                    <button 
                      key={opt.val}
                      onClick={() => handleSurveyOption("topic", opt.val)}
                      className="text-left p-4 rounded-2xl border border-slate-200 hover:border-[#D20A50] hover:bg-pink-50/10 transition cursor-pointer flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <opt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs md:text-sm">{opt.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Skill 관심 기술 */}
            {surveyStep === 3 && (
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>진행 흐름: <b>3 / 3 단계</b></span>
                  <span className="font-bold text-[#D20A50]">희망 실무 과제</span>
                </div>
                <h4 className="text-slate-800 font-extrabold text-sm md:text-base leading-snug">
                  이번 맞춤 교육 강좌를 통해 특별히 심화 정복해보고 싶으신 실무적 목표는 무엇인가요?
                </h4>
                
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { val: "데이터 분석 및 시각화 자동화", title: "데이터 분석 및 시각화 자동화 📊", desc: "Python과 데이터분석 도구를 활용한 대화형 통계 및 SROI 계측 공시 자동화", icon: Table },
                    { val: "AI RAG 챗봇 제작 및 정보 검색", title: "AI RAG 챗봇 제작 및 정보 검색 🤖", desc: "연구원 내부 축적 문서 및 철저한 보안 가이드라인을 준수하는 나만의 GPT 챗봇 빌드", icon: Database },
                    { val: "고급 프롬프트 엔지니어링", title: "고급 프롬프트 엔지니어링 💡", desc: "체계적인 기획서 정밀 기안 및 소셜 임팩트 평가 보고서 자동 기안 최적화", icon: Sparkles },
                    { val: "행정 단순 반복 업무 자동화", title: "행정 단순 반복 업무 자동화 📝", desc: "회의록 원클릭 추출, 주간 계획 보고 기안 작성 등으로 실무 리딩 시간 절감", icon: FileText }
                  ].map((opt) => (
                    <button 
                      key={opt.val}
                      onClick={() => handleSurveyOption("skill", opt.val)}
                      className="text-left p-4 rounded-2xl border border-slate-200 hover:border-[#D20A50] hover:bg-pink-50/10 transition cursor-pointer flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <opt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs md:text-sm">{opt.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Survey Outcome */}
            {surveyStep === 4 && (
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-thin" id="diagnostic-survey-result-p">
                <div className="text-center space-y-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-[#D20A50] border border-slate-200 flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="text-slate-800 font-extrabold text-base md:text-lg">맞춤 분석 진단이 정상적으로 완료되었습니다!</h4>
                  <p className="text-slate-500 text-xs">
                    연구원님의 진단 인덱스 매핑에 부합하는 강좌 및 수준을 하단 대시보드와 리스트에 적용하였습니다.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">나의 진단 결과 키포인트</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-slate-700 font-bold">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/50">
                      <span className="text-[9px] text-slate-400 block font-normal">주용 LLM</span>
                      <span className="text-[#D20A50] truncate block">{surveyAnswers.level}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/50">
                      <span className="text-[9px] text-slate-400 block font-normal">사용 빈도</span>
                      <span className="text-purple-700 truncate block">{surveyAnswers.topic}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/50">
                      <span className="text-[9px] text-slate-400 block font-normal">희망 교육</span>
                      <span className="text-indigo-700 truncate block">{surveyAnswers.skill}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] tracking-widest font-bold text-[#D20A50] uppercase block">추천된 과목 수혜</span>
                  <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200 max-h-36 overflow-y-auto">
                    {ENHANCED_COURSES.filter(c => diagnosedCourseIds.includes(c.id)).map(c => (
                      <div key={c.id} className="text-xs text-slate-700 flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                        <span className="font-extrabold text-slate-900 truncate pr-2">✓ {c.title}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded shrink-0">{c.costType}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsSurveyOpen(false);
                    setActiveTab("AIClassroom");
                  }}
                  className="w-full bg-[#D20A50] text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg hover:bg-pink-650 transition cursor-pointer text-center"
                >
                  과목 추천 확인하러 AI 강의실로 가기
                </button>
              </div>
            )}

          </motion.div>
        </motion.div>
      )}

      {/* --------------------------------------------------
          POPUP MODAL: 실시간 뉴스 세부 및 AI 융합 분석 요약 모달 (Phase 3)
          -------------------------------------------------- */}
      {selectedNews && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 overflow-y-auto" 
          id="news-summary-viewer-modal"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] text-start relative"
          >
            {/* Modal Header Badge Section */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-white ${
                  (selectedNews.category || "기술") === "규제" 
                    ? "bg-orange-500" 
                    : (selectedNews.category || "기술") === "연구" 
                      ? "bg-emerald-500" 
                      : "bg-brand-500"
                }`}>
                  {selectedNews.category || "기술"}
                </span>
                <span className="bg-slate-100 text-slate-600 font-extrabold text-[10px] px-2.5 py-1 rounded-md">
                  {selectedNews.source || "주요 매체"}
                </span>
                <span className="text-slate-400 text-xs font-semibold font-mono ml-1">
                  {selectedNews.pubDate || "2026-06-24"}
                </span>
              </div>
              
              {/* Top Close Button */}
              <button 
                onClick={() => setSelectedNews(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2 text-slate-700">
              
              {/* Title Section */}
              <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-black text-slate-900 leading-snug tracking-tight">
                  {selectedNews.title}
                </h3>
              </div>

              {/* Cover Image */}
              <div className="relative rounded-[1.5rem] overflow-hidden aspect-[16/10] bg-slate-50 border border-slate-100 shadow-3xs">
                <img 
                  src={selectedNews.image || getNewsImageFallback(0)} 
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getNewsImageFallback(1);
                  }}
                />
              </div>

              {/* Core Original News Excerpt (First 1 Line Summary) */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-brand-500 bg-brand-50 px-2.5 py-1 rounded-md block w-fit tracking-wider uppercase">
                  기사 핵심 1줄 요약 📰
                </span>
                <div className="text-sm md:text-base leading-relaxed text-slate-800 bg-slate-50/70 p-6 rounded-3xl border border-slate-100">
                  <p className="font-bold text-slate-700 leading-relaxed">
                    {selectedNews.summary || selectedNews.description}
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Actions Footer with a clear Row Layout */}
            <div className="border-t border-slate-100 pt-4 flex gap-3 shrink-0 mt-3 w-full">
              {/* Primary: Article Original link */}
              <a 
                href={selectedNews.link}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-extrabold text-xs md:text-sm py-4 rounded-2xl transition duration-300 shadow-md shadow-brand-500/10 cursor-pointer"
              >
                <span>기사 원문 보러가기</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Secondary: Close */}
              <button 
                onClick={() => setSelectedNews(null)}
                className="px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-extrabold text-xs md:text-sm py-4 rounded-2xl transition cursor-pointer"
              >
                닫기
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}

    </div>
  );
}
