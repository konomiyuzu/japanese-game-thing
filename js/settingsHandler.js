class SettingsElement {
    static initialized = false;
    static template;

    constructor(mainText, textOnHover, id) {
        if (!SettingsElement.initialized) throw new Error("SettingsElement not initialized")

        let elements = this.#createElement(mainText, textOnHover, id)

        this.id = id;
        this.element = elements.element;
        this.input = elements.input;
        this.error = elements.error;
    }

    #createElement(mainText, textOnHover, id) {
        let element = SettingsElement.template.content.cloneNode(true).firstElementChild;

        element.title = textOnHover;

        const mainTextElement = element.querySelector("h3[name=\"settingText\"]")
        mainTextElement.innerHTML = mainText;

        const inputElement = element.querySelector("input[name=\"settingInput\"]")
        inputElement.id = id;

        const errorElement = element.querySelector("p[name=\"settingError\"]")
        errorElement.id = `${id}-error`;

        return {
            element: element,
            input: inputElement,
            error: errorElement
        };
    }

    changeInputType(type) {
        this.input.type = type;
    }

    changeInputElement(elementName) {

        let element = document.createElement(elementName);
        element.classList = this.input.classList;
        element.id = this.input.id;
        this.input.parentNode.replaceChild(element, this.input);

        this.input = element;
    }

    static init(template) {
        this.template = template
        this.initialized = true;
    }
}

class SettingsElementDropdown extends SettingsElement {
    constructor(mainText, textOnHover, id) {
        super(mainText, textOnHover, id)
        this.changeInputElement("select")
    }

    addChoice(value, displayText) {
        let element = document.createElement("option");

        element.value = value;
        element.innerHTML = displayText;

        this.input.appendChild(element);
    }
}

//uses functions from the following classes
//JsonsHandler
//LoadingScreenHandler
//SettingsElement

//be sure to initialize them first
class SettingsHandler {

    static elements;
    static settings;
    static initialized = false;
    static activeGamePack;
    static gamePacks;
    static showing = false;

    // elements formatted {
    //     whateverElement:element,
    //     settings:[arrayOfSettingElements]
    // }

    //i decided to put the other classes in this init method so that it is clear what other classes
    //this class uses functions from, idk if its best practice
    static async init(elements) {
        this.elements = elements;
        
        LoadingScreenHandler.start();
        await JsonsHandler.init();

        
        this.gamePacks = JsonsHandler.jsons.gamePacks;

        for (let settingElements of this.elements.settings) {

            //for initing each type of inputs
            switch (settingElements.id) {
                case "gamePack":
                    for (let i = 0; i < this.gamePacks.length; i++) {
                        const gamePack = this.gamePacks[i];
                        settingElements.addChoice(i, gamePack.name);
                    }

                    settingElements.input.addEventListener("change", this.updateGamePack.bind(this))
                    break;
                default:
                    settingElements.input.addEventListener("change", this.receiveTextSettingChange.bind(this));
                    settingElements.input.addEventListener("focusout", this.updateInputs.bind(this));
                    break;
            }

            this.elements.settingsContainer.appendChild(settingElements.element)
        }

        this.elements.settingsButton.addEventListener("click", this.toggleSettingsBox.bind(this))
        this.elements.settingsResetButton.addEventListener("click", this.resetSettingsToDefault.bind(this))

        this.settings = await this.loadLocalSettings();
        this.activeGamePack = this.loadLocalActiveGamepack();
        this.updateInputs();

        LoadingScreenHandler.stop();
        this.initialized = true;
    }

    static updateGamePack(event) {
        this.activeGamePack = this.gamePacks[event.target.value];
        this.setLocalActiveGamepack();
        return this.activeGamePack;
    }

    static loadSettingsDefault(){
        this.settings = JsonsHandler.jsons.settingsDefault;
        this.setLocalSettings(this.settings);
        return this.settings;
    }

    static resetSettingsToDefault(){
        this.loadSettingsDefault();
        this.updateInputs();
        this.clearErrorAll();
    }

    static async loadLocalSettings() {
        let settings = localStorage.getItem("settings");

        if (settings == null) {
            settings = this.loadSettingsDefault();
        } else settings = JSON.parse(settings);

        return settings;
    }

    static loadLocalActiveGamepack() {
        let activeGamePack = localStorage.getItem("activeGamePack");

        if (activeGamePack == null) {
            activeGamePack = this.gamePacks[0];
            this.setLocalActiveGamepack(activeGamePack);
        } else activeGamePack = JSON.parse(activeGamePack);

        return activeGamePack;
    }

    static setLocalActiveGamepack(activeGamePack = this.activeGamePack) {
        localStorage.setItem("activeGamePack", JSON.stringify(activeGamePack));
    }

    static setLocalSettings(settings = this.settings) {
        localStorage.setItem("settings", JSON.stringify(settings))
    }

    static updateInputs() {
        const settings = this.settings;
        for (let settingElement of this.elements.settings) {
            switch (settingElement.id) {
                case "totalChoices":
                    settingElement.input.value = settings.totalChoices;
                    break;
                case "totalQuestions":
                    settingElement.input.value = settings.totalQuestions;
                    break;
                case "questionBlacklist":
                    settingElement.input.value = settings.questionBlacklist;
                    break;
                case "gamePack":
                    const options = settingElement.input.options;
                    for (let i = 0; i < options.length; i++) {
                        let option = options[i]
                        if (option.innerHTML == this.activeGamePack.name) {
                            settingElement.input.selectedIndex = i;
                            break;
                        }
                    }
                    break;
            }
        }
    }

    static toggleSettingsBox() {
        if (this.showing) {
            try {
                Fade.fadeOut(0.5, this.elements.settingsBox)
                this.showing = false;
            }
            catch (e) {
            }
        } else {
            try {
                Fade.fadeIn(0.5, this.elements.settingsBox, "flex")
                this.showing = true;
            }
            catch (e) {
            }

        }
    }

    static receiveTextSettingChange(event) {
        const id = event.target.id;
        const value = event.target.value;
        const valid = this.checkValidity(id, value);

        if (valid.valid == false) {
            this.pushError(id, valid.errorMessage)
        } else {
            this.clearError(id)
            this.settings[id] = value;
            this.setLocalSettings();
        }

    }

    static checkValidity(id, value) {

        let valid

        switch (id) {
            case "totalChoices":
                valid = this.checkValidityTotalChoice(value);
                break;
            case "totalQuestions":
                valid = this.checkValidityTotalQuestions(value);
                break;
            case "questionBlacklist":
                valid = this.checkValidityQuestionBlacklist(value);
                break;
        }

        return valid;
    }

    static updateError(id, str) {
        document.getElementById(`${id}-error`).innerHTML = str
    }

    //takes in the id without the -error
    static pushError(id, error) {
        this.updateError(id, "* " + error)
    }

    static clearError(id) {
        this.updateError(id, "")
    }

    static clearErrorAll() {
        this.elements.settings.forEach(x => this.clearError(x.id));
    }

    static checkValidityTotalChoice(value) {
        let out = {
            valid:true
        }

        //must only be numbers
        //and now also no bs like 10-10 or 5-
        if (this.isValidInteger(value)) {
            out.valid = false;
            out.errorMessage = "Setting must contain a valid integer"
        }
        //the condtion is be smaller than the smallest answer pool and not be > 1
        else if (value > this.getMinLength(this.activeGamePack.answerPools)) {
            out.valid = false;
            out.errorMessage = "Chosen gamepack does not have enough choices"
        } else if (value <= 1) {
            out.valid = false;
            out.errorMessage = "Total choices cannot be less than 2"
        }
        return out;
    }

    static checkValidityTotalQuestions(value) {
        let out = {
            valid:true
        }

        //must only be numbers
        //and now also no bs like 10-10 or 5-
        if (this.isValidInteger(value)) {
            out.valid = false;
            out.errorMessage = "Setting must contain a valid integer"
        }
        else if (value <= 0) {
            out.valid = false;
            out.errorMessage = "Total questions cannot be less than 1"
        }

        return out;
    }

    static checkValidityQuestionBlacklist(value) {
        let out = {
            valid:true
        }

        //must only be numbers
        //and now also no bs like 10-10 or 5-
        if (this.isValidInteger(value)) {
            out.valid = false;
            out.errorMessage = "Setting must contain a valid integer"
        }
        else if (value < 0) {
            out.valid = false;
            out.errorMessage = "Question cooldown cannot be less than 0"
        }
        else if (value > this.getMinLength(this.activeGamePack.questionPools)){
            out.valid = false;
            out.errorMessage = "Chosen gamepack does not have enough questions"
        }

        return out;
    }

    static isValidInteger(str){
        return /[^-\d]|\d+-\d*/g.test(str)
    }


    static getMinLength(pools) {
        return Math.min(... pools.map(x => x.pool.length))
    }
}