import { fromEvent, map, merge, mergeAll, takeUntil } from "rxjs";

const canvas = document.querySelector("#reactive-canvas");
const restartButton = document.querySelector("#restart-button");

const cursorPosition = { x: 0, y: 0 };

const updateCursorPosition = (event) => {
  cursorPosition.x = event.clientX - canvas.offsetLeft;
  cursorPosition.y = event.clientY - canvas.offsetTop;
};

const onMouseDown$ = fromEvent(canvas, "mousedown").pipe(
  map(updateCursorPosition)
);
const onMouseUp$ = fromEvent(canvas, "mouseup");
const onMouseMove$ = fromEvent(canvas, "mousemove").pipe(takeUntil(onMouseUp$));

let onMouseMoveSubscription = onMouseDown$.subscribe();

const canvasContext = canvas.getContext("2d");
canvasContext.lineWidth = 8;
canvasContext.lineJoin = "round";
canvasContext.lineCap = "round";
canvasContext.strokeStyle = "white";

const paintStroke = (event) => {
  canvasContext.beginPath();
  canvasContext.moveTo(cursorPosition.x, cursorPosition.y);
  updateCursorPosition(event);
  canvasContext.lineTo(cursorPosition.x, cursorPosition.y);
  canvasContext.stroke();
  canvasContext.closePath();
};

const startPaint$ = onMouseDown$.pipe(
  map(() => onMouseMove$),
  mergeAll()
);

let startPaintSubscription = startPaint$.subscribe(paintStroke);

const onLoad$ = fromEvent(window, "load");
const onRestart$ = fromEvent(restartButton, "click");

const clearCanvas$ = merge(onLoad$, onRestart$);

clearCanvas$.subscribe(() => {
  startPaintSubscription.unsubscribe();
  onMouseMoveSubscription.unsubscribe();
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  startPaintSubscription = startPaint$.subscribe(paintStroke);
  onMouseMoveSubscription = onMouseDown$.subscribe();
});
