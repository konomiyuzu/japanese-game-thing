dataLoader.init()
.then(() => {
    const settings = JSON.parse(localStorage.getItem("settings"));
    const game = JSON.parse(localStorage.getItem("testgame"));

    const gameButtonsContainer = document.getElementById("gameButtonsContainer");
    const questionText = document.getElementById("questionText");
    const progressText = document.getElementById("progress");


    for(let i = 0; i < settings.totalChoices; i++){
        let div = document.createElement("div")
        div.id = i;
        div.setAttribute("class","gameButton flex-container center-horizontal center-vertical")
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
    let correct = 0;
    let incorrect = 0;

    let countdown = 3
    const warmupTime = settings.warmupTime * 1000
    const dim = document.getElementById("dim");

    let interval = setInterval(()=>{
        let text = countdown <= 0? "Go!" : countdown
        dim.innerHTML = text
        countdown--
    },warmupTime/5)

    setTimeout(()=>{
        clearInterval(interval)
        dim.setAttribute("style","display:none");
        generateQuestion()
        timer.start();
    },warmupTime)

    

    function answer(choice){
        let id = choice.target.id;
        if(QApair[0] == choices[id]) correct++
        else incorrect++

        progress++
        
        updateProgress()

        if(progress == settings.totalQuestions) endGame()
        else generateQuestion()
        
    }

    function endGame(){
        timer.stop()

        alert(`correct: ${correct}\nincorrect: ${incorrect}\ntime: ${timer.timeToString()}`)
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
            nextQA = randomElementFromArray(letters)

            if(duplicateCheck.indexOf(nextQA[1]) == -1){
                isDuplicate = false
            }
        }

        
        


        QApair = nextQA;
        console.log(QApair[1]);
        lastQuestion.push(QApair);
        questionText.innerHTML = QApair[1];

        let possibleAnswers = letters.map(x => x[0])
        
        possibleAnswers.splice(possibleAnswers.indexOf(QApair[0]),1)
        

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
})

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

function randomElementFromArray(arr){
    let out = arr[Math.floor(Math.random() * arr.length)]
    return out
}