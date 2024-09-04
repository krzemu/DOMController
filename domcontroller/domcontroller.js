class DOMController {
    #nodeLength = 0;
    #templateLength = 0;
    constructor({ layoutMountDelay = 20, autoKeyPrefix = 'El', keyRequired = true, autoKey = false } = {}) {
        this.nodeList = keyRequired ? {} : [];
        this.templateList = keyRequired ? {} : [];
        this.layoutMountDelay = layoutMountDelay;
        this.keyRequired = keyRequired;
        this.autoKey = autoKey;
        this.autoKeyPrefix = autoKeyPrefix;
    }

    // Setters
    createElement({ key, id, type = 'div', style, onClick, classList, textContent, innerHTML, props, appendChild, prepend, beforeMountCallback, afterMountCallback, layoutMountCallback }) {
        const { keyRequired, layoutMountDelay, autoKey } = this;
        const el = document.createElement(type);
        if (id) el.id = id;

        keyRequired && !autoKey && this.#validateKey(key);
        this.#addElToNodeList(key, el);

        if (style) el.style = style;

        if (classList) {
            if (Array.isArray(classList)) {
                classList.forEach(className => el.classList.add(className));
            } else {
                el.classList.add(classList)
            }
        }

        if (props && typeof props === 'object') {
            for (let k in props) {
                el.setAttribute(k, props[k]);
            }
        }
        onClick && el.addEventListener('click', onClick);

        if (textContent) el.textContent = textContent;
        if (innerHTML) el.innerHTML = innerHTML;

        beforeMountCallback && beforeMountCallback(el);
        appendChild && appendChild.appendChild(el);

        prepend && prepend.prepend(el);

        afterMountCallback && afterMountCallback(el);
        layoutMountCallback && window.requestAnimationFrame(() => layoutMountCallback(el));

        return el;
    }

    createTemplate({ key, template = [], container, getSelectors, beforeMountCallback, afterMountCallback, layoutMountCallback }) {
        const { keyRequired, autoKey } = this;
        beforeMountCallback?.(template, container);

        this.#attachElementsToTemplate(template, container);

        keyRequired && !autoKey && this.#validateKey(key);
        const selectors = getSelectors?.(container);
        afterMountCallback?.(selectors, template, container)
        if (typeof layoutMountCallback === 'function') {
            window.requestAnimationFrame(layoutMountCallback(selectors, template, container))

        }

        this.#addTemplateToTemplateList(key, container, selectors)
        return {
            container,
            template,
            selectors
        }
    }


    mountTemplate({ template, appendChild, prepend, beforeMountCallback, afterMountCallback, layoutMountCallback }) {
        beforeMountCallback?.(template);
        appendChild && appendChild.appendChild(template);
        prepend && prepend.prepend(template);
        afterMountCallback?.(template);
        if (typeof layoutMountCallback === 'function') {
            window.requestAnimationFrame(() => layoutMountCallback(template))
        }
    }

    unMountTemplate({ key, beforeMountCallback, afterMountCallback, unMountDelay }) {
        const template = this.getTemplateByKey(key);
        if (!template) this.#error(`Template with ${key} doesn't exist`);
        beforeMountCallback?.(template);
        if (!unMountDelay) {
            template.container.remove();
            afterMountCallback?.(template);
        }
        else {
            setTimeout(() => {
                template.container.remove();
                afterMountCallback?.(template);
            }, unMountDelay)
        }
    }

    // Elements Manipulation
    mountElements(prepend, appendChild, beforeMountCallback, afterMountCallback, layoutMountCallback, beforeItemMountCallback, afterItemMountCallback, layoutItemMountCallback) {
        const nodeList = this.#getArrayElements();
        beforeMountCallback && beforeMountCallback(nodeList);

        nodeList.forEach((item, i) => {
            beforeItemMountCallback && beforeItemMountCallback(item, i)
            prepend && prepend.prepend(item);
            appendChild && appendChild.appendChild(item);
            afterItemMountCallback && afterItemMountCallback(item, i)
            layoutItemMountCallback && window.requestAnimationFrame(() => layoutItemMountCallback(item, i));
        })

        afterMountCallback && afterMountCallback(nodeList);
        layoutMountCallback && window.requestAnimationFrame(layoutMountCallback);
    }

    unMountElements(beforeMountCallback, afterMountCallback, layoutMountCallback, beforeItemMountCallback, afterItemMountCallback, layoutItemMountCallback) {
        const nodeList = this.#getArrayElements();
        beforeMountCallback && beforeMountCallback(nodeList);

        nodeList.forEach((item, i) => {
            beforeItemMountCallback && beforeItemMountCallback(item, i)
            item.remove();
            afterItemMountCallback && afterItemMountCallback(item, i)
            typeof layoutItemMountCallback === 'function' && window.requestAnimationFrame(layoutItemMountCallback(item, i));
        })

        afterMountCallback && afterMountCallback(nodeList);
        layoutMountCallback && window.requestAnimationFrame(layoutMountCallback(nodeList));
    }

    // Getters
    getElementByKey(key) {
        const el = this.nodeList[key];
        if (!el) this.#error(`Element with key ${key} doesn't exist`);
        return el;
    }

    getElementById(id) {
        const { nodeList, keyRequired } = this;
        let el;
        if (keyRequired === false) {
            el = nodeList.find(item => item.id === id)
        } else {
            for (let k in nodeList) {
                if (nodeList[k].id === id) el = nodeList[k];
                break;
            }
        }
        if (!el) { this.#error(`Element with id ${id} doesn't exist`); return false; };
        return el;
    }

    getElementsByClassName(className) {
        const { nodeList, keyRequired } = this;
        let els = [];
        if (keyRequired) {
            for (let k in nodeList) {
                if (nodeList[k].classList.contains(className)) els.push(nodeList[k])
            }
        } else {
            els = nodeList.filter(item => item.classList.contains(className));
        }
        if (els.length === 0) {
            this.#error(`Elements with className ${className} doesn't exist`);
            return false;
        }
        return els;
    }

    getTemplateByKey(key) {
        const template = this.templateList[key];
        if (!template) this.#error(`Element with key ${key} doesn't exist`);
        return template;
    }

    // Utils
    #validateKey(key) {
        if (!key) {
            this.#error('Key is missing');
            return false;
        }
        if (this.nodeList[key]) {
            this.#error(`Element with ${key} already exist. Key must be uniqe`);
        }
        return true;
    }
    #error(message) {
        console.error(`DOMController: ${message}`)
    }

    #addElToNodeList(key, el, validateKey = false) {
        if (validateKey && this.#validateKey(key)) return false;
        if (this.keyRequired === true) {
            if (this.autoKey && !key) {
                this.nodeList[`${this.autoKeyPrefix}-${this.#nodeLength}`] = el;
                this.#nodeLength += 1;
            } else {
                this.nodeList[key] = el;
            }
        } else {
            this.nodeList.push(el);
        }
    }
    #addTemplateToTemplateList(key, el, selectors, validateKey = false) {
        if (validateKey && this.#validateKey(key)) return false;
        if (this.keyRequired === true) {
            if (this.autoKey && !key) {
                this.templateList[`${this.autoKeyPrefix}-${this.#templateLength}`] = { container: el, selectors };
                this.#templateLength += 1;
            } else {
                this.templateList[key] = { container: el, selectors };
            }
        } else {
            this.templateList.push({ container: el, selectors });
        }
    }

    #getArrayElements() {
        const { keyRequired, nodeList } = this;
        const els = [];
        if (keyRequired) {
            for (let k in nodeList) {
                els.push(nodeList[k])
            }
        } else {
            els.push(...nodeList);
        }
        return els;
    }

    #attachElementsToTemplate(elements, container) {
        if (typeof elements === 'function') elements().forEach(item => container.appendChild(item))
        else if (Array.isArray(elements)) elements.forEach(item => {
            if (typeof item === 'object' && item.container) {
                const newEl = this.#attachElementsToTemplate(item.template, item.container)
                container.appendChild(newEl);
            }
            else container.appendChild(item)
        }
        )
        else if (typeof elements === 'object' && elements.container) {
            console.log('container');
            this.#attachElementsToTemplate(elements.template, elements.container)
        }
        else container.appendChild(elements);
        return container
    }
}