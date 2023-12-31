const letters = document.querySelectorAll(".letter-box")
const loadingDiv = document.querySelector(".info-bar")
const ANSWER_LENGTH = 5
const ROUNDS = 6
const WORD_URL = "https://words.dev-apis.com/word-of-the-day"
const RANDOM_WORD_URL = "https://words.dev-apis.com/word-of-the-day?random=1"
const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word"

async function init() {
    let done = false
    let currentGuess = ''
    let currentRow = 0
    let isLoading = true
    setLoading(isLoading)

    // collect the word of the day
    const res = await fetch(WORD_URL)
    const resObject = await res.json()
    const correctWord = resObject.word.toUpperCase()
    const correctWordParts = correctWord.split("")

    console.log(correctWord)

    isLoading = false
    setLoading(isLoading)
    
    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter
        } /* else {
            currentGuess = currentGuess.substring(0, currentGuess - 1) + letter
        } */ else {
            return
        }

        letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText = letter
    }

    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            // do nothing
            return
        }

        isLoading = true
        setLoading(isLoading)

        const res = await fetch(VALIDATE_WORD_URL, {
            method: "POST", 
            body: JSON.stringify({ word: currentGuess})
        })
        const resObject = await res.json()
        const validWord = resObject.validWord
        // cosnt { validWord } = resObject

        isLoading = false
        setLoading(isLoading)

        if (!validWord) {
            markInvalidWord()
            return
        }

        const guessParts = currentGuess.split("")
        const map = makeMap(correctWordParts)

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            // mark as correct
            if (guessParts[i] === correctWordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("all-correct")
                map[guessParts[i]]--
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === correctWordParts[i]) {
                // do nothing
            } else if (correctWordParts.includes(guessParts[i]) && map[guessParts[i]] >= 1) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct-letter")
                map[guessParts[i]]--
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong")
            }
        }
        
        currentRow++
        

        if (currentGuess === correctWord) {
            alert("You win")
            done = true
            document.querySelector(".header").classList.add("celebration")
            return
        }

        if (currentRow === ROUNDS) {
            done = true 
            alert(`You lost! The correct word was ${correctWord}`)
        }
        currentGuess = ''
        
    }

    function markInvalidWord() {
        for (let i = 0; i < currentGuess.length; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove("not-valid")

            setTimeout(function () {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("not-valid")
            }, 10)
        }
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1)
        letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = ""
        
    }

    document.addEventListener("keydown", function handleKeyPress(event) {
        if (done || isLoading) {
            // do nothing
            return
        }

        const action = event.key
        if (action === "Enter") {
            commit()
        } else if (action === "Backspace") {
            backspace()
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase())
        } else {
            // do nothing
        }
    } )
    
}

// Function to test wether the user is typing a single letter
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter)
}

function setLoading(isLoading) {
    loadingDiv.classList.toggle('hidden', !isLoading)
}

function makeMap(array) {
    const obj = {}
    for (let i = 0; i < array.length; i++) {
        const letter = array[i]
        if (obj[letter]) {
            obj[letter]++
        } else [
            obj[letter] = 1
        ]
    }
    return obj
}

/* let valid = true

    let correctWord = ''
    
    getWord(WORD_URL).then(x => {
        correctWord = x
        console.log(correctWord)
    })

    let guessedWord = ''
    let currentRow = 0
    let count = 0
    let letterDict = {}

    const container = document.getElementsByClassName("word-container")[0]
    document.addEventListener("keydown", function handleKeyPress (event) {
        const action = event.key
        console.log(action)
        if (parseInt(e.target.parentNode.parentNode.id) != currentRow) {
            guessedWord = ''
            currentRow = e.target.parentNode.parentNode.id
            count = 0
            letterDict = {}
        }
        let target = e.srcElement || e.target
        let myLength = target.value.length
        if (myLength >= 1) {
            if (correctWord.includes(e.target.value)){
                if (parseInt(e.target.id) === correctWord.indexOf(e.target.value) || (countOccurences(correctWord, e.target.value) > 1 && parseInt(e.target.id)=== getPosition(correctWord, e.target.value, e.target.id))) {
                    letterDict[e.target.id] = "ac"
                } else if (parseInt(e.target.id) != correctWord.indexOf(e.target.value)) {
                    letterDict[e.target.id] = "cl"
                }
            } else {
                letterDict[e.target.id] = "w"
            }
            guessedWord += e.target.value
            count += 1
            if (!isLetter(e.key)) {
                e.preventDefault()
                return
            } else {
                let next = target.parentNode
                let row = target.parentNode.parentNode
                while (next = next.nextElementSibling) {
                    if (next.tagName.toLowerCase() === "td") {
                        next.children[0].focus()
                        break
                    }
                }
                if (count === 5) {
                    let parentNode = e.target.parentNode.parentNode
                    validateWord(VALIDATE_WORD_URL, guessedWord).then(setValidation).then(data => {
                        valid = data.validWord
                        if (!valid) {
                            for (let i = 0; i < 5; i++) {
                                parentNode.children[i].children[0].classList.add("not-valid")
                            }
                        } else {
                            for (let i = 0; i < 5; i++) {
                                if (letterDict[i] === "ac"){
                                    parentNode.children[i].children[0].classList.add("all-correct")
                                } else if (letterDict[i] === "cl") {
                                    parentNode.children[i].children[0].classList.add("correct-letter")
                                } else if (letterDict[i] === "w") {
                                    parentNode.children[i].children[0].classList.add("wrong")
                                }
                            } 
                        }
                    })
                    if (guessedWord === correctWord) {
                        alert("Correct! You won!")
                        document.querySelector("header").classList.add("celebration")
                    } 
                    if (guessedWord != correctWord && parentNode.id === '5') {
                        alert(`Sorry, you lost! The correct word was ${correctWord}.`)
                    }
                }
                if (!next && row.parentNode.rows[row.rowIndex + 1]) {
                    row.parentNode.rows[row.rowIndex + 1].children[0].children[0].focus()
                }
            }
        } else if (myLength === 0) {
            guessedWord = guessedWord.slice(0, guessedWord.length - 1)
            count -= 1
            let previous = target.parentNode
            if (previous.children[0].classList.contains("not-valid")) {
                previous.children[0].classList.remove("not-valid")
            }
            while (previous = previous.previousElementSibling) {
                if (previous === null) {
                    break
                }
                if (previous.tagName.toLowerCase() === "td") {
                    previous.children[0].focus()
                    break
                }
            }

        }
    })

async function getWord(url) {
    const response = await fetch(url, {method: "GET"})
    const wordObject = await response.json()
    const word = wordObject.word
    return word
}

async function validateWord(url, wordGuess) {
    try {
        const response = await fetch(url, {
            method: "POST", 
            body: JSON.stringify({
                word: wordGuess
            })
        })
        const validation = await response.json()
        return validation
    } catch (error) {
        console.error(error)
    }
}

function setValidation(validation) {
    valid = validation
    return valid
}

function getPosition(word, letter, index) {
    return word.split(letter, index).join(letter).length
}

const countOccurences = (word, search) => {
    return word.split(search).length - 1
} */



init()

