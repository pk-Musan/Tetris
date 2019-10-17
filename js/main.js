enchant();

const STAGE_COL = 12; // ブロックを詰めるのは10行
const STAGE_ROW = 22; // ブロックを詰めるのは20行

let core;
let system;
let TITLE = 0;
let MAIN = 1;

let stage = [];
let blockType;
let block = [];

window.onload = function() {
    init();
    
    core.onload = function() {
        system = new System();
        system.changeScene(TITLE);
    }

    core.start();
};

function init() {
    core = new Core(320, 640);
    core.fps = 24;
    // core.preload('', '') とか 

    stage = [
        [9, 9, 9, 9, 0, 0, 0, 0, 9, 9, 9, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
    ];

    block = [
        []
    ]
}

function removeScene(scene){
    while(scene.firstChild){
        scene.removeChild(scene.firstChild);
    }
}
f
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
        title_label.x = 140;
        title_label.y = 50;

        Scene.call(this);
        core.replaceScene(this);

        this.addChild(title_label);

        this.addEventListener('enterframe', function() {
            if (core.input.up) {
                removeScene(this);
                system.changeScene(MAIN);
            }
            else if (core.input.down) {
                console.log("change");
            }
            else {
               // console.log("else");
            }
        });
    }
});

let MainScene = Class.create(Scene, {
    initialize: function() {
        for (let i=0; i<STAGE_ROW; i++) {
            for (let j=0; j<STAGE_COL; j++) {
                if (stage[i][j] == 9) {
                    
                }
            }
        }

        Scene.call(this);
        core.replaceScene(this);

        this.addEventListener('enterframe', function() {
            if (core.input.left) {
                console.log("Mainなう");
            }
        });
    }
})
