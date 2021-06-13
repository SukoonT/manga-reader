//list generator
const path = require("path");
function locationListItem(e, link, alreadyRead) {
    let displayname = e;
    // let maxlength = document.querySelector("#locationsTab").offsetWidth / 10;
    // if (e.length > maxlength) {
    //     displayname = e.substring(0, maxlength) + "...";
    // }
    link = link + "\\";
    link = path.normalize(link);
    let listClass = "";
    if (alreadyRead) {
        listClass = "already-read";
    }
    let btn = `<button title="Open In Reader" class="open-in-reader-btn" onclick="makeImg($(this).siblings('a').attr('data-link'))">&gt</button>`;
    let listItem = `<li class="${listClass}"><a class="a-context" onclick="putIntoInput($(this).attr('data-name'),$(this).attr('data-link'))" data-name="${e}" data-link="${path.normalize(
        link + "\\" + e + "\\"
    )}">${displayname}</a>${btn}</li>`;
    return listItem;
}

function historyListItem(e, link) {
    let mangaName = e.mangaName;
    let chapterName = e.chapterName;
    let date = e.date;
    let pages = e.pages;
    link = link + "\\";
    link = path.normalize(link);
    // let maxlength = document.querySelector("#locationsTab").offsetWidth / 10;
    // if (e.length > maxlength) {
    //     mangaName+" / "+chapterName = e.substring(0, maxlength) + "...";
    // }
    let btn = `<button class="add-bkmark-btn">+</button>`;
    let listItem = `<li><a class="a-context" onclick="makeImg($(this).attr('data-link'))" data-mangaName="${mangaName}" data-chapterName="${chapterName}" data-pages="${pages}" data-date="${date}"data-link="${link}" onmouseover="fileInfoOnHover($(this))">${
        mangaName + " / " + chapterName
    }</a>${btn}</li>`;
    return listItem;
}
function bookmarkListItem(e, link) {
    let mangaName = e.mangaName;
    let chapterName = e.chapterName;
    let date = e.date;
    let pages = e.pages;
    link = link + "\\";
    link = path.normalize(link);
    // let maxlength = document.querySelector("#locationsTab").offsetWidth / 10;
    // if (e.length > maxlength) {
    //     mangaName+" / "+chapterName = e.substring(0, maxlength) + "...";
    // }
    let btn = `<button class="rmv-bkmark-btn" onclick="removeBookmark($(this).parent(),$(this).siblings('a').attr('data-link'))">-</button>`;
    let listItem = `<li><a class="a-context" onclick="makeImg($(this).attr('data-link'))" data-mangaName="${mangaName}" data-chapterName="${chapterName}" data-pages="${pages}" data-date="${date}"data-link="${link}" onmouseover="fileInfoOnHover($(this))">${
        mangaName + " / " + chapterName
    }</a>${btn}</li>`;
    return listItem;
}

function fileInfoOnHover(item) {
    let manga = item.attr("data-mangaName");
    let chapter = item.attr("data-chapterName");
    let pages = item.attr("data-pages");
    let date = item.attr("data-date");

    let mangacont = `
    <div class="info-cont manga">
        <div class="title">Manga:</div>
        <div class="info">${manga}</div>
    </div>`;
    let chaptercont = `
    <div class="info-cont chapter">
        <div class="title">Chapter:</div>
        <div class="info">${chapter}</div>
    </div>`;
    let pagescont = `
    <div class="info-cont pages">
        <div class="title">Pages:</div>
        <div class="info">${pages}</div>
    </div>`;
    let datecont = `
    <div class="info-cont date">
        <div class="title">Date:</div>
        <div class="info">${date}</div>
    </div>`;
    $("#fileInfo").html(mangacont + chaptercont + pagescont + datecont);

    let x = item.offset.left;
    let y = item.offset.top;
    item.on("mousemove", (e) => {
        x = e.clientX + 20;
        y = e.clientY + 20;
        if (x > $(window).width() - $("#fileInfo").width() - 50) {
            x = $(window).width() - $("#fileInfo").width() - 50;
        }
        if (y > $(window).height() - $("#fileInfo").height() - 50) {
            y =
                $(window).height() -
                $("#fileInfo").height() -
                $("#fileInfo").height();
        }
        $("#fileInfo").css({ left: x, top: y });
    });
    $("#fileInfo").css({ display: "flex" });
    item.on("mouseout", () => {
        $("#fileInfo").html("");

        $("#fileInfo").hide();
    });
}

//contextmenu
function handleContextMenu() {
    const contextMenu = $("#contextMenu");
    $(document).on("contextmenu", (e) => {
        e.preventDefault();
        if (e.target.classList.contains("a-context")) {
            let target = $(e.target);
            console.log(JSON.stringify(target[0]));
            console.log(JSON.parse(JSON.stringify(target)));
            let link = JSON.stringify(target.attr("data-link")).replace(
                /"/gi,
                "'"
            );
            let menu = `
            <ul>
                <li
                    onclick="addToBookmarksList(${link})"
                    id="contextMenu-bookmark"
                >
                    bookmark
                </li>
                <li
                    onclick="removeBookmark(${$(e.target)[0]}','${target.attr(
                "data-link"
            )})"
                    id="contextMenu-remove"
                >
                    remove
                </li>
                <li  id="contextMenu-openInNew">
                    open in new window
                </li>
                <li onclick="makeImg(${target.attr(
                    "data-link"
                )})" id="contextMenu-open">
                    open
                </li>
                <li
                    onclick="clipboard.writeText(${link})"
                    id="contextMenu-copy"
                >
                    copy location
                </li>
            </ul>`;
            contextMenu.html(menu);
            contextMenu.find("li").on("mouseup", () => {
                contextMenu.hide();
            });
            if (!$(e.target).parents().get().includes(contextMenu[0])) {
                let x = e.clientX + 10;
                let y = e.clientY + 10;
                if (x > $(window).width() - contextMenu.width() - 50) {
                    x = $(window).width() - contextMenu.width() - 60;
                }
                if (y > $(window).height() - contextMenu.height() - 50) {
                    y = $(window).height() - contextMenu.height() - 40;
                }
                contextMenu.css({ top: y, left: x });
                contextMenu.show();
                return;
            }
        }
        contextMenu.hide();
    });
    $(document).on("mousedown", (e) => {
        if (
            e.target.id != "contextMenu" &&
            !$(e.target).parents().get().includes(contextMenu[0])
        ) {
            contextMenu.hide();
        }
    });
}

module.exports = {
    locationListItem,
    bookmarkListItem,
    historyListItem,
    fileInfoOnHover,
    handleContextMenu,
};
