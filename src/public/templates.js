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
    let listItem = `<li class="${listClass}"><a class="a-context" onclick="getNextList($(this).attr('data-link'))" data-name="${e}" data-link="${path.normalize(link + "\\" + e + "\\")}">${displayname}</a>${btn}</li>`;
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
    if (manga.length > 60) {
        manga = manga.substring(0, 60) + "...";
    }
    let chapter = item.attr("data-chapterName");
    if (chapter.length > 60) {
        chapter = chapter.substring(0, 60) + "...";
    }
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
                y -
                    $("#fileInfo").height() -
                    20 -
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
            // @ts-ignore
            contextTarget = $(e.target);
            let bookmarkbtn = `<li class="contextMenuOption" onclick="addToBookmarksList(contextTarget.attr('data-link'))" id="contextMenu-bookmark">Bookmark</li>`;
            let bkRemovebtn = `<li class="contextMenuOption" onclick="{removeBookmark(contextTarget)}" id="contextMenu-remove">Remove</li>`;
            let hRemovebtn = `<li class="contextMenuOption" onclick="{removeHistory(contextTarget)}" id="contextMenu-remove">Remove</li>`;
            let openbtn = `<li class="contextMenuOption" onclick="makeImg(contextTarget.attr('data-link'))" id="contextMenu-open">Open</li>`;
            let copylocationbtn = `<li class="contextMenuOption" onclick="clipboard.writeText(contextTarget.attr('data-link'))" id="contextMenu-copy" >Copy Location</li>`;
            let menu = `<ul>${openbtn} ${bookmarkbtn}  ${copylocationbtn}</ul>`;
            if ($(e.target).parents("#bookmarksTab").length === 1) {
                menu = `<ul>${openbtn} ${bkRemovebtn}  ${copylocationbtn}</ul>`;
            }
            if ($(e.target).parents("#historyTab").length === 1) {
                menu = `<ul>${openbtn}  ${bookmarkbtn} ${hRemovebtn}  ${copylocationbtn}</ul>`;
            }
            contextMenu.html(menu);
            contextMenu.find("li").on("contextmenu", (e) => {
                e.target.click();
            });
            contextMenu.find("li").on("click", (e) => {
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
        return;
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
