// import { gsap } from "../src/public/gsap/all.js";
const menuItem = $(".ctrl-menu .ctrl-menu-item");
const initSetting = anime({
    targets: menuItem.toArray(),
    translateY: anime.stagger(-50, { start: -50 }),
});

// $("#ctrl-menu-extender").click(() => {
//     let tl = anime.timeline({ duration: 1000 });
//     console.log("1");
//     if ($(".ctrl-menu").css("display") === "none") {
//         console.log("2");
//         $(".ctrl-menu").show();
//         tl.add(
//             anime({
//                 targets: menuItem.toArray(),
//                 translateY: 0,
//             })
//         );
//         return;
//     }
//     if ($(".ctrl-menu").css("display") === "block") {
//         console.log("d");
//         anime({
//             targets: menuItem.toArray(),
//             translateY: anime.stagger(-50, { start: -50 }),
//             duration: 200,
//         });
//         $(".ctrl-menu").hide();
//         return;
//     }
// });

//gsap

// $(".ctrl-bar").on("mouseenter", () => {
//     tl = gsap.timeline();
//     $(".ctrl-menu").show();
//     tl.to(menuItem.toArray(), { duration: 1, y: 0, ease: "elastic" });
//     $(".ctrl-bar").on("mouseleave", () => {
//         console.log("d");
//         for (let i = 0; i < menuItem.toArray().length; i++) {
//             tl.to(menuItem.toArray()[i], {
//                 duration: 0.1,
//                 y: i * -50,
//                 scale: 0,
//                 onComplete: () => {
//                     tl.to(menuItem.toArray()[i], { display: "none" });
//                 },
//             });
//         }
//         // $(".ctrl-menu").hide();

//         tl.to(menuItem.toArray(), {
//             duration: 0.2,
//             // y: anime.stagger(-50),
//             scale: 1,
//         });
//     });
// });
// let tl;
// $("#ctrl-menu-extender").click(() => {
//     console.log("1");
//     tl = gsap.timeline();
//     if ($(".ctrl-menu").css("display") === "none") {
//         console.log("2");
//         $(".ctrl-menu").show();
//         tl.to(menuItem.toArray(), { duration: 1, y: 0, ease: "elastic" });
//         return;
//     }
//     if ($(".ctrl-menu").css("display") === "block") {
//         console.log("d");
//         // tl.reverse();
//         tl.restart();
//         console.log(tl);
//         // $(".ctrl-menu").hide();
//         return;
//     }
// });

$(".ctrl-menu").show();
$("#ctrl-menu-extender").click(() => {
    console.log("1");
    if ($(".ctrl-menu").css("display") != "none") {
        console.log("2");
        const animate = () => {
            menuItem.each((i, el) => {
                let transformMatrix = $(el)
                    .css(`transform`)
                    .replace(/(([a-z])|(\()|(\)))/gi, "")
                    .split(",");
                let transformY = parseFloat(
                    transformMatrix[transformMatrix.length - 1]
                );
                console.log(i, transformY);
                if (transformY < 0 && transformY != 0) {
                    transformY += 5;
                    $(el).css(`transform`, `translateY(${transformY}px)`);
                }
            });
            window.requestAnimationFrame(animate);
        };
        window.requestAnimationFrame(animate);

        animate();
        return;
    }
    // if ($(".ctrl-menu").css("display") === "block") {
    //     console.log("d");
    //     for (let i = 0; i < menuItem.toArray().length; i++) {
    //         $(menuItem.toArray()[i]).css(
    //             "transform",
    //             `translateY(${-50 - 50 * i}px)`
    //         );
    //     }
    //     // $(".ctrl-menu").hide();
    //     return;
    // }
});
