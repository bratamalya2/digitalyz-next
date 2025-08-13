import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes data using OpenAI
 * @param {Object} data - The data to analyze (clientData, workerData, taskData)
 * @param {string} analysisType - Type of analysis to perform
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeDataWithAI = async (data, analysisType = 'general') => {
  try {
    const prompt = createAnalysisPrompt(data, analysisType);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a data analyst expert specializing in workforce management and task allocation. Provide clear, actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    return {
      success: true,
      analysis: completion.choices[0].message.content,
      usage: completion.usage
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Creates analysis prompt based on data and analysis type
 * @param {Object} data - The data to analyze
 * @param {string} analysisType - Type of analysis
 * @returns {string} Formatted prompt
 */
const createAnalysisPrompt = (data, analysisType) => {
  const { clientData, workerData, taskData } = data;
  
  const basePrompt = `
Analyze the following workforce management data:

CLIENTS (${clientData.length} total):
${clientData.slice(0, 3).map(client => 
  `- ${client.ClientName} (Priority: ${client.PriorityLevel}, Tasks: ${client.RequestedTaskIDs?.join(', ') || 'None'})`
).join('\n')}
${clientData.length > 3 ? `... and ${clientData.length - 3} more clients` : ''}

WORKERS (${workerData.length} total):
${workerData.slice(0, 3).map(worker => 
  `- ${worker.WorkerName} (Skills: ${worker.Skills?.join(', ') || 'None'}, Max Load: ${worker.MaxLoadPerPhase})`
).join('\n')}
${workerData.length > 3 ? `... and ${workerData.length - 3} more workers` : ''}

TASKS (${taskData.length} total):
${taskData.slice(0, 3).map(task => 
  `- ${task.TaskName} (Duration: ${task.Duration}, Skills: ${task.RequiredSkills?.join(', ') || 'None'})`
).join('\n')}
${taskData.length > 3 ? `... and ${taskData.length - 3} more tasks` : ''}
  `;

  switch (analysisType) {
    case 'capacity':
      return basePrompt + '\n\nFocus on: Analyze worker capacity vs task demand. Identify bottlenecks and resource allocation issues.';
    
    case 'skills':
      return basePrompt + '\n\nFocus on: Analyze skill gaps and mismatches. Identify which skills are in high demand vs available capacity.';
    
    case 'priority':
      return basePrompt + '\n\nFocus on: Analyze client priority distribution and potential conflicts. Suggest priority-based allocation strategies.';
    
    case 'optimization':
      return basePrompt + '\n\nFocus on: Provide optimization recommendations for better task allocation and resource utilization.';
    
    default:
      return basePrompt + '\n\nProvide a comprehensive analysis covering capacity, skills, priorities, and optimization opportunities.';
  }
};

/**
 * Generates task allocation suggestions using OpenAI
 * @param {Object} data - The data to analyze
 * @returns {Promise<Object>} Allocation suggestions
 */
export const generateAllocationSuggestions = async (data) => {
  try {
    const prompt = `
Based on this workforce data, suggest optimal task allocations:

${JSON.stringify(data, null, 2)}

Provide specific allocation recommendations in the following format:
- Task ID -> Worker ID (Reason)
- Include phase assignments where applicable
- Consider priority levels, skill matches, and capacity constraints
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a workforce allocation optimizer. Provide specific, actionable task assignments."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.2,
    });

    return {
      success: true,
      suggestions: completion.choices[0].message.content,
      usage: completion.usage
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};