class ResultsHandler {
    constructor(elements) {
        this.template = elements.templateElement;
        this.resultsScreenElement = elements.resultsScreenElement;
        this.resultsContainer = elements.resultsContainer;
        this.showDetailedButton = elements.showDetailedButton;
        this.resultsTimeText = elements.resultsTimeText;
        this.resultsScoreText = elements.resultsScoreText;
        this.resultsAccuracyText = elements.resultsAccuracyText;

        //difference between points and score is score is just correctAnswers/totalQuestions while
        //points are calculated with the accuracy and the time with faster times and higher accuracy meaning higher scores
        //they should be calculated externally
        this.resultsPointsText = resultsPointsText;

        this.results = [];
        this.showDetailedResults = false;
        this.score = 0;
        this.scoreMax = 0;
        this.accuracyString = "0.00%";
        this.points = 0;
        this.timeString = "00:00:000";

        this.init();
    }

    init() {
        this.showDetailedButton.addEventListener("click", this.toggleDetailedResults.bind(this));
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
        this.updateText()
        this.resultsScreenElement.setAttribute("style", "display:flex;")
    }

    hideResultsScreen() {
        this.resultsScreenElement.setAttribute("style", "display:none;")
    }

    updateText() {
        this.resultsTimeText.innerHTML = `time: ${this.timeString}`
        this.resultsScoreText.innerHTML = `score: ${this.score}/${this.scoreMax}`
        this.resultsAccuracyText.innerHTML = `accuracy: ${this.accuracyString}`
        this.resultsPointsText.innerHTML = `points: ${this.points}`
    }

    toggleDetailedResults() {
        if (this.showDetailedResults) {
            this.resultsContainer.setAttribute("style", "display:none;")
            this.showDetailedResults = false;
            this.showDetailedButton.innerHTML = "show detailed results";
        } else {
            this.resultsContainer.setAttribute("style", "display:flex;")
            this.showDetailedResults = true;
            this.showDetailedButton.innerHTML = "hide detailed results";
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

const element = {
    templateElement: resultTemplate,
    resultsScreenElement: resultsScreenElement,
    resultsContainer: resultsContainerElement,
    showDetailedButton: showDetailedButtonElement,
    resultsTimeText: resultsTimeText,
    resultsScoreText: resultsScoreText,
    resultsAccuracyText: resultsAccuracyText,
    resultsPointsTex: resultsPointsText
}
const resultsHandler = new ResultsHandler(element)