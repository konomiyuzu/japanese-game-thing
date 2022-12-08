
class ResultsHandler {
    static elements;

    static data = {
        results: [],
        showDetailedResults: false,
        score: 0,
        scoreMax: 0,
        accuracyString: "0.00%",
        points: 0,
        timeString: "00:00:000",
        initiated: false
    }

    static init(elements) {
        this.elements = elements;
        this.elements.showDetailedButton.addEventListener("click", this.toggleDetailedResults.bind(this));
        this.data.initiated = true;
    }


    static #createResult(questionText, correctText, chosenText, answerIsCorrect) {
        let result = this.elements.template.content.cloneNode(true);

        //cloneNode() returns a document fragment,
        //this gets the node from the docfrag
        let resultElement = result.firstElementChild

        if (answerIsCorrect) resultElement.classList.add("correct");
        else resultElement.classList.add("incorrect");


        let questionTextElement = resultElement.querySelector("h1[name=\"questionText\"]")
        questionTextElement.innerHTML = questionText;


        let correctTextElement = resultElement.querySelector("p[name=\"correctText\"]")
        correctTextElement.innerHTML = `Correct Answer: ${correctText}`;


        let chosenTextElement = resultElement.querySelector("p[name=\"chosenText\"]")
        chosenTextElement.innerHTML = `Chosen Answer: ${chosenText}`;

        return resultElement;
    }

    static addResult(questionText, correctText, chosenText, answerIsCorrect) {
        if (!this.data.initiated) throw new Error("ResultHandler not initialized");

        let result = this.#createResult(questionText, correctText, chosenText, answerIsCorrect);
        this.elements.resultsContainer.appendChild(result);
        this.data.results.push(result);
    }

    static removeResult(index) {
        if (!this.data.initiated) throw new Error("ResultHandler not initialized");

        let result = this.data.results[index];

        if (result == null) throw new Error(`result does not exist at index: ${index}`)
        this.data.results.splice(index, 1);
        result.remove();
    }

    static showResultsScreen() {
        if (!this.data.initiated) throw new Error("ResultHandler not initialized");

        this.updateText()
        this.elements.resultsScreenElement.setAttribute("style", "display:flex;")
    }

    static hideResultsScreen() {
        if (!this.data.initiated) throw new Error("ResultHandler not initialized");

        this.elements.resultsScreenElement.setAttribute("style", "display:none;")
    }

    static updateText() {
        if (!this.data.initiated) throw new Error("ResultHandler not initialized");

        this.elements.resultsTimeText.innerHTML = `time: ${this.data.timeString}`
        this.elements.resultsScoreText.innerHTML = `score: ${this.data.score}/${this.data.scoreMax}`
        this.elements.resultsAccuracyText.innerHTML = `accuracy: ${this.data.accuracyString}`
        this.elements.resultsPointsText.innerHTML = `points: ${this.data.points}`
    }

    static toggleDetailedResults() {
        if (!this.data.initiated) throw new Error("ResultHandler not initialized");

        if (this.data.showDetailedResults) {
            this.elements.resultsContainer.setAttribute("style", "display:none;")
            this.data.showDetailedResults = false;
            this.elements.showDetailedButton.innerHTML = "show detailed results";
        } else {
            this.elements.resultsContainer.setAttribute("style", "display:flex;")
            this.data.showDetailedResults = true;
            this.elements.showDetailedButton.innerHTML = "hide detailed results";
        }
    }

}
const resultTemplate = document.getElementById("resultTemplate");
const resultsScreenElement = document.getElementById("results");
const resultsContainerElement = document.getElementById("resultsContainer");
const showDetailedButtonElement = document.getElementById("showResults");
const resultsTimeText = document.getElementById("resultsTime");
const resultsScoreText = document.getElementById("resultsScore");
const resultsAccuracyText = document.getElementById("resultsAccuracy")
const resultsPointsText = document.getElementById("resultsPoints")

const resultHandlerElements = {
    templateElement: resultTemplate,
    resultsScreenElement: resultsScreenElement,
    resultsContainer: resultsContainerElement,
    showDetailedButton: showDetailedButtonElement,
    resultsTimeText: resultsTimeText,
    resultsScoreText: resultsScoreText,
    resultsAccuracyText: resultsAccuracyText,
    resultsPointsText: resultsPointsText
}
ResultsHandler.init(resultHandlerElements)