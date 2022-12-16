
class ResultsHandler {
    static elements;
    static initiated = false;
    static results = [];
    static showDetailedResults = false
    static data = {
        score: 0,
        scoreMax: 0,
        timeString: "00:00:000"
    }

    static init(elements) {
        this.elements = elements;
        this.elements.showDetailedButton.addEventListener("click", this.toggleDetailedResults.bind(this));
        this.initiated = true;
    }


    static #createResult(questionText, correctText, chosenText, answerIsCorrect) {
        let result = this.elements.templateElement.content.cloneNode(true);

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
        if (!this.initiated) throw new Error("ResultHandler not initialized");

        let result = this.#createResult(questionText, correctText, chosenText, answerIsCorrect);
        this.elements.resultsContainer.appendChild(result);
        this.results.push(result);
    }

    static removeResult(index) {
        if (!this.initiated) throw new Error("ResultHandler not initialized");

        let result = this.results[index];

        if (result == null) throw new Error(`result does not exist at index: ${index}`)
        this.results.splice(index, 1);
        result.remove();
    }

    static clearResults(){
        if (!this.initiated) throw new Error("ResultHandler not initialized");

        let resultsLength = this.results.length;
        for(let i = 0; i < resultsLength; i++){
            this.removeResult(0);
        }
    }

    static showResultsScreen() {
        if (!this.initiated) throw new Error("ResultHandler not initialized");

        this.updateText()
        Fade.fadeIn(0.5, this.elements.resultsScreenElement, "flex")
    }

    static hideResultsScreen() {
        if (!this.initiated) throw new Error("ResultHandler not initialized");

        Fade.fadeOut(0.5, this.elements.resultsScreenElement)
    }

    static hideResultsScreenNoFade() {
        if (!this.initiated) throw new Error("ResultHandler not initialized");

        this.elements.resultsScreenElement.style.display = "none";
    }

    static updateText() {
        if (!this.initiated) throw new Error("ResultHandler not initialized");

        this.elements.resultsTimeText.innerHTML = `time: ${this.data.timeString}`
        this.elements.resultsScoreText.innerHTML = `score: ${this.data.score}/${this.data.scoreMax}`
    }

    static toggleDetailedResults() {
        if (!this.initiated) throw new Error("ResultHandler not initialized");

        if (this.showDetailedResults) {
            try {
                Fade.fadeOut(0.5, this.elements.resultsContainer);
                this.showDetailedResults = false;
                this.elements.showDetailedButton.innerHTML = "show detailed results";
            }
            catch (e) { };

        } else {
            try {
            Fade.fadeIn(0.5, this.elements.resultsContainer, "flex");
            this.showDetailedResults = true;
            this.elements.showDetailedButton.innerHTML = "hide detailed results";
            }
            catch (e) { };
        }
    }

}