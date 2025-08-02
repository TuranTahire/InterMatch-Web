// test-gemini.js - Basit API test
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

async function testConnection() {
  console.log("🔍 Google GenAI bağlantısı test ediliyor...");

  const apiKey = 'AIzaSyBXB96o1JSYTX3kzbkwt8UCorYB79_QQ9w';

  try {
    console.log("📡 Model oluşturuluyor...");
    const llm = new ChatGoogleGenerativeAI({ 
      model: "gemini-1.5-pro",
      apiKey: apiKey 
    });
    console.log("✅ Model başarıyla oluşturuldu");

    console.log("🚀 Test isteği gönderiliyor...");
    const response = await llm.invoke("Merhaba! Sen çalışıyor musun? Kısa bir cevap ver.");

    console.log("🎉 BAŞARILI! Gemini'dan cevap:");
    console.log(response.content);
    console.log("✅ API bağlantısı çalışıyor!");

  } catch (error) {
    console.error("❌ HATA:", error.message);
  }
}

testConnection(); 