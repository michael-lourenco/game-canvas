class Canvas {
  constructor(id, parent, width, height) {
    this.id = id;
    this.parent = parent;
    this.width = width;
    this.height = height;
    this.context = null;
  }

  // new class stuff above here
  create() {
    if(this.context !== null) {
      // Canvas already created!
      return;
    } else {
      let divWrapper = document.createElement('div');
      let canvasElement = document.createElement('canvas');
      this.parent.appendChild(divWrapper);
      divWrapper.appendChild(canvasElement);

      divWrapper.id = this.id;
      canvasElement.width = this.width;
      canvasElement.height = this.height;

      this.context = canvasElement.getContext('2d');
    }
  }

}

export { Canvas };
