import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AnimalNode")
export class AnimalNode extends Component {
  @property({ type: Number })
  public x: number;
  @property({ type: Number })
  public y: number;
  @property({ type: Number })
  public index: number;
  start() {}

  update(deltaTime: number) {}
}
