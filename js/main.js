enchant();

let core;
let TITLE = 0;
let MAIN = 1;
let scene_flag = TITLE;

window.onload = function() {
    init();

    core.onload = function() {
        let kuma = new Sprite(32, 32);
        let x_speed = 0;
        let y_speed = 0;

        kuma.image = core.assets['../image/chara1.png'];
        kuma.x = 100;
        kuma.y = 120;

        core.rootScene.addChild(kuma);
        core.rootScene.backgroundColor = '#7ecef4';

        kuma.on('enterframe', function() {
           
        })

    }

    core.start();
};

function init() {
    core = new Core(320, 640);
    core.fps = 24;

}

function gameloop() {
    core.onload = function() {
        switch(scene_flag) {
            case TITLE:
                title();
                break;
            case MAIN:
                break;
            default:
                break;
        }
    }
}

function title() {
    // タイトル用の文字とか用意する
    let titlename = new Label();
    titlename.text = 'TETRIS';

    core.rootScene.addChild(titlename);
}

