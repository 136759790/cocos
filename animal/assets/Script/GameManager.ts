import { _decorator, Component, Node, instantiate, Sprite, SpriteFrame, resources } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Node })
  public playBtn: Node | null = null;
  @property({ type: Node })
  public Container: Node | null = null;
  @property({ type: Sprite })
  public ElementPrefab: Sprite | null = null;
  private ALL_TYPE = 8;
  start() {}

  update(deltaTime: number) {}
  play() {
    console.log("start play");
  }
  initGame() {
    console.log("initGame");
    this.playBtn.active = false;
    this.createContainer(6);
  }
  createContainer(typeCount: number) {
    const array = this.getBoxArray(typeCount);
    const prefabs = this.makeElements(array);
    this.arrangeBox(prefabs);
  }
  /**
   * 横向10，垂直14
   * @param prefabs
   */
  arrangeBox(prefabs: Sprite[]) {
    let vertical = 0;
    const verticalMax = 14;
    let horizontal = 0;
    const horizontalMax = 10;

    prefabs.forEach((e) => {});
  }
  /**
   * 容器大小  10 * 14 = 140 ；
   * 成对出现，所以需要种类最多 =  140 /2=70
   * 种类 x = @param typeCount
   * 至少出现的次数 a = 70/x
   * 出现多一次的 b = 70%x
   * 70 = ax + b
   * @param typeCount 种类
   */
  getBoxArray(typeCount: number) {
    const baseTimes = 70 / typeCount;
    const moreTimeTypeCounts = 70 % typeCount;
    const allElement = Array.from({ length: this.ALL_TYPE }, (_, i) => i + 1);
    const selectedElement = allElement.sort(() => Math.random() - 0.5).slice(0, typeCount);
    let finalArray = [];
    //添加基准的
    selectedElement.forEach((e) => {
      for (let i = 0; i < baseTimes; i++) {
        finalArray.push(e);
      }
    });
    for (let i = 0; i < moreTimeTypeCounts; i++) {
      const temp = selectedElement[moreTimeTypeCounts];
      finalArray.push(temp);
    }
    //成对出现
    finalArray = [...finalArray, ...finalArray];
    //打乱整体顺序
    return finalArray.sort(() => Math.random() - 0.5);
  }
  makeElements(array: number[]) {
    return array.map((e) => this.makeElement(e));
  }
  makeElement(index: number) {
    const sprite: Sprite = instantiate(this.ElementPrefab);
    resources.load("../Png/" + index, SpriteFrame, (err: any, frame) => {
      sprite.spriteFrame = frame;
    });
    return sprite;
  }
}
