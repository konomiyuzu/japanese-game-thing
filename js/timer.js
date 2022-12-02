
class Timer{
    constructor(element,time){
        this.element= element;
        this.intervalID = undefined;
        this.intervalTime = time;
        this.currentTime = 0;
    }

    timeToString(time = this.currentTime){
        let minutes = Math.floor(time/60000)
        let seconds = Math.floor((time % 60000)/1000)
        let milliseconds = Math.floor((time % 60000) % 1000)

        let minutesText = minutes < 10? `0${minutes}` : minutes;
        let secondsText = seconds < 10? `0${seconds}` : seconds;
        
        let millisecondsText;

        if(milliseconds < 10) millisecondsText = `00${milliseconds}`;
        else if(milliseconds < 100) millisecondsText = `0${milliseconds}`;
        else millisecondsText = `${milliseconds}`

        return `${minutesText}:${secondsText}:${millisecondsText}`
    }

    start(){
        if(this.startTime == null) this.startTime = Date.now()
        else this.startTime += Date.now() - this.lastStoppedTime
        
        this.intervalID = setInterval(()=>{
            this.currentTime = Date.now() - this.startTime;

            this.updateElementText(this.timeToString())
        },this.intervalTime)
    }

    updateElementText(string){
        this.element.innerHTML = string;
    }

    stop(){
        clearInterval(this.intervalID)
        this.lastStoppedTime = Date.now()
    }

    reset(){
        this.startTime = null;
        this.currentTime = 0;
    }
}

let timer = new Timer(document.getElementById("timerText"),1)