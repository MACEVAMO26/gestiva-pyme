
const fs = require("fs");

function run() {
    const htmlPath = "frontend/src/app/pages/saas-admin/saas-admin.component.html";
    const scssPath = "frontend/src/app/pages/saas-admin/saas-admin.component.scss";
    
    let html = fs.readFileSync(htmlPath, "utf8");
    let classesFound = [];
    
    // Only match class attributes that do NOT contain curly braces or brackets
    html = html.replace(/ class="([^"{}\[\]]+)"/g, (match, classStr) => {
        if (!classStr.trim()) return match;
        
        const classes = classStr.split(/\s+/).filter(Boolean);
        
        // Define known custom classes to KEEP in the HTML
        const customClasses = new Set(["global-header", "header-left", "logo-container", "brand-logo", "badge", "header-right", "welcome-text", "topbar-actions", "user-profile", "avatar", "btn-logout", "saas-floating-widget", "accessibility-btn", "saas-layout", "navbar-logo", "nav-item", "nav-icon", "nav-text", "active", "btn-primary", "dashboard-container"]);
        
        const tailwindClasses = [];
        const nonTailwind = [];
        
        for (const c of classes) {
            if (customClasses.has(c) || !c.includes("-") && !["flex", "grid", "absolute", "relative", "block", "hidden", "shadow", "border", "rounded", "p", "m", "w", "h"].includes(c)) {
                nonTailwind.push(c);
            } else {
                tailwindClasses.push(c);
            }
        }
        
        if (tailwindClasses.length === 0) return match;
        
        const newClassName = `saas-style-${classesFound.length + 1}`;
        classesFound.push({ newClassName, origClasses: tailwindClasses.join(" ") });
        
        const newClassStr = [...nonTailwind, newClassName].join(" ");
        return ` class="${newClassStr}"`;
    });
    
    if (classesFound.length > 0) {
        fs.writeFileSync(htmlPath, html, "utf8");
        
        let scssAppend = "\n\n/* --- AUTO GENERATED TAILWIND --- */\n";
        for (const item of classesFound) {
            scssAppend += `.${item.newClassName} { @apply ${item.origClasses}; }\n`;
        }
        fs.appendFileSync(scssPath, scssAppend, "utf8");
        console.log(`Refactored ${classesFound.length} classes.`);
    } else {
        console.log("No tailwind classes found.");
    }
}
run();

