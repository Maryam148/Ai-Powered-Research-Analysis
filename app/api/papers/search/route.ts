import { NextRequest } from 'next/server';
import { searchSemanticScholar } from '@/lib/services/paper-sources/semantic-scholar';
import { searchOpenAlex } from '@/lib/services/paper-sources/openalex';
import { searchCrossRef } from '@/lib/services/paper-sources/crossref';
import { isDuplicate } from '@/lib/utils/dedup';
import { Paper } from '@/lib/types/paper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return new Response('Query parameter is required', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const seenPapers: Paper[] = [];

      const sendPaper = (paper: Paper) => {
        if (!isDuplicate(paper, seenPapers)) {
          seenPapers.push(paper);
          const data = `data: ${JSON.stringify(paper)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      };

      const sendComplete = (source: string) => {
        const data = `data: ${JSON.stringify({ type: 'complete', source })}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      // Launch all sources concurrently
      const sources = [
        searchSemanticScholar(query, 50).then(papers => {
          papers.forEach(sendPaper);
          sendComplete('semantic-scholar');
        }),
        searchOpenAlex(query, 50).then(papers => {
          papers.forEach(sendPaper);
          sendComplete('openalex');
        }),
        searchCrossRef(query, 50).then(papers => {
          papers.forEach(sendPaper);
          sendComplete('crossref');
        }),
      ];

      // Wait for all sources to complete
      await Promise.allSettled(sources);

      // Send final completion
      const finalData = `data: ${JSON.stringify({ type: 'done', total: seenPapers.length })}\n\n`;
      controller.enqueue(encoder.encode(finalData));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
