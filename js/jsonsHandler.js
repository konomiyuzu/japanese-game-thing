class JsonsHandler{
    static jsons;
    static initialized = false;

    static async init(){
        if(this.initialized) return;

        this.jsons = await this.fetchJson("./jsons/jsons.json")
        this.initialized = true;
    }

    static async fetchJson(file) {
        const response = await fetch(file)
        return await response.json()
    }
}