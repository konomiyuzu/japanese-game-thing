class SettingsElement {
    static initialized = false;
    static template;

    constructor(mainText, textOnHover, id) {
        if (!SettingsElement.initialized) throw new Error("SettingsElement not initialized")

        let elements = this.#createElement(mainText, textOnHover, id)

        this.type = "text";
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
        this.type = type;
        this.input.type = type;
    }

    //typename being what to internally call it (i.e dropdown)
    changeInputElement(elementName,typeName){
        this.type = typeName;

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

// class SettingsElementText extends SettingsElement{
//     text
// }

class SettingsHandler {

    static elements;
    static settingsContainer;
    static initialized = false;
    static activeGamePack;

    static async init(elements, settingsContainer) {
        this.elements = elements;
        this.settingsContainer = settingsContainer;

        const gamePacks = await this.getGamePacks();

        for (let element of elements) {
            if(element.type == "text") element.input.addEventListener("change", this.checkValidity.bind(this))
            if(element.type == "dropdown"){
                for (let i = 0; i < gamePacks.length; i++){
                    const gamePack = gamePacks[i];
                    element.addChoice(i,gamePack.name)
                }
            }
            settingsContainer.appendChild(element.element)
        }


        
        this.initialized = true;
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

    static checkValidity(event) {

        let valid
        const id = event.target.id
        const value = event.target.value

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

        if (valid.valid == false) {
            this.pushError(id, valid.errorMessage)
        } else this.clearError(id)
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


const settingsElements = [];

settingsElements.push(new SettingsElement("Choices per Question:", "Total choices to display per question (integer)", "totalChoices"))
settingsElements.push(new SettingsElement("Total Questions:", "Total questions per game (integer)", "totalQuestions"))
settingsElements.push(new SettingsElement("Question Cooldown:", "how many rounds to wait before a previously picked question is allowed to be reused (integer)", "questionBlacklist"))
settingsElements.push(new SettingsElementDropdown("Game Pack:", "what set of questions and answers to use", "gamePack"))

const settingsContainer = document.getElementById("settingsContainer")
SettingsHandler.init(settingsElements, settingsContainer);

//for testing
SettingsHandler.activeGamePack = {
    "answerPools": [
        {
            "id": 0,
            "pool": [
                "a",
                "i",
                "u",
                "e",
                "o"
            ]
        },
        {
            "id": 1,
            "pool": [
                "あ",
                "い",
                "う",
                "え",
                "お"
            ]
        }
    ],
    "questionPools": [
        {
            "id": 0,
            "answerPoolId": 0,
            "pool": [
                {
                    "question": "あ",
                    "answer": "a"
                },
                {
                    "question": "い",
                    "answer": "i"
                },
                {
                    "question": "う",
                    "answer": "u"
                },
                {
                    "question": "え",
                    "answer": "e"
                },
                {
                    "question": "お",
                    "answer": "o"
                }
            ]
        },
        {
            "id": 1,
            "answerPoolId": 1,
            "pool": [
                {
                    "question": "a",
                    "answer": "あ"
                },
                {
                    "question": "i",
                    "answer": "い"
                },
                {
                    "question": "u",
                    "answer": "う"
                },
                {
                    "question": "e",
                    "answer": "え"
                },
                {
                    "question": "o",
                    "answer": "お"
                }
            ]
        }
    ]
}