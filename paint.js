const activeTool = document.getElementById('active-tool');
const brushColor = document.getElementById('brush-color');
const brushSize = document.getElementById('brush-size');
const brushIcon = document.getElementById('brush');
const brushSlider = document.getElementById('brush-slider');
const bucketTool = document.getElementById('bucket-color');
const eraser = document.getElementById('eraser');
const undoCanvas = document.getElementById('undo-canvas');
const saveStorage = document.getElementById('save-storage');
const loadStorage = document.getElementById('load-storage');
const clearStorage = document.getElementById('clear-storage');
const download = document.getElementById('download');
const bucket = document.getElementById('bucket');
const brush = document.getElementById('brush');
const { body } = document;

const BRUSH_SHOW = 'brush';
const BUCKET_SHOW = 'bucket';
const ERASER_SHOW = 'eraser';

const canvas = document.createElement('canvas');
canvas.id = 'canvas';
const context = canvas.getContext('2d');

let mouseDown = false;
let currentBrushSize = 2;
let bucketColor = '#ffffff';
let currentColor = '#f511ff';
let isEraser = false;
let storedDraw = [];
let bucketInUse = false;
let firstRun = true;


//Create canvas
function createCanvas(canvasColor = '#ffffff'){
    createAndChangeCanvasColor(canvasColor);
    body.appendChild(canvas);
    addRemoveActiveClass(BRUSH_SHOW);
}


/**
 * Load from localStorage stored draw if exists merge it to current draw data present in stroredDraw
 * variable and return merged  Array.
 * @returns {Array}
 */
function checkIfLocalStorageExistsAndConcatenateData(){
    const previousDraw = localStorage.getItem('draw');
    let joinedDraws = null;

    if(previousDraw == undefined || previousDraw == 'false' || previousDraw == null ){
        joinedDraws = storedDraw;
    }else{ 
        firstDraw =  JSON.parse(previousDraw);
        joinedDraws = firstDraw.concat(storedDraw);     
    }
    return joinedDraws;
}

/** Add remove active css class to show currently use tool */
function addRemoveActiveClass(show){
    if(show === 'brush'){
        activeTool.innerHTML = 'BRUSH';
        brushIcon.classList.add('active');  
        bucket.classList.remove('active');         
        eraser.classList.remove('active');
    } else if (show === 'bucket'){
        activeTool.innerHTML = 'BUCKET';
        brushIcon.classList.remove('active');  
        bucket.classList.add('active');         
        eraser.classList.remove('active');
    } else if (show === 'eraser'){
        activeTool.innerHTML = 'ERASER';
        brushIcon.classList.remove('active');  
        bucket.classList.remove('active');         
        eraser.classList.add('active');
    }
}


/**
 * set canvas color used in loading the draw from localstorage
 * and setting bucketColor variable after refresh page and subsequent reload draw from localStorage
 * after clicking load button.
 * @param {Array} draw
 * @returns {string}
 */
function setCanvasColor(draw) {
    let tempCanvasColor = null;
    for(let z = draw.length; z > 0 ;z--){
        if( (draw[z] === null) || (draw[z] === undefined)) {
            continue ;
        } else if( (draw[z].canvasColor === undefined) || (draw[z].canvasColor === false) ){
            continue; 
        } else {  
            tempCanvasColor = draw[z].canvasColor;
            break;
        }
    }
    return tempCanvasColor;
}

/**
 * Store drawed image in storedDraw Array.
 * @param {int} x
 * @param {int} y
 * @param {int} currentSize
 * @param {string} currentColor
 * @param {boolean} eraser
 * @param {string} bucketColor
 * @returns {Array}
 */
function storeDraw(x, y, currentSize, currentColor, eraser, bucketColor ){
    const line = {
        x: x,
        y: y,
        size: currentSize,
        color: currentColor,
        isEraser: eraser,
        canvasColor: bucketColor
    };
    storedDraw.push(line);   
}

function clearDrawData(draw){
    let tempData = draw;
    tempData = draw.filter((item) => {
        if((Object.keys(item).length === 0) || (item === undefined)){
            return;
        }else{
            return item;
        }            
    });
    return tempData;
}

/**
 * Restore image (draw a drawing from stored data)
 * @param {Array} draw
 */
function restoreDraw(inputDraw){
    const draw = clearDrawData(inputDraw);
    let localCanvasCol = setCanvasColor(draw);
    createAndChangeCanvasColor(localCanvasCol);

    for(let i = 1; i < draw.length; i++){ 
        if(draw[i] !== undefined){
            context.beginPath();
        context.moveTo(draw[i - 1].x, draw[i - 1].y);
        context.lineCap = 'round';
        
        if(draw[i].isEraser){
            context.strokeStyle = localCanvasCol;
            context.lineWidth = draw[i].size;
            context.lineTo(draw[i].x, draw[i].y);    
        } else {     
            context.strokeStyle = draw[i].color;
            context.lineWidth = draw[i].size;
            context.lineTo(draw[i].x, draw[i].y);            
        }
          
        context.stroke();
        }
        
    }
}

/**
 * store in localStorage drawed image
 * @param {Array} item
 */
function saveDrawInLocalstorate(item){
    localStorage.setItem('draw', JSON.stringify(item));
}

/**
 * set the brush size 
 */
function getBrushSize(){
    let size =  Math.ceil(brushSlider.value / 5);

    if(size < 10){
        size = `0${size}`;
    }

    brushSize.innerHTML = size;
    currentBrushSize = size;
}

/**
 * get mouse position according to cavas
 * @param {Object} event
 * @returns {Object}
 */
function getMousePos(event){
    const pos = canvas.getBoundingClientRect();
    return {
        x : event.clientX - pos.left,
        y : event.clientY - pos.top
    }
}

/**
 * Function undo changes made in draw by removing form end of storedDraw array obejcts 
 * respresenting strokes made by user
 */
function undoChangesInDraw(){
    let resultData = storedDraw;
    
    if(resultData){
        for(let i = resultData.length; i >= 0; i--){ 
            if(resultData[i] === undefined ){ 
                delete resultData[i];
            }else{
                let offset = 0;
                for(z = 0; z < 100; z++){
                    delete resultData[i - z];
                    offset = z;
                }
                resultData[i - z]  =   {
                    x:undefined, 
                    y:undefined, 
                    size: undefined, 
                    color: undefined, 
                    isEraser: undefined, 
                    canvasColor: undefined
                };
                resultData[i]      =   {
                    x:undefined, 
                    y:undefined, 
                    size: undefined, 
                    color: undefined, 
                    isEraser: undefined, 
                    canvasColor: undefined}
                    ;        
                break;
            }           
        }
    }
    storedDraw = clearDrawData(resultData);
    restoreDraw(storedDraw);  
}

/**
 * Create cavase and set color of it to chosen value
 * @param {string} color='#ffffff'
 */
function createAndChangeCanvasColor(color = '#ffffff'){    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 58;
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

brushSlider.addEventListener('change', ()=>{
    getBrushSize();
})

/**
 * when mousedown event occures store drawed image using storeDraw function and canvas features,
 * also store when isEraser eraser works.
 * @param {string} 'mousedown'
 * @param {Object} 'event'
 */
canvas.addEventListener('mousedown', (event) => {
    mouseDown = true;
    const mousePos = getMousePos(event);
    context.beginPath(); 
    context.lineCap = 'round';

    if(isEraser){         
        context.moveTo(mousePos.x, mousePos.y);
        context.lineWidth = currentBrushSize;       
        context.strokeStyle = bucketColor; 
        storeDraw(mousePos.x, mousePos.y, currentBrushSize, currentColor, isEraser, bucketColor); 
    }else{
        context.moveTo(mousePos.x, mousePos.y);
        context.lineWidth = currentBrushSize;
        context.strokeStyle = currentColor; 
        storeDraw(mousePos.x, mousePos.y, currentBrushSize, currentColor, isEraser, bucketColor); 
    };  

    context.stroke();
    
})

canvas.addEventListener('mouseup', ()=>{
    mouseDown = false; 
})

/**
 * when mousemove event occures store drawed image using storeDraw function and canvas features,
 * also store when isEraser eraser works.
 * @param {string} 'mousemove'
 * @param {Object} 'event'
 */
canvas.addEventListener('mousemove', (event) => {

    if(!isEraser && mouseDown){
        const mousePos = getMousePos(event);
        context.lineTo(mousePos.x, mousePos.y);
        context.stroke();
        storeDraw(mousePos.x, mousePos.y, currentBrushSize, currentColor, isEraser, bucketColor);
    }else if (isEraser && mouseDown) {
        const mousePos = getMousePos(event);
        context.lineTo(mousePos.x, mousePos.y);
        context.strokeStyle = bucketColor;
        context.stroke();    
        storeDraw(mousePos.x, mousePos.y, currentBrushSize, currentColor, isEraser, false);
    }else{
        storeDraw({
            x:undefined, 
            y:undefined, 
            size: undefined, 
            color: undefined, 
            isEraser: undefined, 
            canvasColor: undefined
        });
    }  
})

brushSlider.addEventListener('change', ()=> {
    currentBrushSize = brushSlider.value / 5;
})

/**
 * when saveStorage icon is clicked  save the drawing using checkIfLocalStorageExistsAndConcatenateData()
 * and after save restore data using restoreDraw(), also show alert to indicte saved data
 */
saveStorage.addEventListener('click', () => {
    const joinedDraws = checkIfLocalStorageExistsAndConcatenateData();
    saveDrawInLocalstorate(joinedDraws);
    restoreDraw(storedDraw);
    addRemoveActiveClass(BRUSH_SHOW);
    alert('Drawing Saved')
});

/**
 * When load button is clicked load image data from localStorage and 
 * restore to show on canvas using restreDraw().
 */
loadStorage.addEventListener('click', ()=>{
    const draw = JSON.parse(localStorage.getItem('draw'));
    if(!draw){
        return
    }else{
        storedDraw = draw;
        if(firstRun){
            bucketColor = setCanvasColor(storedDraw);
            bucketTool.value = bucketColor;
            firstRun = false;
        }
        restoreDraw(storedDraw);
    }  

})

brushIcon.addEventListener('change',() => {
    bucketInUse = false;
    addRemoveActiveClass(BRUSH_SHOW);
});

/**
 * on change set color of bucket to fill the canvas and turn of eraser
 * also store color of bucket (canvas) in storedDraw Array and merge it with localStorage 
 * draw saved previously and restore merged image to canvas
 */
bucketTool.addEventListener('change', () => { 
    isEraser = false;
    bucketColor = bucketTool.value; 
    bucketInUse = true;
    addRemoveActiveClass(BUCKET_SHOW);
    storeDraw(undefined, undefined, undefined, undefined, undefined, bucketColor); 
    restoreDraw(storedDraw);
})

bucket.addEventListener('click', () => {
    bucketInUse = true;
    addRemoveActiveClass(BUCKET_SHOW);
    alert('Choose Color to Fill The Canvas');
})

brush.addEventListener('click', () => {
    isEraser = false;
    currentColor = brushColor.value;
    addRemoveActiveClass(BRUSH_SHOW);
})

brushColor.addEventListener('change', () => {
    isEraser = false;
    currentColor = brushColor.value;
    addRemoveActiveClass(BRUSH_SHOW);
})

/**
 * cleare localstorage by storing false instead of previous value using saveDrawInLocalstorate();
 * cleared storedDraw to empty array and show alert to indicate these data is cleared
 */
clearStorage.addEventListener('click', () => {
    saveDrawInLocalstorate(false);
    storedDraw = [];
    alert('Saved Draw Cleared');
    createCanvas();
});

eraser.addEventListener('click', ()=>{
    isEraser = true;  
    addRemoveActiveClass(ERASER_SHOW);
});

undoCanvas.addEventListener('click', () => {
    undoChangesInDraw() 
});

createCanvas();
