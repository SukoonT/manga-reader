//list generator
const anime = require("animejs");
//@ts-ignore
const path = require("path");
function locationListItem(e, link, alreadyRead) {
    let displayname = e;
    link = link + "\\";
    link = path.normalize(link);
    let listClass = "";
    if (alreadyRead) {
        listClass = "already-read";
    }
    let btn = `<button title="Open In Reader" class="open-in-reader-btn" onclick="makeImg($(this).siblings('a').attr('data-link'))"><i class="fas fa-angle-right" style="cursor: pointer;"></i></button>`;
    let listItem = `<li class="${listClass}"><a class="a-context" onclick="putIntoInput($(this).attr('data-name'),$(this).attr('data-link'))" data-name="${e}" data-link="${path.normalize(link + "\\" + e + "\\")}">${displayname}</a>${btn}</li>`;
    return listItem;
}
function historyListItem(e) {
    let mangaName = e.mangaName;
    let chapterName = e.chapterName;
    let date = e.date;
    let pages = e.pages;
    let link = e.link;
    link = link + "\\";
    link = path.normalize(link);
    let listItem = `<li><a class="a-context" onclick="makeImg($(this).attr('data-link'))" data-mangaName="${mangaName}" data-chapterName="${chapterName}" data-pages="${pages}" data-date="${date}"data-link="${link}" onmouseover="fileInfoOnHover($(this))">${mangaName + " / " + chapterName}</a></li>`;
    return listItem;
}
function bookmarkListItem(e) {
    let mangaName = e.mangaName;
    let chapterName = e.chapterName;
    let date = e.date;
    let pages = e.pages;
    let link = e.link;
    link = link + "\\";
    link = path.normalize(link);
    let listItem = `<li><a class="a-context" onclick="makeImg($(this).attr('data-link'))" data-mangaName="${mangaName}" data-chapterName="${chapterName}" data-pages="${pages}" data-date="${date}" data-link="${link}" onmouseover="fileInfoOnHover($(this))">${mangaName + " / " + chapterName}</a></li>`;
    return listItem;
}
function readerListItem(e, alreadyRead) {
    let mangaName = e.mangaName;
    let chapterName = e.chapterName;
    // let date = " ";
    let pages = e.pages;
    let link = e.link;
    link = path.normalize(link + "\\");
    let listClass = "";
    if (alreadyRead) {
        listClass = "already-read";
    }
    let listItem = `<li class="${listClass}"><a class="a-context" onclick="makeImg($(this).attr('data-link'))" data-mangaName="${mangaName}" data-chapterName="${chapterName}" data-pages="${pages}" data-date="" data-link="${link}" onmouseover="fileInfoOnHover($(this))">${chapterName}</a></li>`;
    return listItem;
}
function fileInfoOnHover(item) {
    let manga = item.attr("data-mangaName");
    let chapter = item.attr("data-chapterName");
    let pages = item.attr("data-pages");
    let date = item.attr("data-date") || "";
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
    let datecont = date === ""
        ? ""
        : `
    <div class="info-cont date">
        <div class="title">Date:</div>
        <div class="info">${date}</div>
    </div>`;
    $("#fileInfo").html(mangacont + chaptercont + pagescont + datecont);
    let x = item.offset().left;
    let y = item.offset().top;
    item.on("mousemove", (e) => {
        x = e.clientX + 20;
        y =
            e.clientY +
                20 -
                parseFloat($(document.body).css("--titleBar-height"));
        if (x > $(window).width() - $("#fileInfo").width() - 50) {
            x = $(window).width() - $("#fileInfo").width() - 50;
        }
        if (y >
            $(window).height() -
                $("#fileInfo").height() -
                50 -
                parseFloat($(document.body).css("--titleBar-height"))) {
            y =
                $(window).height() -
                    $("#fileInfo").height() -
                    50 -
                    parseFloat($(document.body).css("--titleBar-height"));
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
let contextTarget;
function handleContextMenu() {
    const contextMenu = $("#contextMenu");
    $(document).on("contextmenu", (e) => {
        e.preventDefault();
        if ($(e.target).hasClass("a-context")) {
            //@ts-ignore
            contextTarget = $(e.target);
            let bookmarkbtn = `<li onclick="addToBookmarksList(contextTarget.attr('data-link'))" id="contextMenu-bookmark">Bookmark</li>`;
            let removebtn = `<li onclick="{removeBookmark(contextTarget.parent(),contextTarget.attr('data-link'))}" id="contextMenu-remove">Remove</li>`;
            let openbtn = `<li onclick="makeImg(contextTarget.attr('data-link'))" id="contextMenu-open">Open</li>`;
            let copylocationbtn = `<li onclick="clipboard.writeText(contextTarget.attr('data-link'))" id="contextMenu-copy" >Copy Location</li>`;
            let menu = `<ul>${openbtn} ${bookmarkbtn}  ${copylocationbtn}</ul>`;
            if ($(e.target).parents("#bookmarksTab").length === 1) {
                menu = `<ul>${openbtn} ${removebtn}  ${copylocationbtn}</ul>`;
            }
            contextMenu.html(menu);
            contextMenu.find("li").on("mouseup", () => {
                setTimeout(() => {
                    contextTarget = null;
                }, 500);
                contextMenu.hide();
            });
            if (!$(e.target).parents().get().includes(contextMenu[0])) {
                let x = e.clientX + 10;
                let y = e.clientY +
                    10 -
                    parseFloat($(document.body).css("--titleBar-height"));
                if (x > $(window).width() - contextMenu.width() - 50) {
                    x = $(window).width() - contextMenu.width() - 60;
                }
                if (y > $(window).height() - contextMenu.height() - 50) {
                    y =
                        $(window).height() -
                            contextMenu.height() -
                            40 -
                            parseFloat($(document.body).css("--titleBar-height"));
                }
                contextMenu.css({ top: y, left: x });
                contextMenu.show();
                return;
            }
        }
        contextTarget = null;
        contextMenu.hide();
    });
    $(document).on("mousedown", (e) => {
        if (
        //@ts-ignore
        e.target.id != "contextMenu" &&
            !$(e.target).parents().get().includes(contextMenu[0])) {
            contextMenu.hide();
        }
    });
}
//control bar
const menuItem = $(".ctrl-menu .ctrl-menu-item");
const initSetting = anime({
    targets: menuItem.toArray(),
    translateY: anime.stagger(-parseFloat(anime.get(menuItem[0], "width")), {
        start: -parseFloat(anime.get(menuItem[0], "width")),
    }),
});
const extendMenu = () => {
    $(".ctrl-menu").show();
    menuExtenderState = "open";
    $("#ctrl-menu-extender").addClass("ctrl-menu-extender-open");
    anime({
        targets: menuItem.toArray(),
        translateY: 0,
    });
};
const closeMenu = () => {
    $("#ctrl-menu-extender").removeClass("ctrl-menu-extender-open");
    anime({
        targets: menuItem.toArray(),
        translateY: anime.stagger(-parseFloat(anime.get(menuItem[0], "width")), {
            start: -parseFloat(anime.get(menuItem[0], "width")),
        }),
        duration: 400,
        update: (anim) => {
            if (menuExtenderState === "closed") {
                anim.pause();
            }
        },
        complete: () => {
            $(".ctrl-menu").hide();
            menuExtenderState = "closed";
        },
    });
};
let menuExtenderState = "closed";
$("#ctrl-menu-extender").on("click", () => {
    if (menuExtenderState === "closed") {
        extendMenu();
        return;
    }
    if (menuExtenderState === "open") {
        closeMenu();
        return;
    }
});
