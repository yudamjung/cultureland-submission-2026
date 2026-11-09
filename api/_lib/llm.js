// 채팅 완성 API 클라이언트. OpenAI chat completions API가 기본값이다.
// 답변 생성 모델만 담당한다. 검색(임베딩)은 embed.js가 맡는다.
export const DEFAULT_CHAT_MODEL = 'gpt-4o-mini';
export const DEFAULT_CHAT_BASE_URL = 'https://api.openai.com/v1';

// messages: [{ role: 'system' | 'user', content: string }]
// 반환: 첫 번째 선택지의 메시지 내용 (string)
export async function chatComplete(
  messages,
  { apiKey, model = DEFAULT_CHAT_MODEL, baseUrl = DEFAULT_CHAT_BASE_URL, temperature = 0.2, maxTokens = 400, timeoutMs = 30000 } = {},
) {
  if (!apiKey) throw new Error('CHAT_API_KEY_MISSING');
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`CHAT_UPSTREAM_${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('CHAT_BAD_RESPONSE');
  return content.trim();
}
