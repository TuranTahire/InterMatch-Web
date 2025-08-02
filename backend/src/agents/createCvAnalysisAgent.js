import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent } from "langchain/agents";
import { llm } from "../services/geminiService.js";
import { cvParserTool } from "../tools/cvParserTool.js";
import { jobParserTool } from "../tools/jobParserTool.js";

// Ajanın kullanacağı araçların listesi
const tools = [cvParserTool, jobParserTool];

// AJANIN KİMLİĞİNİ VE GÖREVİNİ TANIMLAYAN PROMPT ŞABLONU
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", `Sen bir CV ve iş ilanı analizi konusunda dünya standartlarında bir uzmansın.
    
    GÖREVİN:
    1. CV ve iş ilanı metinlerini analiz et
    2. Uygunluk skorunu hesapla (0-100)
    3. Eşleşen ve eksik becerileri tespit et
    4. Güçlü yanları ve zayıflıkları belirle
    5. Kişiselleştirilmiş öneriler sun
    6. Öncelikli aksiyonları belirle
    
    ÇIKTI FORMATI:
    {
      "type": "cv_analysis",
      "title": "📊 CV Analiz Sonuçları",
      "summary": "Kısa özet",
      "suitabilityScore": 75,
      "sections": {
        "skills": {
          "matching": ["skill1", "skill2"],
          "missing": ["skill3", "skill4"],
          "score": 80
        },
        "experience": {
          "years": 3,
          "relevance": "high",
          "score": 70
        }
      },
      "recommendations": [
        "Öneri 1",
        "Öneri 2"
      ],
      "priorityActions": [
        "Aksiyon 1",
        "Aksiyon 2"
      ]
    }
    
    Sana verilen araçları kullanarak en doğru sonuca ulaşmalısın.`],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"], // Ajanın hafızası (iç sesi) için yer tutucu
]);

const createCvAnalysisAgent = async () => {
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt: promptTemplate,
  });
  return agent;
};

export { createCvAnalysisAgent }; 