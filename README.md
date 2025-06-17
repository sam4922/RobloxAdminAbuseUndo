<h1 align="center">
  <br>
  Roblox AA Script Runner
  <br>
</h1>
<p align="center">
  
  <a href="https://badge.fury.io/js/electron-markdownify">
    <img src="https://badge.fury.io/js/electron-markdownify.svg"
         alt="Gitter">
  </a>
 
</p>


<h4 align="center">A Node.js script to manage Roblox group audit logs.</h4>

<p align="center">
  <a href="#getting-started">Getting Started</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a>
</p>

<p align="center">
  <img src="https://imgur.com/a/SkTWlJY" alt="screenshot">
</p>

## About The Project

This guide provides instructions on how to set up and run a Node.js script for interacting with Roblox groups using the `noblox.js` library. This script is designed to perform specific actions related to group audit logs.

### Built With
* [Node.js](https://nodejs.org/) - A JavaScript runtime environment.
* [noblox.js](https://noblox.js.org/) - A Node.js Roblox API wrapper.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

Follow these steps to get the script running on your local machine.

### Prerequisites

You'll need a few things installed and set up first:

1.  **A Text Editor:**
    * You need a program to edit the script file. Visual Studio Code is a great, free option.
    * **Download:** [Visual Studio Code](https://code.visualstudio.com/download)

2.  **Node.js and npm:**
    * This script runs on Node.js.
    * `npm` (Node Package Manager) is included with the Node.js installation.
    * **Download:** [Node.js](https://nodejs.org/en)
    * Verify the installation by opening your terminal or command prompt and running:
        ```bash
        node -v
        npm -v
        ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Installation

1.  **Create a Project Folder:**
    * Navigate to your `Downloads` folder (or any location of your choice).
    * Create a new folder and name it `AAScript`.

2.  **Create the JavaScript File:**
    * Open your text editor (e.g., Visual Studio Code).
    * Copy the JavaScript code provided below.
    * Save the file as `index1.js` inside your `AAScript` folder.

3.  **Open the Project in VS Code:**
    * In Visual Studio Code, go to `File` > `Open Folder`.
    * Select the `AAScript` folder you created.
    * If prompted, click "Yes, I trust the authors."

4.  **Install Dependencies via Command Prompt:**
    * Open Command Prompt (on Windows) or Terminal (on macOS/Linux).
    * You need to navigate to your project folder. The easiest way is to right-click on the `index1.js` file in VS Code's file explorer and select `Copy Path`.
    * In the command prompt, type `cd `, paste the path, and remove `\index1.js` from the end. It should look something like this:
        ```bash
        cd C:\Users\YourUser\Downloads\AAScript
        ```
    * Press Enter. Now, run the following commands one by one:
        ```bash
        npm install
        ```
        ```bash
        npm install noblox.js
        ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

1.  **Get Your Roblox Cookie:**
    * Go to [roblox.com](https://www.roblox.com) in your web browser and log in.
    * Right-click anywhere on the page and select `Inspect` or `Inspect Element`.
    * In the developer tools panel, find the `Application` tab (you may need to click `>>` to find it).
    * On the left side, under `Storage`, expand `Cookies` and select `https://www.roblox.com`.
    * Find the cookie named `.ROBLOSECURITY`.
    * Copy the entire value from the `Value` column. It is a long string that starts with `_|WARNING:-DO-NOT-SHARE-THIS...`. **Copy everything.**

2.  **Configure the Script:**
    * Go back to Visual Studio Code and open `index1.js`.
    * Find this section of the code:
        ```javascript
        async function authenticateAccount() {
            console.log("=====\nAuthenticating...");
            try {
                await noblox.setCookie('PUT YOUR COOKIE HERE'); // Your cookie here
        ```
    * Replace `PUT YOUR COOKIE HERE` with the cookie you just copied.
    * At the top of the file, change the values for `groupId`, `personDoingTheAbuse`, etc., as needed for your specific task.
        ```javascript
        const groupId = 33444525;
        const personDoingTheAbuse = 4293418353;
        const iterations = 100; // Increased iterations just in case
        const cutoffDateString = "2021-04-10T12:00:00.000Z"; // Use YYYY-MM-DD format for safety
        ```
    * Save the `index1.js` file (`Ctrl+S` or `Cmd+S`).

3.  **Run the Script:**
    * Return to your Command Prompt or Terminal window (which should still be in the `AAScript` directory).
    * Initialize a `package.json` file. This helps manage your project's dependencies.
        ```bash
        npm init -y
        ```
        > **Note**
        > You only need to run `npm init -y` once per project. It is not necessary to run it every time you change the script.
    * Execute the script using Node.js:
        ```bash
        node index1.js
        ```

You should now see the script running in your terminal. If you need to stop it, press `Ctrl+C`.

If you want to run the script for a different user or group, simply edit the `groupId` or `personDoingTheAbuse` variables in `index1.js`, save the file, and run `node index1.js` again.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
