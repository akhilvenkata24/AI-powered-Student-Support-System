const Sentiment = require('sentiment');
const sentiment = new Sentiment();

/**
 * Analyzes the sentiment of a given text.
 * @param {string} text - The input text to analyze.
 * @returns {object} - An object containing the score and a label.
 */
const analyzeSentiment = (text) => {
    const result = sentiment.analyze(text);
    const score = result.comparative; // Normalized score between -5 and 5

    let label = 'neutral';
    if (score <= -0.5) { // Threshold for negative sentiment
        label = 'negative';
    } else if (score >= 0.5) {
        label = 'positive';
    }

    // Identify critical phrases that might bypass standard scoring
    const urgentKeywords = ['suicide', 'kill myself', 'depressed', 'give up', 'hopeless', 'panic attack'];
    const lowerText = text.toLowerCase();
    
    for (const keyword of urgentKeywords) {
        if (lowerText.includes(keyword)) {
            label = 'urgent';
            break;
        }
    }

    return {
        score,
        label,
        rawResult: result // useful for debugging
    };
};

module.exports = {
    analyzeSentiment
};
