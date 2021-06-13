const fs = require("fs");
const path = require("path");
const { clipboard } = require("electron");
const { app, dialog } = require("electron").remote;
const {
    locationListItem,
    bookmarkListItem,
    historyListItem,
    fileInfoOnHover,
    handleContextMenu,
} = require("./public/templates");
// const userData = fs.readFileSync(app.getPath("appdata"));
const openInReaderBtn = $(".open-in-reader-btn");
const inputForm = document.querySelector("#locationInput");
function removeBM(item) {
    let index = item.parent().attr("data-list-index");
}
//get manga path sync
let mangaPath = localStorage.getItem("defaultPath");
if (mangaPath === null) {
    let res = dialog.showMessageBoxSync({
        type: "error",
        message: "No default location found.\nSelect new location.",
        buttons: ["OK"],
    });
    if (res === 0) promptSetDefaultLocation();
}
handleContextMenu();
//set default location button
document.querySelector("#setDefault").onclick = () =>
    promptSetDefaultLocation();
//prompt to set default location
function promptSetDefaultLocation() {
    let abc = dialog.showOpenDialogSync({
        properties: ["openFile", "openDirectory"],
    });
    if (abc === undefined && mangaPath === null) {
        let res = dialog.showMessageBoxSync({
            type: "error",
            message: "No folder selected.\nSelect again?",
            buttons: ["Yes", "Cancel"],
        });
        if (res === 0) {
            promptSetDefaultLocation();
        }
        return;
    } else if (abc) {
        mangaPath = path.normalize(abc[0] + "\\");
        localStorage.setItem("defaultPath", mangaPath);
        console.log({ mangaPath: mangaPath });
        addToLocationList(mangaPath);
    }
}

//historylist
let historyPaths = JSON.parse(localStorage.getItem("historyPaths")) || [];
console.log(historyPaths);
(function () {
    historyPaths.forEach((e) => {
        $("#historyTab .location-cont ol").append(
            historyListItem(e, path.normalize(e.link))
        );
    });
})();
//bookmarkist
let bookmarkPaths = JSON.parse(localStorage.getItem("bookmarkPaths")) || [];
(function () {
    bookmarkPaths.forEach((e) => {
        $("#bookmarksTab .location-cont ol").append(
            bookmarkListItem(e, path.normalize(e.link))
        );
    });
})();

addToLocationList(mangaPath);
function addToLocationList(link) {
    link = path.normalize(link);
    inputForm.value = "";
    fs.readdir(link, "utf-8", (err, data) => {
        let suggestionsText = "";
        if (err) {
            console.error(err);
            return;
        }
        let historyPathsLinks = historyPaths.map((e) => e.link);
        // console.log(historyPathsLinks);
        data.forEach((e) => {
            alreadyRead = false;
            if (historyPathsLinks.includes(path.normalize(link + e + "/"))) {
                alreadyRead = true;
            }
            suggestionsText += locationListItem(e, link, alreadyRead);
        });
        document.querySelector(
            "#locationsTab > div.location-cont"
        ).innerHTML = `<ol>${suggestionsText}</ol>`;
    });
}
function putIntoInput(name, link) {
    link = path.normalize(link);
    document.querySelector("#locationInput").value += name + "/";
    getNextList(link);
}
async function getNextList(link) {
    link = path.normalize(link);
    fs.readdir(link, "utf-8", (err, data) => {
        let suggestionsText = "";
        data = data.sort((a, b) => {
            console.log(a, b);

            num1 = a
                .toString()
                .replace(/([a-z]|\,|\(|\)|\-|_)/gi, "")
                .split(" ")
                .filter((e) => e != "")[0];
            num2 = b
                .toString()
                .replace(/([a-z]|\,|\(|\)|\-|_)/gi, "")
                .split(" ")
                .filter((e) => e != "")[0];
            if (num1 === ".") {
                num1 = a
                    .toString()
                    .replace(/([a-z]|\,|\(|\)|\-|_)/gi, "")
                    .split(" ")[1];
            }
            if (num2 === ".") {
                num2 = a
                    .toString()
                    .replace(/([a-z]|\,|\(|\)|\-|_)/gi, "")
                    .split(" ")[1];
            }
            console.log(num1, num2);
            return parseFloat(num1) - parseFloat(num2);
        });
        console.log(data);
        if (err) return console.error(err);
        let historyPathsLinks = historyPaths.map((e) => e.link);

        data.forEach((e) => {
            alreadyRead = false;
            if (historyPathsLinks.includes(path.normalize(link + e + "/"))) {
                alreadyRead = true;
            }
            suggestionsText += locationListItem(e, link, alreadyRead);
        });
        document.querySelector(
            "#locationsTab > div.location-cont"
        ).innerHTML = `<ol>${suggestionsText}</ol>`;
    });
}
(function () {
    // inputForm.onfocus = () => {
    //     inputForm.selectionStart = inputForm.value.length;
    //     inputForm.select();
    // };
    inputForm.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === "/") {
            let link = inputForm.value;
            getNextList(mangaPath + link + "/");
        }
    };
})();
let currentLink;
function makeImg(link) {
    link = link + "\\";
    link = path.normalize(link);
    try {
        let files = fs.readdirSync(link, "utf8");
    } catch (err) {
        dialog.showMessageBox({
            type: "error",
            title: "not a folder",
            message: err.message,
        });
        return;
    }
    currentLink = link;
    let files = fs.readdirSync(link, "utf8");
    let supportedExt = [".jpg", ".jpeg", ".png", ".gif", ".webg"];
    let invalidText = "";
    console.log(link);
    let imgs = files
        .map((file) => {
            if (supportedExt.includes(path.extname(file))) {
                return {
                    name: file,
                    ext: path
                        .extname(file)
                        .substring(1, path.extname(file).length),
                };
            }
            if (path.extname(file) !== "") {
                invalidText += `\tfile not supported: ${file}\n`;
                return;
            }
            if (path.extname(file) === "") {
                invalidText += ` `;
            }
        })
        .filter((file) => file !== undefined);
    if (invalidText.length > 1) {
        dialog.showMessageBox({
            title: "File not supported",
            type: "error",
            message: "Invalid Files:\n" + invalidText,
        });
    }
    if (imgs.length === 0) {
        dialog.showMessageBox({
            type: "error",
            title: "no image were found",
            message: "no image were found",
        });
    }
    let pagenum = 0;
    imgs.forEach((img) => {
        pagenum++;
        let imgData = fs.readFileSync(link + img.name).toString("base64");
        let out = `<img src="data:image/${img.ext};base64, ${imgData}" data-pageNum="${pagenum}"/>`;
        $("#reader .imgCont").append(out);
    });
    let name = link
        .split("/")
        .join("\\")
        .split("\\")
        .filter((i) => {
            if (i !== "") {
                return i;
            }
        });
    let mangaName = name[name.length - 2];
    let chapterName = name[name.length - 1];
    document.querySelector(
        "#reader > nav > div.title-info > h1.mangaName"
    ).innerHTML = mangaName;
    document.querySelector(
        "#reader > nav > div.title-info > h1.chapterName"
    ).innerHTML = chapterName;
    let abc = {
        mangaName: mangaName,
        chapterName: chapterName,
        link: link,
        date: new Date().toLocaleString(),
        pages: pagenum,
    };
    historyPaths.unshift(abc);
    localStorage.setItem("historyPaths", JSON.stringify(historyPaths));
    $("#landingPage").hide();
    $("#reader").show();
}
//go back btn
$("#goback").click(() => {
    addToLocationList(mangaPath);
});

$("#bookmark-btn").click(() => {
    addToBookmarksList(currentLink);
});
function addToBookmarksList(link) {
    link = path.normalize(link);
    let name = link
        .split("/")
        .join("\\")
        .split("\\")
        .filter((i) => {
            if (i !== "") {
                return i;
            }
        });
    let mangaName = name[name.length - 2];
    let chapterName = name[name.length - 1];
    let newBM = {
        mangaName: mangaName,
        chapterName: chapterName,
        link: path.normalize(link),
        date: new Date().toLocaleString(),
        pages: $("#reader .imgCont").children("img").length,
    };
    bookmarkPaths.unshift(newBM);
    $("#bookmarksTab .location-cont ol").prepend(
        bookmarkListItem(newBM, path.normalize(link))
    );
    localStorage.setItem("bookmarkPaths", JSON.stringify(bookmarkPaths));
}

//remove bookmark
function removeBookmark(item, link) {
    item.remove();
    link = path.normalize(link);
    console.log(item, link);
    bookmarkPaths = bookmarkPaths.filter((item) => item.link !== link);
    localStorage.setItem("bookmarkPaths", JSON.stringify(bookmarkPaths));
}
