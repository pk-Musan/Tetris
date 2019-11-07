enchant();

const STAGE_COL = 12; // ブロックを詰めるのは10列(1~10)
const STAGE_ROW = 22; // ブロックを詰めるのは20行(3~22)
const BLOCK_SIZE = 24;

// Sceneの状態
const TITLE = 0;
const MAIN = 1;
const HOWTO = 2;
const GAMEOVER = 3;

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

let score;
let level;
let speed;
let deleted_line_num;
let score_label = new Label();
let level_label = new Label();

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
    core.fps = 60;
    core.keybind('W'.charCodeAt(0), 'w');
    core.keybind('A'.charCodeAt(0), 'a');
    core.keybind('S'.charCodeAt(0), 's');
    core.keybind('D'.charCodeAt(0), 'd');
    core.keybind(32, 'space');
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

    score = 0;
    level = 0;

    score_label.text = 'SCORE: ' + score;
    score_label.y = 17*BLOCK_SIZE;
    score_label.x = BLOCK_SIZE + BLOCK_SIZE*STAGE_COL;

    level_label.text = 'LEVEL: ' + level;
    level_label.y = 19*BLOCK_SIZE;
    level_label.x = BLOCK_SIZE + BLOCK_SIZE*STAGE_COL;

    scene.addChild(score_label);
    scene.addChild(level_label);

    speed = core.fps * 0.8;
    deleted_line_num = 0;

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
            case HOWTO:
                new HowToScene();
                break;
            case GAMEOVER:
                new GameOverScene();
                break;
        }
    }
});

let TitleScene = Class.create(Scene, {
    initialize: function() {
        Scene.call(this);
        core.replaceScene(this);

        this.backgroundColor = '#000000';

        let prev_key_state = [];
        let key_state = [];
        let selector = 0;   // 0: START, 1: HOW TO PLAY

        let title_label = new Label();
        title_label.text = '落ち落ちハコケシ';
        title_label.color = '#ffffff';
        title_label.x = (core.width - title_label._boundWidth) / 2;
        title_label.y = core.height/4;
        this.addChild(title_label);

        let start_label = new Label();
        start_label.text = 'START';
        start_label.color = '#ffffff';
        start_label.x = (core.width - start_label._boundWidth) / 2;
        start_label.y = core.height * (3/5);
        this.addChild(start_label);

        let howto_label = new Label();
        howto_label.text = 'HOW TO PLAY';
        howto_label.color = '#ffffff'
        howto_label.x = (core.width - howto_label._boundWidth) / 2;
        howto_label.y = start_label.y + 2*BLOCK_SIZE;
        this.addChild(howto_label);

        let arrow_label = new Label();
        arrow_label.text = '←';
        arrow_label.color = '#ffffff'
        arrow_label.x = howto_label.x + howto_label._boundWidth + BLOCK_SIZE;
        arrow_label.y = start_label.y;
        this.addChild(arrow_label);

        let space_label = new Label();
        space_label.text = 'Press Space Key !';
        space_label.color = '#ffffff';
        space_label.x = (core.width - space_label._boundWidth) / 2;
        space_label.y = howto_label.y + 3*BLOCK_SIZE;
        this.addChild(space_label);

        this.addEventListener('enterframe', function() {
            prev_key_state[0] = key_state[0];
            key_state[0] = core.input.space
            if (pressKey(prev_key_state[0], key_state[0])) {
                removeScene(this);
                if (selector == 0) system.changeScene(MAIN);
                else if (selector == 1) system.changeScene(HOWTO);
            }

            prev_key_state[1] = key_state[1];
            key_state[1] = core.input.up;
            prev_key_state[2] = key_state[2];
            key_state[2] = core.input.down;
            if (pressKey(prev_key_state[1], key_state[1]) || pressKey(prev_key_state[2], key_state[2])) {
                selector = (selector + 1) % 2;

                if (selector == 0) arrow_label.y = start_label.y;
                else if (selector == 1) arrow_label.y = howto_label.y;
            }
        });
    }
});

let MainScene = Class.create(Scene, {
    initialize: function() {
        Scene.call(this);
        core.replaceScene(this);

        init(this);

        let next_block_images = [];
        let hold_block_images = [];

        let deleted_lines = [];

        // 0: w, 1: left_arrow, 2: right_arrow
        let prev_key_state = [false, false, false];
        let key_state = [false, false, false];

        createStage(this);

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
                    level++;
                    level_label.text = 'LEVEL: ' + level;

                    key_timer = core.frame;
                    play_timer = core.frame;
                    block_timer = core.frame;
                    block_state = OPERATE;

                    break;
                
                case OPERATE:
                    // キー操作による移動部分
                    if (core.frame - key_timer >= core.fps / 8) {
                        if (moveInput()) key_timer = core.frame;
                    }

                    // ハードドロップだけキーを押して離してから判定
                    prev_key_state[0] = key_state[0];
                    key_state[0] = core.input.w;
                    if (pressKey(prev_key_state[0], key_state[0])) hardDrop();

                    prev_key_state[1] = key_state[1];
                    key_state[1] = core.input.left;
                    prev_key_state[2] = key_state[2];
                    key_state[2] = core.input.right;
                    if (pressKey(prev_key_state[1], key_state[1])) rotateBlock(true);
                    if (pressKey(prev_key_state[2], key_state[2])) rotateBlock(false);
                    
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
                        if (level <= 999) {
                            level += deleted_lines.length;
                            level_label.text = 'LEVEL: ' + level;
                            updateSpeed(level);
                        }

                        updateScore(deleted_lines.length);

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

let HowToScene = Class.create(Scene, {
    initialize: function() {
        Scene.call(this);
        core.replaceScene(this);
        this.backgroundColor = "#000000";

        let prev_key_state = [];
        let key_state = [];

        let howto_label = [];
        for (let n=0; n<7; n++) {
            howto_label[n] = new Label();
            howto_label[n].color = '#ffffff';
            howto_label[n].x = BLOCK_SIZE;
            if (n == 0) howto_label[n].y = 2*BLOCK_SIZE;
            else howto_label[n].y = howto_label[n-1].y + 2*BLOCK_SIZE;
            this.addChild(howto_label[n]);
        }

        howto_label[0].text = 'w : ハードドロップ(瞬時に下まで落とす)';
        howto_label[1].text = 'a : 左に１ブロック分移動';
        howto_label[2].text = 's : 下に１ブロック分移動';
        howto_label[3].text = 'd : 右に１ブロック分移動';
        howto_label[4].text = '← : 左回転';
        howto_label[5].text = '→ : 右回転';
        howto_label[6].text = '↑ : ホールド(操作ブロックをHOLDに移動)';

        let space_label = new Label();
        space_label.text = 'Press Space Key to Return Home !';
        space_label.color = '#ffffff';
        space_label.x = (core.width - space_label._boundWidth) / 2;
        space_label.y = core.height * (3/5) + 5*BLOCK_SIZE;
        this.addChild(space_label);

        this.addEventListener('enterframe', function() {
            prev_key_state[0] = key_state[0];
            key_state[0] = core.input.space
            if (pressKey(prev_key_state[0], key_state[0])) {
                removeScene(this);
                system.changeScene(TITLE);
            }
        });
    }
});

let GameOverScene = Class.create(Scene, {
    initialize: function() {
        Scene.call(this);
        core.replaceScene(this);
        this.backgroundColor = '#000000';

        let prev_key_state = [];
        let key_state = [];

        let gameover_label = new Label();
        gameover_label.text = 'GAME OVER';
        gameover_label.color = '#ffffff';
        gameover_label.y = core.height/2 - 2*BLOCK_SIZE;
        gameover_label.x = (core.width - gameover_label._boundWidth) / 2;
        this.addChild(gameover_label);

        let space_label = new Label();
        space_label.text = 'Press Space Key to Return Home !';
        space_label.color = '#ffffff';
        space_label.x = (core.width - space_label._boundWidth) / 2;
        space_label.y = core.height * (3/5) + 5*BLOCK_SIZE;
        this.addChild(space_label);

        this.addEventListener('enterframe', function() {
            prev_key_state[0] = key_state[0];
            key_state[0] = core.input.space
            if (pressKey(prev_key_state[0], key_state[0])) {
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

function createStage(scene) {
    let stage_image = [];

    for (let j=1; j<STAGE_ROW; j++) {
        for (let i=0; i<STAGE_COL; i++) {
            if (stage[j][i] == -1) stage_image.push(new Rectangle(BLOCK_SIZE, BLOCK_SIZE, '#999999'));
            else stage_image.push(new Rectangle(BLOCK_SIZE, BLOCK_SIZE, '#000000'));

            stage_image[stage_image.length-1].y = j * BLOCK_SIZE;
            stage_image[stage_image.length-1].x = i * BLOCK_SIZE;
                
            scene.addChild(stage_image[stage_image.length-1]);
        }
    }
}

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

function moveInput() {
    let input_flag = false;

    clearOperateBlock(block_y, block_x);
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
    moveOperateBlock(block_y, block_x);
    return input_flag;
}

function pressKey(prev_key_state, key_state) {
    if (prev_key_state && !key_state) return true;
    return false;
}

function rotateBlock(is_left) {
    let before_rotated = operate_block;
    let before_y = block_y;
    let before_x = block_x;
    let is_rotate = true;

    clearOperateBlock(block_y, block_x);
    operate_block = getRotateBlock(operate_block, is_left);

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
                is_rotate = false;
            }
        }
    }

    if (is_rotate) play_timer = core.frame;
    moveOperateBlock(block_y, block_x);
}

function hardDrop() {
    clearOperateBlock(block_y, block_x);
    while (!hitCheck(block_y, block_x)) block_y++;
    block_y--;
    play_timer = 0;
    moveOperateBlock(block_y, block_x);
}

function holdBlock(hold_block_images, scene) {
    // holdしていたブロックを一時的に退避
    let tmp_block = hold_block;
    let block_type = hold_block_type;

    // 操作中のブロックをholdに移す
    hold_block = block[block_stack[0]];
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

function getRotateBlock(block, is_left) {
    let rotate = [];

    if (is_left) {
        for (let j=0; j<block.length; j++) {
            rotate[j] = [];
            for (let i=0; i<block[j].length; i++) {
                rotate[j][i] = block[i][-j+3];
            }
        }
    } else {
        for (let j=0; j<block.length; j++) {
            rotate[j] = [];
            for (let i=0; i<block[j].length; i++) {
                rotate[j][i] = block[-i+3][j];
            }
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

function updateSpeed(level) {
    if (level <= 900) speed = core.fps * 0.8 - Math.floor(level/20);
    else speed = 1;
}

function updateScore(lines_num) {
    if (lines_num == 1) score += 40;
    else if (lines_num == 2) score += 100;
    else if (lines_num == 3) score += 300;
    else if (lines_num == 4) score += 1200;
    else return;

    score_label.text = 'SCORE: ' + score;
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