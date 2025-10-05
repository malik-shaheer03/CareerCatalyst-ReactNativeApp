import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBbhkLUVTDC1j9GpVBJyGcs3YYe2oQHoC0";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface InterviewResponse {
  question: string;
  answer: string;
  duration: number;
}

export const generateMCQs = async (jobTitle: string, difficulty: string, count: number): Promise<Question[]> => {
  try {
    const prompt = `Generate exactly ${count} multiple choice questions for a ${jobTitle} interview at ${difficulty} level.

Requirements:
- Questions should be relevant to ${jobTitle} role
- Difficulty level: ${difficulty}
- Each question must have exactly 4 options
- Include practical scenarios and technical knowledge
- Provide clear explanations

Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": 1,
    "question": "What is the primary responsibility of a ${jobTitle}?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Make sure:
- correctAnswer is the index (0-3) of the correct option
- Questions are appropriate for ${difficulty} level
- Focus on real-world scenarios and best practices
- Each question tests different aspects of the role`;

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let questions: Question[];
    try {
      questions = JSON.parse(text);

      // Validate the response structure
      if (!Array.isArray(questions) || questions.length !== count) {
        throw new Error("Invalid response format");
      }

      // Validate each question
      questions.forEach((q, index) => {
        if (
          !q.question ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          typeof q.correctAnswer !== "number" ||
          q.correctAnswer < 0 ||
          q.correctAnswer > 3 ||
          !q.explanation
        ) {
          throw new Error(`Invalid question format at index ${index}`);
        }
        // Ensure id is set correctly
        q.id = index + 1;
      });

      return questions;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw AI response:", text);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Error generating MCQs:", error);

    // Fallback to sample questions if AI fails
    return generateFallbackQuestions(jobTitle, difficulty, count);
  }
};

// Generate interview questions for voice interview
export const generateInterviewQuestions = async (
  jobTitle: string,
  difficulty: string,
  count = 8,
): Promise<string[]> => {
  try {
    const prompt = `Generate exactly ${count} interview questions for a ${jobTitle} position at ${difficulty} level.

Requirements:
- Questions should be open-ended and suitable for verbal responses
- Mix of technical, behavioral, and situational questions
- Appropriate for ${difficulty} level candidates
- Focus on real-world scenarios and practical experience
- Questions should encourage detailed responses
- Include both role-specific and general professional questions

Return ONLY a valid JSON array of strings:
["Question 1 here?", "Question 2 here?", "Question 3 here?"]

Make questions conversational and natural for a voice interview.`;

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    const questions: string[] = JSON.parse(text);
    
    // Validate questions
    if (!Array.isArray(questions) || questions.length !== count) {
      throw new Error("Invalid questions format");
    }

    return questions;
  } catch (error) {
    console.error("Error generating interview questions:", error);

    // Fallback questions
    return [
      `Tell me about yourself and your experience as a ${jobTitle}.`,
      `What interests you most about this ${jobTitle} position?`,
      "Describe a challenging project you've worked on recently and how you overcame the obstacles.",
      "How do you handle tight deadlines and work under pressure?",
      "What are your greatest strengths and how do they apply to this role?",
      "Tell me about a time when you had to learn a new technology or skill quickly.",
      "How do you stay updated with the latest trends and developments in your field?",
      "Where do you see yourself in your career in the next 5 years?",
    ];
  }
};

// Analyze interview performance
export const analyzeInterviewPerformance = async (
  jobTitle: string,
  difficulty: string,
  responses: InterviewResponse[],
): Promise<any> => {
  try {
    const prompt = `Analyze the interview performance for a ${jobTitle} position at ${difficulty} level.

Interview Data:
${responses.map((r, i) => `
Question ${i + 1}: ${r.question}
Answer: ${r.answer}
Response Time: ${Math.round(r.duration / 1000)} seconds
`).join('\n')}

Provide a comprehensive analysis in the following JSON format:
{
  "overallScore": 85,
  "confidence": "High/Medium/Low",
  "tone": "Professional/Casual/Nervous",
  "answerQuality": "Excellent/Good/Satisfactory/Needs Improvement",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "feedback": "Detailed overall feedback paragraph",
  "technicalKnowledge": "Assessment of technical knowledge demonstrated",
  "communicationSkills": "Assessment of communication effectiveness",
  "responseTime": "Analysis of response timing and pacing"
}

Analyze:
1. Content quality and relevance of answers
2. Communication clarity and structure
3. Confidence level based on language used
4. Technical knowledge demonstration
5. Professional tone and demeanor
6. Response timing (too fast/slow/appropriate)
7. Specific examples and details provided
8. Overall interview readiness

Be constructive and provide actionable feedback.`;

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    const analysis = JSON.parse(text);
    return analysis;
  } catch (error) {
    console.error("Error analyzing performance:", error);

    // Fallback analysis
    const avgResponseTime = responses.reduce((acc, r) => acc + r.duration, 0) / responses.length / 1000;
    const answeredQuestions = responses.filter(r => r.answer !== "No response provided").length;
    const responseRate = (answeredQuestions / responses.length) * 100;

    return {
      overallScore: Math.min(Math.max(Math.round(responseRate * 0.8 + (avgResponseTime < 30 ? 20 : 10)), 40), 95),
      confidence: avgResponseTime < 15 ? "High" : avgResponseTime < 30 ? "Medium" : "Low",
      tone: "Professional",
      answerQuality: responseRate > 80 ? "Good" : responseRate > 60 ? "Satisfactory" : "Needs Improvement",
      strengths: [
        "Participated in the interview process",
        "Demonstrated willingness to engage",
        answeredQuestions > responses.length * 0.8 ? "Answered most questions" : "Showed effort in responding"
      ],
      improvements: [
        avgResponseTime > 30 ? "Work on response timing" : "Provide more detailed examples",
        "Practice articulating thoughts clearly",
        "Prepare specific examples from experience"
      ],
      feedback: `You completed ${answeredQuestions} out of ${responses.length} questions with an average response time of ${Math.round(avgResponseTime)} seconds. ${responseRate > 70 ? "Good participation overall." : "Consider practicing more to improve response rate."} Focus on providing specific examples and maintaining a steady pace during responses.`,
      technicalKnowledge: "Assessment based on provided responses",
      communicationSkills: avgResponseTime < 20 ? "Quick responses, ensure clarity" : "Take time to structure responses well",
      responseTime: avgResponseTime < 15 ? "Very quick responses" : avgResponseTime < 30 ? "Good pacing" : "Consider more concise responses"
    };
  }
};

// Fallback questions for MCQs
const generateFallbackQuestions = (jobTitle: string, difficulty: string, count: number): Question[] => {
  const baseQuestions = [
    {
      id: 1,
      question: `What is a key responsibility of a ${jobTitle}?`,
      options: [
        "Writing clean, maintainable code",
        "Managing team schedules only",
        "Handling customer support exclusively",
        "Working in isolation",
      ],
      correctAnswer: 0,
      explanation: "Writing clean, maintainable code is a fundamental responsibility for technical roles.",
    },
    {
      id: 2,
      question: `Which skill is most important for a ${jobTitle} in ${difficulty} level positions?`,
      options: [
        "Only technical expertise",
        "Only communication skills",
        "Problem-solving and collaboration",
        "Working without supervision",
      ],
      correctAnswer: 2,
      explanation: "Problem-solving and collaboration are essential skills that combine technical and soft skills.",
    },
    {
      id: 3,
      question: `What is the best practice for code review in a ${jobTitle} role?`,
      options: [
        "Review code after deployment",
        "Skip reviews for small changes",
        "Review code before merging to main branch",
        "Only senior developers should review",
      ],
      correctAnswer: 2,
      explanation: "Code should always be reviewed before merging to maintain quality and catch issues early.",
    },
    {
      id: 4,
      question: `How should a ${jobTitle} handle technical debt?`,
      options: [
        "Ignore it completely",
        "Address it gradually while developing new features",
        "Fix everything at once",
        "Leave it for the next team",
      ],
      correctAnswer: 1,
      explanation: "Technical debt should be addressed gradually to maintain system health without blocking progress.",
    },
    {
      id: 5,
      question: `What is important when working in a team as a ${jobTitle}?`,
      options: [
        "Working in complete isolation",
        "Clear communication and documentation",
        "Avoiding all meetings",
        "Only focusing on individual tasks",
      ],
      correctAnswer: 1,
      explanation: "Clear communication and documentation are essential for effective teamwork and knowledge sharing.",
    },
    {
      id: 6,
      question: `Which approach is best for learning new technologies as a ${jobTitle}?`,
      options: [
        "Wait for formal training only",
        "Learn everything at once",
        "Continuous learning and hands-on practice",
        "Avoid new technologies",
      ],
      correctAnswer: 2,
      explanation: "Continuous learning and hands-on practice help stay current with evolving technologies.",
    },
    {
      id: 7,
      question: `How should a ${jobTitle} approach debugging complex issues?`,
      options: [
        "Guess randomly until something works",
        "Systematic approach with logging and testing",
        "Ask others to fix it immediately",
        "Restart everything and hope it works",
      ],
      correctAnswer: 1,
      explanation: "A systematic approach with proper logging and testing is the most effective debugging method.",
    },
    {
      id: 8,
      question: `What is the importance of documentation for a ${jobTitle}?`,
      options: [
        "Documentation is unnecessary",
        "Only document after the project is complete",
        "Document code, processes, and decisions continuously",
        "Documentation is only for managers",
      ],
      correctAnswer: 2,
      explanation: "Continuous documentation helps with maintenance, onboarding, and knowledge transfer.",
    },
  ];

  // Generate questions to match the requested count
  const questions: Question[] = [];
  for (let i = 0; i < count; i++) {
    const baseQuestion = baseQuestions[i % baseQuestions.length];
    questions.push({
      ...baseQuestion,
      id: i + 1,
      question: baseQuestion.question.replace(/\${jobTitle}/g, jobTitle).replace(/\${difficulty}/g, difficulty),
    });
  }

  return questions;
};
