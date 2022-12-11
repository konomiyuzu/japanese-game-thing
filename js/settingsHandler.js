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

    changeInputType(type){
        this.input.type = type;
    }

    changeInputElement(elementName){

        let element = document.createElement(elementName);
        element.classList = this.input.classList;
        element.id = this.input.id;
        this.input.parentNode.replaceChild(element,this.input);

        this.input = element;
    }

    static init(template) {
        this.template = template
        this.initialized = true;
    }
}

class SettingsElementDropdown extends SettingsElement {
    constructor(mainText, textOnHover, id){
        super(mainText, textOnHover, id)
        this.changeInputElement("select","dropdown")
    }

    addChoice(value,displayText){
        let element = document.createElement("option");

        element.value = value;
        element.innerHTML = displayText;

        this.input.appendChild(element);
    }
}

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
    static async init(elements) {
        this.elements = elements;

        this.gamePacks = await this.getGamePacks();

        for (let settingElements of this.elements.settings) {

            //for initing each type of inputs
            switch(settingElements.id){
                case "gamePack":
                    for (let i = 0; i < this.gamePacks.length; i++){
                        const gamePack = this.gamePacks[i];
                        settingElements.addChoice(i,gamePack.name)
                    }

                    settingElements.input.addEventListener("change", this.updateGamePack.bind(this))
                break;
                default:
                    settingElements.input.addEventListener("change", this.updateSettings.bind(this));
                    settingElements.input.addEventListener("focusout", this.updateInputs.bind(this));
                break;
            }

            this.elements.settingsContainer.appendChild(settingElements.element)
        }

        this.elements.settingsButton.addEventListener("click", this.toggleSettingsBox.bind(this))
        
        this.settings = await this.loadLocalSettings();
        this.activeGamePack = this.loadLocalActiveGamepack();
        this.updateInputs();

        this.initialized = true;
    }

    static updateGamePack(event){
        this.activeGamePack = this.gamePacks[event.target.value]
        this.setLocalActiveGamepack();
    }

    static async loadLocalSettings(){
        let settings = localStorage.getItem("settings");
        
        if(settings == null) {
            settings = await this.fetchJson("./jsons/settings-default.json");
            this.setLocalSettings(settings)
        } else settings = JSON.parse(settings);

        return settings;
    }

    static loadLocalActiveGamepack(){
        let activeGamePack = localStorage.getItem("activeGamePack");

        if(activeGamePack == null){
            activeGamePack = this.gamePacks[0];
            this.setLocalActiveGamepack(activeGamePack);
        } else activeGamePack = JSON.parse(activeGamePack);

        return activeGamePack;
    }

    static setLocalActiveGamepack(activeGamePack = this.activeGamePack){
        localStorage.setItem("activeGamePack",JSON.stringify(activeGamePack));
    }
    
    static setLocalSettings(settings = this.settings){
        localStorage.setItem("settings",JSON.stringify(settings))
    }

    static updateInputs(){
        const settings = this.settings;
        for(let settingElement of this.elements.settings){
            switch(settingElement.id){
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
                    const options =  settingElement.input.options;
                    for (let i = 0; i < options.length; i++){
                        let option = options[i]
                        if(option.innerHTML == this.activeGamePack.name){
                            settingElement.input.selectedIndex = i;
                            break;
                        }
                    }
                break;
            }
        }

        this.clearErrorAll();
    }

    static toggleSettingsBox(){
        if(this.showing){
            Fade.fadeOut(0.5,this.elements.settingsContainer)
            this.showing = false;
        } else {
            Fade.fadeIn(0.5,this.elements.settingsContainer,"flex")
            this.showing = true;
        }
    }

    static async getGamePacks(){
        let names = await this.fetchJson("./built in gamePacks/names.json");
        
        let out = [];
        for(let name of names.names){
            out.push(await this.fetchJson(`./built in gamePacks/${name}`))
        }

        return out
    }

    static async fetchJson(file) {
        const response = await fetch(file)
        return await response.json()
    }

    static updateSettings(event){
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
        let valid = true;
        let out = {}

        //must only be numbers
        if (/[^-\d]/g.test(value)) {
            valid = false;
            out.errorMessage = "Setting must only contain numbers"
        }
        //the condtion is be smaller than the smallest answer pool and not be > 1
        else if (value > this.getMinLength()) {
            valid = false;
            out.errorMessage = "Chosen gamepack does not have enough choices"
        } else if (value <= 1) {
            valid = false;
            out.errorMessage = "Total choices cannot be less than 2"
        }
        out.valid = valid;
        return out;
    }

    static checkValidityTotalQuestions(value) {
        let valid = true;
        let out = {};

        //must only be numbers
        if (/[^-\d]/g.test(value)) {
            valid = false;
            out.errorMessage = "Setting must only contain numbers"
        }
        else if (value <= 0) {
            valid = false;
            out.errorMessage = "Total questions cannot be less than 1"
        }

        out.valid = valid;
        return out;
    }

    static checkValidityQuestionBlacklist(value) {
        let valid = true;
        let out = {};

        //must only be numbers
        if (/[^-\d]/g.test(value)) {
            valid = false;
            out.errorMessage = "Setting must only contain numbers"
        }
        else if (value < 0) {
            valid = false;
            out.errorMessage = "Question cooldown cannot be less than 0"
        }

        out.valid = valid;
        return out;
    }


    static getMinLength() {
        return Math.min(... this.activeGamePack.answerPools.map(x => x.pool.length))
    }
}

const settingElementTemplate = document.getElementById("settingElementTemplate");
SettingsElement.init(settingElementTemplate);


const settingsElements = {};
const settings = []
settings.push(new SettingsElement("Choices per Question:", "Total choices to display per question (integer)", "totalChoices"))
settings.push(new SettingsElement("Total Questions:", "Total questions per game (integer)", "totalQuestions"))
settings.push(new SettingsElement("Question Cooldown:", "how many rounds to wait before a previously picked question is allowed to be reused (integer)", "questionBlacklist"))
settings.push(new SettingsElementDropdown("Game Pack:", "what set of questions and answers to use", "gamePack"))

settingsElements.settingsContainer = document.getElementById("settingsContainer")
settingsElements.settingsButton = document.getElementById("settingsButton")
settingsElements.settings = settings;

SettingsHandler.init(settingsElements);