enchant();

const STAGE_COL = 12; // ブロックを詰めるのは10列
const STAGE_ROW = 22; // ブロックを詰めるのは20行
const BLOCK_SIZE = 24;

// Sceneの状態
const TITLE = 0;
const MAIN = 1;

// ブロックの状態
const CREATE = 0;    // 次のブロックに移るとき
const OPERATE = 1;  // ブロックの操作中
const LOCK = 2;     // ブロックが置かれたとき
const EFECT = 3;

let core;
let system;

let stage = [];
let field = [];
let block = [];
let block_colors = [];
let block_state;        // ブロックの状態
let block_stack = [];   // 待機しているブロックの種類

let level = 1;
let speed = level;
let deleted_line_num = 0;

let block_timer;        // ブロックが落ち始めたframe
let key_timer = 0;      // 最後にキー操作を行ったframe
let play_timer;         // ブロックが落ち切ってからのあそび(時間)
let efect_timer;

let operate_block = [];
let block_x;
let block_y;
let block_image = [];

window.onload = function() {
    init();

    core = new Core(BLOCK_SIZE * STAGE_COL, BLOCK_SIZE * STAGE_ROW);
    core.fps = 24;
    core.keybind('W'.charCodeAt(0), 'w');
    core.keybind('A'.charCodeAt(0), 'a');
    core.keybind('S'.charCodeAt(0), 's');
    core.keybind('D'.charCodeAt(0), 'd');
    // core.preload('', '') とか 
    
    core.onload = function() {
        system = new System();
        system.changeScene(TITLE);
    }

    core.start();
};

function init() {
    stage = [
        [-1, -1, -1,  0,  0,  0,  0,  0,  0, -1, -1, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
    ];

    block = [
        [
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 1, 1],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 1],
            [0, 1, 1, 1],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ]
    ]

    block_colors = [
        '#00ffff',
        '#ffff00',
        '#99ff00',
        '#ff0000',
        '#0000ff',
        '#ff9900',
        '#9900ff'
    ]

    block_stack = makeRandomStack(0, 6);
    block_state = CREATE;
}

let System = Class.create({
    changeScene: function(sceneNumber) {
        switch(sceneNumber) {
            case TITLE:
                let title_scene = new TitleScene();
                break;
            case MAIN:
                let main_scene = new MainScene();
                break;
        }
    }
});

let TitleScene = Class.create(Scene, {
    initialize: function() {
        let title_label = new Label();
        title_label.text = 'TETRIS';
        title_label.x = 124;
        title_label.y = 50;

        Scene.call(this);
        core.replaceScene(this);

        this.addChild(title_label);

        this.addEventListener('enterframe', function() {
            if (core.input.up) {
                removeScene(this);
                system.changeScene(MAIN);
            }
        });
    }
});

let MainScene = Class.create(Scene, {
    initialize: function() {
        Scene.call(this);
        core.replaceScene(this);

        let stage_image;
        //let image_number;
        
        this.backgroundColor = '#000000'

        for (let j=0; j<STAGE_ROW; j++) {
            for (let i=0; i<STAGE_COL; i++) {
                if (stage[j][i] == -1) stage_image = new Rectangle(BLOCK_SIZE, BLOCK_SIZE, '#999999');
                else stage_image = new Rectangle(BLOCK_SIZE, BLOCK_SIZE, '#000000');

                stage_image.y = j * BLOCK_SIZE;
                stage_image.x = i * BLOCK_SIZE;
                    
                this.addChild(stage_image);
            }
        }

        this.addEventListener('enterframe', function() {
            switch(block_state) {
                case CREATE:
                    // 次のブロックが何かを見せるなら,なくなってから補充では遅い
                    if (block_stack.length == 7) {
                        block_stack = block_stack.concat(makeRandomStack(0, 6));
                    }

                    operate_block = block[block_stack[0]];
                    block_x = 4;
                    block_y = 0;

                    for (let j=0; j<4; j++) {
                        for (let i=0; i<4; i++) {
                            if (operate_block[j][i]) {
                                block_image.push(new Rectangle(BLOCK_SIZE, BLOCK_SIZE, block_colors[block_stack[0]]));

                                block_image[block_image.length-1].y = (block_y + j)*BLOCK_SIZE;

                                block_image[block_image.length-1].x = (block_x + i)*BLOCK_SIZE;

                               this.addChild(block_image[block_image.length-1]);
                            }
                        }
                    }

                    key_timer = core.frame;
                    play_timer = core.frame;
                    block_timer = core.frame;
                    block_state = OPERATE;

                    break;
                
                case OPERATE:
                    // キー操作による移動部分
                    if (core.frame - key_timer >= core.fps/8) {
                        clearOperateBlock(block_y, block_x);

                        if (keyInput()) key_timer = core.frame;
                        
                        moveOperateBlock(block_y, block_x);
                    }
                    
                    // 自由落下の部分
                    if ((core.frame - block_timer) % (core.fps/speed) == 0) {
                        clearOperateBlock(block_y, block_x);
                        block_y++;

                        if (hitCheck(block_y, block_x)) block_y--;
                        else play_timer = core.frame;   // 落下できた場合はあそびを更新しておく
                        moveOperateBlock(block_y, block_x);
                    }

                    if (core.frame - play_timer >= core.fps/2) {
                        clearOperateBlock(block_y, block_x);
                        block_y++;

                        if (hitCheck(block_y, block_x)) {
                            block_stack = block_stack.slice(1);
                            block_state = LOCK;
                        }
                        block_y--;
                        moveOperateBlock(block_y, block_x);
                    } 

                    break;
                
                case LOCK:
                    if (deleteLines(checkDeleteLines(), this)) {
                        efect_timer = core.frame;
                        block_state = EFECT;
                    } else block_state = CREATE;
                    break;

                case EFECT:
                    if (core.frame - efect_timer >= core.fps/2) {
                        updateLockBlock();
                        //console.log(stage);
                        level = Math.floor(deleted_line_num / 10) + 1;
                        speed = level;
                        console.log(level);
                        block_state = CREATE;
                    } 
                    break;
            }
        });
    }
});

let Rectangle = Class.create(Sprite, {
    initialize: function(w, h, color) {
        Sprite.call(this, w, h);

        let surface = new Surface(w, h);
        surface.context.beginPath();
        surface.context.fillStyle = color;
        surface.context.fillRect(1, 1, w - 1, h - 1);
        this.image = surface;
    }
});


function makeRandomStack(min, max) {
    let randoms = [];

    for (let i = min; i <= max; i++) {
        while (true) {
            let tmp = Math.floor(Math.random() * (max - min + 1)) + min;    // min ~ maxのいずれかの整数を返す

            if (!randoms.includes(tmp)) {
                randoms.push(tmp);
                break;
            }
        }
    }

    return randoms;
}

function hitCheck(y, x) {
    for (let j=0; j<4; j++) {
        for (let i=0; i<4; i++) {
            if (operate_block[j][i] && stage[y+j][x+i]) {
                console.log('hit!');
                return true;
            }
        }
    }
    return false;
}

function clearOperateBlock(y, x) {
    for (let j=0; j<4; j++) {
        for (let i=0; i<4; i++) {
            if (operate_block[j][i]) {
                stage[y+j][x+i] = 0;
            }
        }
    }
}

function moveOperateBlock(y, x) {
    for (let j=0; j<4; j++) {
        for (let i=0; i<4; i++) {
            if (operate_block[j][i]) {
                stage[y+j][x+i] = 1;
            }
        }
    }

    let image_number = 4;
    for (let j=0; j<4; j++) {
        for (let i=0; i<4; i++) {
            if (operate_block[j][i]) {
                block_image[block_image.length - image_number].y = (y + j) * BLOCK_SIZE;
                block_image[block_image.length - image_number].x = (x + i) * BLOCK_SIZE;
                
                image_number--;
            }
        }
    }
}

function keyInput() {
    if (core.input.w) {
        while (!hitCheck(block_y, block_x)) block_y++;
        block_y--;
        play_timer = 0;
        return true;
    } else if (core.input.a) {
        block_x--;
        if (hitCheck(block_y, block_x)) block_x++;
        else play_timer = core.frame;
        return true;
    } else if (core.input.d) {
        block_x++;
        if (hitCheck(block_y, block_x)) block_x--;
        else play_timer = core.frame;
        return true;
    } else if (core.input.s) {
        block_y++;
        if (hitCheck(block_y, block_x)) block_y--;
        return true;
    } else if (core.input.left) {
        let before_rotated = operate_block;
        operate_block = rotateBlock(operate_block);
        if (hitCheck(block_y, block_x)) operate_block = before_rotated;
        else play_timer = core.frame;
        return true;
    }
    return false;
}

function rotateBlock(block) {
    let rotate = [];

    for (let j=0; j<4; j++) {
        rotate[j] = [];
        for (let i=0; i<4; i++) {
            rotate[j][i] = block[i][-j+3];
        }
    }
    return rotate;
}

function checkDeleteLines() {
    let all_zero_flag;
    let delete_flag;
    let line;
    let deleted_lines = [];

    for (let j=STAGE_ROW-2; j>=1; j--) {
        line = stage[j].slice(1, STAGE_COL-1);

        delete_flag = line.includes(0) ? false : true;
        all_zero_flag = line.includes(1) ? false : true;
       
        if (all_zero_flag) break;
        if (delete_flag) deleted_lines.push(j);
    }

    return deleted_lines;
}

function deleteLines(deleted_lines, scene) {
    if (deleted_lines.length == 0) return false;
    else deleted_line_num += deleted_lines.length;

    for (let n=0; n<deleted_lines.length; n++) {
        for (let i=1; i<STAGE_COL-1; i++) {
            stage[deleted_lines[n]][i] = 0;
        }

        for (let i=block_image.length-1; i>=0; i--) {
            if(block_image[i].y == deleted_lines[n]*BLOCK_SIZE) {
                scene.removeChild(block_image[i]);
                block_image.splice(i, 1);
            }
        }
    }
    return true;
}

function updateLockBlock() {
    // 一番下のブロックは動きようがないのでその一つ上のラインから見ていく
    for (let j=STAGE_ROW-3; j>0; j--) {
        let line = stage[j].slice(1, STAGE_COL-1);
        let y = j;

        // 今見ているラインにブロックが存在する
        if (line.includes(1)) {
            // 次の行にブロックが一つもなければ1ブロック分落下できる
            while (!stage[y+1].slice(1, STAGE_COL-1).includes(1) && (y+1)<(STAGE_ROW-1)) y++;
        }

        // １ブロック分も落下していなければ更新処理の必要なし
        if (y == j) continue;

        for (let i=1; i<STAGE_COL-1; i++) {
            if (stage[j][i] == 1) {
                stage[j][i] = 0;
                stage[y][i] = 1;

                for (let n=0; n<block_image.length; n++) {
                    if (block_image[n].y == j*BLOCK_SIZE && block_image[n].x == i*BLOCK_SIZE) {
                        block_image[n].y = y*BLOCK_SIZE;
                        break;
                    }
                }
            }
        }
    }
}

function removeScene(scene) {
    while (scene.firstChild) {
        scene.removeChild(scene.firstChild);
    }
}