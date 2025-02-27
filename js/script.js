document.addEventListener("DOMContentLoaded", () => {

    // I am getting my svg from ./assets/images/friend.svg
    const friendCharacter = document.getElementById('friendCharacter');
    const friendFeatures = ["body", "arm1", "arm2", "head", "eyes", "nose", "mouth", "belly"];

    friendCharacter.addEventListener("load", () => {
        const myObject = friendCharacter.contentDocument;
    
        const style = document.createElement("style");
        
        style.textContent = `
            .hidden {
                opacity: 0;
                transition: opacity 0s;
            }
            .fadeInEffect {
                opacity: 1;
                transition: opacity 1.5s ease-in-out;
            }
            @keyframes rotateArm1Animation {
                0% { transform: rotate(-1deg); }
                100% { transform: rotate(1deg); }
            }

            @keyframes rotateArm2Animation {
                0% { transform: rotate(1deg); }
                100% { transform: rotate(-1deg); }
            }

            .rotateArm1 {
                animation: rotateArm1Animation 0.6s infinite alternate ease-in-out;
                transform-origin: left center;
            }

            .rotateArm2 {
                animation: rotateArm2Animation 0.8s infinite alternate ease-in-out;
                transform-origin: right center;
            }
        `;
    
        myObject.documentElement.appendChild(style);
    
        friendFeatures.forEach(feature => {
            const featureElement = myObject.getElementById(feature);
            if (featureElement) {
                featureElement.classList.add("hidden");
            }
        });
    });
    

    // I am using Open Trivia Database.
    const quizApiUrl = "https://opentdb.com/api.php?amount=6&category=9&difficulty=easy&type=multiple";

    // This is where I am displaying the questions
    const questionBlock = document.getElementById("questionBlock");

    // This are the answers
    const multipleChoices = document.getElementById("multipleChoices");

    // This is where I Am displaying amount of questions answered
    const questionNumberDisplay = document.getElementById("questionNumber");

    // This is where i display the timer
    const timerDisplay = document.getElementById("timer");


    questionBlock.innerHTML = `<h2> Answer questions to unlock features of your friend! If you get all 6 right, you get a NEW friend!  </h2>`;

    const correct = new Audio('./assets/audio/correct.mp3');
    const wrong = new Audio('./assets/audio/wrong.mp3');
    const congratulations = new Audio('./assets/audio/yaay.mp3');
    const betterLuck = new Audio('./assets/audio/womp.mp3');

    let questions = [];
    let currentQuestionNumber = 0;
    let score = 0;
    let timeLeft;
    let timerInterval;
    let quizStarted = false;
    let imageNumber;
    const restartButton = document.getElementById("restart");
    restartButton.textContent = "Start";


    const fetchQuestions = async () => {
        try {
            const response = await fetch(quizApiUrl);
            const data = await response.json();
            questions = data.results;
        } catch (error) {
            console.error("Errorr: ", error);
        }
    };


    function playSound(audio) {
        audio.currentTime = 0; 
        audio.play();
        
        setTimeout(() => {
            audio.pause(); 
            audio.currentTime = 0; 
        }, 1000);
    }

    const startQuiz = () => {
        currentQuestionNumber = 0;
        score = 0;
        quizStarted = true;
        restartButton.textContent = "Restart";
        // So that one random question can have an image 
        imageNumber = Math.floor(Math.random() * questions.length);
        setTimeout(displayQuestion, 3000);
    };
    
    const displayQuestion = () => {
        resetQuestion();

        questionBlock.classList.remove("displayQuestionHeight");
    
        if (currentQuestionNumber >= questions.length) {
            displayFinalResults();
            return;
        }
        
        const currentQuestion = questions[currentQuestionNumber];
        const questionText = document.createElement("p");
        questionText.innerHTML = currentQuestion.question;
        questionBlock.appendChild(questionText);
        
        if (currentQuestionNumber === imageNumber) {

            // If the question number matches with the random image number then it is going to have a picture
            const imageElement = document.createElement("img");
            imageElement.src = "./assets/images/question.png"; 
            imageElement.alt = "Question Image";
            imageElement.classList.add("questionImage");
            questionBlock.appendChild(imageElement);
            questionBlock.classList.add("displayQuestionHeight");
        }
        
        questionNumberDisplay.textContent = `Question ${currentQuestionNumber + 1} of ${questions.length}`;
        
        const answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer].sort(() => Math.random() - 0.5);
        
        answers.forEach(answer => {
            const button = document.createElement("button");
            button.textContent = answer;
            button.classList.add("answerButton");
            if (answer === currentQuestion.correct_answer) {
                button.dataset.correct = "true";
            }
            button.addEventListener("click", (event) => multipleChoice(event, answer === currentQuestion.correct_answer));
            multipleChoices.appendChild(button);
        });
        
        startTimer();
    };
    
    
    const resetQuestion = () => {
        multipleChoices.innerHTML = "";
        questionBlock.innerHTML = "";
    };
    

    const startTimer = () => {
        clearInterval(timerInterval);
        timeLeft = 10;
        timerDisplay.textContent = `Time Left: ${timeLeft}s`;

        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time Left: ${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                disableAllButtons();

                document.querySelectorAll(".answerButton").forEach(btn => {
                    if (btn.dataset.correct === "true") {
                        btn.classList.add("correct");
                    } else {
                        btn.classList.add("incorrect");
                    }
                });

                playSound(wrong);
                setTimeout(nextQuestion, 1500);
            }
        }, 1000);
    };


    const multipleChoice = (e, isCorrect) => {
        clearInterval(timerInterval);
        const button = e.target;

        if (isCorrect) {
            button.classList.add("correct");
            score++;
            unlockFriendFeature();
            playSound(correct);
        } else {
            button.classList.add("incorrect");
            document.querySelectorAll(".answerButton").forEach(button => {
                if (button.dataset.correct === "true") {
                    button.classList.add("correct");
                }
                playSound(wrong);
            });
        }

        disableAllButtons();
        setTimeout(nextQuestion, 1500);

    };

    const unlockFriendFeature = () => {
        const friendSvg = friendCharacter.contentDocument;
        const featureNumber = (score - 1) % friendFeatures.length;
        const unlockedFeature = friendSvg.getElementById(friendFeatures[featureNumber]);
        unlockedFeature.classList.remove("hidden");
        unlockedFeature.classList.add("fadeInEffect");
    };
    

    const disableAllButtons = () => {
        document.querySelectorAll(".answerButton").forEach(button => button.disabled = true);
    };

    const nextQuestion = () => {
        currentQuestionNumber++;
        if (currentQuestionNumber < questions.length) {
            displayQuestion();
        } else {
            displayFinalResults();
        }
    };

    const displayFinalResults = () => {
        questionBlock.innerHTML = "";
        multipleChoices.innerHTML = "";
        questionNumberDisplay.textContent = "";
        timerDisplay.textContent = "";
    
        const friendSvg = friendCharacter.contentDocument;
    
        if (score === 6) {
            questionBlock.innerHTML = `<h2>Great Job! You have a new best friend!</h2>`;
            const arm1 = friendSvg.getElementById("arm1");
            const arm2 = friendSvg.getElementById("arm2");
            congratulations.play();
            if (arm1) arm1.classList.add("rotateArm1");
            if (arm2) arm2.classList.add("rotateArm2");
        } else {
            questionBlock.innerHTML = `<p class="betterLuck">You scored ${score}/6. Better Luck Next Time?</p>`;
            betterLuck.play();
        }
    };
    
    restartButton.addEventListener("click", () => {
        if (quizStarted) {
            location.reload();
        } else {
            restartButton.disabled = true; 
            restartButton.classList.add("noHover");
            startQuiz();
    
            // I disable the reset button for the first five seconds after starting the quiz.
            setTimeout(() => {
                restartButton.disabled = false;
                restartButton.classList.remove("noHover");
                document.getElementById("multipleChoices").classList.add("heightIncrease");
            }, 3000);
        }
    });

    fetchQuestions();
});
