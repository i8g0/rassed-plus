/* global process */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
if (!GEMINI_API_KEY) {
	console.error('Missing GEMINI_API_KEY environment variable.');
	process.exit(1);
}
const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + GEMINI_API_KEY;

fetch(url)
.then(res => res.json())
.then(data => console.log(JSON.stringify(data).substring(0, 500)))
.catch(err => console.error(err));
