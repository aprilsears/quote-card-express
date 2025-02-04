"use strict";

const el = {
    quote: document.getElementById("quote"),
    author: document.getElementById("author"),
}

const quotes = [
    {
    quote: "Luck is what happens when preparation meets opportunity.",
    author:"-Seneca",
    },

    {
    quote: "More is lost by indecision than wrong decision.",
    author:"-Marcus Tullius Cicero",
    },

    {
    quote: "The best answer to anger is silence.",
    author:"-Marcus Aurelius",
    }
]

function loopThroughQuotes() {
    let index = 0;
    setInterval(()=> {
        if (index < quotes.length) {
            el.quote.innerText = quotes[index].quote;
            el.author.innerText = quotes[index].author;
            index++;
        } else {
            index = 0;
        }
    }, 3000)
}

setTimeout(loopThroughQuotes, 3000);
