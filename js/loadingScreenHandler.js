class LoadingScreenHandler{
    static elements;
    static intervalId;
    static isLoading = false;
    static initialized = false;

    static init(elements){
        this.elements = elements;
        this.initialized = true;
    }

    static updateText(text){
        this.elements.loadingScreenText.innerHTML = text;
    }

    static start(){
        if(this.initialized == false) throw new Error("LoadingScreenHandler not Initialized");
        if(this.isLoading == true) throw new Error("Loading already in progress");

        this.isLoading = true;
        this.elements.loadingScreen.style.display = "flex";

        let n = 0;
        this.updateText("Loading")

        this.intervalId = setInterval(()=>{
            n = (n + 1)% 4;
            let text;

            switch(n){
                case 0 :
                    text = "Loading";
                break;
                case 1 :
                    text = "Loading.";
                break;
                case 2 :
                    text = "Loading..";
                break;
                case 3 :
                    text = "Loading...";
                break;
            }

            this.updateText(text)
        }, 1000)
    }

    static stop(){
        if(this.initialized == false) throw new Error("LoadingScreenHandler not Initialized");

        if(this.isLoading == false) throw new Error("No loading in progress");

        this.isLoading = false;
        Fade.fadeOut(.5,this.elements.loadingScreen)        
        clearInterval(this.intervalId);

    }
    
}
const loadingScreenElements = {};
loadingScreenElements.loadingScreen = document.getElementById("loadingScreen");
loadingScreenElements.loadingScreenText = document.getElementById("loadingScreenText");

LoadingScreenHandler.init(loadingScreenElements);