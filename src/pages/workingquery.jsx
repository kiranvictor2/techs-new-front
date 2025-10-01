import React, { useState, useEffect } from 'react';

export default function TechsNetworkHub() {
  const [query, setQuery] = useState('');
  const [community, setCommunity] = useState('');
  const [solutions, setSolutions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [error, setError] = useState('');

  // Backend API configuration
  const BACKEND_API_URL = 'http://localhost:8000/ask';

  const callOpenAI = async (query, community) => {
    try {
      console.log('Calling OpenAI via FastAPI backend...');
      
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          community: community || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Backend API error! Status: ${response.status}. ${errorData?.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`OpenAI error: ${data.error}`);
      }

      console.log('OpenAI Response received:', {
        model: data.model,
        usage: data.usage
      });

      return data.response;

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`Unable to get AI solutions: ${error.message}`);
    }
  };

  const parseSolutions = (aiResponse) => {
    console.log('Parsing AI Response:', aiResponse.substring(0, 200) + '...');
    
    const lines = aiResponse.split('\n').filter(line => line.trim());
    const solutions = [];
    let currentSolution = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if line starts a new solution
      const solutionMatch = trimmedLine.match(/^(Solution\s*\d+|Workaround\s*\d+|Fix\s*\d+):?\s*(.+)/i);
      if (solutionMatch) {
        // Save previous solution
        if (currentSolution && currentSolution.steps.length > 0) {
          solutions.push(currentSolution);
        }
        
        // Start new solution
        currentSolution = {
          title: solutionMatch[2].trim(),
          steps: []
        };
      } 
      // Check if it's a step
      else if (currentSolution && trimmedLine) {
        const stepMatch = trimmedLine.match(/^(Step\s*\d+):?\s*(.+)/i);
        if (stepMatch) {
          currentSolution.steps.push(`**${stepMatch[1]}:** ${stepMatch[2].trim()}`);
        } 
        // Handle numbered lists without "Step" prefix
        else if (trimmedLine.match(/^\d+\.\s*(.+)/)) {
          const stepNumber = currentSolution.steps.length + 1;
          const stepContent = trimmedLine.replace(/^\d+\.\s*/, '');
          currentSolution.steps.push(`**Step ${stepNumber}:** ${stepContent}`);
        }
        // Handle bullet points or dash points
        else if (trimmedLine.match(/^[-•*]\s*(.+)/)) {
          const stepNumber = currentSolution.steps.length + 1;
          const stepContent = trimmedLine.replace(/^[-•*]\s*/, '');
          currentSolution.steps.push(`**Step ${stepNumber}:** ${stepContent}`);
        }
        // Handle general content lines
        else if (!trimmedLine.toLowerCase().includes('solution') && trimmedLine.length > 10) {
          if (currentSolution.steps.length === 0) {
            // First content line after solution title
            currentSolution.steps.push(trimmedLine);
          } else if (trimmedLine.includes(':') || trimmedLine.endsWith('.')) {
            // Looks like a step
            const stepNumber = currentSolution.steps.length + 1;
            currentSolution.steps.push(`**Step ${stepNumber}:** ${trimmedLine}`);
          }
        }
      }
    }
    
    // Add the last solution
    if (currentSolution && currentSolution.steps.length > 0) {
      solutions.push(currentSolution);
    }
    
    console.log(`Parsed ${solutions.length} solutions from AI response`);
    
    // If no structured solutions found, create them from paragraphs
    if (solutions.length === 0) {
      console.log('No structured solutions found, creating from paragraphs...');
      const paragraphs = aiResponse.split('\n\n').filter(p => p.trim() && p.length > 20);
      
      paragraphs.slice(0, 4).forEach((paragraph, index) => {
        const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim() && s.length > 10);
        const title = sentences[0] ? sentences[0].trim().substring(0, 50) + (sentences[0].length > 50 ? '...' : '') : `Solution ${index + 1}`;
        
        solutions.push({
          title: title,
          steps: sentences.slice(0, 4).map((sentence, i) => 
            `**Step ${i + 1}:** ${sentence.trim()}.`
          )
        });
      });
    }
    
    // Ensure we have exactly 4 solutions
    while (solutions.length < 4) {
      solutions.push({
        title: `Additional Solution ${solutions.length + 1}`,
        steps: [`**Step 1:** AI is generating additional technical solutions for your query...`]
      });
    }
    
    return solutions.slice(0, 4);
  };

  const processQuery = async () => {
    if (!query.trim()) {
      alert('Please enter a query or error description');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log(`Processing query: "${query}" for community: "${community}"`);
      
      // Get AI response from OpenAI via FastAPI
      const aiResponse = await callOpenAI(query, community);
      
      if (aiResponse && aiResponse.trim()) {
        console.log('AI Response received, parsing solutions...');
        
        // Parse and display AI solutions
        const parsedSolutions = parseSolutions(aiResponse);
        setSolutions(parsedSolutions);
        setShowSolutions(true);
        
        // Smooth scroll to solutions
        setTimeout(() => {
          const solutionsSection = document.getElementById('solutionsSection');
          if (solutionsSection) {
            solutionsSection.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 200);
      } else {
        throw new Error('Empty response from OpenAI service');
      }
    } catch (error) {
      console.error('Error processing query:', error);
      setError(`Error getting AI solutions: ${error.message}`);
      alert(`Error getting AI solutions: ${error.message}\n\nPlease check:\n1. FastAPI server is running on http://localhost:8000\n2. OpenAI API key is valid\n3. You have sufficient OpenAI credits`);
    } finally {
      setIsLoading(false);
    }
  };

  const askAnother = () => {
    setQuery('');
    setCommunity('');
    setShowSolutions(false);
    setSolutions([]);
    setError('');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderSteps = (steps) => {
    return steps.map((step, index) => (
      <span key={index}>
        {step.split('**').map((part, i) => 
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )}
        {index < steps.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-purple-700 p-5 md:p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-10 text-center">
          <h1 className="text-4xl font-extrabold mb-3 drop-shadow-lg">Techs.Network</h1>
          <p className="text-xl opacity-90">Knowledge Hub</p>
        </div>

        {/* Content */}
        <div className="p-10">
          {/* Community Selection */}
          <div className="mb-8">
            <select 
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg bg-white cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
            >
              <option value="">Select Community (Java, SAP ABAP, etc.)</option>
              <option value="java">Java</option>
              <option value="sap">SAP ABAP</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="react">React</option>
              <option value="nodejs">Node.js</option>
              <option value="dotnet">.NET</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          {/* Query Input */}
          <div className="mb-8">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your query or error..."
              className="w-full p-5 border-2 border-gray-300 rounded-xl text-lg resize-vertical min-h-32 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Get Workarounds Button */}
          <button
            onClick={processQuery}
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 px-10 rounded-xl text-xl font-semibold shadow-lg transition-all duration-300 ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 hover:shadow-xl transform'
            }`}
          >
            {isLoading ? 'Getting AI Solutions from OpenAI...' : 'Get Workarounds'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Solutions Section */}
          {showSolutions && (
            <div id="solutionsSection" className="mt-10 bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Solutions:</h2>
              </div>

              {solutions.map((solution, index) => (
                <div 
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 mb-5 transition-all hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 last:mb-0"
                  style={{
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: `fadeInUp 0.3s ease forwards ${index * 0.1}s`
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      ✓
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Solution {index + 1}: {solution.title}
                    </h3>
                  </div>
                  <div className="ml-11 text-gray-600 leading-relaxed">
                    {renderSteps(solution.steps)}
                  </div>
                </div>
              ))}

              <button
                onClick={askAnother}
                className="block mx-auto mt-8 bg-indigo-600 text-white py-4 px-8 rounded-xl font-semibold hover:bg-indigo-700 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                Ask Another Query
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}