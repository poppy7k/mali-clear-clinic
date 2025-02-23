class RichTextEditor extends HTMLElement {
    constructor() {
        super();
        this.undoStack = [];
        this.redoStack = [];
        this.lastHtml = "";
    }

    connectedCallback() {
        this.render();
        this.setupEditor();
        this.observeChanges();
        this.saveState();
    }

    render() {
        this.innerHTML = `
            <div class="border border-gray-300 rounded-md overflow-hidden">
                <div class="bg-gray-50 border-b border-gray-300 p-2 flex gap-2">
                    ${this.renderToolbarButton("bold", "B")}
                    ${this.renderToolbarButton("italic", "I")}
                    ${this.renderToolbarButton("underline", "U")}
                    <div class="h-6 w-px bg-gray-300 mx-1"></div>
                    ${this.renderToolbarButton("ul", "• List")}
                    ${this.renderToolbarButton("ol", "1. List")}
                    <div class="h-6 w-px bg-gray-300 mx-1"></div>
                    ${this.renderToolbarButton("createLink", "🔗")}
                    ${this.renderToolbarButton("removeFormat", "❌ Clear")}
                    <div class="h-6 w-px bg-gray-300 mx-1"></div>
                    ${this.renderToolbarButton("undo", "↶")}
                    ${this.renderToolbarButton("redo", "↷")}
                </div>
                <div id="editor" 
                    class="p-3 min-h-[200px] focus:outline-none text-gray-600 placeholder:text-gray-400" 
                    contenteditable="true"
                    data-placeholder="พิมพ์ข้อความที่นี่..."></div>
            </div>
        `;
    }

    renderToolbarButton(command, label) {
        return `
            <button type="button" data-command="${command}" class="p-1 hover:bg-gray-200 rounded text-sm">
                ${label}
            </button>
        `;
    }

    setupEditor() {
        const editor = this.querySelector("#editor");
        const buttons = this.querySelectorAll("[data-command]");

        editor.addEventListener("mouseup", () => this.updateButtonStates());
        editor.addEventListener("keyup", () => {
            this.updateButtonStates();
            this.saveState();
        });

        editor.addEventListener("input", () => this.handleInput());
        editor.addEventListener("keydown", (e) => this.handleEnterKey(e)); // ✅ แก้ไข function call
        editor.addEventListener("paste", (e) => this.handlePaste(e));

        buttons.forEach((button) => {
            button.addEventListener("click", (event) => {
                const command = button.dataset.command;
                switch (command) {
                    case "undo":
                        this.undo();
                        break;
                    case "redo":
                        this.redo();
                        break;
                    case "ul":
                        this.toggleList("ul");
                        break;
                    case "ol":
                        this.toggleList("ol");
                        break;
                    case "createLink":
                        this.insertLink();
                        break;
                    case "removeFormat":
                        this.clearFormatting();
                        break;
                    default:
                        this.toggleInlineFormat(command);
                }
            });
        });
    }

    updateButtonStates() {
        const buttons = this.querySelectorAll("[data-command]");
        buttons.forEach((button) => {
            const command = button.dataset.command;
            if (!["ul", "ol", "undo", "redo", "createLink", "removeFormat"].includes(command)) {
                button.classList.toggle("bg-gray-300", this.isCommandActive(command));
            }
        });
    }

    isCommandActive(tag) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;

        const range = selection.getRangeAt(0);
        const parentNode = range.commonAncestorContainer.parentNode;
        const tagName = tag === "bold" ? "b" : tag === "italic" ? "i" : "u";

        return !!parentNode.closest(tagName);
    }

    toggleInlineFormat(tag) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const parentNode = range.commonAncestorContainer.parentNode;
        const tagName = tag === "bold" ? "b" : tag === "italic" ? "i" : "u";

        if (parentNode.closest(tagName)) {
            this.unwrapElement(range, tagName);
        } else {
            this.wrapSelection(range, tagName);
        }
    }

    wrapSelection(range, tag) {
        const wrapper = document.createElement(tag);
        wrapper.appendChild(range.extractContents());
        range.insertNode(wrapper);
        this.saveState();
    }

    unwrapElement(range, tag) {
        const parent = range.commonAncestorContainer.parentNode;
        if (parent.tagName.toLowerCase() === tag) {
            while (parent.firstChild) {
                parent.parentNode.insertBefore(parent.firstChild, parent);
            }
            parent.parentNode.removeChild(parent);
        }
        this.saveState();
    }

    handleEnterKey(e) {
        if (e.key === "Enter") {
            e.preventDefault();

            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const parentElement = range.startContainer.parentElement;

            if (e.shiftKey) {
                const br = document.createElement("br");
                range.insertNode(br);
                range.setStartAfter(br);
                range.setEndAfter(br);
            } else {
                if (parentElement.tagName !== "LI") {
                    const p = document.createElement("p");
                    p.innerHTML = "<br>";
                    range.insertNode(p);
                    range.setStartAfter(p);
                    range.setEndAfter(p);
                }
            }

            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    handlePaste(e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text");
        document.execCommand("insertText", false, text);
    }

    handleInput() {
        this.saveState();
    }

    observeChanges() {
        const editor = this.querySelector("#editor");
        const observer = new MutationObserver(() => this.saveState());
        observer.observe(editor, { childList: true, subtree: true });
    }

    saveState() {
        const currentContent = this.getContent();
        if (currentContent !== this.lastHtml) {
            this.undoStack.push(currentContent);
            this.lastHtml = currentContent;
            this.redoStack = [];
        }
    }

    undo() {
        if (this.undoStack.length > 1) {
            this.redoStack.push(this.undoStack.pop());
            this.setContent(this.undoStack[this.undoStack.length - 1]);
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const nextState = this.redoStack.pop();
            this.undoStack.push(nextState);
            this.setContent(nextState);
        }
    }

    setContent(html) {
        this.querySelector("#editor").innerHTML = html;
    }

    getContent() {
        return this.querySelector("#editor").innerHTML;
    }
}

customElements.define("rich-text-editor", RichTextEditor);
