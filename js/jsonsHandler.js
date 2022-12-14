class JsonsHandler{
    static #jsons;
    static initialized = false;

    static async init(){
        if(this.initialized) return;

        this.#jsons = await this.fetchJson("./jsons/jsons.json")
        this.initialized = true;
    }

    static get jsons(){
        if(!this.initialized) throw new Error("JsonsHandler not initialized")
        //copied so that is isnt edited
        return JSON.parse(JSON.stringify(this.#jsons));
    }

    static async fetchJson(file) {
        const response = await fetch(file)
        return await response.json()
    }
}