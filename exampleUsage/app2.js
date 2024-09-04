const domController = new DOMController();

// Create Menu
domController.createTemplate({
    key: 'menuT',
    container: domController.createElement({ type: 'ul', id: 'menu', classList: 'menu', key: 'menu' }),
    template: () => DUMMY_MENU_DATA.map((item, index) => domController.createElement({ type: 'li', textContent: item, key: `menu_li__${index}` })),
    getSelectors: (el) => ({ li: el.querySelectorAll('li') })
});

domController.mountTemplate({
    template: domController.getElementByKey('menu'),
    appendChild: document.body
});

// Modal
domController.createTemplate({
    key: 'modalT',
    container: domController.createElement({ type: 'section', key: 'modal', classList: 'modal', }),
    template: [
        domController.createTemplate({
            key: 'ModalT_inner',
            container: domController.createElement({ key: 'modal_inner', classList: 'modal_inner' }),
            template: [
                domController.createElement({ type: 'h2', key: 'modal_heading' }),
                domController.createElement({ type: 'p', textContent: DUMMY_TEXT, key: 'modal_paragraph' }),
                domController.createElement({ type: 'button', textContent: 'Check out', classList: ['button', 'button--primary'], key: 'modal_button' }),
                domController.createElement({ type: 'div', textContent: 'X', classList: 'modal_close', key: 'modal_close' })
            ],
            getSelectors: (el) => ({
                heading: el.querySelector('h2'),
                button: el.querySelector('button')
            })
        })
    ],
    getSelectors: (el) => ({
        heading: el.querySelector('h2'),
        button: el.querySelector('button')
    })
})



// DOM Manipulation
const openModal = (e) => {
    domController.getElementByKey('modal_heading').textContent = e.target.textContent;
    domController.mountTemplate({
        template: domController.getElementByKey('modal'),
        appendChild: document.body,
        beforeMountCallback(template) {
            template.style.opacity = 0;
            template.style.transform = 'translateY(100px)';
        },
        layoutMountCallback(template) {
            template.style.opacity = 1;
            template.style.transform = 'translateY(0px)';
        }

    });
    domController.getElementByKey('modal_close').addEventListener('click', () => {
        domController.unMountTemplate({
            key: 'modalT',
            beforeMountCallback(template) {
                template.container.style.opacity = 0;
                template.container.style.transform = 'translateY(100px)';
            },
            unMountDelay: 300
        });
    }, { once: true })
    domController.getElementByKey('modal_button').addEventListener('click', () => {
        domController.unMountElements();
    }, { once: true })
}

domController.getTemplateByKey('menuT').selectors.li.forEach(item => {
    item.addEventListener('click', openModal)
})
