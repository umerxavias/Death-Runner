export default class InputManager {
  constructor() {
    this.keyboard = Object.create(null);
    this.keypress = Object.create(null);
    this.mouse = Object.create(null);
    this.mousePress = Object.create(null);

    this.mousePos = [];
    this.mouseMoved = true;
    this.events = [];
    this.canvas = null;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  addEventListener(eventName, cb, target = window) {
    target.addEventListener(eventName, cb);
    this.events.push([eventName, cb, target]);
  }

  start() {
    // Keyboard events on window
    this.addEventListener("keydown", (e) => {
      this.handleKeyEvent(e.key, true);
    });

    this.addEventListener("keyup", (e) => {
      this.handleKeyEvent(e.key, false);
    });

    // Mouse events on canvas if available
    if (this.canvas) {
      // Prevent default to ensure proper handling
      this.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos = [e.clientX - rect.left, e.clientY - rect.top];
        console.log('Mouse down at:', this.mousePos); // Debug
        this.handleMouseEvent(e.button, true);
      }, this.canvas);

      this.addEventListener("mouseup", (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos = [e.clientX - rect.left, e.clientY - rect.top];
        console.log('Mouse up at:', this.mousePos); // Debug
        this.handleMouseEvent(e.button, false);
      }, this.canvas);

      this.addEventListener("mousemove", (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos = [e.clientX - rect.left, e.clientY - rect.top];
        this.mouseMoved = true;
      }, this.canvas);

      // Also add click event as backup
      this.addEventListener("click", (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos = [e.clientX - rect.left, e.clientY - rect.top];
        console.log('Mouse click at:', this.mousePos); // Debug
        this.handleMouseEvent(0, true);
        setTimeout(() => this.handleMouseEvent(0, false), 10);
      }, this.canvas);
    }
  }

  end() {
    this.events.forEach((event) => {
      const target = event[2] || window;
      target.removeEventListener(event[0], event[1]);
    });

    this.events = [];
  }

  getMousePosition() {
    return this.mousePos;
  }

  mouseToButton(str) {
    if (str === "left") {
      return 0;
    }
    if (str === "right") {
      return 2;
    }

    return parseInt(str);
  }

  isMouseMove() {
    if (this.mouseMoved) {
      this.mouseMoved = false;
      return true;
    }

    return false;
  }

  isKeyDown(char) {
    var keyCode = char.toString().toLowerCase();

    return !!this.keyboard[keyCode];
  }

  isKeyPressed(char) {
    var keyCode = char.toString().toLowerCase();

    var output = this.keypress[keyCode];
    if (output) {
      this.keypress[keyCode] = false;
    }

    return output;
  }

  isMouseDown(str) {
    return this.mouse[this.mouseToButton(str)];
  }

  isMousePressed(str) {
    var button = this.mouseToButton(str);

    var output = this.mousePress[button];
    if (output) {
      this.mousePress[button] = false;
    }

    return output;
  }

  handleKeyEvent(char, state) {
    var keyCode = char.toString().toLowerCase();

    if (state && this.keyboard[keyCode]) {
      return;
    }
    this.keyboard[keyCode] = state;
    this.keypress[keyCode] = state;
  }

  handleMouseEvent(button, state) {
    this.mouse[button] = state;
    this.mousePress[button] = state;
  }
}
