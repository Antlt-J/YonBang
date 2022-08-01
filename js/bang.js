
var color = [
    'black', 'white', 'cyan'
];
var edgeLen = 15;
var sum = edgeLen * edgeLen;
var hoverColor = [];

var data = [];
var board = null;
var curColor = 0;
var rootE = null;
var putSum = 0;

var sample = null;
var sampleText = null;
var winSample = null;
var winSampleText = null;

var isInit = init();
var stage = 0;
var winner = -1;
var winStage = [4, 5];

function init () {
    window.addEventListener('load', function () {
        sample = document.getElementById('sample-grid');
        sampleText = document.getElementById('color-cur');
        winSample = document.getElementById('win-grid');
        winSampleText = document.getElementById('win-cur');

        board = initBoard(data);
        gameHelp('开始游戏');
    });
    let hp = document.getElementById('help-b');
    let rs = document.getElementById('rest-b');
    let fd = document.getElementById('fold-b');
    let ex = document.getElementById('info-ex');
    let info = document.getElementById('info');

    rootE = document.documentElement;

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
    document.getElementById('restart-1').addEventListener('click', restart);
    document.getElementById('continue').addEventListener('click', contiGame);
    document.getElementById('continue-1').addEventListener('click', contiAfterWin);

    for(let j=0;j<color.length;++j) {
        hoverColor[j] = window.getComputedStyle(rootE).getPropertyValue('--hover-'+color[j]);
    }
    
    return true;
}


function initBoard (data) {
    var boardEle = document.getElementById('chessboard');
    stage = 0;
    gentlyExpandHideV(document.getElementById('win-info'));
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
        
        return judgeStone(gg[0]-0, gg[1]-0);
    }
    
    
    return false;
}

/**
 * Changes color. If no param, then changes to next color, else changes to the 
 * color of param.
 * 
 * @param {Number} [nextColor] The number of next color 
 */
function changeColor (nextColor) {
    nextColor = nextColor == undefined?((curColor + 1)%color.length):nextColor;
    if (stage == 1 && nextColor == winner) {
        nextColor = (nextColor + 1)%color.length;
    }
    curColor = nextColor;
    rootE.style.setProperty('--hover-color',hoverColor[curColor]);
    sample.className = 'grid ' + color[curColor];
    sampleText.innerHTML = color[curColor];
}

function curWin(c, isDraw, stage) {
    let wi = document.getElementById('win');
    let inh = '达成平局!';
    let rt = false;
    if (!isDraw) {
        if (stage == 0) {
            inh = color[c] + ' 赢得了这局游戏!';
            document.getElementById('color-win').innerHTML = inh;
            wi = document.getElementById('win-0');
            winner = curColor;

            rt = true;
        } else {
            inh = color[winner] + '为优胜者, ' + color[c] + ' 为次胜者!';
            document.getElementById('color-name').innerHTML = inh;
        }
        
    } else {
        if (stage == 1) {
            inh = color[winner] + '为优胜者, 其余玩家' + inh;
        }
        document.getElementById('color-name').innerHTML = inh;
    }

    
    isInit = false;
    gentlyShow(wi);
    return rt;
}

function restart() {
    board = initBoard(data);
    gentlyHide(document.getElementById('win'));
    gentlyHide(document.getElementById('win-0'));
    gentlyHide(document.getElementById('help'));

    
    isInit = true;
}

function contiGame() {
    gentlyHide(document.getElementById('help'));
}

function contiAfterWin () {
    stage = 1;
    gentlyExpandShowV(document.getElementById('win-info'));
    winSample.className = 'grid ' + color[winner];
    winSampleText.innerHTML = color[winner];

    gentlyHide(document.getElementById('win'));
    gentlyHide(document.getElementById('win-0'));
    gentlyHide(document.getElementById('help'));
    isInit = true;
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
        return curWin(curColor, false, stage);  
    }
    if (putSum >= sum) {
        return curWin(null, true, stage);
    }
    return true;
}

function judgeStoneAt (i, j) {
    for(let k=0;k<4;++k) {
        winN = winStage[stage];
        if (judgeTemp(getTemp(k,i,j,winN), winN)) {
            return true;
        }
    }
    return false;
}

function judgeTemp (temp, winN) {
    let c = 0;
    let k = undefined;
    for(let i=0;i<temp.length;++i) {
        if (temp[i]==undefined) {
            c = 0;
            k = undefined;
        } else if (temp[i] == k) {
            ++c;
            if (c>=winN){
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
 * @param {Number} nw The number that can tell one is win.
 * @return {Array} stone temp.
 */
function getTemp (type, i, j, nw) {
    
    let res = [];
    let inn = nw - 1;
    
    switch (type) {
    case 0:
        for(let n=j-inn>0?j-inn:0, k=0; n<j+nw && n<edgeLen; ++k, ++n) {
            res[k] = data[i][n];
        }
        break;
    case 1:
        for(let m=i-inn>0?i-inn:0, k=0; m<i+nw && m<edgeLen; ++k, ++m) {
            res[k] = data[m][j];
        }
        break;
    case 2: {
        let il = i-inn;
        let ir = i+nw;
        let jl = j-inn;
        let jr = j+nw;
        
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
        let ml=i-inn;
        let nr=j+inn;
        if(ml<0||nr>=edgeLen) {
            let t = (-ml)<(nr+1-edgeLen)?(nr+1-edgeLen):(-ml);
            ml += t;
            nr -= t;
        }
        for(let m=ml,n=nr,k=0;m<i+nw&&n>=0&&m<edgeLen;++k,++m,--n) {
            
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

function gentlyExpandShowV (gena) {
    gena.style.visibility = 'visible';
    gena.style.height = '40px';
}

function gentlyExpandHideV (gena) {
    gena.style.height = 0;
    setTimeout(function(){
        gena.style.visibility = 'hidden';
    }, 200);
}


