.pragma library

var columns = 4;
var rows = 4;

var arrGrid = [];
var arrCells = [];
var baseObj = null;
var moveCount = 0;
var moving = false;

var colors = { "": "white", "1":"#eee4da", "3":"#ece0c8", "9":"#f2b179", "27":"#f59563", "81":"#f57c5f", "243":"#f95c3b",
                "729":"#edce71", "2187":"#eecc61", "6561":"#ebc850", "19683":"#edc53f" }//, "2048":"#eec22e", "4096":"#3d3a33", "8192":"#3d3a33", "16384":"#3d3a33" }

var fontSize = { 0:1, 1:45, 2:40, 3:35, 4:30, 5:25, 6:20, 7:10, 8:5 }

function init(col, row, parent)
{
    columns = col;
    rows = row;
    baseObj = parent;

    for (var i = 0; i < rows; ++i) {
        arrCells[i] = [];
        for (var j = 0; j < columns; ++j) {
            arrCells[i][j] = 0;
        }
    }

    restart();
}

function clean_cells() {

    for (var i = 0; i < arrCells.length; ++i) {
        for (var j = 0; j < arrCells[i].length; ++j) {
            if (arrCells[i][j] !== 0) {
                arrCells[i][j].destroy();
            }
        }
    }

    for (var i = 0; i < rows; ++i) {
        arrCells[i] = [];
        for (var j = 0; j < columns; ++j) {
            arrCells[i][j] = 0;
        }
    }
}

function restart() {
    baseObj.scoreBoard.score = 0;

    clean_cells();

    for (var i = 0; i < rows; ++i) {
        arrGrid[i] = []
        for (var j = 0; j < columns; ++j) {
            arrGrid[i][j] = 0;
        }
    }

    random_block();
    random_block();

    moving = false;
    baseObj.gameOverWnd.opacity = 0.0
    baseObj.gameOverWnd.visible = false;
}

function is_next_step() {
    for (var i = 0; i < rows; ++i) {
        for (var j = 0; j < columns - 1; ++j) {
            if (arrGrid[i][j] === arrGrid[i][j+1])
                return true;
        }
    }

    for (var i = 0; i < rows - 1; ++i) {
        for (var j = 0; j < columns; ++j) {
            if (arrGrid[i][j] === arrGrid[i+1][j])
                return true;
        }
    }

    return false;
}

function gameOver() {
    moving = true;
    baseObj.scoreBoard.bestScore = Math.max(baseObj.scoreBoard.score, baseObj.scoreBoard.bestScore);
    baseObj.gameOverWnd.visible = true;
    baseObj.gameOverWnd.animateOpacity.start();
}

function random_block()
{
    var x, y;
    var empty_block = [];

    for (var i = 0; i < rows; ++i) {
        for (var j = 0; j < columns; ++j) {
            if(arrGrid[i][j] === 0) {
                empty_block.push([i,j]);
            }
        }
    }

    if (empty_block.length) {
        var cell = empty_block[Math.floor(Math.random() * empty_block.length)];
        var value = Math.floor(Math.random() < 0.9 ? 1 : 3);
        create(cell[0], cell[1], value, true);
    }

    if (empty_block.length <= 1) {
        if (!is_next_step())
            gameOver();
    }

}

function move_object(row, col, row2, col2) {
    var cell1 = arrGrid[row][col];
    var cell2 = arrGrid[row2][col2];

    if ((cell1 !== 0 && cell2 !== 0) && cell1 !== cell2)
        return false;

    arrCells[row][col].animMove = true;

    if ( (cell1 !== 0 && cell1 === cell2) ||
         (cell1 !== 0 && cell2 === 0) )
    {
        arrGrid[row][col] = 0;
        arrCells[row][col].x = arrCells[row][col].width * col2;
        arrCells[row][col].y = arrCells[row][col].height * row2;
        moving = true;
        ++moveCount;
    }

    if (cell1 !== 0 && cell1 === cell2) {
        arrGrid[row2][col2] *= 3;
        baseObj.scoreBoard.score += arrGrid[row2][col2];
        return false;
    }

    if (cell1 !== 0 && cell2 === 0) {
        arrGrid[row2][col2] = cell1;
        return true;
    }
    return true;
}

function on_animation_end()
{
    moving = false;
    --moveCount;
    if (moveCount != 0)
        return;

    clean_cells();

    for (var i = 0; i < rows; ++i) {
        for (var j = 0; j < columns; ++j) {
            if (arrGrid[i][j] !== 0)
                create(i, j, arrGrid[i][j], false);
        }
    }

    random_block();
}

function move(direction)
{
    if(moving)
        return;

    if (direction === Qt.Key_Left || direction=== Qt.Key_Up) {
        for (var i = 0; i < rows; ++i) {
            for (var j = 0; j < columns; ++j) {
                for (var f = j+1; f < rows; ++f ) {
                    if (direction === Qt.Key_Left) {
                        if (!move_object(i, f, i, j))
                            break;
                    } else {
                        if(!move_object(f, i, j, i))
                            break;
                    }
                }
            }
        }
    }

    if (direction === Qt.Key_Right || direction === Qt.Key_Down) {
        for (var i = 0; i < rows; ++i) {
            for (var j = columns - 1; j >= 0; --j) {
                for (var f = j-1; f >= 0; --f ) {
                    if (direction === Qt.Key_Right) {
                        if (!move_object(i, f, i, j))
                            break;
                    } else {
                        if (!move_object(f, i, j, i))
                            break;
                    }
                }
            }
        }
    }
}

function create(row, col, value, respaun)
{
    var component = Qt.createComponent("Cell.qml");
    var object = component.createObject(baseObj.board);

    object.value = value;
    object.animSize = respaun;
    object.x = object.width * col;
    object.y = object.height * row;
    object.size = Qt.size(baseObj.board.width / rows - 10, baseObj.board.height / columns - 10);

    arrGrid[row][col] = object.value;
    arrCells[row][col] = object;
}
