
(() => {
    "use strict";
    const ad = document.querySelector(".ad");
    if (!ad) return;

    const clickTag =
        window.clickTag || "https://example.com/landing";
    ad.href = clickTag;
    const prefersReducedMotion = matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const animations = [];
    const ease = "cubic-bezier(.22, 1, .36, 1)";

    let started = false;
    function play(
        selector,
        frames,
        delay,
        duration,
        options = {}
    ) {
        const element = ad.querySelector(selector);

        if (!element) return;
        const animation = element.animate(frames, {
            delay,
            duration,
            easing: ease,
            fill: "both",
            ...options
        });

        animations.push(animation);

        if (document.hidden) {
            animation.pause();
        }

        return animation;
    }
    function enter(
        selector,
        delay,
        duration,
        initialTransform
    ) {
        return play(
            selector,
            [
                {
                    opacity: 0,
                    transform: initialTransform
                },
                {
                    opacity: 1,
                    transform: "translate3d(0,0,0) scale(1)"
                }
            ],
            delay,
            duration
        );
    }
    function start(at = Date.now()) {
        if (started) return;

        started = true;

        if (prefersReducedMotion.matches) {
            document.documentElement.classList.add(
                "reduce-motion"
            );
            return;
        }
        const wait = Math.max(0, at - Date.now());

        if (ad.classList.contains("ad--top")) {

            play(
                ".top-headline",
                [
                    {
                        opacity: 0,
                        transform: "translateY(12px)",
                        clipPath: "inset(0 0 100% 0)"
                    },
                    {
                        opacity: 1,
                        transform: "translateY(0)",
                        clipPath: "inset(0 0 0 0)"
                    }
                ],
                wait + 400,
                1900
            );

            return;
        }
        enter(
            ".logo",
            wait + 180,
            1000,
            "translateY(-24px) scale(.92)"
        );
        enter(
            ".panel",
            wait + 1150,
            1100,
            "translateY(32px)"
        );

        // 3. German copy
        enter(
            ".copy",
            wait + 2050,
            900,
            "translateY(12px)"
        );
        enter(
            ".cta",
            wait + 3100,
            850,
            "translateY(16px) scale(.90)"
        );
        play(
            ".cta-art",
            [
                { transform: "scale(1)" },
                { transform: "scale(1.03)" },
                { transform: "scale(1)" }
            ],
            wait + 5300,
            2600,
            {
                iterations: 4,
                easing: "ease-in-out",
                fill: "none"
            }
        );
    }
    document.addEventListener(
        "visibilitychange",
        () => {
            for (const animation of animations) {

                if (
                    document.hidden &&
                    ["running", "pending"].includes(
                        animation.playState
                    )
                ) {
                    animation.pause();
                }

                else if (
                    !document.hidden &&
                    animation.playState === "paused"
                ) {
                    animation.play();
                }
            }
        }
    );
    window.addEventListener("message", event => {
        if (
            event.source !== window.parent ||
            event.origin !== location.origin
        ) {
            return;
        }

        if (event.data?.type === "fireplace-start") {
            start(event.data.at);
        }
    });
    const inPreview = new URLSearchParams(
        location.search
    ).get("preview") === "1";

    const background = new Image();
    background.src = "assets/bg-big.jpg";

    const images = [
        ...ad.querySelectorAll("img"),
        background
    ];

    Promise.all(
        images.map(image =>
            image.decode().catch(() => {})
        )
    ).then(() => {
        if (inPreview && window.parent !== window) {

            window.parent.postMessage(
                { type: "fireplace-ready" },
                location.origin
            );

        } else {
            start();
        }
    });

})();
