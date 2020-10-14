const fetch = require('node-fetch'); // I need the fetch require to be able to consume the trivia api.
var cantidad = '10', categoria = '9', dificultad = 'medium'; // I declare and initialize the 3 variables that modify the url of the api and with it the game options.
const readLine = require('readline'); //module that allows you to read the data input by console.
const fs = require("fs"), NOMBRE_ARCHIVO = "scores"; //I need the require of fs to write and read the scores.
const scoresFile = 'scores'; // I declare and initialize scoresFile. The document to list the scores.
let dateTime = require('node-datetime'); //I need the require datetime to be able to use the module that returns the current date.
const chalk = require('chalk'); //I use the chalk module to color the data that comes out in the console.
let contadorPreguntas = 1; //I declare and initialize question counter to 1 because the game starts at the first question.
let score = 0; //I declare and initialize the score to 0.
let dt = dateTime.create(); //I declare and initialize variable to dateTime.
let formatted = dt.format('d-m-Y' + 'T' + 'H:M:S'); //I declare a variable to format the date/score.
let puntuaciones; //variable to store the first score.
let masPuntuaciones; //variable to store from the second score.

let interfaz = readLine.createInterface({ //this allows me to use keyboard input and output to console.
    input: process.stdin,
    output: process.stdout
});


lanzarMenu(dificultad, categoria, cantidad); //function that launches the main menu with the arguments I need to change.

// inside the function is the promise that allows me to consume the fetch. with the variables to enter as arguments and modify the url to change the game mode
function lanzarMenu(dificultad, categoria, cantidad) {
    var promesa = fetch('https://opentdb.com/api.php?amount=' + cantidad + '&category=' + categoria + '&difficulty=' + dificultad + '&type=multiple');
    interfaz.question(chalk.red.italic('\nWrite your option.\n')
        + chalk.yellow("1. Play\n")
        + chalk.blue("2. Scores\n")
        + chalk.magenta("3. Options\n")
        , function (eleccion) {


            //I open a switch with 3 options: Play, Scores and Options.
            switch (eleccion) {
                case '1':

                    //I indicate to the player the question number in which he is.
                    console.log(chalk.magenta('Question ' + contadorPreguntas));
                    console.log(chalk.gray('Difficulty: ' + dificultad), chalk.gray('Category: ' + categoria), chalk.gray('Amount: ' + cantidad));
                    //I have to rewrite the promise because the above is for the default game and this is for option modifications.
                    promesa.then(res => res.clone().json()).then((data) => { //<-- I use clone because the normal fetch promise can only be used once.
                        console.log(chalk.greenBright("Category: " + data.results[0].category + "\n")); //I show the category by selecting the first position of the json data results array.

                        console.log(chalk.yellowBright(data.results[0].question + "\n") //The same but to show a question.
                        );

                        //to facilitate handling I put the answers in variables.
                        let correcta = data.results[0].correct_answer //+' <-CORRECTA'; 
                        let incorrecta1 = data.results[0].incorrect_answers[0];
                        let incorrecta2 = data.results[0].incorrect_answers[1];
                        let incorrecta3 = data.results[0].incorrect_answers[2];

                        //I create an array to put all the answers.
                        let array = [correcta, incorrecta1, incorrecta2, incorrecta3];

                        //I declare a variable to store the array with the mixed responses.
                        var mezclado = array.sort(() => Math.random() - 0.5);
                        for (let i = 0; i < mezclado.length; i++) {
                            console.log(i + 1 + ". " + mezclado[i]);
                            //I show them and, taking advantage of the i of the for, I add 1 to assign them an index that is shown to their left.


                        }

                        // I use interfaz again to ask the user to choose one.
                        interfaz.question(''
                            , function (eleccion) {
                                // If 'eleccion' is equal to the index of the correct +1 (because the array starts at 0)
                                if (eleccion == (mezclado.indexOf(correcta) + 1)) {
                                    console.log(chalk.green.italic("\nCorrect!\n")); //Correct is displayed.
                                    score += 100 / parseInt(cantidad); //score is increased by the total percentage (100%) of the option chosen in options (or the default).
                                    var scoreDisplay = 'Score: ' + score + '%' //I store it formatted.
                                    console.log(chalk.blue(scoreDisplay)); //I show it to the user.

                                    lanzarPregunta(dificultad, categoria, cantidad); //The player got it right, so I launch a new question.

                                } else { //If the user fails.
                                    console.log(chalk.redBright('You lose!\n')); // I show "You lose".

                                    //I check if the plain text file exists.
                                    if (fs.existsSync(scoresFile)) {
                                        //I save the new score and pass it to string.
                                        masPuntuaciones = '\n' + formatted + ' ' + score.toString() + '%';
                                        //Then I include it in a new row of the plain text file.
                                        fs.appendFileSync(scoresFile, masPuntuaciones, (err) => {
                                        });
                                        console.log(chalk.greenBright('Score: ' + score + '%\n')); //I show it again.
                                        score = 0; //I reset the score to 0.
                                    } else {

                                        //If it doesn't exist.
                                        puntuaciones = formatted + ' ' + score.toString() + '%'; //If there is no formatting the score.
                                        fs.writeFileSync(scoresFile, puntuaciones); //I write it.
                                        console.log(chalk.greenBright('Score: ' + score + '%\n')); //And I show it.
                                        score = 0; //I reset the score to 0.
                                    }

                                    //I launch the main menu again.
                                    lanzarMenu(dificultad, categoria, cantidad);
                                }
                            });


                    });



                    break;
                case '2':

                    function pantallaScores() {

                        //I open the data entry so the user can go back to the main menu.
                        interfaz.question((chalk.blue('S C O R E S\n')) //<--
                            , function (back) {

                                if (back == 'b') {
                                    //If the user enters 'b' he returns to the main menu.
                                    lanzarMenu(dificultad, categoria, cantidad);
                                } else {
                                    //Otherwise the score screen is sent again.
                                    pantallaScores();
                                }
                            });

                            //
                        if (!(fs.existsSync(scoresFile))) { //If the plain text file does not exist, the message is displayed.
                            console.log(chalk.yellowBright('\nThere are no scores yet.' + chalk.italic.magenta('\nPress b to back.')));

                        } else {
                            //If it exists, it reads it and displays it on the console in yellow.
                            fs.readFile(NOMBRE_ARCHIVO, (error, datos) => { 

                                console.log('\n' + chalk.yellow(datos) + chalk.italic.magenta('\nPress b to back.'));
                            });
                        }
                    }

                    pantallaScores();



                    break;

                case '3':
                    pantallaOpciones();
                    function pantallaOpciones() {
                        console.log(chalk.magenta('O P T I O N S'));

                        interfaz.question(chalk.red.italic('\nWrite your option.\n')
                            + chalk.yellow("1. Difficulty\n")
                            + chalk.blue("2. Questions amount\n")
                            + chalk.magenta("3. Category\n")
                            , function (selecOpc) {



                                switch (selecOpc) {


                                    case '1':
                                        pantallaDificultad();
                                        function pantallaDificultad() {
                                            interfaz.question(chalk.magenta('Difficulty\n')
                                                + chalk.green("1. Easy\n")
                                                + chalk.yellow("2. Medium\n")
                                                + chalk.red("3. Hard\n")
                                                , function (selecDif) {
                                                    if (selecDif == 1) {
                                                        dificultad = 'easy';
                                                        lanzarMenu(dificultad, categoria, cantidad);

                                                    } else if (selecDif == 2) {
                                                        dificultad = 'medium';
                                                        lanzarMenu(dificultad, categoria, cantidad);

                                                    } else if (selecDif == 3) {
                                                        dificultad = 'hard';
                                                        lanzarMenu(dificultad, categoria, cantidad);

                                                    } else {
                                                        console.log(chalk.red.italic('press choose 1, 2 or 3.'));
                                                        pantallaDificultad();
                                                    }




                                                });
                                        }

                                        break;
                                    case '2':
                                        pantallaCantidad();
                                        function pantallaCantidad() {
                                            interfaz.question(chalk.magenta('Questions amount\n')
                                                + chalk.green("1. 3 questions.\n")
                                                + chalk.yellow("2. 5 questions.\n")
                                                + chalk.red("3. 10  questions.\n")
                                                , function (selecCant) {
                                                    if (selecCant == 1) {
                                                        var cantidad = '3';
                                                        lanzarMenu(dificultad, categoria, cantidad);

                                                    } else if (selecCant == 2) {
                                                        var cantidad = '5';
                                                        lanzarMenu(dificultad, categoria, cantidad);

                                                    } else if (selecCant == 3) {
                                                        var cantidad = '10';
                                                        lanzarMenu(dificultad, categoria, cantidad);

                                                    } else {
                                                        //Error control with message for the user.
                                                        console.log(chalk.red.italic('press choose 1, 2 or 3.'));
                                                        //return to the same screen.
                                                        pantallaCantidad();
                                                    }




                                                });
                                        }

                                        break;

                                    case '3':
                                        pantallaCategoria();
                                        function pantallaCategoria() {
                                            interfaz.question(chalk.magenta('Category\n')
                                                + chalk.green("1. General knowledge.\n")
                                                + chalk.yellow("2. Film.\n")
                                                + chalk.red("3. Video games.\n")
                                                , function (selecCateg) {
                                                    if (selecCateg == 1) {
                                                        var categoria = '9';

                                                        lanzarMenu(dificultad, categoria, cantidad);



                                                    } else if (selecCateg == 2) {
                                                        var categoria = '11';


                                                        lanzarMenu(dificultad, categoria, cantidad);

                                                    } else if (selecCateg == 3) {
                                                        var categoria = '15';

                                                        lanzarMenu(dificultad, categoria, cantidad);


                                                    } else {
                                                        //Error control with message for the user.
                                                        console.log(chalk.red.italic('Invalid option, please write 1, 2 or 3.'));
                                                        //return to the same screen.
                                                        pantallaCategoria();

                                                    }




                                                });


                                        }




                                        break;
                                    default:
                                        //Error control with message for the user.
                                        console.log(chalk.bold.red('Invalid option, please write 1, 2 or 3.'));
                                        //return to the same screen.
                                        pantallaOpciones();



                                }

                            });
                    }
                    break;


                default:
                    console.log(chalk.bold.red('Invalid option, please write 1, 2 or 3.'));
                    lanzarMenu(dificultad, categoria, cantidad);


            };

        });
};

function lanzarPregunta(dificultad, categoria, cantidad) {
    contadorPreguntas++;
    console.log(chalk.magenta('QUESTION ' + contadorPreguntas));
    console.log(chalk.gray('Difficulty: ' + dificultad), chalk.gray('Category: ' + categoria), chalk.gray('Amount: ' + cantidad));
    var promesa = fetch('https://opentdb.com/api.php?amount=' + cantidad + '&category=' + categoria + '&difficulty=' + dificultad + '&type=multiple');

    promesa.then(res => res.clone().json()).then((data) => {
        console.log(chalk.greenBright("Category: " + data.results[0].category + "\n"));
        console.log(chalk.yellowBright(data.results[0].question + "\n")
        );

        let correcta = data.results[0].correct_answer//+' <-CORRECTA';
        let incorrecta1 = data.results[0].incorrect_answers[0];
        let incorrecta2 = data.results[0].incorrect_answers[1];
        let incorrecta3 = data.results[0].incorrect_answers[2];

        let array = [correcta, incorrecta1, incorrecta2, incorrecta3];


        var mezclado = array.sort(() => Math.random() - 0.5);
        for (let i = 0; i < mezclado.length; i++) {
            console.log(i + 1 + ". " + mezclado[i]);



        }



        interfaz.question(''
            , function (eleccion) {
                if (eleccion == (mezclado.indexOf(correcta) + 1)) {
                    console.log(chalk.green.italic("\nCorrect!\n"));

                    score += 100 / parseInt(cantidad);
                    var scoreDisplay = 'Score: ' + score + '%'
                    console.log(chalk.blue(scoreDisplay));
                    if (contadorPreguntas == cantidad) {
                        var figlet = require('figlet');

                        figlet('YOU WIN', function (err, data) {
                            if (err) {
                                console.log('error de texto...');
                                console.dir(err);
                                return;
                            }
                            console.log(data)
                        });
                    } else {
                        lanzarPregunta(dificultad, categoria, cantidad);
                    }

                } else {
                    console.log(chalk.redBright('YOU LOSE!\n'));
                    if (fs.existsSync(scoresFile)) {
                        let masPuntuaciones = '\n' + formatted + ' ' + score.toString() + '%';
                        fs.appendFileSync(scoresFile, masPuntuaciones, (err) => {
                        });
                        console.log(chalk.greenBright('Score: ' + score + '%\n'));
                        score = 0;
                    } else {
                        let puntuaciones = formatted + ' ' + score.toString() + '%';
                        fs.writeFileSync(scoresFile, puntuaciones);
                        console.log(chalk.greenBright('Score: ' + score + '%\n'));
                        score = 0;
                    }

                    lanzarMenu(dificultad, categoria, cantidad);
                }
            });


    });

}











