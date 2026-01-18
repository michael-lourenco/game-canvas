export class Canvas {
    public id: string;
    public parent: HTMLElement;
    public width: number;
    public height: number;
    public context: CanvasRenderingContext2D | null = null;

    constructor(id: string, parent: HTMLElement, width: number, height: number) {
        this.id = id;
        this.parent = parent;
        this.width = width;
        this.height = height;
    }

    create() {
        if (this.context !== null) {
            // Canvas already created!
            return;
        }

        const divWrapper = document.createElement('div');
        const canvasElement = document.createElement('canvas');
        this.parent.appendChild(divWrapper);
        divWrapper.appendChild(canvasElement);

        divWrapper.id = this.id;
        canvasElement.width = this.width;
        canvasElement.height = this.height;

        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2d context');
        }
        this.context = ctx;
    }
}
