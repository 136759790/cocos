import { _decorator, Component, EventTouch, NodeEventType, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AnimalNode")
export class AnimalNode extends Component {
  @property({ type: Number })
  public x: number;
  @property({ type: Number })
  public y: number;
  @property({ type: Number })
  public index: number;
  public dragable = false;
  start() {
    this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
  }

  update(deltaTime: number) {}
  onTouchStart(touch: EventTouch) {
    const location = touch.getLocation();
    console.log("onTouchStart", location.x, location.y);
  }

  onTouchMove(touch: EventTouch) {
    const { x, y } = touch.getUIDelta();
    const newPos = this.node.position;
    this.node.setPosition(new Vec3(newPos.x + x, newPos.y + y, newPos.z));
  }

  onTouchEnd(touch: EventTouch) {
    const location = touch.getLocation();
    console.log("onTouchEnd", location.x, location.y);
  }
}
