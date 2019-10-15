# Tetris

## enchant.jsの練習

### 3つの主要オブジェクト

- Core(Game)
    - ゲーム全体の管理，動作させるシステム
    - デフォルトでrootSceneというSceneオブジェクトを持っている
    - Gameは互換性に問題ありなのでCoreを使おう

- Node
    - 視覚要素(図，画像，文字とか)
    - Sprite, Label, Mapの3つ？

- Scene
    - Nodeオブジェクトを表示する場所的な
    - 画面を構成する
    - スタック管理する(場面を階層上に重ねられる)