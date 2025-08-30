// app/api/chat/route.ts

// import { openai } from "@ai-sdk/openai";
// import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const runtime = "edge";
export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { messages, system, tools } = await req.json();

//   const result = streamText({
//     model: openai("o4-mini"),
//     messages,
//     // forward system prompt and tools from the frontend
//     toolCallStreaming: true,
//     system,
//     tools: {
//       ...frontendTools(tools),
//     },
//     onError: console.log,
//   });

//   return result.toDataStreamResponse();
// }

export async function POST(request: Request) {
  const incoming = await request.json();

  const apiKey = request.headers.get("gemini-api-key");

  const googleClient = createGoogleGenerativeAI({
    apiKey: apiKey || process.env.GOOGLE_API_KEY,
  });

  const { messages } = incoming;
  const result = streamText({
    model: googleClient("gemini-2.5-flash"),
    messages,
  });

  // console.log(`result`, result);
  return result.toDataStreamResponse();
}
