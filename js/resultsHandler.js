class ResultsHandler{
    constructor(templateElement, resultsScreenElement, resultsContainer){
        this.template = templateElement;
        this.resultsScreenElement = resultsScreenElement;
        this.resultsContainer = resultsContainer;

        this.results = [];
    }

    #createResult(questionText, correctText, chosenText, answerIsCorrect){
        let result = this.template.content.cloneNode(true);

        //cloneNode() returns a document fragment,
        //this gets the node from the docfrag
        let resultElement = result.firstElementChild
        
        if(answerIsCorrect) resultElement.classList.add("correct");
        else resultElement.classList.add("incorrect");


        let questionTextElement = resultElement.querySelector("h1[name=\"questionText\"]")
        questionTextElement.innerHTML = questionText;
    
        
        let correctTextElement = resultElement.querySelector("p[name=\"correctText\"]")
        correctTextElement.innerHTML = `Correct Answer: ${correctText}`;

        
        let chosenTextElement = resultElement.querySelector("p[name=\"chosenText\"]")
        chosenTextElement.innerHTML = `Chosen Answer: ${chosenText}`;

        return resultElement;
    }

    addResult(questionText, correctText, chosenText, answerIsCorrect){
        let result = this.#createResult(questionText, correctText, chosenText, answerIsCorrect);
        this.resultsContainer.appendChild(result);
        this.results.push(result);
    }

    removeResult(index){
        let result = this.results[index];
        
        if(result == null) throw new Error(`result does not exist at index: ${index}`)
        console.log(this.results.length);
        this.results.splice(index,1);
        result.remove();
    }

    showResultsScreen(){
        this.resultsScreenElement.setAttribute("style","display:flex;")
    }

    hideResultsScreen(){
        this.resultsScreenElement.setAttribute("style","display:none;")
    }

}
const resultTemplate = document.getElementById("resultTemplate");
const resultsScreenElement = document.getElementById("results");
const resultsContainerElement = document.getElementById("resultsContainer")
const resultsHandler = new ResultsHandler(resultTemplate,resultsScreenElement,resultsContainerElement)