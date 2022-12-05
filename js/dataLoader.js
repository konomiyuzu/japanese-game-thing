
class DataLoader {
    static activeGamePack;
    static async fetchJson(file){
        const response = await fetch(file)
        return await response.json()
    }


    static async init() {
            if (localStorage.getItem("settings") == null) {
                let json = await this.fetchJson("./jsons/settings-default.json")
                localStorage.setItem("settings", JSON.stringify(json))
            }
            
            this.activeGamePack = await this.fetchJson("./jsons/gamepack.json")
    }
}