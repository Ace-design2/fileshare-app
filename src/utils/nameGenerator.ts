export const generateUsername = (): string => {
    const adjectives = [
        "Blue", "Happy", "Silent", "Brave", 
        "Clever", "Swift", "Lucky", "Bright"
    ];
    
    const nouns = [
        "Tiger", "Mango", "River", "Falcon", 
        "Lion", "Cloud", "Ocean", "Star"
    ];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${randomAdjective} ${randomNoun}`;
};
