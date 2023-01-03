// Animation transitions inspired by Vue and Alpine
//
// classesDuring: Applied during the entire transition.
// classesStart: Added before element is transitioned, removed one frame after element is transitioned.
// classesEnd: Added one frame after element is transitioned (at the same time classesStart is removed), removed when transition/animation finishes.
//
// @returns a Promise that resolves when the transition/animation finishes.

export function transition(
    el: HTMLElement,
    settings: {
        classesDuring: string | string[]
        classesStart: string | string[]
        classesEnd: string | string[]
        onBeforeTransition?: () => {}
        onAfterTransition?: () => {}
    }
): Promise<void> {
    return new Promise((resolve) => {
        const {
            onBeforeTransition = new Function(),
            onAfterTransition = new Function(),
        } = settings

        const classesDuring: string[] = Array.isArray(settings.classesDuring)
            ? settings.classesDuring
            : settings.classesDuring.split(' ')
        const classesStart: string[] = Array.isArray(settings.classesStart)
            ? settings.classesStart
            : settings.classesStart.split(' ')
        const classesEnd: string[] = Array.isArray(settings.classesEnd)
            ? settings.classesEnd
            : settings.classesEnd.split(' ')

        const finish = once(() => {
            onAfterTransition()

            if (el.isConnected) {
                el.classList.remove(
                    ...classesDuring.filter((i) => !originalClasses.includes(i))
                )
                el.classList.remove(
                    ...classesEnd.filter((i) => !originalClasses.includes(i))
                )
            }

            resolve()
        })

        const originalClasses = Array.from(el.classList)

        el.classList.add(...classesStart)
        el.classList.add(...classesDuring)

        requestAnimationFrame(() => {
            // Note: Safari's transitionDuration property will list out comma separated transition durations
            // for every single transition property. Let's grab the first one and call it a day.
            let duration =
                Number(
                    getComputedStyle(el)
                        .transitionDuration.replace(/,.*/, '')
                        .replace('s', '')
                ) * 1000

            if (duration === 0) {
                duration =
                    Number(
                        getComputedStyle(el).animationDuration.replace('s', '')
                    ) * 1000
            }

            onBeforeTransition()

            requestAnimationFrame(() => {
                el.classList.remove(
                    ...classesStart.filter((i) => !originalClasses.includes(i))
                )
                el.classList.add(...classesEnd)

                setTimeout(finish, duration)
            })
        })
    })
}

/**
 * Execute a function onlyu once
 *
 * @param cb function
 */
function once(cb: () => any) {
    let called = false
    return function (this: unknown, ...args: []) {
        if (!called) {
            called = true
            cb.apply(this, args)
        }
    }
}
