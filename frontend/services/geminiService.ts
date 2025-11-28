
import { GoogleGenAI } from "@google/genai";
import { dbService } from "./dbService";

const getLocalFileContext = () => {
    try {
        const context = localStorage.getItem('codeme_file_context');
        if (!context) return "";
        
        const files = JSON.parse(context);
        if (!Array.isArray(files) || files.length === 0) return "";

        // Limit context size roughly
        return `
[CONTEXT FROM UPLOADED FILES]
The following information is from the user's uploaded files. Use this information to answer questions if relevant.

${files.map((f: any) => `--- FILE: ${f.name} ---\n${f.content.substring(0, 8000)}`).join('\n\n')}
-----------------------------
`;
    } catch (e) {
        console.error("Error reading file context", e);
        return "";
    }
}

export const generateChatResponse = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  // API Key must be obtained exclusively from process.env.API_KEY
  // Assume process.env.API_KEY is pre-configured and valid.

  // Retrieve context from uploaded files (RAG)
  const fileContext = getLocalFileContext();
  const systemInstruction = `You are Hey Me, an intelligent personal AI agent. 
  Your goal is to assist the user based on their data and queries.
  ${fileContext ? fileContext : "No uploaded file context available."}
  If the user asks about the uploaded files, refer to the context provided above.
  Be professional, concise, and helpful.
  IMPORTANT: You must ALWAYS respond in Korean language, regardless of the input language.`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = ai.models;
    
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: {
        systemInstruction: systemInstruction
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // NOTE: We do NOT log private chat failures to the public dashboard DB anymore.
    // dbService.logFailure(newMessage);

    return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export const analyzeFileMetadata = async (fileName: string, fileType: string, fileContent: string | null = null) => {
  if (!process.env.API_KEY) {
      console.warn("API Key not found in environment variables.");
      return "API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = ai.models;
    
    let prompt = `You are an intelligent file assistant. Analyze the likely content of a file named "${fileName}" with type "${fileType}". Provide a concise, professional 2-sentence summary of what this file likely contains and its utility. Respond in Korean.`;
    
    if (fileContent) {
        prompt = `Analyze the following file content (Filename: ${fileName}). Provide a concise summary of what this file contains:\n\n---\n${fileContent.substring(0, 1000)}\n---\n\nRespond in Korean.`;
    }

    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { 
            role: 'user', 
            parts: [{ text: prompt }] 
        }
      ]
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "파일 분석에 실패했습니다.";
  }
};
