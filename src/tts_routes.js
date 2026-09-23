// ==========================================================================
// CarePath Multi-Language TTS (Text-to-Speech) Audio Proxy & Synthesis
// Supports: English (en), Hindi (hi), Bengali (bn), Marathi (mr), Telugu (te), Tamil (ta)
// ==========================================================================

import { Router } from "express";

const router = Router();

const SUPPORTED_TTS_LANGS = {
  en: "en",
  hi: "hi",
  bn: "bn",
  mr: "mr",
  te: "te",
  ta: "ta"
};

/**
 * GET /api/tts
 * Query:
 *   - text: Text string to synthesize (e.g. "నమస్కారం")
 *   - lang: 2-letter or BCP-47 language tag (e.g. "te", "te-IN", "mr", "bn")
 * 
 * Streams MP3 audio data directly to client with audio/mpeg Content-Type
 * and 24h caching header for fast subsequent playback.
 */
router.get("/api/tts", async (req, res) => {
  try {
    const rawText = String(req.query.text || "").trim();
    const rawLang = String(req.query.lang || "en").trim().toLowerCase().split("-")[0];
    const lang = SUPPORTED_TTS_LANGS[rawLang] || "en";

    if (!rawText) {
      return res.status(400).json({ error: "Missing 'text' query parameter" });
    }

    // Limit text length to 400 characters per utterance for clinical safety
    const text = rawText.slice(0, 400);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`;

    const upstreamResponse = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/"
      }
    });

    if (!upstreamResponse.ok) {
      console.warn(`[TTS Proxy] Upstream returned status ${upstreamResponse.status} for lang "${lang}"`);
      return res.status(upstreamResponse.status).json({ error: "Upstream TTS synthesis failed" });
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", arrayBuffer.byteLength);
    res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hour caching
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("[TTS Proxy] Error synthesizing speech:", err);
    return res.status(500).json({ error: "Internal error generating speech audio" });
  }
});

export default router;
