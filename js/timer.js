class Timer{
    #startTime = 0;

    static formatTime(time = this.currentTime){
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

    get currentTime(){
        return Date.now() - this.#startTime;
    }

    start(){
        this.#startTime = Date.now();
    }
}

class GlobalTimer{
    static currentTime = 0;
    static intervalID;
    static element;
    static initialized = false;

    static #startTime;
    static #lastStoppedTime;

    static init(element){
        this.element = element;
        this.initialized = true;
    }

    static start(){
        if(!this.initialized) throw new Error("GlobalTimer not Initialized")
        if(this.#startTime == null) this.#startTime = Date.now()
        else this.#startTime += Date.now() - this.#lastStoppedTime
        
        this.intervalID = setInterval(()=>{
            this.currentTime = Date.now() - this.#startTime;

            this.updateElementText(Timer.formatTime(this.currentTime))
        },this.intervalTime)
    }

    static updateElementText(string){
        if(!this.initialized) throw new Error("GlobalTimer not Initialized")

        this.element.innerHTML = string;
    }

    static stop(){
        clearInterval(this.intervalID)
        this.#lastStoppedTime = Date.now()
    }

    static reset(){
        this.stop()
        this.#startTime = null;
        this.currentTime = 0;
        this.start()
    }
}

const timerElement = document.getElementById("timerText");
GlobalTimer.init(timerElement);