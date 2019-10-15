enchant();

window.onload = function() {
    let game = new Game(320, 320)
    game.fps = 24;
    game.preload('../image/chara1.png');

    game.onload = function() {
        let kuma = new Sprite(32, 32);

        kuma.image = game.assets['../image/chara1.png'];
        kuma.x = 100;
        kuma.y = 120;

        game.rootScene.addChild(kuma);
        game.rootScene.backgroundColor = '#7ecef4';
    }

    game.start();
};

