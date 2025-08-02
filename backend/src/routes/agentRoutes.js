import express from "express";
import { agentManager } from "../managers/AgentManager.js";

const router = express.Router();

// Ajan çalıştırma endpoint'i
router.post("/invoke/:agentName", async (req, res) => {
  const { agentName } = req.params;
  const { input, context } = req.body;

  if (!input) {
    return res.status(400).json({ 
      error: "Input verisi zorunludur.",
      message: "Lütfen analiz edilecek metni gönderin."
    });
  }

  try {
    console.log(`📡 API isteği alındı: ${agentName} ajanı için`);
    
    // Context varsa input'a ekle
    let fullInput = input;
    if (context) {
      fullInput = `Context: ${JSON.stringify(context)}\n\nInput: ${input}`;
    }
    
    const result = await agentManager.run(agentName, fullInput);
    
    res.json({
      success: true,
      agent: agentName,
      output: result.output,
      steps: result.intermediateSteps || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ API hatası (${agentName}):`, error);
    res.status(500).json({ 
      error: error.message,
      agent: agentName,
      timestamp: new Date().toISOString()
    });
  }
});

// Kayıtlı ajanları listele
router.get("/list", (req, res) => {
  try {
    const agents = agentManager.getRegisteredAgents();
    const status = agentManager.getSystemStatus();
    
    res.json({
      success: true,
      agents: agents,
      systemStatus: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Ajan listesi hatası:", error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Konuşma geçmişini al
router.get("/history", (req, res) => {
  try {
    const { agent } = req.query;
    
    let history;
    if (agent) {
      history = agentManager.getAgentHistory(agent);
    } else {
      history = agentManager.getConversationHistory();
    }
    
    res.json({
      success: true,
      history: history,
      count: history.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Geçmiş alma hatası:", error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Konuşma geçmişini temizle
router.delete("/history", (req, res) => {
  try {
    agentManager.clearConversationHistory();
    
    res.json({
      success: true,
      message: "Konuşma geçmişi temizlendi",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Geçmiş temizleme hatası:", error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Sistem durumunu al
router.get("/status", (req, res) => {
  try {
    const status = agentManager.getSystemStatus();
    
    res.json({
      success: true,
      status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Durum alma hatası:", error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Ajan durumunu kontrol et
router.get("/check/:agentName", (req, res) => {
  try {
    const { agentName } = req.params;
    const isRegistered = agentManager.isAgentRegistered(agentName);
    
    res.json({
      success: true,
      agent: agentName,
      registered: isRegistered,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Ajan kontrol hatası:", error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 