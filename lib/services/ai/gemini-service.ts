import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-2.5-flash';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || 'dummy-key-for-build';
  return new GoogleGenAI({ apiKey });
}

export async function generateSummary(
  title: string,
  abstract: string,
  authors: string[]
): Promise<string> {
  const prompt = `Summarize this academic paper in 150-200 words. Focus on the problem, methodology, and key findings.

Title: ${title}
Authors: ${authors.join(', ')}
Abstract: ${abstract}

Provide a concise, formal academic summary.`;

  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      maxOutputTokens: 500,
      temperature: 0.3,
    },
  });

  return response.text || '';
}

export async function generateLiteratureReview(
  papers: { title: string; authors: string[]; year: number; abstract: string }[]
): Promise<string> {
  const paperList = papers
    .map((p, i) => `${i + 1}. ${p.title} (${p.year})\n   Authors: ${p.authors.join(', ')}\n   Abstract: ${p.abstract.slice(0, 300)}`)
    .join('\n\n');

  const prompt = `Generate a structured literature review based on these ${papers.length} papers:

${paperList}

Create a review with the following sections:
1. Overview: Brief introduction to the research area
2. Thematic Analysis: Group papers by themes/topics
3. Methodological Approaches: Compare methodologies used
4. Key Findings: Synthesize main results
5. Research Gaps: Identify areas needing more research
6. Timeline: Evolution of research over time

Use APA citations format. Be concise but comprehensive. Write in formal academic style.`;

  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      maxOutputTokens: 2000,
      temperature: 0.4,
    },
  });

  return response.text || '';
}

export async function generateGapAnalysis(
  papers: { title: string; abstract: string; fieldsOfStudy?: string[] }[]
): Promise<string> {
  const paperData = papers
    .map((p, i) => `${i + 1}. ${p.title}\n   Abstract: ${p.abstract.slice(0, 300)}\n   Fields: ${p.fieldsOfStudy?.join(', ') || 'N/A'}`)
    .join('\n\n');

  const prompt = `Analyze these papers and identify research gaps:

${paperData}

Provide:
1. Under-explored subtopics or areas with few studies
2. Methodological gaps (unused techniques, datasets, or approaches)
3. Contradictions or inconsistencies in findings
4. Future research directions suggested by the papers
5. Practical applications not yet explored

Be specific and actionable.`;

  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      maxOutputTokens: 1500,
      temperature: 0.5,
    },
  });

  return response.text || '';
}

export async function comparePapers(
  papers: { title: string; authors: string[]; abstract: string; year: number }[]
): Promise<string> {
  const paperData = papers
    .map((p, i) => `Paper ${i + 1}: ${p.title} (${p.year})\nAuthors: ${p.authors.join(', ')}\nAbstract: ${p.abstract.slice(0, 400)}`)
    .join('\n\n');

  const prompt = `Compare these ${papers.length} papers and create a detailed comparison:

${paperData}

Provide a comparison table or structured analysis covering:
- Research Problem/Question
- Methodology
- Dataset/Sample Size
- Key Findings
- Limitations
- Performance Metrics (if applicable)
- Novel Contributions

Highlight similarities and differences. Use a clear, systematic format.`;

  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      maxOutputTokens: 1500,
      temperature: 0.4,
    },
  });

  return response.text || '';
}

export async function* streamCompletion(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1000,
  temperature = 0.4
): AsyncGenerator<string> {
  const ai = getGeminiClient();

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  const responseStream = await ai.models.generateContentStream({
    model: MODEL,
    contents: fullPrompt,
    config: {
      maxOutputTokens: maxTokens,
      temperature,
    },
  });

  for await (const chunk of responseStream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
