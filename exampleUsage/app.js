const domController = new DOMController({
    // keyRequired: false,
    autoKey: true
});

let value = 5;

const timer = domController.createTemplate({
    container: domController.createElement({ classList: 'timer', id: 'timer' }),
    template: [domController.createTemplate({
        container: domController.createElement({ classList: 'timer__inner' }),
        template: [
            domController.createElement({ type: 'h1', textContent: 'Timer' }),
            domController.createElement({ type: 'p', textContent: value, style: 'font-size:23px', classList: 'counter' }),
            domController.createTemplate({
                key: 'template',
                container: domController.createElement({ classList: 'actions' }),
                template: [
                    domController.createElement({ type: 'button', textContent: '+', classList: ['button', 'button--primary', 'button-accept'], key: 'button', onClick: () => { console.log('clicked') } }),
                    domController.createElement({ type: 'button', textContent: '-', classList: ['button', 'button--primary', 'button-cancel'], key: 'button' })
                ],
            })
        ],
    })],
    getSelectors: (el) => ({
        acceptButton: el.querySelector('.button-accept'),
        cancelButton: el.querySelector('.button-cancel'),
        counter: el.querySelector('.counter'),
    })
});

domController.mountTemplate({
    template: timer.container,
    appendChild: document.body
})


timer.selectors.acceptButton.addEventListener('click', () => {
    value += 5;
    timer.selectors.counter.textContent = value;
})

timer.selectors.cancelButton.addEventListener('click', () => {
    value -= 5;
    timer.selectors.counter.textContent = value;
})