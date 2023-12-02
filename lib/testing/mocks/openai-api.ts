import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const mockOpenAIAPIServer = setupServer(
  rest.post('https://api.openai.com/v1/embeddings', async (req, res, ctx) => {
    const body = await req.json();
    return res(
      ctx.status(200),
      ctx.body(
        JSON.stringify({
          model: 'text-embedding-ada-002-v2',
          object: 'list',
          usage: { prompt_tokens: 10, total_tokens: 10 },
          data: Array.from(Array(body.input.length).keys()).map((i) => [
            {
              object: 'embedding',
              index: 0,
              embedding: [0, 0, 0, 0, 0, 0],
            },
          ]),
        }),
      ),
    );
  }),
);
