class Fade {

    static fadeIn(timeSeconds, element, displayType = "block") {
        //idk if using the classList to store this info is best practice or whatever it works
        if (element.classList.contains("fading")) throw new Error("element already fading in/out");
        element.classList.add("fading");

        let opacity = 0;

        //interval is ran 60 times/second
        const deltaOpacity = 1 / (60 * timeSeconds);

        element.style.opacity = 0;
        element.style.display = displayType;


        let interval = setInterval(() => {

            element.style.opacity = opacity;
            opacity += deltaOpacity;

            if (opacity >= 1) {
                clearInterval(interval);
                element.classList.remove("fading");
            }
        }, 1000 / 60)
    }

    static fadeOut(timeSeconds, element) {
        //idk if using the classList to store this info is best practice or whatever it works
        if (element.classList.contains("fading")) throw new Error("element already fading in/out");
        element.classList.add("fading");

        let opacity = 1;
        //interval is ran 60 times/second
        const deltaOpacity = 1 / (60 * timeSeconds);

        element.style.opacity = 1;

        let interval = setInterval(() => {

            element.style.opacity = opacity;
            opacity -= deltaOpacity;

            if (opacity <= 0) {
                clearInterval(interval);
                element.style.display = "none";
                element.classList.remove("fading");
            }
        }, 1000 / 60)
    }
}

