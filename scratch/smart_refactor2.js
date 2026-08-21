
const fs = require("fs");

function run() {
    const htmlPath = "frontend/src/app/pages/saas-admin/saas-admin.component.html";
    const scssPath = "frontend/src/app/pages/saas-admin/saas-admin.component.scss";
    
    let html = fs.readFileSync(htmlPath, "utf8");
    let classesFound = [];
    
    // Read existing SCSS to find the highest saas-style-N
    let scss = fs.readFileSync(scssPath, "utf8");
    let highestIdx = 0;
    let match;
    let regexAll = /saas-style-(\d+)/g;
    while ((match = regexAll.exec(scss)) !== null) {
        let idx = parseInt(match[1]);
        if (idx > highestIdx) highestIdx = idx;
    }
    
    // Match class attributes that do NOT contain curly braces (to avoid {{}})
    html = html.replace(/ class="([^"{}]+)"/g, (match, classStr) => {
        if (!classStr.trim()) return match;
        
        const classes = classStr.split(/\s+/).filter(Boolean);
        
        const customClasses = new Set(["global-header", "header-left", "logo-container", "brand-logo", "badge", "header-right", "welcome-text", "topbar-actions", "user-profile", "avatar", "btn-logout", "saas-floating-widget", "accessibility-btn", "saas-layout", "navbar-logo", "nav-item", "nav-icon", "nav-text", "active", "btn-primary", "dashboard-container", "uppercase", "form-input"]); // uppercase is standard tailwind but sometimes used standalone
        
        const tailwindClasses = [];
        const nonTailwind = [];
        
        for (const c of classes) {
            // Include brackets in the tailwind check since arbitrary values have them
            let isTailwind = false;
            if (c.includes("-") || c.includes("[") || c.includes(":") || ["flex", "grid", "absolute", "relative", "block", "hidden", "shadow", "border", "rounded", "uppercase", "p", "m", "w", "h"].includes(c)) {
                isTailwind = true;
            }
            if (customClasses.has(c) || c.startsWith("saas-style-")) {
                isTailwind = false;
            }
            
            if (isTailwind) {
                tailwindClasses.push(c);
            } else {
                nonTailwind.push(c);
            }
        }
        
        if (tailwindClasses.length === 0) return match;
        
        highestIdx++;
        const newClassName = `saas-style-${highestIdx}`;
        classesFound.push({ newClassName, origClasses: tailwindClasses.join(" ") });
        
        const newClassStr = [...nonTailwind, newClassName].join(" ");
        return ` class="${newClassStr}"`;
    });
    
    if (classesFound.length > 0) {
        fs.writeFileSync(htmlPath, html, "utf8");
        
        let scssAppend = "\n\n/* --- AUTO GENERATED TAILWIND PASO 2 --- */\n";
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

