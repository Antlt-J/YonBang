
var color = [
    'black', 'white'
];
var edgeLen = 15;
var sum = edgeLen * edgeLen;
var hoverColor = ['#36363680','#dededeb0'];

var data = [];
var board = null;
var curColor = 0;
var rootE = null;
var putSum = 0;

var sample = null;
var sampleText = null;

var isInit = init();

function init () {
    window.addEventListener('load', function () {
        rootE = document.documentElement;
        sample = document.getElementById('sample-grid');
        sampleText = document.getElementById('color-cur');
        board = initBoard(data);
        gameHelp('开始游戏');
    });
    let hp = document.getElementById('help-b');
    let rs = document.getElementById('rest-b');
    let fd = document.getElementById('fold-b');
    let ex = document.getElementById('info-ex');
    let info = document.getElementById('info');

    hp.addEventListener('click', function () {
        if(isInit) {
            gameHelp();
        } else {
            gameHelp('关闭帮助');
        }
        
    });
    rs.addEventListener('click', restart);
    fd.addEventListener('click', function() {
        gentlySlideHide(info);
        gentlySlideShow(ex);
    });
    ex.addEventListener('click', function() {
        gentlySlideShow(info);
        gentlySlideHide(ex);
    });

    document.getElementById('restart').addEventListener('click', restart);
    document.getElementById('continue').addEventListener('click', contiGame);
    return true;
}


function initBoard (data) {
    var boardEle = document.getElementById('chessboard');
    changeColor(0);
    putSum = 0;

    boardEle.innerHTML = '';
    for (let i=0; i<edgeLen; ++i) {
        data[i] = [];
        for (let j=0; j<edgeLen; ++j) {
            let grid = document.createElement('div');
            grid.className += 'grid ';
            if (j == 0) {
                grid.className += 'g-row ';            
            }
            if (i == 0) {
                grid.className += 'g-column ';
            }

            grid.setAttribute('data-grid', i + '-' + j);
            grid.setAttribute('data-on', false);

            grid.addEventListener('click', function(e){
                
                if (putStone(e.target, color[curColor])) {
                    changeColor();
                }
            });

            boardEle.appendChild(grid);
        }
    }



    return boardEle;
}

function putStone (d, c) {
    let dt = d.getAttribute('data-on');
    
    if (dt == 'false') {
        let gg = d.getAttribute('data-grid').split('-');
        let cl = d.className + c;
        d.className = cl;
        d.setAttribute('data-on', true);
        data[gg[0]][gg[1]] = curColor;
        ++putSum;
        dt = judgeStone(gg[0]-0, gg[1]-0);
        
    }
    
    
    return dt;
}

/**
 * Changes color. If no param, then changes to next color, else changes to the 
 * color of param.
 * 
 * @param {Number} [nextColor] The number of next color 
 */
function changeColor (nextColor) {
    nextColor = nextColor == undefined?((curColor + 1)%color.length):nextColor;
    curColor = nextColor;
    rootE.style.setProperty('--hover-color',hoverColor[curColor]);
    sample.className = 'grid ' + color[curColor];
    sampleText.innerHTML = color[curColor];
}

function curWin(c, isDraw) {
    let wi = document.getElementById('win');
    let inh = isDraw?'达成平局!':c + ' 赢得了这局游戏!'
    document.getElementById('color-name').innerHTML = inh;
    isInit = false;
    gentlyShow(wi);
}

function restart() {
    board = initBoard(data);
    gentlyHide(document.getElementById('win'));
    gentlyHide(document.getElementById('help'));

    isInit = true;
}

function contiGame() {
    gentlyHide(document.getElementById('help'));
}

function gameHelp(bt) {
    if (bt == undefined) {
        bt = '继续游戏';
    }

    let hp = document.getElementById('help');
    document.getElementById('continue').innerHTML = bt;
    gentlyShow(hp);


}

function judgeStone (i, j) {
    if (judgeStoneAt (i, j)) {
        curWin(color[curColor]);
        return false;    
    }
    if (putSum >= sum) {
        curWin(null, true);
        return false;
    }
    return true;
}

function judgeStoneAt (i, j) {
    for(let k=0;k<4;++k) {
        if (judgeTemp(getTemp(k,i,j))) {
            return true;
        }
    }
    return false;
}

function judgeTemp (temp) {
    let c = 0;
    let k = undefined;
    for(let i=0;i<temp.length;++i) {
        if (temp[i]==undefined) {
            c = 0;
            k = undefined;
        } else if (temp[i] == k) {
            ++c;
            if (c>=5){
                return true;
            }
        } else {
            c = 1;
            k = temp[i];
        }
    }
    return false;
}

/**
 * Gets the stone temp for judgement.
 * 
 * @param {Number} type Type of stone temp. 0 for horizontal, 1 for vertical, 2 for 
 * left-up to right-down, 3 for left-down to right-up. 
 * @param {Number} i Row number.
 * @param {Number} j Column number.
 * @return {Array} stone temp.
 */
function getTemp (type, i, j) {
    
    let res = [];
    
    switch (type) {
    case 0:
        for(let n=j-4>0?j-4:0, k=0; n<j+5 && n<edgeLen; ++k, ++n) {
            res[k] = data[i][n];
        }
        break;
    case 1:
        for(let m=i-4>0?i-4:0, k=0; m<i+5 && m<edgeLen; ++k, ++m) {
            res[k] = data[m][j];
        }
        break;
    case 2: {
        let il = i-4;
        let ir = i+5;
        let jl = j-4;
        let jr = j+5;
        
        if(il<0||jl<0) {
            let t = il<jl?il:jl;
            il -= t;
            jl -= t;
        }
        if(ir>edgeLen||jr>edgeLen) {
            let t = ir>jr?ir-edgeLen:jr-edgeLen;
            ir -= t;
            jr -= t;
        }
        // console.log(il+' '+ir+' '+jl+' '+jr);
        for(let m=il,n=jl,k=0;m<ir;++k,++m,++n) {
            res[k] = data[m][n];
        }}
        break;
    case 3: {
        let ml=i-4;
        let nr=j+4;
        if(ml<0||nr>=edgeLen) {
            let t = (-ml)<(nr+1-edgeLen)?(nr+1-edgeLen):(-ml);
            ml += t;
            nr -= t;
        }
        for(let m=ml,n=nr,k=0;m<i+5&&n>=0&&m<edgeLen;++k,++m,--n) {
            
            res[k] = data[m][n];
        }}
        break;
    }
    return res;
}

function gentlyShow (gena) {
    gena.style.visibility = 'visible';
    gena.style.opacity = 1;
}

function gentlyHide (gena) {
    gena.style.opacity = 0;
    setTimeout(function(){
        gena.style.visibility = 'hidden';
    }, 250);

}

function gentlySlideHide (gena) {
    gena.style.left = '-'+gena.offsetWidth+'px';

    setTimeout(function(){
        gena.style.visibility = 'hidden';
    }, 250);
}

function gentlySlideShow (gena) {
    gena.style.visibility = 'visible';
    gena.style.left = 0;
}



