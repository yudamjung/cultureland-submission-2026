import axios from 'axios';

const client = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

const FAILED = 'AI 답변을 가져오지 못했어요. 잠시 후 다시 시도해 주세요.';
const OFFLINE = 'AI 서비스에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.';

// POST /api/ask -> { answer, match } (match: 출처가 하나일 때 그 사용처 id)
export async function ask(question) {
  try {
    const { data } = await client.post('/ask', { question });
    return { answer: data.answer, sourceId: data.sources?.length === 1 ? data.sources[0].id : null };
  } catch (error) {
    // 서버가 응답한 에러면 message를, 아니면(네트워크 등) 연결 실패 문구를 쓴다.
    return { answer: error.response ? error.response.data?.message || FAILED : OFFLINE, sourceId: null };
  }
}
