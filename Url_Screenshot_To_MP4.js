//BIGVU Task 1 Project - Eliran Gabay
const http = require("http");
const fs = require("fs");
const Pageres = require("pageres");

const hostname = "localhost";
const port = 8100;

const server = http
  //creates web server
  .createServer((req, res) => {
    if (req.url === "/favicon.ico") {
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write("<h1>Create MP4 Video from Website Url<h1>");
      res.write("The Server Run....." + "<br/>");
      program();
      res.end();
    }
  })
  .listen(port);
console.log(`Server running at http://${hostname}:${port}/`);

async function program() {
  //async func program -
  //runs the program func after func by waiting for the previous func to end
  await clearFiles();
  await screenshotUrl();
  await checkFileExist(process.cwd() + "\\urlImage.png");
  await PNG_Convert_MP4();
  await checkFileExist(process.cwd() + "\\video.mp4");
  writeToJSONFile();
}

function PNG_Convert_MP4() {
  //creates 10 seconds PM4 video using videoshow library
  var videoshow = require("videoshow");
  var image = [{ path: process.cwd() + "\\urlImage.png" }];
  var videoOptions = {
    fps: 25,
    loop: 10, // seconds
    transition: true,
    transitionDuration: 1, // seconds
    videoBitrate: 1024,
    videoCodec: "libx264",
    size: "640x?",
    audioBitrate: "128k",
    audioChannels: 2,
    format: "mp4",
    pixelFormat: "yuv420p",
  };
  videoshow(image, videoOptions)
    .audio(null)
    .save("video.mp4")
    .on("error", function (err, stdout, stderr) {
      console.error("Error:", err);
      console.error("ffmpeg stderr:", stderr);
    });
  return new Promise((resolve) => {
    console.log("MP4 video create...");
    resolve();
  });
}

function screenshotUrl() {
  //read url input json file
  let url = JSON.parse(fs.readFileSync("./input.json", "utf8"));
  console.log("get url from json file - url:" + url.url);
  //take screenshot from website and save in project folder using Pageres library
  new Pageres()
    .src("https://" + url.url, ["1920x1080"], { filename: "urlImage" })
    .dest(process.cwd())
    .run();
  return new Promise((resolve) => {
    console.log("Finished generating screenshots! from website: " + url.url);
    resolve();
  });
}

async function checkFileExist(path) {
  //checking if file exist
  await fs.promises
    .access(path, fs.constants.W_OK)
    .then(() => {
      return new Promise((resolve) => {
        resolve();
      });
    })
    .catch(() => checkFileExist(path));
}

function writeToJSONFile() {
  //write to output json file - in project folder
  var pathFile = {
    file: process.cwd() + "\\video.mp4",
  };
  let data = JSON.stringify(pathFile, null, 2);
  fs.writeFile("output.json", data, (err) => {
    if (err) throw err;
    console.log("file url written to output.json");
    console.log("the program has finished disconnecting from the server...");
    setTimeout(function () {
      return process.exit(1);
    }, 5000);
  });
}

async function clearFiles() {
  //  remove a files - video.mp4,urlImage.png - after start
  try {
    await fs.promises
      .access(process.cwd() + "\\video.mp4", fs.constants.W_OK)
      .then(() => {
        fs.unlinkSync(process.cwd() + "\\video.mp4");
      });
  } catch (error) {}
  try {
    await fs.promises
      .access(process.cwd() + "\\urlImage.png", fs.constants.W_OK)
      .then(() => {
        fs.unlinkSync(process.cwd() + "\\urlImage.png");
      });
  } catch (error) {}
}
