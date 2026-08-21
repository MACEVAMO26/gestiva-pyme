
const { execSync } = require("child_process");
const fs = require("fs");

let compiling = true;
let max_iters = 30;
let iters = 0;

while(compiling && iters < max_iters) {
    iters++;
    console.log("Building... attempt " + iters);
    try {
        execSync("npm run build --prefix frontend", { encoding: "utf8", stdio: "pipe" });
        console.log("Build SUCCESS!");
        compiling = false;
    } catch (e) {
        let err = e.stderr || e.stdout;
        let match = err.match(/The `([^`]+)` class does not exist/);
        if (match) {
            let className = match[1];
            console.log("Removing bad class: " + className);
            let scss = fs.readFileSync("frontend/src/app/pages/saas-admin/saas-admin.component.scss", "utf8");
            let regex = new RegExp(" " + className + "\\b", "g");
            scss = scss.replace(regex, "");
            scss = scss.replace(/@apply\s*;/g, "");
            fs.writeFileSync("frontend/src/app/pages/saas-admin/saas-admin.component.scss", scss);
        } else {
            console.log("UNKNOWN ERROR:", err);
            break;
        }
    }
}

