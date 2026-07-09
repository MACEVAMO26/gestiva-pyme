const fs = require('fs');
const readline = require('readline');

async function extract() {
    const fileStream = fs.createReadStream('C:\\Users\\Merrick\\.gemini\\antigravity\\brain\\a3124680-f627-4b26-9ac8-f243239e374e\\.system_generated\\logs\\transcript_full.jsonl');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if (line.includes("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap")) {
            const data = JSON.parse(line);
            if (data.type === 'USER_INPUT') {
                fs.writeFileSync('recovered_scss.txt', data.content);
                console.log('Successfully extracted SCSS to recovered_scss.txt');
                return;
            }
        }
    }
    console.log('Could not find the SCSS in the transcript.');
}

extract();
