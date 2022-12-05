//TODO rewrite this entire file as a class
//get rid of settings.x and replace with constants


//for debugging, remove later
localStorage.clear()

class Game{
    constructor(elements){
        this.gameButtonsContainer = elements.gameButtonContainer;
        this.template = elements.choiceButtonTemplate;

        this.init();
    }

    async init(){
        await DataLoader.init();
        this.settings = JSON.parse(localStorage.getItem("settings"));
        this.gamePack = DataLoader.activeGamePack;
        this.generateGameButtons(this.settings.totalChoices);
    }

    generateGameButtons(amount){
        for(let i = 0; i < amount; i++){
            let div = this.template.content.cloneNode(true).firstElementChild;

            div.addEventListener("click",this.answer.bind(this));
            div.id = i;

            this.gameButtonsContainer.appendChild(div);
        }
    }

    generateQuestion(){

    }

    answer(choiceButtonDiv){

    }

    shuffle(arr) {
        //to not remove elements from the original array, we duplicate it
        let arr2 = [...arr]
        let length = arr2.length;
    
        let output = [];
        while(length != 0){
            let element = arr2.splice(randomNumber(0,length - 1),1)[0];
            output.push(element);
            length--;
        }
    
        return output;
      }
    
    randomElementFromArray(arr){
        let out = arr[randomNumber(0,arr.length - 1)]
        return out;
    }
    
    randomNumber(min,max){
        return Math.floor((Math.random() * (max + 1 - min))) + min;
    }
}

const gameButtonContainer = document.getElementById("gameButtonsContainer");
const choiceButtonTemplate = document.getElementById("choiceButtonTemplate");

const gameElements = {
    gameButtonContainer:gameButtonContainer,
    choiceButtonTemplate:choiceButtonTemplate
}
const game = new Game(gameElements)
DataLoader.init()
.then(() => {
    return
    const settings = JSON.parse(localStorage.getItem("settings"));
    const game = JSON.parse(localStorage.getItem("testgame"));

    const gameButtonsContainer = document.getElementById("gameButtonsContainer");
    const questionText = document.getElementById("questionText");
    const progressText = document.getElementById("progress");


    //generates the game buttons
    for(let i = 0; i < settings.totalChoices; i++){
        let div = document.createElement("div")
        div.id = i;
        div.setAttribute("class","gameButton box flex-container center-horizontal center-vertical")
        div.addEventListener("click",answer)
        gameButtonsContainer.appendChild(div)
    }

    const letters = game.letters;
    let progress = 0;
    updateProgress();

    //+ 1 because we have to run generateQuestion once as initialization
    let lastQuestionDelay = settings.repeatBlackList + 1;
    let lastQuestion = [];
    let choices;
    let QApair;
    let answers = [];
    let correct = 0;

    
    const warmupTime = settings.warmupTimeSeconds * 1000
    
    //countdown
    countdown(3,warmupTime,1000)
    function countdown(numberToCountFrom, warmupTimeMilliseconds, timeBetweenCountdownMilliseconds){

        const dim = document.getElementById("dim");
        dim.setAttribute("style","display:flex");

        let interval = setInterval(()=>{
            let text = numberToCountFrom <= 0? "Go!" : numberToCountFrom
            dim.innerHTML = text
            numberToCountFrom--

        },timeBetweenCountdownMilliseconds)
    
        setTimeout(()=>{
            clearInterval(interval)
            dim.setAttribute("style","display:none");
            generateQuestion()
            timer.start();
        },warmupTimeMilliseconds)
    }

    function answer(choice){
        let id = choice.target.id;

        const correctAnswer = QApair[0];
        const chosenAnswer = choices[id];
        const answerIsCorrect = correctAnswer == chosenAnswer;
        if(answerIsCorrect) correct++

        let answer = {
            answerIsCorrect:answerIsCorrect,
            questionText:QApair[1],
            correctText:correctAnswer,
            chosenText:chosenAnswer
        }

        answers.push(answer);
        progress++
        
        updateProgress()

        if(progress == settings.totalQuestions) endGame()
        else generateQuestion()
        
    }

    function endGame(){
        timer.stop()

        resultsHandler.score = correct;
        resultsHandler.scoreMax = settings.totalQuestions;
        resultsHandler.timeString = timer.timeToString();
        resultsHandler.points = calculatePoints().toFixed(0);

        const accuracy = (calculateAccurracy()*100).toFixed(2)
        resultsHandler.accuracyString = `${accuracy}%`;

        resultsHandler.showResultsScreen()

        for(let answer of answers){
            const questionText = answer.questionText;
            const correctText = answer.correctText;
            const chosenText = answer.chosenText;
            const answerIsCorrect = answer.answerIsCorrect;

            resultsHandler.addResult(questionText, correctText, chosenText, answerIsCorrect)
        }

        //alert(`correct: ${correct}\nincorrect: ${incorrect}\ntime: ${timer.timeToString()}`)
    }

    function generateQuestion(){

        if(lastQuestionDelay != 0){
            lastQuestionDelay--
        } else{
            lastQuestion.shift()
        }

        let nextQA
        let isDuplicate = true;

        let duplicateCheck = lastQuestion.map(x => x[1])
        while(isDuplicate){
            //TODO
            //refactor this to maybe just remove the QApair from letters
            //instead of randomly hoping we dont get a duplicate
            nextQA = randomElementFromArray(letters)

            if(duplicateCheck.indexOf(nextQA[1]) == -1){
                isDuplicate = false
            }
        }

        
        


        QApair = nextQA;
        lastQuestion.push(QApair);
        questionText.innerHTML = QApair[1];

        //TODO
        //possibly refactor this to allow for duplicate answers
        //(for katakana and hiragana in the same "game pack")
        let possibleAnswers = letters.map(x => x[0])
        possibleAnswers.splice(possibleAnswers.indexOf(QApair[0]),1)


        
        choices = shuffle(possibleAnswers)
        choices = possibleAnswers.splice(0,settings.totalChoices-1);
        choices.push(QApair[0])
        choices = shuffle(choices)
        

        for(let i = 0; i < settings.totalChoices; i++){
            document.getElementById(i).innerHTML = choices[i]
        }

    }

    function updateProgress(){
        progressText.innerHTML = `${progress}/${settings.totalQuestions}`
    }

    //graph of function : https://www.desmos.com/calculator/nmbo5dmdpn
    function calculatePoints(){
        const basePoints = 1000;
        //here since its planned to be configurable
        const secondsPerQuestion = 1;
        const accuracyOffset = 0;
        const accuracyWeight = 2;

        const accuracy = Math.pow(calculateAccurracy() + accuracyOffset, accuracyWeight);

        const timeSeconds = timer.currentTime/1000;

        const inverseFunctionResult = 1/((1/settings.totalQuestions * secondsPerQuestion)*timeSeconds);
        const out = basePoints * accuracy * inverseFunctionResult;
        return out;
    }

    function calculateAccurracy(){
        return correct/settings.totalQuestions;
    }

})

