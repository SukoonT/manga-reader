const fs = require("fs");
// const path = require("path");
const { clipboard, ipcRenderer, shell } = require("electron");
const { app, dialog } = require("@electron/remote");
const { clearInterval } = require("timers");
const openInReaderBtn = $(".open-in-reader-btn");
const inputForm = document.querySelector("#locationInput");
function removeBM(item) {
    let index = item.parent().attr("data-list-index");
}
(function consolelogintro() {
    console.log(
        "Manga Reader Version : " + require("@electron/remote").app.getVersion()
    );
    console.log(`If you encounter any problem mail me at sukoonkumar2@gmail.com


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
    } else {
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
        addToLocationList(mangaPath);
    }
}

//historylist
let historyPaths =
    (localStorage.getItem("historyPaths") === ""
        ? []
        : JSON.parse(localStorage.getItem("historyPaths"))) || [];
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
// ! removed async;
function getNextList(link) {
    link = path.normalize(link);
    fs.readdir(link, "utf-8", (err, data) => {
        let suggestionsText = "";
        currentList = data;
        data = data.sort((a, b) => {
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
            return parseFloat(num1) - parseFloat(num2);
        });
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
function putIntoInput(name, link) {
    link = path.normalize(link);
    inputForm.value = "";
    inputForm.value += name + "/";
    getNextList(link);
}
(function () {
    // inputForm.onfocus = () => {
    //     inputForm.selectionStart = inputForm.value.length;
    //     inputForm.select();
    // };
    inputForm.oninput = () => {
        if (inputForm.value === "") {
            getNextList(mangaPath + "/");
        }
        let valueraw = inputForm.value.toLowerCase().split("/");
        let value = inputForm.value.toLowerCase().split("/")[
            valueraw.length - 1
        ];
        let regex = new RegExp(value, "gi");
        currentList.forEach((e) => {
            if (inputForm.value !== "" && !e.toLowerCase().includes(value)) {
                $('a[data-name="' + e + '"]')
                    .parent()
                    .hide();
                return;
            }
            $('a[data-name="' + e + '"]')
                .parent()
                .show();
        });
        // document.querySelector(
        //     "#locationsTab > div.location-cont"
        // ).innerHTML =
    };
    inputForm.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === "/") {
            let link = inputForm.value;
            getNextList(mangaPath + link + "/");
        }
    };
})();
let currentLink;
let prevLink;
let nextLink;
let currentPage;
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
    parentLink = link.split("\\").filter((e) => e != "");
    parentLink.pop();
    parentLink = path.normalize(parentLink.join("\\"));
    getNextList(parentLink);
    console.log(currentLink, parentLink);
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
    $("#loadingScreen ").css({ display: "grid" });
    $("#loadingScreen .loadingBarCont .loadingbar").css("width", "0");
    // $("#loadingScreen ").animate({ top: 0 }, 500, () => {
    $("#landingPage").hide();
    // });
    let pagenum = 0;
    let percentPerImg = 100 / imgs.length;
    let loaderWidth = 0;
    //$("#loadingScreen .loadingBarCont .loadingbar")
    setTimeout(() => {
        imgs.forEach((img) => {
            pagenum++;
            loaderWidth += percentPerImg;
            $("#loadingScreen .loadingBarCont .loadingbar").css(
                "width",
                loaderWidth + "%"
            );
            let imgData = fs.readFileSync(link + img.name).toString("base64");
            // let out = `<img src="data:image/${img.ext};base64, ${imgData}" data-pageNum="${pagenum}"/ title="${img.name}">`;
            let out = `<img src="${
                link + img.name
            }" data-pageNum="${pagenum}"/ title="${
                img.name
            }" style="width:${readerWidth}%">`;
            $("#reader .imgCont").append(out);
        });
        setTimeout(() => {
            $("#loadingScreen ").hide();
            prevLink = $(
                "#locationsTab .location-cont ol li a[data-link='" +
                    currentLink.replace(/\\/g, "\\\\"),
                +"']"
            )
                .parent()
                .prev()
                .find("a")
                .attr("data-link");
            nextLink = $(
                "#locationsTab .location-cont ol li a[data-link='" +
                    currentLink.replace(/\\/g, "\\\\"),
                +"']"
            )
                .parent()
                .next()
                .find("a")
                .attr("data-link");
        }, 400);

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
        } else {
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
        $("#pageNumbers #NavigateToPageInput").val(currentPage);
        $("#pageNumbers .totalPage").text("/" + pagenum);
        historyPaths.unshift(abc);
        historyPaths.length =
            historyPaths.length < 60 ? historyPaths.length : 60;
        localStorage.setItem("historyPaths", JSON.stringify(historyPaths));
        $("#reader").show();
        $("#pageNumbers").css({ visibility: "visible" });
    }, 100);
}
//shorten name when window small
$(window).on("resize", () => {
    if (
        $("#topBar .titleBar .title").text().length >= 55 &&
        window.innerWidth <= 1100
    ) {
        $("#topBar .titleBar .githubbtn").css({
            marginRight: "calc(var(--button-width) * 2)",
        });
        $("#topBar .titleBar .title").text(
            $("#topBar .titleBar .title").text().substring(0, 40) + "..."
        );
    } else if (window.innerWidth > 1100) {
        $("#topBar .titleBar .title").text(
            $("#topBar .titleBar .title").attr("title")
        );
    }
    //page number
    currentPage = parseInt(
        $(
            document.elementFromPoint(
                window.innerWidth / 2,
                window.innerHeight / 3
            )
        ).attr("data-pagenum")
    );
});

// //go back btn
// !removed
// $("#goback").click(() => {
//     addToLocationList(mangaPath);
// });

$("#ctrl-menu-bookmark").click(() => {
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
    console.log(link);
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
    $("#bookmarksTab .location-cont ol").prepend(
        bookmarkListItem(newBM, path.normalize(link))
    );
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
$("#ctrl-menu-minus").click(() => {
    decImgSize();
});
$("#ctrl-menu-plus").click(() => {
    IncImgSize();
});
const decImgSize = () => {
    readerWidth -= 5;
    readerWidth = readerWidth < 20 ? 20 : readerWidth;
    $("#reader .imgCont img").css("width", readerWidth + "%");
    if (!disablePageNumChange) displayPageNumber();
};

const IncImgSize = () => {
    readerWidth += 5;
    readerWidth = readerWidth > 100 ? 100 : readerWidth;
    $("#reader .imgCont img").css("width", readerWidth + "%");
    if (!disablePageNumChange) displayPageNumber();
};

// page number
const displayPageNumber = () => {
    if ($("#reader .imgCont img").length > 0) {
        currentPage = parseInt(
            $(
                document.elementFromPoint(
                    window.innerWidth / 2,
                    window.innerHeight / 4
                )
            ).attr("data-pagenum")
        );
        $("#pageNumbers #NavigateToPageInput").val(currentPage);
        return;
    }
};
let disablePageNumChange = false;
$("#reader").scroll(() => {
    if (!disablePageNumChange) displayPageNumber();
});
$("#ctrl-menu-next").click(() => {
    openNextChapter();
});
function openNextChapter() {
    $("#reader .imgCont").html("");
    makeImg(
        nextLink ||
            $(
                "#locationsTab .location-cont ol li a[data-link='" +
                    currentLink.replace(/\\/g, "\\\\"),
                +"']"
            )
                .parent()
                .next()
                .find("a")
                .attr("data-link")
    );
}

$("#ctrl-menu-prev").click(() => {
    openPrevChapter();
});
function openPrevChapter() {
    $("#reader .imgCont").html("");
    makeImg(
        prevLink ||
            $(
                "#locationsTab .location-cont ol li a[data-link='" +
                    currentLink.replace(/\\/g, "\\\\"),
                +"']"
            )
                .parent()
                .prev()
                .find("a")
                .attr("data-link")
    );
}
$("#pageNumbers #NavigateToPageInput").click(() => {
    $("#pageNumbers #NavigateToPageInput").select();
});
$("#pageNumbers #NavigateToPageInput").focus(() => {
    $("#pageNumbers #NavigateToPageInput").on("keyup", (e) => {
        // console.log(e.key);
        if (/[0-9]/gi.test(e.key) || e.key == "Backspace") {
            let pagenum = $("#pageNumbers #NavigateToPageInput").val();
            if (
                !pagenum ||
                pagenum > $("#reader .imgCont img").length ||
                pagenum == ""
            ) {
                return;
            }
            let img = $('#reader .imgCont img[data-pagenum="' + pagenum + '"]');
            disablePageNumChange = true;
            img[0].scrollIntoView();
        }
        if (e.key == "Enter" || e.key == "Escape") {
            $("#pageNumbers #NavigateToPageInput").blur();
            disablePageNumChange = false;
        }
    });
    $("#pageNumbers #NavigateToPageInput").val(currentPage);

    console.log("d");
});
