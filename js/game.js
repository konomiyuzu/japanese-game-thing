class GamePack {
    constructor(gamepack) {
        this.answerPools = gamepack.answerPools.map(pool => new Pool(pool));
        this.questionPools = gamepack.questionPools.map(pool => new QuestionPool(pool));
    }

    getAnswerPoolById(id) {
        let out = this.answerPools.filter(pool => pool.id == id)[0];

        if (out == null) throw new Error(`Answer Pool with Id ${id} not found`);
        return out;
    }

    getQuestionPoolById(id) {
        let out = this.questionPools.filter(pool => pool.id == id)[0];

        if (out == null) throw new Error(`Question Pool with Id ${id} not found`);
        return out;
    }
}

class Pool {
    #id;
    #pool;

    constructor(pool) {
        this.#id = pool.id;
        this.#pool = pool.pool;
    }

    get id() {
        return this.#id;
    }

    get pool() {
        //duplicated to not edit the original pool
        return [...this.#pool];
    }
}

class QuestionPool extends Pool {
    constructor(pool) {
        super(pool);
        this.answerPoolId = pool.answerPoolId;
    }
}

//idk why i made it into a class but i did
class Round {

    //basically check if the data is complete (no blanks)
    get complete(){
        return !(
            this.question == null ||
            this.correctAnswer == null ||
            this.chosenAnswer == null ||
            this.correct == null
        )
    }

    setQuestion(question){
        this.question = question;
        return this;
    }

    setCorrectAnswer(correctAnswer){
        this.correctAnswer = correctAnswer;
        return this;
    }

    setChosenAnswer(chosenAnswer){
        this.chosenAnswer = chosenAnswer;
        return this;
    }

    setCorrect(correct){
        this.correct = correct;
        return this;
    }
}


//uses functions from the following classes
//GlobalTimer
//ResultsHandler
class Game {
    static #correctAnswerId;
    static elements;
    static initialized = false;

    static settings;
    static gamePack;
    static gameIsInProgress = false;

    static gameData = {
        score: 0,
        currentQuestionNumber: 0,
        rounds: [],
        questionBlackList: [],
    };
    static questionBlackListDelay;

    static init(elements) {
        this.elements = elements;
        this.initialized = true;

        this.elements.restartGameButtons.map(x => x.addEventListener("click", this.restartGame.bind(this)));
        this.elements.returnToMainMenuButtons.map(x => x.addEventListener("click", () => {location.href="./index.html"}));
        this.elements.endGameButtons.map(x => x.addEventListener("click", this.endGame.bind(this)));

        this.settings = JSON.parse(localStorage.getItem("settings"));
        this.gamePack = new GamePack(JSON.parse(localStorage.getItem("activeGamePack")));
        this.generateGameButtons(this.settings.totalChoices);

        this.questionBlackListDelay = this.settings.questionBlacklist;
    }

    static restartGame() {
        if (!this.initialized) throw new Error("Game not initialized");

        //actually still works even if game is in progress
        //if (this.gameIsInProgress) this.endGame();

        //reset gamedata
        this.gameData = {
            score: 0,
            currentQuestionNumber: 0,
            rounds: [],
            questionBlackList: [],
        };
        this.questionBlackListDelay = this.settings.questionBlacklist;

        //enable buttons
        for (let gameButton of this.elements.gameButtonsContainer.children) {
            gameButton.classList.remove("nohover")
        }

        ResultsHandler.clearResults();
        ResultsHandler.hideResultsScreen();
        GlobalTimer.reset(); //this function also stops the clock if it was still running
        Fade.fadeIn(0.5, this.elements.warmupScreenElement,"flex")

        this.startGame();
    }

    static startGame() {
        if (!this.initialized) throw new Error("Game not initialized");
        if (this.gameIsInProgress) throw new Error("there is already a game in progress");
        this.gameIsInProgress = true;

        this.updateQuestionNumber();

        const warmupScreenElement = this.elements.warmupScreenElement;
        warmupScreenElement.setAttribute("style", "display:flex;")

        let n = 3;
        warmupScreenElement.innerHTML = "";

        let interval = setInterval(() => {
            let text = n <= 0 ? "Go!" : n;
            warmupScreenElement.innerHTML = text;
            n--

        }, 1000)

        setTimeout(() => {
            clearInterval(interval);
            warmupScreenElement.setAttribute("style", "display:none;")
            this.nextQuestion();
            GlobalTimer.start();
        }, 5000)

    }

    //basically adds all the rounds into the results
    static updateResultsRounds() {

        for (let round of this.gameData.rounds) {

            if(!round.complete) continue;

            const question = round.question;
            const correctAnswer = round.correctAnswer;
            const chosenAnswer = round.chosenAnswer;
            const correct = round.correct

            ResultsHandler.addResult(question, correctAnswer, chosenAnswer, correct)
        }
    }

    static endGame() {
        if (!this.initialized) throw new Error("Game not initialized");
        if (!this.gameIsInProgress) throw new Error("No game in progress to end");

        //since the way its setup it isnt ran if a new question isnt generated;
        //and im too lazy to change it
        this.updateQuestionNumber();

        this.gameIsInProgress = false;

        GlobalTimer.stop();

        this.updateResultsRounds();
        ResultsHandler.data.score = this.gameData.score;
        ResultsHandler.data.scoreMax = this.gameData.currentQuestionNumber;
        ResultsHandler.data.timeString = Timer.formatTime(GlobalTimer.currentTime);

        ResultsHandler.showResultsScreen();

        //disable buttons
        for (let gameButton of this.elements.gameButtonsContainer.children) {
            gameButton.classList.add("nohover")
        }
    }

    static generateGameButtons(amount) {
        if (!this.initialized) throw new Error("Game not initialized");

        for (let i = 0; i < amount; i++) {
            let div = this.elements.choiceButtonTemplate.content.cloneNode(true).firstElementChild;

            div.addEventListener("click", this.answer.bind(this));
            div.id = `gameButton-${i}`;

            this.elements.gameButtonsContainer.appendChild(div);
        }
    }

    static nextQuestion() {
        if (!this.initialized) throw new Error("Game not initialized");

        const gamePack = this.gamePack;
        const questionPoolFull = this.randomElementFromArray(gamePack.questionPools);
        const answerPoolFull = gamePack.getAnswerPoolById(questionPoolFull.answerPoolId);

        const questionBlackList = this.gameData.questionBlackList;

        //blacklisting logic

        //+1 since this is decremented once for the first question
        if (this.questionBlackListDelay + 1 <= 0) {
            questionBlackList.shift()
        } else {
            this.questionBlackListDelay--;
        }
        const questionPool = questionPoolFull.pool.filter(x => {
            return !questionBlackList.map(x => x.question).includes(x.question) &&
                !questionBlackList.map(x => x.answer).includes(x.answer)
        })

        const question = this.randomElementFromArray(questionPool);

        questionBlackList.push(question);

        //remove correct answer from the pool since we're going to add the correct answer in last anyways
        const answerPool = answerPoolFull.pool.filter(x => x != question.answer);

        //shuffle the answer pool, then get the first n - 1 elements (-1 cus adding the correct answer in last)
        let choices = this.shuffleArray(answerPool).splice(0, this.settings.totalChoices - 1)
        choices.push(question.answer);
        choices = this.shuffleArray(choices);

        this.#correctAnswerId = choices.indexOf(question.answer);

        this.startRound(question, choices)
    }

    static getLatestRound() {
        return this.gameData.rounds[this.gameData.rounds.length - 1]
    }

    static startRound(question, choices) {
        if (!this.initialized) throw new Error("Game not initialized");

        let round = new Round()
        .setQuestion(question.question)
        .setCorrectAnswer(question.answer)

        this.gameData.rounds.push(round);

        this.elements.questionTextElement.innerHTML = question.question;

        for (let i = 0; i < this.settings.totalChoices; i++) {
            document.getElementById(`gameButton-${i}`).innerHTML = choices[i]

            this.updateQuestionNumber();
        }
    }

    static updateQuestionNumber() {
        this.elements.questionNumberElement.innerHTML = `${this.gameData.currentQuestionNumber}/${this.settings.totalQuestions}`
    }

    static answer(gameButtonElement) {
        //since the id is formatted as gameButton-${i}
        let answerId = gameButtonElement.target.id;
        answerId = answerId.replace(/gameButton-/gi, "");
        answerId = parseInt(answerId);

        const answerIsCorrect = answerId == this.#correctAnswerId;

        if (answerIsCorrect) this.gameData.score++;
        let round = this.getLatestRound()
        .setChosenAnswer(gameButtonElement.target.innerHTML)
        .setCorrect(answerIsCorrect)
        
        this.gameData.currentQuestionNumber++;
        if (this.gameData.currentQuestionNumber == this.settings.totalQuestions) this.endGame();
        else this.nextQuestion();
    }

    static shuffleArray(arr) {
        //to not remove elements from the original array, we duplicate it
        let arr2 = [...arr]
        let length = arr2.length;

        let output = [];
        while (length != 0) {
            let element = arr2.splice(this.randomNumber(0, length - 1), 1)[0];
            output.push(element);
            length--;
        }

        return output;
    }

    static randomElementFromArray(arr) {
        let out = arr[this.randomNumber(0, arr.length - 1)]
        return out;
    }

    static randomNumber(min, max) {
        return Math.floor((Math.random() * (max + 1 - min))) + min;
    }
}