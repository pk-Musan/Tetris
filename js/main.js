enchant();

const STAGE_COL = 12; // ブロックを詰めるのは10列(1~10)
const STAGE_ROW = 22; // ブロックを詰めるのは20行(3~22)
const BLOCK_SIZE = 24;

// Sceneの状態
const TITLE = 0;
const MAIN = 1;
const GAMEOVER = 2;

// ブロックの状態
const CREATE = 0;    // 次のブロックに移るとき
const OPERATE = 1;  // ブロックの操作中
const LOCK = 2;     // ブロックが置かれたとき
const EFECT = 3;
const FAIL = 4;

let core;
let system;

let stage = [];
let field = [];
let block = [];
let block_colors = [];
let block_state;        // ブロックの状態
let block_stack = [];   // 待機しているブロックの種類

let level = 0;
let speed;
let deleted_line_num;
let point;

let hold_flag;
let hold_block;
let hold_block_type;

let block_timer;        // ブロックが落ち始めたframe
let key_timer = 0;      // 最後にキー操作を行ったframe
let play_timer;         // ブロックが落ち切ってからのあそび(時間)
let efect_timer;

let operate_block = [];
let block_x;
let block_y;
let block_images;  // 画面中の全ブロックのimageを保持, 末尾4つが操作中のブロック

window.onload = function() {
    core = new Core(BLOCK_SIZE * STAGE_COL + 150, BLOCK_SIZE * STAGE_ROW);
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

function init(scene) {
    stage = [
        [-1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1], //　ここは見えない
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
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 1],
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

    let next_label = new Label();
    let hold_label = new Label();

    next_label.text = 'NEXT';
    next_label.y = 5*BLOCK_SIZE;
    next_label.x = BLOCK_SIZE + BLOCK_SIZE*STAGE_COL;

    hold_label.text = 'HOLD';
    hold_label.y = 11*BLOCK_SIZE;
    hold_label.x = BLOCK_SIZE + BLOCK_SIZE*STAGE_COL;

    scene.addChild(next_label);
    scene.addChild(hold_label);

    speed = core.fps;
    deleted_line_num = 0;
    point = 0;

    hold_flag = true;
    hold_block = [];

    block_images = [];
    block_stack = makeRandomStack(0, 6);
    block_state = CREATE;
}

let System = Class.create({
    changeScene: function(sceneNumber) {
        switch(sceneNumber) {
            case TITLE:
                new TitleScene();
                break;
            case MAIN:
                new MainScene();
                break;
            case GAMEOVER:
                new GameOverScene();
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
            if (core.input.down) {
                console.log("title");
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

        init(this);

        let stage_image = [];
        let next_block_images = [];
        let hold_block_images = [];

        let deleted_lines = [];

        for (let j=1; j<STAGE_ROW; j++) {
            for (let i=0; i<STAGE_COL; i++) {
                if (stage[j][i] == -1) stage_image.push(new Rectangle(BLOCK_SIZE, BLOCK_SIZE, '#999999'));
                else stage_image.push(new Rectangle(BLOCK_SIZE, BLOCK_SIZE, '#000000'));

                stage_image[stage_image.length-1].y = j * BLOCK_SIZE;
                stage_image[stage_image.length-1].x = i * BLOCK_SIZE;
                    
                this.addChild(stage_image[stage_image.length-1]);
            }
        }

        this.addEventListener('enterframe', function() {
            switch(block_state) {
                case CREATE:
                    if (block_stack.length == 7) {
                        block_stack = block_stack.concat(makeRandomStack(0, 6));
                    }

                    operate_block = block[block_stack[0]];
                    block_x = 4;
                    block_y = 0;

                    next_block_images = showBlock(block[block_stack[1]], next_block_images, block_colors[block_stack[1]], BLOCK_SIZE, BLOCK_SIZE + BLOCK_SIZE*STAGE_COL, this);

                    if (hitCheck(block_y, block_x)) {
                        block_state = FAIL;
                        break;
                    }

                    createBlockImage(block_stack[0], this); // operate_blockとblock_x, yに基づいてSpriteを生成し，block_imagesとthis(scene)に追加

                    key_timer = core.frame;
                    play_timer = core.frame;
                    block_timer = core.frame;
                    block_state = OPERATE;

                    break;
                
                case OPERATE:
                    // キー操作による移動部分
                    if (core.frame - key_timer >= core.fps / 6) {
                        clearOperateBlock(block_y, block_x);

                        if (keyInput()) key_timer = core.frame;
                        
                        moveOperateBlock(block_y, block_x);
                    }
                    
                    // 自由落下の部分
                    if ((core.frame - block_timer) % speed == 0) {
                        clearOperateBlock(block_y, block_x);
                        block_y++;

                        if (hitCheck(block_y, block_x)) block_y--;
                        else play_timer = core.frame;   // 落下できた場合はあそびを更新しておく

                        moveOperateBlock(block_y, block_x);
                    }

                    if (hold_flag && core.input.up) {
                        hold_block_images = holdBlock(hold_block_images, this);
                        console.log(block_images.length);
                        break;
                    }
                    
                    // ブロックのあそび時間が無くなった場合
                    if (core.frame - play_timer >= core.fps/2) {
                        clearOperateBlock(block_y, block_x);
                        block_y++;

                        if (hitCheck(block_y, block_x)) {
                            hold_flag = true;
                            block_stack = block_stack.slice(1);
                            block_state = LOCK;
                        }
                        block_y--;
                        moveOperateBlock(block_y, block_x);
                    } 

                    repaintOperateBlock(this); // 一番上で回転したときにはみ出した分が見えなくなる
                    break;
                
                case LOCK:
                    deleted_lines = checkDeleteLines()
                    deleted_line_num += deleted_lines.length;

                    if (deleteLines(deleted_lines, this)) {
                        if (level <= 23) {
                            level = Math.floor(deleted_line_num / 5);
                            speed = core.fps - level;
                            console.log("level = " + level);
                            console.log("deleted_line_num = " + deleted_line_num);
                            console.log("speed = " + speed);
                        }

                        efect_timer = core.frame;
                        block_state = EFECT;
                    } else block_state = CREATE;
                    break;

                case EFECT:
                    if (core.frame - efect_timer >= core.fps/2) {
                        updateLockBlock();
                        block_state = CREATE;
                    } 
                    break;

                case FAIL:
                    removeScene(this);
                    system.changeScene(GAMEOVER);
            }
        });
    }
});

let GameOverScene = Class.create(Scene, {
    initialize: function() {
        Scene.call(this);
        core.replaceScene(this);

        let gameover_label = new Label();
        gameover_label.text = 'GAME OVER';
        gameover_label.y = 50;
        gameover_label.x = 120;

        this.addChild(gameover_label);

        this.addEventListener('enterframe', function() {
            if (core.input.up) {
                removeScene(this);
                system.changeScene(TITLE);
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
    for (let j=0; j<operate_block.length; j++) {
        for (let i=0; i<operate_block[j].length; i++) {
            if (operate_block[j][i] && stage[y+j][x+i]) {
                return true;
            }
        }
    }
    return false;
}

function createBlockImage(block_type, scene) {
    for (let j=0; j<operate_block.length; j++) {
        for (let i=0; i<operate_block[j].length; i++) {
            if (operate_block[j][i]) {
                block_images.push(new Rectangle(BLOCK_SIZE, BLOCK_SIZE, block_colors[block_type]));

                block_images[block_images.length-1].y = (block_y + j)*BLOCK_SIZE;

                block_images[block_images.length-1].x = (block_x + i)*BLOCK_SIZE;

                scene.addChild(block_images[block_images.length-1]);
            }
        }
    }
}

function showBlock(shown_block, shown_block_images, shown_block_color, y, x, scene) {
    if (shown_block_images.length != 0) {
        for (let n=0; n<shown_block_images.length; n++) scene.removeChild(shown_block_images[n]);
    }

    shown_block_images = [];

    for (let j=0; j<shown_block.length; j++) {
        for (let i=0; i<shown_block[j].length; i++) {
            if (shown_block[j][i]) {
                shown_block_images.push(new Rectangle(BLOCK_SIZE, BLOCK_SIZE, shown_block_color));
                shown_block_images[shown_block_images.length-1].y = y + j*BLOCK_SIZE;
                shown_block_images[shown_block_images.length-1].x = x + i*BLOCK_SIZE;

                scene.addChild(shown_block_images[shown_block_images.length-1]);
            }
        }
    }

    return shown_block_images;
}

function clearOperateBlock(y, x) {
    for (let j=0; j<operate_block.length; j++) {
        for (let i=0; i<operate_block[j].length; i++) {
            if (operate_block[j][i]) {
                stage[y+j][x+i] = 0;
            }
        }
    }
}

function moveOperateBlock(y, x) {
    for (let j=0; j<operate_block.length; j++) {
        for (let i=0; i<operate_block[j].length; i++) {
            if (operate_block[j][i]) {
                stage[y+j][x+i] = 1;
            }
        }
    }

    let image_number = 0;
    for (let j=0; j<operate_block.length; j++) {
        for (let i=0; i<operate_block[j].length; i++) {
            if (operate_block[j][i]) {
                block_images[block_images.length-1 - image_number].y = (y + j) * BLOCK_SIZE;
                block_images[block_images.length-1 - image_number].x = (x + i) * BLOCK_SIZE;
                
                image_number++;
            }
        }
    }
}

function keyInput() {
    let input_flag = false;

    if (core.input.w) {
        while (!hitCheck(block_y, block_x)) block_y++;
        block_y--;
        play_timer = 0;
        return input_flag = true;
    }
    
    if (core.input.a) {
        block_x--;
        if (hitCheck(block_y, block_x)) block_x++;
        else play_timer = core.frame;
        input_flag = true;
    } else if (core.input.d) {
        block_x++;
        if (hitCheck(block_y, block_x)) block_x--;
        else play_timer = core.frame;
        input_flag = true;
    }
    
    if (core.input.s) {
        block_y++;
        if (hitCheck(block_y, block_x)) block_y--;
        input_flag = true;
    }
    
    if (core.input.left) {
        let before_rotated = operate_block;
        let before_y = block_y;
        let before_x = block_x;

        operate_block = rotateBlock(operate_block);
        if (hitCheck(block_y, block_x)) {
            if (block_x <= 0) block_x++;
            if (block_x + 4 >= STAGE_COL) block_x--;
            if (block_y + 4 >= STAGE_ROW) block_y--;

            if (hitCheck(block_y, block_x)) {
                if (block_x <= 0) block_x++;
                if (block_x + 4 >= STAGE_COL) block_x--;
                if (block_y + 4 >= STAGE_ROW) block_y--;

                if (hitCheck(block_y, block_x)) {
                    operate_block = before_rotated;
                    block_y = before_y;
                    block_x = before_x;
                } else play_timer = core.frame;
            } else play_timer = core.frame;
        } else play_timer = core.frame;
        input_flag = true;
    }
    return input_flag;
}

function holdBlock(hold_block_images, scene) {
    // holdしていたブロックを一時的に退避
    let tmp_block = hold_block;
    let block_type = hold_block_type;

    // 操作中のブロックをholdに移す
    hold_block = operate_block;
    hold_block_type = block_stack[0];

    // holdしたブロックを表示
    hold_block_images = showBlock(hold_block, hold_block_images, block_colors[hold_block_type], 7*BLOCK_SIZE, BLOCK_SIZE + BLOCK_SIZE*STAGE_COL, scene);
   
    // 操作中だったブロックを消す
    clearOperateBlock(block_y, block_x);
    for (let n=0; n<4; n++) {
        scene.removeChild(block_images[block_images.length-1]);
        block_images.pop();
    }

    // holdしていたブロックがなかった場合
    if (tmp_block.length == 0) {
        block_stack = block_stack.slice(1);
        block_state = CREATE;
    } else {
        operate_block = tmp_block;
        block_y = 0;
        block_x = 4;
        createBlockImage(block_type, scene);

        key_timer = core.frame;
        play_timer = core.frame;
        block_timer = core.frame;
    }
    hold_flag = false;
    return hold_block_images;
}

function rotateBlock(block) {
    let rotate = [];

    for (let j=0; j<block.length; j++) {
        rotate[j] = [];
        for (let i=0; i<block[j].length; i++) {
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

    for (let n=0; n<deleted_lines.length; n++) {
        for (let i=1; i<STAGE_COL-1; i++) {
            stage[deleted_lines[n]][i] = 0;
        }

        for (let i=block_images.length-1; i>=0; i--) {
            if(block_images[i].y == deleted_lines[n]*BLOCK_SIZE) {
                scene.removeChild(block_images[i]);
                block_images.splice(i, 1);
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

                for (let n=0; n<block_images.length; n++) {
                    if (block_images[n].y == j*BLOCK_SIZE && block_images[n].x == i*BLOCK_SIZE) {
                        block_images[n].y = y*BLOCK_SIZE;
                        break;
                    }
                }
            }
        }
    }
}

function repaintOperateBlock(scene) {
    for (let n=0; n<block_images.length; n++) {
        scene.removeChild(block_images[n]);
        if (block_images[n].y >= BLOCK_SIZE) scene.addChild(block_images[n]);
    } 
}

function removeScene(scene) {
    while (scene.firstChild) {
        scene.removeChild(scene.firstChild);
    }
}