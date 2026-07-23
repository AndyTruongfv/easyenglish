const fs = require('fs');

const input = `<?xml version="1.0"?>
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "xhtml11.dtd">
       <html xmlns="http://easyenglishwithandy.blogspot.com"
             xml:lang="en"><head><meta name="Bài tập Hiện tại đơn" content="Bài tập Hiện tại đơn."></meta><meta name="Simple Present exercise" content="Simple Present exercise"></meta>

I = new Array();

I[0] = new Array();
I[0][1] = new Array();
I[0][1][0] = new Array();
I[0][1][0][0] = '\\u0061\\u0072\\u0065';
I[0][2]='';

I[1] = new Array();
I[1][1] = new Array();
I[1][1][0] = new Array();
I[1][1][0][0] = '\\u0062\\u0061\\u0072\\u006B\\u0073';
I[1][2]='';

<div class="ClozeBody">
1. Vegetables <span class="GapSpan" id="GapSpan0"><input type="text" id="Gap0" onfocus="TrackFocus(0)" onblur="LeaveGap()" class="GapBox" size="6"></input></span> good for you. (is/are)<br />2. A dog <span class="GapSpan" id="GapSpan1"><input type="text" id="Gap1" onfocus="TrackFocus(1)" onblur="LeaveGap()" class="GapBox" size="6"></input></span>. (barks/bark)<br />
</div>
`;

function unescapeUnicode(str) {
    return str.replace(/\\u([0-9A-Fa-f]{4})/g, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
}

let answers = [];
let htmlText = "";

const regex = /I\[(\d+)\]\[1\]\[0\]\[0\]\s*=\s*'([^']+)';/g;
let match;
while ((match = regex.exec(input)) !== null) {
    const idx = parseInt(match[1]);
    const answer = unescapeUnicode(match[2]);
    answers[idx] = answer;
}

const bodyMatch = input.match(/<div class="ClozeBody">([\s\S]*?)<\/div>/i);
if (bodyMatch) {
    htmlText = bodyMatch[1].trim();
}

console.log(JSON.stringify({ answers, htmlText }, null, 2));
