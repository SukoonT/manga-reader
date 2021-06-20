const fs = require("fs");
// !!!
// !!! remove exports from last time in js file
// !!!
// const path = require("path");
//@ts-ignore
const { clipboard, ipcRenderer, shell } = require("electron");
//@ts-ignore
const { app, dialog } = require("@electron/remote");
const openInReaderBtn = $(".open-in-reader-btn");
const inputForm = document.querySelector("#locationInput");
(function consolelogintro() {
    console.log("Manga Reader Version : " + require("@electron/remote").app.getVersion());
    console.log(`
If you encounter any problem mail me at sukoonkumar2@gmail.com

keyboard shortcuts:-

"wsad and arrow keys"   : scroll
" - and = and + "       : size
"spacebar"              : big scroll
"h"                     : home
"f"                     : go to page
"f1"                    : github page
"< and >"               : next/prev
"Enter or /"            : focus input box(home page only)

move mouse to left edge for list while in reader.

    `);
})();
// app control buttons
$("#closeBtn").click(() => {
    ipcRenderer.send("closeApp");
});
$("#minimizeBtn").click(() => {
    ipcRenderer.send("minimizeApp");
});
$("#maximizeRestoreBtn").click(() => {
    ipcRenderer.send("maximizeRestoreApp");
});
const changeMaxResBtn = (isMaximized) => {
    if (isMaximized) {
        $("#maximizeRestoreBtn")
            .attr("title", "Restore")
            .html(`<i class="far fa-window-restore"></i>`);
    }
    else {
        $("#maximizeRestoreBtn")
            .attr("title", "Maximize")
            .html(`<i class="far fa-window-maximize"></i>`);
    }
};
ipcRenderer.on("isMaximized", () => {
    changeMaxResBtn(true);
});
ipcRenderer.on("isRestored", () => {
    changeMaxResBtn(false);
});
//readerWidth
let readerWidth = parseFloat(localStorage.getItem("readerWidth")) || 50;
//get manga path sync
let mangaPath = localStorage.getItem("defaultPath");
if (mangaPath === null) {
    let res = dialog.showMessageBoxSync({
        type: "error",
        message: "No default location found.\nSelect new location.",
        buttons: ["OK"],
    });
    if (res === 0)
        promptSetDefaultLocation();
}
handleContextMenu();
//set default location button
document.querySelector("#setDefault").addEventListener("click", () => {
    promptSetDefaultLocation();
});
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
    }
    else if (abc) {
        mangaPath = path.normalize(abc[0] + "\\");
        localStorage.setItem("defaultPath", mangaPath);
        addToLocationList(mangaPath);
    }
}
//historylist
let historyPaths = (localStorage.getItem("historyPaths") === ""
    ? []
    : JSON.parse(localStorage.getItem("historyPaths"))) || [];
(function () {
    if (historyPaths.length === 0) {
        $("#historyTab .location-cont").html(`<p>No items</p>`);
        return;
    }
    historyPaths.forEach((e) => {
        $("#historyTab .location-cont ol").append(historyListItem(e));
    });
})();
//bookmarkist
let bookmarkPaths = JSON.parse(localStorage.getItem("bookmarkPaths")) || [];
(function () {
    if (bookmarkPaths.length === 0) {
        $("#bookmarksTab .location-cont").html(`<p>No items</p>`);
        return;
    }
    bookmarkPaths.forEach((e) => {
        $("#bookmarksTab .location-cont ol").append(bookmarkListItem(e));
    });
})();
let currentList = [];
let parentLink;
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
        currentList = data;
        let historyPathsLinks = historyPaths.map((e) => e.link);
        data.forEach((e) => {
            let alreadyRead = false;
            if (historyPathsLinks.includes(path.normalize(link + e + "/"))) {
                alreadyRead = true;
            }
            suggestionsText += locationListItem(e, link, alreadyRead);
        });
        document.querySelector("#locationsTab > div.location-cont").innerHTML = `<ol>${suggestionsText}</ol>`;
    });
}
// ! removed async;
function getNextList(link) {
    link = path.normalize(link);
    fs.readdir(link, "utf-8", (err, data) => {
        let suggestionsText = "";
        currentList = data;
        data = data.sort((a, b) => {
            let num1 = a
                .toString()
                .replace(/([a-z]|\,|\(|\)|\-|_)/gi, "")
                .split(" ")
                .filter((e) => e != "")[0];
            let num2 = b
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
            return parseFloat(num1) - parseFloat(num2);
        });
        if (err)
            return console.error(err);
        let historyPathsLinks = historyPaths.map((e) => e.link);
        data.forEach((e) => {
            let alreadyRead = false;
            if (historyPathsLinks.includes(path.normalize(link + e + "/"))) {
                alreadyRead = true;
            }
            suggestionsText += locationListItem(e, link, alreadyRead);
        });
        document.querySelector("#locationsTab > div.location-cont").innerHTML = `<ol>${suggestionsText}</ol>`;
    });
}
function putIntoInput(name, link) {
    link = path.normalize(link);
    inputForm.value = "";
    inputForm.value += name + "/";
    getNextList(link);
}
// find on input
(function () {
    inputForm.onfocus = () => {
        inputForm.select();
    };
    inputForm.oninput = () => {
        if (inputForm.value === "") {
            getNextList(mangaPath + "/");
        }
        let valueraw = inputForm.value.toLowerCase().split("/");
        let value = inputForm.value.toLowerCase().split("/")[valueraw.length - 1];
        let regex = new RegExp(value, "gi");
        currentList.forEach((e) => {
            if (inputForm.value !== "" && !e.toLowerCase().includes(value)) {
                $('#locationsTab a[data-name="' + e + '"]')
                    .parent()
                    .hide();
                return;
            }
            $('#locationsTab a[data-name="' + e + '"]')
                .parent()
                .show();
        });
    };
    inputForm.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === "/") {
            let link = inputForm.value;
            getNextList(mangaPath + link + "/");
        }
    };
    $("#locationInput2").on("input", () => {
        let valueraw = $("#locationInput2")[0].value
            .toLowerCase()
            .split("/");
        let value = $("#locationInput2")[0].value
            .toLowerCase()
            .split("/")[valueraw.length - 1];
        let regex = new RegExp(value, "gi");
        currentList.forEach((e) => {
            //(<HTMLInputElement>$("#locationInput2")[0]).value !== "" &&
            if (!e.toLowerCase().includes(value)) {
                $('.currentMangaList a[data-name="' + e + '"]')
                    .parent()
                    .hide();
                return;
            }
            $('.currentMangaList a[data-name="' + e + '"]')
                .parent()
                .show();
        });
    });
})();
let currentLink;
let prevLink;
let nextLink;
let currentPage;
let isCurrentMangaList = false;
let readerOpen = false;
function makeImg(link) {
    link = link + "\\";
    link = path.normalize(link);
    try {
        let files = fs.readdirSync(link, "utf8");
    }
    catch (err) {
        dialog.showMessageBox({
            type: "error",
            title: "not a folder",
            message: err.message,
        });
        return;
    }
    currentLink = link;
    parentLink = link.split("\\").filter((e) => e != "");
    parentLink.pop();
    parentLink = path.normalize(parentLink.join("\\"));
    let files = fs.readdirSync(link, "utf8");
    let supportedExt = [".jpg", ".jpeg", ".png", ".gif", ".webg"];
    let invalidText = "";
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
            invalidText += `\tfile not supported: ${link + file}\n`;
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
        return;
    }
    getNextList(parentLink);
    $("#loadingScreen ").css({ display: "grid" });
    $("#loadingScreen .loadingBarCont .loadingbar").css("width", "0");
    $("#landingPage").hide();
    let pagenum = 0;
    let percentPerImg = 100 / imgs.length;
    let loaderWidth = 0;
    $("#reader .imgCont").html("");
    setTimeout(() => {
        imgs.forEach((img) => {
            pagenum++;
            loaderWidth += percentPerImg;
            $("#loadingScreen .loadingBarCont .loadingbar").css("width", loaderWidth + "%");
            // let imgData :string= fs.readFileSync(link + img.name).toString("base64");
            // let out:string = `<img src="data:image/${img.ext};base64, ${imgData}" data-pageNum="${pagenum}"/ title="${img.name}">`;
            let out = `<img src="${link + img.name}" data-pageNum="${pagenum}" title="${img.name}" style="width:${readerWidth}%">`;
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
        let title = `${mangaName} - ${chapterName}`;
        if (title.length >= 55 && window.innerWidth <= 1100) {
            $("#topBar .titleBar .title").html(title.substring(0, 40) + "...");
        }
        else {
            $("#topBar .titleBar .title").html(title);
        }
        $("#topBar .titleBar .title").attr("title", title);
        let abc = {
            mangaName: mangaName,
            chapterName: chapterName,
            link: link,
            date: new Date().toLocaleString(),
            pages: pagenum,
        };
        // change page number on top;
        currentPage = 1;
        $("#NavigateToPageInput").val(currentPage);
        $("#pageNumbers .totalPage").text("/" + pagenum);
        historyPaths.unshift(abc);
        historyPaths.length =
            historyPaths.length < 60 ? historyPaths.length : 60;
        localStorage.setItem("historyPaths", JSON.stringify(historyPaths));
        $("#reader").show();
        readerOpen = true;
        $("#pageNumbers").css({ visibility: "visible" });
        setTimeout(() => {
            $("#loadingScreen ").hide();
            // make side list
            // if (!isCurrentMangaList) {
            let historyPathsLinks = historyPaths.map((e) => e.link);
            $(".currentMangaList .location-cont ol").html(" ");
            currentList.forEach((e) => {
                let alreadyRead = false;
                if (historyPathsLinks.includes(path.normalize(path.join(parentLink, e, "\\")))) {
                    alreadyRead = true;
                }
                let imgLength = fs
                    .readdirSync(path.normalize(path.join(parentLink, e, "\\")), "utf8")
                    .filter((e) => {
                    if (supportedExt.includes(path.extname(e)))
                        return e;
                });
                let imgItem = {
                    mangaName: mangaName,
                    chapterName: e,
                    link: path.normalize(path.join(parentLink, e, "\\")),
                    pages: imgLength.length,
                };
                $(".currentMangaList .location-cont ol").append(readerListItem(imgItem, alreadyRead));
            });
            isCurrentMangaList = true;
            // }
            prevLink = $(".currentMangaList .location-cont ol li a[data-link='" +
                currentLink.replace(/\\/g, "\\\\") +
                "']")
                .parent()
                .prev()
                .find("a")
                .attr("data-link");
            nextLink = $(".currentMangaList .location-cont ol li a[data-link='" +
                currentLink.replace(/\\/g, "\\\\") +
                "']")
                .parent()
                .next()
                .find("a")
                .attr("data-link");
        }, 400);
    }, 100);
}
//shorten name when window small
$(window).on("resize", () => {
    if ($("#topBar .titleBar .title").text().length >= 55 &&
        window.innerWidth <= 1100) {
        $("#topBar .titleBar .githubbtn").css({
            marginRight: "calc(var(--button-width) * 2)",
        });
        $("#topBar .titleBar .title").text($("#topBar .titleBar .title").text().substring(0, 40) + "...");
    }
    else if (window.innerWidth > 1100) {
        $("#topBar .titleBar .title").text($("#topBar .titleBar .title").attr("title"));
    }
    //page number
    currentPage = parseInt($(document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 3)).attr("data-pagenum"));
});
// //go back btn
// !removed
// $("#goback").click(() => {
//     addToLocationList(mangaPath);
// });
$("#ctrl-menu-bookmark").on("click", () => {
    addToBookmarksList(currentLink);
});
function addToBookmarksList(link) {
    link = path.normalize(link);
    if (bookmarkPaths.map((e) => e.link).includes(link)) {
        dialog.showErrorBox("already exist in bookmarks", "");
        return;
    }
    let name = link
        .split("/")
        .join("\\")
        .split("\\")
        .filter((i) => {
        if (i !== "") {
            return i;
        }
    });
    let totalPages = $("#reader .imgCont").children("img").length;
    if (totalPages === 0) {
        totalPages = fs.readdirSync(link, "utf8").length;
    }
    let mangaName = name[name.length - 2];
    let chapterName = name[name.length - 1];
    let newBM = {
        mangaName: mangaName,
        chapterName: chapterName,
        link: path.normalize(link),
        date: new Date().toLocaleString(),
        pages: totalPages,
    };
    bookmarkPaths.unshift(newBM);
    $("#bookmarksTab .location-cont ol").prepend(bookmarkListItem(newBM));
    localStorage.setItem("bookmarkPaths", JSON.stringify(bookmarkPaths));
}
//remove bookmark
function removeBookmark(item, link) {
    let sure = dialog.showMessageBoxSync({
        type: "warning",
        message: "are you sure you want to remove bookmark?",
        buttons: ["yes", "no"],
    });
    if (sure === 0) {
        item.remove();
        link = path.normalize(link);
        bookmarkPaths = bookmarkPaths.filter((item) => item.link !== link);
        localStorage.setItem("bookmarkPaths", JSON.stringify(bookmarkPaths));
    }
}
// control bar
// size control
$("#ctrl-menu-minus").on("click", () => {
    decImgSize();
});
$("#ctrl-menu-plus").on("click", () => {
    incImgSize();
});
const decImgSize = () => {
    readerWidth -= 5;
    readerWidth = readerWidth < 20 ? 20 : readerWidth;
    $("#reader .imgCont img").css("width", readerWidth + "%");
    $("#reader").css({ scrollBehavior: "auto" });
    $('#reader .imgCont img[data-pagenum="' + currentPage + '"]')[0].scrollIntoView();
    $("#reader").css({ scrollBehavior: "smooth" });
    if (!disablePageNumChange)
        displayPageNumber();
};
const incImgSize = () => {
    readerWidth += 5;
    readerWidth = readerWidth > 100 ? 100 : readerWidth;
    $("#reader .imgCont img").css("width", readerWidth + "%");
    $("#reader").css({ scrollBehavior: "auto" });
    $('#reader .imgCont img[data-pagenum="' + currentPage + '"]')[0].scrollIntoView();
    $("#reader").css({ scrollBehavior: "smooth" });
    if (!disablePageNumChange)
        displayPageNumber();
};
// page number
const displayPageNumber = () => {
    if ($("#reader .imgCont img").length > 0) {
        currentPage = parseInt($(document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 4)).attr("data-pagenum"));
        $("#NavigateToPageInput").val(currentPage);
        return;
    }
};
let disablePageNumChange = false;
$("#reader").on("scroll", () => {
    if (!disablePageNumChange)
        displayPageNumber();
});
$("#ctrl-menu-next").on("click", () => {
    openNextChapter();
});
function openNextChapter() {
    if (!nextLink)
        return dialog.showErrorBox("Error", "This chapter was last");
    $("#reader .imgCont").html("");
    makeImg(nextLink);
}
$("#ctrl-menu-prev").on("click", () => {
    openPrevChapter();
});
function openPrevChapter() {
    if (!prevLink)
        return dialog.showErrorBox("Error", "This chapter was first");
    $("#reader .imgCont").html("");
    makeImg(prevLink);
}
$("#NavigateToPageInput").on("focus", () => {
    $("#NavigateToPageInput").trigger("select");
    $("#NavigateToPageInput").on("keyup", (e) => {
        if (/[0-9]/gi.test(e.key) || e.key == "Backspace") {
            //@ts-ignore
            let pagenum = parseInt($("#NavigateToPageInput").val());
            if (!pagenum ||
                pagenum > $("#reader .imgCont img").length ||
                pagenum === undefined) {
                return;
            }
            let img = $('#reader .imgCont img[data-pagenum="' + pagenum + '"]');
            disablePageNumChange = true;
            img[0].scrollIntoView({ behavior: "smooth" });
        }
        if (e.key == "Enter" || e.key == "Escape") {
            $("#NavigateToPageInput").trigger("blur");
            disablePageNumChange = false;
        }
    });
    $("#NavigateToPageInput").val(currentPage);
});
$("#NavigateToPageInput").on("blur", () => {
    disablePageNumChange = false;
});
const clearHistory = () => {
    let sure = dialog.showMessageBoxSync({
        type: "warning",
        message: "are you sure you want to clear history?",
        buttons: ["yes", "no"],
    });
    if (sure === 0) {
        historyPaths = [];
        localStorage.setItem("historyPaths", JSON.stringify(historyPaths));
        $("#historyTab .location-cont").html(`<p>No items</p>`);
    }
};
// keyboard shortcuts
$(document).on("keydown", (e) => {
    if (e.key === "Enter" || e.key === "/") {
        e.preventDefault();
        inputForm.focus();
    }
    if (readerOpen && document.activeElement.tagName === "BODY") {
        if (e.key === "f") {
            e.preventDefault();
            $("#pageNumbers #NavigateToPageInput").trigger("focus");
        }
        if (e.key === ".") {
            //>
            e.preventDefault();
            openNextChapter();
        }
        if (e.key === ",") {
            //<
            e.preventDefault();
            openPrevChapter();
        }
        if (e.key === "h") {
            //refresh / home
            e.preventDefault();
            location.reload();
        }
        if (e.key === "b") {
            //bookmark
            e.preventDefault();
            addToBookmarksList(currentLink);
        }
        if (e.key === "+" || e.key === "=") {
            //size plus
            e.preventDefault();
            incImgSize();
        }
        if (e.key === "-") {
            //size minus
            e.preventDefault();
            decImgSize();
        }
        if (e.shiftKey && e.key === " ") {
            e.preventDefault();
            $("#reader")[0].scrollTop -= window.innerHeight / 1.3;
            return;
        }
        if (e.key === " ") {
            //space
            e.preventDefault();
            $("#reader")[0].scrollTop += window.innerHeight / 1.3;
        }
        if (e.key === "ArrowRight" ||
            e.key === "ArrowDown" ||
            e.key === "s" ||
            e.key === "d") {
            //move down
            e.preventDefault();
            $("#reader")[0].scrollTop += window.innerHeight / 6;
        }
        if (e.key === "ArrowLeft" ||
            e.key === "ArrowUp" ||
            e.key === "w" ||
            e.key === "a") {
            //move up
            e.preventDefault();
            $("#reader")[0].scrollTop -= window.innerHeight / 6;
        }
    }
});
