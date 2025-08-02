import CvAnalysisAgent from './CvAnalysisAgent.js';
import AutomationManager from './AutomationManager.js';

class AgentManager {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.cvAgent = new CvAnalysisAgent(apiKey);
    this.automationManager = new AutomationManager(apiKey);
    this.activeAgents = new Map();
    this.agentHistory = [];
  }

  // Agent başlatma
  async initializeAgent(agentType, config = {}) {
    const agentId = `${agentType}_${Date.now()}`;
    
    let agent;
    switch (agentType) {
      case 'cv_analysis':
        agent = this.cvAgent;
        break;
      case 'automation':
        agent = this.automationManager;
        break;
      default:
        throw new Error(`Bilinmeyen agent tipi: ${agentType}`);
    }

    this.activeAgents.set(agentId, {
      type: agentType,
      agent: agent,
      config: config,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    console.log(`${agentType} agent'ı başlatıldı: ${agentId}`);
    return agentId;
  }

  // Agent durumu kontrolü
  getAgentStatus(agentId) {
    const agentInfo = this.activeAgents.get(agentId);
    if (!agentInfo) {
      throw new Error(`Agent bulunamadı: ${agentId}`);
    }
    return agentInfo;
  }

  // Tüm aktif agent'ları listele
  getActiveAgents() {
    return Array.from(this.activeAgents.entries()).map(([id, info]) => ({
      id,
      type: info.type,
      status: info.status,
      createdAt: info.createdAt,
    }));
  }

  // Agent'ı durdur
  stopAgent(agentId) {
    const agentInfo = this.activeAgents.get(agentId);
    if (agentInfo) {
      agentInfo.status = 'stopped';
      agentInfo.stoppedAt = new Date().toISOString();
      this.agentHistory.push(agentInfo);
      this.activeAgents.delete(agentId);
      console.log(`Agent durduruldu: ${agentId}`);
    }
  }

  // CV Analiz işlemi
  async analyzeCvWithAgent(cvContent, jobDescription = "", agentId = null) {
    try {
      const result = await this.cvAgent.analyzeCv(cvContent, jobDescription);
      
      this.logAgentActivity('cv_analysis', {
        input: { cvLength: cvContent.length, hasJobDescription: !!jobDescription },
        output: { suitabilityScore: result.suitabilityScore },
        agentId: agentId,
      });

      return result;
    } catch (error) {
      this.logAgentActivity('cv_analysis', {
        input: { cvLength: cvContent.length, hasJobDescription: !!jobDescription },
        error: error.message,
        agentId: agentId,
      });
      throw error;
    }
  }

  // Otomatik CV iyileştirme
  async autoImproveCvWithAgent(cvContent, jobDescription = "", agentId = null) {
    try {
      const result = await this.automationManager.autoImproveCv(cvContent, jobDescription);
      
      this.logAgentActivity('cv_improvement', {
        input: { cvLength: cvContent.length, hasJobDescription: !!jobDescription },
        output: { hasImprovedCv: !!result.improvedCv, hasCoverLetter: !!result.coverLetter },
        agentId: agentId,
      });

      return result;
    } catch (error) {
      this.logAgentActivity('cv_improvement', {
        input: { cvLength: cvContent.length, hasJobDescription: !!jobDescription },
        error: error.message,
        agentId: agentId,
      });
      throw error;
    }
  }

  // Toplu işlem
  async batchProcessWithAgent(cvList, jobDescription = "", agentId = null) {
    try {
      const result = await this.automationManager.batchAnalyzeCvs(cvList, jobDescription);
      
      this.logAgentActivity('batch_analysis', {
        input: { cvCount: cvList.length, hasJobDescription: !!jobDescription },
        output: { 
          totalProcessed: result.summary.total,
          successCount: result.summary.successful,
          successRate: result.summary.successRate,
        },
        agentId: agentId,
      });

      return result;
    } catch (error) {
      this.logAgentActivity('batch_analysis', {
        input: { cvCount: cvList.length, hasJobDescription: !!jobDescription },
        error: error.message,
        agentId: agentId,
      });
      throw error;
    }
  }

  // E-posta şablonu oluşturma
  async generateEmailWithAgent(cvContent, jobDescription, emailType = "application", agentId = null) {
    try {
      const result = await this.automationManager.generateEmailTemplate(cvContent, jobDescription, emailType);
      
      this.logAgentActivity('email_generation', {
        input: { cvLength: cvContent.length, emailType, hasJobDescription: !!jobDescription },
        output: { hasSubject: !!result.subject, hasContent: !!result.content },
        agentId: agentId,
      });

      return result;
    } catch (error) {
      this.logAgentActivity('email_generation', {
        input: { cvLength: cvContent.length, emailType, hasJobDescription: !!jobDescription },
        error: error.message,
        agentId: agentId,
      });
      throw error;
    }
  }

  // İşlem kuyruğu yönetimi
  addTaskToQueue(task, agentId = null) {
    this.automationManager.addToQueue(async () => {
      try {
        const result = await task();
        this.logAgentActivity('queued_task', {
          input: { taskType: task.name || 'unknown' },
          output: { success: true },
          agentId: agentId,
        });
        return result;
      } catch (error) {
        this.logAgentActivity('queued_task', {
          input: { taskType: task.name || 'unknown' },
          error: error.message,
          agentId: agentId,
        });
        throw error;
      }
    });
  }

  getQueueStatus() {
    return this.automationManager.getQueueStatus();
  }

  // Agent aktivite logları
  logAgentActivity(activityType, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      activityType,
      ...data,
    };
    
    this.agentHistory.push(logEntry);
    
    // Log sayısını sınırla (son 1000 log)
    if (this.agentHistory.length > 1000) {
      this.agentHistory = this.agentHistory.slice(-1000);
    }
    
    console.log(`Agent Activity: ${activityType}`, logEntry);
  }

  // Agent geçmişi
  getAgentHistory(limit = 50) {
    return this.agentHistory.slice(-limit);
  }

  // Agent performans istatistikleri
  getAgentStats() {
    const stats = {
      totalActivities: this.agentHistory.length,
      activeAgents: this.activeAgents.size,
      activityTypes: {},
      errorRate: 0,
    };

    // Aktivite tiplerini say
    this.agentHistory.forEach(entry => {
      if (entry.activityType) {
        stats.activityTypes[entry.activityType] = (stats.activityTypes[entry.activityType] || 0) + 1;
      }
      
      if (entry.error) {
        stats.errorRate++;
      }
    });

    // Hata oranını hesapla
    if (stats.totalActivities > 0) {
      stats.errorRate = (stats.errorRate / stats.totalActivities) * 100;
    }

    return stats;
  }

  // Agent'ları temizle
  cleanup() {
    this.activeAgents.clear();
    this.agentHistory = [];
    console.log('Tüm agent\'lar temizlendi');
  }
}

export default AgentManager;