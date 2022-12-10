class Fade{
    
    static fadeIn(timeSeconds,element,displayType = "block"){
        let opacity = 0;
        //interval is ran 20 times/second
        const deltaOpacity = 1/(20 * timeSeconds);

        element.style.opacity = 0;
        element.style.display = displayType;
    

        let interval = setInterval(()=>{
    
            element.style.opacity = opacity;
            opacity += deltaOpacity;
    
            if(opacity >= 1){
                clearInterval(interval);
            }
        },50)
    }
    
    static fadeOut(timeSeconds,element){
        let opacity = 1;
        //interval is ran 20 times/second
        const deltaOpacity = 1/(20 * timeSeconds);

        element.style.opacity = 1;
    
        let interval = setInterval(()=>{
    
            element.style.opacity = opacity;
            opacity -= deltaOpacity;
    
            if(opacity <= 0){
                clearInterval(interval);
                element.style.display = "none";
            }
        },50)
    }
}

