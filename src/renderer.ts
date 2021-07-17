const fs = require("fs");
//@ts-ignore
const { clipboard, ipcRenderer, shell } = require("electron");
//@ts-ignore
const { app, dialog } = require("@electron/remote");
const inputForm: HTMLInputElement = document.querySelector("#locationInput");

(function consolelogintro() {
    console.log(
        "Manga Reader Version : " + require("@electron/remote").app.getVersion()
    );
    console.log(`
If you encounter any problem post at https://github.com/mienaiyami/offline-manga-reader/issues

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
const changeMaxResBtn = (isMaximized: boolean) => {
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
let readerWidth: number = parseFloat(localStorage.getItem("readerWidth")) || 50;

//get manga path sync

handleContextMenu();
//prompt to set default location

//historylist
let historyLimit = parseInt(localStorage.getItem("historyLimit")) || 60;
let historyPaths: ListItem[] =
    (localStorage.getItem("historyPaths") === ""
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
let bookmarkPaths: ListItem[] =
    JSON.parse(localStorage.getItem("bookmarkPaths")) || [];
(function () {
    if (bookmarkPaths.length === 0) {
        $("#bookmarksTab .location-cont").html(`<p>No items</p>`);
        return;
    }
    bookmarkPaths.forEach((e) => {
        $("#bookmarksTab .location-cont ol").append(bookmarkListItem(e));
    });
})();
$(".nonFocusable").on("focus", (e) => {
    e.preventDefault();
    e.currentTarget.blur();
});
const checkSupportedExt = (ext: string) => {
    let supportedExt = [".jpg", ".jpeg", ".png", ".gif", ".webg"];
    return supportedExt.includes(ext);
};
//list sorting type ;
let locationListSortType: "normal" | "inverted" =
    <"normal" | "inverted">localStorage.getItem("locationListSortType") ||
    "normal";
const displayList = (type: number, Linklist: string[], parent: HTMLElement) => {
    let suggestionsText = "";
    let historyPathsLinks = historyPaths.map((e) => e.link);
    let list = [...Linklist];
    if (locationListSortType === "inverted") {
        list = list.reverse();
    }
    localStorage.setItem("locationListSortType", locationListSortType);
    list.forEach((e) => {
        let alreadyRead = false;
        if (historyPathsLinks.includes(path.normalize(e))) {
            alreadyRead = true;
        }
        let name = e.split("\\").filter((f) => f !== "");
        if (type === 0) {
            suggestionsText += locationListItem(
                name[name.length - 1] || "none",
                e,
                alreadyRead
            );
        }
        if (type === 1) {
            let imgLength: string[] = fs
                .readdirSync(path.normalize(e + "\\"), "utf8")
                .filter((i) => {
                    if (checkSupportedExt(path.extname(i))) return i;
                });
            let imgItem: ListItem = {
                mangaName: name[name.length - 2] || "none",
                chapterName: name[name.length - 1] || "none",
                link: path.normalize(e + "\\"),
                pages: imgLength.length,
            };
            suggestionsText += readerListItem(imgItem, alreadyRead);
        }
    });
    parent.innerHTML = `<ol>${suggestionsText}</ol>`;
};
const getNextList = (link): void => {
    link = path.normalize(link);
    if (
        path.extname(link) === "" ||
        path.extname(link) === ".!" ||
        path.extname(link) === ".-"
    ) {
        fs.readdir(link, "utf-8", (err, data) => {
            if (err) return console.error(err);
            inputForm.value = "";
            let name = link.replace(mangaPath, "");
            inputForm.value += name;
            currentListLink = link;
            let suggestionsText = "";
            let regex = /([a-z]|\,|\(|\)|\-|_|\.\.+|\'|\!)/gi;
            const filterOutNumber = (z) => {
                return z
                    .toString()
                    .replace(regex, "")
                    .split(" ")
                    .filter((e) => e !== "")
                    .filter((e) => e !== ".")[0];
            };
            data = data.sort((a, b) => {
                let num1: string = filterOutNumber(a);
                let num2: string = filterOutNumber(b);
                return parseFloat(num1) - parseFloat(num2);
            });
            currentList = [];
            data.forEach((e) => {
                currentList.push(path.normalize(path.join(link, e, "\\")));
            });
            displayList(
                0,
                currentList,
                document.querySelector("#locationsTab > div.location-cont")
            );
            // document.querySelector(
            //     "#locationsTab > div.location-cont"
            // ).innerHTML = `<ol>${suggestionsText}</ol>`;
        });
    }
};
const promptSetDefaultLocation = (): void => {
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
        inputForm.value = "";
        getNextList(mangaPath);
    }
};
let currentList: string[] = [];
let mangaPath: string = localStorage.getItem("defaultPath");
if (mangaPath === null) {
    let res = dialog.showMessageBoxSync({
        type: "error",
        message: "No default location found.\nSelect new location.",
        buttons: ["OK"],
    });
    if (res === 0) promptSetDefaultLocation();
}
let currentListLink: string = mangaPath;
let parentLink: string | string[] = mangaPath;
let parentsList: string[] = [mangaPath];
// ! removed async;
inputForm.value = "";
getNextList(mangaPath);

// find on input
(function () {
    inputForm.onfocus = () => {
        // inputForm.select();
    };

    inputForm.oninput = () => {
        if (inputForm.value === "") {
            getNextList(mangaPath);
            return;
        }
        let value = inputForm.value.toLowerCase();
        currentList.forEach((e) => {
            if (inputForm.value !== "" && !e.toLowerCase().includes(value)) {
                $(
                    '#locationsTab a[data-link="' +
                        e.replace(/\\/g, "\\\\").replace(/\'/g, "\\'") +
                        '"]'
                )
                    .parent()
                    .hide();
                return;
            }
            $(
                '#locationsTab a[data-link="' +
                    e.replace(/\\/g, "\\\\").replace(/\'/g, "\\'") +
                    '"]'
            )
                .parent()
                .show();
        });
    };
    inputForm.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === "\\" || e.key === "/") {
            e.preventDefault();
            let link = inputForm.value;
            getNextList(mangaPath + link + "\\");
            return;
        }
        if (
            e.key === "Backspace" &&
            inputForm.value[inputForm.value.length - 1] === "\\"
        ) {
            let link = inputForm.value.split("\\").filter((e) => e !== "");
            link.pop();
            getNextList(mangaPath + link.join("\\") + "\\");
        }
    };
    $("#locationInput2").on("input", () => {
        let value = $("#locationInput2").val().toString().toLowerCase();
        currentList.forEach((e) => {
            if (!e.toLowerCase().includes(value)) {
                $(
                    '.currentMangaList a[data-link="' +
                        e.replace(/\\/g, "\\\\").replace(/\'/g, "\\'") +
                        '"]'
                )
                    .parent()
                    .hide();
                return;
            }
            $(
                '.currentMangaList a[data-link="' +
                    e.replace(/\\/g, "\\\\").replace(/\'/g, "\\'") +
                    '"]'
            )
                .parent()
                .show();
        });
    });
})();
const setTitleSize = () => {
    if (readerOpen) {
        let title = `${
            currentChapter.mangaName.length < 45
                ? currentChapter.mangaName
                : currentChapter.mangaName.substring(0, 45) + "..."
        } - ${
            currentChapter.chapterName.length < 25
                ? currentChapter.chapterName
                : currentChapter.chapterName.substring(0, 25) + "..."
        }`;

        if (title.length >= 65 && window.innerWidth <= 1400) {
            title = `${
                currentChapter.mangaName.length < 35
                    ? currentChapter.mangaName
                    : currentChapter.mangaName.substring(0, 35) + "..."
            } - ${
                currentChapter.chapterName.length < 25
                    ? currentChapter.chapterName
                    : currentChapter.chapterName.substring(0, 25) + "..."
            }`;
        }
        if (title.length >= 55 && window.innerWidth <= 1200) {
            title = `${
                currentChapter.mangaName.length < 20
                    ? currentChapter.mangaName
                    : currentChapter.mangaName.substring(0, 20) + "..."
            } - ${
                currentChapter.chapterName.length < 20
                    ? currentChapter.chapterName
                    : currentChapter.chapterName.substring(0, 20) + "..."
            }`;
        }
        if (title.length >= 45 && window.innerWidth <= 1100) {
            title = `${
                currentChapter.mangaName.length < 15
                    ? currentChapter.mangaName
                    : currentChapter.mangaName.substring(0, 15) + "..."
            } - ${
                currentChapter.chapterName.length < 15
                    ? currentChapter.chapterName
                    : currentChapter.chapterName.substring(0, 15) + "..."
            }`;
        }
        $("#topBar .titleBar .title").html(title);
        $("#topBar .titleBar .title").attr("title", title);
    }
};

let currentChapter: ListItem;
let prevLink: string;
let nextLink: string;
let currentPage: number;
let isCurrentMangaList: boolean = false;
let readerOpen: boolean = false;

const makeImg = (link: string): void => {
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
    parentLink = link.split("\\").filter((e) => e != "");
    parentLink.pop();
    parentLink = path.normalize(parentLink.join("\\"));
    let files: string[] = fs.readdirSync(link, "utf8");
    let supportedExt = [".jpg", ".jpeg", ".png", ".gif", ".webg"];
    let invalidText = "";
    let imgs: { name: string; ext: string }[] = files
        .map((file) => {
            if (checkSupportedExt(path.extname(file))) {
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
    currentList = [];
    getNextList(parentLink);
    $("#loadingScreen ").css({ display: "grid" });
    $("#loadingScreen .loadingBarCont .loadingbar").css("width", "0");
    $("#landingPage").hide();
    let pagenum = 0;
    let percentPerImg = 100 / imgs.length;
    let loaderWidth = 0;
    let avgHeight = 0;
    $("#reader .imgCont").html("");
    setTimeout(() => {
        imgs.forEach((img) => {
            pagenum++;
            loaderWidth += percentPerImg / 2;
            // let imgData :string= fs.readFileSync(link + img.name).toString("base64");
            // let out:string = `<img src="data:image/${img.ext};base64, ${imgData}" data-pageNum="${pagenum}"/ title="${img.name}">`;
            let imgHtml = document.createElement("img");
            imgHtml.src = link + img.name;
            imgHtml.setAttribute("data-pageNum", pagenum.toString());
            imgHtml.title = img.name;
            imgHtml.style.width = readerWidth + "%";
            $("#loadingScreen .loadingBarCont .loadingbar").css(
                "width",
                Math.round(loaderWidth) + "%"
            );
            imgHtml.onload = () => {
                // console.log(imgHtml, imgHtml.offsetWidth, imgHtml.offsetHeight);
                loaderWidth += percentPerImg / 2;
                $("#loadingScreen .loadingBarCont .loadingbar").css(
                    "width",
                    Math.round(loaderWidth) + "%"
                );
                if (imgHtml.offsetHeight / imgHtml.offsetWidth <= 1.2) {
                    imgHtml.style.width = readerWidth + 20 + "%";
                }
                if (loaderWidth >= 99)
                    setTimeout(() => {
                        $("#loadingScreen ").hide();
                    }, 300);
            };
            // let out = `<img src="${
            //     link + img.name
            // }" data-pageNum="${pagenum}" title="${
            //     img.name
            // }" style="width:${readerWidth}%">`;
            $("#reader .imgCont").append(imgHtml);
        });
        $("#reader").show();
        readerOpen = true;
        let name = link
            .split("/")
            .join("\\")
            .split("\\")
            .filter((i) => {
                if (i !== "") {
                    return i;
                }
            });
        let mangaName = name[name.length - 2] || "none";
        let chapterName = name[name.length - 1] || "none";
        currentChapter = {
            mangaName,
            chapterName,
            link,
            pages: pagenum,
        };
        setTitleSize();
        let abc: ListItem = {
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
            historyPaths.length < historyLimit
                ? historyPaths.length
                : historyLimit;
        localStorage.setItem("historyPaths", JSON.stringify(historyPaths));
        $("#reader").show();
        readerOpen = true;
        $("#pageNumbers").css({ visibility: "visible" });

        // make side list
        //!removed from 400 settimeout
        $(".currentMangaList h1 .mangaName").html(currentChapter.mangaName);
        $(".currentMangaList h1 .chapterName").html(currentChapter.chapterName);
        displayList(
            1,
            currentList,
            document.querySelector(".currentMangaList .location-cont")
        );
        isCurrentMangaList = true;
        // }
        prevLink =
            currentList[
                currentList.findIndex((e) => e === currentChapter.link) - 1
            ];
        nextLink =
            currentList[
                currentList.findIndex((e) => e === currentChapter.link) + 1
            ];
    }, 100);
};
//inverse list
$("#inverseSort").on("click", (e) => {
    let parent = <HTMLElement>(
        document.querySelector("#locationsTab > div.location-cont")
    );
    if (locationListSortType === "normal") {
        locationListSortType = "inverted";
        let invertedList = [];
        for (let i = currentList.length - 1; i >= 0; i--) {
            invertedList.push(currentList[i]);
        }
        displayList(0, currentList, parent);
        return;
    }
    if (locationListSortType === "inverted") {
        locationListSortType = "normal";
        displayList(0, currentList, parent);
        return;
    }
});
$("#inverseSort2").on("click", (e) => {
    let parent = <HTMLElement>(
        document.querySelector(
            "#reader > div.currentMangaList > div.location-cont"
        )
    );
    if (locationListSortType === "normal") {
        locationListSortType = "inverted";
        let invertedList = [];
        for (let i = currentList.length - 1; i >= 0; i--) {
            invertedList.push(currentList[i]);
        }
        displayList(1, currentList, parent);
        return;
    }
    if (locationListSortType === "inverted") {
        locationListSortType = "normal";
        displayList(1, currentList, parent);
        return;
    }
});

//shorten name when window small
$(window).on("resize", () => {
    setTitleSize();
    //TODO idk wtf it do and y i wrote it;
    // $("#topBar .titleBar .githubbtn").css({
    //     marginRight: "calc(var(--button-width) * 2)",
    // });

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

$("#ctrl-menu-bookmark").on("click", () => {
    addToBookmarksList(currentChapter.link);
});
const addToBookmarksList = (link: string) => {
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
    if ($("#bookmarksTab .location-cont ol").length === 0)
        $("#bookmarksTab .location-cont").html("<ol></ol>");
    $("#bookmarksTab .location-cont ol").prepend(bookmarkListItem(newBM));
    localStorage.setItem("bookmarkPaths", JSON.stringify(bookmarkPaths));
};

//remove bookmark
const removeBookmark = (item: JQuery): void => {
    let sure: number = dialog.showMessageBoxSync({
        type: "warning",
        message: "are you sure you want to remove bookmark?",
        buttons: ["yes", "no"],
    });
    if (sure === 0) {
        bookmarkPaths = bookmarkPaths.filter((i) => {
            return i.date !== item.attr("data-date");
        });
        item.parent().remove();
        if (bookmarkPaths.length === 0)
            $("#bookmarksTab .location-cont").html(`<p>No items</p>`);
        item.parent().remove();
        localStorage.setItem("bookmarkPaths", JSON.stringify(bookmarkPaths));
    }
};
//remove history
const removeHistory = (item: JQuery): void => {
    historyPaths = historyPaths.filter((i) => {
        return i.date !== item.attr("data-date");
    });
    item.parent().remove();
    localStorage.setItem("historyPaths", JSON.stringify(historyPaths));
};

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
    let initbehavior = $("#reader").css("scrollBehavior");
    $("#reader").css({ scrollBehavior: "auto" });
    $("#reader .imgCont")
        .children("img")
        .each((i, e) => {
            e.style.width = readerWidth + "%";
            if (e.offsetHeight / e.offsetWidth <= 1.2) {
                e.style.width = readerWidth + 20 + "%";
            }
        });
    $(
        '#reader .imgCont img[data-pagenum="' + currentPage + '"]'
    )[0].scrollIntoView();
    $("#reader").css({ scrollBehavior: initbehavior });
    if (!disablePageNumChange) displayPageNumber();
};

const incImgSize = () => {
    readerWidth += 5;
    readerWidth = readerWidth > 100 ? 100 : readerWidth;
    let initbehavior = $("#reader").css("scrollBehavior");
    $("#reader").css({ scrollBehavior: "auto" });
    $("#reader .imgCont")
        .children("img")
        .each((i, e) => {
            e.style.width = readerWidth + "%";
            if (e.offsetHeight / e.offsetWidth <= 1.2) {
                e.style.width = readerWidth + 20 + "%";
            }
        });
    $(
        '#reader .imgCont img[data-pagenum="' + currentPage + '"]'
    )[0].scrollIntoView();
    $("#reader").css({ scrollBehavior: initbehavior });

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
        $("#NavigateToPageInput").val(currentPage);
        return;
    }
};
let disablePageNumChange = false;
$("#reader").on("scroll", () => {
    if (!disablePageNumChange) displayPageNumber();
});
$("#ctrl-menu-next").on("click", () => {
    openNextChapter();
});
const openNextChapter = (): void => {
    if (!nextLink) return dialog.showErrorBox("Error", "This chapter was last");

    $("#reader .imgCont").html("");
    makeImg(nextLink);
};

$("#ctrl-menu-prev").on("click", () => {
    openPrevChapter();
});
const openPrevChapter = (): void => {
    if (!prevLink)
        return dialog.showErrorBox("Error", "This chapter was first");

    $("#reader .imgCont").html("");
    makeImg(prevLink);
};
$("#NavigateToPageInput").on("focus", () => {
    $("#NavigateToPageInput").trigger("select");
    $("#NavigateToPageInput").on("keyup", (e) => {
        if (/[0-9]/gi.test(e.key) || e.key == "Backspace") {
            let pagenum: number = parseInt(
                <string>$("#NavigateToPageInput").val()
            );
            if (
                !pagenum ||
                pagenum > $("#reader .imgCont img").length ||
                pagenum === undefined
            ) {
                return;
            }
            let img = $('#reader .imgCont img[data-pagenum="' + pagenum + '"]');
            disablePageNumChange = true;
            img[0].scrollIntoView({ behavior: "smooth" });
            currentPage = pagenum;
        }
        if (e.key == "Enter" || e.key == "Escape") {
            $("#NavigateToPageInput").trigger("blur");
            disablePageNumChange = false;
        }
        if (e.key === "Enter") {
            let pagenum: number = parseInt(
                <string>$("#NavigateToPageInput").val()
            );
            if (
                !pagenum ||
                pagenum > $("#reader .imgCont img").length ||
                pagenum === undefined
            ) {
                return;
            }
            let img = $('#reader .imgCont img[data-pagenum="' + pagenum + '"]');
            disablePageNumChange = true;
            img[0].scrollIntoView();
            disablePageNumChange = false;
            currentPage = pagenum;
        }
    });
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

// settings;
(function () {
    let setDefaultOption = `
    <div class="settingItem defaultLocation">
        <div class="name">Default Location:</div>
        <div class="current">
            <input type="text" value="${mangaPath}" disabled>
            <button onClick="{
                promptSetDefaultLocation()
                location.reload();
                $(this).html('Done')
                $(this).prop('disabled',true)
                setTimeout(()=>{
                    $(this).html('Change Default')
                    $(this).removeAttr('disabled')
                },3000)
            }">
            Change Default
            </button>
        </div>
    </div>`;
    let setHistoryLimit = `
    <div class="settingItem historyLimit">
        <div class="name">History Limit:</div>
        <div class="current">
            <input type="number" value="${
                localStorage.getItem("historyLimit") || 60
            }" onkeydown="
            {
                if(event.key==='Enter'){
                    event.preventDefault();
                    event.stopPropagation();
                    $(this).siblings('button').trigger('click')
                }
            }
            " disabled>
            <button data-type="enable" onClick="{
                if($(this).attr('data-type')==='enable'){
                    $(this).attr('data-type','set')
                    $(this).addClass('enabled');
                    $(this).html('Set New')
                    $(this).siblings('input').removeAttr('disabled');
                    $(this).siblings('input').trigger('focus').trigger('select')
                    return;
                }if($(this).attr('data-type')==='set'){
                    $(this).attr('data-type','enable')
                    $(this).removeClass('enabled');
                    $(this).html('Done')
                    $(this).prop('disabled',true)
                    setTimeout(()=>{
                        $(this).html('Change Default')
                        $(this).removeAttr('disabled')
                    },3000)
                    $(this).siblings('input').prop('disabled',true)
                    localStorage.setItem('historyLimit',$(this).siblings('input').val())
                    historyLimit = $(this).siblings('input').val()
                    return;
                }
            }">
            Change Default
            </button>
        </div>
    </div>`;
    let exportBookmark = `
    <div class="settingItem exportBookmark">
        <div class="name">Bookmarks:</div>
        <div class="current">
            <button onClick="{
                let btn = $(this);
                let opt = dialog.showSaveDialogSync({title:'Export Bookmarks',
                filters: [
                  { name: 'Json', extensions: ['json'] }
                ]})
                if(opt==undefined) return;
                fs.writeFileSync(opt,localStorage.getItem('bookmarkPaths')||JSON.stringify([]))
                btn.html('Done')
                btn.prop('disabled',true)
                setTimeout(()=>{
                    btn.html('Export')
                    btn.removeAttr('disabled')
                },3000)
            }">
            Export
            </button>
            <button onClick="{
                let btn = $(this);
                let opt = dialog.showOpenDialogSync({
                    properties: ['openFile'],
                    filters: [
                      { name: 'Json', extensions: ['json'] }
                ]})
                if(opt==undefined) return;
                let data = JSON.parse(fs.readFileSync(opt[0]))
                let dataToAdd = [];
                let similarFound = 0;
                data.forEach((item) => {
                    if (!bookmarkPaths.map((e) => e.link).includes(item.link)) {
                        dataToAdd.push(item);
                    } else{
                        similarFound++;
                    }
                })
                if(similarFound>0) dialog.showMessageBoxSync({
                    type: 'warning',
                    message: 'Found '+ similarFound+ ' similar',
                    buttons: ['Ok'],
                });
                bookmarkPaths.push(...dataToAdd)
                let abc = ''
                dataToAdd.forEach((item) =>{
                    abc +=bookmarkListItem(item)
                })
                if($('#bookmarksTab .location-cont ol').length===0){
                    $('#bookmarksTab .location-cont').html('<ol></ol>')
                }
                $('#bookmarksTab .location-cont ol').prepend(abc);
                localStorage.setItem('bookmarkPaths', JSON.stringify(bookmarkPaths));
                btn.html('Done')
                btn.prop('disabled',true)
                setTimeout(()=>{
                    btn.html('Import')
                    btn.removeAttr('disabled')
                },3000)
            }">
            Import
            </button>
            <button onClick="
            {
                let btn = $(this);
                let confirm1 = dialog.showMessageBoxSync({
                    type: 'warning',
                    title:'Delete BookMarks',
                    message: 'are you sure you want to remove bookmark?',
                    buttons: ['yes', 'no'],
                });
                if(confirm1==undefined) return;
                if(confirm1===1) return;
                if(confirm1===0){
                    let confirm2 = dialog.showMessageBoxSync({
                        type: 'warning',
                        title:'Delete BookMarks',
                        message: 'are you really sure you want to remove bookmark?\\nThis process is irreversible.',
                        buttons: ['yes', 'no'],
                    });
                    if(confirm2===1) return;
                }
                bookmarkPaths =[];
                $('#bookmarksTab .location-cont').html('<p>No items</p>');
                localStorage.setItem('bookmarkPaths', JSON.stringify(bookmarkPaths));
                btn.html('Done')
                btn.prop('disabled',true)
                setTimeout(()=>{
                    btn.html('Delete All Bookmarks')
                    btn.removeAttr('disabled')
                },3000)
            }">
            Delete All Bookmarks
            </button>
        </div>
    </div>`;
    let themeOption = `
    <div class="settingItem historyLimit">
        <div class="name">Theme:</div>
        <div class="current">
            Coming Soon
        </div>
    </div>
    `;
    document.querySelector("#settings div.cont .content").innerHTML +=
        setDefaultOption + setHistoryLimit + exportBookmark + themeOption;
})();
//close settings
const toggleSettings = () => {
    let settings = $("#settings");
    if (settings.attr("data-state") === "closed") {
        settings.attr("data-state", "open");
        return;
    }
    if (settings.attr("data-state") === "open") {
        settings.attr("data-state", "closed");
        return;
    }
};

$("#settings > div.clickClose").on("click", () => {
    $("#settings").attr("data-state", "closed");
});

// keyboard shortcuts
// change size on control / ctrl + scroll
$(document).on("wheel", (e) => {
    if (readerOpen && e.ctrlKey) {
        if (Math.sign((<WheelEventInit>e.originalEvent).deltaY) === 1) {
            decImgSize();
        }
        if (Math.sign((<WheelEventInit>e.originalEvent).deltaY) === -1) {
            incImgSize();
        }
    }
});

$(document).on("keydown", (e) => {
    if (e.key === "Enter" || e.key === "/") {
        e.preventDefault();
        inputForm.focus();
    }
    if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        $("#topBar > div.titleBar > button.settingsBtn").trigger("click");
        return;
    }
    if (e.key === "h") {
        //refresh / home
        e.preventDefault();
        location.reload();
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
        if (e.key === "b") {
            //bookmark
            e.preventDefault();
            addToBookmarksList(currentChapter.link);
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
        if (
            e.key === "ArrowRight" ||
            e.key === "ArrowDown" ||
            e.key === "s" ||
            e.key === "d"
        ) {
            //move down
            e.preventDefault();
            $("#reader")[0].scrollTop += window.innerHeight / 6;
        }
        if (
            e.key === "ArrowLeft" ||
            e.key === "ArrowUp" ||
            e.key === "w" ||
            e.key === "a"
        ) {
            //move up
            e.preventDefault();
            $("#reader")[0].scrollTop -= window.innerHeight / 6;
        }
    }
});
