/**
 * password-generator.js
 * Generiert Passwörter im Format: [2-stellige Zahl][Eigenschaft][SubstantivPlural]
 * Beispiel: 42SchnelleAffen, 11BlaueHunde, 88ScharfeMesser
 */

const PasswordGenerator = (() => {
    // Liste 1: Eigenschaften (Adjektive)
    const adjectives = [
        "Schnelle", "Langsame", "Blaue", "Rote", "Grüne", "Gelbe", "Scharfe", 
        "Große", "Kleine", "Starke", "Freche", "Wilde", "Helle", "Dunkle", 
        "Alte", "Neue", "Kalte", "Warme", "Fette", "Muntere", "Braune", 
        "Harte", "Weiche", "Stille", "Bunte", "Schlaue", "Gute", "Müde"
    ];

    // Liste 2: Substantive im Plural (Passend zu den Eigenschaften)
    const nouns = [
        "Affen", "Äpfel", "Bäume", "Berge", "Blätter", "Brote", "Computer", 
        "Dächer", "Drucker", "Fische", "Flüsse", "Gärten", "Gläser", "Häuser", 
        "Hunde", "Inseln", "Jacken", "Katzen", "Kinder", "Lichter", "Mäuse", 
        "Messer", "Monde", "Nasen", "Nester", "Pferde", "Ringe", "Sterne", 
        "Stühle", "Tische", "Vögel", "Wälder", "Wolken", "Züge"
    ];

    /**
     * Generiert eine Zufallszahl zwischen min und max (inklusiv)
     */
    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * Holt ein zufälliges Element aus einem Array
     */
    const getRandomElement = (arr) => {
        return arr[getRandomInt(0, arr.length - 1)];
    };

    /**
     * Die Hauptfunktion zur Passwortgenerierung
     */
    const generate = () => {
        // 1. Zwei-stellige Zufallszahl (10-99)
        const number = getRandomInt(10, 99);

        // 2. Ein Adjektiv und ein Substantiv wählen
        const adj = getRandomElement(adjectives);
        const noun = getRandomElement(nouns);

        return `${number}${adj}${noun}`;
    };

    // Öffentliche API
    return {
        generate: generate
    };
})();

// Test: console.log(PasswordGenerator.generate());
