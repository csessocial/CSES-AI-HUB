import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialization of Gemini client to prevent crash on startup if API key is missing.
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("[Warning] GEMINI_API_KEY is not configured or uses placeholder value. Fallback mechanism will be used.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// --------------------------------------------------
// API Routes
// --------------------------------------------------

/**
 * 1. News One-line Summary & Highlight (Phase 3)
 */
app.post("/api/news/one-line-summary", async (req, res) => {
  const { title, description, content } = req.body;
  
  const fallback = {
    oneLineSummary: `[Fallback] ${title || "뉴스의 중요한 사회적 가치 요약"}`,
    contextHighlight: `API 연결이 오프라인이거나 키설정이 없는 상태입니다. 원문 기사 요약: ${description || "내용을 요약할 수 없습니다."}`
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.warn("Gemini client is not available. Returning fallback.");
      return res.json(fallback);
    }

    const articleText = `제목: ${title}\n요약: ${description}\n본문: ${content || ""}`;
    const p = `다음 사회적 가치(Social Value) 관련 뉴스 기사 요소를 분석하여 다음 2가지 정보를 JSON 형식으로 만들어 주십시오:
1. "oneLineSummary": 기사를 가장 잘 나타내는 한 줄 핵심 요약 (이탤릭 볼드 느낌으로 직관적이고 강력한 1문장 표현).
2. "contextHighlight": 에메랄드 톤 큐레이션 영역에 들어갈 기사의 심층 사회적 가치(ESG, 지역혁신 등) 맥락적 임팩트 하이라이트 문장 (2~3문항으로 구체적 분석).

형식 예시:
{
  "oneLineSummary": "...",
  "contextHighlight": "..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: `기사 내용:\n${articleText}\n\n차례로 분석해 주십시오.` },
        { text: p }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            oneLineSummary: { type: Type.STRING },
            contextHighlight: { type: Type.STRING }
          },
          required: ["oneLineSummary", "contextHighlight"]
        }
      }
    });

    const resultText = response.text;
    if (resultText) {
      const parsed = JSON.parse(resultText);
      return res.json({
        oneLineSummary: parsed.oneLineSummary || fallback.oneLineSummary,
        contextHighlight: parsed.contextHighlight || fallback.contextHighlight
      });
    } else {
      console.warn("Gemini returned empty text for news analysis. Using fallback.");
      return res.json(fallback);
    }
  } catch (err: any) {
    console.warn("[Warning] Gemini Error in news analysis, serving fallback:", err?.message || err);
    return res.json(fallback);
  }
});

/**
 * 2. Education CSES AI Coach Chatbot (Phase 2)
 */
app.post("/api/education/chatbot", async (req, res) => {
  const { message, chatHistory, selectedCourseContext } = req.body;
  
  // Basic fallback response
  const fallbackReply = `안녕하세요! CSES AI 교육 큐레이션 코치입니다. 현재 AI 서비스가 임시 점검 중이거나 API 키가 설정되지 않았습니다.
연구원님께서 문의하신 관심 분야는 사회공헌 및 사회적 프롭텍, ESG 관련 주요 동향입니다.
관심 교육 과정(예: 'ESG 평가 실무', 'AI를 활용한 사회적가치 측정')을 추천해 드립니다. 하단의 강좌 리스트에서 자세한 커리큘럼을 살펴보실 수 있습니다!`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.warn("Gemini client is not available for Chatbot. Using fallback.");
      return res.json({
        reply: fallbackReply,
        recommendedCourseIds: [101, 103] // Default course codes
      });
    }

    // Prepare system instruction
    const systemIns = `당신은 사회적가치연구원(CSES)의 'AI 교육 큐레이션 코치'입니다. 
사회적 가치(SV), ESG 경영, 지역혁신, 사회공헌 및 관련 디지털 도구(AI 프롬프트 실무, 데이터 시각화) 분야에 대해 전문적이고 친절하며 연구원 눈높이에 맞는 학구적인 어조로 상담해주십시오.
질문에 정성스럽게 답변하고, 답변 끝에는 항상 연구원님을 응원하는 마음을 담은 자두빛 Plum 테마의 따뜻한 문장을 포함해 주세요.
그리고 답변 과정에서 아래 교육 과정 정보를 고려하여, 질문과 가장 밀접한 강좌 1~2개의 ID(101~106 중 선택)를 추천해 주세요. 추천하는 강좌 ID들을 반드시 답변 내에 언급하거나, 추천 리스트에 포함되도록 JSON에 정렬해 주세요.

[제공되는 교육 과정 리스트]
- ID 101: [K-MOOC] 사회적 가치 아카데미 (종합 입문)
- ID 102: ESG 공시 지표 마스터 클래스 (중급 실무)
- ID 103: AI 사업 기획 및 임팩트 프롬프팅 (고급 응용)
- ID 104: 사회적 혁신가 온보딩 코스 (입문 입문)
- ID 105: 데이터로 보는 지역 소멸 대응책 (중급 리서치)
- ID 106: 글로벌 사회공헌 트렌드 & Net zero 세미나 (고급 국제)

답변은 JSON 형태로 반환해 주세요. 형식:
{
  "reply": "마크다운 답변 본문내용...",
  "recommendedCourseIds": [101, 103]
}`;

    // Format previous history
    const contentsObj: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((h: any) => {
        contentsObj.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        });
      });
    }
    
    // Append the current message
    contentsObj.push({
      role: "user",
      parts: [{ text: `${message}\n(선택하거나 보고있는 교육 컨텍스트: ${JSON.stringify(selectedCourseContext || {})})` }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsObj,
      config: {
        systemInstruction: systemIns,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            recommendedCourseIds: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER }
            }
          },
          required: ["reply", "recommendedCourseIds"]
        }
      }
    });

    const responseText = response.text;
    if (responseText) {
      const parsed = JSON.parse(responseText);
      return res.json({
        reply: parsed.reply || fallbackReply,
        recommendedCourseIds: parsed.recommendedCourseIds || [101]
      });
    } else {
      console.warn("Empty response from AI Chatbot. Using fallback.");
      return res.json({ reply: fallbackReply, recommendedCourseIds: [101, 102] });
    }
  } catch (err: any) {
    console.warn("[Warning] Gemini Error in AI Chatbot, serving fallback:", err?.message || err);
    return res.json({
      reply: fallbackReply,
      recommendedCourseIds: [101, 104]
    });
  }
});

/**
 * 3. AI Prompt Executor (Phase 5)
 */
app.post("/api/prompt/execute", async (req, res) => {
  const { templateId, userContent } = req.body;

  let promptTemplate = "";
  let systemInstruction = "당신은 사회적가치연구원(CSES)의 가이드라인에 깊이 부합하는 수석 연구 자문 어드바이저입니다.";

  if (templateId === "translator") {
    promptTemplate = `학술 논문 초록 번역기 (English to Korean + SV 키워드 해석)
입력 텍스트:
${userContent}

역할 및 지시 사항:
- 입력된 영문 학술 논문 초록을 한글로 매끄럽고 학구적이게 의역해 주십시오. 
- 특히 사회적 가치(SV) 및 ESG 관련 중요한 핵심 키워드를 추출하여 별도의 "핵심 키워드 & 요약" 표로 해석을 덧붙여 주십시오. 마크다운 형식으로 작성해 주십시오.`;
  } else if (templateId === "writer") {
    promptTemplate = `사회적 가치 뉴스 기사 작성기 (팩트 기반 보도자료 초안)
입력 텍스트/키워드:
${userContent}

역할 및 지시 사항:
- 연구원이 제공한 사실(Fact) 혹은 핵심 아이디어를 기반으로 사회적가치연구원의 홍보 톤앤매너에 어울리는 정갈한 언론 보도자료 초안 뼈대(제목, 부제, 본문, 연구원 코멘트 예시)를 구성해 주십시오. 마크다운 형식으로 작성해 주십시오.`;
  } else if (templateId === "advisor") {
    promptTemplate = `기획서 고도화 AI 어드바이저
기획서 개요:
${userContent}

역할 및 지시 사항:
- 이 사회적 혁신 기획서를 심도 깊게 검토하여, UN SDGs 연계 가능성, 사회적 임팩트 측정 및 성과 보고 보완점, 대상자 확장 전략 등을 전문가 관점에서 구체적인 대안 3가지로 구체화하여 제시해 주십시오. 마크다운 형식으로 깔끔하게 정렬해 주십시오.`;
  } else {
    promptTemplate = `다음 내용을 검토 및 요약해라:\n${userContent}`;
  }

  const fallbackResult = `[Fallback 결과 안내]
AI 서비스 연동 지연으로 인해 로컬 템플릿 결과로 즉시 안전하게 변환하였습니다:

### 📄 입력된 핵심 리서치 개요
${userContent || "입력값이 없습니다."}

### 💡 임시 분석 코멘트
- 사회적가치연구원(CSES)의 연구원 전용 도구를 통해 정상적으로 안전 장치(Fallback)가 가동되었습니다. 
- 입력된 텍스트는 임팩트 창출 평가 프레임워크와 결합하기 유용하며, 추후 API가 정식 복구되면 Gemini를 사용해 보다 깊이 있는 분석 보고서를 실시간 생성할 수 있습니다. 
- 복사 버튼을 눌러 본 템플릿을 다른 메모장에 기록하여 보고서 기초 뼈대로 활용하십시오.`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.warn("Gemini client is not available for Prompt Exec. Using fallback.");
      return res.json({ result: fallbackResult });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptTemplate,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (text) {
      return res.json({ result: text });
    } else {
      console.warn("Empty prompt result returned from Gemini. Using fallback.");
      return res.json({ result: fallbackResult });
    }
  } catch (err: any) {
    console.warn("[Warning] Gemini Error in Prompt Execution, serving fallback:", err?.message || err);
    return res.json({ result: fallbackResult });
  }
});

/**
 * 4. Naver News Search API Proxy with Realistic Curated Fallback (Phase 4)
 */
app.get("/api/naver-news", async (req, res) => {
  const query = req.query.query ? String(req.query.query) : "사회적가치 인공지능";
  const displayCount = req.query.display ? Number(req.query.display) : 20;

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  // Rich, curated, academic-style custom fallback news articles representing realistic dates
  const curatedFallbackNews = [
    {
      title: "<b>[국내]</b> SK그릅, 'AI 기반 SROI(사회적 투자수익률) 시뮬레이터' 연구 고도화 착수",
      description: "SK그룹과 사회적가치연구원이 인공지능 거대언어모델(LLM)을 활용하여 기업 사회공헌 활동의 비용 대비 임팩트(SROI)를 정량 계산하는 알고리즘 고도화 세미나를 공동 진행했다.",
      pubDate: "2026-05-07",
      source: "동아 비즈니스 브리프",
      origin: "국내",
      link: "https://www.cses.re.kr"
    },
    {
      title: "<b>[해외]</b> UN, 공공 리서치를 위한 글로벌 사회 가치 'G-AI' 연합 프레임워크 제안",
      description: "국제 사회적 성과 위원회가 인공지능 디지털 포용성 등 디지털 인프라의 사회 가치 창출력을 평가하기 위한 표준화 뱃지 측정 기준(UN SDGs 연계형)을 정식 발간했다.",
      pubDate: "2026-05-07",
      source: "글로벌 임팩트 데일리",
      origin: "해외",
      link: "https://www.un.org"
    },
    {
      title: "<b>[국내]</b> 네이버, 소상공인 친환경 포장 가치 창출에 '클로바 AI 컨설턴트' 무료 도입",
      description: "네이버가 탄소 배출 저감 효과를 기대하는 친환경 소상공인을 대상으로 AI 자문을 가동하여 녹색 소셜 벤처 육성에 기여하는 연계형 ESG 프로그램을 론칭했다.",
      pubDate: "2026-05-06",
      source: "K-벤처포럼",
      origin: "국내",
      link: "https://naver.com"
    },
    {
      title: "<b>[해외]</b> OpenAI, 비영리 연구 단체 대상 '공익적 AI 에이전트' 크레딧 기부 선언",
      description: "OpenAI가 기후 연구 및 사회 통합 연구를 저술하는 비영리 단체 50곳을 엄선하여 고성능 리즈닝 모델 인스턴스를 무상으로 자유롭게 쓸 수 있는 연합 크레딧을 교부한다.",
      pubDate: "2026-05-06",
      source: "Tech Crunch Global",
      origin: "해외",
      link: "https://openai.com"
    },
    {
      title: "<b>[국내]</b> 국립대학 연합, '지역 소멸 대응용 AI 지리정보 빅데이터 분석 모델' 공동 공개",
      description: "영호남 주요 거점 강소공동대학 연구팀들과 지자체가 손잡고 AI 거주 매력도 시뮬레이션을 도출, 인구 감소지역 고령화 문제 해결 등의 가시적 사회 가치 모델을 성문화했다.",
      pubDate: "2026-05-05",
      source: "한국 교육 연구 저널",
      origin: "국내",
      link: "https://www.re.kr"
    },
    {
      title: "<b>[해외]</b> 독일 막스플랑크 연구소, AI 윤리 가이드라인 '사회적 신뢰 성적표' 베타 공개",
      description: "학술 및 공공 도메인에서의 투명성 제고를 목표로 알고리즘 편향에 따르는 지표를 추적, 다국적 사회공헌 연구에 전면 도입 가능한 검사 지표 패키지를 출판했다.",
      pubDate: "2026-05-05",
      source: "EU 사이언스 뉴스",
      origin: "해외",
      link: "https://www.mpg.de"
    },
    {
      title: "<b>[국내]</b> 사회적가치연구원(CSES), 대학생 기후 위기 해커톤 'AI가 그리는 그린 시티' 시상식 개최",
      description: "전국 30개 대학의 아이디어가 모집된 기후 가치 측정 해커톤에서 인공지능 하이퍼로컬 알고리즘을 탄소 감축에 대입한 소셜벤처 아이디어가 대상을 차지했다.",
      pubDate: "2026-05-04",
      source: "CSES 프레스룸",
      origin: "국내",
      link: "https://www.cses.re.kr"
    },
    {
      title: "<b>[해외]</b> 마이크로소프트, AI 활용 사회공헌 보고서 '2026 글로벌 지구 지속가능성 인스펙션' 발표",
      description: "마이크로소프트가 재생 에너지 발전을 극대화하는 클라우드 워크로드 기법을 제시하여, AI 고도화에 따른 환경 부하를 사회공헌 투자 증가로 상쇄하는 대차대조표를 보고했다.",
      pubDate: "2026-05-04",
      source: "The Wall Street News",
      origin: "해외",
      link: "https://microsoft.com"
    }
  ];

  if (!clientId || !clientSecret || clientId === "YOUR_NAVER_CLIENT_ID") {
    // If client ID/Secret not set, gracefully fallback to realistic custom curated data
    console.log("[Notice] Naver Client ID/Secret not configured. Serving realistic curated academic news.");
    return res.json({
      status: "fallback",
      query,
      items: curatedFallbackNews
    });
  }

  try {
    const naverApiUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${displayCount}&sort=date`;
    const response = await fetch(naverApiUrl, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Naver News API responded with status ${response.status}`);
    }

    const data: any = await response.json();
    
    // Smoothly parse and enhance items
    const parsedItems = (data.items || []).map((item: any) => {
      const isOverseas = item.title.includes("해외") || item.description.includes("Global") || item.description.includes("미국") || item.description.includes("UN") || item.description.includes("글로벌");
      const cleanTitle = item.title
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/<b>/g, "")
        .replace(/<\/b>/g, "");
      
      const cleanDesc = item.description
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/<b>/g, "")
        .replace(/<\/b>/g, "");

      // Formatting pubDate from Naver (e.g. "Tue, 23 Jun 2026 12:44:00 +0900") into YYYY-MM-DD
      let formattedDate = "2026-05-07";
      try {
        if (item.pubDate) {
          const d = new Date(item.pubDate);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toISOString().split("T")[0];
          }
        }
      } catch (e) {}

      return {
        title: `<b>[${isOverseas ? "해외" : "국내"}]</b> ${cleanTitle}`,
        description: cleanDesc,
        pubDate: formattedDate,
        source: item.source || "네이버 뉴스",
        origin: isOverseas ? "해외" : "국내",
        link: item.link || item.originallink || "https://naver.com"
      };
    });

    return res.json({
      status: "success",
      query,
      items: parsedItems.length > 0 ? parsedItems : curatedFallbackNews
    });

  } catch (err: any) {
    console.warn("[Warning] Error accessing Naver News API, falling back to curated list:", err?.message || err);
    return res.json({
      status: "fallback_on_error",
      query,
      items: curatedFallbackNews
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// --------------------------------------------------
// Vite Middleware / Static Asset Serving
// --------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CSES Server] Server running on http://localhost:${PORT}`);
  });
}

startServer();
