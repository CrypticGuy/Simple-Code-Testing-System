// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { remote } = require('electron');
const { dialog } = require('electron').remote;
const fs = require('fs');
const process = require('process')
const path = require('path')
const { exec } = require("child_process");
const Prism = require('prismjs')
const loadLanguages = require('prismjs/components/');
//const fileHighlight = require('prismjs/plugins/file-highlight');
loadLanguages(['python', 'clike'])

var languageMapCompile = {
    ".cpp": "g++",
    ".py": "python3",
    ".c": "gcc",
    ".java": "javac"
}

var languageMapExecute = {
    ".cpp": "a.out",
    ".c": "a.out",
    ".java": "java",
    ".py": "python3"
}


var globalFilePath = "";
var testCodeFile = "testCase.txt";

function generateCommand(ext) {
    if (ext === ".py") {
        let commandToRun = [`python3 ${globalFilePath[0]} < ${path.join(__dirname, testCodeFile)}`];
        return commandToRun
    } else {
        let commandToCompile = `${languageMapCompile[ext]} ${globalFilePath[0]}`;
        if (ext === '.cpp' || ext === '.c') {
            var commandToExecute = `${path.dirname(globalFilePath[0])}/${languageMapExecute[ext]} < ${path.join(__dirname, testCodeFile)}`
        } else {
            var commandToExecute = `${languageMapExecute[ext]} ${globalFilePath[0]} < ${path.join(__dirname, testCodeFile)}`
        }
        return [commandToCompile, commandToExecute]
    }
        
}


(function() {
    var openFileBtn = document.getElementById("openFile")
    var runTestCaseBtn = document.getElementById("runTestCase")
    var mainCodeArea = document.getElementById("code")
    var testCaseArea = document.getElementById("testCase")
    var outputArea = document.getElementById("output")

    openFileBtn.addEventListener('click', () => {
        dialog.showOpenDialog(remote.getCurrentWindow(), {
            properties: ['openFile']
          }).then(result => {
            globalFilePath = result.filePaths
            console.log(globalFilePath)
            fs.readFile(result.filePaths[0], 'utf8', (err, data) => {
                if (err) throw err;
                mainCodeArea.innerHTML = data
                //console.log(mainCodeArea.innerHTML)
            });
          }).catch(err => {
            console.log(err)
          })
    })

    testCaseArea.addEventListener('input', () => {
        
        let textToWrite = testCaseArea.value
        console.log(`Text to write: ${textToWrite}`)
        fs.writeFile(path.join(__dirname, testCodeFile), textToWrite, (err) => {
            if (err) throw err
            console.log("file has been saved")
        })
    })

    runTestCaseBtn.addEventListener('click', () => {
        let commandToRun = generateCommand(path.extname(globalFilePath[0])) 
        if (commandToRun.length === 1) {
            exec(commandToRun[0], (error, stdout, stderr) => {
                if (error) {
                    outputArea.innerHTML = `error: ${error.message}`
                    return
                }
                if (stderr) {
                    outputArea.innerHTML = `stderr: ${stderr}`
                    return
                }
                outputArea.innerHTML = stdout
            });
        } else {
            exec(commandToRun[0], (error, stdout, stderr) => {
                if (error) {
                    outputArea.innerHTML = `error: ${error.message}`
                    return
                }
                if (stderr) {
                    outputArea.innerHTML = `stderr: ${stderr}`
                    return
                }
                exec(commandToRun[1], (error, stdout, stderr) => {
                    if (error) {
                        outputArea.innerHTML = `error: ${error.message}`
                        return
                    }
                    if (stderr) {
                        outputArea.innerHTML = `stderr: ${stderr}`
                        return
                    }
                    outputArea.innerHTML = stdout
                });
            });
        }
        
    })

})();