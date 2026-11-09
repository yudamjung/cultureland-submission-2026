// 임베딩 API 클라이언트. OpenAI embeddings API가 기본값이다.
// Kanana-2-embedding 같은 자체 모델로 갈아끼우려면 이 파일의 embedTexts만
// 바꾸면 된다. 단, 문서와 질문은 반드시 같은 모델로 임베딩해야 한다.
// 벡터 공간이 달라지면 코사인 유사도가 무의미해진다. 모델을 바꾸면
// 인덱서를 다시 돌려 data/catalog-vectors.json을 다시 만들어야 한다.
export const DEFAULT_EMBED_MODEL = 'text-embedding-3-small';
export const DEFAULT_EMBED_BASE_URL = 'https://api.openai.com/v1';

// texts: string[] (1개면 [question]처럼 배열로 넘긴다)
// 반환: number[][] (texts와 같은 순서의 벡터들)
export async function embedTexts(texts, { apiKey, model = DEFAULT_EMBED_MODEL, baseUrl = DEFAULT_EMBED_BASE_URL, timeoutMs = 30000 } = {}) {
  if (!apiKey) throw new Error('EMBED_API_KEY_MISSING');
  if (!Array.isArray(texts) || texts.length === 0) throw new Error('EMBED_EMPTY_INPUT');
  const res = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input: texts }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`EMBED_UPSTREAM_${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  if (!Array.isArray(json.data) || json.data.length !== texts.length) {
    throw new Error('EMBED_BAD_RESPONSE');
  }
  return json.data.map((d) => d.embedding);
}
