enchant();

const STAGE_COL = 12; // ブロックを詰めるのは10列
const STAGE_ROW = 22; // ブロックを詰めるのは20行
const BLOCK_SIZE = 24;

// Sceneの状態
const TITLE = 0;
const MAIN = 1;

// ブロックの状態
const CLEAR = 0;    // 次のブロックに移るとき
const OPERATE = 1;  // ブロックの操作中
const LOCK = 2;     // ブロックが置かれたとき

let core;
let system;

let stage = [];
let field = [];
let block = [];
let block_colors = [];
let block_state;        // ブロックの状態
let block_stack = [];   // 待機しているブロックの種類
let block_timer;        // ブロックが落ち始めたframe
let key_timer = 0;

let operate_block = [];
let block_x;
let block_y;
let block_image = [];

window.onload = function() {
    init();

    core = new Core(BLOCK_SIZE * STAGE_COL, BLOCK_SIZE * STAGE_ROW);
    core.fps = 24;
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
    block_state = CLEAR;
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
        let image_number;
        
        this.backgroundColor = '#000000'

        for (let i= 0; i<STAGE_ROW; i++) {
            for (let j= 0; j<STAGE_COL; j++) {
                if (stage[i][j] < 0) {
                    stage_image = new Rectangle(BLOCK_SIZE, BLOCK_SIZE, '#999999');
                    stage_image.x = j * BLOCK_SIZE;
                    stage_image.y = i * BLOCK_SIZE;
                    
                    this.addChild(stage_image);
                }
            }
        }

        this.addEventListener('enterframe', function() {
            switch(block_state) {
                case CLEAR:
                    // 次のブロックが何かを見せるなら,なくなってから補充では遅い
                    if (block_stack.length == 7) {
                        block_stack = block_stack.concat(makeRandomStack(0, 6));
                    }

                    operate_block = block[block_stack[0]];
                    block_x = 4;
                    block_y = 0;

                    //operate_block_image = [];
                    image_number = 0;

                    for (let j=0; j<4; j++) {
                        for (let i=0; i<4; i++) {
                            if (operate_block[j][i]) {
                                block_image.push(new Rectangle(BLOCK_SIZE, BLOCK_SIZE, block_colors[block_stack[0]]));
                                
                                // console.log(block_image);

                                block_image[block_image.length-1].y = (block_y + j)*BLOCK_SIZE;

                                block_image[block_image.length-1].x = (block_x + i)*BLOCK_SIZE;

                               this.addChild(block_image[block_image.length-1]);

                               image_number++;
                            }
                        }
                    }

                    block_timer = core.frame;
                    block_state = OPERATE;

                    break;
                
                case OPERATE:
                    // 自由落下の部分
                    if ((core.frame - block_timer) % (core.fps/2) == 0) {
                        clearOperateBlock(block_y, block_x);

                        let before_y = block_y;

                        block_y++;

                        if (hitCheck(block_y, block_x)) {
                            block_stack = block_stack.slice(1);
                            block_y = before_y;
                            block_state = CLEAR;
                            console.log(block_stack);
                        }
                        moveOperateBlock(block_y, block_x);
                    }

                    // キー操作による移動部分
                    if (core.frame - key_timer > core.fps/10) {
                        clearOperateBlock(block_y, block_x);

                        if (keyInput()) {
                            //moveOperateBlock(block_y, block_x);
                            key_timer = core.frame;
                            console.log(this);
                        }
                        moveOperateBlock(block_y, block_x);
                    }
                    break;
            }
        });
    }
})

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

function hitCheck(next_y, x) {
    for (let j=0; j<4; j++) {
        for (let i=0; i<4; i++) {
            if (operate_block[j][i] && stage[next_y+j][x+i]) {
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
    /*
    for (let j=0; j<4; j++) {
        for (let i=0; i<4; i++) {
            if (operate_block[j][i]) {
                operate_block_image[j][i].y = (y + j) * BLOCK_SIZE;
                operate_block_image[j][i].x = (x + i) * BLOCK_SIZE;
            }
        }
    }
    */
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
    let before_y = block_y;
    let before_x = block_x;

    if (core.input.a) {
        block_x--;
        if (hitCheck(block_y, block_x)) block_x = before_x;
        return true;
    } else if (core.input.d) {
        block_x++;
        if (hitCheck(block_y, block_x)) block_x = before_x;
        return true;
    } else if (core.input.s) {
        block_y++;
        if (hitCheck(block_y, block_x)) block_y = before_y;
        return true;
    } else if (core.input.left) {
        let before_rotated = operate_block;

        operate_block = rotateBlock(operate_block);
        if (hitCheck(block_y, block_x)) operate_block = before_rotated;
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

function removeScene(scene) {
    while (scene.firstChild) {
        scene.removeChild(scene.firstChild);
    }
}