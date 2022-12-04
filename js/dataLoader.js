
class DataLoader {
    static async fetchJson(file){
        const response = await fetch(file)
        return await response.json()
    }


    static async init() {
            if (localStorage.getItem("settings") == null) {
                let json = await this.fetchJson("./jsons/settings-default.json")
                localStorage.setItem("settings", JSON.stringify(json))
            }
            
            if (localStorage.getItem("testgame") == null) {
                let json = await this.fetchJson("./jsons/game-1.json")
                localStorage.setItem("testgame", JSON.stringify(json))
            }
        
    }
}