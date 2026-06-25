import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const query = req.query.query || "AI 기술";
  const display = req.query.display || "30";

  try {
    const response = await axios.get("https://openapi.naver.com/v1/search/news.json", {
      params: { query, display, sort: "sim" },
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID || "",
        "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET || "",
      },
    });
    res.status(200).json(response.data);
  } catch (err: any) {
    res.status(500).json({ error: "뉴스 불러오기 실패", details: err?.message });
  }
}
