const fs = require("fs");
const dir = "../jsons/";
const folders = fs.readdirSync(dir,"utf-8").filter(
    name => {
        return fs.lstatSync(dir + name).isDirectory();
    }
)

let output = {};

for(let folder of folders){
    let folderPath = dir + folder;
    if(!fs.existsSync(`${folderPath}/name.txt`)){
        console.log(`no name exists for \"${folder}\", skipping`)
        continue;
    }

    let name = fs.readFileSync(`${folderPath}/name.txt`,"utf-8");

    let jsonNames = fs.readdirSync(folderPath,"utf-8").filter(x => x.endsWith(".json"));
    let out = [];
    
    for(let jsonName of jsonNames){
        let json = JSON.parse(fs.readFileSync(`${folderPath}/${jsonName}`, "utf-8"));
        out.push(json);
    }

    //so that when there is only one file it isnt just a 1 length array
    output[name] = out.length == 1? out[0]: out;
}

fs.writeFileSync(dir + "jsons.json", JSON.stringify(output), "utf-8")