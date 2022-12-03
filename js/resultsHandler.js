class ResultsHandler {
    constructor(
        templateElement,
        resultsScreenElement,
        resultsContainer,
        showDetailedButton,
        resultsTimeText,
        resultsScoreText
    ) {
        this.template = templateElement;
        this.resultsScreenElement = resultsScreenElement;
        this.resultsContainer = resultsContainer;
        this.showDetailedButton = showDetailedButton;
        this.resultsTimeText = resultsTimeText;
        this.resultsScoreText = resultsScoreText;

        this.results = [];
        this.showDetailedResults = false;
        this.score = 0;
        this.scoreMax = 0;
        this.timeString = "00:00:000";
    }

    #createResult(questionText, correctText, chosenText, answerIsCorrect) {
        let result = this.template.content.cloneNode(true);

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

    addResult(questionText, correctText, chosenText, answerIsCorrect) {
        let result = this.#createResult(questionText, correctText, chosenText, answerIsCorrect);
        this.resultsContainer.appendChild(result);
        this.results.push(result);
    }

    removeResult(index) {
        let result = this.results[index];

        if (result == null) throw new Error(`result does not exist at index: ${index}`)
        console.log(this.results.length);
        this.results.splice(index, 1);
        result.remove();
    }

    showResultsScreen() {
        this.updateScoreText();
        this.updateTimeText();
        this.resultsScreenElement.setAttribute("style", "display:flex;")
    }

    hideResultsScreen() {
        this.resultsScreenElement.setAttribute("style", "display:none;")
    }

    updateTimeText() {
        this.resultsTimeText.innerHTML = `time: ${timer.timeToString()}`
    }

    updateScoreText() {
        this.resultsScoreText.innerHTML = `score: ${this.score}/${this.scoreMax}`
    }

    toggleDetailedResults(resultsHandler = this) {
        if (resultsHandler.showDetailedResults) {
            resultsHandler.resultsContainer.setAttribute("style", "display:none;")
            resultsHandler.showDetailedResults = false;
            resultsHandler.showDetailedButtonElement.innerHTML = "show detailed results";
        } else {
            resultsHandler.resultsContainer.setAttribute("style", "display:flex;")
            resultsHandler.showDetailedResults = true;
            resultsHandler.showDetailedButtonElement.innerHTML = "hide detailed results";
        }
    }

}
const resultTemplate = document.getElementById("resultTemplate");
const resultsScreenElement = document.getElementById("results");
const resultsContainerElement = document.getElementById("resultsContainer");
const showDetailedButtonElement = document.getElementById("showResults");
const resultsTimeText = document.getElementById("resultsTime");
const resultsScoreText = document.getElementById("resultsScore");

const resultsHandler = new ResultsHandler(
    resultTemplate,
    resultsScreenElement,
    resultsContainerElement,
    showDetailedButtonElement,
    resultsTimeText,
    resultsScoreText
)